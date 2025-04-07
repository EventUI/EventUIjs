/**Copyright (c) 2025 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

/**Module for doing diff comparisons on strings and objects.
@module*/
EVUI.Modules.Diff = {};

/**Dependency list for the Diff module.*/
EVUI.Modules.Diff.Dependencies =
{
    Core: Object.freeze({ required: true }),
};

(function ()
{
    var checked = false;

    Object.defineProperty(EVUI.Modules.Diff.Dependencies, "checked", {
        get: function () { return checked; },
        set: function (value)
        {
            if (typeof value === "boolean") checked = value;
        },
        configurable: false,
        enumberable: true
    });
})();

Object.freeze(EVUI.Modules.Diff.Dependencies);

/**Constants table for the Diff module.*/
EVUI.Modules.Diff.Constants = {};

/**Synchronous function definition for a custom decider that decides if an object should be included in the comparison graph or hash code calculation. Return false to cancel the comparison or inclusion in hash code calculation.
@param {Any} obj The object do decide to compare or not.
@param {String} propName The name of the value being compared in its parent object. Note that the root comparison will not have a property name.
@returns {Boolean}*/
EVUI.Modules.Diff.Constants.Fn_ShouldComparePredicate = function (obj, propName) { return true; }

Object.freeze(EVUI.Modules.Diff.Constants);

/**Global cache of Symbols that appear when calculating value hash codes in the DiffContoller.*/
EVUI.Modules.Diff.SymbolCache = null;
(function ()
{
    var cache = {};
    Object.defineProperty(EVUI.Modules.Diff, "SymbolCache", {
        get: function ()
        {
            return cache;
        },
        enumerable: true,
        configurable: false
    });
})();

