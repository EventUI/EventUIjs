/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

/*#INCLUDES#*/

/*#BEGINWRAP(EVUI.Modules.Core|Core)#*/
/*#REPLACE(EVUI.Modules.Core|Core)#*/

/**Core module containing the Initialization and Utility functionality that is shared by all other modules.
@module*/
EVUI.Modules.Core = {};

/*#MODULEDEF(Core|"1.0"|"Core")#*/
/*#VERSIONCHECK(EVUI.Modules.Core|Core)#*/

/**Property bag for holding various settings that alter the runtime behavior of the library.*/
EVUI.Modules.Core.Settings = {};

/**Property bag for holding various settings that alter the runtime behavior of the library.
@type {EVUI.Modules.Core.Settings}*/
$evui.settings = EVUI.Modules.Core.Settings;
Object.defineProperty($evui, "settings", {
    get: function () { return EVUI.Modules.Core.Settings; },
    enumerable: true
});

/**Gets a value from a settings table.
@param {String} setting The name of the setting to get.
@param {Object} settingsObj The object to get the setting from. If omitted, the $evui.settings object is used by default.
@returns {Any} */
$evui.getSetting = function (setting, settingsObj)
{
    return EVUI.Modules.Core.Utils.getSetting(setting, settingsObj);
};

/**Checks to see if a value is one of the possible values that are commonly used that can mean true (true, 1, "true", or "1") rather than doing JavaScript's implicit typecasting for "truthy" values. 
@param {Any} value The value to check.
@returns {Boolean} */
$evui.isTrue = function (value)
{
    return EVUI.Modules.Core.Utils.isTrue(value);
};

/**Checks to see if one of the constants from a settings table is true.
@param {String} setting The name of the setting to get.
@param {Object} settingsObj The object to get the setting from. If omitted, the $evui.settings object is used by default.
@returns {Boolean} */
$evui.isSettingTrue = function (setting, settingsObj)
{   
    return EVUI.Modules.Core.Utils.isSettingTrue(setting, settingsObj);
};

/**Boolean. Whether or not EventUI can emit any log messages. True by default.
@type {Boolean}*/
EVUI.Modules.Core.Settings.loggingEnabled = true;

/**Function. An alternate logging function to call in the event LoggingEnabled is set to false.
@param {String} message The message to log.*/
EVUI.Modules.Core.Settings.alternateLoggingFunction = function (message) { };

/**Boolean. Whether or not EventUI can emit debug messages. True by default.
@type {Boolean}*/
EVUI.Modules.Core.Settings.debug = true;

/**Boolean. Whether or not to trace events triggered by the EventManager. False by default.
 @type {Boolean}*/
EVUI.Modules.Core.Settings.traceEvents = false;

/**Boolean. Whether or not to trace iframe message sends and responses by the IFrameMessenger. False by default.
 @type {Boolean}*/
EVUI.Modules.Core.Settings.traceIFrames = false;

/**Boolean. If a message comes from an iframe with a white-listed origin, it will automatically be added as a child of the iframeManager. True by default.
@type {Boolean}*/
EVUI.Modules.Core.Settings.autoAddIncomingIFrames = true;

/**Number. When an EventStream is running, this is the number of sequential steps that can be executed by an instance of an EventStream before introducing a shot timeout to free up the thread to allow other processes to continue, otherwise an infinite step loop (which is driven by promises) will lock the thread. Small numbers will slow down the EventStream, high numbers may result in long thread locks. 50 by default.
@type {Number}*/
EVUI.Modules.Core.Settings.stepsBetweenWaits = 250;

/**Number. When positioning a Pane (or Pane-driven) UI component, this is the minimum Z-Index to use to start setting the z-indexes at. 100 by default.
@type {Number}*/
EVUI.Modules.Core.Settings.defaultMinimumZIndex = 100;

/**Boolean. Whether or not to normalize the case of strings when doing string comparisons. False by default. 
@type {Boolean}*/
EVUI.Modules.Core.Settings.normalizeStringCase = false;

/**Boolean. Whether or not to use .toLocaleUpper/LowerCase when normalizing strings. False by default.
@type {Boolean}*/
EVUI.Modules.Core.Settings.localizeStringComparison = false;

/**Constants table for the Core module.*/
EVUI.Modules.Core.Constants = {};

/**A function used to kick start an application.
@param {EVUI.Modules.Core.Settings} settings The $evui.settings object.*/
EVUI.Modules.Core.Constants.Fn_Init = function (settings)
{
        
};

/**A function used to kick start an application.
@param {EVUI.Modules.Core.Settings} settings The $evui.settings object.
@returns {Promise}*/
EVUI.Modules.Core.Constants.Fn_InitAsync = function (settings)
{

};

/**A function that is called once the AsyncSequenceExecutor has completed executing all of its functions. 
@param {Error|Error[]} error Any exception that was thrown while the functions were executing. If foceCompletion was set to true, this will be an array of all errors that occurred during the exection.*/
EVUI.Modules.Core.Constants.Fn_ExecutorCallback = function (error)
{

};

/**A function used to filter the members extended onto a another object.
@param {String} propName The name of the property to extend.
@param {Object} sourceObj The source object being extended onto the target.
@param {Object} testObj The target object or receive properties.
@returns {Boolean}*/
EVUI.Modules.Core.Constants.Fn_ExtendPropertyFilter = function (propName, sourceObj, targetObj) { };

/**If the browser supports Symbols, this is a special Symbol that is used to cache a list of an Object's properties and attach it to that object's prototype so that the property list does not need to be recalculated over and over for objects implementing the same prototype who will always have the same property list.
@type {Symbol}*/
EVUI.Modules.Core.Constants.Symbol_ObjectProperties = "evui-property-list";
(function ()
{
    if (typeof (Symbol) !== "undefined") EVUI.Modules.Core.Constants.Symbol_ObjectProperties = Symbol("evui-property-list");
})()

/**If the browser supports Symbols, this is a special Symbol that is used to indicate that Object.keys can be used to get the object's full properties instead of using a for...in loop.
@type {Symbol}*/
EVUI.Modules.Core.Constants.Symbol_HasPrototypeMembers = "evui-proto-list";
(function ()
{
    if (typeof (Symbol) !== "undefined") EVUI.Modules.Core.Constants.Symbol_HasPrototypeMembers = Symbol("evui-proto-list");
})()

Object.freeze(EVUI.Modules.Core.Constants);

/**Exection arguments to feed into the AsyncSequenceExecutor.
@class*/
EVUI.Modules.Core.AsyncSequenceExecutionArgs = function ()
{
    /**Array. An array of function to execute in the order that they appear in the array, regardless if they are async or not.
    @type {Function[]}*/
    this.functions = null;

    /**Any. The parameter to feed into each function.
    @type {Any}*/
    this.parameter = null;

    /**Boolean. Whether or not, in the event of an error, to continue executing or to stop when the error is thrown. False by default.
    @type {Boolean}*/
    this.forceCompletion = false;
};

/**Utility class used for executing a mixed sequence of async or normal functions in order in that each function is only called once the previous function has returned.
@class*/
EVUI.Modules.Core.AsyncSequenceExecutor = (function ()
{
    var AsyncSequenceExecutor = function() {};

    /**Represents an execution session in progress. */
    var ExecutionSession = function ()
    {
        /**Array. An array of functions to execute.
        @type {Function[]}*/
        this.functions = null;

        /**Object. A parameter to pass into the functions.
        @type {Object}*/
        this.parameter = null;

        /**Number. The index of the currently executing function.
        @type {Number}*/
        this.index = 0;

        /**Function. A callback function to call once all the other functions have executed.
        @type {EVUI.Modules.Core.Constants.Fn_ExecutorCallback}*/
        this.callback = null;

        /**Whether or not executor should continue executing when an error occurs. False by default.
        @type {Boolean}*/
        this.forceCompletion = false;

        /**Array. If forceCompletion is true, this is the array of errors that occurred during the execution of the function stack. */
        this.errors = null;
    };

    /**Executes a sequence of functions in order.
    @param {ExecutionSession} session The currently executing session.*/
    var execute = function (session)
    {
        var curFunction = getNext(session);
        if (curFunction == null) return session.callback(session.errors);

        try
        {
            var result = curFunction(session.parameter);
            if (EVUI.Modules.Core.Utils.isPromise(result) === true)
            {
                result.then(function ()
                {
                    execute(session);

                }).catch(function (ex)
                {
                    if (session.forceCompletion === true)
                    {
                        EVUI.Modules.Core.Utils.log(ex);
                        session.errors.push(ex);

                        execute(session);
                    }
                    else
                    {
                        session.callback(ex)
                    }
                });
            }
            else
            {
                execute(session);
            }
        }
        catch (ex)
        {
            if (session.forceCompletion === true)
            {
                EVUI.Modules.Core.Utils.log(ex);
                session.errors.push(ex);

                execute(session);
            }
            else
            {
                session.callback(ex)
            }
        }
    };

    /**Gets the next function in a sequence of functions.
    @param {ExecutionSession} session The currently executing session.
    @returns {Function}*/
    var getNext = function (session)
    {
        var fn = session.functions[session.index];
        session.index++;

        return fn;
    };

    /**Executes a batch of functions in order based on their indexes in the functions array regardless if they are async or not. Designed to prevent race conditions between competing functions.
    @param {EVUI.Modules.Core.AsyncSequenceExecutionArgs|Function[]} exeArgsOrFns Either a YOLO AsyncSequenceExecutionArgs object or an array of functions.
    @param {EVUI.Modules.Core.Constants.Fn_ExecutorCallback} callback A callback function to call once the last function has completed executing.*/
    AsyncSequenceExecutor.prototype.execute = function (exeArgsOrFns, callback)
    {
        var argsType = typeof exeArgsOrFns;
        if (typeof exeArgsOrFns == null || argsType !== "object") throw Error("Object expected.");

        if (EVUI.Modules.Core.Utils.isArray(exeArgsOrFns) === true)
        {
            var fns = exeArgsOrFns;

            exeArgsOrFns = new EVUI.Modules.Core.AsyncSequenceExecutionArgs();
            exeArgsOrFns.functions = fns;
        }
        else
        {
            if (EVUI.Modules.Core.Utils.isArray(exeArgsOrFns.functions) === false) throw Error("Cannot execute without an array of functions.");
        }

        if (typeof callback !== "function") callback = function () { };

        var session = new ExecutionSession();
        session.functions = exeArgsOrFns.functions.filter(function (func) { return typeof func === "function" });
        session.index = 0;
        session.callback = callback;
        session.parameter = exeArgsOrFns.parameter;
        session.forceCompletion = (exeArgsOrFns.forceCompletion === true) ? true : false;
        session.errors = [];

        execute(session)
    };

    /**Awaitable. Executes a batch of functions in order based on their indexes in the functions array regardless if they are async or not. Designed to prevent race conditions between competing functions.
    @param {EVUI.Modules.Core.AsyncSequenceExecutionArgs|Function[]} exeArgsOrFns Either a YOLO AsyncSequenceExecutionArgs object or an array of functions.
    @returns {Promise<Error>|Promise<Error[]>}*/
    AsyncSequenceExecutor.prototype.executeAsync = function (exeArgsOrFns)
    {
        return new Promise(function (resolve, reject)
        {
            AsyncSequenceExecutor.execute(fns, parameter, function (ex)
            {
                if (ex instanceof Error) return reject(ex);
                if (EVUI.Modules.Core.Utils.isArray(ex) === true && ex.length > 0) return reject(ex);
                resolve();
            });
        });
    };

    return new AsyncSequenceExecutor();
})();

