/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

/*#INCLUDES#*/

/*#BEGINWRAP(EVUI.Modules.Observers|Observer)#*/
/*#REPLACE(EVUI.Modules.Observers|Observer)#*/

/**Module for functionality applicable to all objects.
@module*/
EVUI.Modules.Observers = {};

/*#MODULEDEF(Observers|"1.0"|"Observers")#*/
/*#VERSIONCHECK(EVUI.Modules.Observers|Observer)#*/

EVUI.Modules.Observers.Dependencies =
{
    Core: Object.freeze({ version: "1.0", required: true }),
};

(function ()
{
    var checked = false;

    Object.defineProperty(EVUI.Modules.Observers.Dependencies, "checked",
        {
            get: function () { return checked; },
            set: function (value)
            {
                if (typeof value === "boolean") checked = value;
            },
            configurable: false,
            enumberable: true
        });
})();

Object.freeze(EVUI.Modules.Observers.Dependencies);

/**Simple object observer that can report any added, removed, or changed properties of an object or its children recursively.
@param {Object} obj The object to observe.
@class*/
EVUI.Modules.Observers.ObjectObserver = function (obj)
{
    if (EVUI.Modules.Core == null) throw Error("Dependency missing: EVUI.Modules.Core is required.");
    EVUI.Modules.Core.Utils.requireAll(EVUI.Modules.Observers.Dependencies);

    /**The state of the comparison in the ObjectObserver.
    @type {CompareSession}*/
    var _session = null;

    /**Gets all the changed, added, or removed properties of the object since the state was last set.
    @param {Boolean} setState Whether or not to set the state of the observer to match the current state of the object.
    @returns {EVUI.Modules.Observers.ObservedChangedProperty[]} */
    this.getChanges = function (setState)
    {
        var diff = getDiffs(setState);
        var changes = diff.changedProperties.slice();
        _session.reset();

        return changes;
    };

    /**Extracts an ObjectObserver representing a child object of the object this ObjectObserver is observing. Can optionally be a clone of the state in this ObjectObserver so that the child and the parent can be used independently of each other without impacting each other's state.
    @param {String} path The path from the root object being observed to the child object to observe. Note that the child cannot be a null or undefined reference. 
    @param {Boolean} disconnect Whether or not to clone the internal state of the ObjectObserver for the new child ObjectObserver so that their states won't update each other when getChanges is called. False by default.
    @returns {EVUI.Modules.Observers.ObjectObserver}*/
    this.getChildObserver = function (path, disconnect)
    {
        if (_session == null || _session.root == null) return new EVUI.Modules.Observers.ObjectObserver();
        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(path) === true)
        {
            //if we have no path and are disconnecting, we are making a clone of this object observer.
            if (disconnect === true)
            {
                return EVUI.Modules.Observers.ObjectObserver(cloneObservedProperty(_session.root))
            }

            //otherwise we return null
            return null;
        }

        //break the path down into an array of segments to use to dig into the source object.
        var pathSegs = EVUI.Modules.Core.Utils.getValuePathSegments(path);
        var numSegs = pathSegs.length;

        var curProp = _session.root.propDic[pathSegs[0]];
        if (curProp == null) return null;

        for (var x = 1; x < numSegs; x++)
        {
            curProp = curProp.propDic[pathSegs[x]];
            if (curProp == null) return null;
        }

        //if disconnecting, clone the property so it becomes a new "island" with its own state.
        if (disconnect === true)
        {
            curProp = cloneObservedProperty(curProp, null);
        }

        return new EVUI.Modules.Observers.ObjectObserver(curProp);
    };

    /**Returns a copy of the internal dictionary of observed properties.
    @returns {EVUI.Modules.Observers.ObservedProperty}*/
    this.getObservedProperties = function ()
    {
        return cloneObservedProperty(_session.root, null);
    };

    /**Initial scan of the object passed in the constructor when it was created. Sets the initial observed state of the object observer.
     @param {Object} curObj Any object.*/
    var scan = function (curObj)
    {
        var root = new EVUI.Modules.Observers.ObservedProperty();
        root.hostObject = null;
        root.name = null;
        root.originalValue = obj;
        root.propDic = {};
        root.propList = [];

        _session = new CompareSession();
        _session.root = root;
        _session.diffing = false;
        _session.setState = true;
        _session.parentStack.push(curObj);

        getProperties(curObj, root, _session)
    };

    /**Gets all the differences between the last set state and the current state of the object being observed.
    @param {Boolean} setState Whether or not to update the internal observed state of the ObjectObserver.
    @returns {CompareSession}*/
    var getDiffs = function (setState)
    {
        _session.diffing = true;
        _session.setState = setState;

        if (_session.root == null) return session;

        _session.parentStack.push(_session.root.originalValue);

        getProperties(_session.root.originalValue, _session.root, _session);

        return _session;
    };

    /**Recursively clones all of the ObservedProperties under the observedProp passed into the function. Used when creating child observers of this observer.
    @param {ObservedProperty} observedProp The property to clone.
    @param {ObservedProperty} parent The parent of the property to clone.
    @returns {ObservedProperty} */
    var cloneObservedProperty = function (observedProp, parent)
    {
        var newProp = new EVUI.Modules.Observers.ObservedProperty();
        if (parent == null)
        {
            if (observedProp.originalValue == null || typeof observedProp.originalValue !== "object") throw Error("Cannot observe a null reference or non-object.");
            newProp.originalValue = observedProp.originalValue;
        }
        else
        {
            newProp.originalValue = observedProp.originalValue;
            newProp.hostObject = observedProp.hostObject;
            newProp.name = observedProp.name;
            newProp.path = (parent.path == null) ? observedProp.name : parent.path + "." + observedProp.name;
        }

        if (observedProp.propDic == null) return newProp;

        newProp.propList = [];
        newProp.propDic = {};
        newProp.numProps = observedProp.numProps;

        for (var x = 0; x < observedProp.numProps; x++)
        {
            var curProp = observedProp.propList[x];
            newProp.propList.push(curProp);

            var existing = observedProp.propDic[curProp];
            newProp.propDic[curProp] = cloneObservedProperty(existing, newProp);
        }

        return newProp;
    };

    /**Gets all the properties of an object recursively and populates the internal state of the observer with its values.
    @param {Object} curObj The object to observe.
    @param {ObservedProperty} parentObserved The parent property of the current object.
    @param {CompareSession} session The CompareSession that holds the state of the comparison operation.*/
    var getProperties = function (curObj, parentObserved, session)
    {
        if (curObj == null) return;
        if (curObj instanceof Node || curObj === window) return; //we never ever compare nodes or windows, that will set off a recursive explosion of comparisons and wind up comparing everything in the DOM or in the JavaScript universe of the page.

        var unionProps = [];
        var allProps = {};

        //if the source object is an array, take a shortcut to get its properties by using the length to get them instead of reflecting over the object. May miss properties of arrays that are non-numerical, however.
        if (EVUI.Modules.Core.Utils.isArray(curObj) === true)
        {
            var len = curObj.length;
            for (var x = 0; x < len; x++)
            {
                var curProp = x.toString();
                allProps[curProp] = true;
                unionProps.push(curProp);
            }
        }
        else //otherwise iterate over the properties of the object
        {
            var props = EVUI.Modules.Core.Utils.getProperties(curObj);
            var numProps = props.length;

            for (var x = 0; x < numProps; x++) //for (var curProp in curObj)
            {
                var curProp = props[x];

                allProps[curProp] = true;
                unionProps.push(curProp);
            }
        }

        //if we've already compared this object, cross check these properties against the properties that have already been observed.
        if (parentObserved.propDic != null)
        {
            for (var x = 0; x < parentObserved.numProps; x++)
            {
                var curProp = parentObserved.propList[x];
                if (allProps[curProp] === true) continue;
                unionProps.push(curProp);
            }
        }

        var numUnion = unionProps.length;
        for (var x = 0; x < numUnion; x++)
        {
            var curProp = unionProps[x];
            var added = false;
            var curValue = curObj[curProp];
            var existingObserved = parentObserved.propDic[curProp];

            //not observed yet. A new property.
            if (existingObserved == null)
            {
                var observed = new EVUI.Modules.Observers.ObservedProperty();
                observed.hostObject = curObj;
                observed.name = curProp;
                observed.path = (parentObserved.path != null) ? parentObserved.path + "." + curProp : curProp;
                observed.originalValue = curValue;

                //if the parent isn't ready to accept children, set it up to do so.
                if (parentObserved.propDic == null)
                {
                    parentObserved.propDic = {};
                    parentObserved.propList = [];
                }

                //if setting the state, append the property to the dictionary and put its name in the array
                if (session.setState === true)
                {
                    parentObserved.propDic[curProp] = observed;
                    parentObserved.numProps = parentObserved.propList.push(curProp);
                }

                //if diffing, make a diff object to return eventually
                if (session.diffing === true)
                {
                    var diff = new EVUI.Modules.Observers.ObservedChangedProperty();
                    diff.hostObject = observed.hostObject;
                    diff.name = observed.name;
                    diff.newValue = curValue;
                    diff.originalValue = undefined;
                    diff.path = observed.path;
                    diff.type = EVUI.Modules.Observers.ObservedObjectChangeType.Added;

                    session.changedProperties.push(diff);
                }

                existingObserved = observed;
                added = true;
            }

            //if we're diffing and the value isn't new, do a comparison between the old and new values.
            if (session.diffing === true && added === false)
            {
                if (curValue !== existingObserved.originalValue)
                {
                    var diff = new EVUI.Modules.Observers.ObservedChangedProperty();
                    diff.hostObject = existingObserved.hostObject;
                    diff.name = existingObserved.name;
                    diff.newValue = curValue;
                    diff.originalValue = existingObserved.originalValue;
                    diff.path = existingObserved.path;

                    if (curValue === undefined)
                    {
                        diff.type = EVUI.Modules.Observers.ObservedObjectChangeType.Removed;
                    }
                    else
                    {
                        diff.type = EVUI.Modules.Observers.ObservedObjectChangeType.Changed;
                    }

                    session.changedProperties.push(diff);
                }
            }

            //if setting the state, either remove the property if it was no longer present or set its value if it was changed.
            if (session.setState === true && added === false)
            {
                if (curValue === undefined)
                {
                    delete parentObserved.propDic[curProp];
                    var index = parentObserved.propList.indexOf(curProp);
                    if (index !== -1)
                    {
                        parentObserved.propList.splice(index, 1);
                        parentObserved.numProps--;
                    }

                    continue;
                }
                else if (curValue !== existingObserved.originalValue)
                {
                    existingObserved.originalValue = curValue;
                }

                if (existingObserved.hostObject !== curObj) existingObserved.hostObject = curObj;
            }

            //we have a child object, go call getProperties on it to build the recursive hierarchy.
            if (curValue != null && typeof curValue === "object")
            {
                //make sure we're not in a circular reference
                var existingIndex = session.parentStack.indexOf(curValue);
                if (existingIndex !== -1) continue;

                session.parentStack.push(curValue);

                if (existingObserved.propDic == null)
                {
                    existingObserved.propDic = {};
                    existingObserved.propList = [];
                }

                getProperties(curValue, existingObserved, session);

                session.parentStack.pop();
            }
        }
    };

    /**Represents the internal state of the ObjectObserver.
    @class*/
    var CompareSession = function ()
    {
        /**Object. The root ObservedProperty of the ObjectObserver.
        @type {ObservedProperty}*/
        this.root = null;

        /**Array. All of the changed properties of the observed object since its state was last set.
        @type {EVUI.Modules.Observers.ObservedChangedProperty[]}*/
        this.changedProperties = [];

        /**Boolean. Whether or not a diff operation is being performed.
        @type {Boolean}*/
        this.diffing = false;

        /**Boolean. Whether or not to set the internal state of the observer so that only new changes from this point in time forward are reported.
        @type {Boolean}*/
        this.setState = false;

        /**Array. A "stack" of objects that represents the hierarchy of objects above the currently observed object. Used to prevent circular references.
        @type {Obejct[]}*/
        this.parentStack = [];

        /**Resets the state of the CompareSession.*/
        this.reset = function ()
        {
            this.changedProperties.splice(0, this.changedProperties.length); //for some reason splicing the contents of the array is faster than allocating a new array, so we splice it and slice it when we return it.
            this.diffing = false;
            this.setState = false;
            this.parentStack.splice(0, this.parentStack.length);
        };
    };

    if (obj == null || typeof obj !== "object") throw Error("Cannot observe a null reference or non-object.");

    //scan the constructor parameter and set the internal state
    if (EVUI.Modules.Core.Utils.instanceOf(obj, EVUI.Modules.Observers.ObservedProperty) === true)
    {
        _session = new CompareSession();
        _session.root = obj;
    }
    else //otherwise scan the object like normal
    {
        scan(obj);
    }
};