/**Class for doing generic comparisons between objects, values, and strings.
@class*/
EVUI.Modules.Diff.DiffController = function ()
{
    /**Object for keeping track of all the data that is collected and used when comparing two objects or values.
    @class*/
    var CompareSession = function ()
    {
        /**Array. The current "stack" of objects representing the hierarchy of objects the hash calculator is in when it is digging into an object hierarchy while generating hash codes. Is used to prevent circular loops in object graphs that would otherwise result in a stack overflow.
        @type {Object[]}*/
        this.objectParentage = [];

        /**Number. A counter that keeps track of the number of comparisons in an object graph and ensures a unique ID for each.
        @type {Number}*/
        this.counter = 0;

        /**Array. A list of all the objects who have had their hash codes calculated already.
        @type {ObjectHashCode[]}*/
        this.objectHashCodes = [];

        /**Object. The final result of the comparison operation.
        @type {EVUI.Modules.Diff.CompareResult}*/
        this.compareResult = new EVUI.Modules.Diff.CompareResult();

        /**Number. The type of operation being performed. Must be a value from the SessionMode enum.
        @type {Number}*/
        this.mode = SessionMode.Diff;

        /**Object. Lookup object for storing commonly cached values rather than re-hashing them over and over.
        @type {Object}*/
        this.hashCache = {};

        /**Handle to look up object hash codes on-the-fly.
        @param {Any} value THe value to get the hash code of.
        @returns {Number} */
        this.getValueHashCode = function (value)
        {
            return getHashCode(this, value);
        };
    };

    /**Enum for indicating the ownership of a property relative to its owning object.
    @enum*/
    var PropertyOwnershipState =
    {
        /**Property ownership status unknown.*/
        Unknown: -1,
        /**Property is in both objects.*/
        Common: 0,
        /**Property is only in A.*/
        AOnly: 1,
        /**Property is only in B.*/
        BOnly: 2,
    };

    /**Details about which object(s) own a given property when they are being compared.
    @class*/
    var PropertyDetails = function ()
    {
        /**String. The property key.
        @type {String}*/
        this.key = null;

        /**Number. Indicates which object(s) own the property with the given key. Must be a value from PropertyOwnershipState.
        @type {Number}*/
        this.flags = PropertyOwnershipState.Unknown;
    };

    /**Record that records an object and it's calculated hash code.
    @class*/
    var ObjectHashCode = function ()
    {
        /**Object. The object that has had it's hash code calculated.
        @type {Object}*/
        this.obj = null;

        /**String. The hash code of the object.
        @type {String}*/
        this.hash = null;
    };

    /**The type of mode the CompareSession object is running as.
    @enum*/
    var SessionMode =
    {
        /**Comparing two objects or values.*/
        Diff: 0,
        /**Getting the hash code of an object or value.*/
        GetValueHash: 1,
        /**Getting the difference between two strings.*/
        StringDiff: 2
    };

    //common hash codes to reuse so we don't have to calculate them over and over again.
    var _nullHash = EVUI.Modules.Core.Utils.getHashCode("##evui.null##");
    var _undefinedHash = EVUI.Modules.Core.Utils.getHashCode("##evui.undefined##");
    var _trueHash = EVUI.Modules.Core.Utils.getHashCode("##evui.true##");
    var _falseHash = EVUI.Modules.Core.Utils.getHashCode("##evui.false##");

    /**Performs a deep compare on two objects and returns data on what is different and the same between the two values.
    @param {Any} a A value to compare.
    @param {Any} b A value to compare.
    @param {EVUI.Modules.Diff.CompareOptions} options A YOLO CompareOptions object for controlling various aspects of the comparison. 
    @returns {EVUI.Modules.Diff.CompareResult}*/
    this.compare = function (a, b, options)
    {
        var session = makeSession(options, SessionMode.Diff);

        session.compareResult.rootComparison = compareItems(session, a, b, null, null);

        return session.compareResult;
    };

    /**Gets a value equality hash code of an arbitrary value or object. The hash code is calculated based on the value or values of the object (and its children) and can be used for value equality comparisons. Note that circular object graphs have a much higher chance of hash collisions than non-circular ones.
    @param {Any} value The value to get the value equality hash code of.
    @param {EVUI.Modules.Diff.CompareOptions} options A YOLO CompareOptions object for controlling various aspects of the hash generation.
    @returns {Number}*/
    this.getValueHashCode = function (value, options)
    {
        var session = makeSession(options, SessionMode.GetValueHash);

        if (shouldInclude(session, null, value, null, typeof value, null, true) === false) return null;

        return getHashCode(session, value);
    };

    /**Performs a string compare on two string and returns data on what is different and the same between the two strings.
    @param {Any} a A string to compare.
    @param {Any} b A string to compare.
    @param {EVUI.Modules.Diff.StringCompareOptions} options A YOLO StringCompareOptions object for controlling various aspects of the string diff.
    @returns {EVUI.Modules.Diff.StringCompareResult}*/
    this.compareStrings = function (a, b, options)
    {
        if (typeof a !== "string" || typeof b !== "string") throw Error("Invalid parameters: cannot compare non-string values.");

        var sessionOptions = new EVUI.Modules.Diff.CompareOptions();
        sessionOptions.diffStrings = true;
        sessionOptions.stringCompareOptions = options;

        var session = makeSession(sessionOptions, SessionMode.StringDiff);
        var comparison = compareItems(session, a, b);

        var stringDiff = new EVUI.Modules.Diff.StringCompareResult();
        stringDiff.a = a;
        stringDiff.b = b;
        stringDiff.options = session.compareResult.options;
        stringDiff.stringDiffs = comparison.differences;

        return stringDiff;
    };

    /**Makes the ComparisonSession object used in the comparison 
    @param {EVUI.Modules.Diff.CompareOptions} options
    @returns {CompareSession}*/
    var makeSession = function (options, mode)
    {
        options = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Diff.CompareOptions(), options);
        if (options.exclusionFilters != null && EVUI.Modules.Core.Utils.isArray(options.exclusionFilters) === true) options.exclusionFilters = options.exclusionFilters.slice();
        options.stringCompareOptions = (options.stringCompareOptions == null) ? new EVUI.Modules.Diff.StringCompareOptions() : EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Diff.StringCompareOptions(), options.stringCompareOptions);

        var session = new CompareSession();
        session.compareResult.options = options;

        if (mode == null) mode = SessionMode.Diff;

        return session;
    }

    /**Determines if either of the two values should be compared.
    @param {CompareSession} session Data about the compare operation in progress.
    @param {String} propName The name of the property being evaluated.
    @param {Any} a Any value.
    @param {Any} b Any value.
    @param {String} aType The value of the typeof operator on a.
    @param {String} bType The value of the typeof operator on b.
    @param {Boolean} hashing Whether or not this function is being called 
    @returns {Boolean}*/
    var shouldInclude = function (session, propName, a, b, aType, bType, hashing)
    {
        if (session.compareResult.options.excludeFunctions === true)
        {
            if (aType === "function" || bType === "function")
            {
                return false;
            }
        }

        //not comparing anything having to do with nodes, they are massive recursive objects that will either crash or choke the converter
        if ((aType === "object" && a instanceof Node) || (bType === "object" && b instanceof Node))
        {
            return false;
        }

        //apply any custom exclusions to the object graph
        if (session.compareResult.options.exclusionFilters != null)
        {
            if (typeof session.compareResult.options.exclusionFilters === "function")
            {
                if (session.compareResult.options.exclusionFilters(a, propName) === false || (hashing === false && session.compareResult.options.exclusionFilters(b, propName) === false))
                {
                    return false;
                }
            }
            else if (EVUI.Modules.Core.Utils.isArray(session.compareResult.options.exclusionFilters) === true)
            {
                var numFuncs = session.compareResult.options.exclusionFilters.length;;
                for (var x = 0; x < numFuncs; x++)
                {
                    var curFilter = session.compareResult.options.exclusionFilters[x];
                    if (typeof curFilter === "function")
                    {
                        if (curFilter(a, propName) === false) return false;
                        if (hashing === false && curFilter(b, propName) === false) return false;
                    }
                }
            }
        }

        return true;
    };

    /**Starting point of a deep recursive compare operation for any two values.
    @param {CompareSession} session Data about the compare operation in progress.
    @param {Any} a Any value.
    @param {Any} b Any value.
    @param {String} propName The name of the property in the parent object that is being compared.
    @param {EVUI.Modules.Diff.Comparison} parent The parent comparison that this comparison is a child of.
    @returns {EVUI.Modules.Diff.Comparison} */
    var compareItems = function (session, a, b, propName, parent)
    {
        var aType = typeof a;
        var bType = typeof b;

        if (shouldInclude(session, propName, a, b, aType, bType, false) === false) return null;

        var comparison = new EVUI.Modules.Diff.Comparison(session);
        comparison.id = session.counter++;
        comparison.a = a;
        comparison.b = b;
        comparison.parentComparison = parent;
        comparison.propName = propName;

        //add to the flat list of all comparisons that will be returned as part of the result
        session.compareResult.allComparisons.push(comparison);

        if (aType === "object" && bType === "object") //if both are objects
        {
            var aNull = a == null;
            var bNull = b == null;

            comparison.diffType = EVUI.Modules.Diff.DiffType.Object;

            if (aNull === false && bNull === false) //and neither is null, do a recursive object comparison
            {
                comparison = compareObjects(session, comparison);
                if (a.constructor.prototype !== b.constructor.prototype) comparison.flags |= EVUI.Modules.Diff.DiffFlags.Prototype;
            }
            else
            {
                if (aNull === false || bNull === false)
                {
                    comparison.flags |= (aNull === false) ? EVUI.Modules.Diff.DiffFlags.AOnly : EVUI.Modules.Diff.DiffFlags.BOnly;
                    comparison.flags |= EVUI.Modules.Diff.DiffFlags.Reference;
                }

                //do the comparison with one null value anyways just so that the missing properties show up as differences
                comparison = compareObjects(session, comparison);
            }
        }
        else
        {
            if (a !== b) //values different
            {
                comparison.flags |= EVUI.Modules.Diff.DiffFlags.Value;
            }

            if (aType === "string" && bType === "string") //both are strings, do the special string compare mode
            {
                comparison.diffType = EVUI.Modules.Diff.DiffType.String;
                if (session.compareResult.options.diffStrings === true)
                {
                    comparison.differences = getStringDiffs(a, b);
                }                
            }
            else //otherwise we have two random values to compare
            {
                comparison.diffType = EVUI.Modules.Diff.DiffType.Property;
                if (aType !== bType) comparison.flags |= EVUI.Modules.Diff.DiffFlags.Prototype; //if the types differ, we have different prototypes
            }
        }

        var finalFlags = (session.compareResult.options.compareValuesOnly === true) ? EVUI.Modules.Core.Utils.removeFlag(comparison.flags, EVUI.Modules.Diff.DiffFlags.Reference) : comparison.flags;

        if (parent != null) //register the comparison with the parent if we have one
        {
            parent.childComparisons.push(comparison);
            if (finalFlags !== EVUI.Modules.Diff.DiffFlags.None) //if the child comparison had any differences at all, mark the parent as having a child difference. This will propagate all the way to the top of the hierarchy
            {
                parent.differences.push(comparison);
                parent.flags |= EVUI.Modules.Diff.DiffFlags.Children;
            }
        }       

        //if anything had any difference, add it to the differences list
        if (finalFlags !== EVUI.Modules.Diff.DiffFlags.None)
        {
            session.compareResult.allDifferences.push(comparison);
        }
        else //otherwise it goes in the "in common" list
        {
            session.compareResult.allInCommon.push(comparison);
        }


        return comparison;
    };

    /**Special logic for comparing strings to come up with a list of the segments that belong to a, b, or both.
    @param {String} strA A string to compare.
    @param {String} strB Another string to compare.
    @param {EVUI.Modules.Diff.StringCompareOptions} stringDiffOptions Options for controlling the diffing of the strings.
    @returns {EVUI.Modules.Diff.StringDifference[]} */
    var getStringDiffs = function (strA, strB, stringDiffOptions)
    {
        if (strA === strB) return [];
        var diffs = [];

        var curDiff = null;

        var aLen = strA.length;
        var bLen = strB.length;
        var len = (aLen >= bLen) ? aLen : bLen;

        var aIndex = 0;
        var bIndex = 0;
        var commonSeg = "";

        while (aIndex < len || bIndex < len) //while we have not walked off the end of both strings
        {
            var aChar = strA[aIndex];
            var bChar = strB[bIndex];

            if (aChar !== bChar && aChar !== undefined && bChar !== undefined) //if the characters are different and not undefined, we need to find the nearest common character in both strings.
            {
                if (curDiff != null) //if we had an existing difference object, it was being built from common characters. Finish it off and reset it to null.
                {
                    curDiff.text = commonSeg;
                    commonSeg = "";

                    diffs.push(curDiff);
                    curDiff = null;
                }

                var foundInA = false;
                var foundInB = false;

                if (aChar !== undefined && bChar !== undefined) //if we have two valid characters, begin walking the strings
                {
                    //start looking beginning at the current indexes in both strings
                    var sameCharAIndex = aIndex;
                    var sameCharBIndex = bIndex;

                    //walk the A string and find the nearest character in common in the B string
                    var maxB = bLen; //maxB is the furthest point in B to where there is a common character, it's moved closer with every iteration of the inner loops successful completion
                    for (var x = aIndex; x < aLen; x++)
                    {
                        var curIndex = aIndex + (x - aIndex);
                        aChar = strA[curIndex]; //get the next character in the A string

                        if (curIndex < maxB) //if the current index in A still hasn't passed the next closest index in B, keep going (effectively, "have the strings overlapped yet" check)
                        {
                            for (var y = bIndex; y < maxB; y++) //walk the B string looking for A's character
                            {
                                if (strB[y] === aChar) //found a match, walk maxB back and remember the location of the same character in both A and B strings
                                {
                                    foundInA = true;
                                    maxB = y;
                                    sameCharAIndex = curIndex;
                                    sameCharBIndex = y;
                                    break;
                                }
                            }
                        }
                        else //stings now overlapping, we're done searching
                        {
                            break;
                        }
                    }

                    //now walk the B string looking for the closes character in the A string. We need whichever is closer.
                    var maxA = (foundInA === true) ? sameCharAIndex : aLen; //maxA is the furthest point in A to where there is a common character, it's moved closer with every iteration of the inner loops successful completion
                    for (var x = bIndex; x < bLen; x++)
                    {
                        var curIndex = bIndex + (x - bIndex);
                        bChar = strB[curIndex]; //get the next character in the b string

                        if (curIndex < maxA) //if the current index in B still hasn't passed the next closest index in A, keep going (effectively, "have the strings overlapped yet" check)
                        {
                            for (var y = aIndex; y < maxA; y++) //walk the A string looking for B's character
                            {
                                if (bChar === strA[y]) //found a match, walk maxA back
                                {
                                    foundInB = true;
                                    maxA = y;
                                    if (curIndex <= sameCharBIndex || y <= sameCharAIndex) //only if this character came earlier than the result of the A loop, remember the location of the same character in both A and B strings
                                    {
                                        sameCharBIndex = curIndex;
                                        sameCharAIndex = y;
                                    }

                                    break;
                                }
                            }
                        }
                        else //stings now overlapping, we're done searching
                        {
                            break;
                        }
                    }
                }

                aChar = strA[sameCharAIndex]
                bChar = strB[sameCharBIndex]
                if (aChar !== bChar) //check to see if we've gotten out of sync
                {
                    if (foundInA === false && foundInB === false) //if we are out of sync, but never found a match, we are done searching the strings
                    {
                        sameCharAIndex = aLen;
                        sameCharBIndex = bLen;
                    }
                    else //otherwise something failed and we will stop the operation
                    {
                        var aDiff = new EVUI.Modules.Diff.StringDifference();
                        aDiff.aIndex = aIndex;
                        aDiff.text = strA.substring(aIndex, aLen);
                        aDiff.flags |= EVUI.Modules.Diff.DiffFlags.AOnly;
                        diffs.push(aDiff);

                        var bDiff = new EVUI.Modules.Diff.StringDifference();
                        bDiff.bIndex = bIndex;
                        bDiff.text = strB.substring(bIndex, bLen);
                        bDiff.flags |= EVUI.Modules.Diff.DiffFlags.BOnly;
                        diffs.push(bDiff);
                        break;
                    }
                }

                //add the new difference for what was found in A's string (if the index advanced)
                if (sameCharAIndex !== aIndex)
                {
                    var aDiff = new EVUI.Modules.Diff.StringDifference();
                    aDiff.aIndex = aIndex;
                    aDiff.text = strA.substring(aIndex, sameCharAIndex);
                    aDiff.flags |= EVUI.Modules.Diff.DiffFlags.AOnly;
                    diffs.push(aDiff);

                    aIndex = sameCharAIndex;
                }

                //add the new difference for what was found in B's string (if the index advanced)
                if (sameCharBIndex !== bIndex)
                {
                    var bDiff = new EVUI.Modules.Diff.StringDifference();
                    bDiff.bIndex = bIndex;
                    bDiff.text = strB.substring(bIndex, sameCharBIndex);
                    bDiff.flags |= EVUI.Modules.Diff.DiffFlags.BOnly;
                    diffs.push(bDiff);

                    bIndex = sameCharBIndex;
                }
            }
            else if (aChar === undefined && bChar !== undefined) //walked off the end of the A string, take the rest of the A string.
            {
                var bDiff = new EVUI.Modules.Diff.StringDifference();
                bDiff.bIndex = bIndex;
                bDiff.text = strB.substring(bIndex, bLen);
                bDiff.flags |= EVUI.Modules.Diff.DiffFlags.BOnly;
                diffs.push(bDiff);

                break;
            }
            else if (bChar === undefined && aChar !== undefined) //walked off of the end of the B string, take the rest of the A string
            {
                var aDiff = new EVUI.Modules.Diff.StringDifference();
                aDiff.aIndex = aIndex;
                aDiff.text = strA.substring(aIndex, aLen);
                aDiff.flags |= EVUI.Modules.Diff.DiffFlags.AOnly;
                diffs.push(aDiff);

                break;
            }
            else if (aChar === undefined && bChar === undefined) //both are undefined, walked off the end of both string, all done
            {
                break;
            }
            else //characters are the same, add them to a diff span that is the common characters
            {
                if (curDiff == null)
                {
                    curDiff = new EVUI.Modules.Diff.StringDifference();
                    curDiff.aIndex = aIndex;
                    curDiff.bIndex = bIndex;
                }

                commonSeg += aChar;

                aIndex++;
                bIndex++;
            }
        }

        if (curDiff != null) //if we have a dangling diff, add it to the end after the loop has escaped
        {
            curDiff.text = commonSeg;
            diffs.push(curDiff);
        }

        return diffs;
    };

    /**Compares two objects recursively.
    @param {CompareSession} session  Data about the compare operation in progress.
    @param {EVUI.Modules.Diff.Comparison} comparison The current comparison of the two objects.
    @returns {EVUI.Modules.Diff.Comparison}*/
    var compareObjects = function (session, comparison)
    {
        if (comparison.a === comparison.b) return comparison;

        comparison.flags |= EVUI.Modules.Diff.DiffFlags.Reference;
        var childComparisons = {};
        var aNull = comparison.a == null;
        var bNull = comparison.b == null;

        if (aNull === false)
        {
            var aKeys = EVUI.Modules.Core.Utils.getProperties(comparison.a); //Object.keys(comparison.a);
            var numAKeys = aKeys.length;

            for (var x = 0; x < numAKeys; x++)
            {
                var key = aKeys[x];
                var aValue = comparison.a[key];
                var bValue = (bNull === false) ? comparison.b[key] : undefined;

                var childComparison = compareItems(session, aValue, bValue, key, comparison);
                if (childComparison == null) continue;

                if (bNull === false) childComparisons[key] = childComparison;
                childComparison.flags |= EVUI.Modules.Diff.DiffFlags.AOnly;
            }
        }

        if (bNull === false)
        {
            var bKeys = EVUI.Modules.Core.Utils.getProperties(comparison.b); //Object.keys(comparison.b);
            var numBKeys = bKeys.length;

            for (var x = 0; x < numBKeys; x++)
            {
                var key = bKeys[x];
                if (aNull === false)
                {
                    var existing = childComparisons[key];
                    if (existing != null)
                    {
                        existing.flags = EVUI.Modules.Core.Utils.removeFlag(existing.flags, EVUI.Modules.Diff.DiffFlags.AOnly);
                        continue;
                    }
                }

                var aValue = (aNull === false) ? comparison.a[key] : undefined;
                var bValue = comparison.b[key];

                var childComparison = compareItems(session, aValue, bValue, key, comparison);
                if (childComparison == null) continue;

                childComparison.flags |= EVUI.Modules.Diff.DiffFlags.BOnly;
            }
        }

        return comparison;
    }

    /**Gets the value equality hash code of a value by salting it based on its type (except when its a string) then getting the value of it's .toString value. If it is an object it will recursively calculate its hash code based on the hash codes of its children.
    @param {CompareSession} session  Data about the compare operation in progress.
    @param {Any} value The value to get the hash code of.
    @returns {Number}*/
    var getHashCode = function (session, value)
    { 
        if (value === null)
        {
            return _nullHash;
        }
        else if (value === undefined)
        {
            return _undefinedHash;
        }
        else
        {
            var valueType = typeof value;
            switch (valueType)
            {
                case "string":

                    if (value.length <= 36)
                    {
                        var existingHash = session.hashCache[value];
                        if (existingHash == null)
                        {
                            var hash = EVUI.Modules.Core.Utils.getHashCode(value);
                            session.hashCache[value] = hash;

                            return hash;
                        }
                        else
                        {
                            return existingHash;
                        }
                    }
                    else
                    {
                        return EVUI.Modules.Core.Utils.getHashCode(value);
                    }
   
                case "boolean":
                    return (value === true) ? _trueHash : _falseHash;
                case "bigint":
                case "number":

                    var hashKey = value.toString() + "##evui." + valueType + "##";
                    var existingHash = session.hashCache[hashKey]; //salting the hash so we don't get collisions between strings and values converted to strings
                    if (existingHash == null)
                    {
                        var hash = EVUI.Modules.Core.Utils.getHashCode(hashKey);
                        session.hashCache[hashKey] = hash;

                        return hash;
                    }
                    else
                    {
                        return existingHash;
                    }
                   
                case "function":
                    return (session.options.excludeFunctions === true) ? "" : EVUI.Modules.Core.Utils.getHashCode(value.toString() + "##evui." + valueType + "##"); //salting the hash so we don't get collisions between strings and values converted to strings
                case "symbol":
                    var cached = EVUI.Modules.Diff.SymbolCache[value]; //because symbols with the same description are not the same, we just hash a GUID to identify the symbol with so it keeps its uniqueness
                    if (cached == null)
                    {
                        cached = EVUI.Modules.Core.Utils.getHashCode(EVUI.Modules.Core.Utils.makeGuid());
                        EVUI.Modules.Diff.SymbolCache[value] = cached;
                    }

                    return cached;
                case "object":
                    return getObjectHashCode(session, value);
                default:
                    return "";
            }
        }
    }

    /**Gets the hash code of an object based on its properties hash codes and the hash codes of its children. Note that collisions are much more likely in graphs with circular references due to the "chicken and egg" problem of getting its hash based on its own hash when referenced in a circular loop.
    @param {CompareSession} session Data about the compare operation in progress.
    @param {Object} obj An object to get the hash code of.
    @returns {String} */
    var getObjectHashCode = function (session, obj)
    {
        var curHashEntry = getExistingObjectHashCode(session, obj);

        //make a hash entry if we don't have one already and add it to the registry 
        if (curHashEntry == null)
        {
            curHashEntry = new ObjectHashCode();
            curHashEntry.obj = obj;

            session.objectHashCodes.push(curHashEntry);
        }
        else
        {
            if (curHashEntry.hash != null)
            {
                return curHashEntry.hash;
            }
        }

        //add the current object to the "parentage" of the current hash operation. This is to detect circular references
        session.objectParentage.push(obj);

        var preHash = "##evui.object##@"; //salting the hash
        var keys = EVUI.Modules.Core.Utils.getProperties(obj);
        var numKeys = keys.length;

        for (var x = 0; x < numKeys; x++) //for (var prop in obj)
        {
            var prop = keys[x];
            var value = obj[prop];

            //filter out any properties that should NOT be included in the final graph
            if (shouldInclude(session, prop, value, null, typeof value, null, true) === false) continue;

            preHash += "##evui.prop##" + prop + ":\"" //yet more salt

            var hash = null;

            if (session.objectParentage.indexOf(value) !== -1) //this is where collisions can come from. Basically, if we hit this block it means we're in a circular loop and we need to make a hash for the object that is not based on its value.
            {
                var existingRef = getExistingObjectHashCode(session, value);
                if (existingRef != null && existingRef.hash != null)
                {
                    hash = existingRef.hash;
                }
                else
                {                   
                    if (session.compareResult.options.compareValuesOnly === true) //if we're only comparing values, we just substitute the same "object" reference for a circular reference 
                    {
                        hash = EVUI.Modules.Core.Utils.getHashCode("##evui.circular##{}");
                    }
                    else
                    {
                        hash = EVUI.Modules.Core.Utils.getHashCode("##evui.circular##" + Object.prototype.toString.call(value) + value.constructor.toString()); //the safest thing we can do here is salt the constructor's text combined with its prototype's name so that we get a unique hash code for the "type" of object
                    }    
                }
            }
            else //otherwise, get the hash code of the child object
            {
                hash = getHashCode(session, value);
            }

            preHash += hash + "\"";
        }

        //finally, get the hash of all the hashes
        var finalHash = EVUI.Modules.Core.Utils.getHashCode(preHash);
        curHashEntry.hash = finalHash;

        //remove the object from the parentage list
        session.objectParentage.pop();

        return finalHash;
    };

    /**Searches the existing list of hash code object pairs to find an object who has already had their hash code calculated.
    @param {CompareSession} session Data about the compare operation in progress.
    @param {Object} obj The object to find the hash code of.  
    @returns {ObjectHashCode}*/
    var getExistingObjectHashCode = function (session, obj)
    {
        var numObjHash = session.objectHashCodes.length; //then check the global registry of hash codes for this session to see if it was already hashed (mostly for use when in a deep graph or when getting a hash code but not as part of a comparison operation)
        for (var x = 0; x < numObjHash; x++)
        {
            var curHash = session.objectHashCodes[x];
            if (curHash.obj === obj)
            {
                return curHash;
            }
        }

        return null;
    }
};