/**Executes a batch of functions in order based on their indexes in the functions array regardless if they are async or not. Designed to prevent race conditions between competing functions.
@param {EVUI.Modules.Core.AsyncSequenceExecutionArgs|Function[]} exeArgsOrFns Either a YOLO AsyncSequenceExecutionArgs object or an array of functions.
@param {EVUI.Modules.Core.Constants.Fn_ExecutorCallback} callback A callback function to call once the last function has completed executing.*/
$evui.executeSequence = function (exeArgsOrFns, callback)
{
    return EVUI.Modules.Core.AsyncSequenceExecutor.execute(exeArgsOrFns, callback);
};

/**Awaitable. Executes a batch of functions in order based on their indexes in the functions array regardless if they are async or not. Designed to prevent race conditions between competing functions.
@param {EVUI.Modules.Core.AsyncSequenceExecutionArgs|Function[]} exeArgsOrFns Either a YOLO AsyncSequenceExecutionArgs object or an array of functions.
@returns {Promise<Error>|Promise<Error[]>}*/
$evui.executeSequenceAsync = function (exeArgsOrFns, callback)
{
    return EVUI.Modules.Core.AsyncSequenceExecutor.executeAsync(exeArgsOrFns, callback);
};

/**Array of all the initialization functions passed into the Initialize function.
@type {EVUI.Modules.Core.Constants.Fn_Init[]|Core.Constants.Fn_InitAsync[]}*/
EVUI.Modules.Core.Initializers =
    EVUI.Modules.Core == null ? [] : EVUI.Modules.Core.Initializers; /*#LOCK#*/

if (EVUI.Modules.Core.Initializers == null) EVUI.Modules.Core.Initializers = [];

(function()
{
    //state variables to pass in via a closure to the Initialize function to keep redundant calls from happening
    var initExecuting = false;
    var initEx = null;
    var initDone = false;
    var initLoadDone = false;

    if (typeof (window) !== "undefined")
    {
        document.addEventListener("DOMContentLoaded", function () { initLoadDone = true; });
        window.addEventListener("load", function () { initLoadDone = true; });
    }
    else
    {
        initLoadDone = true;
    }


    /**Initializes an application. Fires when all DOM content has been loaded, all functions passed into this function are called in FIFO order, even if they are async functions.
    @param {EVUI.Modules.Core.Constants.Fn_Init|EVUI.Modules.Core.Constants.Fn_InitAsync} initFn An initialization function that can optionally be an async function.
    @returns {Promise}*/
    EVUI.Modules.Core.Initialize = function (initFn)
    {
        //add the function to the queue for init functions
        EVUI.Modules.Core.Initializers.push(initFn);

        return new Promise(function (resolve, reject)
        {
            var isDOM = typeof window !== "undefined"; //checking to see if the DOM is available, or if we are running in some environment where there is no document object (web worker, node.js, etc).
            var finish = function (ex)
            {
                initDone = false;
                if (ex == null || (EVUI.Modules.Core.Utils.isArray(ex) === true && ex.length === 0)) return resolve();
                return reject(ex);
            };

            var go = function ()
            {
                if (isDOM === true)
                {
                    //detach event handlers before doing anything
                    document.removeEventListener("DOMContentLoaded", go);
                    window.removeEventListener("load", go);
                }

                initLoadDone = true;

                //set a little timeout in case we're premature with the events slightly, or so that multiple calls to init wind up getting queued properly
                setTimeout(function ()
                {
                    if (initExecuting === false) //if we're not yet executing the function sequence, kick off the execution of the sequence
                    {
                        initExecuting = true;
                        var initFns = EVUI.Modules.Core.Initializers.splice(0, EVUI.Modules.Core.Initializers.length);

                        var exeArgs = new EVUI.Modules.Core.AsyncSequenceExecutionArgs();
                        exeArgs.functions = initFns;
                        exeArgs.parameter = $evui.settings;

                        EVUI.Modules.Core.AsyncSequenceExecutor.execute(exeArgs, function (error)
                        {
                            initDone = true;
                            initEx = error;
                            initExecuting = false;

                            return finish(error);
                        });
                    }
                    else //already executing, wait for the executor to finish
                    {
                        var wait = function ()
                        {
                            setTimeout(function ()
                            {
                                if (initDone === true)
                                {
                                    return finish(initEx);
                                }
                                else
                                {
                                    wait();
                                }
                            });
                        };

                        wait();
                    }
                }, 10);
            };

            //if the loading process is already done (i.e. the DOM is already loaded and ready), execute the functions like normal
            if (initLoadDone === true)
            {
                go();
            }
            else
            {
                if (isDOM === true)
                {
                    document.addEventListener("DOMContentLoaded", go);
                    window.addEventListener("load", go);
                }
                else
                {
                    go();
                }
            }
        });
    };
})();

/**Initializes an application. Fires when all DOM content has been loaded, all functions passed into this function are called in FIFO order, even if they are async functions.
@param {EVUI.Modules.Core.Constants.Fn_Init|EVUI.Modules.Core.Constants.Fn_InitAsync} initFn An initialization function that can optionally be an async function.
@returns {Promise}*/
$evui.init = function (initFn)
{
    return EVUI.Modules.Core.Initialize(initFn);
};

/**Object constructor for an object whose members can be accessed in a case-insensitive manner.
@param {Object} source An object to recursively extend into a case-insensitive object or object hierarchy.
@class*/
EVUI.Modules.Core.CaseInsensitiveObject = function (source)
{
    if (source == null || typeof source !== "object") return;
    if (source instanceof Node) return;

    var keys = EVUI.Modules.Core.Utils.getProperties(source); //Object.keys(source);
    var numKeys = keys.length;

    for (var x = 0; x < numKeys; x++)
    {
        var prop = keys[x];
        this.setValue(prop, source[prop]);
    }
};

/**Gets a value from the object while normalizing the case of the valueName. Note if there are multiple value names differing only in case, this will only return the first one found.
@param {String} valueName The name of the value to get.
@returns {Any}*/
EVUI.Modules.Core.CaseInsensitiveObject.prototype.getValue = function (valueName)
{
    //can only get a property if its key is a string or a number
    if (typeof valueName !== "string" && typeof valueName !== "number") return undefined;

    //check to see if it's already an exact match, if so return the value
    if (this[valueName] !== undefined) return this[valueName];

    //normalize the case if we're dealing with a string
    if (typeof valueName === "string") valueName = valueName.toLowerCase();

    var keys = Object.keys(this);
    var numKeys = keys.length;

    for (var x = 0; x < numKeys; x++) //for (var propName in this)
    {
        var propName = keys[x];

        //normalize the case of the property name
        var lowerPropname = (typeof propName === "string") ? propName.toLowerCase() : lowerPropname;

        //found it, return it
        if (lowerPropname === valueName) return this[propName];
    }

    //didn't find it, return undefined.
    return undefined;
};

/**The most expensive setter ever made. Sets a value in a case-insensitive way, meaning all case-insensitive matches are deleted and replaced with a single property with the given name.
This is to solve the problem of multiple case-insensitive matches on the same object (the first is returned, the others are ignored), this function ensures that the given key will return the provided value, no matter the case.
@param {String|Number} valueName The name of the value to set.
@param {Any} value The value to set.*/
EVUI.Modules.Core.CaseInsensitiveObject.prototype.setValue = function (valueName, value)
{
    if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(valueName) === true && typeof valueName !== "number") return false;
    var lowerValueName = (typeof propName === "string") ? valueName.toLowerCase() : valueName;

    if (typeof valueName === "string")
    {
        var keys = Object.keys(this);
        var numKeys = keys.length;

        for (var x = 0; x < numKeys; x++)
        {
            var propName = keys[x];

            var lowerPropname = (typeof propName === "string") ? propName.toLowerCase() : lowerPropname;
            if (lowerPropname === lowerValueName)
            {
                try
                {
                    delete propName;
                }
                catch (ex)
                {
                    this[popName] = undefined;
                }
            }
        }
    }

    this[valueName] = value;
    return true;
};

