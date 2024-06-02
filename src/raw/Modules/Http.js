/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

/*#INCLUDES#*/

/*#BEGINWRAP(EVUI.Modules.Http|Http)#*/
/*#REPLACE(EVUI.Modules.Http|Http)#*/

/**Module for containing an EventStream driven Http interface.
@module*/
EVUI.Modules.Http = {};

/*#MODULEDEF(Http|"1.0";|"Http")#*/
/*#VERSIONCHECK(EVUI.Modules.Http|Http)#*/

EVUI.Modules.Http.Dependencies =
{
    Core: Object.freeze({ version: "1.0", required: true }),
    EventStream: Object.freeze({ version: "1.0", required: true }),
};

(function ()
{
    var checked = false;

    Object.defineProperty(EVUI.Modules.Http.Dependencies, "checked",
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


Object.freeze(EVUI.Modules.Http.Dependencies);

EVUI.Modules.Http.Constants = {};

/**
 * 
 * @param {EVUI.Modules.Http.CompletedHttpRequest} completedRequest
 */
EVUI.Modules.Http.Constants.Fn_HttpCallback = function (completedRequest) { }

EVUI.Modules.Http.Constants.Event_OnBeforeSend = "beforesend";
EVUI.Modules.Http.Constants.Event_OnSuccess = "success";
EVUI.Modules.Http.Constants.Event_OnError = "error";
EVUI.Modules.Http.Constants.Event_OnComplete = "complete";
EVUI.Modules.Http.Constants.Event_OnAllComplete = "allcomplete";

EVUI.Modules.Http.Constants.Job_OpenRequest = "job.open";
EVUI.Modules.Http.Constants.Job_SendRequest = "job.send";
EVUI.Modules.Http.Constants.Job_RequestComplete = "job.requestcomplete";

EVUI.Modules.Http.Constants.StepPrefix = "evui.http";

/**Event handler for bubbling global events attached to the HttpManager.
@param {EVUI.Modules.Http.HttpEventArgs} httpEventArgs The event arguments for the event.*/
EVUI.Modules.Http.Constants.Fn_Event_Handler = function (httpEventArgs) { };

Object.freeze(EVUI.Modules.Http.Constants);

/** A utility class designed to abstract away making HTTP requests directly and expose a standard EventStream driven interface. Meant for internal use only.
@class*/
EVUI.Modules.Http.HttpManager = function ()
{
    if (EVUI.Modules.Core == null) throw Error("Dependency missing: EVUI.Modules.Core is required.");
    EVUI.Modules.Core.Utils.requireAll(EVUI.Modules.Http.Dependencies);

    var _self = this; //self-reference for closures

    /**Internal array of all currently executing request instances.
    @type {RequestInstance[]} */
    var _requests = [];

    /**Internal array of all completed request instances since the last time the stack of requests was refreshed.
    @type {RequestInstance[]} */
    var _completedRequests = [];

    /**Bubbling event handler for collecting events with the same keys as the primary events in the handler.
    @type {EVUI.Modules.EventStream.BubblingEventManager}*/
    var _bubbler = new EVUI.Modules.EventStream.BubblingEventManager();

    /**Executes a HTTP request with the given arguments.
    @param {EVUI.Modules.Http.HttpRequestArgs} requestArgs A YOLO HttpRequestArgs that contains the information needed to run the Http request.
    @param {EVUI.Modules.Http.Constants.Fn_HttpCallback} callback A callback to call once the HTTP request completes.*/
    this.send = function (requestArgs, callback)
    {
        if (typeof callback !== "function") callback = function () { };

        var requestInstance = buildRequest(requestArgs);
        var completedRequest = null;
        requestInstance.eventStream.getPromiseResolutionValue = function ()
        {
            completedRequest = buildCompletedRequest(requestInstance);

            return completedRequest;
        };

        requestInstance.eventStream.executeAsync().then(function (completedRequest)
        {
            return callback(completedRequest);
        }).catch(function(ex)
        {
            return callback(completedRequest);
        });
    };

    /**Executes a HTTP request with the given arguments that it can be awaited.
    @param {EVUI.Modules.Http.HttpRequestArgs} requestArgs A YOLO HttpRequestArgs that contains the information needed to run the Http request.
    @returns {Promise<EVUI.Modules.Http.CompletedHttpRequest>}*/
    this.sendAsync = function (requestArgs)
    {
        var requestInstance = buildRequest(requestArgs);
        requestInstance.eventStream.getPromiseResolutionValue = function ()
        {
            var completedRequest = buildCompletedRequest(requestInstance);

            return completedRequest;
        };

        return requestInstance.eventStream.executeAsync();
    };

    /**Builds the EventStream and RequestInstance required to run a HTTP request.
    @param {EVUI.Modules.Http.HttpRequestArgs} requestArgs An instance or graph pf EVUI.Modules.Http.HttpRequestArgs that contains the information needed to run the Http request.
    @returns {RequestInstance} */
    var buildRequest = function (requestArgs)
    {
        if (requestArgs == null) throw new Error("requestArgs cannot be null.");

        requestArgs = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Http.HttpRequestArgs(), requestArgs);
        if (requestArgs.headers != null) requestArgs.headers = requestArgs.headers.map(function (header) { return EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.Http.HttpRequestHeader(), header); });

        var requestInstance = buildRequestInstance(requestArgs);
        _requests.push(requestInstance);

        buildEventStream(requestInstance);
        return requestInstance;
    };

    /**Gets a copy of the internal array of all active HTTP requests.
    @returns {EVUI.Modules.Http.HttpRequestInstance[]}*/
    this.getAllActiveRequests = function ()
    {
        var copy = [];

        var numRequests = _requests.length;
        for (var x = 0; x < numRequests; x++)
        {
            copy.push(new EVUI.Modules.Http.HttpRequestInstance(_requests[x]));            
        }

        return copy;
    };

    /**Add an event listener to fire after an event with the same name has been executed.
    @param {String} eventName The name of the event in the EventStream to execute after.
    @param {EVUI.Modules.Http.Constants.Fn_Event_Handler} handler The function to fire.
    @param {EVUI.Modules.EventStream.EventStreamEventListenerOptions} options Options for configuring the event.
    @returns {EVUI.Modules.EventStream.EventStreamEventListener}*/
    this.addEventListener = function (eventName, handler, options)
    {
        return _bubbler.addEventListener(eventName, handler, options);
    };

    /**Removes an EventStreamEventListener based on its event name, its id, or its handling function.
    @param {String} eventNameOrId The name or ID of the event to remove.
    @param {Function} handler The handling function of the event to remove.
    @returns {Boolean}*/
    this.removeEventListener = function (eventNameOrId, handler)
    {
        return _bubbler.removeEventListener(eventNameOrId, handler);
    };

    /**Builds the internal RequestInstance object that manages the lifetime of the XMLHttpRequest. Sets up the EventStream's function and setting overrides.
    @param {EVUI.Modules.Http.HttpRequestArgs} requestArgs The request arguments for the request.
    @returns {RequestInstance} */
    var buildRequestInstance = function (requestArgs)
    {
        var entry = new RequestInstance();
        entry.eventStream = new EVUI.Modules.EventStream.EventStream();
        entry.eventStream.context = requestArgs;
        entry.httpRequestArgs = requestArgs;
        entry.requestID = EVUI.Modules.Core.Utils.makeGuid();
        entry.xmlHttpRequest = new XMLHttpRequest();
        entry.requestStatus = RequestStatus.NotStarted;

        entry.eventStream.canSeek = true; //we need to seek to fast forward to error handing events if something crashes
        entry.eventStream.endExecutionOnEventHandlerCrash = false; //user handler errors should never block execution of the event stream
        entry.eventStream.eventState = requestArgs.context == null ? {} : requestArgs.context; //set the internal state object to either be a blank object or whatever the user supplied
        entry.eventStream.bubblingEvents = _bubbler; //attach the bubbling events

        entry.eventStream.onError = function (args, error) //log any errors, but otherwise do nothing
        {
            entry.error = error;
            entry.requestStatus = RequestStatus.Exception;

            if (entry.xmlHttpRequest.readyState !== XMLHttpRequest.DONE)
            {
                entry.xmlHttpRequest.abort();
            }

            entry.eventStream.seek(EVUI.Modules.Http.Constants.Event_OnComplete);
        };

        entry.eventStream.processInjectedEventArgs = function (args) //build the HttpEventArgs object for each stage in the request.
        {
            var request = entry.httpRequestArgs;
            request.context = entry.eventStream.eventState;

            var xhr = null;
            if (args.key === EVUI.Modules.Http.Constants.Event_OnComplete) xhr = entry.xmlHttpRequest;
            if (args.key === EVUI.Modules.Http.Constants.Event_OnError) xhr = entry.xmlHttpRequest;
            if (args.key === EVUI.Modules.Http.Constants.Event_OnSuccess) xhr = entry.xmlHttpRequest;

            var error = (entry.requestStatus === RequestStatus.Exception || entry.requestStatus === RequestStatus.Failed || entry.requestStatus === RequestStatus.TimedOut) ? entry.error : null;

            var httpEventArgs = new EVUI.Modules.Http.HttpEventArgs(request, xhr, error, entry.response);
            httpEventArgs.eventType = args.key;
            httpEventArgs.eventName = args.name;
            httpEventArgs.stopPropagation = function () { args.stopPropagation(); };
            httpEventArgs.requestStatus = entry.requestStatus;

            httpEventArgs.cancel = function () //when the user 'cancels' the request, just fast forward to OnComplete.
            {
                if (entry.xmlHttpRequest.status !== XMLHttpRequest.DONE)
                {
                    entry.xmlHttpRequest.abort();
                    entry.requestStatus = RequestStatus.Canceled;
                }

                if (args.key !== EVUI.Modules.Http.Constants.Event_OnComplete && args.key !== EVUI.Modules.Http.Constants.Event_OnAllComplete)
                {
                    entry.eventStream.seek(EVUI.Modules.Http.Constants.Event_OnComplete);
                }
            };

            httpEventArgs.pause = function () { args.pause(); };
            httpEventArgs.resume = function () { args.resume(); };

            return httpEventArgs;
        };

        //make sure any changes or reassignments to the state object are remembered
        entry.eventStream.processReturnedEventArgs = function (args, result, currentStep, jobState, publicState)
        {
            entry.eventStream.eventState = args.context;
        };

        return entry;
    };

    /**Adds all the steps to the event stream needed for running the Http request.
    @param {RequestInstance} requestInstance The RequestInstance managing the request.*/
    var buildEventStream = function (requestInstance)
    {
        var es = requestInstance.eventStream;

        //set up local on before send event
        es.addStep({
            key: EVUI.Modules.Http.Constants.Event_OnBeforeSend,
            name: EVUI.Modules.Http.Constants.StepPrefix + "." + EVUI.Modules.Http.Constants.Event_OnBeforeSend,
            type: EVUI.Modules.EventStream.EventStreamStepType.Event,
            handler: function (httpEventArgs)
            {
                if (typeof requestInstance.httpRequestArgs.onBeforeSend === "function")
                {
                    return requestInstance.httpRequestArgs.onBeforeSend(httpEventArgs);
                }
            }
        });

        //set up the global on before send event
        es.addStep({
            key: EVUI.Modules.Http.Constants.Event_OnBeforeSend,
            name: EVUI.Modules.Http.Constants.StepPrefix + "." + EVUI.Modules.Http.Constants.Event_OnBeforeSend,
            type: EVUI.Modules.EventStream.EventStreamStepType.GlobalEvent,
            handler: function (httpEventArgs)
            {
                if (typeof _self.onBeforeSend === "function")
                {
                    return _self.onBeforeSend.call(_self, httpEventArgs);
                }
            }
        });

        //set up the job that opens and sets all the settings for the XMLHttpRequest
        es.addStep({
            key: EVUI.Modules.Http.Constants.Job_OpenRequest,
            name: EVUI.Modules.Http.Constants.StepPrefix + "." + EVUI.Modules.Http.Constants.Job_OpenRequest,
            type: EVUI.Modules.EventStream.EventStreamStepType.Job,
            /**@param {EVUI.Resources.EventStreamJobArgs} jobArgs*/
            handler: function (jobArgs)
            {
                requestInstance.requestStatus = RequestStatus.Opened;

                var xhr = requestInstance.xmlHttpRequest;
                var requestArgs = requestInstance.httpRequestArgs;

                try
                {
                    //try and use the provided method and url to open the request
                    xhr.open(requestArgs.method, requestArgs.url, true);

                    //set the applicable settings
                    if (requestArgs.withCredentials === true) xhr.withCredentials = true;
                    if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(requestArgs.contentType) === false) xhr.setRequestHeader("Content-Type", requestArgs.contentType);
                    if (typeof requestArgs.timeout === "number" && requestArgs.timeout > 0) xhr.timeout = requestArgs.timeout;

                    //add all the headers
                    if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(requestArgs.headers) === true)
                    {
                        var numHeaders = requestArgs.headers.length;
                        for (var x = 0; x < numHeaders; x++)
                        {                            
                            var header = requestArgs.headers[x];
                            if (header == null || typeof header !== "object") continue;

                            var key = header.key;
                            var value = header.value;

                            if (typeof key !== "string" && typeof key !== "number") continue; //invalid key type
                            if (value != null && typeof value !== "string" && typeof value !== "number" && typeof value !== "boolean") continue; //value is an object or a function, which are invalid

                            xhr.setRequestHeader(key.toString(), value.toString());
                        }
                    }

                    if (typeof requestArgs.responseType === "string")
                    {
                        switch (requestArgs.responseType.toLowerCase())
                        {
                            case EVUI.Modules.Http.HttpResponseType.ArrayBuffer:
                                xhr.responseType = "arraybuffer";
                                break;
                            case EVUI.Modules.Http.HttpResponseType.Blob:
                                xhr.responseType = "blob";
                                break;
                            case EVUI.Modules.Http.HttpResponseType.HTML:
                            case EVUI.Modules.Http.HttpResponseType.XML:
                            case EVUI.Modules.Http.HttpResponseType.Document:
                                xhr.responseType = "document";
                                break;
                            case EVUI.Modules.Http.HttpResponseType.JSON:
                                xhr.responseType = "json";
                                break;
                            case EVUI.Modules.Http.HttpResponseType.Text:
                                xhr.responseType = "text";
                                break;
                            default:
                                xhr.responseType = requestArgs.responseType;
                        }
                    }
                }
                catch (ex) //something failed, fast-forward to the error events
                {
                    requestInstance.error = new EVUI.Modules.EventStream.EventStreamError("Failed to construct XMLHttpRequest.", ex, EVUI.Modules.EventStream.EventStreamStage.Job, EVUI.Modules.Http.Constants.Job_OpenRequest);
                    requestInstance.requestStatus = RequestStatus.Exception;
                    jobArgs.eventStream.seek(EVUI.Modules.Http.Constants.Event_OnError);
                    return jobArgs.resolve();
                }

                jobArgs.resolve();
            }
        });

        //set up the step where we launch the request
        es.addStep({
            key: EVUI.Modules.Http.Constants.Job_SendRequest,
            name: EVUI.Modules.Http.Constants.StepPrefix + "." + EVUI.Modules.Http.Constants.Job_SendRequest,
            type: EVUI.Modules.EventStream.EventStreamStepType.Job,
            handler: function (jobArgs)
            {
                try
                {
                    var loaded = false;
                    var error = false;
                    var timeout = false;

                    requestInstance.xmlHttpRequest.addEventListener("load", function ()
                    {
                        var status = requestInstance.xmlHttpRequest.status;
                        loaded = true;

                        if ((status >= 200 && status < 300) || status === 304)
                        {
                            requestInstance.response = requestInstance.xmlHttpRequest.response;
                            jobArgs.resolve(); //continues to the "OnSuccess" events
                        }
                        else
                        {
                            requestInstance.response = requestInstance.xmlHttpRequest.response;
                            requestInstance.error = new EVUI.Modules.EventStream.EventStreamError("HTTP Error: Server Returned " + requestInstance.xmlHttpRequest.status, null, EVUI.Modules.EventStream.EventStreamStage.Job, EVUI.Modules.Http.Constants.Job_SendRequest);
                            requestInstance.requestStatus = RequestStatus.Failed;
                            jobArgs.eventStream.seek(EVUI.Modules.Http.Constants.Event_OnError);
                            jobArgs.resolve();
                        }
                    }, { once: true });

                    requestInstance.xmlHttpRequest.addEventListener("loadend", function ()
                    {
                        if (loaded === false && error === false && timeout === false)
                        {
                            requestInstance.response = requestInstance.xmlHttpRequest.response;
                            requestInstance.error = new EVUI.Modules.EventStream.EventStreamError("HTTP Error: An unknown error occurred.", null, EVUI.Modules.EventStream.EventStreamStage.Job, EVUI.Modules.Http.Constants.Job_SendRequest);
                            requestInstance.requestStatus = RequestStatus.Aborted;
                            
                            jobArgs.eventStream.seek(EVUI.Modules.Http.Constants.Event_OnComplete);
                            jobArgs.resolve();
                        }
                    }, { once: true });

                    requestInstance.xmlHttpRequest.addEventListener("timeout", function ()
                    {
                        timeout = true;
                        requestInstance.response = requestInstance.xmlHttpRequest.response;
                        requestInstance.error = new EVUI.Modules.EventStream.EventStreamError("HTTP Error: Request timed out after  " + requestInstance.xmlHttpRequest.timeout + " milliseconds.", null, EVUI.Modules.EventStream.EventStreamStage.Job, EVUI.Modules.Http.Constants.Job_SendRequest);
                        requestInstance.requestStatus = RequestStatus.TimedOut;
                        jobArgs.eventStream.seek(EVUI.Modules.Http.Constants.Event_OnError);
                        jobArgs.resolve();
                    }, { once: true });

                    requestInstance.xmlHttpRequest.addEventListener("error", function (args)
                    {
                        error = true;
                        requestInstance.response = requestInstance.xmlHttpRequest.response;
                        requestInstance.error = new EVUI.Modules.EventStream.EventStreamError("HTTP Error: An unknown error occurred.", null, EVUI.Modules.EventStream.EventStreamStage.Job, EVUI.Modules.Http.Constants.Job_SendRequest);
                        requestInstance.requestStatus = RequestStatus.Failed;
                        jobArgs.eventStream.seek(EVUI.Modules.Http.Constants.Event_OnError);
                        jobArgs.resolve();
                    }, { once: true });

                    if (requestInstance.httpRequestArgs.body == null)
                    {
                        requestInstance.xmlHttpRequest.send()
                    }
                    else
                    {
                        requestInstance.xmlHttpRequest.send(requestInstance.httpRequestArgs.body);
                    }
                }
                catch (ex)
                {
                    requestInstance.error = new EVUI.Modules.EventStream.EventStreamError("Failed to send XMLHttpRequest.", ex, EVUI.Modules.EventStream.EventStreamStage.Job, EVUI.Modules.Http.Constants.Job_SendRequest);
                    requestInstance.requestStatus = RequestStatus.Exception;
                    jobArgs.eventStream.seek(EVUI.Modules.Http.Constants.Event_OnError);
                    return jobArgs.resolve();
                }
            }
        });

        //local event for success
        es.addStep({
            key: EVUI.Modules.Http.Constants.Event_OnSuccess,
            name: EVUI.Modules.Http.Constants.StepPrefix + "." + EVUI.Modules.Http.Constants.Event_OnSuccess,
            type: EVUI.Modules.EventStream.EventStreamStepType.Event,
            handler: function (httpEventArgs)
            {
                if (typeof requestInstance.httpRequestArgs.onSuccess === "function")
                {
                    return requestInstance.httpRequestArgs.onSuccess(httpEventArgs);
                }
            }
        });

        //global event for success
        es.addStep({
            key: EVUI.Modules.Http.Constants.Event_OnSuccess,
            name: EVUI.Modules.Http.Constants.StepPrefix + "." + EVUI.Modules.Http.Constants.Event_OnSuccess,
            type: EVUI.Modules.EventStream.EventStreamStepType.GlobalEvent,
            handler: function (httpEventArgs)
            {
                if (_self.onSuccess === "function")
                {
                    return _self.onSuccess.call(_self, httpEventArgs);
                }
            }
        });

        //this "job" skips over the error handlers and goes straight to the on complete handlers
        es.addStep({
            key: EVUI.Modules.Http.Constants.Job_RequestComplete,
            name: EVUI.Modules.Http.Constants.StepPrefix + "." + EVUI.Modules.Http.Constants.Job_RequestComplete,
            type: EVUI.Modules.EventStream.EventStreamStepType.Job,
            handler: function (jobArgs)
            {
                requestInstance.eventStream.seek(EVUI.Modules.Http.Constants.Event_OnComplete);
                jobArgs.resolve();
            }
        });

        //local error handler
        es.addStep({
            key: EVUI.Modules.Http.Constants.Event_OnError,
            name: EVUI.Modules.Http.Constants.StepPrefix + "." + EVUI.Modules.Http.Constants.Event_OnError,
            type: EVUI.Modules.EventStream.EventStreamStepType.Event,
            handler: function (httpEventArgs)
            {
                if (typeof requestInstance.httpRequestArgs.onError === "function")
                {
                    return requestInstance.httpRequestArgs.onError(httpEventArgs);
                }
            }
        });

        //global error handler
        es.addStep({
            key: EVUI.Modules.Http.Constants.Event_OnError,
            name: EVUI.Modules.Http.Constants.StepPrefix + "." + EVUI.Modules.Http.Constants.Event_OnError,
            type: EVUI.Modules.EventStream.EventStreamStepType.GlobalEvent,
            handler: function (httpEventArgs)
            {
                if (typeof _self.onError === "function")
                {
                    return _self.onError.call(_self, httpEventArgs);
                }
            }
        });

        //local complete handler
        es.addStep({
            key: EVUI.Modules.Http.Constants.Event_OnComplete,
            name: EVUI.Modules.Http.Constants.StepPrefix + "." + EVUI.Modules.Http.Constants.Event_OnComplete,
            type: EVUI.Modules.EventStream.EventStreamStepType.Event,
            handler: function (httpEventArgs)
            {
                if (typeof requestInstance.httpRequestArgs.onComplete === "function")
                {
                    return requestInstance.httpRequestArgs.onComplete(httpEventArgs);
                }
            }
        });

        //global complete handler
        es.addStep({
            key: EVUI.Modules.Http.Constants.Event_OnComplete,
            name: EVUI.Modules.Http.Constants.StepPrefix + "." + EVUI.Modules.Http.Constants.Event_OnComplete,
            type: EVUI.Modules.EventStream.EventStreamStepType.GlobalEvent,
            handler: function (httpEventArgs)
            {
                if (typeof _self.onComplete === "function")
                {
                    return _self.onComplete.call(_self, httpEventArgs);
                }
            }
        });

        es.addStep({
            key: EVUI.Modules.Http.Constants.Event_OnAllComplete,
            name: EVUI.Modules.Http.Constants.StepPrefix + "." + EVUI.Modules.Http.Constants.Event_OnAllComplete,
            type: EVUI.Modules.EventStream.EventStreamStepType.GlobalEvent,
            handler: function ()
            {
                return finishRequest(requestInstance);
            }
        });
    };

    /**Creates a CompletedHttpRequest object out of a RequestInstance.
    @param {RequestInstance} requestInstance The RequestInstance managing the lifetime of the HttpRequest.
    @returns {EVUI.Modules.Http.CompletedHttpRequest}*/
    var buildCompletedRequest = function (requestInstance)
    {
        var completedRequest = new EVUI.Modules.Http.CompletedHttpRequest(requestInstance.xmlHttpRequest);
        completedRequest.error = requestInstance.error;
        completedRequest.httpRequestArgs = requestInstance.httpRequestArgs;
        completedRequest.requestID = requestInstance.requestID;
        completedRequest.xmlHttpRequest = requestInstance.xmlHttpRequest;
        completedRequest.response = requestInstance.response;
        completedRequest.statusCode = requestInstance.xmlHttpRequest.status;
        completedRequest.requestStatus = requestInstance.requestStatus;

        return completedRequest;
    };

    /**Completes the request process and fires on OnAllComplete event if all pending Http requests have completed.
    @param {RequestInstance} requestInstance The RequestInstance managing the lifetime of the HttpRequest.*/
    var finishRequest = function (requestInstance)
    {
        var index = _requests.indexOf(requestInstance);
        if (index > -1) _requests.splice(index, 1);
        
        var numCompletedRequests = _completedRequests.push(requestInstance);
        
        if (_requests.length === 0)
        {
            var completedRequests = [];
            for (var x = 0; x < numCompletedRequests; x++)
            {
                var curComplete = _completedRequests[x];
                completedRequests.push(buildCompletedRequest(curComplete));
                _completedRequests.splice(x, 1);
                numCompletedRequests--;
                x--;
            }

            if (typeof _self.onAllComplete === "function")
            {
                return _self.onAllComplete.call(_self, completedRequests);
            }
        }
    };

    /**Event that fires before any XMLHttpRequest is created, gives the opportunity to manipulate anything about the HttpRequestArgs. Return false to abort the operation.
    @param {EVUI.Modules.Http.HttpEventArgs} httpEventArgs The event arguments containing the data and options for the request.*/
    this.onBeforeSend = function (httpEventArgs)
    {

    };

    /**Event that fires when any XMLHttpRequest has returned with successful status code. The HttpRequestArgs are immutable beyond in this step, but the XMLHttpRequest is available in this step.
    @param {EVUI.Modules.Http.HttpEventArgs} httpEventArgs The event arguments containing the data and the XMLHttpRequest.*/
    this.onSuccess = function (httpEventArgs)
    {

    };

    /**Event that fires under one of two conditions: if any XMLHttpRequest returned something other than successful status code, or if there was an exception anywhere in any EventStream. If there
    was an exception, the Error property of the HttpEventArgs will be populated.
    @param {EVUI.Modules.Http.HttpEventArgs} httpEventArgs The event arguments containing the data and options for the XMLHttpRequest.*/
    this.onError = function (httpEventArgs)
    {

    };

    /**Event that fires whenever the request completes or is canceled. If the XMLHttpRequest returned something other than a 200 status code, or if there was an exception anywhere in the EventStream. If there
    was an exception, the Error property of the HttpEventArgs will be populated, otherwise the XMLHttpRequest is available for inspection.
    @param {EVUI.Modules.Http.HttpEventArgs} httpEventArgs The event arguments containing the data and options for the XMLHttpRequest.*/
    this.onComplete = function (httpEventArgs)
    {

    };

    /**Event that fires when all queued requests sent by this instance of HttpManager have completed.
    @param {EVUI.Modules.Http.CompletedHttpRequest[]} completedHttpRequests All the HTTP requests that have completed since the event was last fired.*/
    this.onAllComplete = function (completedRequests)
    {

    };

    /**A container for all the objects required to make a XMLHttpRequest. 
    @class*/
    var RequestInstance = function ()
    {
        /**String. The ID of the request. 
        @type {String}*/
        this.requestID = null;

        /**Object. The EventStream that is coordinating the execution of the XMLHttpRequest.
        @type {EVUI.Modules.EventStream.EventStream}*/
        this.eventStream = null;

        /**Object. The HttpRequestArgs that contain the information needed to run the request.
        @type {EVUI.Modules.Http.HttpRequestArgs}*/
        this.httpRequestArgs = null;

        /**Object. The XMLHttpRequest that is being executed.
        @type {XMLHttpRequest}*/
        this.xmlHttpRequest = null;

        /**Number. A value from RequestState indicating the state of the XMLHttpRequest.
        @type {Number}*/
        this.requestStatus = RequestStatus.NotStarted;

        /**Object. The error that occurred during the execution of the request.
        @type {EVUI.Modules.EventStream.EventStreamError}*/
        this.error = null;

        /**Any. The parsed response from the XMLHttpRequest.
        @type {Any}*/
        this.response = null;
    };

    /**Enum for describing the status of the request in progress.*/
    var RequestStatus = EVUI.Modules.Http.HttpRequestStatus;
};