/**Object that contains the result of comparing two arbitrary values.
@class*/
EVUI.Modules.Diff.CompareResult = function ()
{
    /**Object. The "root" comparison between the two parameter values.
    @type {EVUI.Modules.Diff.Comparison}*/
    this.rootComparison = null;

    /**Array. All the differences found between the two graphs.
    @type {EVUI.Modules.Diff.Comparison[]}*/
    this.allDifferences = [];

    /**Array. A flat list of every comparison made when comparing the two values.
    @type {EVUI.Modules.Diff.Comparison[]}*/
    this.allComparisons = [];

    /**Array. A flat list of every comparison that was equal when comparing the two values.
    @type {EVUI.Modules.Diff.Comparison[]}*/
    this.allInCommon = [];

    /**The CompareOptions object used to compare the two values.
    @type {EVUI.Modules.Diff.CompareOptions}*/
    this.options = null;
};

/**Gets all the Comparisons where one (or both) of the two compared values matches the hash code provided as the parameter. Note that this hash code must be made using the same CompareOptions as the ComparisonResult in order for the hashes to match for objects.
@param {String} hash The equality value hash used to find comparisons with the matching value.
@returns {EVUI.Modules.Diff.CompareMatch[]}*/
EVUI.Modules.Diff.CompareResult.prototype.getAllValueMatches = function (hash)
{
    if (typeof hash !== "number") throw Error("Number expected.");

    var matches = [];
    var numComparisons = this.allComparisons.length;
    for (var x = 0; x < numComparisons; x++)
    {
        var curComparison = this.allComparisons[x];
        var matchingComparison = null;
        var matchingObject = null;
        if (curComparison.getAHashCode() === hash)
        {
            matchingComparison = curComparison;
            matchingObject = curComparison.a;
        }
        else if (curComparison.getBHashCode() === hash)
        {
            matchingComparison = curComparison;
            matchingObject = curComparison.b;
        }

        if (matchingComparison != null)
        {
            var match = new EVUI.Modules.Diff.CompareMatch();
            match.comparison = matchingComparison;
            match.matchingObject = matchingObject;
            match.name = matchingComparison.propName;
            match.path = matchingComparison.getPath();
            match.source = hash;

            matches.push(match);
        }
    }

    return matches;
};

