/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

/*#INCLUDES#*/

/*#BEGINWRAP(EVUI.Modules.HtmlLoader|HtmlLoader)#*/
/*#REPLACE(EVUI.Modules.HtmlLoader|HtmlLoader)#*/

/**Module for containing a EventStream-driven Html partial/placeholder loader that loads foreign Html via Http.
@module*/
EVUI.Modules.HtmlLoader = {};

/*#MODULEDEF(HtmlLoader|"1.0";|"HtmlLoader")#*/
/*#VERSIONCHECK(EVUI.Modules.HtmlLoader|HtmlLoader)#*/

EVUI.Modules.HtmlLoader.Dependencies =
{
    Core: Object.freeze({ version: "1.0", required: true }),
    EventStream: Object.freeze({ version: "1.0", required: true }),
    Http: Object.freeze({ version: "1.0", required: true })
};

(function ()
{
    var checked = false;

    Object.defineProperty(EVUI.Modules.HtmlLoader.Dependencies, "checked",
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

Object.freeze(EVUI.Modules.HtmlLoader.Dependencies);

EVUI.Modules.HtmlLoader.Constants = {};

EVUI.Modules.HtmlLoader.Constants.Job_GetHtml = "evui.htmlLoader.getHtml";
EVUI.Modules.HtmlLoader.Constants.Job_InjectHtml = "evui.htmlLoader.injectHtml";
EVUI.Modules.HtmlLoader.Constants.Job_LoadChildren = "evui.htmlLoader.loadChildren";

EVUI.Modules.HtmlLoader.Constants.Attr_PlaceholderID = "evui-loader-placeholder-id";
EVUI.Modules.HtmlLoader.Constants.Attr_ResourceUrl = "evui-loader-placeholder-src";
EVUI.Modules.HtmlLoader.Constants.Attr_ContentLoadState = "evui-loader-content-load-state";

EVUI.Modules.HtmlLoader.Constants.Event_OnBeforePlaceholderLoad = "evui.htmlLoader.onBeforeLoad";
EVUI.Modules.HtmlLoader.Constants.Event_OnGetPlaceholderHtml = "evui.htmlLoader.onGetPlaceholderHtml";
EVUI.Modules.HtmlLoader.Constants.Event_OnPlaceholderInject = "evui.htmlLoader.onInject";
EVUI.Modules.HtmlLoader.Constants.Event_OnBeforeLoadPlaceholderChildren = "evui.htmlLoader.onBeforeLoadChildren";
EVUI.Modules.HtmlLoader.Constants.Event_OnPlaceholderLoaded = "evui.htmlLoader.onPlaceholderLoaded";
EVUI.Modules.HtmlLoader.Constants.Event_OnAllPlaceholdersLoaded = "evui.hmlLoader.onAllPlaceholdersLoaded"

/**Callback function that is called when Html is returned from a web request.
@param {String} html: The Html returned from the web request.*/
EVUI.Modules.HtmlLoader.Constants.Fn_GetHtml_Callback = function (html) { };

/**Callback function that is called when a collection of Html partials have all been loaded.
@param {EVUI.Modules.HtmlLoader.HtmlPartialLoadRequest[]} loadRequests An array of EVUI.Modules.HtmlLoaderController.HtmlPartialLoadRequest representing all the requests that have completed (successfully or not).*/
EVUI.Modules.HtmlLoader.Constants.Fn_GetPartials_Callback = function (loadRequests) { };

/**Callback function that is called when a html placeholder has been completely loaded and injected into the DOM.
 @param {EVUI.Modules.HtmlLoader.HtmlPlaceholder} placeholderResult The details of the completed placeholder load.*/
EVUI.Modules.HtmlLoader.Constants.Fn_GetPlaceholder_Callback = function (placeholderResult) { }

Object.freeze(EVUI.Modules.HtmlLoader.Constants)

/**Controller for loading HTML, either as a bunch of small partial pieces of HTML or for loading larger placeholders which can also contain placeholders.
 @class*/
EVUI.Modules.HtmlLoader.HtmlLoaderController = function (services)
{
    if (EVUI.Modules.Core == null) throw Error("Dependency missing: EVUI.Modules.Core is required.");
    EVUI.Modules.Core.Utils.requireAll(EVUI.Modules.HtmlLoader.Dependencies);

    //self reference for closures
    var _self = this;

    /**The services used by the HtmlLoaderController.
    @type {EVUI.Modules.HtmlLoader.HtmlLoaderControllerServices}*/
    var _services = services;

    /**A counter to generate ID's for each load session.
    @type {Number}*/
    var _sessionIdCtr = 0;

    /**Makes a simple GET request to get Html. The request defaults to a GET with a response type of "text". If a different response type is used, the result is translated back into a string.
    @param {EVUI.Modules.HtmlLoader.HtmlRequestArgs} htmlRequestArgsOrUrl The Url of the html or the arguments for getting the Html.
    @param {EVUI.Modules.HtmlLoader.Constants.Fn_GetHtml_Callback} getHtmlCallback  A function to call once the server has completed the request, takes the string version of whatever was returned as a parameter. */
    this.loadHtml = function (htmlRequestArgsOrUrl, getHtmlCallback)
    {
        if (htmlRequestArgsOrUrl == null) throw Error("htmlRequestArgsOrUrl cannot be null.");

        if (typeof getHtmlCallback !== "function") getHtmlCallback = function (html) { };

        if (typeof htmlRequestArgsOrUrl === "string")
        {
            var url = htmlRequestArgsOrUrl;
            htmlRequestArgsOrUrl = new EVUI.Modules.HtmlLoader.HtmlRequestArgs();
            htmlRequestArgsOrUrl.url = url;
        }

        var htmlArgs = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.HtmlLoader.HtmlRequestArgs(), htmlRequestArgsOrUrl);
        htmlArgs.httpArgs = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Http.HttpRequestArgs(), htmlArgs.httpArgs);

        htmlArgs.httpArgs.responseType = "text";
        htmlArgs.httpArgs.method = "GET";
        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(htmlArgs.url) === false) htmlArgs.httpArgs.url = htmlArgs.url;

        _services.httpManager.executeRequest(htmlArgs.httpArgs, function (completedRequest)
        {
            if (completedRequest.error != null)
            {
                EVUI.Modules.Core.Utils.log(completedRequest.error.getErrorMessage());
                return getHtmlCallback(null);
            }

            translateResponseToText(completedRequest.xmlHttpRequest, function (textResult)
            {
                return getHtmlCallback(textResult);
            });
        });
    };

    /**Awaitable. Makes a simple GET request to get html. The request defaults to a GET with a response type of "text". If a different response type is used, the result is translated back into a string.
    @param {String|EVUI.Modules.HtmlLoader.HtmlRequestArgs} htmlRequestArgsOrUrl  The Url of the html or the arguments for getting the Html.
    @returns {Promise<String>}*/
    this.loadHtmlAsync = function (htmlRequestArgsOrUrl)
    {
        if (htmlRequestArgsOrUrl == null) throw new Error("htmlRequestArgsOrUrl cannot be null.");

        return new Promise(function (resolve)
        {
            _self.loadHtml(htmlRequestArgsOrUrl, function (textResult)
            {
                resolve(textResult);
            })
        });
    };

    /**Loads an array of PartialLoadRequeusts either as a standalone array or as part of a HtmlPartalLoadArgs object.
    @param {EVUI.Modules.HtmlLoader.HtmlPartialLoadArgs|EVUI.Modules.HtmlLoader.HtmlPartialLoadRequest[]} partialLoadArgsOrPartialRequests Either an array of HtmlPartialLoadRequests or a HtmlPartialLoadArgs object.
    @param {EVUI.Modules.HtmlLoader.Constants.Fn_GetPartials_Callback} loadedCallback A callback that is fired once all the Html partials have been loaded.*/
    this.loadHtmlPartials = function (partialLoadArgsOrPartialRequests, loadedCallback)
    {
        if (partialLoadArgsOrPartialRequests == null) throw new Error("partialLoadArgsOrPartialRequests cannot be null.");

        loadHtmlPartials(partialLoadArgsOrPartialRequests, loadedCallback);
    };

    /**Awaitable. Loads an array of PartialLoadRequeusts either as a standalone array or as part of a HtmlPartalLoadArgs object.
    @param {EVUI.Modules.HtmlLoader.HtmlPartialLoadArgs|EVUI.Modules.HtmlLoader.HtmlPartialLoadRequest[]} partialLoadArgsOrPartialRequests Either an array of HtmlPartialLoadRequests or a HtmlPartialLoadArgs object.
    @returns {Promise<EVUI.Modules.HtmlLoader.HtmlPartialLoadRequest[]>}.*/
    this.loadHtmlPartialsAsync = function (partialLoadArgsOrPartialRequests)
    {
        if (partialLoadArgsOrPartialRequests == null) throw new Error("partialLoadArgsOrPartialRequests cannot be null.");

        return new Promise(function (resolve)
        {
            loadHtmlPartials(partialLoadArgsOrPartialRequests, function (allRequests)
            {
                resolve(allRequests);
            });
        });
    };

    /**Loads an array of PartialLoadRequeusts either as a standalone array or as part of a HtmlPartalLoadArgs object.
    @param {EVUI.Modules.HtmlLoader.HtmlPartialLoadArgs|EVUI.Modules.HtmlLoader.HtmlPartialLoadRequest[]} partialLoadArgsOrPartialRequests Either an array of HtmlPartialLoadRequests or a HtmlPartialLoadArgs object.
    @param {EVUI.Modules.HtmlLoader.Constants.Fn_GetPartials_Callback} loadedCallback A callback that is fired once all the Html partials have been loaded.*/
    var loadHtmlPartials = function (partialLoadArgsOrPartialRequests, allLoadedCallback)
    {
        if (typeof allLoadedCallback !== "function") allLoadedCallback = function (partialLoadResponses) { };

        if (EVUI.Modules.Core.Utils.isArray(partialLoadArgsOrPartialRequests) === true) //we were handed an array of what should be EVUI.Modules.HtmlPartialLoadRequests, make an arguments object to hold them
        {
            var partialLoads = partialLoadArgsOrPartialRequests;
            partialLoadArgsOrPartialRequests = new EVUI.Modules.HtmlLoader.HtmlPartialLoadArgs();
            partialLoadArgsOrPartialRequests.htmlPartialLoadRequests = partialLoads;
        }

        var totalRequests = [];
        var returnedRequests = [];

        //make a safe copy of the arguments to pass into each event stream
        var partialsArgs = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.HtmlLoader.HtmlPartialLoadArgs(), partialLoadArgsOrPartialRequests);
        partialsArgs.httpArgs = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Http.HttpRequestArgs(), partialsArgs.httpArgs);

        //no load requests, something is wrong, just return.
        if (partialsArgs.htmlPartialLoadRequests.length === 0) return callback([]);

        var getPartial = function (partialLoadRequest)
        {
            var httpArgs = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Http.HttpRequestArgs(), partialsArgs.httpArgs);
            httpArgs.context = partialLoadRequest;
            httpArgs.method = "GET";
            httpArgs.responseType = "text";
            httpArgs.url = httpArgs.context.url;

            totalRequests.push(httpArgs.context);

            _services.httpManager.executeRequest(httpArgs, function (completedRequest)
            {
                translateResponseToText(completedRequest.xmlHttpRequest, function (resultText)
                {
                    partialLoadRequest.html = resultText;
                    returnedRequests.push(partialLoadRequest);

                    if (returnedRequests.length === totalRequests.length)
                    {
                        return allLoadedCallback(returnedRequests);
                    }
                })
            });
        };

        //launch all requests in parallel
        var numPartials = partialsArgs.htmlPartialLoadRequests.length;
        for (var x = 0; x < numPartials; x++)
        {
            getPartial(partialsArgs.htmlPartialLoadRequests[x]);
        }
    };

    /**Translates a HTTP response into text.
    @param {XMLHttpRequest} response The XMLHttpRequest used to make the request.
    @param {Function} callback A callback function that contains the translated value.*/
    var translateResponseToText = function (response, callback)
    {
        if (response == null || response.response == null || !((response.status >= 200 && response.status < 300) || response.status === 304)) return callback(null);

        try
        {
            switch (response.responseType)
            {
                case "json":
                    return callback(JSON.stringify(response.response));
                case "document":
                    return callback(response.response.documentElement.outerHTML);
                case "blob":
                case "arraybuffer":
                    var blob = (response.responseType === "blob") ? response.response : new Blob([response.response]);
                    var fr = new FileReader();
                    fr.onload = function ()
                    {
                        return callback(fr.result);
                    }

                    fr.readAsText(blob);
                    break;
                case "text":
                default:
                    return callback(response.response);
            }
        }
        catch (ex)
        {
            return EVUI.Modules.Core.Utils.debugReturn("EVUI.Modules.HtmlLoaderController.Manager", "translateResponseToText", ex.stack, null);
        }
    };

    /**Loads a placeholder and all of its children and injects it into the DOM.
    @param {EVUI.Modules.HtmlLoader.HtmlPlaceholderLoadArgs|String} placeholderIDOrArgs The value of a PlaceholderID attribute or a graph of HtmlPlaceholderLoadArgs.
    @param {EVUI.Modules.HtmlLoader.Constants.Fn_GetPlaceholder_Callback} callback A callback function that is executed once the placeholder load operation is complete.*/
    this.loadPlaceholder = function (placeholderIDOrArgs, callback)
    {
        loadPlaceholder(placeholderIDOrArgs, callback);
    };

    /**Awaitable. Loads a placeholder and all of its children and injects them into the DOM.
    @param {EVUI.Modules.HtmlLoader.HtmlPlaceholderLoadArgs|String} placeholderIDOrArgs The value of a EVUI.Modules.HtmlLoaderController.Constants.Attr_PlaceholderID attribute or a graph of HtmlPlaceholderLoadArgs.
    @returns {Promise<EVUI.Modules.HtmlLoader.HtmlPlaceholder>}*/
    this.loadPlaceholderAsync = function (placeholderIDOrArgs)
    {
        return new Promise(function (resolve)
        {
            loadPlaceholder(placeholderIDOrArgs, function (result)
            {
                resolve(result);
            });
        });
    };

    /**Loads all placeholders currently in the document (elements with the EVUI.Modules.HtmlLoaderController.Constants.Attr_PlaceholderID attribute present with a non-empty string value) in parallel, but excludes those that are flagged as being loaded upon on demand.
    @param {EVUI.Modules.HtmlLoader.HtmlPlaceholderLoadArgs} placehoderLoadArgs The arguments for loading all the placeholders currently in the document.
    @param {EVUI.Modules.HtmlLoader.Constants.Fn_GetPlaceholder_Callback} callback A callback function that is called once all the placeholders in the document have been loaded and injected into the DOM.*/
    this.loadAllPlaceholders = function (placehoderLoadArgs, callback)
    {
        loadAllPlaceholders(placehoderLoadArgs, callback);
    };

    /**Loads all placeholders currently in the document (elements with the EVUI.Modules.HtmlLoaderController.Constants.Attr_PlaceholderID attribute present with a non-empty string value) in parallel, but excludes those that are flagged as being loaded upon on demand.
    @param {EVUI.Modules.HtmlLoader.HtmlPlaceholderLoadArgs} placehoderLoadArgs The arguments for loading all the placeholders currently in the document.
    @returns {Promise<EVUI.Modules.HtmlLoader.HtmlPlaceholder>} callback A callback function that is called once all the placeholders in the document have been loaded and injected into the DOM.*/
    this.loadAllPlaceholdersAsync = function (placehoderLoadArgs)
    {
        return new Promise(function (resolve)
        {
            loadAllPlaceholders(placehoderLoadArgs, function (results)
            {
                resolve(results);
            })
        })
    }

    /**Internal implementation of loading all placeholders currently present in the document (and optionally, all their children). 
    @param {EVUI.Modules.HtmlLoader.HtmlPlaceholderLoadArgs|String} placeholderLoadArgs The value of a EVUI.Modules.HtmlLoaderController.Constants.Attr_PlaceholderID attribute or a graph of HtmlPlaceholderLoadArgs.
    @param {EVUI.Modules.HtmlLoader.Constants.Fn_GetPlaceholder_Callback} callback A callback function that is executed once the placeholder load operation is complete.*/
    var loadAllPlaceholders = function (placeholderLoadArgs, callback)
    {
        if (typeof placeholderLoadArgs === "string")
        {
            var placeholderID = placeholderLoadArgs;
            placeholderLoadArgs = new EVUI.Modules.HtmlLoader.HtmlPlaceholderLoadArgs();
            placeholderLoadArgs.placeholderID = placeholderID;
        }
        else
        {
            //make a safe copy of the args to work with
            placeholderLoadArgs = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.HtmlLoader.HtmlPlaceholderLoadArgs(), placeholderLoadArgs);
            placeholderLoadArgs.httpArgs = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Http.HttpRequestArgs(), placeholderLoadArgs.httpArgs);
        }

        //make the "master" event stream that'll organize the flow for all the parallel event streams it will spawn.
        var es = new EVUI.Modules.EventStream.EventStream();
        es.context = placeholderLoadArgs;

        es.canSeek = false; //no seeking allowed in this case, will cause issues.

        var loaded = []; //all the loaded HtmlPartialLoadResults from the top level of the document
        var launched = []; //all the child sessions that were launched
        var elements = null;

        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(placeholderLoadArgs.placeholderID) === false)
        {
            elements = new EVUI.Modules.Dom.DomHelper("[" + EVUI.Modules.HtmlLoader.Constants.Attr_PlaceholderID + "=\"" + placeholderLoadArgs.placeholderID + "\"]", null).elements;
        }
        else
        {
            elements = getLoadableElements(null, placeholderLoadArgs.forceReload, placeholderLoadArgs.ignoreOnDemand);
        }

        //make the "master session" to be the parent to all the child sessions so they don't fire the OnAllPlaceholderLoad events and so the event args generation works correctly.
        var masterSession = new PlaceholderLoadSession();
        masterSession.allChildPlaceholders = elements;
        masterSession.eventStream = es;
        masterSession.loadResults = loaded;
        masterSession.placeholderArgs = placeholderLoadArgs;
        masterSession.placeholderID = "*"; //no placeholder ID as we are doing the whole document
        masterSession.placeholderElement = placeholderLoadArgs.contextElement == null ? placeholderLoadArgs.contextElement : document.documentElement; //no placeholder element as we have multiple root elements, so we just use the document to make the Html loader's event args constructor happy

        //set the common properties on the event stream so it behaves like the normal one when it's raising events
        setUpEventStream(masterSession, callback);

        //make a "dummy" step that launches all placeholder load requests in parallel and doesn't complete until they are all fully loaded.
        es.addJob(function (args)
        {
            var numEles = elements.length;
            for (var x = 0; x < numEles; x++)
            {
                var curEle = elements[x];
                var attrs = EVUI.Modules.Core.Utils.getElementAttributes(curEle);
                var placeholderID = attrs.getValue(EVUI.Modules.HtmlLoader.Constants.Attr_PlaceholderID);

                if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(placeholderID) === true) continue; //no placeholderID = no load

                var childSession = makePlaceholderLoadSession(curEle, masterSession.placeholderArgs, masterSession, function (loadResult) //try and make a session, if something is wrong this will return null (like a circular reference)
                {
                    loaded.push(loadResult);
                    if (loaded.length === launched.length) //once our queued requests and returned requests arrays are the same length we are done.
                    {
                        return args.resolve();
                    }
                });

                if (childSession == null) continue;
                launched.push(curEle);

                if (masterSession.childSessions == null) masterSession.childSessions = [];
                masterSession.childSessions.push(childSession);

                childSession.eventStream.execute(); //begin the loading process
            }

            masterSession.allChildPlaceholders = launched;
            masterSession.loadResults = loaded;

            if (launched.length === 0) //nothing was launched, bail on the whole operation
            {
                return args.cancel();
            }
        });

        //add the final events to the event stream so it fires them off as if it were a normal multi-part placeholder load
        addOnAllPlaceholderLoadedEvents(masterSession);

        //go!
        es.execute();
    };

    /**Loads a placeholder and all of its children and injects it into the DOM.
    @param {EVUI.Modules.HtmlLoader.HtmlPlaceholderLoadArgs|String} placeholderIDOrArgs The value of a PlaceholderID attribute or a graph of HtmlPlaceholderLoadArgs.
    @param {EVUI.Modules.HtmlLoader.Constants.Fn_GetPlaceholder_Callback} callback A callback function that is executed once the placeholder load operation is complete.*/
    var loadPlaceholder = function (placeholderIDOrArgs, callback)
    {
        if (typeof placeholderIDOrArgs === "string")
        {
            var placeholderID = placeholderIDOrArgs;
            placeholderIDOrArgs = new EVUI.Modules.HtmlLoader.HtmlPlaceholderLoadArgs();
            placeholderIDOrArgs.placeholderID = placeholderID;
        }

        var loadSession = makePlaceholderLoadSession(placeholderIDOrArgs.placeholderID, placeholderIDOrArgs, null, function (completed)
        {
            if (typeof callback === "function") callback(completed);
        });

        if (loadSession == null)
        {
            if (typeof callback === "function") return callback(null);
        }

        loadSession.eventStream.execute();
    };

    /**Gets the first element that has the given placeholderID under the contextElement.
    @param {String} placeholderID The ID of the placeholder node to get.
    @param {Element} contextElement A context element to limit the scope of the search.
    @returns {Element}*/
    var getPlaceholderElement = function (placeholderID, contextElement)
    {
        var byPlaceholderID = new EVUI.Modules.Dom.DomHelper("[" + EVUI.Modules.HtmlLoader.Constants.Attr_PlaceholderID + "=\"" + placeholderID + "\"]", contextElement);
        if (byPlaceholderID.first() != null) return byPlaceholderID.first();

        var byUrl = new EVUI.Modules.Dom.DomHelper("[" + EVUI.Modules.HtmlLoader.Constants.Attr_ResourceUrl + "=\"" + placeholderID + "\"]", contextElement);
        return byUrl.first();
    };

    /**Takes the returned list of child placeholders from the event args and passes it back to the EventStream in progress.
    @param {Element[]} selectedArray The array of selected child elements to load.
    @returns {Node[]} */
    var getSelectedChildPlaceholders = function (selectedArray)
    {
        var returnArray = [];
        if (EVUI.Modules.Core.Utils.isArray(selectedArray) === false) return returnArray;

        var numSelected = selectedArray.length;
        for (var x = 0; x < numSelected; x++)
        {
            var curSelected = selectedArray[x];
            if (EVUI.Modules.Core.Utils.isElement(curSelected) === true) returnArray.push(curSelected);
        }

        return returnArray;
    };

    /**Gets all the Dom that have the PlaceholderID attribute on them.
    @param {Node} context A context limiting node to search inside of.
    @returns {Element[]}*/
    var getChildLoadElements = function (context)
    {
        //first, get everything that has a placeholderID
        var eh = new EVUI.Modules.Dom.DomHelper("[" + EVUI.Modules.HtmlLoader.Constants.Attr_PlaceholderID + "],[" + EVUI.Modules.HtmlLoader.Constants.Attr_ResourceUrl + "],[" + EVUI.Modules.HtmlLoader.Constants.Attr_PlaceholderID + "][" + EVUI.Modules.HtmlLoader.Constants.Attr_ResourceUrl + "]", context);
        var eles = eh.elements.slice();

        //make sure they all have placeholder ID attributes - if they don't just use the URL as the placeholderID.
        var numEles = eles.length;
        for (var x = 0; x < numEles; x++)
        {
            var curEle = eles[x];
            if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(curEle.getAttribute(EVUI.Modules.HtmlLoader.Constants.Attr_PlaceholderID)) === true) curEle.setAttribute(EVUI.Modules.HtmlLoader.Constants.Attr_PlaceholderID, curEle.getAttribute(EVUI.Modules.HtmlLoader.Constants.Attr_ResourceUrl))
        }

        return eles;
    };

    /**Gets all the elements that should be loaded beneath a given element.
    @param {Node} context A context limiting node to search inside of.
    @param {Boolean} forceReload Whether or not to ignore the "loaded" content load state and to reload the content anyways.
    @param {Boolean} ignoreOnDemand Whether or not to ignore the "ondemand" content load state and force the load of the element instead.
    @returns {Element[]} */
    var getLoadableElements = function (context, forceReload, ignoreOnDemand)
    {
        var loadableEles = [];

        var children = getChildLoadElements(context);
        var numChildren = children.length;
        for (var x = 0; x < numChildren; x++)
        {
            var curChild = children[x];
            var attrs = EVUI.Modules.Core.Utils.getElementAttributes(curChild);
            var loadState = attrs.getValue(EVUI.Modules.HtmlLoader.Constants.Attr_ContentLoadState);
            if (loadState != null)
            {
                loadState = loadState.toLowerCase();
                if (loadState === EVUI.Modules.HtmlLoader.HtmlPlaceholderLoadState.Loaded && forceReload !== true) continue;
                if (loadState === EVUI.Modules.HtmlLoader.HtmlPlaceholderLoadState.OnDemand && ignoreOnDemand !== true) continue;
                if (loadState === EVUI.Modules.HtmlLoader.HtmlPlaceholderLoadState.Loading || loadState === EVUI.Modules.HtmlLoader.HtmlPlaceholderLoadState.Pending) continue;
            }

            curChild.setAttribute(EVUI.Modules.HtmlLoader.Constants.Attr_ContentLoadState, EVUI.Modules.HtmlLoader.HtmlPlaceholderLoadState.Pending);

            loadableEles.push(curChild);
        }

        return loadableEles;
    };

    /**Makes a container to hold the details of a recursive placeholder load session.
    @param {String|Element} placeholderID The ID of the placeholder to load or the resolved element to load.
    @param {EVUI.Modules.HtmlLoader.HtmlPlaceholderLoadArgs} sourcePlaceholderLoadArgs The event args to clone and use for the load session.
    @param {PlaceholderLoadSession} parentSession The session that spawned this session.
    @param {EVUI.Modules.HtmlLoader.Constants.Fn_GetPlaceholder_Callback} callback A callback function to call once the placeholder has been fully loaded.
    @returns {PlaceholderLoadSession} */
    var makePlaceholderLoadSession = function (placeholderID, sourcePlaceholderLoadArgs, parentSession, callback)
    {
        var ele = null;
        var anonymousPlaceholder = false;

        //no placeholder ID means none of the below will work, just return null and fail the operation.
        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(placeholderID) === true)
        {
            if (EVUI.Modules.Core.Utils.isElement(placeholderID) === true)
            {
                ele = placeholderID;
                placeholderID = ele.getAttribute(EVUI.Modules.HtmlLoader.Constants.Attr_PlaceholderID);
            }
            else if (sourcePlaceholderLoadArgs != null && sourcePlaceholderLoadArgs.httpArgs != null && EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(sourcePlaceholderLoadArgs.httpArgs.url) === false)
            {
                placeholderID = sourcePlaceholderLoadArgs.httpArgs.url;
                anonymousPlaceholder = true;
            }
            else
            {
                throw Error("placeholderID must be a non-whitespace string.");
            }
        }

        var circularRef = false;
        if (parentSession != null) //if we have a parent session we are the child of another session, make sure we don't have some infinite recursion going on
        {
            var lowerPlaceholder = placeholderID.toLowerCase();
            var parent = parentSession;
            while (parent != null)
            {
                if (parent.placeholderID.toLowerCase() === lowerPlaceholder) //this placeholder is loading itself via its parentage, fail the operation
                {
                    circularRef = true;
                    break;
                }

                parent = parent.parentSession;
            }
        }

        //get the element that we will be injecting html into.
        if (ele == null)
        {
            if (parentSession != null && parentSession.loadedFragment != null) //we have a parent session, so we have a recursive load happening, look inside the loaded fragment for the child node
            {
                ele = getPlaceholderElement(placeholderID, parentSession.loadedFragment);
            }
            else if (anonymousPlaceholder === false) //we do not have a child session (or a fragment), use the context node to narrow the search
            {
                ele = getPlaceholderElement(placeholderID, sourcePlaceholderLoadArgs.contextElement);
            }
        }

        //no element, nowhere to stick html - make a dummy div to load into if we have a valid URL to get HTML from.
        if (ele == null)
        {
            if (sourcePlaceholderLoadArgs != null && sourcePlaceholderLoadArgs.httpArgs != null && EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(sourcePlaceholderLoadArgs.httpArgs.url) === false)
            {
                var loadDiv = document.createElement("div");
                loadDiv.setAttribute(EVUI.Modules.HtmlLoader.Constants.Attr_PlaceholderID, placeholderID);
                loadDiv.setAttribute(EVUI.Modules.HtmlLoader.Constants.Attr_ResourceUrl, sourcePlaceholderLoadArgs.httpArgs.url);

                ele = loadDiv;
            }
            else
            {
                throw Error("Cannot load placeholder - no placeholderID or loadable resource url present.")
            }
        }

        if (circularRef === true) //we had a circular reference - flag the element and move on without blowing up the browser. NOTE IT IS STILL POSSIBLE TO HAVE A CIRCULAR REFERENCE LOOP VIA URLS. The server may or may not return something different for the same url, so we can't use urls for this check. Also, the http event args lets the user change the url.
        {
            ele.setAttribute(EVUI.Modules.HtmlLoader.Constants.Attr_ContentLoadState, EVUI.Modules.HtmlLoader.HtmlPlaceholderLoadState.CircularReference);
            return callback(null);
        }

        //clone the arguments for this session.
        var newArgs = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.HtmlLoader.HtmlPlaceholderLoadArgs(), sourcePlaceholderLoadArgs);
        newArgs.httpArgs = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Http.HttpRequestArgs(), newArgs.httpArgs);
        newArgs.httpArgs.headers = newArgs.httpArgs.headers.map(function (header) { return EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Http.HttpRequestHeader(), header); });
        newArgs.PlaceholderID = placeholderID;

        var session = new PlaceholderLoadSession();
        session.placeholder = new EVUI.Modules.HtmlLoader.HtmlPlaceholder(session);
        session.parentSession = parentSession;
        session.placeholderArgs = newArgs;
        session.placeholderElement = ele;
        session.placeholderID = placeholderID;
        session.eventStream = buildEventStream(session, callback);

        if (parentSession != null)
        {
            if (parentSession.childSessions == null) parentSession.childSessions = [];
            parentSession.childSessions.push(session);
        }

        session.loadState = EVUI.Modules.HtmlLoader.HtmlPlaceholderLoadState.Pending;
        return session;
    };

    /**Sets up the basic properties of an EventStream for the placeholder loader.
    @param {PlaceholderLoadSession} session Context data about the placeholder load operation in progress.*/
    var setUpEventStream = function (session, callback)
    {
        //set the event state to be whatever the context was
        session.eventStream.eventState = session.placeholderArgs.context;

        //make a factory for creating the special event arguments for the partial loader.
        session.eventStream.processInjectedEventArgs = function (eventArgs)
        {
            var htmlArgs = new EVUI.Modules.HtmlLoader.HtmlPlaceholderLoadEventArgs();
            htmlArgs.cancel = eventArgs.cancel;
            htmlArgs.pause = eventArgs.pause;
            htmlArgs.resume = eventArgs.resume;
            htmlArgs.stopPropagation = eventArgs.stopPropagation;
            htmlArgs.context = eventArgs.state;
            htmlArgs.key = eventArgs.key + ((eventArgs.stepType === EVUI.Modules.EventStream.EventStreamStepType.GlobalEvent) ? ".global" : "");
            htmlArgs.placeholder = session.placeholder;

            return htmlArgs;
        };

        //set up the logic for handling the filtration of child members by the user
        session.eventStream.processReturnedEventArgs = function (htmlArgs, handlerResult, step)
        {
            if (step.key === EVUI.Modules.HtmlLoader.Constants.Event_OnBeforeLoadPlaceholderChildren)
            {
                session.selectedChildPlaceholders = getSelectedChildPlaceholders(session.allChildPlaceholders);
            }
        };

        //set up the final callback
        session.eventStream.onComplete = function ()
        {
            if (typeof callback === "function")
            {
                return callback(session.placeholder);
            }
        };

        session.eventStream.onError = function (errorArgs, error)
        {
            EVUI.Modules.Core.Utils.log(error.getErrorMessage());
        };
    };

    /**Adds the "OnBeforeLoad" events that give the user an opportunity to bail on the whole operation or modify the http args.
    @param {PlaceholderLoadSession} session Context data about the placeholder load operation in progress. */
    var addOnBeforeLoadEvents = function (session)
    {
        session.eventStream.addStep(
            {
                key: EVUI.Modules.HtmlLoader.Constants.Event_OnBeforePlaceholderLoad,
                name: "onBeforePlaceholderLoad",
                type: EVUI.Modules.EventStream.EventStreamStepType.Event,
                handler: function (eventArgs)
                {
                    if (typeof session.placeholderArgs.onBeforePlaceholderLoad === "function")
                    {
                        return session.placeholderArgs.onBeforePlaceholderLoad(eventArgs);
                    }
                }
            });

        session.eventStream.addStep(
            {
                key: EVUI.Modules.HtmlLoader.Constants.Event_OnBeforePlaceholderLoad,
                name: "onBeforePlaceholderLoad",
                type: EVUI.Modules.EventStream.EventStreamStepType.GlobalEvent,
                handler: function (eventArgs)
                {
                    if (typeof _self.onBeforePlaceholderLoad === "function")
                    {
                        return _self.onBeforePlaceholderLoad(eventArgs);
                    }
                }
            });
    };

    /**Adds the "OnBeforeLoadChildren" events that give the user an opportunity to filter the list of child placeholders that will be loaded.
    @param {PlaceholderLoadSession} session Context data about the placeholder load operation in progress. */
    var addOnBeforeLoadChildrenEvents = function (session)
    {
        session.eventStream.addStep(
            {
                key: EVUI.Modules.HtmlLoader.Constants.Event_OnBeforeLoadPlaceholderChildren,
                name: "onBeforeLoadPlaceholderChildren",
                type: EVUI.Modules.EventStream.EventStreamStepType.Event,
                handler: function (eventArgs)
                {
                    if (typeof session.placeholderArgs.onBeforeLoadPlaceholderChildren === "function")
                    {
                        return session.placeholderArgs.onBeforeLoadPlaceholderChildren(eventArgs);
                    }
                }
            });

        session.eventStream.addStep(
            {
                key: EVUI.Modules.HtmlLoader.Constants.Event_OnBeforeLoadPlaceholderChildren,
                name: "onBeforeLoadPlaceholderChildren",
                type: EVUI.Modules.EventStream.EventStreamStepType.GlobalEvent,
                handler: function (eventArgs)
                {
                    if (typeof _self.onBeforeLoadPlaceholderChildren === "function")
                    {
                        return _self.onBeforeLoadPlaceholderChildren(eventArgs);
                    }

                }
            });
    };

    /**Adds the "OnInject" events that give the user an opportunity to modify the document fragment before it is injected into it's parent.
    @param {PlaceholderLoadSession} session Context data about the placeholder load operation in progress. */
    var addOnInjectEvents = function (session)
    {
        session.eventStream.addStep(
            {
                key: EVUI.Modules.HtmlLoader.Constants.Event_OnPlaceholderInject,
                name: "onPlaceholderInject",
                type: EVUI.Modules.EventStream.EventStreamStepType.Event,
                handler: function (eventArgs)
                {
                    if (typeof session.placeholderArgs.onPlaceholderInject === "function")
                    {
                        return session.placeholderArgs.onPlaceholderInject(eventArgs);
                    }
                }
            });

        session.eventStream.addStep(
            {
                key: EVUI.Modules.HtmlLoader.Constants.Event_OnPlaceholderInject,
                name: "onPlaceholderInject",
                type: EVUI.Modules.EventStream.EventStreamStepType.GlobalEvent,
                handler: function (eventArgs)
                {
                    if (typeof _self.onPlaceholderInject === "function")
                    {
                        return _self.onPlaceholderInject(eventArgs);
                    }
                }
            });
    };

    /**Adds the "OnPlaceholderLoaded" events that give the user an opportunity to inspect/react to the final loaded result in the session's parent.
    @param {PlaceholderLoadSession} session Context data about the placeholder load operation in progress. */
    var addOnPlaceholderLoadedEvents = function (session)
    {
        session.eventStream.addStep(
            {
                key: EVUI.Modules.HtmlLoader.Constants.Event_OnPlaceholderLoaded,
                name: "onPlaceholderLoaded",
                type: EVUI.Modules.EventStream.EventStreamStepType.Event,
                handler: function (eventArgs)
                {
                    if (typeof session.placeholderArgs.onPlaceholderLoaded === "function")
                    {
                        return session.placeholderArgs.onPlaceholderLoaded(eventArgs);
                    }
                }
            });

        session.eventStream.addStep(
            {
                key: EVUI.Modules.HtmlLoader.Constants.Event_OnPlaceholderLoaded,
                name: "onPlaceholderLoaded",
                type: EVUI.Modules.EventStream.EventStreamStepType.GlobalEvent,
                handler: function (eventArgs)
                {
                    if (typeof _self.onPlaceholderLoaded === "function")
                    {
                        return _self.onPlaceholderLoaded(eventArgs);
                    }
                }
            });
    };

    /**Adds the "OnAllPlaceholderLoaded" events that fire once the highest parent session has completed loading and signals that the operation is complete.
    @param {PlaceholderLoadSession} session Context data about the placeholder load operation in progress. */
    var addOnAllPlaceholderLoadedEvents = function (session)
    {
        if (session.parentSession == null)
        {
            session.eventStream.addStep(
                {
                    key: EVUI.Modules.HtmlLoader.Constants.Event_OnAllPlaceholdersLoaded,
                    name: "onAllPlaceholdersLoaded",
                    type: EVUI.Modules.EventStream.EventStreamStepType.Event,
                    handler: function (eventArgs)
                    {
                        if (typeof session.placeholderArgs.onAllPlaceholdersLoaded === "function")
                        {
                            return session.placeholderArgs.onAllPlaceholdersLoaded(eventArgs);
                        }
                    }
                });

            session.eventStream.addStep(
                {
                    key: EVUI.Modules.HtmlLoader.Constants.Event_OnAllPlaceholdersLoaded,
                    name: "onAllPlaceholdersLoaded",
                    type: EVUI.Modules.EventStream.EventStreamStepType.GlobalEvent,
                    handler: function (eventArgs)
                    {
                        if (typeof _self.onAllPlaceholdersLoaded === "function")
                        {
                            return _self.onAllPlaceholdersLoaded(eventArgs);
                        }
                    }
                });
        }
    }

    /**Builds the EventStream for the placeholder load operation and attaches all the settings, events, and jobs required to complete the operation.
    @param {PlaceholderLoadSession} session Context data about the placeholder load operation in progress. 
    @returns {EVUI.Modules.EventStream.EventStream}*/
    var buildEventStream = function (session, callback)
    {
        var eventStream = new EVUI.Modules.EventStream.EventStream();
        session.eventStream = eventStream;
        session.eventStream.context = session.placeholderArgs;

        //set basic event stream properties
        setUpEventStream(session, callback);

        addOnBeforeLoadEvents(session);

        //add the "get Html" step that invokes the HttpEventStream to perform the http operation.
        eventStream.addStep(
            {
                key: EVUI.Modules.HtmlLoader.Constants.Job_GetHtml,
                name: "GetHtml",
                type: EVUI.Modules.EventStream.EventStreamStepType.Job,
                handler: function (jobArgs)
                {
                    var placeholderAttrs = EVUI.Modules.Core.Utils.getElementAttributes(session.placeholderElement);
                    var loadState = placeholderAttrs.getValue(EVUI.Modules.HtmlLoader.Constants.Attr_ContentLoadState);

                    //check to make sure the load state isn't already "loaded" - only re-load it if ForceReload is true. Otherwise, just bail and go to the end of the event stream.
                    if (loadState != null && loadState.toLowerCase() === EVUI.Modules.HtmlLoader.HtmlPlaceholderLoadState.Loaded && session.placeholderArgs.forceReload === false)
                    {
                        return jobArgs.cancel();
                    }

                    //get the URL off of the element. It doesn't actually have to be there and can be set/changed in the HttpEventStream's EventStream.
                    var url = placeholderAttrs.getValue(EVUI.Modules.HtmlLoader.Constants.Attr_ResourceUrl);

                    var htmlArgs = new EVUI.Modules.HtmlLoader.HtmlRequestArgs();
                    htmlArgs.url = url;
                    htmlArgs.httpArgs = session.placeholderArgs.httpArgs;

                    _self.loadHtml(htmlArgs, function (html)
                    {
                        if (html != null) //call worked, we got a string back
                        {
                            var docFrag = stringToDocFrag(html); //make  a document fragment out of the string
                            session.loadedFragment = docFrag;
                            session.html = html;
                            session.url = htmlArgs.url

                            if (session.placeholderArgs.recursive === true) //we're doing a recursive load, go get all the children flagged with a placeholder ID
                            {
                                session.allChildPlaceholders = getLoadableElements(docFrag, session.placeholderArgs.forceReload, session.placeholderArgs.ignoreOnDemand);
                                session.selectedChildPlaceholders = session.allChildPlaceholders.slice();
                            }
                            else //no recursion, just use empty arrays to make the event args generator happy
                            {
                                session.allChildPlaceholders = [];
                                session.selectedChildPlaceholders = [];
                            }
                        }

                        return jobArgs.resolve();
                    });
                }
            });

        addOnBeforeLoadChildrenEvents(session);

        //launches a volley of parallel event streams to go and load all the child placeholders of this placeholder. Remains in limbo until all the children are done.
        eventStream.addStep(
            {
                key: EVUI.Modules.HtmlLoader.Constants.Job_LoadChildren,
                name: "LoadChildren",
                type: EVUI.Modules.EventStream.EventStreamStepType.Job,
                handler: function (jobArgs)
                {
                    var numChildSessions = session.selectedChildPlaceholders.length;
                    if (numChildSessions === 0) //no children, just continue to the next step
                    {
                        return jobArgs.resolve();
                    }

                    var actualChildren = [];
                    var numLoaded = 0;

                    for (var x = 0; x < numChildSessions; x++)
                    {
                        var curChild = session.selectedChildPlaceholders[x];
                        var attrs = EVUI.Modules.Core.Utils.getElementAttributes(curChild);

                        var placeholderID = attrs.getValue(EVUI.Modules.HtmlLoader.Constants.Attr_PlaceholderID);
                        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(placeholderID) === true) continue; //no placeholder ID, should not load child (we could, but we wont.)

                        var childSession = makePlaceholderLoadSession(curChild, session.placeholderArgs, session, function (loadResult) //make a child session using this session's arguments
                        {
                            numLoaded++;
                            if (numLoaded === session.childSessions.length) //the loaded results and the number of queued sessions is the same, we're done. This stream can move on to the next step.
                            {
                                jobArgs.resolve();
                            }
                        });

                        if (childSession == null) continue; //for some reason the child session was not created (usually a validation failure)

                        actualChildren.push(curChild);

                        curChild.setAttribute(EVUI.Modules.HtmlLoader.Constants.Attr_ContentLoadState, EVUI.Modules.HtmlLoader.HtmlPlaceholderLoadState.Loading);
                        session.loadState = EVUI.Modules.HtmlLoader.HtmlPlaceholderLoadState.Loading;
                        childSession.eventStream.execute(); //kick off the child load process.
                    }

                    session.selectedChildPlaceholders = actualChildren;
                    if (actualChildren.length === 0) //no children were queued to be loaded, just continue to the next step.
                    {
                        return jobArgs.resolve();
                    }
                }
            });

        addOnInjectEvents(session);

        //inject the html into the placeholder element
        eventStream.addStep(
            {
                key: EVUI.Modules.HtmlLoader.Constants.Job_InjectHtml,
                name: "InjectHtml",
                type: EVUI.Modules.EventStream.EventStreamStepType.Job,
                handler: function (jobArgs)
                {
                    if (session.loadedFragment != null) //we have content, blow away old content and replace it with new content
                    {
                        var eh = new EVUI.Modules.Dom.DomHelper(session.placeholderElement);
                        eh.empty();

                        var injected = eh.append(session.loadedFragment);
                        session.loadedContent = injected.elements;

                        eh.attr(EVUI.Modules.HtmlLoader.Constants.Attr_ContentLoadState, EVUI.Modules.HtmlLoader.HtmlPlaceholderLoadState.Loaded); //set the load state so this placeholder isn't loaded again
                        session.loadState = EVUI.Modules.HtmlLoader.HtmlPlaceholderLoadState.Loaded;
                    }
                    else //no content, flag it as failed
                    {
                        session.placeholderElement.setAttribute(EVUI.Modules.HtmlLoader.Constants.Attr_ContentLoadState, EVUI.Modules.HtmlLoader.HtmlPlaceholderLoadState.Failed);
                        session.loadState = EVUI.Modules.HtmlLoader.HtmlPlaceholderLoadState.Failed;
                    }

                    jobArgs.resolve();
                }
            });

        addOnPlaceholderLoadedEvents(session);
        addOnAllPlaceholderLoadedEvents(session);

        return eventStream;
    };

    /**Parses a string into a document fragment.
    @param {String} str A string of HTML.  
    @returns {DocumentFragment} */
    var stringToDocFrag = function (str)
    {
        var div = document.createElement("div");
        div.innerHTML = str;

        var docFrag = document.createDocumentFragment();

        while (div.childNodes.length > 0)
        {
            var curChild = div.childNodes[0];
            docFrag.append(curChild);
        }

        return docFrag;
    };

    var ensureServices = function ()
    {
        if (_services == null || typeof _services !== "object")
        {
            _services = new EVUI.Modules.HtmlLoader.HtmlLoaderControllerServices();
        }

        if (_services.httpManager == null || typeof _services.httpManager !== "object")
        {
            Object.defineProperty(_services, "httpManager", {
                get: function ()
                {
                    return EVUI.Modules.Http.Http;
                },
                configurable: false,
                enumerable: true
            })
        }
    };

    /**Event that executes before the request to get HTML from the server has been sent and gives the opportunity to stop the operation before it begins.
    @param {EVUI.Modules.HtmlLoader.HtmlPlaceholderLoadEventArgs} args: An instance of EVUI.Modules.HtmlLoaderController.HtmlPlaceholderLoadEventArgs describing the current load operation.*/
    this.onBeforePlaceholderLoad = function (args)
    {

    };

    /**Event that executes before the HTML returned from the server is injected into the DOM and gives the user the ability to manipulate the HTML while it is still in a document fragment.
    @param {EVUI.Modules.HtmlLoader.HtmlPlaceholderLoadEventArgs} args: An instance of EVUI.Modules.HtmlLoaderController.HtmlPlaceholderLoadEventArgs describing the current load operation.*/
    this.onPlaceholderInject = function (args)
    {

    };

    /**Event that executes before any recursive child loads occur and gives the user the opportunity to edit the list of children being theoretically loaded.
    @param {EVUI.Modules.HtmlLoader.HtmlPlaceholderLoadEventArgs} args: An instance of EVUI.Modules.HtmlLoaderController.HtmlPlaceholderLoadEventArgss describing the current load operation.*/
    this.onBeforeLoadPlaceholderChildren = function (args)
    {

    };

    /**Event that executes after the placeholder - and all of its children - have been injected and the load operation is complete.
    @param {EVUI.Modules.HtmlLoader.HtmlPlaceholderLoadEventArgs} args: An instance of EVUI.Modules.HtmlLoaderController.HtmlPlaceholderLoadEventArgs describing the current load operation.*/
    this.onPlaceholderLoaded = function (args)
    {

    };

    /**Event that executes after all the placeholders have been loaded recursively.
    @param {EVUI.Modules.HtmlLoader.HtmlPlaceholderLoadEventArgs} args: An instance of EVUI.Modules.HtmlLoaderController.HtmlPlaceholderLoadEventArgs describing the current load operation.*/
    this.onAllPlaceholdersLoaded = function (args)
    {

    };

    /**Represents the data about a HTML partial load session in progress.
    @class*/
    var PlaceholderLoadSession = function ()
    {
        /**The unique ID of this placeholder load session.
        @type {Number}*/
        this.id = _sessionIdCtr++;

        /**Object. The public placeholder object.
        @type {EVUI.Modules.HtmlLoader.HtmlPlaceholder}*/
        this.placeholder = null;

        /**Object. The session that initiated this session.
        @type {PlaceholderLoadSession}*/
        this.parentSession = null;

        /**Object. The arguments for loading the placeholder.
        @type {EVUI.Modules.HtmlLoader.HtmlPlaceholderLoadArgs} */
        this.placeholderArgs = null;

        /**Object. The EventStream running the load operation.
        @type {EVUI.Modules.EventStream.EventStream}*/
        this.eventStream = null;

        /**Array. All the child placeholders to load.
        @type {PlaceholderLoadSession[]}*/
        this.childSessions = [];

        /**String. The Html that came back from the server.
        @type {String}*/
        this.html = null;

        /**String. The Url that was used to make the request.
        @type {String}*/
        this.url = null;

        /**Object. The document fragment that contains the loaded Html.
        @type {DocumentFragment}*/
        this.loadedFragment = null;

        /**Array. The content that was injected into the placeholder.
        @type {Element[]}*/
        this.loadedContent = null;

        /**Object. The Element that the placeholder will be injected into.
        @type {Element}*/
        this.placeholderElement = null;

        /**Array. All the Dom that had the PlaceholderID attribute on them contained within the original html load result.
        @type {Element[]}*/
        this.allChildPlaceholders = null;

        /**Array. Dom that the user decided to load.
        @type {Element[]}*/
        this.selectedChildPlaceholders = null;

        /**String. The PlaceholderID of the root placeholder being loaded.
        @type {String}*/
        this.placeholderID = null;

        /**String. The current state of the load operation.
        @type {String}*/
        this.loadState = null;
    };

    ensureServices();
};