/**Object for containing all the data needed to run a simple HTTP request.
@class*/
EVUI.Modules.Http.HttpRequestArgs = function ()
{
    var _url = null;
    var _method = null
    var _headers = [];
    var _contentType = null;
    var _withCredentials = false;
    var _responseType = null;
    var _timeout = null;

    /**String. The URL to make the request to.
     @type {String}*/
    this.url = null;
    Object.defineProperty(this, "url", {
        get: function () { return _url; },
        set: function (value)
        {
            if (value != null && typeof value !== "string") throw new Error("url must be a string.");
            _url = value;
        },
        configurable: false,
        enumerable: true
    });

    /**String. The HTTP verb to make with the request.
    @type {String}*/
    this.method = null;
    Object.defineProperty(this, "method", {
        get: function () { return _method; },
        set: function (value)
        {
            if (value != null && typeof value !== "string") throw new Error("method must be a string.");
            _method = value;
        },
        configurable: false,
        enumerable: true
    });

    /**Array. An array of EVUI.Modules.Http.HttpRequestHeader representing the headers to send along with the request.
    @type {EVUI.Modules.Http.HttpRequestHeader[]}*/
    this.headers = null;
    Object.defineProperty(this, "headers", {
        get: function () { return _headers; },
        set: function (value)
        {
            if (value != null && EVUI.Modules.Core.Utils.isArray(value) === false) throw new Error("headers must be an array.");
            _headers = value;
        },
        enumerable: true,
        configurable: false
    });

    /**Any. The body of the request to send to the server. This value is used as-is and must be compatible with the XMLHTTPReqeust's rules for valid message bodies.
    @type {Any}*/
    this.body = null;

    /**The mime type of the message body.
    @type {String}*/
    this.contentType = null;
    Object.defineProperty(this, "contentType", {
        get: function () { return _contentType },
        set: function (value)
        {
            if (value != null && typeof value !== "string") throw new Error("contentType must be a string.")
        },
        enumerable: true,
        configurable: false
    });

    /**Boolean. Whether or not cookies should be sent along for cross-domain requests.
    @type {Boolean}*/
    this.withCredentials = false;
    Object.defineProperty(this, "withCredentials", {
        get: function () { return _withCredentials; },
        set: function (value)
        {
            if (typeof value !== "boolean") throw new Error("withCredentials must be a boolean.");
            _withCredentials = value;
        },
        enumerable: true,
        configurable: false
    });

    /**String. The expected response type from the server. Must be a value from EVUI.Modules.Http.HttpResponseType.
    @type {String}*/
    this.responseType = null;
    Object.defineProperty(this, "responseType", {
            get: function () { return _responseType; },
            set: function (value)
            {
                if (value != null && typeof value !== "string") throw new Error("responseType must be a string.")
                _responseType = value;
            },
            enumerable: true,
            configurable: false
    });

    /**Number. The maximum amount of time the request can take before automatically failing.
    @type {Number}*/
    this.timeout = null;
    Object.defineProperty(this, "timeout", {
        get: function () { return _timeout; },
        set: function (value)
        {
            if (value != null && typeof value !== "number") throw new Error("timeout must be a number.");
            _timeout = value;
        },
        configurable: false
    });

    /**Any. Any additional information to carry along between steps in the HttpManager.
    @type {Any}*/
    this.context = null;

    /**Event that fires before the XMLHttpRequest is created, gives the opportunity to manipulate anything about the HttpRequestArgs.
    @param {EVUI.Modules.Http.HttpEventArgs} httpEventArgs The event arguments containing the data and options for the request.*/
    this.onBeforeSend = function (httpEventArgs)
    {

    };

    /**Event that fires when the XMLHttpRequest has returned with successful status code. The HttpRequestArgs are immutable beyond in this step, but the XMLHttpRequest is available in this step.
    @param {EVUI.Modules.Http.HttpEventArgs} httpEventArgs The event arguments containing the data and the XMLHttpRequest.*/
    this.onSuccess = function (httpEventArgs)
    {

    };

    /**Event that fires under one of two conditions: if the XMLHttpRequest returned something other than a successful status code, or if there was an exception anywhere in the EventStream. If there
    was an exception, the Error property of the HttpEventArgs will be populated.
    @param {EVUI.Modules.Http.HttpEventArgs} httpEventArgs The event arguments containing the data and options for the XMLHttpRequest.*/
    this.onError = function (httpEventArgs)
    {

    };

    /**Event that fires whenever the request completes or is canceled. If the XMLHttpRequest returned something other than a 200 status code, or if there was an exception anywhere in the EventStream. If there
    was an exception, the Error property of the HttpEventArgs will be populated.
    @param {EVUI.Modules.Http.HttpEventArgs} httpEventArgs The event arguments containing the data and options for the XMLHttpRequest.*/
    this.onComplete = function (httpEventArgs)
    {

    };
};