/**Utility for doing a simple deep extend on an object hierarchy. All objects created are either plain objects or plain arrays, but will have the same properties as their source object hierarchy.
@class*/
EVUI.Modules.Core.DeepExtender = (function ()
{
    var _hiddenTag = false;
    var _tagID = 0;

    try
    {
        if (typeof (Symbol) !== "undefined") _hiddenTag = Symbol((Math.random() * 10000).toString(36));
    }
    catch (ex)
    {

    }

    /**Dummy object we're using to attach the prototype deepExtend function to.*/
    var DeepExtender = function () { };

    /**Represents a property bag containing all the information about this deep clone operation.
    @class*/
    var DeepExtendSession = function ()
    {
        /**The object receiving properties from the source.
        @type {Object}*/
        this.target = null;

        /**The object whose properties are being copied onto the target.
        @type {Object}*/
        this.source = null;

        /**The options used to configure the deep clone operation.
        @type {EVUI.Modules.Core.DeepExtenderOptions}*/
        this.options = null;

        /**An array of ExistingObjects representing all the objects found in this graph.
        @type {ExistingObject}*/
        this.existingObjects = [];

        /**A lookup table where elements which were tagged are contained.
        @type {{}}*/
        this.existingObjectsLookup = {};

        /**Whether or not to filter by a predicate function.
        @type {Boolean} */
        this.filterViaFn = false;

        /**Whether or not to filter by an array od disallowed property names.
        @type {Boolean} */
        this.filterViaArray = false;

        /**If there was an array of property names, this is a quick-lookup table of them.
        @type {{}} */      
        this.filterLookup = null;
    };

    /**Container for a previously extended object.
    @class*/
    var ExistingObject = function (source, clone)
    {
        /**Object. The raw source object.
        @type {Object}*/
        this.source = source;
        /**Object. The object made from the source object.
        @type {Object}*/
        this.clone = clone;
        /**Array. All of the paths in the object graph that point to this object.
        @type {String}*/
        this.paths = [];
        /**Boolean. Whether or not both the source and the clone are the same object.
        @type {Boolean}*/
        this.sameReference = false;
    };

    /**Extends one object's hierarchy onto another object recursively.
    @param {Object} target The target object to extend properties on to.
    @param {Object} source The source object to extend.
    @param {EVUI.Modules.Core.DeepExtenderOptions} options An optional filter function used to filter out properties from the source to extend onto the target, return true to filter the property. Or an array of property names to not extend onto the target object.
    @returns {Object}*/
    DeepExtender.prototype.deepExtend = function(target, source, options)
    {

        if (typeof source !== "object" || source != null) throw Error("source must be an object.");
        if (typeof target !== "object" || target != null) throw Error("target must be an object.");

        var session = new DeepExtendSession();
        session.target = target;
        session.source = source;
        session.rootObj = target;
        session.options = (typeof options !== "object" || options == null) ? new EVUI.Modules.Core.DeepExtenderOptions() : options;

        return deepExtend(session);
    };


    /**Extends one object's hierarchy onto another object recursively.
    @param {DeepExtendSession} session
    @returns {Object}*/
    var deepExtend = function (session)
    {
        if (session.options.filter != null)
        {
            if (typeof filter === "function")
            {
                session.filterViaFn = true;
            }
            else if (EVUI.Modules.Core.Utils.isArray(filter) === true)
            {
                session.filterViaArray = true;

                session.filterLookup = {};
                var numInFilter = filter.length;
                for (var x = 0; x < numInFilter; x++)
                {
                    var curInFilter = filter[x];
                    session.filterLookup[curInFilter] = true;
                }
            }
        }

        addExistingObject(session, session.source, session.target, ""); //add the top level object to our list of existing objects so if another property points back to it, it will not get into an infinite loop
        
        var extended = extend(session.target, session.source, null, session);

        removeAllTags(session);

        return extended;
    };

    /**Extends one object's hierarchy onto another object recursively.
    @param {DeepExtendSession} session
    @returns {Object}*/
    var extend = function (target, source, path, session)
    {
        if (source == null || typeof source !== "object") return session.target;
        if (target == null || typeof target !== "object") return session.target;

        var keys = EVUI.Modules.Core.Utils.getProperties(source); //Object.keys(session.source);
        var numKeys = keys.length;

        //we recursively create a hierarchy of objects for whatever object was passed in.
        for (var x = 0; x < numKeys; x++)
        {
            var prop = keys[x];
            var val = undefined;

            if (session.filterViaFn === true)
            {
                if (session.filter(prop, session.source, target) === true) continue; //true means don't include
            }
            else if (session.filterViaArray === true)
            {
                if (session.filterLookup[prop] === true) continue; //was in the filter array, do not include
            }
            else
            {
                val = source[prop];
                var valType = typeof val;

                if (val != null && valType === "object") //we have a non-null object, trigger recursive extend
                {
                    var curPath = (path == null) ? prop : path + "." + prop;
                    var targetObj = target[prop];
                    var sameObj = (typeof targetObj === "object" && targetObj === val); //determine if we have the same object reference in both graphs

                    if (val instanceof Node === true) //no deep cloning of nodes.
                    {
                        target[prop] = val;
                        continue;
                    }

                    var existingObject = getExistingObject(session, val); //make sure we haven't already processed this object (without this check circular references cause an error)
                    if (existingObject != null) //already did this one, just pull out the existing object
                    {
                        if (existingObject.sameReference === false) //we already figured out that the existing object appeared in both graphs and assigned the clone to be the same reference as the session.source, so we have no work to do
                        {
                            if (sameObj === true) //both objects are the same, and we have already run into the session.source object before
                            {
                                existingObject.clone = targetObj;

                                //find each location where the clone was stored and switch it with the correct reference
                                var numLocations = existingObject.paths.length;
                                for (var y = 0; y < numLocations; y++)
                                {
                                    EVUI.Modules.Core.Utils.setValue(existingObject.paths[y], session.rootObj, val);
                                }

                                existingObject.paths.splice(0, numLocations);
                                existingObject.sameReference = true;
                            }
                            else //otherwise, record where we put the object
                            {
                                existingObject.paths.push(curPath);
                                existingObject.sameReference = false;
                            }
                        }

                        target[prop] = existingObject.clone;
                    }
                    else //haven't done it yet
                    {
                        if (typeof targetObj !== "object" || targetObj == null)
                        {
                            targetObj = EVUI.Modules.Core.Utils.isArray(val) ? [] : {}; //add it to the list of ones we've done BEFORE processing it (lest it itself be one of its own properties or part of a greater circular reference loop)
                        }

                        addExistingObject(session, val, targetObj, curPath);

                        
                        target[prop] = extend(targetObj, val, curPath, session); //populate our new child recursively
                    }
                }
                else //anything else, just set its value
                {
                    if (val !== undefined) target[prop] = val;
                }
            }
        }

        return target;
    };

    /**Looks through the list of previously extended objects and returns one if found.
    @param {Object} source The object to extend if not found in this list.*/
    var getExistingObject = function (session, source)
    {
        if (_hiddenTag !== false) //if we can tag objects, check that cache first
        {
            var existing = session.existingObjectsLookup[source[_hiddenTag]];
            if (existing != null) return existing;
        }

        //if we didn't find it, loop through the untagged objects
        var numObjs = session.existingObjects.length;
        for (var x = 0; x < numObjs; x++)
        {
            var curObj = session.existingObjects[x];
            if (curObj.source === source) return curObj;
        }

        return null;
    };

    /**Adds an object to the lookup hash table and to the lookup array if the hash table add failed.
    @param {DeepExtendSession} session The session of the extension operation.
    @param {Object} source The source object to map to the cloned object.
    @param {Object} clone The clone of the source object.
    @param {String} path The path at which the clone was made.
    @returns {ExistingObject}*/
    var addExistingObject = function (session, source, clone, path)
    {
        var entry = null;
        if (_hiddenTag !== false) //if we have the hidden tag symbol...
        {
            //see if we have already tagged this object. If so, just add the path to it and return it. Otherwise make a new one and try to add that to the hash lookup.
            var existing = session.existingObjectsLookup[source[_hiddenTag]];
            if (existing == null)
            {
                existing = new ExistingObject(source, clone);
                existing.paths.push(path);

                var tag = _tagID++;
                source[_hiddenTag] = tag;
                var wasAdded = typeof (source[_hiddenTag]) === "number"; //if the object is frozen or sealed this will be false

                if (wasAdded === true) //key added, add it to lookup list
                {
                    session.existingObjectsLookup[tag] = existing;
                    return existing;
                }
                else //key not added, add to the back-up array
                {
                    entry = existing;
                }
            }
            else
            {
                existing.paths.push(path);
                return existing;
            }
        }

        //either no support for Symbols or we have an ExistingObject reference from above.
        if (entry == null) entry = new ExistingObject(source, clone);
        entry.paths.push(path);

        //add it to the objects list
        session.existingObjects.push(entry);

        return entry;
    };

    /**Removes the tags from all the tagged objects.
    @param {DeepExtendSession} session The session with the tagged objects to be removed.*/
    var removeAllTags = function (session)
    {
        var taggedKeys = Object.keys(session.existingObjectsLookup);

        var numKeys = taggedKeys.length;
        for (var x = 0; x < numKeys; x++)
        {
            var tagged = session.existingObjectsLookup[taggedKeys[x]];
            if (tagged != null) delete tagged.source[_hiddenTag];
        }
    }

    return new DeepExtender();
})();

/**Options for configuring the DeepExtender.*/
EVUI.Modules.Core.DeepExtenderOptions = function ()
{
    /**filter An optional filter function used to filter out properties from the source to extend onto the target, return true to filter the property. Or an array of property names to not extend onto the target object.
    @type {EVUI.Modules.Core.Constants.Fn_ExtendPropertyFilter|String[]}*/
    this.filter = null;
};

/**Object for wrapping properties in one object so that manipulating them changes a different object.
@class*/
EVUI.Modules.Core.ObjectPropertyWrapper = function ()
{
    /**Wraps all the properties specified in the property mappings parameter so that they are settable on the source object but are set and read from the target object.
    @param {Object} source The source object to receive the properties.
    @param {Object} target The target object to be manipulated by the getters and setters on the source object.
    @param {EVUI.Modules.Core.ObjectPropertyMapping|EVUI.Modules.Core.ObjectPropertyMapping[]} propertyMappings A single or an array of ObjectPropertyMapping describing the mappings between the two objects.
    @param {EVUI.Modules.Core.ObjectPropertyMappingSettings} settings The settings to apply to each mapping if the mappings do not have their own settings defined.*/
    this.wrap = function (source, target, propertyMappings, settings)
    {
        if (source == null) throw Error("Cannot wrap a property from a null or undefined source object.");
        if (target == null) throw Error("Cannot make a property wrapper on a null or undefined target object.");
        if (propertyMappings == null) return false;

        if (EVUI.Modules.Core.Utils.isArray(propertyMappings) === false) propertyMappings = [propertyMappings];
        var numMappings = propertyMappings.length;

        if (settings == null) settings = new EVUI.Modules.Core.ObjectPropertyMappingSettings();

        for (var x = 0; x < numMappings; x++)
        {
            var curSetting = propertyMappings[x];
            if (curSetting.settings == null) curSetting.settings = settings;

            mapProperty(source, target, curSetting);
        }
    }

    /**Wraps a property so that setting or getting it on the source object actually gets or sets it on the target object.
    @param {Object} source The object to receive the getter and setter.
    @param {Object} target The object having its value get and set.
    @param {EVUI.Modules.Core.ObjectPropertyMapping} objectPropertyMapping The mapping of the source to the target.*/
    var mapProperty = function (source, target, objectPropertyMapping)
    {
        if (objectPropertyMapping == null) return;
        if (typeof objectPropertyMapping.sourcePath !== "string")
        {
            if (typeof objectPropertyMapping.sourcePath === "number")
            {
                objectPropertyMapping.sourcePath = objectPropertyMapping.sourcePath.toString();
            }
            else if (objectPropertyMapping.sourcePath != null)
            {
                return;
            }
        }

        if (typeof objectPropertyMapping.targetPath !== "string")
        {
            if (typeof objectPropertyMapping.targetPath === "number")
            {
                objectPropertyMapping.targetPath = objectPropertyMapping.targetPath.toString();
            }
            else if (objectPropertyMapping.targetPath != null)
            {
                return;
            }
        }

        var sourceObject = source;
        var sourceObjSegments = (objectPropertyMapping.sourcePath == null) ? [] : EVUI.Modules.Core.Utils.getValuePathSegments(objectPropertyMapping.sourcePath);

        var numSourceSegments = sourceObjSegments.length;
        var sourceObjectPath = (numSourceSegments - 1 <= 0) ? null : sourceObjSegments.slice(0, numSourceSegments - 1).join(".");

        sourceObject = EVUI.Modules.Core.Utils.getValue(sourceObjectPath, source);
        if (sourceObject == null) return;

        var settings = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Core.ObjectPropertyMappingSettings(), objectPropertyMapping.settings);
        if (settings.autoDetect === true)
        {
            settings = new EVUI.Modules.Core.ObjectPropertyMappingSettings();

            var propertyDescriptor = Object.getOwnPropertyDescriptor(sourceObject, sourceObjSegments[numSourceSegments - 1]);
            if (typeof propertyDescriptor.get === "function" || propertyDescriptor.value !== undefined) settings.get = true;
            if (typeof propertyDescriptor.set === "function" || propertyDescriptor.writable === true) settings.set = true;
            if (propertyDescriptor.configurable === true) settings.configurable = true;
            if (propertyDescriptor.enumerable === false) settings.enumerable = false;
        }

        var targetPath = objectPropertyMapping.targetPath; //severs the link between the definition object and the target path so it can't be changed later

        var propertyDef = {};
        if (settings.get === true) propertyDef.get = function () { return EVUI.Modules.Core.Utils.getValue(targetPath, target); }
        if (settings.set === true) propertyDef.set = function (value) { EVUI.Modules.Core.Utils.setValue(targetPath, target, value); }
        propertyDef.configurable = settings.configurable;
        propertyDef.enumberable = settings.enumerable;

        try
        {
            Object.defineProperty(sourceObject, sourceObjSegments[numSourceSegments - 1], propertyDef);
        }
        catch (ex)
        {
            EVUI.Modules.Core.Utils.debugReturn("ObjectPropertyWrapper", "mapProperty", ex.stack);
        }
    };
};