/**Enum representing the type of change that was observed in an ObjectObserver.
 @enum*/
EVUI.Modules.Observers.ObservedObjectChangeType =
{
    /**Default. No change observed.*/
    None: "none",
    /**Property was added.*/
    Added: "added",
    /**Property was removed.*/
    Removed: "removed",
    /**Property value was changed.*/
    Changed: "changed"
};
Object.freeze(EVUI.Modules.Observers.ObservedObjectChangeType);

/**Object representing a property that was added, removed, or changed in an observed object.
@class*/
EVUI.Modules.Observers.ObservedChangedProperty = function ()
{
    /**Object. The object that contains the property.
    @type {Object}*/
    this.hostObject = null;

    /**String. The name of the property.
    @type {String}*/
    this.name = null;

    /**Any. The original value of the property.
    @type {Any}*/
    this.originalValue = null;

    /**Any. The new value of the property.
    @type {Any}*/
    this.newValue = null;

    /**String. The path from the root to the current property in the object hierarchy.
    @type {String}*/
    this.path = null;

    /**String. The type of change that occurred. A value from the ObservedObjectChangeType enum.
    @type {String}*/
    this.type = EVUI.Modules.Observers.ObservedObjectChangeType.None;
};

/**Represents a property of an object.
@class*/
EVUI.Modules.Observers.ObservedProperty = function ()
{
    /**Object. The object that contains the property.
    @type {Object}*/
    this.hostObject = null;

    /**String. The name of the property.
    @type {String}*/
    this.name = null;

    /**Any. The original value of the property.
    @type {Any}*/
    this.originalValue = null;

    /**String. The path from the root to the current property in the object hierarchy.*/
    this.path = null;

    /**Object. A "dictionary" of property names to ObservedProperties that contains the child properties of the object this ObservedProperty represents (if it is an object).
    @type {Object}*/
    this.propDic = null;

    /**Array. An array of all the property names in the propDic. Exists so that the propDic doesn't need to be iterated over in a for...in loop.
    @type {String[]}*/
    this.propList = null;

    /**Number. The number of properties that this object contains. Exists so that the length of propList doesn't need to be calculated over and over.
    @type {Number}*/
    this.numProps = 0;
};