/**Gets all the Comparisons where one (or both) of the two compared values matches the object reference provided as the parameter.
@param {String} reference The object reference to find.
@returns {EVUI.Modules.Diff.CompareMatch[]}*/
EVUI.Modules.Diff.CompareResult.prototype.getAllReferenceMatches = function (reference)
{
    if (reference == null || typeof reference !== "object") throw Error("Object expected.");

    var matches = [];
    var numComparisons = this.allComparisons.length;
    for (var x = 0; x < numComparisons; x++)
    {
        var curComparison = this.allComparisons[x];
        var matchingComparison = null;
        if (curComparison.a === reference)
        {
            matchingComparison = curComparison;
        }
        else if (curComparison.b === reference)
        {
            matchingComparison = curComparison;
        }

        if (matchingComparison != null)
        {
            var match = new EVUI.Modules.Diff.CompareMatch();
            match.comparison = matchingComparison;
            match.matchingObject = reference;
            match.name = matchingComparison.propName;
            match.path = matchingComparison.getPath();
            match.source = reference;

            matches.push(match);
        }
    }

    return matches;
};

/**Represents a comparison between two values or objects.
@class*/
EVUI.Modules.Diff.Comparison = function (session)
{
    var _self = this;
    var _session = session;
    var _aHash = null;
    var _bHash = null;
    

    /**Number. The ID of the comparison in the group of related comparisons for an object graph.
    @type {Number}*/
    this.id = -1;

    /**String. The name of the property of the containing objects being compared.
    @type {String}*/
    this.propName = null;

    /**Any. A value being compared.
    @type {Any}*/
    this.a = null;

    /**Any. The other value being compared.
    @type {Any}*/
    this.b = null;

    /**The type of comparison that was made. Must be a value from the DiffType enum.
    @type {String}*/
    this.diffType = EVUI.Modules.Diff.DiffType.None;

    /**Number. Bit flags indicating the type of differences between "a" and "b". Composed of values from the DiffFlags flag set.
    @type {Number}*/
    this.flags = EVUI.Modules.Diff.DiffFlags.None;

    /**Object. The Comparison that contained this Comparison as a childComparison.
    @type {EVUI.Modules.Diff.Comparison}*/
    this.parentComparison = null;

    /**Array. All of the child Comparisons that were made if this comparison was between two objects.
    @type {EVUI.Modules.Diff.Comparison[]}*/
    this.childComparisons = [];

    /**Array. Either an array of Comparisons representing all the differences between two objects, or an array of StringDifferences if the values were both strings.
    @type {EVUI.Modules.Diff.Comparison[]|EVUI.Modules.Diff.StringDifference[]}*/
    this.differences = [];

    /**The value-equality hash code of the "a" object or value. Note that this hash is lazily evaluated and mutating the properties of a will result in an incorrect hash code.
    @returns {Number}*/
    this.getAHashCode = function ()
    {
        if (_aHash != null) return _aHash;
        _aHash = _session.getValueHashCode(_self.a);
        if (_self.a === _self.b) _bHash = _aHash;
        return _aHash;
    };

    /**Gets he value-equality hash code of the "b" object or value. Note that this hash is lazily evaluated and mutating the properties of b will result in an incorrect hash code.
    @returns {Number}*/
    this.getBHashCode = function ()
    {
        if (_bHash != null) return _bHash;
        _bHash = _session.getValueHashCode(_self.b);
        if (_self.a === _self.b) _aHash = _bHash;
        return _bHash;
    };
};