/**Represents a dynamic property mapping where setting or getting one property in one object will actually get or set a property in another object.
@class*/
EVUI.Modules.Core.ObjectPropertyMapping = function ()
{
    /**String. The path of the property in the source object that wraps the property for the target object.  Paths are "." or "[]" delineated strings from a root object down to a property nested within that root object. I.e. a path of "a.b[2].c" would get/set the value of source.a.b[2].c.
    @type {String}*/
    this.sourcePath = null;

    /**String. The path of the property in the target object that is written to and read from via the source path. Paths are "." or "[]" delineated strings from a root object down to a property nested within that root object. I.e. a path of "a.b[2].c" would get/set the value of target.a.b[2].c.
    @type {String}*/
    this.targetPath = null;

    /**Object. The settings describing how the source and target should be mapped.
    @type {EVUI.Modules.Core.ObjectPropertyMappingSettings}*/
    this.settings = null;
};

/**The settings for describing how a property will be mapped between the source and target objects.
@class*/
EVUI.Modules.Core.ObjectPropertyMappingSettings = function ()
{
    /**Boolean. Whether or not to auto-detect the settings on the target object's property (via Object.getOwnPropertyDescriptor) and use those settings as the basis for the values of this object.
    @type {Boolean}*/
    this.autoDetect = false;

    /**Boolean. Whether or not a getter should be added. True by default.
    @type {Boolean}*/
    this.get = true;

    /**Boolean. Whether or not a setter should be added. True by default.
    @type {Boolean}*/
    this.set = true;

    /**Boolean. Whether or not the property can be deleted or changed once added. False by default.
    @type {Boolean}*/
    this.configurable = false;

    /**Boolean. Whether or not the property can be enumerated. True by default.
    @type {Boolean}*/
    this.enumerable = true;
};


/**Module for containing all common functionality that all the other modules share.
@module*/
EVUI.Modules.Core.Utils = {};

/**Creates an instance of a blank EVUI.Modules.Core.Utils.CaseInsensitiveObject.
@param {Object} source: An object to recursively extend into the case-insensitive object or object hierarchy.
@returns {EVUI.Modules.Core.CaseInsensitiveObject}*/
$evui.cio = function (source)
{
    return new EVUI.Modules.Core.CaseInsensitiveObject(source)
};

/**Extends one object's hierarchy onto another object recursively.
@param {Object} target The target object to extend properties on to.
@param {Object} source The source object to extend.
@param {EVUI.Modules.Core.DeepExtenderOptions} options The configuration options for the deep extender.
@returns {Object}*/
EVUI.Modules.Core.Utils.deepExtend = function (target, source, options)
{
    return new EVUI.Modules.Core.DeepExtender.deepExtend(target, source, options);
};


/**Extends one object's hierarchy onto another object recursively.
@param {Object} target The target object to extend properties on to.
@param {Object} source The source object to extend.
@param {EVUI.Modules.Core.DeepExtenderOptions} options The configuration options for the deep extender.
@returns {Object}*/
$evui.deepExtend = function (target, source, options)
{
    return EVUI.Modules.Core.Utils.deepExtend(target, source, options);
};

/**Returns a CaseInsensitiveObject that contains all the attributes on an element as members of the object.
@param {Object} element The element to get the attributes of.
@returns {EVUI.Modules.Core.CaseInsensitiveObject}*/
EVUI.Modules.Core.Utils.getElementAttributes = function (element)
{
    if (element == null) return null;
    if (EVUI.Modules.Core.Utils.isjQuery(element) === true) element = element[0];
    if (EVUI.Modules.Core.Utils.isDomHelper(element) === true) element = element.elements[0];
    if (EVUI.Modules.Core.Utils.isElement(element) === false) return null;

    var attributeBag = new EVUI.Modules.Core.CaseInsensitiveObject();

    var numAttributes = element.attributes.length;
    for (var x = 0; x < numAttributes; x++)
    {
        var curAttribute = element.attributes[x];
        attributeBag[curAttribute.name] = curAttribute.value;
    }

    return attributeBag;
};

/**Returns a CaseInsensitiveObject that contains all the attributes on an element as members of the object.
@param {Object} element The element to get the attributes of.
@returns {EVUI.Modules.Core.CaseInsensitiveObject}*/
$evui.getAttrs = function (element)
{
    return EVUI.Modules.Core.Utils.getElementAttributes(element);
}

/**Wraps all the properties specified in the property mappings parameter so that they are settable on the source object but are set and read from the target object.
@param {Object} source The source object to receive the properties.
@param {Object} target The target object to be manipulated by the getters and setters on the source object.
@param {EVUI.Modules.Core.ObjectPropertyMapping|EVUI.Modules.Core.ObjectPropertyMapping[]} propertyMappings An array of ObjectPropertyMapping describing the mappings between the two objects.
@param {EVUI.Modules.Core.ObjectPropertyMappingSettings} settings The settings to apply to each mapping if the mappings do not have their own settings defined.*/
EVUI.Modules.Core.Utils.wrapProperties = function (source, target, propertyMappings, settings)
{
    return new EVUI.Modules.Core.ObjectPropertyWrapper().wrap(source, target, propertyMappings, settings);
};

/**Wraps all the properties specified in the property mappings parameter so that they are settable on the source object but are set and read from the target object.
@param {Object} source The source object to receive the properties.
@param {Object} target The target object to be manipulated by the getters and setters on the source object.
@param {EVUI.Modules.Core.ObjectPropertyMapping|EVUI.Modules.Core.ObjectPropertyMapping[]} propertyMappings An array of ObjectPropertyMapping describing the mappings between the two objects.
@param {EVUI.Modules.Core.ObjectPropertyMappingSettings} settings The settings to apply to each mapping if the mappings do not have their own settings defined.*/
$evui.wrap = function (source, target, propertyMappings, settings)
{
    return new EVUI.Modules.Core.Utils.wrapProperties(source, target, propertyMappings, settings);
};

/**Gets a property of an object based on its path starting at the source object.
@param {String} path The dot or bracket delineated path from the source object to the property to get. I.e. a path of "a.b[2].c" would get the value of source.a.b[2].c.
@param {Object} source The starting point of the operation to get the value of the source object.
@returns {Any} */
EVUI.Modules.Core.Utils.getValue = function (path, source)
{
    if (source == null) throw Error("Cannot get a value from a null or undefined source.");

    var pathType = typeof path;
    if (pathType !== "string")
    {
        if (pathType === "number") return source[path];
        if (pathType === "symbol") return source[path];
        if (path == null) return source;

        throw Error("Cannot get value, path must be a string.");
    }

    var segments = EVUI.Modules.Core.Utils.getValuePathSegments(path); //path.replace(/\]/g, "").split(/\.|[\[\]]/g);
    var numSegs = segments.length;
    var curObj = source;

    for (var x = 0; x < numSegs; x++)
    {
        curObj = curObj[segments[x]];
        if (curObj == null) return null;
    }

    return curObj;
};

/**Gets a property of an object based on its path starting at the source object.
@param {String} path The dot or bracket delineated path from the source object to the property to get. I.e. a path of "a.b[2].c" would get the value of source.a.b[2].c.
@param {Object} source The starting point of the operation to get the value of the source object.
@returns {Any} */
$evui.get = function (path, source)
{
    return EVUI.Modules.Core.Utils.getValue(path, source);
};

/**Breaks up a "property path" (a "path" of properties that are separated by dots or braces that leads from a parent object to a child property in it or a child object) into an array of path segments.
@param {String} propertyPath The path to a property.
@returns {String[]} */
EVUI.Modules.Core.Utils.getValuePathSegments = function (propertyPath)
{
    var propType = typeof propertyPath;
    if (propType !== "string") throw Error("Cannot get path segments from a non-string.");

    var segs = propertyPath.split(/\.|\[|\]\.|\]/g); //split based on dots, open braces, close braces followed by a dot, and close braces (in that order so that close braces followed by a dot do not turn into two matches)
    var numSegs = segs.length;
    if (segs[numSegs - 1] === "") segs = segs.slice(0, segs.length - 1);

    return segs;
};

/**Breaks up a "property path" (a "path" of properties that are separated by dots or braces that leads from a parent object to a child property in it or a child object) into an array of path segments.
@param {String} propertyPath The path to a property.
@returns {String[]} */
$evui.getPathSegments = function (propertyPath)
{
    return EVUI.Modules.Core.Utils.getValuePathSegments(propertyPath);
};

/**Sets a property of an object based on its path starting at the target object.
@param {String} path The dot or bracket delineated path from the source object to the property to set. I.e. a path of "a.b[2].c" would set the value of source.a.b[2].c.
@param {Object} target The starting point of the operation to set the value of the source object.
@param {Any} value The value to set the property at the end of the path to.
@param {Boolean} fill Whether or not to fill in any gaps in the object path with plain objects if one is missing.
@returns {Boolean} */
EVUI.Modules.Core.Utils.setValue = function (path, target, value, fill)
{
    if (typeof path !== "string")
    {
        if (EVUI.Modules.Core.Utils.isArray(target) === true && typeof path === "number")
        {
            target[path] = value;
            return true;
        }

        if (path == null)
        {
            target = value;
            return true;
        }

        throw Error("Cannot set value, path must be a string.");
    }

    if (target == null) throw Error("Cannot set value of a null or undefined target.");

    var segments = EVUI.Modules.Core.Utils.getValuePathSegments(path);
    var numSegs = segments.length;
    var curObj = target;

    for (var x = 0; x < numSegs; x++)
    {
        if (x === numSegs - 1)
        {
            curObj[segments[numSegs - 1]] = value;
            return true;
        }

        var curSeg = segments[x];

        var nextObj = curObj[curSeg];
        if (nextObj == null)
        {
            if (fill === true)
            {
                nextObj = {};
                curObj[curSeg] = nextObj;
            }
            else
            {
                throw Error("Failed to set property at path \"" + path + "\", \"" + curSeg + "\"  was null or undefined.");
            }
        }

        curObj = nextObj;
    }

    return false;
};