/**An object representing a key-value pair for a HTTP header.
@class*/
EVUI.Modules.Http.HttpRequestHeader = function (key, value)
{
    if (key != null && typeof key !== "string" && typeof key !== "number") throw new Error("HttpRequestHeader key must be a string or a number.");
    if (value != null && typeof value !== "string" && typeof value !== "number" && typeof key !== "boolean") throw new Error("HttpRequestHeader value must be a string, boolean, or a number.");

    var _key = key;
    var _value = value;

    /**String or Number. The name of the header. 
    @type {String|Number}*/
    this.key = null;
    Object.defineProperty(this, "key", {
        get: function () { return _key; },
        set: function (value)
        {
            if (value == null || (typeof key !== "string" && typeof key !== "number")) throw new Error("HttpRequestHeader key must be a string or a number.");
            _key = value;
        },
        enumerable: true,
        configurable: false
    });

    /**String, Boolean, or Number. The value of the header.
    @type {String|Number|Boolean}*/
    this.value = null;
    Object.defineProperty(this, "value", {
        get: function () { return _value; },
        set: function (value)
        {
            if (value == null || (typeof value !== "string" && typeof value !== "number" && typeof key !== "boolean")) throw new Error("HttpRequestHeader value must be a string, boolean, or a number.");
            _value = value;
        },
        enumerable: true,
        configurable: false
    });
};

