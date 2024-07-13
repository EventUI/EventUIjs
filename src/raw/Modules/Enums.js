/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

/**Utility module for a shortcut to getting EventUI's enum values or constant values.
@module*/
EVUI.Modules.Enums = {};

EVUI.Modules.Enums.Dependencies =
{
    Core: Object.freeze({ required: true }),
};

(function ()
{
    var checked = false;

    Object.defineProperty(EVUI.Modules.Enums.Dependencies, "checked",
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

Object.freeze(EVUI.Modules.Enums.Dependencies);

/**Utility object for getting enum values based on a variety of possible inputs.
@class*/
EVUI.Modules.Enums.EnumValueGetter = function ()
{
    if (EVUI.Modules.Core == null) throw Error("Dependency missing: EVUI.Modules.Core is required.");
    EVUI.Modules.Core.Utils.requireAll(EVUI.Modules.Enums.Dependencies);

    var _moduleCache = {};
    var _enumCache = {};

    /**Gets either an enum object or a value from an enum object.
    @param {String|Object} enumNameOrModule Either the path to an enum, an enum's name, a module object, or the name of a module.
    @param {String} enumKeyOrName Optional. Either the name/path of the enum (if the first parameter was a module) object and its value.
    @param {String} enumKey Optional. The key of the value to get from the enum.
    @returns {Any}*/
    this.getEnumValue = function (enumNameOrModule, enumKeyOrName, enumKey)
    {
        if (enumNameOrModule == null) return undefined;

        var parsedPath = null;
        var enumEntry = null;
        var moduleEntry = null;
        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(enumNameOrModule) === false)
        {
            parsedPath = resolvePath(enumNameOrModule);
            if (parsedPath.moduleEntry != null)
            {
                moduleEntry = parsedPath.moduleEntry
            }

            if (parsedPath.enumEntry != null)
            {
                enumEntry = parsedPath.enumEntry                
            }
        }
        else if (typeof enumNameOrModule === "object")
        {
            moduleEntry = getModuleEntryByReference(enumNameOrModule);
        }
        else
        {
            return undefined;
        }

        if (enumEntry == null && EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(enumKeyOrName) === false)
        {
            parsedPath = resolvePath(enumKeyOrName);
            if (parsedPath.moduleEntry != null)
            {
                moduleEntry = parsedPath.moduleEntry
            }

            if (parsedPath.enumEntry != null)
            {
                enumEntry = parsedPath.enumEntry
            }            
        }

        //if we found an enum entry but don't have a key for it, check the parameters in order of precedence
        if (enumEntry != null && parsedPath.enumValueKey == null)
        {
            if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(enumKeyOrName) === false)
            {
                var lowerKey = enumKeyOrName.toLowerCase()
                if (parsedPath.enumEntry.values[lowerKey] !== undefined)
                {
                    parsedPath.enumValueKey = enumKeyOrName;
                }
                else
                {
                    if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(enumKey) === false)
                    {
                        var lowerKey = enumKey.toLowerCase()
                        if (parsedPath.enumEntry.values[lowerKey] !== undefined)
                        {
                            parsedPath.enumValueKey = enumKey;
                        }
                    }
                }
            }                          
        }

        if (moduleEntry == null) return undefined;

        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(parsedPath.enumValueKey) === false && EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(enumKey) === true) enumKey = parsedPath.enumValueKey;
        if (enumKey === undefined) return enumEntry.enumObj;
        if (typeof enumKey !== "string") return undefined;

        var value = enumEntry.enumObj[enumKey];
        if (value !== undefined) return value;

        return enumEntry.values[enumKey.toLowerCase()];
    };

    /**Gets a module object based on its name.
    @param {String} moduleName The name of the module to get.
    @returns {Object} */
    this.getModule = function (moduleName)
    {
        if (typeof moduleName !== "string") return undefined;

        var lowerName = moduleName.toLowerCase();
        var moduleEntry = _moduleCache[lowerName];

        if (moduleEntry == null || EVUI.Modules[moduleEntry.name] !== moduleEntry.module)
        {
            updateModuleCache();

            moduleEntry = _moduleCache[lowerName];
            if (moduleEntry == null) return undefined;
        }

        return moduleEntry.module;
    };

    /**Gets a constant value from a module's Constants table.
    @param {String} moduleName The name of the module to get the constant from.
    @param {String} constValueName The name of the constant value to get.
    @returns {Any} */
    this.getConstant = function (moduleName, constValueName)
    {
        if (moduleName == null) return undefined;

        var moduleEntry = null;
        if (typeof moduleName === "object")
        {
            if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(constValueName) === true) return undefined;

            moduleEntry = getModuleEntryByReference(moduleName);
        }
        else if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(moduleName) === false)
        {
            var parseResult = resolvePath(moduleName);
            if (parseResult.moduleEntry != null)
            {
                moduleEntry = parseResult.moduleEntry;
                if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(constValueName) === true && EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(parseResult.enumValueKey) === false) constValueName = parseResult.enumValueKey;
            }
        }

        if (moduleEntry == null || constValueName == null) return undefined;
        return moduleEntry.constants.values[constValueName.toLowerCase()];
    };

    /**Takes a string path and resolves it into any ModuleEntry or EnumEntry that could be found in part of the path.
    @param {String} path The path of the value to get.
    @returns {ParsedEnumPath}*/
    var resolvePath = function (path)
    {
        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(path) === true) return null; //not a valid string, nothing we can do

        var parseResult = new ParsedEnumPath();
        var pathSegs = EVUI.Modules.Core.Utils.getValuePathSegments(path);
        var numSegs = pathSegs.length;

        //walk each segment and try and resolve a module or enum entry based on any path segment's case normalized value
        for (var x = 0; x < numSegs; x++)
        {
            var curSeg = pathSegs[x];
            var lowerSeg = curSeg.toLowerCase();

            if (lowerSeg === "evui" || lowerSeg === "modules") continue; //root namespaces, just skip

            if (parseResult.moduleEntry == null) //if we haven't found a module yet, go look for one of those first
            {
                var moduleEntry = getModuleEntry(lowerSeg);
                if (moduleEntry != null)
                {
                    parseResult.moduleEntry = moduleEntry;
                    continue;
                }
            }

            if (parseResult.moduleEntry != null && lowerSeg === "constants") //if we found a module already and the current segment is "constants", we're getting something from the module's Constants table
            {
                parseResult.enumEntry = moduleEntry.constants;
            }
            else if (parseResult.moduleEntry != null && lowerSeg === "dependencies") //if we found a module already and the current segment is "dependencies", we're getting something from the module's Dependencies table
            {
                parseResult.enumEntry = moduleEntry.dependencies;
            }

            //if we don't have a module name match, do a enum name match (all enums should have unique names)
            if (parseResult.enumEntry == null)
            {
                var enumEntry = getEnumEntry(lowerSeg);
                if (enumEntry != null)
                {
                    parseResult.enumEntry = enumEntry
                    parseResult.moduleEntry = enumEntry.module;

                    continue;
                }
            }

            if (parseResult.enumEntry != null && parseResult.moduleEntry != null) //found both an enum and a module - take the last segment of the path as the value key we're looking for
            {
                if (x <= numSegs - 1)
                {
                    parseResult.enumValueKey = pathSegs[numSegs - 1].toLowerCase();
                    break;
                }
            }
        } 

        //if we didn't find an enum by looping through the segments, go update the cache and look again - its possible a module was loaded between the last and current call to get the enum value
        if (parseResult.enumEntry == null)
        {
            if (parseResult.moduleEntry != null && numSegs === 1) return parseResult;

            if (updateModuleCache() === true) //if updateModuleCache is true, we actually updated something. Otherwise we had the latest data and we don't have what the user is looking for
            {
                return resolvePath(path); //look again if we updated something
            }
            else
            {
                return parseResult;
            }
        }
        else
        {
            return parseResult;
        }

    };

    /**Walks the list of modules current loaded as part of EventUI and sees if any of them needs a re-scan of enum members. Returns true if something was updated.
    @returns {Boolean}*/
    var updateModuleCache = function ()
    {
        var allModules = Object.keys(EVUI.Modules);
        var numModules = allModules.length;
        var updated = false;

        for (var x = 0; x < numModules; x++) //walk the list of all module keys found in EVUI
        {
            var curModuleKey = allModules[x];
            var lowerKey = curModuleKey.toLowerCase();

            var curModule = EVUI.Modules[curModuleKey];
            var cachedModule = _moduleCache[lowerKey];

            if (cachedModule == null) //module wasn't in the cache, go scan its contents and add it
            {
                var moduleEntry = new ModuleEntry();
                moduleEntry.module = curModule;
                moduleEntry.name = curModuleKey;

                buildModuleEnumEntries(moduleEntry, curModule);
                _moduleCache[lowerKey] = moduleEntry;
                updated = true;
            }
            else //module was in the cache. See if we still have the same module reference. If not, go update the cache.
            {
                if (cachedModule.module !== curModule)
                {
                    buildModuleEnumEntries(moduleEntry, curModule);
                    updated = true;
                }
            }
        }

        return updated;
    };

    /**If we were handed a module reference, go find it in the modules list (so we know its name) or see if it was overwritten with a newer module.
    @param {Object} moduleObj An object that could be one of EventUI's modules.
    @returns {ModuleEntry}*/
    var getModuleEntryByReference = function (moduleObj)
    {
        var matchingModule = null;
        var moduleName = null;

        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(moduleObj.name) === false) //the module will have a name in the final built version of the library, but for the local debugging copy it will not
        {
            moduleName = moduleObj.name;
            matchingModule = EVUI.Modules[moduleName];
        }
        else //no module name - go find something that matches based on the reference
        {
            if (moduleObj.Constants === undefined || moduleObj.Dependencies === undefined) //if it's missing either Dependencies or Constants, it's either Core or not a module at all
            {
                if (moduleObj === EVUI.Modules.Core || (moduleObj.Settings !== undefined && moduleObj.Utils !== undefined && typeof moduleObj.Utils.stringIsNullOrWhitespace === "function"))
                {
                    moduleName = "Core";
                    matchingModule = moduleObj;
                }
            }
            else //has the correct properties to be a real module, go do a reference check
            {
                var moduleKeys = Object.keys(EVUI.Modules);

                var numKeys = moduleKeys.length;
                for (var x = 0; x < numKeys; x++)
                {
                    var key = moduleKeys[x];
                    var mod = EVUI.Modules[key];

                    if (mod === moduleObj)
                    {
                        matchingModule = mod;
                        moduleName = key;
                        break;
                    }
                }
            }
        }

        if (matchingModule == null) return null;

        var lowerName = moduleName.toLowerCase();
        var existing = _moduleCache[lowerName];
        var needsRefresh = false;

        if (existing == null) //no module with the given name in the cache, go add it
        {
            existing = new ModuleEntry();
            existing.name = moduleName;
            existing.module = matchingModule;

            _moduleCache[lowerName] = existing;
            needsRefresh = true;
        }

        if (existing.module !== matchingModule) needsRefresh = true; //found the existing module, see if it has been updated since it was last scanned

        if (needsRefresh === true)
        {
            buildModuleEnumEntries(existing, moduleObj);
        }

        return existing;
    };

    /**Builds the enumCache for a given module object.
    @param {ModuleEntry} moduleEntry The module being refreshed or built.
    @param {Object} newModuleObj The module being scanned.*/
    var buildModuleEnumEntries = function (moduleEntry, newModuleObj)
    {
        var existingEnums = Object.keys(moduleEntry.module);
        var numEnums = existingEnums.length;
        for (var x = 0; x < numEnums; x++) //purge the cache of everything already existing in the enum cache for the given module.
        {
            delete _enumCache[existingEnums[x]];
        }

        var newEnums = Object.keys(newModuleObj);
        var newEntries = {};
        var numEnums = newEnums.length;
        var constants = null;
        var dependencies = null;

        for (var x = 0; x < numEnums; x++) //walk each value in the module and see if it follows the rules for being a potential enum
        {
            var key = newEnums[x];

            var curObj = newModuleObj[key];

            if (curObj == null) continue;
            if (typeof curObj !== "object") continue; //must be an object and not a constructor function
            if (curObj.constructor !== Object.prototype.constructor) continue; //enums are always plain objects
            if (Object.isFrozen(curObj) === false) continue; //enums are always frozen

             //Constants and Dependencies follow all the rules, but are special and get special handling because they do not have unique names
            if (key === "Constants")
            {
                constants = curObj;
                continue;
            }
            else if (key === "Dependencies")
            {
                dependencies = curObj;
                continue;
            }

            //not a special enum, go build an entry for it and add it to its respective caches
            var enumEntry = buildEnumEntry(curObj, key, moduleEntry)
            if (enumEntry != null)
            {
                var lowerKey = key.toLowerCase();
                newEntries[lowerKey] = enumEntry;
                _enumCache[lowerKey] = enumEntry;
            }
        }

        moduleEntry.enumEntries = newEntries;
        moduleEntry.module = newModuleObj;
        moduleEntry.constants = buildEnumEntry(constants, "Constants", moduleEntry);
        moduleEntry.dependencies = buildEnumEntry(dependencies, "Dependencies", moduleEntry);;
    };

    /**Builds an EnumEntry for the given object.
    @param {Object} enumObj The enum constants table.
    @param {String} name The name of the enum.
    @param {ModuleEntry} moduleEntry The module that contains the enum.
    @returns {EnumEntry}*/
    var buildEnumEntry = function (enumObj, name, moduleEntry)
    {
        if (enumObj == null) return null;

        var enumEntry = new EnumEntry();
        enumEntry.name = name;
        enumEntry.module = moduleEntry;
        enumEntry.enumObj = enumObj;

        var enumKeys = Object.keys(enumObj);
        var numKeys = enumKeys.length;
        for (var x = 0; x < numKeys; x++)
        {
            var curKey = enumKeys[x];
            var curValue = enumObj[curKey];

            enumEntry.values[curKey.toLowerCase()] = curValue;
        }

        return enumEntry;
    };

    /**Helper method to get an EnumEntry from the cache.
    @param {String} enumName The name of the enum to get.
    @returns {EnumEntry}*/
    var getEnumEntry = function (enumName)
    {
        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(enumName) === true) return undefined;
        return _enumCache[enumName];
    };

    /**Helper method to get the ModuleEntry from the cache.
    @param {String} moduleName The name of the module to get.
    @returns {ModuleEntry} */
    var getModuleEntry = function (moduleName)
    {
        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(moduleName) === true) return undefined;
        return _moduleCache[moduleName];
    }

    /**Object for holding cached details about a Module.
    @class*/
    var ModuleEntry = function ()
    {
        /**String. The name of the module.
        @type {String}*/
        this.name = null;

        /**Object. The actual Module object.
        @type {Object}*/
        this.module = null;

        /**Object. The EnumEntry for the Constants table in the Module.
        @type {EnumEntry}*/
        this.constants = null;

        /**Object. The EnumEntry for the Dependencies table in the Module.
        @type {EnumEntry}*/
        this.dependencies = null;

        /**Object. Lookup dictionary of all enums in the module. The keys are the lower-case names of the enums, the values are EnumEntries.
        @type {Object}*/
        this.enumEntries = {};
    };

    /**Helper method for getting an EnumEntry from a ModuleEntrty.
    @param {String} enumName The name of the enum to get.
    @returns {EnumEntry}*/
    ModuleEntry.prototype.getEnumEntry = function (enumName)
    {
        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(enumName) === true) return undefined;
        return this.enumEntries[enumName];
    }

    /**Object for holding cached information about an enum and its members.
    @class*/
    var EnumEntry = function ()
    {
        /**Object. The ModuleEntry of the module that contains this enum.
        @type {ModuleEntry}*/
        this.module = null;

        /**String. The name of the enum as it appears in the code.
        @type {String}*/
        this.name = null;

        /**Object. The actual enum object reference.
        @type {Object}*/
        this.enumObj = null;

        /**Object. A case-corrected dictionary of enum value keys to their values in the enum.
        @type {Object}*/
        this.values = {};
    };

    /**Object for holdig the parse results of an arbitrary string path for an enum or an enum value.
    @class*/
    var ParsedEnumPath = function ()
    {
        /**String. The name of the value to get in the enum to get.
        @type {String}*/
        this.enumValueKey = null;

        /**Object. The enum that contains the value being retrieved.
        @type {EnumEntry}*/
        this.enumEntry = null;

        /**Object. The module that contains the value being retrieved.
        @type {ModuleEntry}*/
        this.moduleEntry = null;
    };
};