/**Request arguments for requesting a string of HTML from a server. All requests are asynchronous GET requests with a responseType of "text" by default.
@class*/
EVUI.Modules.HtmlLoader.HtmlRequestArgs = function ()
{
    /**String. The Url to get the HTML from. 
    @type {String}*/
    this.url = null;

    /**Object. An instance of HttpRequestArgs containing any further configuration of the Http request.
    @type {EVUI.Modules.Http.HttpRequestArgs}*/
    this.httpArgs = new EVUI.Modules.Http.HttpRequestArgs();
};

/**Object for loading a HTML partial.
@class*/
EVUI.Modules.HtmlLoader.HtmlPartialLoadRequest = function (url, key)
{
    /**String. The Url to get the Html from.
    @type {String}*/
    this.url = (url == null) ? undefined : url;

    /**String. The Html that was returned from the server.
    @type {String}*/
    this.html = undefined;

    /**String. A string to use to look up this HtmlPartialLoadRequest after it has loaded.
    @type {String}*/
    this.key = (key == null) ? undefined : key;
};

/**Arguments for loading a set of Html partials. 
@class*/
EVUI.Modules.HtmlLoader.HtmlPartialLoadArgs = function ()
{
    var _partialLoadRequests = [];

    /**Array. An array of EVUI.Modules.HtmlLoaderController.HtmlPartialLoadRequest representing all the Html partials to get.
    @type {EVUI.Modules.HtmlLoader.HtmlPartialLoadRequest[]}*/
    this.htmlPartialLoadRequests = null;
    Object.defineProperty(this, "htmlPartialLoadRequests",
        {
            get: function () { return _partialLoadRequests; },
            set: function (value)
            {
                if (EVUI.Modules.Core.Utils.isArray(value) === false) throw new Error("HtmlPartialLoadRequests must be an array.");
                _partialLoadRequests = value;
            },
            configurable: false,
            enumerable: true
        });

    /**Object. An instance of HttpRequestArgs containing any further configuration of the Http requests.
    @type {EVUI.Modules.Http.HttpRequestArgs}*/
    this.httpArgs = new EVUI.Modules.Http.HttpRequestArgs();
};