/**Sets a property of an object based on its path starting at the target object.
@param {String} path The dot or bracket delineated path from the source object to the property to set. I.e. a path of "a.b[2].c" would set the value of source.a.b[2].c.
@param {Object} target The starting point of the operation to set the value of the source object.
@param {Any} value The value to set the property at the end of the path to.
@param {Boolean} fill Whether or not to fill in any gaps in the object path with plain objects if one is missing.
@returns {Boolean} */
$evui.set = function (path, target, value, fill)
{
    return EVUI.Modules.Core.Utils.setValue(path, target, value, fill);
}

/**Gets a value from a settings table.
@param {String} setting The name of the setting to get.
@param {Object} settingsObj The object to get the setting from. If omitted, the $evui.settings object is used by default.
@returns {Any} */
EVUI.Modules.Core.Utils.getSetting = function (setting, settingsObj)
{
    if (setting == null || (typeof setting !== "string" && typeof setting !== "number" && typeof setting !== "symbol")) return null;

    //if for some reason the $evui.settings object is null, we get it from the EVUI.Modules.Core.Settings object, which cannot be set to null.
    if (settingsObj != null && typeof settingsObj === "object") return settingsObj[setting];
    return ($evui.settings == null) ? EVUI.Modules.Core.Settings[setting] : $evui.settings[setting];
};

/**Checks to see if a value is one of the possible values that are commonly used that can mean true (true, 1, "true", or "1") rather than doing JavaScript's implicit typecasting for "truthy" values. 
@param {Any} value The value to check.
@returns {Boolean} */
EVUI.Modules.Core.Utils.isTrue = function (value)
{
    if (value == null) return false;
    if (typeof value === "string") value = value.toLowerCase();
    if (value === "true" || value === 1 || value === "1" || value === true) return true;
    return false;
};

/**Checks to see if one of the constants from a settings table is true.
@param {String} setting The name of the setting to get.
@param {Object} settingsObj The object to get the setting from. If omitted, the $evui.settings object is used by default.
@returns {Boolean} */
EVUI.Modules.Core.Utils.isSettingTrue = function (setting, settingsObj)
{
    return EVUI.Modules.Core.Utils.isTrue(EVUI.Modules.Core.Utils.getSetting(setting, settingsObj));
};

/**Determines if an object can be treated like an array, but not necessarily have the full compliment of Array's prototype functions.
@param {Array} arr The object to test.
@returns {Boolean}*/
EVUI.Modules.Core.Utils.isArray = function (arr)
{
    if (arr == null) return false;

    var arrType = typeof arr;
    if (arrType === "string" || arrType === "function") return false;

    if (Array.isArray(arr) === true) return true;

    if (typeof arr.length === "number")
    {
        return true;
    }
    else
    {    
        return false;
    }
};

/**Determines if an object can be treated like an array, but not necessarily have the full compliment of Array's prototype functions.
@param {Array} arr The object to test.
@returns {Boolean}*/
$evui.isArray = function (arr)
{
    return EVUI.Modules.Core.Utils.isArray(arr);
};

/**Makes a new GUID. Note that this GUID generation function is not intended to create GUIDs to be persisted in any sort of database, shortcuts were taken to simplify the code
that result in having a much higher (but still infinitesimal) odds of collision. It is intended for temporary ID's in a single web app session where the odds of collision are basically zero.
@returns {String}*/
EVUI.Modules.Core.Utils.makeGuid = function ()
{
    return "xxxxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx".replace(/x/g, function ()
    {
        var random = Math.random() * 16;
        random = Math.floor(random);

        return random.toString(16);
    });
};

/**Makes a new GUID. Note that this GUID generation function is not intended to create GUIDs to be persisted in any sort of database, shortcuts were taken to simplify the code
that result in having a much higher (but still infinitesimal) odds of collision. It is intended for temporary ID's in a single web app session where the odds of collision are basically zero.
@returns {String}*/
$evui.guid = function ()
{
    return EVUI.Modules.Core.Utils.makeGuid();
};

/**Makes an empty GUID.
@returns {String}*/
EVUI.Modules.Core.Utils.emptyGuid = function ()
{
    return "00000000-0000-0000-0000-000000000000";
};

/**Makes an empty GUID.
@returns {String}*/
$evui.emptyGuid = function ()
{
    return EVUI.Modules.Core.Utils.emptyGuid();
};

/**Determines whether or not an object can be treated like a Promise.
@param {Promise} promise The object to test.
@returns {Boolean} */
EVUI.Modules.Core.Utils.isPromise = function (promise)
{
    if (promise == null) return false;

    if (typeof (Promise) !== "undefined")
    {
        if (promise instanceof Promise) return true;
    }

    if (typeof promise.then === "function" && typeof promise.catch === "function") return true;
    return false;
};

/**Determines whether or not an object can be treated like a Promise.
@param {Promise} promise The object to test.
@returns {Boolean} */
$evui.isPromise = function (promise)
{
    return EVUI.Modules.Core.Utils.isPromise(promise);
};

/**Normalizes a string by clipping off whitespace and optionally lower casing or locale lower casing it.
@param {String} str The string to normalize.
@param {Boolean} lowerCase Whether or not to normalize case. If omitted the normalizeStringCase setting is used instead.
@param {Boolean} localeCase Whether or not to normalize to localeLowerCase. If omitted the localseStringComparison setting is used instead.
@returns {String} */
EVUI.Modules.Core.Utils.stringNormalize = function (str, lowerCase, localeCase)
{
    if (typeof str !== "string") return null;

    if (typeof lowerCase !== "boolean") lowerCase = EVUI.Modules.Core.Utils.getSetting("normalizeStringCase");
    if (typeof lowerCase !== "boolean") lowerCase = true;

    if (typeof localeCase !== "boolean") localeCase = EVUI.Modules.Core.Utils.getSetting("localizeStringComparison");
    if (typeof localeCase !== "boolean") localeCase = false;

    str = str.trim();

    if (lowerCase === true)
    {
        if (localeCase === true)
        {
            return str.toLocaleLowerCase();
        }
        else
        {
            return str.toLowerCase();
        }
    }
    else
    {
        if (localeCase === true)
        {
            return str.toLocaleLowerCase();
        }

        return str;
    }
};

/**Normalizes a string by clipping off whitespace and optionally lower casing or locale lower casing it.
@param {String} str The string to normalize.
@param {Boolean} lowerCase Whether or not to normalize case. If omitted the normalizeStringCase setting is used instead.
@param {Boolean} localeCase Whether or not to normalize to localeLowerCase. If omitted the localseStringComparison setting is used instead.
@returns {String} */
$evui.strNormalize = function (str, lowerCase, localeCalse)
{
    return EVUI.Modules.Core.Utils.stringNormalize(str, lowerCase, localeCalse);
};

/**Normalizes and compares two strings. Returns 0 if equal, 1 if the first string comes before the second in the sort order, or -1 if the opposite is true.
@param {String} str1 A string to normalize and compare.
@param {String} str2 A string to normalize and compare.
@param {Boolean} lowerCase Whether or not to normalize case. If omitted the normalizeStringCase setting is used instead.
@param {Boolean} useLocale Whether or not to normalize to localeLowerCase. If omitted the localseStringComparison setting is used instead.
@returns {Number} */
EVUI.Modules.Core.Utils.stringCompare = function (str1, str2, lowerCase, useLocale)
{
    if (typeof str1 !== "string" && typeof str2 !== "string") return null;

    if (typeof lowerCase !== "boolean") lowerCase = EVUI.Modules.Core.Utils.getSetting("normalizeStringCase");
    if (typeof lowerCase !== "boolean") lowerCase = true;

    if (typeof useLocale !== "boolean") useLocale = EVUI.Modules.Core.Utils.getSetting("localizeStringComparison");
    if (typeof useLocale !== "boolean") useLocale = false;

    str1 = EVUI.Modules.Core.Utils.stringNormalize(str1, lowerCase, useLocale);
    str2 = EVUI.Modules.Core.Utils.stringNormalize(str2, lowerCase, useLocale);

    var result = 0;

    if (useLocale === true)
    {
        result = str1.trim().localeCompare(str2.trim());
        if (result <= -1) result = -1;
        if (result => 1) result = 1;
    }
    else
    {
        if (str1 < str2) result = -1;
        if (str2 < str1) result = 1;
    }

    return result;
};

/**Normalizes and compares two strings. Returns 0 if equal, 1 if the first string comes before the second in the sort order, or -1 if the opposite is true.
@param {String} str1 A string to normalize and compare.
@param {String} str2 A string to normalize and compare.
@param {Boolean} lowerCase Whether or not to normalize case. If omitted the normalizeStringCase setting is used instead.
@param {Boolean} useLocale Whether or not to normalize to localeLowerCase. If omitted the localseStringComparison setting is used instead.
@returns {Number} */
$evui.strCompare = function (str1, str2, lowerCase, useLocale)
{
    return EVUI.Modules.Core.Utils.stringCompare(str1, str2, lowerCase, useLocale);
};


/**Determines if the parameter passed in is 1) not null, 2) a string, and 3) not composed of only whitespace characters. It is used when we want to make sure a string being used as a key or
name for something is garbage. Returns a boolean.
@param {String} str The string to check.
@returns {Boolean}*/
EVUI.Modules.Core.Utils.stringIsNullOrWhitespace = function (str)
{
    if (str == null || typeof str !== "string") return true;
    var isOnlyWhitespace = (str.trim().length === 0);
    return isOnlyWhitespace;
};

/**Determines if the parameter passed in is 1) not null, 2) a string, and 3) not composed of only whitespace characters. It is used when we want to make sure a string being used as a key or
name for something is garbage. Returns a boolean.
@param {String} str The string to check.
@returns {Boolean}*/
$evui.strIsValid = function (str)
{
    return !EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(str);
};

/**Determines if a string starts with the given phrase.
@param {String} startPhrase The phrase to check for.
@param {String} str The string being checked.
@returns {Boolean}*/
EVUI.Modules.Core.Utils.stringStartsWith = function (startPhrase, str)
{
    if (typeof str !== "string" || typeof startPhrase !== "string") return false;
    if (str.indexOf(startPhrase) !== 0) return false;
    return true;
};

/**Determines if a string starts with the given phrase.
@param {String} startPhrase The phrase to check for.
@param {String} str The string being checked.
@returns {Boolean}*/
$evui.strStartsWith = function (startPhrase, str)
{
    return EVUI.Modules.Core.Utils.stringStartsWith(startPhrase, str);
};