/**Object representing a match in a ComparisonResult based on reference or hash code.
@class*/
EVUI.Modules.Diff.CompareMatch = function ()
{
    /**Object or String. Either the object to find references of or the hash code of the values to find.
    @type {Object|String}*/
    this.source = null;

    /**Any. Any objects or values that either have the same reference as the source or the same hash code as the source.
    @type {Any}*/
    this.matchingObject = null;

    /**String. The "path" from the root object to the matching value in an object graph. Note that for circular references this may be incorrect or truncated.
    @type {String}*/
    this.path = null;

    /**String. The  name of the property with the matching reference or value.
    @type {String}*/
    this.name = null;

    /**Object. The comparison that contains the matching object or hash code.
    @type {EVUI.Modules.Diff.Comparison}*/
    this.comparison = null;
};

/**Gets the "path" from the root object to the comparison's property. Note that for objects with circular references this value may be incorrect.
@returns {String}*/
EVUI.Modules.Diff.Comparison.prototype.getPath = function ()
{
    if (this.propName == null) return null;

    var path = this.propName;
    var parent = this.parentComparison;

    while (parent != null && parent.propName != null)
    {
        path = parent.propName + "." + path;
        parent = parent.parentComparison;
    }

    return path;
};

/**Object that contains the result of a comparison between two segments of different strings.
@class*/
EVUI.Modules.Diff.StringDifference = function ()
{
    /**Number. The index of the difference in the A string. If the text is a commonality, both aIndex and bIndex will be populated.
    @type {Number}*/
    this.aIndex = -1;

    /**Number. The index of the difference in the B string. If the text is a commonality, both aIndex and bIndex will be populated.
    @type {Number}*/
    this.bIndex = -1;

    /**String. The text that was in either or both strings.
    @type {String}*/
    this.text = null;

    /**Number. Flags indicating which string owned the text. Must be a value from the DiffFlags enum.
    @type {Number}*/
    this.flags = EVUI.Modules.Diff.DiffFlags.None;
};