/**Gets a child ObservedProperty of this observed property based on its property path.
@param {String} path The path from the root object to a child object, i.e. "a.b[c].d"
@returns {EVUI.Modules.Observers.ObservedProperty} */
EVUI.Modules.Observers.ObservedProperty.prototype.getChild = function (path)
{
    if (typeof path !== "string") return null;

    var segments = EVUI.Modules.Core.Utils.getValuePathSegments(path);
    var numSegs = segments.length;
    var child = this.propDic[segments[0]];
    if (child == null) return null;

    for (var x = 1; x < numSegs; x++)
    {
        child = child.propDic[segments[x]];
        if (child == null) return null;
    }

    return child;
};

/**Determines whether or not the ObservedProperty has had its value changed since it was generated.
@returns {Boolean}*/
EVUI.Modules.Observers.ObservedProperty.prototype.hasChanged = function ()
{
    if (this.hostObject == null) return true;
    return (this.originalValue !== this.hostObject[this.name]);
};

/**Determines whether or not the ObservedProperty's child properties have had any of their values changed since the parent ObservedProperty was generated.
@param {Boolean} recursive Whether or not to recursively search all child ObservedProperties of this ObservedProperty for changes.
@returns {Boolean}*/
EVUI.Modules.Observers.ObservedProperty.prototype.haveChildrenChanged = function (recursive)
{
    if (this.hostObject == null) return true;
    if (this.numProps === 0) return false;

    var parentObj = this.originalValue;
    var props = EVUI.Modules.Core.Utils.getProperties(parentObj);
    var numProps = props.length;

    for (var x = 0; x < numProps; x++) //for (var prop in parentObj)
    {
        var prop = props[x];

        var curProp = this.propDic[prop];
        if (curProp == null) return true;

        if (recursive === true)
        {
            var childrenChanged = curProp.haveChildrenChanged(true);
            if (childrenChanged === true) return true;
        }
        else
        {
            if (curProp.hasChanged() === true) return true;
        }
    }

    return false;
};