/**Determines if a string ends with the given phrase.
@param {String} endPhrase The phrase to check for.
@param {String} str The string being checked.
@returns {Boolean}*/
EVUI.Modules.Core.Utils.stringEndsWith = function (endPhrase, str)
{
    if (typeof str !== "string" || typeof endPhrase !== "string") return false;

    var endLength = endPhrase.length;
    var strLen = str.length;

    if (endLength > strLen) return false;

    try
    {
        var ending = str.substring(strLen - endLength);
        if (ending === endPhrase) return true;
        return false;
    }
    catch (ex)
    {
        return false;
    }

};

/**Determines if a string ends with the given phrase.
@param {String} endPhrase The phrase to check for.
@param {String} str The string being checked.
@returns {Boolean}*/
$evui.strEndsWith = function (endPhrase, str)
{
    return EVUI.Modules.Core.Utils.stringEndsWith(endPhrase, str);
};

/**Console logging function that can be disabled by setting $evui.settings.loggingEnabled to false. If disabled, it will attempt to fire $evui.settings.alternateLoggingFunction if one was provided.
@param {String} message The message to log.*/
EVUI.Modules.Core.Utils.log = function (message)
{
    try
    {
        if (EVUI.Modules.Core.Utils.isSettingTrue("loggingEnabled"))
        {
            console.log(message);
        }
        else
        {
            var alternateLog = EVUI.Modules.Core.Utils.getSetting("alternateLoggingFunction");
            if (typeof alternateLog === "function") alternateLog(message);
        }
    }
    catch (ex)
    {

    }
};

/**Console logging function that can be disabled by setting $evui.settings.loggingEnabled to false. If disabled, it will attempt to fire $evui.settings.alternateLoggingFunction if one was provided.
@param {String} message The message to log.*/
$evui.log = function (message)
{
    return EVUI.Modules.Core.Utils.log(message);
};

/**Bit flag operator. Checks to see if the flagSet has the given flag set. Returns true if the flag set has the flag, false if it does not.
@param {Number} flagSet The composite value composed of flags.
@param {Number} flagValue The flag to check for.
@returns {Boolean}*/
EVUI.Modules.Core.Utils.hasFlag = function (flagSet, flagValue)
{
    if (typeof flagSet !== "number" || typeof flagValue !== "number") return false;
    var value = flagSet & flagValue;
    return (value === flagValue);
};

/**Bit flag operator. Checks to see if the flagSet has the given flag set.
@param {Number} flagSet The composite value composed of flags.
@param {Number} flagValue The flag to check for.
@returns {Boolean}*/
$evui.hasFlag = function (flagSet, flagValue)
{
    return EVUI.Modules.Core.Utils.hasFlag(flagSet, flagValue);
};

/**Bit flag operator. Sets a flag on the given flag set and returns the new flag set..
@param {Number} flagSet The composite value composed of flags.
@param {Number} flagValue The flag to set.
@returns {Number}*/
EVUI.Modules.Core.Utils.addFlag = function (flagSet, flag)
{
    if (typeof flagSet !== "number" && typeof flag !== "number") return flagSet;
    return flagSet | flag;
};

/**Bit flag operator. Sets a flag on the given flag set and returns the new flag set..
@param {Number} flagSet The composite value composed of flags.
@param {Number} flagValue The flag to set.
@returns {Number}*/
$evui.addFlag = function (flagSet, flag)
{
    return EVUI.Modules.Core.Utils.addFlag(flagSet, flag);
};

/**Bit flag operator. Removes a flag on the given flag set and returns the new flag set..
@param {Number} flagSet The composite value composed of flags.
@param {Number} flagValue The flag to remove.
@returns {Number}*/
EVUI.Modules.Core.Utils.removeFlag = function (flagSet, flag)
{
    if (typeof flagSet !== "number" && typeof flag !== "number") return flagSet;

    flagSet &= ~flag
    return flagSet;
};

/**Bit flag operator. Removes a flag on the given flag set and returns the new flag set.
@param {Number} flagSet The composite value composed of flags.
@param {Number} flagValue The flag to remove.
@returns {Number}*/
$evui.removeFlag = function (flagSet, flag)
{
    return EVUI.Modules.Core.Utils.removeFlag(flagSet, flag);
};

/**Checks to see if an object is an instance of a jQuery object.
@param {Object} object The object to check.
@returns {Boolean}*/
EVUI.Modules.Core.Utils.isjQuery = function (object)
{
    if (object == null) return false; //no object to compare against, always false
    if (typeof (window.jQuery) === "undefined") return false; //jquery was never available
    if (object instanceof jQuery === true) return true; //we have jquery and this object is an instance of the jQuery constructor
    return false;
};

/**Checks to see if an object is an instance of a jQuery object.
@param {Object} object The object to check.
@returns {Boolean}*/
$evui.isjQuery = function (object)
{
    return EVUI.Modules.Core.Utils.isjQuery(object);
};

/**Checks to see if an object is derived from an Element-derived object.
@param {Object} object The object to check.
@returns {Boolean}*/
EVUI.Modules.Core.Utils.isElement = function (object)
{
    return object instanceof Element;
};

/**Checks to see if an object is derived from an Element-derived object.
@param {Object} object The object to check.
@returns {Boolean}*/
$evui.isElement = function (object)
{
    return EVUI.Modules.Core.Utils.isElement(object);
};

/**Utility method for simultaneously logging a debug message and returning a value. Exists for the purpose of returning and logging from a single-line if statement.
This is used to create consistently formatted debug messages for an end user so that they can get some insight into why and where something isn't working. Wherever an unusable input or 
a broken state is detected, this function is used to log it and return safely. Can be silenced via setting $evui.settings.debug to false. Critically important to the guts of EventUI, 
but admittedly of little use to others - use $evui.debug(message, returnValue) for a more generic version. 
@param {String} controller The EventUI controller or object logging the message.
@param {String} method The function that is logging the message.
@param {String} message The message to log.
@param {Any} returnValue Any value to return.
@returns {Any}*/
EVUI.Modules.Core.Utils.debugReturn = function (controller, method, message, returnValue)
{
    if (EVUI.Modules.Core.Utils.isSettingTrue("debug") === false) return returnValue;

    var logStatement = "";
    if (typeof controller === "string")
    {
        logStatement = controller;
    }

    if (typeof method === "string")
    {
        if (logStatement !== "")
        {
            logStatement += "." + method;
        }
        else
        {
            logStatement = method;
        }
    }

    if (typeof message === "string")
    {
        if (logStatement !== "")
        {
            logStatement += ": " + message;
        }
        else
        {
            logStatement = message;
        }
    }

    if (logStatement === "") return returnValue;
    EVUI.Modules.Core.Utils.log(logStatement);

    return returnValue;
};

/**Utility method for simultaneously logging a debug message and returning a value. Exists for the purpose of returning and logging from a single-line if statement.
This is used to create consistently formatted debug messages for an end user so that they can get some insight into why and where something isn't working. Wherever an unusable input or 
a broken state is detected, this function is used to log it and return safely. Can be silenced via setting $evui.settings.debug to false. Critically important to the guts of EventUI, 
but admittedly of little use to others - use $evui.debug(message, returnValue) for a more generic version. 
@param {String} controller The EventUI controller or object logging the message.
@param {String} method The function that is logging the message.
@param {String} message The message to log.
@param {Any} returnValue Any value to return.
@returns {Any}*/
$evui.debugReturn = function (controller, method, message, returnValue)
{
    return EVUI.Modules.Core.Utils.debugReturn(controller, method, message, returnValue);
};

/**Utility method for simultaneously logging a debug message and returning a value. Exists for the purpose of returning and logging from a single-line if statement.
@param {String} message The message to log.
@param {Any} returnValue Any value to return.
@returns {Any}*/
$evui.debug = function (message, returnValue)
{
    return EVUI.Modules.Core.Utils.debugReturn(message, null, null, returnValue);
};

/**Determines whether one element contains another.
@param {Element} childElement The element that is contained by the parent element.
@param {Element} parentElement The element that contains the child element.
@returns {Boolean}*/
EVUI.Modules.Core.Utils.containsElement = function (childElement, parentElement)
{
    if (EVUI.Modules.Core.Utils.isjQuery(childElement) === true) childElement = childElement[0];
    if (EVUI.Modules.Core.Utils.isDomHelper(childElement) === true) childElement = childElement.elements[0];
    if (childElement instanceof Node === false) return false; //not a DOM node, not contained by the parent
    if (childElement.parentElement == null)
    {
        return false;
    }

    if (EVUI.Modules.Core.Utils.isjQuery(parentElement) === true) parentElement = parentElement[0];
    if (EVUI.Modules.Core.Utils.isDomHelper(parentElement) === true) parentElement = parentElement.elements[0];
    if (parentElement instanceof Node === false) return false;

    return parentElement.contains(childElement);
};

/**Determines whether one element contains another.
@param {Object} childElement The element that is contained by the parent element.
@param {Object} parentElement The element that contains the child element.
@returns {Boolean}*/
$evui.containsElement = function (childElement, parentElement)
{
    return EVUI.Modules.Core.Utils.containsElement(childElement, parentElement);
};

/**Determines whether or not a node is an "orphan" and is not connected to the DOM, a DocumentFragment, or a Document.
@param {Node} node The node to test to see if it is part of a Document or DocumentFragment.
@returns {Boolean}*/
EVUI.Modules.Core.Utils.isOrphanedNode = function (node)
{
    if (node == null) return true;
    if (node.isConnected === true) return false;

    var nodeParent = node.parentNode;
    while (nodeParent != null)
    {
        var newParent = nodeParent.parentNode;
        if (newParent == null)
        {
            break;
        }
        else
        {
            nodeParent = newParent;
        }
    }

    if (nodeParent != null && (nodeParent.nodeType === Node.DOCUMENT_FRAGMENT_NODE || nodeParent.nodeType === Node.DOCUMENT_NODE)) return false;
    return true;
};

/**Determines whether or not a node is an "orphan" and is not connected to the DOM, a DocumentFragment, or a Document.
@param {Node} node The node to test to see if it is part of a Document or DocumentFragment.
@returns {Boolean}*/
$evui.isOrphan = function (node)
{
    return EVUI.Modules.Core.Utils.isOrphanedNode(node);
}