/**Event arguments used by the HttpManager to coordinate the sending of HTTP requests.
@class*/
EVUI.Modules.Http.HttpEventArgs = function (request, xhr, error, response)
{
    if (request instanceof EVUI.Modules.Http.HttpRequestArgs == false) throw new Error("Request must be an instance of HttpRequestArgs");
    var _request = request;
    var _xhr = xhr;
    var _error = error;
    var _response = response;

    /**Object. The HttpRequestArgs that contain the mutable details of the request.
    @type {EVUI.Modules.Http.HttpRequestArgs}*/
    this.request = null;
    Object.defineProperty(this, "request", {
        get: function () { return _request; },
        configurable: false,
        enumerable: true
    });

    /**Object. The XMLHttpRequest that was executed and has completed.
    @type {XMLHttpRequest}*/
    this.xmlHttpRequest = null;
    Object.defineProperty(this, "xmlHttpRequest", {
        get: function () { return _xhr; },
        configurable: false,
        enumerable: true
    });

    /**Object. The EVUI.Modules.EventStream.EventStreamError that contain the details of the request.
    @type {EVUI.Modules.EventStream.EventStreamError}*/
    this.error = null;
    Object.defineProperty(this, "error", {
        get: function () { return _error; },
        configurable: false,
        enumerable: true
    });

    /**Any. In the event of a successful completion of the request, the ResponseType is used to interpret the response from the server and produce the final result of the request.
    @type {Any}*/
    this.response = null;
    Object.defineProperty(this, "response", {
        get: function () { return _response; },
        configurable: false,
        enumerable: true
    });

    /**Number. The Http status code of the request.
    @type {Number}*/
    this.statusCode = 0;
    Object.defineProperty(this, "statusCode", {
        get: function () { return _xhr == null ? 0 : _xhr.status; },
        configurable: false,
        enumerable: true
    });

    /**Boolean. Whether or not the status code was in the successful range.
    @type {Boolean}*/
    this.success = false;
    Object.defineProperty(this, "success", {
        get: function ()
        {
            if (_xhr == null) return false;
            return ((_xhr.status >= 200 && _xhr.status < 300) || _xhr.status === 304)
        },
        configurable: false,
        enumerable: true
    });

    /**Number. The current HttpRequestStatus of the request.
    @type {Number}*/
    this.requestStatus = EVUI.Modules.Http.HttpRequestStatus.NotStarted;

    /**String. The full name of the event.
    @type {String}*/
    this.eventName = null;

    /**String. The type of event being raised.
    @type {String}*/
    this.eventType = null;

    /**Pauses the HTTP request, preventing the next step from executing until resume is called.*/
    this.pause = function () { };

    /**Resumes the HTTP request, allowing it to continue to the next step.*/
    this.resume = function () { };

    /**Cancels the HTTP request and aborts the execution of the operation.*/
    this.cancel = function () { }

    /**Stops the HttpManager from calling any other event handlers with the same eventType.*/
    this.stopPropagation = function () { };

    /**Object. Any state value to carry between events.
    @type {Object}*/
    this.context = {};
};