/**The result of doing a top-level string comparison explicitly and not using the generic comparison function.
@class*/
EVUI.Modules.Diff.StringCompareResult = function ()
{
    /**String. The A string.
    @type {String}*/
    this.a = null;

    /**String. The B string.
    @type {String}*/
    this.b = null;

    /**Object. Options for controlling various aspects about the comparison.
    @type {EVUI.Modules.Diff.CompareOptions}*/
    this.options = null;

    /**Array. An array of text spans that were found to belong to either or both strings in order of occurrence.
    @type {EVUI.Modules.Diff.StringDifference[]}*/
    this.stringDiffs = [];
};

/**Enum indicating that, when merging two objects or strings together based on their differences, which value or object should "win" when there is a direct conflict between the two.
@enum*/
EVUI.Modules.Diff.MergeWinner =
{
    /**Indicates that the "A" object should win in the event of a conflict.*/
    A: "a",
    /**Indicates that the "B" object should win in the event of a conflict.*/
    B: "b"
};
Object.freeze(EVUI.Modules.Diff.MergeWinner);

/**Enum indicating what type of Comparison a Comparison object is.
@enum*/
EVUI.Modules.Diff.DiffType =
{
    /**Default.*/
    None: "none",
    /**Comparison was a string comparison and the differences array will be an array of StringDifference.*/
    String: "string",
    /**Comparison was an object comparison and the differences array will be an array of Comparisons.*/
    Object: "object",
    /**Comparison was of a primitive value and will have no differences in the differences array.*/
    Property: "prop"
};
Object.freeze(EVUI.Modules.Diff.DiffType);