/**EventArguements object for loading placeholders.
@class*/
EVUI.Modules.HtmlLoader.HtmlPlaceholderLoadEventArgs = function ()
{
    /**Object. The HtmlPlaceholderLoadArgs being used to load placeholders.
    @type {EVUI.Modules.HtmlLoader.HtmlPlaceholderLoadArgs}*/
    this.placeholder = null;

    /**Object. The context object for this event that gets passed between events. 
    @type {Any}*/
    this.context = null;

    /**Pauses the load/injection process indefinitely until Resume is called.
    @method Pause*/
    this.pause = function () { };
    /**Resumes a paused load/injection process.
    @method Resume*/
    this.resume = function () { };
    /**Cancels the load/injection process at its current state.
    @method Cancel*/
    this.cancel = function () { };
    /**Prevents any further events with the same key from being executed.
    @method StopPropagation*/
    this.stopPropagation = function () { };
};

/**Container object for all the settings that can effect the behavior of a HtmlLoaderController operation.
@class */
EVUI.Modules.HtmlLoader.HtmlPlaceholderLoadArgs = function ()
{
    var _contextNode = null;

    /**String. The ID of the root placeholder element to load.
    @type {String}*/
    this.placeholderID = null;

    /**Boolean. Whether or not to recursively load all placeholders under the root. True by default.
    @type {Boolean}*/
    this.recursive = true;

    /**Boolean. Whether or not to ignore the "onDemand" content setting, forcing all onDemand placeholders to be loaded automatically at once. False by default.
    @type {Boolean}*/
    this.ignoreOnDemand = false;

    /**Boolean. Force the reload and replacement of all content found under the ContextNode regardless of its content load state. False by default.
    @type {Boolean}*/
    this.forceReload = false;

    /**Object. An instance of HttpRequestArgs containing any further configuration of the Http request.
    @type {EVUI.Modules.Http.HttpRequestArgs}*/
    this.httpArgs = new EVUI.Modules.Http.HttpRequestArgs();

    /**Object. An Element to narrow the context of the load operation.
    @type {Element}*/
    this.contextElement = null;
    Object.defineProperty(this, "contextElement",
        {
            get: function () { return _contextNode; },
            set: function (value)
            {
                var newValue = EVUI.Modules.Core.Utils.getValidElement(value);
                if (newValue != null) value = newValue;

                if (value != null && EVUI.Modules.Core.Utils.isElement(value) === false && value instanceof Document === false && value instanceof DocumentFragment === false) throw new Error("contextElement must be derived from Element.");
                _contextNode = value;
            },
            configurable: false,
            enumerable: true
        });

    /**Event that executes before the request to get HTML from the server has been sent and gives the opportunity to stop the operation before it begins.
    les.HtmlLoaderController.HtmlPlaceholderLoadEventArgs} args: An instance of EVUI.Modules.HtmlLoaderController.HtmlPlaceholderLoadEventArgs describing the current load operation.*/
    this.onBeforePlaceholderLoad = function (args)
    {

    };

    /**Event that executes before any recursive child loads occur and gives the user the opportunity to edit the list of children being theoretically loaded.
    @param {EVUI.Modules.HtmlLoader.HtmlPlaceholderLoadEventArgs} args: An instance of EVUI.Modules.HtmlLoaderController.HtmlPlaceholderLoadEventArgss describing the current load operation.*/
    this.onBeforeLoadPlaceholderChildren = function (args)
    {
    };

    /**Event that executes before the HTML returned from the server is injected into the DOM and gives the user the ability to manipulate the HTML while it is still in a document fragment.
    @param {EVUI.Modules.HtmlLoader.HtmlPlaceholderLoadEventArgs} args: An instance of EVUI.Modules.HtmlLoaderController.HtmlPlaceholderLoadEventArgs describing the current load operation.*/
    this.onPlaceholderInject = function (args)
    {

    };

    /**Event that executes after the placeholder - and all of its children - have been injected into its parent and the load operation is complete.
    @param {EVUI.Modules.HtmlLoader.HtmlPlaceholderLoadEventArgs} args: An instance of EVUI.Modules.HtmlLoaderController.HtmlPlaceholderLoadEventArgs describing the current load operation.*/
    this.onPlaceholderLoaded = function (args)
    {

    };

    /**Event that executes after all the placeholders have been loaded and injected into the DOM.
    @param {EVUI.Modules.HtmlLoader.HtmlPlaceholderLoadEventArgs} args: An instance of EVUI.Modules.HtmlLoaderController.HtmlPlaceholderLoadEventArgs describing the current load operation.*/
    this.onAllPlaceholdersLoaded = function (args)
    {

    };
};