/**An object that contains all the information about a completed HTTP request. 
@class*/
EVUI.Modules.Http.CompletedHttpRequest = function (xhr)
{
    var _self = this;
    var _xhr = xhr;
    var _responseHeaders = null;

    /**String. The ID of the request. 
    @type {String}*/
    this.requestID = null;

    /**Boolean. Whether or not the status code was in the successful range.
    @type {Boolean}*/
    this.success = false;
    Object.defineProperty(this, "success", {
        get: function ()
        {
            return ((_self.statusCode >= 200 && _self.statusCode < 300) || _self.statusCode === 304);
        },
        configurable: false,
        enumerable: true
    });

    /**Any. The response from the server.
    @type {Any}*/
    this.response = null;

    /**Object. The HttpRequestArgs that contain the information needed to run the request.
    @type {EVUI.Modules.Http.HttpRequestArgs}*/
    this.httpRequestArgs = null;

    /**Object. The XMLHttpRequest that was executed.
    @type {XMLHttpRequest}*/
    this.xmlHttpRequest = null;
    Object.defineProperty(this, "xmlHttpRequest", {
        get: function ()
        {
            return _xhr;
        },
        configurable: false,
        enumerable: true
    });

    /**Object. The error that occurred during the execution of the request if one occurred.
    @type {EVUI.Modules.EventStream.EventStreamError}*/
    this.error = null;

    /**Number. The HttpRequestStatus of the request when it finished.
    @type {Number}*/
    this.requestStatus = EVUI.Modules.Http.HttpRequestStatus.NotStarted;

    /**Number. The Http status code of the request.
    @type {Number}*/
    this.statusCode = 0;

    /**Array. An array of HttpRequestHeaders representing the headers that came back with the response.
    @type {EVUI.Modules.Http.HttpRequestHeader[]}*/
    this.responseHeaders = null;
    Object.defineProperty(this, "responseHeaders", {
        get: function ()
        {
            if (_responseHeaders != null) return _responseHeaders;
            if (_responseHeaders == null)
            {
                if (_xhr.readyState !== XMLHttpRequest.DONE) return null;
                _responseHeaders = [];

                var headerStr = _xhr.getAllResponseHeaders();
                if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(headerStr) === true) return _responseHeaders;

                var rawHeaders = headerStr.split(/\r\n/g);
                var numHeaders = rawHeaders.length;
                for (var x = 0; x < numHeaders; x++)
                {
                    var curHeader = rawHeaders[x];

                    var keyEnd = curHeader.indexOf(":");
                    if (keyEnd === -1) continue;

                    var key = curHeader.substring(0, keyEnd).trim();
                    var value = (keyEnd + 1 >= curHeader.length) ? "" : curHeader.substring(keyEnd + 1).trim();

                    var header = new EVUI.Modules.Http.HttpRequestHeader(key, value);
                    _responseHeaders.push(header);
                }

                return _responseHeaders;                
            }
        },
        configurable: false,
        enumerable: true
    })
};