/**Flag set for communicating all the ways in which two Comparisons differ.
@enum*/
EVUI.Modules.Diff.DiffFlags =
{
    /**No differences, the values are the same.*/
    None: 0,
    /**The difference included a different object reference.*/
    Reference: 1,
    /**The difference included a difference in value.*/
    Value: 2,
    /**The difference involved comparing A's value against a property key that did not exist in B.*/
    AOnly: 4,
    /**The difference involved comparing B's value against a property key that did not exist in A.*/
    BOnly: 8,
    /**The difference involved a difference in this object's children (or grandchildren, etc).*/
    Children: 16,
    /**The difference involved a difference in prototype between two values or objects.*/
    Prototype: 32
};
Object.freeze(EVUI.Modules.Diff.DiffFlags);

/**Options for controlling the behavior of the comparison.
@class*/
EVUI.Modules.Diff.CompareOptions = function ()
{
    /**Boolean. Whether or not to exclude functions from the comparison. True by default.
    @type {Boolean}*/
    this.excludeFunctions = true;

    /**Boolean. Whether or not to compare values and objects based on their values only and ignore differences in object references. Useful for comparing two different object graphs that are very similar but have totally different object references. Flase by default.
    @type {Boolean}*/
    this.compareValuesOnly = false;

    /**Array. An array of functions to determine if an object should be compared or not. Return false to not compare the object. Note that this may have a detrimental performance impact on the comparison or hash operation, increases the chance of hash code collisions, and can crash the comparison or hash code generation outright. Use with caution.
    @type {EVUI.Modules.Diff.Constants.Fn_ShouldComparePredicate[]}*/
    this.exclusionFilters = null;

    /**Boolean. Whether or not to generate an array of difference metadata about the differences between strings.
    @type {Boolean}*/
    this.diffStrings = false;

    /**Object. Settings for performing diffs on strings.
    @type {EVUI.Modules.Diff.StringDiffOptions}*/
    this.stringCompareOptions = null;
};