/**Object representing the return value of a HtmlPlaceholder load operation. 
 @class*/
EVUI.Modules.HtmlLoader.HtmlPlaceholder = function (session)
{
    if (session == null) throw new Error("Object expected.");
    var _session = session;
    var _content = null;
    var _children = null;

    /**String. The ID of the placeholder that was loaded.
    @type {String}*/
    this.placeholderID = null;
    Object.defineProperty(this, "placeholderID", {
        get: function ()
        {
            return _session.placeholderID;
        },
        configurable: false,
        enumerable: true
    });

    /**Object. The Element containing the injected content.
    @type {Element}*/
    this.placeholderElement = null;
    Object.defineProperty(this, "placeholderElement", {
        get: function ()
        {
            return _session.placeholderElement;
        },
        configurable: false,
        enumerable: true
    });

    /**String. The raw Html returned from the server.
    @type {String}*/
    this.html = null;
    Object.defineProperty(this, "html", {
        get: function ()
        {
            return _session.html;
        },
        configurable: false,
        enumerable: true
    });

    /**String. The base url the request was made to.
    @type {String}*/
    this.url = null;
    Object.defineProperty(this, "url", {
        get: function ()
        {
            return _session.url;
        },
        configurable: false,
        enumerable: true
    });

    /**Object. If this was a recursive load, this will be the parent of the current placeholder if it is not the root placeholder.
    @type {EVUI.Modules.HtmlLoader.HtmlPlaceholder}*/
    this.parentPlaceholder = null;
    Object.defineProperty(this, "parentPlaceholder", {
        get: function ()
        {
            if (_session.parentSession != null)
            {
                return _session.parentSession.placeholder;
            }
            else
            {
                return null;
            }
        },
        configurable: false,
        enumerable: true
    });

    /**Object. The Element that was injected into the Placeholder.
    @type {Node[]}*/
    this.loadedContent = null;
    Object.defineProperty(this, "loadedContent", {
        get: function ()
        {
            if (_content != null) return _content;
            if (_session.loadedContent != null && _session.loadedContent.length > 0)
            {
                _content = Object.freeze(_session.loadedContent.slice());
            }

            return _content;
        },
        configurable: false,
        enumerable: true
    });

    /**Object. The instance of EVUI.Modules.HtmlLoaderController.HtmlPlaceholderLoadArgs used to load this placeholder.
    @type {EVUI.Modules.HtmlLoader.HtmlPlaceholderLoadArgs}*/
    this.loadArgs = null;
    Object.defineProperty(this, "loadArgs", {
        get: function ()
        {
            return _session.placeholderArgs;
        },
        configurable: false,
        enumerable: true
    });

    /**Array. An array of EVUI.Modules.HtmlLoaderController.HtmlPlaceholderLoadResult representing the child placeholders loaded under this one.
    @type {EVUI.Modules.HtmlLoader.HtmlPlaceholder[]}*/
    this.children = null;
    Object.defineProperty(this, "children", {
        get: function ()
        {
            if (_children != null) return _children;
            if (_session.childSessions != null && _session.childSessions.length)
            {
                _children = _session.childSessions.slice();
                _children.sort(function (sessionA, sessionB) { return sessionA.id - sessionB.id });
                _children = _children.map(function (session) { return session.placeholder });
            }

            return _children;
        },
        configurable: false,
        enumerable: true
    });

    /**String. A value from HtmlPlaceholderLoadState indicating the completion state of the HtmlPlaceholder's load operation.
    @type {String}*/
    this.loadState = null;
    Object.defineProperty(this, "loadState", {
        get: function ()
        {
            return _session.loadState;
        },
        configurable: false,
        enumerable: true
    });
};