/**An immutable copy of the internal object that represents an active XMLHTTPRequest.
@class*/
EVUI.Modules.Http.HttpRequestInstance = function (request)
{
    var _request = request;
    var requestArgs = EVUI.Utils.ShallowExtend(new EVUI.Modules.Http.HttpRequestArgs(), request.HttpRequestArgs);

    /**String. The ID of the request.
    @type {String}*/
    this.requestID = null;
    Object.defineProperty(this, "requestID",
        {
            get: function () { return _request.requestID },
            enumerable: true
        });

    /**Number. A value from the EVUI.Resources.EventStreamStatus enum indicating the status of the interal EventStream.
    @type {Number}*/
    this.eventStreamStatus = EVUI.Resources.EventStreamStatus.NotStarted;
    Object.defineProperty(this, "eventStreamStatus",
        {
            get: function () { return _request.eventStream.getStatus(); },
            enumerable: true
        });

    /**Object. The HttpRequestArgs that contain the information needed to run the request.
    @type {EVUI.Modules.Http.HttpRequestArgs}*/
    this.request = null;
    Object.defineProperty(this, "request",
        {
            get: function () { return requestArgs },
            enumerable: true
        });

    /**Object. The XMLHttpRequest that was executed.
    @type {XMLHttpRequest}*/
    this.xmlHttpRequest = null;
    Object.defineProperty(this, "xmlHttpRequest",
        {
            get: function () { return _request.xmlHttpRequest },
            enumerable: true
        });

    /**String. A value from the EVUI.Modules.Http.HttpRequestStatus enum.
    @type {Number}*/
    this.requestStatus = EVUI.Modules.Http.HttpRequestStatus.NotStarted;
    Object.defineProperty(this, "requestStatus",
        {
            get: function () { return _request.requestStatus },
            enumerable: true
        });

    /**Object. The error that occurred during the execution of the request.
    @type {EVUI.Modules.EventStream.EventStreamError}*/
    this.error = null;
    Object.defineProperty(this, "error",
        {
            get: function () { return _request.error },
            enumerable: true
        });

    /**Any. The parsed response from the XMLHttpRequest.
    @type {Any}*/
    this.response = null;
    Object.defineProperty(this, "response",
        {
            get: function () { return _request.response },
            enumerable: true
        });

    /**Forces a paused HTTP request to be resumed.
    @returns {Boolean}*/
    this.forceResume = function ()
    {
        if (_request.EventStream.getStatus() === EVUI.Resources.EventStreamStatus.Paused) return _request.eventStream.resume();
        return false;
    };
};