/**Static instance of the EnumValueGetter.
@type {EVUI.Modules.Enums.EnumValueGetter}*/
EVUI.Modules.Enums.ValueGetter = null;
(function ()
{
    var getter = null;
    Object.defineProperty(EVUI.Modules.Enums, "ValueGetter", {
        get: function ()
        {
            if (getter == null) getter = new EVUI.Modules.Enums.EnumValueGetter();
            return getter;
        },
        configurable: false,
        enumerable: true
    });
})();

/**Constructor reference for the EnumValueGetter.*/
EVUI.Constructors.Enums = EVUI.Modules.Enums.EnumValueGetter;

/**Gets either an enum object or a value from an enum object.
@param {String|Object} enumNameOrModule Either the path to an enum, an enum's name, a module object, or the name of a module.
@param {String} enumKeyOrName Optional. Either the name/path of the enum (if the first parameter was a module) object and its value.
@param {String} enumKey Optional. The key of the value to get from the enum.
@returns {Any}*/
$evui.enum = function (enumNameOrModule, enumKeyOrName, enumKey)
{
    return EVUI.Modules.Enums.ValueGetter.getEnumValue(enumNameOrModule, enumKeyOrName, enumKey);
};

/**Gets a constant value from a module's Constants table.
@param {String} moduleName The name of the module to get the constant from.
@param {String} constValueName The name of the constant value to get.
@returns {Any}*/
$evui.const = function (moduleName, constValueName)
{
    return EVUI.Modules.Enums.ValueGetter.getConstant(moduleName, constValueName);
};

/**Gets a module object based on its name.
@param {String} moduleName The name of the module to get.
@returns {Object}*/
$evui.module = function (moduleName)
{
    return EVUI.Modules.Enums.ValueGetter.getModule(moduleName);
};

Object.freeze(EVUI.Modules.Enums);