/**The result state value of the evui-loader-contentLoadState attribute on an element which was the parent to a placeholder that was loaded.
@enum*/
EVUI.Modules.HtmlLoader.HtmlPlaceholderLoadState =
{
    /**Placeholder will be loaded the next time it is requested.*/
    OnDemand: "ondemand",
    /**Placeholder has been loaded and will not be loaded again.*/
    Loaded: "loaded",
    /**Placeholder failed to load due to an error or Http error.*/
    Failed: "failed",
    /**Placeholder was the child of itself and created a circular reference.*/
    CircularReference: "circular",
    /*Placeholder has been slated for loading.*/
    Pending: "pending",
    /*Placeholder is in the process of being loaded.*/
    Loading: "loading"
};
Object.freeze(EVUI.Modules.HtmlLoader.HtmlPlaceholderLoadState);

/**Object to inject the standard dependencies used by the HtmlLoaderController into it via its constructor.
@class*/
EVUI.Modules.HtmlLoader.HtmlLoaderControllerServices = function ()
{
    /**Object. An instance of Http module's HttpManager object.
    @type {EVUI.Modules.Http.HttpManager}*/
    this.httpManager = null;
};

/**Global instance of a EVUI.Modules.HtmlLoaderController.HtmlLoaderController.
 @type {EVUI.Modules.HtmlLoader.HtmlLoaderController}*/