/**Enum for describing the status of the request in progress.
@enum*/
EVUI.Modules.Http.HttpRequestStatus =
{
    NotStarted: 0,
    Opened: 1,
    Sent: 2,
    Complete: 3,
    Canceled: 4,
    Failed: 5,
    Exception: 6,
    TimedOut: 7,
    Aborted: 8
};
Object.freeze(EVUI.Modules.Http.HttpRequestStatus);

/**Enum for describing the desired response from the server.
@enum*/
EVUI.Modules.Http.HttpResponseType =
{
    Unknown: "unknown",
    Blob: "blob",
    ArrayBuffer: "arraybuffer",
    XML: "xml",
    HTML: "html",
    Text: "text",
    JSON: "json",
    Document: "document"
};
Object.freeze(EVUI.Modules.Http.HttpResponseType);

/**Global instance of HttpManager, a utility used for making HTTP requests using a sequence of events.
@type {EVUI.Modules.Http.HttpManager}*/
EVUI.Modules.Http.Http = null;
(function ()
{
    var ctor = EVUI.Modules.Http.HttpManager;
    var http = null;

    Object.defineProperty(EVUI.Modules.Http, "Http",
    {
        get: function ()
        {
            if (http == null) http = new ctor();
            return http;
        },
        enumerable: true,
        configurable: false
    });
})();