/**Gets the current value of the ObservedProperty.
@returns {Any}*/
EVUI.Modules.Observers.ObservedProperty.prototype.getCurrentValue = function ()
{
    if (this.hostObject == null) return undefined;
    return this.hostObject[this.name];
};

/**A specialized observer that watches an array and reports back structural changes in the array's indexed element values or object references (but not the properties of the referenced objects).
@param {Array} arr The array to observe for changes in the indexed values.
@class*/
EVUI.Modules.Observers.ArrayObserver = function (arr)
{
    if (EVUI.Modules.Core == null) throw Error("Dependency missing: EVUI.Modules.Core is required.");
    EVUI.Modules.Core.Utils.requireAll(EVUI.Modules.Observers.Dependencies);

    /**String. Special property to "tag" objects with so that they can be looked up in a hash table instead of using indexOf to find their index in the old array.
    @type {String}*/
    var _keyHash = EVUI.Modules.Core.Utils.getHashCode(EVUI.Modules.Core.Utils.makeGuid()).toString(36);

    /**Object. A dictionary of source values and their related hash codes, used for very large strings so they don't have to be hashed over and over.
    @type {{}}*/
    var _hashCache = {};

    /**Array. The array being observed.
    @type {[]}*/
    var _observedArray = null;

    /**Array. The internal copy of the array's original structure. 
    @type {ArrayElementItem[]}*/
    var _observedElements = [];

    /**Gets all the structural changes that have been made to the values at each index in the array.
    @param {Boolean} setState Whether or not to update the observed state of the array with its current values.
    @returns {EVUI.Modules.Observers.ArrayIndexChange[]} */
    this.getChanges = function (setState)
    {
        var newEles = getElements(_observedArray);

        var diff = diffEles(_observedElements, newEles);
        if (setState === true) _observedElements = newEles;

        return diff;
    };

    /**Makes a snapshot array of ArrayElementItems based on an existing array.
    @param {Array} observedArray The array to take the snapshot of.
    @returns {ArrayElementItem[]} */
    var getElements = function (observedArray)
    {
        var observedEles = [];

        var numEles = observedArray.length;
        for (var x = 0; x < numEles; x++)
        {
            var curVal = observedArray[x];
            var eleItem = new ArrayElementItem();
            eleItem.index = x;
            eleItem.value = curVal;
            eleItem.key = getEleKey(curVal);

            observedEles.push(eleItem);
        }

        return observedEles;
    };

    /**Gets the structural differences between the old snapshot of the array and the new snapshot of the array being observed. This function is designed to work in the situation where the same key or reference is repeated in the array.
    @param {ArrayElementItem[]} oldEles The old snapshot of the array.
    @param {ArrayElementItem[]} newEles The new snapshot of the array.
    @returns {EVUI.Modules.Observers.ArrayIndexChange[]} */
    var diffEles = function (oldEles, newEles)
    {
        var existingKeys = {}; //lookup table for sets of elements with the same key and their indexes
        var adds = {}; //all of ArrayChanges for added elements by their new index
        var removes = {}; //all of the ArrayChanges for removed elements by their old index
        var tagged = []; //array of all the objects that got a tag attached to them
        var byReference = []; //array of all the objects or "reference" types (functions, objects, symbols) that could not be tagged.
        var all = []; //array of all ArrayElementCollections in the diff operation
        var changes = []; //the final change array to return
        
        var numOld = oldEles.length;
        var newObserved = newEles.length;

        //build a dictionary of all old keys
        for (var x = 0; x < numOld; x++)
        {
            var curOld = oldEles[x];
            if (curOld.key == null) //key is null - this means it was an object, function, or symbol we haven't encountered yet
            {
                if (Object.isExtensible(curOld.value) === true) //if we can tag the object, tag it with a key so we can look it up based on its key and not its reference
                {
                    if (curOld.value[_keyHash] === undefined) //no key yet
                    {
                        var tag = Math.random().toString(36); //make a random number key and tag the object with it temporarily
                        curOld.value[_keyHash] = tag; 
                        curOld.key = tag;

                        tagged.push(curOld); //add to array of tagged elements so we know to remove it later
                    }
                    else //already had a key - assign it to the old observed item
                    {
                        curOld.key = curOld.value[_keyHash];
                    }
                }
                else //either a sealed/frozen object, a symbol, or a function
                {
                    var collection = getElementCollectionByReference(curOld, byReference); //look for it by reference
                    if (collection == null)
                    {
                        collection = new ArrayElementCollection();
                        collection.value = curOld.value;
                        byReference.push(collection); //didn't find one, add it
                    }

                    //add the item to the collection of items at the reference
                    collection.indexes[x] = curOld;
                    collection.items.push(curOld);
                    collection.numItems++;
                    all.push(collection); //add the collection to the list of all collections made

                    continue;
                }
            }

            //see if the key already exists in the dictionary
            var collection = existingKeys[curOld.key];
            if (collection == null) //it did not - make a new collection and add it to the dictionary
            {
                collection = new ArrayElementCollection();
                collection.value = curOld.value;
                collection.key = curOld.key;
                existingKeys[curOld.key] = collection;
            }

            //add the item to the collection of items with the same key
            collection.items.push(curOld);
            collection.indexes[x] = curOld;
            collection.numItems++;
            all.push(collection);
        }

        //walk whichever array is longest
        var longer = (numOld > newObserved) ? numOld : newObserved;
        for (var x = 0; x < longer; x++)
        {
            var curNew = newEles[x];
            var existing = null;

            if (curNew != null) //if we haven't run off the end of the new array image yet, look for its value in the old array
            {
                existing = getElementCollection(curNew.key, existingKeys);
                if (existing == null) //didn't find it based on a pure key lookup, try looking it up based on its tag if possible
                {
                    var tag = curNew.value[_keyHash];
                    if (tag != null)
                    {
                        existing = getElementCollection(tag, existingKeys);
                    }

                    if (existing == null) //didn't find it based on its tag - look for it by reference if it is one of our special reference types
                    {
                        var type = typeof curNew.value;
                        if (type === "object" || type === "function" || type === "symbol")
                        {
                            existing = getElementCollectionByReference(curNew, byReference);
                        }
                    }
                }

                if (existing == null) //not in the old array - it is a new item
                {
                    var addedChange = new EVUI.Modules.Observers.ArrayIndexChange();
                    addedChange.changeType = EVUI.Modules.Observers.ArrayChangeType.Added;
                    addedChange.newIndex = x;
                    addedChange.oldIndex = -1;
                    addedChange.value = curNew.value;

                    changes.push(addedChange);
                    adds[x] = addedChange;
                    continue;
                }
            }

            if (existing != null) //found the element in the old array somewhere
            {
                existing.found = true;

                //item was in the old array, figure out what happened to it
                var change = getArrayChangeType(existing, curNew);
                if (change == null) continue;

                if (change.changeType === EVUI.Modules.Observers.ArrayChangeType.Added)
                {
                    adds[x] = change;
                }

                changes.push(change);
            }
        }

        //walk all the collections made for the old array image and mark anything that wasn't found as removed
        var oldTotal = all.length;
        for (var x = 0; x < oldTotal; x++)
        {
            var curOld = all[x];
            if (curOld.found === false)
            {
                for (var y = 0; y < curOld.numItems; y++)
                {
                    var removedChange = new EVUI.Modules.Observers.ArrayIndexChange();
                    removedChange.changeType = EVUI.Modules.Observers.ArrayChangeType.Removed;
                    removedChange.newIndex = -1;
                    removedChange.oldIndex = curOld.items[y].index;
                    removedChange.value = curOld.value;

                    changes.push(removedChange);
                    removes[removedChange.oldIndex] = removedChange;
                }
            }
        }

        //walk all of the changes that were found and do some logic to see if the element was simply "shifted" up or down in the array based on an add or remove somewhere else. We have to do this at the end because we don't know what was removed as we go through the array the first time.
        var delta = 0;
        var numChanges = changes.length;
        for (x = 0; x < numChanges; x++)
        {
            var curChange = changes[x];        

            var wasAdd = adds[x] != null;
            var wasRemoved = removes[x] != null;

            if (wasAdd === true && wasRemoved === true) continue; //we both added and removed something at that index, so no "shifting" has happened
            if (wasAdd === true) delta++;
            if (wasRemoved === true) delta--;

            if (curChange.changeType !== EVUI.Modules.Observers.ArrayChangeType.Moved) continue; //the below only applies to moved elements

            if (curChange.newIndex === curChange.oldIndex + delta) curChange.changeType = EVUI.Modules.Observers.ArrayChangeType.Shifted;
        }

        //finally, walk all the tagged items and remove their keys and tags so we restore the original state of the observed list and objects
        var numTagged = tagged.length;
        for (var x = 0; x < numTagged; x++)
        {
            var taggedItem = tagged[x];

            taggedItem.key = null;
            delete taggedItem.value[_keyHash];
        }

        return changes;
    };

    /**Gets an ArrayElementCollection based on its key.
    @param {String} key The key of the ArrayElementCollection to find.
    @param {Object} existingKeys The dictionary of ArrayElementCollections organized by key.
    @returns {ArrayElementCollection}*/
    var getElementCollection = function (key, existingKeys)
    {
        if (existingKeys == null) return undefined;
        return existingKeys[key];
    };

    /**Walks an array ArrayElementCollections looking for a value with the same reference.
    @param {ArrayElementItem} arrayItem The item to find.
    @param {ArrayElementCollection[]} referenceList The list of references the value could be in.
    @returns {ArrayElementCollection}*/
    var getElementCollectionByReference = function (arrayItem, referenceList)
    {
        var numRef = referenceList.length;
        for (var x = 0; x < numRef; x++)
        {
            var curRef = referenceList[x];
            if (curRef.value === arrayItem.value)
            {
                return curRef;
            }
        }

        return null;
    };

    /**Gets a unique key for an element in an array based on the element's value. Reference types (objects, functions, symbols) return null.
    @param {Any} val The value to get the key for.
    @returns {String}*/
    var getEleKey = function (val)
    {
        var valType = typeof val;

        if (val === null)
        {
            return "null";
        }
        else if (val === undefined)
        {
            return "undefined";
        }
        else
        {
            if (valType === "object" || valType === "symbol" || valType === "function") return null; //cant identify any of these with a string key, so return nothing.
            val = val.toString();
        }

        var hashKey = valType + "-" + val;
        if (hashKey.length > 43) //just long enough for "string-[GUID]" - any string longer than this gets hashed instead of being used as a key directly (this is to prevent against gigantic string keys in the lookup table)
        {
            var existing = _hashCache[hashKey];
            if (existing == null)
            {
                existing = EVUI.Modules.Core.Utils.getHashCode(hashKey).toString(36); //get the base36 of the huge key
                _hashCache[existing] = hashKey;
            }

            hashKey = existing;
        }

        return hashKey;
    };

    /**Gets an ArrayChangeType based on the circumstances of the changes in the observed array.
    @param {ArrayElementCollection} arrayCollection The existing collection of items with the same value or reference.
    @param {ArrayElementItem} arrayItem The item with the same value or reference
    @returns {String}*/
    var getArrayChangeType = function (arrayCollection, arrayItem)
    {
        var change = new EVUI.Modules.Observers.ArrayIndexChange();
        change.newIndex = arrayItem.index;
        change.value = arrayItem.value;

        if (arrayCollection.indexes[arrayItem.index] != null) //the item was in one of its old slots - no change
        {
            delete arrayCollection.indexes[arrayItem.index]; //remove the item from the dictionary so that it can't match again
            for (var x = 0; x < arrayCollection.numItems; x++)
            {
                if (arrayCollection.items[x].index === arrayItem.index)
                {
                    arrayCollection.items.splice(x, 1);
                    arrayCollection.numItems--;
                }
            }

            return null; //no change to report
        }

        //nothing else in the collection - it got added
        if (arrayCollection.numItems === 0)
        {
            change.oldIndex = -1;
            change.changeType = EVUI.Modules.Observers.ArrayChangeType.Added;

            return change
        }
        else //otherwise, it got moved to a new index
        {
            change.oldIndex = arrayCollection.items[0].index;
            change.changeType = EVUI.Modules.Observers.ArrayChangeType.Moved;
            arrayCollection.items.splice(1, 0);
            arrayCollection.numItems--;

            delete arrayCollection.indexes[change.oldIndex];

            return change;
        }
    };

    /**Represents a snapshotted element of an array.
    @class*/
    var ArrayElementItem = function ()
    {
        /**Number. The index of the element in the array.
        @type {Number}*/
        this.index = -1;

        /**Any. The value at the index in the source array.
        @type {Any}*/
        this.value = null;

        /**String. A unique key for this value if it is not an object, function, or symbol reference.
        @type {String}*/
        this.key = null;
    };

    /**Represents a collection of items with the same key at different indexes in the same array.
    @class*/
    var ArrayElementCollection = function ()
    {
        /**Any. The value that is being referenced by possibly more than one element in the array.
        @type {Any}*/
        this.value = null;

        /**String. A unique key to refer to this collection by. Will either be based on the value of the element or a random string for an object.
        @type {String}*/
        this.key = null;

        /**Object. Dictionary of all the indexes where an element with the same key exists in the array matched to an ArrayElementItem of what is at the given index.
        @type {Object}*/
        this.indexes = {};

        /**Array. The array of all the ArrayElementItems with the same key.
        @type {ArrayElementItem[]}*/
        this.items = [];

        /**Number. The number of items in the items array.
        @type {Number}*/
        this.numItems = 0;

        /**Boolean. Whether or not this collection's key was found in the new array.
        @type {Boolean}*/
        this.found = false;
    };

    if (EVUI.Modules.Core.Utils.isArray(arr) === false) throw Error("Array expected.");

    _observedArray = arr;
    _observedElements = getElements(arr);
};