EVUI.Modules.HtmlLoader.Manager = null;
(function ()
{
    var loader = null;

    Object.defineProperty(EVUI.Modules.HtmlLoader, "Manager",
        {
            get: function ()
            {
                if (loader == null) loader = new EVUI.Modules.HtmlLoader.HtmlLoaderController();
                return loader;
            },
            configurable: false,
            enumerable: true
        });
})();

/**Constructor reference for the HtmlLoaderController.*/
EVUI.Constructors.HtmlLoader = EVUI.Modules.HtmlLoader.HtmlLoaderController;

delete $evui.htmlLoader;

/**Global instance of the HtmlLoaderController, used to load fragments of Html or inject Html into placeholders in other Html.
@type {EVUI.Modules.HtmlLoader.HtmlLoaderController}*/
$evui.htmlLoader = null;
Object.defineProperty($evui, "htmlLoader",
    {
        get: function ()
        {
            return EVUI.Modules.HtmlLoader.Manager;
        },
        enumerable: true
    });

/**Makes a simple GET request to get Html. The request defaults to a GET with a response type of "text". If a different response type is used, the result is translated back into a string.
@param {EVUI.Modules.HtmlLoader.HtmlRequestArgs} htmlRequestArgsOrUrl The Url of the html or the arguments for getting the Html.
@param {EVUI.Modules.HtmlLoader.Constants.Fn_GetHtml_Callback} getHmlCallback  A function to call once the server has completed the request, takes the string version of whatever was returned as a parameter. */
$evui.loadHtml = function (htmlRequestArgsOrUrl, getHtmlCallback)
{
    return $evui.htmlLoader.loadHtml(htmlRequestArgsOrUrl, getHtmlCallback);
};