EVUI.Modules.Diff.StringCompareOptions = function ()
{
    this.mode = EVUI.Modules.Diff.StringDiffMode.Character;
    this.whitespaceWordBreaks = true;
    this.wordBreaks = [];
};

EVUI.Modules.Diff.StringDiffMode =
{
    Character: "character",
    Word: "word"
};
Object.freeze(EVUI.Modules.Diff.StringDiffMode);

/**Global instance of the DiffController.
@type {EVUI.Modules.Diff.DiffController}*/
EVUI.Modules.Diff.Comparer = null;
(function ()
{
    var diff = null;
    Object.defineProperty(EVUI.Modules.Diff, "Comparer", {
        get: function ()
        {
            if (diff == null) diff = new EVUI.Modules.Diff.DiffController();
            return diff;
        },
        enumerable: true,
        configurable: false
    })
})();

/**Constructor reference for the DiffController.*/
EVUI.Constructors.Diff = EVUI.Modules.Diff.DiffController;

/**Performs a deep compare on two objects and returns data on what is different and the same between the two values.
@param {Any} a A value to compare.
@param {Any} b A value to compare.
@param {EVUI.Modules.Diff.CompareOptions} options Options for controlling various aspects of the comparison.
@returns {EVUI.Modules.Diff.CompareResult}*/
$evui.diff = function (a, b, options)
{
    return EVUI.Modules.Diff.Comparer.compare(a, b, options);
};

/**Performs a string compare on two string and returns data on what is different and the same between the two strings.
@param {Any} a A string to compare.
@param {Any} b A string to compare.
@returns {EVUI.Modules.Diff.StringCompareResult}*/
$evui.strDiff = function (a, b)
{
    return EVUI.Modules.Diff.Comparer.compareStrings(a, b);
};

/**Gets a value equality hash code of an arbitrary value or object. The hash code is calculated based on the value or values of the object (and its children) and can be used for value equality comparisons. Note that circular object graphs have a much higher chance of hash collisions than non-circular ones.
@param {Any} value The value to get the value equality hash code of.
@param {EVUI.Modules.Diff.CompareOptions} options Options for controlling various aspects of the hash generation.
@returns {String}*/
$evui.getValueHashCode = function (value, options)
{
    return EVUI.Modules.Diff.Comparer.getValueHashCode(value, options);
};

Object.freeze(EVUI.Modules.Diff);