/**Shallow extend function.
@param {Object} target The target object to receive properties.
@param {Object} source The source of the properties to extend onto the target.
@param {EVUI.Modules.Core.Constants.Fn_ExtendPropertyFilter|String[]} filter An optional filter function used to filter out properties from the source to extend onto the target, return false to filter the property. Or an array of property names to not extend onto the target object.
@returns {Object}*/
EVUI.Modules.Core.Utils.shallowExtend = function (target, source, filter)
{
    if (target == null || typeof target !== "object") return target;
    if (source == null || typeof source !== "object") return target;
    var filterViaArray = false;
    var filterDictionary = null;
    var filterViaFn = false;

    if (filter != null)
    {
        if (typeof filter === "function")
        {
            filterViaFn = true;
        }
        else if (EVUI.Modules.Core.Utils.isArray(filter) === true)
        {
            filterViaArray = true;

            filterDictionary = {};
            var numInFilter = filter.length;
            for (var x = 0; x < numInFilter; x++)
            {
                filterDictionary[filter[x]] = true;
            }
        }
    }

    var keys = EVUI.Modules.Core.Utils.getProperties(source); //Object.keys(source);
    var numKeys = keys.length;

    for (var x = 0; x < numKeys; x++)
    {
        var prop = keys[x];
        if (filterViaFn === true)
        {
            if (filter(prop, source, target) !== false)
            {
                var sourceValue = source[prop];
                if (sourceValue === undefined) continue;

                target[prop] = sourceValue; //anything other than false means include in target
            }
        }
        else if (filterViaArray === true)
        {
            if (filterDictionary[prop] !== true)
            {
                var sourceValue = source[prop];
                if (sourceValue === undefined) continue;

                target[prop] = sourceValue; //was not in the filter array, include in target
            }           
        }
        else //no filter, include always
        {
            var sourceValue = source[prop];
            if (sourceValue === undefined) continue;

            target[prop] = sourceValue;
        }
    }

    return target;
};

/**Shallow extend function.
@param {Object} target The target object to receive properties.
@param {Object} source The source of the properties to extend onto the target.
@param {EVUI.Constants.Utils.Fn_ExtendPropertyFilter|String[]} filter An optional filter function used to filter out properties from the source to extend onto the target, return false to filter the property. Or an array of property names to not extend onto the target object.
@returns {Object}*/
$evui.extend = function (target, source, filter)
{
    return EVUI.Modules.Core.Utils.shallowExtend(target, source, filter);
};

/**Utility function for returning a new, fresh object or extending the properties of a partial object onto an existing or fresh object.
@param {Object} newObj The freshly constructed object with no modifications.
@param {Object} existingObj The existing object that may need to be modified.
@param {Object} modifiedObj The object or partial object that represents the modifications to apply to the new or existing objects.
@param {EVUI.Constants.Utils.Fn_ExtendPropertyFilter|String[]} filter An optional filter function used to filter out properties from the source to extend onto the target, return false to filter the property. Or an array of property names to not extend onto the target object.
@returns {Object} */
EVUI.Modules.Core.Utils.makeOrExtendObject = function (newObj, existingObj, modifiedObj, filter)
{
    if (existingObj == null)
    {
        if (modifiedObj == null)
        {
            return newObj;
        }
        else
        {
            return EVUI.Modules.Core.Utils.shallowExtend(newObj, modifiedObj, filter);
        }
    }
    else
    {
        if (modifiedObj == null)
        {
            return existingObj;
        }
        else
        {
            if (existingObj instanceof newObj.constructor)
            {
                return EVUI.Modules.Core.Utils.shallowExtend(existingObj, modifiedObj);
            }
            else
            {
                return EVUI.Modules.Core.Utils.shallowExtend(newObj, modifiedObj);
            }
        }
    }
};

/**Combines segments of a URL into a complete url regardless if the segments have leading, lagging, or no slashes at all.
@param {Array} pathSegments An array of strings to concatenate into a slash delineated path.
@returns {String}*/
EVUI.Modules.Core.Utils.combinePaths = function (pathSegments)
{
    if (EVUI.Modules.Core.Utils.isArray(pathSegments) === false) return pathSegments;

    var path = "";

    var numPaths = pathSegments.length;
    for (var x = 0; x < numPaths; x++)
    {
        var curSeg = pathSegments[x];
        if (typeof curSeg !== "string") continue;
        if (x === 0)
        {
            path = curSeg;
            continue;
        }

        var currentPathEndsWithSlash = path[path.length - 1] === "/";
        var currentSegmentStartsWithSlash = curSeg[0] === "/";

        if (currentPathEndsWithSlash === false && currentSegmentStartsWithSlash === true)
        {
            path += curSeg; //we have something like root.com and /folder
        }
        else if (currentPathEndsWithSlash === true && currentSegmentStartsWithSlash === true)
        {
            path += curSeg.substring(1); //we have something like root.com/ and /folder
        }
        else if (currentPathEndsWithSlash === false && currentSegmentStartsWithSlash === false)
        {
            if (curSeg[0] === ".") //we have something like root.com/file and .html
            {
                path += curSeg;
            }
            else
            {
                path += "/" + curSeg; //we have something like root.com/folder and folder2
            }
        }
        else if (currentPathEndsWithSlash === true && currentSegmentStartsWithSlash === false)
        {
            if (curSeg[0] === ".") //we have something like root.com/file/ and .html
            {
                path = path.substring(0, path.length - 1) + curSeg;
            }
            else
            {
                path += curSeg //we have something like root.com/ and file.txt
            }
        }
    }

    return path;
};

/**Combines segments of a URL into a complete url regardless if the segments have leading, lagging, or no slashes at all.
@param {Array} pathSegments An array of strings to concatenate into a slash delineated path.
@returns {String}*/
$evui.combinePaths = function (pathSegments)
{
    return EVUI.Modules.Core.Utils.combinePaths(pathSegments);
};

/**An awaitable function that waits a given amount of time in milliseconds.
@param {Number} duration The number of milliseconds to wait.
@returns {Promise} */
EVUI.Modules.Core.Utils.waitAsync = function (duration)
{
    if (typeof duration != null && typeof duration !== "number") throw new Error("Number expected.");

    return new Promise(function (resolve)
    {
        setTimeout(function ()
        {
            resolve();
        }, duration);
    });
};

/**An awaitable function that waits a given amount of time in milliseconds.
@param {Number} duration The number of milliseconds to wait.
@returns {Promise} */
$evui.waitAsync = function (duration)
{
    return EVUI.Modules.Core.Utils.waitAsync(duration);
};

/**Takes an ambiguous input and returns an Element if one could be extracted from the parameter. 
@param {Element|jQuery|EVUI.Modules.Dom.DomHelper} element Either an Element, a jQuery wrapper for at least one element, or a DomHelper wrapper for at least one element.
@returns {Element} */
EVUI.Modules.Core.Utils.getValidElement = function (element)
{
    if (EVUI.Modules.Core.Utils.isElement(element)) return element;
    if (EVUI.Modules.Core.Utils.isjQuery(element) === true && element.length > 0)
    {
        if (EVUI.Modules.Core.Utils.isElement(element[0]) === true) return element[0];
    }

    if (EVUI.Modules.Dom != null)
    {
        if (element instanceof EVUI.Modules.Dom.DomHelper)
        {
            if (element.elements.length > 0 && EVUI.Modules.Core.Utils.isElement(element.elements[0]) === true) return element.elements[0];
        }
    }

    return null;
};

/**Determines if an object is a DomHelper object.
@param {EVUI.Modules.Dom.DomHelper} domHelper A potential instance of DomHelper.
@returns {Boolean} */
EVUI.Modules.Core.Utils.isDomHelper = function (domHelper)
{
    return (EVUI.Modules.Dom != null && domHelper instanceof EVUI.Modules.Dom.DomHelper);
};

/**Determines if an object is a DomHelper object.
@param {EVUI.Modules.Dom.DomHelper} domHelper A potential instance of DomHelper.
@returns {Boolean} */
$evui.isDomHelper = function (domHelper)
{
    return EVUI.Modules.Core.Utils.isDomHelper(domHelper);
};

/**Takes an ambiguous input and returns an Element if one could be extracted from the parameter.
@param {Element|jQuery|EVUI.Modules.Dom.DomHelper} element Either an Element, a jQuery wrapper for at least one element, or a DomHelper wrapper for at least one element.
@returns {Element} */
$evui.getValidElement = function (element)
{
    return EVUI.Modules.Core.Utils.getValidElement(element);
};

/**Determines if a required dependency is present.
 @param {String} moduleName The name of the required module.
 @param {String} minVersion The minimum version of the module required.*/
EVUI.Modules.Core.Utils.require = function (moduleName, minVersion, message)
{
    if (EVUI.Modules[moduleName] == null) throw Error("Dependency missing: Module EVUI.Modules." + moduleName + " is required." + ((EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(message) === false) ? " " + message : ""));
    if (EVUI.Modules.VersionCheck != null) //if VersionCheck is present, we have a processed file and can check the module's version number.
    {
        if (minVersion !== EVUI.Modules[moduleName].version)
        {
            if (EVUI.Modules.VersionCheck.isNewer(minVersion, EVUI.Modules[moduleName].version) === false) throw Error("Dependency missing: Module EVUI.Modules." + moduleName + " must be at least version " + minVersion + " or higher.");
        }
    }
};

/**Determines if all the required dependencies for a module are present.
@param {Object} dependencies The Dependencies property of a Module.*/
EVUI.Modules.Core.Utils.requireAll = function (dependencies)
{
    if (dependencies == null) throw Error("Dependencies missing.");
    if (dependencies.checked === true) return;

    for (var dependency in dependencies)
    {
        if (dependencies[dependency].required === true)
        {
            EVUI.Modules.Core.Utils.require(dependency, dependencies[dependency].version);
        }
    }

    dependencies.checked = true;
};

/**Determines whether or not an element is in the Shadow Dom.
@param {Element} element The element to check for existence in the Shadow Dom.
@returns {Boolean} */
EVUI.Modules.Core.Utils.isInShadowDom = function (element)
{
    if (EVUI.Modules.Core.Utils.isElement(element) === false) return false;

    if (element instanceof ShadowRoot) return true;

    var curParent = element.parentNode;
    while (curParent != null)
    {
        if (curParent instanceof ShadowRoot) return true;
        curParent = curParent.parentNode;
    }

    return false;
};

/**Determines whether or not an element is in the Shadow Dom.
@param {Element} element The element to check for existence in the Shadow Dom.
@returns {Boolean} */
$evui.isShadow = function (element)
{
    return EVUI.Modules.Core.Utils.isInShadowDom(element);
};

/**Determines if an object was constructed using the given (native) constructor. Performs cross-window constructor checks in addition to simple instanceof checks.
 @param {Any} obj The object to test.
 @param {Function} ctor The constructor to test against.
 @returns {Boolean}*/
EVUI.Modules.Core.Utils.instanceOf = function (obj, ctor)
{
    if (obj == null || typeof ctor !== "function") return false;
    if (obj instanceof ctor) return true;
    if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(ctor.name) === true || ctor.name.toLowerCase() === "object") return false;

    if ("[object " + ctor.name + "]" === Object.prototype.toString.call(obj)) return true;
    return false;
};

/**Determines if an object was constructed using the given (native) constructor. Performs cross-window constructor checks in addition to simple instanceof checks.
 @param {Any} obj The object to test.
 @param {Function} ctor The constructor to test against.
 @returns {Boolean}*/
$evui.instanceOf = function (obj, ctor)
{
    return EVUI.Modules.Core.Utils.instanceOf(obj, ctor);
};