/**The type of change that was observed in the structure of an array.
@enum*/
EVUI.Modules.Observers.ArrayChangeType =
{
    /**Default. No changes made to an item at a given index.*/
    None: "none",
    /**Item was added to the array.*/
    Added: "add",
    /**Item was removed from the array.*/
    Removed: "remove",
    /**Item was moved from one index to another.*/
    Moved: "move",
    /**Item was shifted up or down in the array in response to other elements before it being added or removed.*/
    Shifted: "shift",
};
Object.freeze(EVUI.Modules.Observers.ArrayChangeType);

/**Object representing a change in the element or reference at a given index in an array.
@class*/
EVUI.Modules.Observers.ArrayIndexChange = function ()
{
    /**Number. The original index of the value in the array.
    @type {Number}*/
    this.oldIndex = -1;

    /**Number. The new index of the value in the array.
    @type {Number}*/
    this.newIndex = -1;

    /**Any. The value in the array that had its index change.
    @type {Any}*/
    this.value = null;

    /**String. A value from the ArrayChangeType enum indicating what type of index change was made to the element.
    @type {String}*/
    this.changeType = EVUI.Modules.Observers.ArrayChangeType.None;
};

/**Observes an object from the time it was passed into the ObjectObserver to when the ObjectOverver's getChanges function is called.   
@param {Object} obj Any user-defined plain object.
@returns {EVUI.Modules.Observers.ObjectObserver} */
$evui.observe = function (obj)
{
    return new EVUI.Modules.Observers.ObjectObserver(obj);
};

/**Observes an array for structural changes from the time it was passed into the ArrayObserver to when the ArrayObserver's getChanges function is called.
@param {Array} arr Any array to observe.
@returns {EVUI.Modules.Observers.ArrayIndexObserver}*/
$evui.observeArray = function (arr)
{
    return new EVUI.Modules.Observers.ArrayObserver(arr);
};

/*#ENDWRAP(Observer)#*/