/**Constructor reference for the HttpManager.*/
EVUI.Constructors.Http = EVUI.Modules.Http.HttpManager;

delete $evui.httpEventStream;

/**The global instance of HttpManager, a utility used for making Http requests.
@type {EVUI.Modules.Http.HttpManager}*/
$evui.httpManager = null;
Object.defineProperty($evui, "httpManager",
{
    get: function ()
    {
        return EVUI.Modules.Http.Http;
    },
    enumerable: true
});

/**Executes an XMLHttpRequest using the HttpRequestArgs
@param {EVUI.Modules.Http.HttpRequestArgs} requestArgs An instance or graph of HttpRequestArgs that describe the type of XMLHttpRequest to make.
@param {EVUI.Modules.Http.Constants.Fn_HttpCallback} callback A callback to call once the HTTP request completes**/
$evui.http = function (requestArgs, callback)
{
    $evui.httpManager.send(requestArgs, callback);
};


/** Executes an XMLHttpRequest using HttpRequestArgs
@param {EVUI.Modules.Http.HttpRequestArgs} requestArgs An instance or graph of HttpRequestArgs that describe the type of XMLHttpRequest to make.
@returns {Promise<EVUI.Modules.Http.CompletedHttpRequest>} */
$evui.httpAsync = function (requestArgs)
{
    return $evui.httpManager.sendAsync(requestArgs);
};

Object.freeze(EVUI.Modules.Http);

/*#ENDWRAP(Http)#*/