/**Awaitable. Makes a simple GET request to get html. The request defaults to a GET with a response type of "text". If a different response type is used, the result is translated back into a string.
@param {EVUI.Modules.HtmlLoader.HtmlRequestArgs} htmlRequestArgs  The Url of the html or the arguments for getting the Html.
@returns {Promise<String>}*/
$evui.loadHtmlAsync = function (htmlRequestArgsOrUrl)
{
    return $evui.htmlLoader.loadHtmlAsync(htmlRequestArgsOrUrl);
};

/**Loads an array of PartialLoadRequeusts either as a standalone array or as part of a HtmlPartalLoadArgs object.
@param {EVUI.Modules.HtmlLoader.HtmlPartialLoadArgs|EVUI.Modules.HtmlLoader.HtmlPartialLoadRequest[]} partialLoadArgsOrPartialRequests Either an array of HtmlPartialLoadRequests or a HtmlPartialLoadArgs object.
@param {EVUI.Modules.HtmlLoader.Constants.Fn_GetPartials_Callback} loadedCallback A callback that is fired once all the Html partials have been loaded.*/
$evui.loadHtmlPartials = function (partialLoadArgsOrPartialRequests, loadedCallback)
{
    return $evui.htmlLoader.loadAllPlacehoders(partialLoadArgsOrPartialRequests, loadedCallback);
};