/**Returns a hash that uniquely identifies a string. Intended for identifying strings in a web application.
@param {String} str A string to turn into a hash code.
@returns {Number}*/
EVUI.Modules.Core.Utils.getHashCode = function (str)
{    
    if (typeof str !== "string") throw Error("String expected.");
    var strLen = str.length;
    if (strLen === 0) return 0;

    var charRatio = 0;
    var sum = 0;
    var sumMod1 = 0;
    var sumMod2 = 0;
    var sumMod3 = 0;
    var sumMod4 = 0;
    var sumMod5 = 0;
    var curCode = 0;
    var mod5 = 0;
    var previousCode = 1;

    for (var x = 0; x < strLen; x++)
    {
        curCode = str.charCodeAt(x);
        if (curCode === 0)
        {
            curCode = 10.1667;
        }
        else if (curCode === 1)
        {
            curCode = 26.567;
        }

        charRatio = curCode - (x / previousCode);
        if (charRatio < 0) charRatio *= -1;

        sum -= curCode;
        if (sum < 0) sum *= -8.1373;

        mod5 = curCode % 5;

        if (mod5 === 0)
        {
            sumMod5 -= charRatio;
            if (sumMod5 < 0) sumMod5 *= -112.69
        }
        else if (mod5 === 4)
        {
            sumMod4 -= charRatio;
            if (sumMod4 < 0) sumMod4 = (sumMod4 * -918.07);
        }
        else if (mod5 === 3)
        {
            sumMod3 -= charRatio;
            if (sumMod3 < 0) sumMod3 *= -213.7;
        }
        else if (mod5 === 2)
        {
            sumMod2 -= charRatio;
            if (sumMod2 < 0) sumMod2 *= -8.1471
        }
        else
        {
            sumMod1 -= charRatio;
            if (sumMod1 < 0) sumMod1 *= -10.912
        }

        previousCode = curCode;
    }

    var final = (sumMod5 - sumMod4 - sumMod3 - sumMod2 - sumMod1 - sum) / (strLen / charRatio);


    if (sum !== 0)
    {
        if (final === sum)
        {
            final *= Math.sqrt(sum);
        }
        else
        {
            final /= sum;
        }
    }

    if (sumMod1 !== 0 && final !== sumMod1) final *= sumMod1;
    if (sumMod2 !== 0 && final !== sumMod2) final /= sumMod2;
    if (sumMod3 !== 0 && final !== sumMod3) final *= sumMod3;
    if (sumMod4 !== 0 && final !== sumMod4) final /= sumMod4;
    if (sumMod5 !== 0 && final !== sumMod5) final *= sumMod5;
    if (curCode !== 0 && final !== curCode) final /= curCode;
    if (final < 1 && final !== 0 && final > -1) final = 1 / final;
    if (final < 0) final *= -1;

    if (final > Number.MAX_SAFE_INTEGER)
    {
        final = Math.sqrt(final);
    }

    return final;
}

/**Returns a hash that uniquely identifies a string. Not meant to be secure, it is designed for identifying strings in a web application.
@param {String} str A string to turn into a hash code.
@returns {String}*/
$evui.getHashCode = function (str)
{
    return EVUI.Modules.Core.Utils.getHashCode(str);
};

/**Creates a plain object that is keyed based on the key selector function for each item in an array object.
@param {[]} source The source array to iterate over.
@param {Function} keySelector A function that takes each element as a parameter (and its index as a second parameter) and returns a string to identify it by.
@returns {{}}*/
EVUI.Modules.Core.Utils.toDictionary = function (source, keySelector)
{
    if (EVUI.Modules.Core.Utils.isArray(source) === false) throw Error("Array expected.");
    if (typeof keySelector !== "function") throw Error("Function expected.");

    var dic = {};

    var numSource = source.length;
    for (var x = 0; x < numSource; x++)
    {
        var value = source[x];
        var key = keySelector(value, x);
        if (key == null) continue;

        dic[key] = value;
    }

    return dic;
};

/**Creates a plain object that is keyed based on the key selector function for each item in an array object.
@param {[]} source The source array to iterate over.
@param {Function} keySelector A function that takes each element as a parameter (and its index as a second parameter) and returns a string to identify it by.
@returns {{}}*/
$evui.toDictionary = function (source, keySelector)
{
    return EVUI.Modules.Core.Utils.toDictionary(source, keySelector);
}

/**Gets all the property keys that belong to an object.
@param {Object} obj Any object.
@returns {String[]} */
EVUI.Modules.Core.Utils.getProperties = function (obj)
{
    if (typeof obj !== "object" || obj == null) return null;

    //first, check to see if we have explicitly cached the object's properties. If so, just return those.
    var cache = (obj.constructor == null) ? null : obj.constructor[EVUI.Modules.Core.Constants.Symbol_ObjectProperties];
    if (cache != null) return cache;

    //no cache. If the object is a plain object with no constructor or prototypical inheritance, we can use the faster Object.keys to get the object's properties
    if (obj.constructor == Object || (obj.constructor != null && obj.constructor[EVUI.Modules.Core.Constants.Symbol_HasPrototypeMembers] === false))
    {
        return Object.keys(obj);
    }
    else
    {
        if (EVUI.Modules.Core.Utils.isArray(obj) === true) //if its an array, just make a list of all the indexes in the array rather than query the object for its properties
        {
            var len = obj.length;

            var arrayProps = [];
            for (var x = 0; x < len; x++)
            {
                arrayProps.push(x);
            }

            return arrayProps;
        }
        else //some other sort of object that either has a constructor or a prototype that isn't Object.prototype
        {
            //here is the problem we are trying to solve: objects with an explicit constructor function do NOT have a prototype of Object.prototype, they have a different prototype that holds their constructor.
            //HOWEVER, the prototype of that constructor-holding prototype IS Object.prototype, so we need to go two levels down for any constructed object to figure out if we can just use Object.keys on it to get
            //its properties and not a for...in loop (which does account for prototypical inheritance). So, what we do is check for that case where we have a constructor but nothing on the prototype and then cache
            //the result of that check so we don't have to check it every time we run into one of those objects, HOWEVER if someone adds to the prototype AFTER we make this check, we won't ever get those property
            //names from this function since it won't ever look for them in the right way. This is probably an edge case, and has a work-around of simply setting Symbol_HasPrototypeMembers to null to switch off 
            //the entire feature.
            if (EVUI.Modules.Core.Constants.Symbol_HasPrototypeMembers != null) 
            {
                var hasProtoMembers = (obj.constructor == null) ? false : obj.constructor[EVUI.Modules.Core.Constants.Symbol_HasPrototypeMembers]
                if (hasProtoMembers === true) //if we have members in the prototype, we need to use a for...in loop to get them all
                {
                    var props = [];
                    for (var prop in obj)
                    {
                        props.push(prop);
                    }

                    return props;
                }
                else if (hasProtoMembers === false) //if we do NOT have anything on the prototype, we can just use the faster Object.keys
                {
                    return Object.keys(obj)
                }
                else //we haven't checked this "type" of object before
                {
                    //first, get all the properties on it's immediate prototype
                    var immediateProto = Object.getPrototypeOf(obj);
                    var immediateKeys = Object.keys(immediateProto);

                    //if there are none, look one more level down to see if our prototype is Object.prototype.                    
                    if (immediateKeys.length === 0)
                    {
                        var deeperProto = Object.getPrototypeOf(immediateProto);
                        if (deeperProto === Object.prototype || deeperProto == null || Object.getPrototypeOf(deeperProto) == null) //HOWEVER, in a cross - window check, this will fail, so we drill one more level down to get at that deeper prototype and find nothing, we know we were at the base prototype of another window's Object.
                        {
                            if (obj.constructor != null) obj.constructor[EVUI.Modules.Core.Constants.Symbol_HasPrototypeMembers] = false;
                            return Object.keys(obj);
                        }
                    }
                    else //otherwise we know it has properties on at least one level of its prototype, so we flag it as always using a for...in loop to get its properties.
                    {
                        if (obj.constructor != null) obj.constructor[EVUI.Modules.Core.Constants.Symbol_HasPrototypeMembers] = true;
                    }
                }
            }

            //if we haven't returned by now, just do the base behavior
            var props = [];
            for (var prop in obj)
            {
                props.push(prop);
            }

            return props;
        }
    }
};

/**Gets all the property keys that belong to an object.
@param {Object} obj Any object.
@returns {String[]} */
$evui.props = function (obj)
{
    return EVUI.Modules.Core.Utils.getProperties(obj);
}

/**Assigns a Symbol to the object's constructor that contains an array of its property keys so that getProperties does not have to re-query the object for its properties over and over.
@param {Object} obj The object to attach the property list to the constructor.
@param {String[]} props The properties to cache. If omitted, the properties of the object are calculated then cached.
@returns {Boolean} */
EVUI.Modules.Core.Utils.cacheProperties = function (obj, props)
{
    if (EVUI.Modules.Core.Constants.Symbol_ObjectProperties == null) return false;

    if (obj == null || typeof obj !== "object") return false;
    if (Object.getPrototypeOf(obj) == Object.prototype) return false; //NEVER DO THIS FOR PLAIN OBJECTS. All plain objects will report the same list of properties, which will be wrong in 99% of cases.

    if (EVUI.Modules.Core.Utils.isArray(props) === false) props = EVUI.Modules.Core.Utils.getProperties(obj);

    obj.constructor[EVUI.Modules.Core.Constants.Symbol_ObjectProperties] = props;
    return true;
};

/**Assigns a Symbol to the object's constructor that contains an array of its property keys so that $evui.props does not have to re-query the object for its properties over and over.
@param {Object} obj The object to attach the property list to the constructor.
@param {String[]} props The properties to cache. If omitted, the properties of the object are calculated then cached.
@returns {Boolean} */
$evui.cacheProps = function(obj, props)
{
    return EVUI.Modules.Core.Utils.cacheProperties(obj, props);
};

/**Deletes the Symbol from the object's constructor to make it forget its list of cached properties.
@param {Object} obj The object to forget the list of properties from.
@returns {Boolean}*/
EVUI.Modules.Core.Utils.uncacheProperties = function (obj)
{
    if (EVUI.Modules.Core.Constants.Symbol_ObjectProperties == null || obj == null || typeof obj !== "object") return false;

    delete obj.constructor[EVUI.Modules.Core.Constants.Symbol_ObjectProperties];
    delete obj.constructor[EVUI.Modules.Core.Constants.Symbol_HasPrototypeMembers];

    return true;
};

/**Deletes the Symbol from the object's constructor to make it forget its list of cached properties.
@param {Object} obj The object to forget the list of properties from.
@returns {Boolean}*/
$evui.uncacheProps = function (obj)
{
    return EVUI.Modules.Core.Utils.uncacheProperties(obj);
};

Object.freeze(EVUI.Modules.Core);
Object.freeze(EVUI.Modules.Core.Constants);
Object.freeze(EVUI.Modules.Core.Utils);
/*#ENDWRAP(Core)#*/