/**Awaitable. Loads an array of PartialLoadRequeusts either as a standalone array or as part of a HtmlPartalLoadArgs object.
@param {EVUI.Modules.HtmlLoader.HtmlPartialLoadArgs|EVUI.Modules.HtmlLoader.HtmlPartialLoadRequest[]} partialLoadArgsOrPartialRequests Either an array of HtmlPartialLoadRequests or a HtmlPartialLoadArgs object.
@returns {Promise<EVUI.Modules.HtmlLoader.HtmlPartialLoadRequest[]>}.*/
$evui.loadHtmlPartialsAsync = function (partialLoadArgsOrPartialRequests)
{
    return $evui.htmlLoader.loadHtmlPartialsAsync(partialLoadArgsOrPartialRequests);
};

/**Loads a placeholder and all of its children and injects it into the DOM.
@param {EVUI.Modules.HtmlLoader.HtmlPlaceholderLoadArgs|String} placeholderIDOrArgs The value of a PlaceholderID attribute or a graph of HtmlPlaceholderLoadArgs.
@param {EVUI.Modules.HtmlLoader.Constants.Fn_GetPlaceholder_Callback} callback A callback function that is executed once the placeholder load operation is complete.*/
$evui.loadPlaceholder = function (placeholderIDOrArgs, callback)
{
    return $evui.htmlLoader.loadPlaceholder(placeholderIDOrArgs, callback);
};

/**Awaitable. Loads a placeholder and all of its children and injects them into the DOM.
@param {EVUI.Modules.HtmlLoader.HtmlPlaceholderLoadArgs|String} placeholderIDOrArgs The value of a EVUI.Modules.HtmlLoaderController.Constants.Attr_PlaceholderID attribute or a graph of HtmlPlaceholderLoadArgs.
@param {EVUI.Modules.HtmlLoader.Constants.Fn_GetPlaceholder_Callback} callback A callback function that is executed once the placeholder load operation is complete.
@returns {Promise<EVUI.Modules.HtmlLoader.HtmlPlaceholder>}*/
$evui.loadPlaceholderAsync = function (placeholderIDOrArgs)
{
    return $evui.htmlLoader.loadPlaceholderAsync(placeholderIDOrArgs);
};

/**Loads all placeholders currently in the document (elements with the EVUI.Modules.HtmlLoaderController.Constants.Attr_PlaceholderID attribute present with a non-empty string value) in parallel, but excludes those that are flagged as being loaded upon on demand.
@param {EVUI.Modules.HtmlLoader.HtmlPlaceholderLoadArgs} placehoderLoadArgs The arguments for loading all the placeholders currently in the document.
@param {EVUI.Modules.HtmlLoader.Constants.Fn_GetPlaceholder_Callback} callback A callback function that is called once all the placeholders in the document have been loaded and injected into the DOM.*/
$evui.loadAllPlaceholders = function (placehoderLoadArgs, callback)
{
    return $evui.htmlLoader.loadAllPlaceholders(placehoderLoadArgs, callback);
};

/**Awaitable. Loads all placeholders currently in the document (elements with the EVUI.Modules.HtmlLoaderController.Constants.Attr_PlaceholderID attribute present with a non-empty string value) in parallel, but excludes those that are flagged as being loaded upon on demand.
@param {EVUI.Modules.HtmlLoader.HtmlPlaceholderLoadArgs} placehoderLoadArgs The arguments for loading all the placeholders currently in the document.
@returns {Promise<EVUI.Modules.HtmlLoader.HtmlPlaceholder>} callback A callback function that is called once all the placeholders in the document have been loaded and injected into the DOM.*/
$evui.loadAllPlaceholdersAsync = function (placehoderLoadArgs)
{
    return $evui.htmlLoader.loadAllPlaceholdersAsync(placehoderLoadArgs);
};

Object.freeze(EVUI.Modules.HtmlLoader);
/*#ENDWRAP(HtmlLoaderController)#*/