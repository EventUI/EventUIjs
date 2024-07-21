/**Copyright (c) 2024 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

/**Module for containing the EventStream, an asynchronous Promise driven chain of arbitrary functions used to create event-driven interfaces.
@module*/
EVUI.Modules.EventStream = {};

EVUI.Modules.EventStream.Dependencies =
{
    Core: Object.freeze({ required: true })
};

(function ()
{
    var checked = false;

    Object.defineProperty(EVUI.Modules.EventStream.Dependencies, "checked",
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

Object.freeze(EVUI.Modules.EventStream.Dependencies);

/**Constants table for the EventStream module. */
EVUI.Modules.EventStream.Constants = {};

/**Function for completing a "Job" step in an EventStream.  
@param {EVUI.Modules.EventStream.EventStreamJobResult} jobResult An instance of EVUI.Modules.EventStream.EventStreamJobResult that carries the result of the job. */
EVUI.Modules.EventStream.Constants.Fn_Job_Callback = function (jobResult) { };

/**Function for handling a Step in a EventStream.
@param {EVUI.Modules.EventStream.EventStreamJobArgs|EVUI.Modules.EventStream.EventStreamEventArgs} jobOrEventArgs If the step is a Job, this will be an instance of EventStreamJobArgs. If this step is an event it gets either a EventStreamEventArgs 
or custom event arguments defined by another author.*/
EVUI.Modules.EventStream.Constants.Fn_Step_Handler = function (jobOrEventArgs) { };

/**Function for handling a Step in a EventStream that is a Job.
@param {EVUI.Modules.EventStream.EventStreamJobArgs} jobArgs An instance of EventStreamJobArgs.*/
EVUI.Modules.EventStream.Constants.Fn_Job_Handler = function (jobArgs) { };

/**Function for handling a Step in a EventStream that is an event.
@param {EVUI.Modules.EventStream.EventStreamEventArgs} eventArgs Either a EventStreamEventArgs object or custom event arguments defined by another author.*/
EVUI.Modules.EventStream.Constants.Fn_Event_Handler = function (eventArgs) { };

/**Synchronous event handler for handling cases where an error occurred at any point during the process. Cannot be an async function.
@param {EVUI.Modules.EventStream.EventStreamEventArgs} eventArgs An instance of EventStreamEventArgs.
@param {EVUI.Modules.EventStream.EventStreamError} ex The error that was thrown by the code in the event sequence or the response caused by a rejection of a job.*/
EVUI.Modules.EventStream.Constants.Fn_OnError = function (eventArgs, ex) { };

/**Synchronous event handler that executes whenever the EventStream has been completed or terminated. Cannot be an async function.
@param {EVUI.Modules.EventStream.EventStreamEventArgs} eventArgs An instance of EventStreamEventArgs.*/
EVUI.Modules.EventStream.Constants.Fn_OnComplete = function (eventArgs) { };

/**Synchronous event handler for handling cases where the EventStream was canceled before it was finished. Cannot be an async function.
@param {EVUI.Modules.EventStream.EventStreamEventArgs} eventArgs An instance of EventStreamEventArgs.*/
EVUI.Modules.EventStream.Constants.Fn_OnCancel = function (eventArgs) { };

/**Takes the event args generated for default events and gives the consumer of the EventStream a chance to inject its own event args. Cannot be an async function.
@param {EVUI.Modules.EventStream.EventStreamEventArgs} eventArgs An instance of EventStreamEventArgs.
@returns {Object}*/
EVUI.Modules.EventStream.Constants.Fn_ProcessInjectedEventArgs = function (eventArgs) { };

/**Takes the event args that were passed into the event handler and gives the consumer a chance to react to any changes made to them or react to the value returned from the event handler. Cannot be an async function.
@param {EVUI.Modules.EventStream.EventStreamEventArgs} args An instance of EventStreamEventArgs or the event args made in processInjectedEventArgs.
@param {Any} handlerResult The returned value from the handler.
@param {EVUI.Modules.EventStream.EventStreamStep} step An instance of EventStreamStep
@param {Any} jobState The current private state object for the EventStream that is only available to Jobs.
@param {Any} eventState The current public state object for the EventStream that is only available to Events.*/
EVUI.Modules.EventStream.Constants.Fn_ProcessReturnedEventArgs = function (args, handlerResult, step, jobState, eventState) { }

/**Manager for an asynchronous yet ordered sequence of functions.
@param {EVUI.Modules.EventStream.EventStreamConfig} config Configuration options to initialize the EventStream with.
@class*/
EVUI.Modules.EventStream.EventStream = function (config)
{
    if (EVUI.Modules.Core == null) throw Error("Dependency missing: EVUI.Modules.Core is required.");
    EVUI.Modules.Core.Utils.requireAll(EVUI.Modules.EventStream.Dependencies);

    var _self = this; //self reference for closures
    var _sequence = []; //the current sequence of steps
    var _status = EVUI.Modules.EventStream.EventStreamStatus.NotStarted; //the current state of execution for the sequence of steps
    var _pausedStepIndex = -1; //in the event that this event chain was paused, this is the current index of the last event fired
    var _jobExecuting = false; //whether or not a job step is currently executing
    var _pausedWhileJobExecuting = false; //whether or not someone canceled the job outside of the event handler
    var _lastJobResult = null; //the return value of a job that was paused before its callback was fired
    var _timerID = -1; //the ID of the timer callback 
    var _nonPropagatedEvents = []; //events that have been set to not be fired again if they occur multiple times in the same sequence
    var _numSteps = 0; //the number of steps that have been executed by this instance since it was last reset. Every 250 (default, or $evui.settings.stepsBetweenWaits if it is a valid number) steps a setTimeout is used instead of a promise resolution.
    var _asyncMode = false; //whether or not the event stream was started in async mode and returned a promise.
    var _resolver = null; //the "resolve" function from the promise while in async mode
    var _rejecter = null; //the reject function from the promise while in async mode
    var _canUsePromises = typeof Promise !== "undefined";
    var _eventExecuting = false; //whether or not an event is currently being executed
    var _resumedWhileEventExecuting = false; 
    var _p = (_canUsePromises === true) ? Promise.resolve() : null;

    /**The current EVUI.Modules.EventStream.EventStreamStep
    @type {EVUI.Modules.EventStream.EventStreamStep}*/
    var _currentStep = null;

    /**A EVUI.Modules.EventStream.EventStreamError object representing an error thrown at some point during the process 
    @type {EVUI.Modules.EventStream.EventStreamError}*/
    var _error = null;

    /**Boolean. Whether or not the stream can seek and forth between steps. True by default.
    @type {Boolean}*/
    this.canSeek = true;

    /**Boolean. Whether or not a crash in an Event handler will cause the EventStream to stop executing. False by default.
    @type {Boolean}*/
    this.endExecutionOnEventHandlerCrash = false;

    /**Number. The number of milliseconds to wait on each step before failing the EventStream. A negative number means no timeout. -1 by default.
    @type {Number}*/
    this.timeout = -1;

    /**Any. Any data to carry between Jobs in the EventStream. A plain object by default.
    @type {Any}*/
    this.jobState = {};

    /**Any. Any data to carry between Events in the EventStream. A plain object by default.
    @type {Any}*/
    this.eventState = {};

    /**Any. The "this" context to execute job and event handlers under.
    @type {Any}*/
    this.context = null;

    /**Object. A BubblingEventsManager that bubbling events will be drawn from during the EventStream's execution.
    @type {EVUI.Modules.EventStream.BubblingEventManager|EVUI.Modules.EventStream.BubblingEventManager[]}*/
    this.bubblingEvents = null;

    /**Number. When the EventStream is running, this is the number of sequential steps that can be executed before introducing a shot timeout to free up the thread to allow other processes to continue, otherwise an infinite step loop (which is driven by promises) will lock the thread. Small numbers will slow down the EventStream, high numbers may result in long thread locks. 250 by default.
    @type {Number}*/
    this.skipInterval = EVUI.Modules.Core.Settings.stepsBetweenWaits;

    /**Boolean. Whether or not the steps added to the EventStream should have their properties extended onto a fresh step object.
    @type {Boolean}*/
    this.extendSteps = true;

    /**Gets the current status of the EventStream. Returns a value from EventStreamStatus.
    @returns {Number} A value from the EVUI.Modules.EventStream.EventStreamStatus enum.*/
    this.getStatus = function ()
    {
        return _status;
    };

    /**Gets a COPY of the array of internal steps currently set for this EventStream.
    @returns {EVUI.Modules.EventStream.EventStreamStep[]} An array ofEventStreamSteps.*/
    this.getSteps = function ()
    {
        var copy = _sequence.slice();
        return copy;
    };

    /**Gets the currently executing step.
    @returns {EVUI.Modules.EventStream.EventSteamStep} The currently executing EventStreamStep.*/
    this.getCurrentStep = function ()
    {
        return _currentStep;
    };

    /**Whether or not the EventStream is currently in executing and in an immutable state.
    @returns {Boolean} True if the EventStream is actively working, false if it is in a paused, completed, or canceled state.*/
    this.isWorking = function ()
    {
        return !isStable();
    };

    /**Gets a step based on it's EventKey.
    @param {String} key The EventKey for the step to get.
    @param {Number} type The EVUI.Modules.EventStream.EventStreamStepType of the step to get.
    @returns {EVUI.Modules.EventStream.EventStreamStep} The EventStreamStep with the given key/type combination.*/
    this.getStep = function (key, type)
    {
        var result = getStep(key, type);
        if (result == null) return null;

        return result;
    };

    /**Clears the EventStream of all members.
    @returns {Boolean}*/
    this.clear = function ()
    {
        if (isStable() === false)
        {
            return false;
        }

        _sequence = [];
        this.bubblingEvents = null;

        this.reset();

        return true;
    };

    /**Synchronous event handler for handling cases where an error occurred at any point during the process. Cannot be an async function.
    @param {EVUI.Modules.EventStream.EventStreamEventArgs} args An instance of EventStreamEventArgs.
    @param {EVUI.Modules.EventStream.EventStreamError} ex The error that was thrown by the code in the event sequence or the response caused by a rejection of a job.*/
    this.onError = function (args, ex)
    {
    };

    /**Synchronous event handler for handling cases where the EventStream was canceled before it was finished. Cannot be an async function.
    @param {EVUI.Modules.EventStream.EventStreamEventArgs} args An instance of EventStreamEventArgs.*/
    this.onCancel = function (args)
    {

    };

    /**Synchronous event handler that executes whenever the EventStream has been completed or terminated. Cannot be an async function.
    @param {EVUI.Modules.EventStream.EventStreamEventArgs} args An instance of EventStreamEventArgs.*/
    this.onComplete = function (args)
    {

    };

    /**Executes the EventStream.
    @returns {Boolean}*/
    this.execute = function ()
    {
        if (this.reset() === false) return false;

        _status = EVUI.Modules.EventStream.EventStreamStatus.Working;
        triggerAsyncCall(function ()
        {
            _currentStep = _sequence[0];
            executeStep(_sequence, 0);
        });        

        return true;
    };

    /**Executes the EventStream in an awaitable mode.
    @returns {Promise}*/
    this.executeAsync = function ()
    {
        return new Promise(function (resolve, reject)
        {
            if (_self.execute() === false)
            {
                _asyncMode = false;
                _resolver = null;
                _rejecter = null;

                reject(new EVUI.Modules.EventStream.EventStreamError("Failed to reset EventStream, cannot begin execution."));
                return;
            }

            _asyncMode = true;
            _resolver = resolve;
            _rejecter = reject;
        });
    };

    /**Resets the EventStream if it is not currently executing.
    @returns {Boolean}*/
    this.reset = function ()
    {
        if (isStable() === false)
        {
            return false;
        }

        clearQueuedTimeout();

        _status = EVUI.Modules.EventStream.EventStreamStatus.NotStarted;
        _self.eventState = (_self.eventState === undefined) ? {} : _self.eventState;
        _self.jobState = (_self.jobState === undefined) ? {} : _self.jobState;
        _currentStep = null;
        _pausedStepIndex = -1;
        _pausedWhileJobExecuting = false;
        _error = null;
        _lastJobResult = null;
        _jobExecuting = false;
        _timeout = -1;
        _nonPropagatedEvents = []
        _numSteps = 0;

        if (_asyncMode === true)
        {
            _asyncMode = false;
            var reject = _rejecter;
            _resolver = null;
            _rejecter = null;

            reject(new EVUI.Modules.EventStream.EventStreamError("Stream was reset before Promise resolution."));
        }

        return true;
    };

    /**Takes the event args generated for default events and gives the consumer of the EventStream a chance to inject its own event args. Cannot be an async function.
    @param {EVUI.Modules.EventStream.EventStreamEventArgs} args An instance of EventStreamEventArgs.
    @returns {Object}*/
    this.processInjectedEventArgs = function (args)
    {
        return args;
    };

    /**Takes the event args that were passed into the event handler and gives the consumer a chance to react to any changes made to them or react to the value returned from the event handler. Cannot be an async function.
    @param {EVUI.Modules.EventStream.EventStreamEventArgs} args An instance of EventStreamEventArgs or the event args made in processInjectedEventArgs.
    @param {Any} handlerResult The returned value from the handler.
    @param {EVUI.Modules.EventStream.EventStreamStep} step An instance of EventStreamStep
    @param {Object} jobState The current private state object for the EventStream that is only available to Jobs.
    @param {Object} eventState The current public state object for the EventStream that is only available to Events.*/
    this.processReturnedEventArgs = function (args, handlerResult, step, jobState, eventState)
    {
    };

    /**Cancels the operation in progress.
    @returns {Boolean}*/
    this.cancel = function ()
    {
        if (_status === EVUI.Modules.EventStream.EventStreamStatus.Working)
        {
            _status = EVUI.Modules.EventStream.EventStreamStatus.Canceled;
        }
        else
        {
            if (_status === EVUI.Modules.EventStream.EventStreamStatus.Canceled || _status === EVUI.Modules.EventStream.EventStreamStatus.Finished || _status === EVUI.Modules.EventStream.EventStreamStatus.Error) return false;

            var args = makeEventArgs(_currentStep, _sequence, true);

            cancel(args);
            finish(args);
        }

        return true;
    };

    /**Pauses the operation in progress.
    @returns {Boolean}*/
    this.pause = function ()
    {
        if (_status === EVUI.Modules.EventStream.EventStreamStatus.Working)
        {
            _status = EVUI.Modules.EventStream.EventStreamStatus.Paused;
            _pausedStepIndex = _sequence.indexOf(_currentStep);

            if (_jobExecuting === true)
            {
                _pausedWhileJobExecuting = true;
            }
            else //paused during an event, need to make sure the NEXT step is executed and not resuming a job.
            {
                _pausedStepIndex++;
            }

            clearQueuedTimeout(); //stop any timeout if we pause the operation
            return true;
        }

        return false;
    };

    /**Resumes the operation in progress if it has been paused.
    @returns {Boolean}*/
    this.resume = function ()
    {
        if (_status !== EVUI.Modules.EventStream.EventStreamStatus.Paused) return false;

        _status = EVUI.Modules.EventStream.EventStreamStatus.Working;

        if (_pausedWhileJobExecuting === true) //we were in the middle of some other async job when this got paused, so we start back up in the callback (which we blocked calling)
        {
            _pausedWhileJobExecuting = false;
            _pausedStepIndex = -1;
            triggerAsyncCall(function () { jobCompleteCallback(_lastJobResult, _currentStep, _sequence) })
        }
        else //we were likely paused by the event args, so the event handler was firing when we paused, so just start the next step
        {
            if (_eventExecuting === false) //if the event code has exited
            {
                var index = _pausedStepIndex;
                _pausedStepIndex = -1;

                //trigger the bubblinf events for the step that was paused (which will always be 1 less than the pausedStepIndex, which is the index of the paused step + 1)
                triggerBubblingEvents(_sequence[index - 1], function ()
                {
                    //call the next step
                    triggerAsyncCall(function () { executeStep(_sequence, index) }, 0);
                });
            }
            else //still executing an event handler
            {
                _resumedWhileEventExecuting = true;
            }
        }

        return true;
    };

    /**Seeks the async EventStream to a new stage in the chain.
    @param {Number|EVUI.Modules.EventStream.EventStreamStep|String} indexOrKey Either the step object, the index of the step object, or the key of the step object to seek to.
    @returns {Boolean}*/
    this.seek = function (indexOrKey)
    {
        if (_self.canSeek !== true) throw Error("Seeking disabled. Set \"canSeek\" to true.");

        var step = null;

        if (typeof indexOrKey === "number")
        {
            if (indexOrKey >= 0 && indexOrKey < _sequence.length)
            {
                step = _sequence[indexOrKey];
            }
        }
        else if (typeof indexOrKey === "string")
        {
            step = _self.getStep(indexOrKey);
        }
        else if (typeof indexOrKey === "object")
        {
            if (_sequence.indexOf(indexOrKey) !== -1) step = indexOrKey;
        }

        if (step == null) return false;
        var currentlyExecuting = _status === EVUI.Modules.EventStream.EventStreamStatus.Working;
        _status = EVUI.Modules.EventStream.EventStreamStatus.Seeking;

        //set what we need to resume
        _pausedStepIndex = _sequence.indexOf(step);
        _currentStep = step;

        //clear anything else that could have been set while paused
        _pausedWhileJobExecuting = false;
        _lastJobResult = null;
        _nonPropagatedEvents = [];

        if (currentlyExecuting === false) //if we're not currently executing, we need to kick off the process again
        {
            triggerAsyncCall(function () { executeStep(_sequence, _pausedStepIndex) });
        }

        return true;
    };

    /**Causes the EventStream to error out.
    @param {Error} ex An exception to use for the error status.
    @param {String} message A message to display in the error.*/
    this.error = function (ex, message)
    {
        if (isStable() === true) return false;

        _error = new EVUI.Modules.EventStream.EventStreamError("A manual error was thrown" + ((typeof message === "string" && message.length > 0) ? ": " + message : "."), ex, EVUI.Modules.EventStream.EventStreamStage.ErrorCommand, ((_currentStep != null) ? _currentStep.key : null));

        if (_status === EVUI.Modules.EventStream.EventStreamStatus.Working)
        {
            _status = EVUI.Modules.EventStream.EventStreamStatus.Error;
        }
        else if (_status === EVUI.Modules.EventStream.EventStreamStatus.Paused)
        {
            clearQueuedTimeout();
            var args = makeEventArgs(_currentStep, _sequence, true, ex);

            fail(args);
            finish(args);
        }
    };

    /**Stops any other steps from executing with the same event key as the current step.
    @returns {Boolean}*/
    this.stopPropagation = function ()
    {
        if (_currentStep == null) return false;
        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(_currentStep.key) === true) return false;

        if (_nonPropagatedEvents.indexOf(_currentStep.key) === -1)
        {
            _nonPropagatedEvents.push(_currentStep.key);
        }

        return true;
    };

    /**Adds a step to the EventStream. If the first argument is a function, it is treated as a Job type step.
    @param {EVUI.Modules.EventStream.EventStreamStep|EVUI.Modules.EventStream.Constants.Fn_Job_Handler} step An YOLO of EventStreamStep or function to execute after all the other steps have been executed.
    @returns {EVUI.Modules.EventStream.EventStream}*/
    this.addStep = function (step)
    {
        if (step == null) return null;

        var streamStep = null;
        if (typeof step === "function")
        {
            streamStep = new EVUI.Modules.EventStream.EventStreamStep();
            streamStep.key = EVUI.Modules.Core.Utils.makeGuid();
            streamStep.name = "Step " + _sequence.length + " (" + streamStep.key + ")"
            streamStep.handler = step;
        }
        else if (typeof step === "object")
        {
            if (this.extendSteps === false)
            {
                streamStep = new EVUI.Modules.EventStream.EventStreamStep();
                streamStep.handler = step.handler;
                streamStep.key = step.key;
                streamStep.name = step.name;
                streamStep.timeout = step.timeout;
                streamStep.type = step.type;
            }
            else if (EVUI.Modules.Core.Utils.instanceOf(step, EVUI.Modules.EventStream.EventStreamStep) === false)
            {
                streamStep = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.EventStream.EventStreamStep(), step);
            }
            else
            {
                streamStep = step;
            }

            if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(streamStep.key) === true) streamStep.key = EVUI.Modules.Core.Utils.makeGuid();
            if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(streamStep.name) === true) streamStep.name = "Step " + _sequence.length + " (" + streamStep.key + ")"
        }
        else
        {
            throw Error("Unrecognized input. Must be an object or function.");
        }

        _sequence.push(streamStep);

        return this;
    };

    /**Adds a job to the EventStream.
    @param {EVUI.Modules.EventStream.Constants.Fn_Job_Handler|String} handlerOrKey Either the job handler or the key of the job.
    @param {EVUI.Modules.EventStream.Constants.Fn_Job_Handler|String} handlerOrName Optional. Either the job handler or the name of the job.
    @param {EVUI.Modules.EventStream.Constants.Fn_Job_Handler|Number} handlerOrTimeout Optional. Either the job handler or the timeout for the job.
    @param {EVUI.Modules.EventStream.Constants.Fn_Job_Handler} handler Optional. The handler for the job.
    @returns {EVUI.Modules.EventStream.EventStream} */
    this.addJob = function (handlerOrKey, handlerOrName, handlerOrTimeout, handler)
    {
        var step = getStepAmbiguously(handlerOrKey, handlerOrName, handlerOrTimeout, handler);
        step.type = EVUI.Modules.EventStream.EventStreamStepType.Job;

        return this.addStep(step);
    };

    /**Adds an event to the EventStream.
    @param {EVUI.Modules.EventStream.Constants.Fn_Event_Handler|String} handlerOrKey Either the event handler or the key of the event.
    @param {EVUI.Modules.EventStream.Constants.Fn_Event_Handler|String} handlerOrName Optional. Either the event handler or the name of the event.
    @param {EVUI.Modules.EventStream.Constants.Fn_Event_Handler|Number} handlerOrTimeout Optional. Either the event handler or the timeout for the event.
    @param {EVUI.Modules.EventStream.Constants.Fn_Event_Handler} handler Optional. The handler for the event.
    @returns {EVUI.Modules.EventStream.EventStream} */
    this.addEvent = function (handlerOrKey, handlerOrName, handlerOrTimeout, handler)
    {
        var step = getStepAmbiguously(handlerOrKey, handlerOrName, handlerOrTimeout, handler);
        step.type = EVUI.Modules.EventStream.EventStreamStepType.Event;

        return this.addStep(step);
    };

    /**Gets an EventStreamStep based on ambiguous input.
    @param {Function|String} handlerOrKey Either the event handler or the key of the event.
    @param {Function|String} handlerOrName Optional. Either the event handler or the name of the event.
    @param {Function|Number} handlerOrTimeout Optional. Either the event handler or the timeout for the event.
    @param {Function} handler Optional. The handler for the event.
    @returns {EVUI.Modules.EventStream.EventStreamStep} */
    var getStepAmbiguously = function (handlerOrKey, handlerOrName, handlerOrTimeout, handler)
    {
        var handler = null;
        var key = null;
        var name = null;
        var timeout = _self.timeout;
        var handlerSet = false;

        if (typeof handlerOrKey === "function")
        {
            handler = handlerOrKey;
            handlerOrKey = null;

            handlerSet = true;
        }
        else if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(handlerOrKey) === false)
        {
            key = handlerOrKey;
        }

        if (handlerSet === false && typeof handlerOrName === "function")
        {
            handler = handlerOrName;
            handlerOrName = null;

            handlerSet = true;
        }
        else if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(handlerOrName) === false)
        {
            name = handlerOrName;
        }

        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(handlerOrName) === true && EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(key) === false)
        {
            name = key;
        }

        if (handlerSet === false && typeof handlerOrTimeout === "function")
        {
            handler = handlerOrTimeout;
            handlerOrTimeout = null;

            handlerSet = true;
        }
        else if (typeof handlerOrTimeout === "number")
        {
            timeout = handlerOrTimeout;
        }

        if (handlerSet === false && typeof handler === "function")
        {
            handlerSet = true;
        }

        if (handlerSet === false) throw Error("Function expected.");

        var step = new EVUI.Modules.EventStream.EventStreamStep();
        step.handler = handler;
        step.key = key;
        step.name = name;
        step.timeout = timeout;

        return step;
    };

    /**Overridable function for passing a custom value into the resolve function of a promise if the EventStream is running in async mode. Cannot be an async function.
    @returns {Any}*/
    this.getPromiseResolutionValue = function ()
    {

    };   

    /**Internal guts of the async execution of the various steps in the EventStream.
    @param {EVUI.Modules.EventStream.EventStreamStep[]} sequence An array of EVUI.Modules.EventStream.EventStreamStep to execute.
    @param {Number} stepIndex The index of the next step to execute.*/
    var executeStep = function (sequence, stepIndex)
    {
        //make sure we look at the current status of the operation before continuing.
        if (handleStatus(_currentStep, sequence) === false) return;

        //try and get the step
        var step = sequence[stepIndex];
        if (step == null) return finish(makeEventArgs(_currentStep, sequence, true)); //step not there, likely over the bounds of the array - all done

        stepIndex++;
        _currentStep = step;

        handleStep(step);
    };

    /**Main switch for alternating between different step behaviors based on the "Type" property of the step. Defaults to job.
    @method handleStep
    @param {EVUI.Modules.EventStream.EventStreamStep} step An instance of EVUI.Modules.EventStream.EventStreamStep representing the step to execute.*/
    var handleStep = function (step)
    {
        if (step == null)
        {
            _self.error(null, "Failed to handle step, no step present.");
        }

        //see if the event is one of the events we have been told not to execute again during this sequence
        var isNonPropagatedEvent = (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(step.key) === false && _nonPropagatedEvents.indexOf(step.key) !== -1);

        //no function to fire, move on to the next step
        if (typeof step.handler !== "function" || isNonPropagatedEvent === true)
        {
            triggerAsyncCall(function ()
            {
                executeStep(_sequence, _sequence.indexOf(step) + 1);
            });

            return;
        }

        //figure out what behavior we want
        var type = EVUI.Modules.EventStream.EventStreamStepType.Job;
        if (typeof step.type === "string")
        {
            type = EVUI.Modules.EventStream.EventStreamStepType.getStepType(step.type);
        }

        if (type === EVUI.Modules.EventStream.EventStreamStepType.Job)
        {
            handleJob(step);
        }
        else if (type === EVUI.Modules.EventStream.EventStreamStepType.Event || type === EVUI.Modules.EventStream.EventStreamStepType.GlobalEvent)
        {
            handleEvent(step);
        }
    };

    /**Entry point for executing a job function.
    @method handleJob
    @param {EVUI.Modules.EventStream.EventStreamStep} step A EVUI.Modules.EventStream.EventStreamStep to execute as a job.*/
    var handleJob = function (step)
    {
        //before doing any work, start the timeout timer
        queueTimeout(step);

        //set a flag preventing multiple fires of the callback
        var callbackFired = false;

        //this is the internal callback that gets injected into the "Job" function - it's up to the author of the Job function to call the callback - otherwise the event chain fails.
        //takes a EVUI.Modules.EventStream.EventStreamJobResult as an optional parameter.
        var callback = function (jobResult)
        {
            if (callbackFired === true) return; //callback already fired, don't fire again
            callbackFired = true;

            clearQueuedTimeout(); //we also clear the timeout in jobCompleteCallback, but since we're executing that asynchronously, its possible the thread may get blocked in the meantime by something else and cause the timer to go off. So we cancel it before doing anything else

            //in case this callback was called synchronously by the Job function, we execute it asynchronously
            triggerAsyncCall(function ()
            {
                _lastJobResult = jobResult;
                jobCompleteCallback(jobResult, step, _sequence);
            });
        };

        try
        {
            _jobExecuting = true;

            var jobArgs = new EVUI.Modules.EventStream.EventStreamJobArgs(_self, callback);
            jobArgs.resolvedValue = (_lastJobResult == null) ? null : _lastJobResult.resolvedValue;
            jobArgs.key = step.key;
            jobArgs.name = step.name;

            if (_self.context != null)
            {
                step.handler.call(_self.context, jobArgs)
            }
            else
            {
                step.handler(jobArgs); //pass in the current state data and the callback into the job
            }
        }
        catch (ex) //job failed, end the process
        {
            _jobExecuting = false;
            _error = new EVUI.Modules.EventStream.EventStreamError("Job failed.", ex, EVUI.Modules.EventStream.EventStreamStage.Job, step.key);
            clearQueuedTimeout();

            var args = makeEventArgs(_currentStep, _sequence, true, _error);

            fail(args);
            return finish(args);
        }
    };

    /**Entry point to executing an event.
    @method handleEvent
    @param {EVUI.Modules.EventStream.EventStreamStep} step An instance of EVUI.Modules.EventStream.EventStreamStep to execute.*/
    var handleEvent = function (step)
    {
        _eventExecuting = true;

        //execute the event handler associated with this event. This can change the current _status of the event chain via the event args object that is passed into the event handler
        var eventHandlerResult = executeEventHandler(_currentStep, _sequence);

        _eventExecuting = false;
        if (eventHandlerResult instanceof ReturnedEventPromiseWrapper)
        {
            var completeEvent = function (value)
            {
                if (typeof _self.processReturnedEventArgs === "function")
                {
                    try
                    {
                        var returnResult = _self.processReturnedEventArgs(eventHandlerResult.args, value, step, _self.jobState, _self.eventState);
                        if (EVUI.Modules.Core.Utils.isPromise(returnResult) === true) throw Error("processReturnedEventArgs cannot be an async function.");
                    }
                    catch (ex) //failed, record the error
                    {
                        _status = EVUI.Modules.EventStream.EventStreamStatus.Error;
                        _error = new EVUI.Modules.EventStream.EventStreamError("Error processing returned event args.", ex, EVUI.Modules.EventStream.EventStreamStage.ProcessReturnedEventArgs, step.key);
                    }
                }

                //handle any change in status that may have happened during the execution of the handler
                if (handleStatus(step, _sequence) === false) return;

                triggerBubblingEvents(step, function ()
                {
                    //get the next step in the sequence based on the index of the current step. If the current step is not in sequence, let the indexer fail and the next step will handle the fail case
                    var nextStepindex = _sequence.indexOf(step);
                    if (nextStepindex >= 0) nextStepindex++;

                    //call the next step
                    triggerAsyncCall(function () { executeStep(_sequence, nextStepindex) }, 0);
                });
            };

            eventHandlerResult.promise.catch(function (error) //promise catching logic
            {
                _error = new EVUI.Modules.EventStream.EventStreamError("Error executing event handler.", error, EVUI.Modules.EventStream.EventStreamStage.Handler, step.key);
                _status = EVUI.Modules.EventStream.EventStreamStatus.Error;

                completeEvent(error)
            });

            eventHandlerResult.promise.then(function (value) //we can't use await, but we can mimic the behavior with .then
            {
                completeEvent(value);
            });
        }
        else
        {
            //handle any change in status that may have happened during the execution of the handler
            if (handleStatus(step, _sequence) === false) return;

            triggerBubblingEvents(step, function ()
            {
                //get the next step in the sequence based on the index of the current step. If the current step is not in sequence, let the indexer fail and the next step will handle the fail case
                var nextStepindex = _sequence.indexOf(step);
                if (nextStepindex >= 0) nextStepindex++;

                //call the next step
                triggerAsyncCall(function () { executeStep(_sequence, nextStepindex) }, 0);                
            });
        }
    };

    /**Creates a sub EventStream that handles all of the events added via "addEventListener"
    @param {EVUI.Modules.EventStream.EventStreamStep} step The step to get events for.
    @param {Function} callback A callback function to call once the sub EventStream completes.*/
    var triggerBubblingEvents = function (step, callback)
    {
        if (_self.bubblingEvents == null || (typeof _self.bubblingEvents.getBubblingEvents !== "function" && EVUI.Modules.Core.Utils.isArray(_self.bubblingEvents) === false)) return callback();

        var bubblingEvents = null;

        try
        {
            if (EVUI.Modules.Core.Utils.isArray(_self.bubblingEvents) === true)
            {
                bubblingEvents = [];
                var numBubblers = _self.bubblingEvents.length;
                for (var x = 0; x < numBubblers; x++)
                {
                    var curBubbler = _self.bubblingEvents[x];
                    if (EVUI.Modules.Core.Utils.isObject(curBubbler) === false) continue;
                    if (typeof curBubbler.getBubblingEvents !== "function") continue;

                    var curBubblingEvents = curBubbler.getBubblingEvents(step);
                    var numEvents = (curBubblingEvents == null) ? 0 : curBubblingEvents.length;
                    for (var y = 0; y < numEvents; y++)
                    {
                        bubblingEvents.push(curBubblingEvents[y]);
                    }
                }
            }
            else
            {
                bubblingEvents = _self.bubblingEvents.getBubblingEvents(step);
            }           
        }
        catch (ex)
        {
            EVUI.Modules.Core.Utils.log(ex);
            return callback();
        }

        if (bubblingEvents == null) return callback();

        var numEvents = bubblingEvents.length;
        if (numEvents === 0) return callback();

        var p = new Promise(function (resolve)
        {
            var config = new EVUI.Modules.EventStream.EventStreamConfig();
            config.context = _self.context;
            config.canSeek = _self.canSeek;
            config.endExecutionOnEventHandlerCrash = true;
            config.eventState = _self.eventState;
            config.processReturnedEventArgs = _self.processReturnedEventArgs;
            config.skipInterval = _self.skipInterval;
            config.extendSteps = _self.extendSteps;
            config.timeout = (typeof _self.timeout === "number") ? _self.timeout : -1;
            config.onComplete = function () { resolve(); } //call the callback in the complete handler, which will fire no matter what.

            var subStream = new EVUI.Modules.EventStream.EventStream(config);

            //set up an option on the seek function to optionally seek back in the parent stream instead of the sub stream
            subStream.processInjectedEventArgs = function (eventArgs)
            {
                var processedArgs = _self.processInjectedEventArgs(eventArgs);
                if (_self.canSeek === true && processedArgs.seek != null)
                {
                    processedArgs.seek = function (indexOrKey, seekInParent)
                    {
                        if (seekInParent === true)
                        {
                            subStream.cancel();
                            _self.seek(indexOrKey);
                        }
                        else
                        {
                            subStream.seek(indexOrKey);
                        }
                    };
                }

                return processedArgs;
            };

            for (var x = 0; x < numEvents; x++)
            {
                var curEvent = bubblingEvents[x];
                if (curEvent == null) continue;

                subStream.addStep(makeBubblingStep(step, curEvent));
            }

            //execute the sub-stream
            subStream.execute();
        });

        p.then(function ()
        {
            callback();
        });
    };

    /**Makes a EventStreamStep representing the "bubbling" events that come off of real events via being added by addEventListener.
    @param {EVUI.Modules.EventStream.EventStreamStep} parentStep The event who the bubbling event is being made for.
    @param {EVUI.Modules.EventStream.EventStreamEventListener} eventListener The internal listener containing the data needed to handle the event.
    @returns {EVUI.Modules.EventStream.EventStreamStep}  */
    var makeBubblingStep = function (parentStep, eventListener)
    {
        var step = new EVUI.Modules.EventStream.EventStreamStep();
        step.key = eventListener.eventName;
        step.tieout = parentStep.timeout;
        step.type = EVUI.Modules.EventStream.EventStreamStepType.Event;
        step.handler = function (eventArgs)
        {
            if (typeof eventListener.handler === "function")
            {
                return eventListener.handler(eventArgs);
            }
        };

        return step;
    };

    /**Callback function following each job step. Handles the response, calls the handler, and continues the async loop.
    @method jobCompleteCallback
    @param {EVUI.Modules.EventStream.EventStreamJobResult} jobResult An instance of EVUI.Modules.EventStream.EventStreamJobResult produced by the step's Job function.
    @param {EVUI.Modules.EventStream.EventStreamStep} step An instance of EVUI.Modules.EventStream.EventStreamStep representing the step being executed.
    @param {EVUI.Modules.EventStream.EventStreamStep[]} sequence An Array of EVUI.Modules.EventStream.EventStreamStep representing the chain of events being executed.*/
    var jobCompleteCallback = function (jobResult, step, sequence)
    {
        _jobExecuting = false;

        //clear the idle timeout, the job finished before the timeout hit
        clearQueuedTimeout();

        //process the job result and set the _status accordingly
        stepCallback(jobResult);

        //do whatever the status says we should do
        if (handleStatus(step, sequence) === false) return;

        //get the next step in the sequence based on the index of the current step. If the current step is not in sequence, let the indexer fail and the next step will handle the fail case
        var nextStepindex = sequence.indexOf(step);
        if (nextStepindex >= 0) nextStepindex++;

        //call the next step
        triggerAsyncCall(function () { executeStep(sequence, nextStepindex) }, 0);
    };

    /**Gets a EVUI.Modules.EventStream.EventStreamStep from the internal sequence based on its EventKey.
    @method getStep
    @param {String} key The EventKey of the EVUI.Modules.EventStream.EventStreamStep to get.
    @param {Number} type The EventType of the EVUI.Modules.EventStream.EventStreamStep to get.
    @returns {EVUI.Modules.EventStream.EventStreamStep} The matching EVUI.Modules.EventStream.EventStreamStep with the matching key/type combination, or null if there is no match.*/
    var getStep = function (key, type)
    {
        if (typeof key !== "string") return null;
        var lowerKey = key.toLowerCase();

        var numSteps = _sequence.length;
        for (var x = 0; x < numSteps; x++)
        {
            var curStep = _sequence[x];

            if (curStep.key.toLowerCase() === lowerKey)
            {
                if (type != null)
                {
                    var type = EVUI.Modules.EventStream.EventStreamStepType.getStepType(type);
                    var eventType = EVUI.Modules.EventStream.EventStreamStepType.getStepType(curStep.Type);
                    if (type == eventType) return curStep;
                }
                else
                {
                    return curStep;
                }
            }
        }

        return null;
    };

    /**Makes an event args object to be passed into the step's event handler.
    @method makeEventArgs
    @param {EVUI.Modules.EventStream.EventStreamStep} step An instance of EVUI.Modules.EventStream.EventStreamStep representing the step the event args are for.
    @param {EVUI.Modules.EventStream.EventStreamStep[]} sequence An Array of EVUI.Modules.EventStream.EventStreamStep representing the current execution chain.
    @param {Boolean} ignoreProcessCrash There is an option for the user to make their own event args, setting this to true makes it so a crash in the user's function doesn't crash the EventStream.
    @param {EVUI.Modules.EventStream.EventStreamError} error An instance of EVUI.Modules.EventStream.EventStreamError representing an aggregation of error data.
    @returns {EVUI.Modules.EventStream.EventStreamArgs} Either a EVUI.Modules.EventStream.EventStreamArgs or a custom event args object.*/
    var makeEventArgs = function (step, sequence, ignoreProcessCrash, error)
    {
        if (typeof ignoreProcessCrash === "boolean" && ignoreProcessCrash !== false) ignoreProcessCrash = true;
        if (step == null) step = new EVUI.Modules.EventStream.EventStreamStep();

        var eventArgs = new EVUI.Modules.EventStream.EventStreamEventArgs(_self.eventState);
        eventArgs.currentStep = sequence.indexOf(step);
        eventArgs.key = step.key;
        eventArgs.name = step.name;
        eventArgs.stepType = step.type;
        eventArgs.totalSteps = sequence.length;
        eventArgs.status = _self.getStatus();
        eventArgs.error = error;
        eventArgs.state = _self.eventState;

        attachEvents(eventArgs, step);

        if (typeof _self.processInjectedEventArgs == "function" && step.type !== EVUI.Modules.EventStream.EventStreamStepType.Job) //there is a "ProcessEventArgs" override function that is going to be used to make custom event args.
        {
            try
            {
                var processedArgs = _self.processInjectedEventArgs(eventArgs, _self.jobState); //using our args, the user made their own args
                if (EVUI.Modules.Core.Utils.isPromise(processedArgs) === true) throw Error("processInjectedEventArgs cannot be an async function.");

                if (processedArgs != null && typeof processedArgs === "object") //don't use the return value unless its an object
                {
                    eventArgs = processedArgs;
                }
            }
            catch (ex) //the user's function crashed
            {
                eventArgs.error = new EVUI.Modules.EventStream.EventStreamError("ProcessInjectedEventArgs failed.", ex, EVUI.Modules.EventStream.EventStreamStage.ProcessInjectedEventArgs, step.key); //make an error property for the args
                eventArgs.error.innerError = error; //if we were reporting an error while this happened, populate the inner error

                //attach the special closure functions to expose event chain controls
                if (eventArgs == null) return null; //failed to attach args, the person is likely freezing, sealing, or adding read-only handlers to their object. 

                if (ignoreProcessCrash === true) //we're ignoring the crash and are going to return the "wrong" event args - only ever used for the internal event arguments for the OnError, OnComplete, and OnCancel events.
                {
                    return eventArgs;
                }
                else //trigger the OnError and OnComplete events
                {
                    fail(eventArgs);
                    finish(eventArgs);

                    return null;
                }
            }
        }

        return eventArgs;
    };

    /**Attaches the custom event handlers that rely on closures to the event args object.
    @method attachEvents
    @param {Object} eventArgs Any object.
    @param {EVUI.Modules.EventStream.EventStreamStep} step The EVUI.Modules.EventStream.EventStreamStep that the event args are being made for.
    @returns {Object} Either a EVUI.Modules.EventStream.EventStreamArgs object or a custom event args object.*/
    var attachEvents = function (eventArgs, step)
    {
        if (eventArgs == null || typeof eventArgs !== "object") return;

        try
        {
            if (eventArgs instanceof EVUI.Modules.EventStream.EventStreamEventArgs)
            {
                //attach the special closure functions used to control this event chain without ever exposing the event chain.
                eventArgs.cancel = function () { return _self.cancel(); };
                eventArgs.pause = function () { return _self.pause(); };
                eventArgs.resume = function () { return _self.resume(); };
                eventArgs.seek = function (indexOrKey) { return _self.seek(indexOrKey) };
                eventArgs.stopPropagation = function () { return _self.stopPropagation(); };
            }
        }
        catch (ex)
        {
            _error = new EVUI.Modules.EventStream.EventStreamError("Failed to add reserved handlers.", ex, EVUI.Modules.EventStream.EventStreamStage.AttachEvents, step.key);
            _status = EVUI.Modules.EventStream.EventStreamStatus.Error;

            fail(eventArgs);
            finish(eventArgs);

            return null;
        }

        return eventArgs;
    }

    /**Function that processes the result of a EventStreamStep's Job function. Sets the _status to the correct state, depending on the object returned. 
    @method stepCallback
    @param {EVUI.Modules.EventStream.EventStreamJobResult} jobResult An instance of EVUI.Modules.EventStream.EventStreamJobResult that was created by the Job that was previously executed.
    @returns {Object} Returns null if jobResult was null.*/
    var stepCallback = function (jobResult)
    {
        if (jobResult == null) return null;

        if (jobResult.success === false || jobResult.canceled === true) //failing or canceling the operation
        {
            if (jobResult.canceled === true)
            {
                _status = EVUI.Modules.EventStream.EventStreamStatus.Canceled;
            }
            else if (jobResult.success === false)
            {
                _error = new EVUI.Modules.EventStream.EventStreamError(jobResult.message == null ? "Job Error." : jobResult.message, jobResult.error, EVUI.Modules.EventStream.EventStreamStage.Job, ((_currentStep != null) ? _currentStep.key : null));
                if (jobResult.innerError != null) _error.innerError = jobResult.innerError;
                _status = EVUI.Modules.EventStream.EventStreamStatus.Error;
            }
        }
        else if (jobResult.seeking == true)
        {
            _status = EVUI.Modules.EventStream.EventStreamStatus.Seeking;
        }
        else //continuing. Make sure we remember the JobData associated with the step so we can pass it into the next step.
        {
            return null;
        }
    };

    /**Executes the event handler associated with a step.
    @method executeEventHandler
    @param {EVUI.Modules.EventStream.EventStreamStep} step An instance of EVUI.Modules.EventStream.EventStreamStep that is the step being executed.
    @param {EVUI.Modules.EventStream.EventStreamStep[]} sequence An array of EVUI.Modules.EventStream.EventStreamStep representing the chain of events being executed.
    @returns {Any} Any value returned by the user from an event.*/
    var executeEventHandler = function (step, sequence)
    {
        var handlerResult = null;
        if (step == null || typeof step.handler !== "function") return handlerResult;

        var args = makeEventArgs(step, sequence);
        if (args == null) return null; //if the args returned null, it already crashed and triggered the fail and complete events, so we just do nothing from here

        var failed = false;

        //try and execute the handler
        try
        {
            if (_self.context != null && step.type !== EVUI.Modules.EventStream.EventStreamStepType.GlobalEvent) //dont use the context if it's a global event
            {
                handlerResult = step.handler.call(_self.context, args);
            }
            else
            {
                handlerResult = step.handler(args);
            }
        }
        catch (ex) //failed, record the error
        {
            failed = true;
            _error = new EVUI.Modules.EventStream.EventStreamError("Error executing event handler.", ex, EVUI.Modules.EventStream.EventStreamStage.Handler, step.key);
        }

        if (typeof _self.processReturnedEventArgs === "function" && EVUI.Modules.Core.Utils.isPromise(handlerResult) === false) //don't process returned args of a promise, this means the function was an async function or otherwise returned a promise to be awaited
        {
            try
            {
                var returnResult = _self.processReturnedEventArgs(args, (failed === true) ? _error.exception : handlerResult, step, _self.jobState, _self.eventState);
                if (EVUI.Modules.Core.Utils.isPromise(returnResult) === true) throw Error("processReturnedEventArgs cannot be an async function.")
            }
            catch (ex) //failed, record the error
            {
                failed = true;
                _error = new EVUI.Modules.EventStream.EventStreamError("Error processing returned event args.", ex, EVUI.Modules.EventStream.EventStreamStage.ProcessReturnedEventArgs, step.key);
            }
        }

        //only if we crashed and are set to end execution on crash, change the state to error
        if (failed === true)
        {
            _status = EVUI.Modules.EventStream.EventStreamStatus.Error;
        }

        if (EVUI.Modules.Core.Utils.isPromise(handlerResult) === true)
        {
            return new ReturnedEventPromiseWrapper(handlerResult, args);
        }
        else
        {
            //return the return value of the event handler. IF the value is false, we bail out of the event chain
            return handlerResult;
        }
    };

    /**Sets the status to Finished and calls the OnComplete event.
    @method finish
    @param {EVUI.Modules.EventStream.EventStreamEventArgs} args An instance of EVUI.Modules.EventStream.EventStreamEventArgs to pass into OnComplete.*/
    var finish = function (args)
    {
        clearQueuedTimeout();

        //seeking to another step, do not end the chain yet
        if (_status === EVUI.Modules.EventStream.EventStreamStatus.Seeking) return;
        if (_status !== EVUI.Modules.EventStream.EventStreamStatus.Canceled && _status !== EVUI.Modules.EventStream.EventStreamStatus.Error)
        {
            _status = EVUI.Modules.EventStream.EventStreamStatus.Finished;
        }

        if (typeof _self.onComplete === "function")
        {
            try
            {
                args.status = _status;
                args.cancel = function () { throw Error("Invalid operation: A terminating EventStream cannot be canceled.") };
                var completeResult = _self.onComplete(args);

                if (EVUI.Modules.Core.Utils.isPromise(completeResult) === true)
                {
                    throw Error("onComplete cannot be an async function.");
                }
            }
            catch (ex)
            {
                EVUI.Modules.Core.Utils.log(ex);
            }
        }

        if (_status !== EVUI.Modules.EventStream.EventStreamStatus.Seeking)
        {
            _self.jobState = undefined;
            _self.eventState = undefined;

            resolvePromise();
        }
    };

    /**Resolves the core promise of the EventStream if it was running in async mode.*/
    var resolvePromise = function ()
    {
        if (_asyncMode === true)
        {
            _asyncMode = false;
            var reject = _rejecter;
            var resolve = _resolver;

            _resolver = null;
            _rejecter = null;

            if (_error != null && (_error.stage !== EVUI.Modules.EventStream.EventStreamStage.Handler && _self.endExecutionOnEventHandlerCrash !== true))
            {
                reject(_error);
            }
            else
            {
                try
                {
                    var resolutionValue = (typeof _self.getPromiseResolutionValue === "function") ? _self.getPromiseResolutionValue() : undefined; //if we have a resolution value, use it. Otherwise just return true.
                    if (resolutionValue !== undefined) return resolve(resolutionValue);
                    resolve(true);
                }
                catch (ex)
                {
                    reject(new EVUI.Modules.EventStream.EventStreamError("Failed to get promise resolution value.", ex));
                }
            }
        }
    }

    /**Sets the status to error and calls the OnError event.
    @method fail
    @param {EVUI.Modules.EventStream.EventStreamEventArgs} args An instance of EVUI.Modules.EventStream.EventStreamEventArgs to pass into OnError.
    @param {Boolean} setStatus Whether or not to set the status to EVUI.Modules.EventStream.EventStreamStatus.Error*/
    var fail = function (args, setStatus)
    {
        if (setStatus !== false) _status = EVUI.Modules.EventStream.EventStreamStatus.Error;

        if (typeof _self.onError === "function")
        {
            try
            {
                var error = _error;
                if (_error == null && args.error != null) error = args.error;
                args.cancel = function () { throw Error("Invalid operation: A terminating EventStream cannot be canceled.") };
                args.status = _status;

                if (error != null) EVUI.Modules.Core.Utils.log(error.getErrorMessage());
                var errorResult = _self.onError(args, error);

                if (EVUI.Modules.Core.Utils.isPromise(errorResult) === true)
                {
                    throw Error("onError cannot be an async function.");
                }

                return errorResult;
            }
            catch (ex)
            {
                EVUI.Modules.Core.Utils.log(ex);
                return false;
            }
        }
        else
        {
            return false;
        }
    };

    /**Sets the status of canceled and calls the OnCancel event.
    @param {EVUI.Modules.EventStream.EventStreamEventArgs} args An instance of EVUI.Modules.EventStream.EventStreamEventArgs to pass into OnCancel.*/
    var cancel = function (args)
    {
        _status = EVUI.Modules.EventStream.EventStreamStatus.Canceled;
        clearQueuedTimeout();

        if (typeof _self.onCancel === "function")
        {
            try
            {
                args.status = _status;
                args.cancel = function () { throw Error("Invalid operation: A terminating EventStream cannot be canceled.") };
                var cancelResult = _self.onCancel(args);

                if (EVUI.Modules.Core.Utils.isPromise(cancelResult) === true)
                {
                    throw Error("onCancel cannot be an async function.");
                }

                return cancelResult;
            }
            catch (ex)
            {
                EVUI.Modules.Core.Utils.log(ex);
            }
        }
    };

    /**Determines whether or not the EventStream is in a state where it is not executing. If it returns true, the state of the EventStream can be changed - if it returns false, an operation is in progress and
    the state of the EventStream cannot be changed.
    @returns {Boolean} Whether or not the EventStream is in a stable state and can be manipulated.*/
    var isStable = function ()
    {
        if (_status === EVUI.Modules.EventStream.EventStreamStatus.Canceled) return true;
        if (_status === EVUI.Modules.EventStream.EventStreamStatus.Error) return true;
        if (_status === EVUI.Modules.EventStream.EventStreamStatus.Finished) return true;
        if (_status === EVUI.Modules.EventStream.EventStreamStatus.NotStarted) return true;

        //working and paused are the only "unstable" states
        return false;
    };

    /**Reacts to the current status of the EventStream. Returns false if the execution should stop, true if it should continue.
    @method handleStatus
    @param {EVUI.Modules.EventStream.EventStreamStep} step An instance of EVUI.Modules.EventStream.EventStreamStep that is the step being executed.
    @param {EVUI.Modules.EventStream.EventStreamStep[]} sequence An array of EVUI.Modules.EventStream.EventStreamStep representing the chain of events being executed.
    @returns {Boolean} Whether or not to cancel the EventStream (false) or continue (true).*/
    var handleStatus = function (step, sequence)
    {
        if (_status === EVUI.Modules.EventStream.EventStreamStatus.Canceled)
        {
            clearQueuedTimeout();
            var args = makeEventArgs(step, sequence, true);
            cancel(args);
            finish(args);

            return false;
        }
        else if (_status === EVUI.Modules.EventStream.EventStreamStatus.Error)
        {
            clearQueuedTimeout();
            var args = makeEventArgs(step, sequence, true, _error);
            if (_error != null && _error.stage === EVUI.Modules.EventStream.EventStreamStage.Handler && _self.endExecutionOnEventHandlerCrash !== true)
            {
                fail(args, true);
                _status = EVUI.Modules.EventStream.EventStreamStatus.Working;
                return true;
            }
            else
            {
                fail(args);
                finish(args);
            }

            return false;
        }
        else if (_status === EVUI.Modules.EventStream.EventStreamStatus.Paused)
        {
            clearQueuedTimeout();

            if (_pausedStepIndex === -1)
            {
                _pausedStepIndex = sequence.indexOf(step);

                if (_pausedWhileJobExecuting === false)
                {
                    _pausedStepIndex++; //we were paused in an event handler, so resuming needs to execute the NEXT step.
                }
            }

            return false;
        }
        else if (_status === EVUI.Modules.EventStream.EventStreamStatus.Seeking)
        {
            clearQueuedTimeout();

            triggerAsyncCall(function ()
            {
                _status = EVUI.Modules.EventStream.EventStreamStatus.Working;
                executeStep(_sequence, _pausedStepIndex)
            });

            return false;
        }
        else if (_status === EVUI.Modules.EventStream.EventStreamStatus.Working || _status === EVUI.Modules.EventStream.EventStreamStatus.NotStarted)
        {
            return true;
        }
        else if (_status === EVUI.Modules.EventStream.EventStreamStatus.Finished)
        {
            clearQueuedTimeout();
            return false;
        }
        else //somehow someone set a garbage status. Fail it.
        {
            _error = new EVUI.Modules.EventStream.EventStreamError("Unrecognized status: " + _status, null, null, step.key);
            clearQueuedTimeout();
            var args = makeEventArgs(_currentStep, _sequence, true, _error);

            fail(args);
            finish(args);
            return false;
        }
    };

    /**Clears any timeout that has been set.
    @method clearTimeout*/
    var clearQueuedTimeout = function ()
    {
        if (_timerID !== -1)
        {
            clearTimeout(_timerID);
            _timerID = -1;
        }
    };

    /**Sets a timeout based on either the provided step's Timeout property or the global _timeout property.
    @param {EVUI.Modules.EventStream.EventStreamStep} step An instance of EVUI.Modules.EventStream.EventStreamStep*/
    var queueTimeout = function (step)
    {
        clearQueuedTimeout();

        var timeout = (typeof _self.timeout !== "number") ? -1 : _self.timeout;
        if (step != null && typeof step.timeout === "number" && step.timeout >= 0) timeout = step.timeout;

        if (timeout >= 0)
        {
            _timerID = setTimeout(function ()
            {
                _timerID = -1;
                triggerTimeout();
            }, timeout);
        }
    };

    /**Triggers the timeout behavior.
    @method*/
    var triggerTimeout = function ()
    {
        _error = new EVUI.Modules.EventStream.EventStreamError("Step timeout hit.", null, (_currentStep.type === EVUI.Modules.EventStream.EventStreamStepType.Job) ? EVUI.Modules.EventStream.EventStreamStage.Job : EVUI.Modules.EventStream.EventStreamStage.Handler, _currentStep.key);
        _status = EVUI.Modules.EventStream.EventStreamStatus.Error;

        handleStatus(_currentStep, _sequence);
    };

    /**Triggers an asynchronous function call.
    @method*/
    var triggerAsyncCall = function (asyncFunction)
    {
        _numSteps++;
        if (_canUsePromises === false || (typeof _self.skipInterval === "number" && _self.skipInterval > 0 && _numSteps % _self.skipInterval === 0))
        {
            if (typeof setImmediate === "function")
            {
                setImmediate(asyncFunction);
            }
            else
            {
                setTimeout(asyncFunction);
            }
        }
        else
        {
            _p.then(asyncFunction);
        }
    };

    /**Applies any configuration options passed into the EventStream constructor.
    @param {EVUI.Modules.EventStream.EventStreamConfig} config*/
    var applyConfig = function (config)
    {
        if (config == null) return;

        if (typeof config.canSeek === "boolean") _self.canSeek = config.canSeek;
        if (typeof config.endExecutionOnEventHandlerCrash === "boolean") _self.endExecutionOnEventHandlerCrash = config.endExecutionOnEventHandlerCrash;
        if (config.eventState != null) _self.eventState = config.eventState;
        if (config.jobState != null) _self.jobState = config.jobState;
        if (typeof config.skipInterval === "number" && config.skipInterval > 0) _self.skipInterval = config.skipInterval;
        if (typeof config.timeout === "number" && config.timeout > 0) _timeout = config.timeout;
        if (EVUI.Modules.Core.Utils.instanceOf(config.bubblingEvents, EVUI.Modules.EventStream.BubblingEventManager) === true) _self.bubblingEvents = config.bubblingEvents;
        if (typeof config.extendSteps === "boolean") _self.extendSteps = config.extendSteps;

        if (typeof config.onCancel === "function") _self.onCancel = config.onCancel;
        if (typeof config.onError === "function") _self.onError = config.onError;
        if (typeof config.onComplete === "function") _self.onComplete = config.onComplete;

        if (typeof config.processInjectedEventArgs === "function") _self.processInjectedEventArgs = config.processInjectedEventArgs;
        if (typeof config.processReturnedEventArgs === "function") _self.processReturnedEventArgs = config.processReturnedEventArgs;
        if (typeof config.getPromiseResolutionValue === "function") _self.getPromiseResolutionValue = config.getPromiseResolutionValue;
        if (config.context != null) _self.context = config.context;
    };

    /**Wrapper object for when a Event step has returned a Promise.
    @param {Promise} promise The promise returned from the Event step.
    @param {Any} args The event arguments injected into the Event step. */
    var ReturnedEventPromiseWrapper = function (promise, args)
    {
        /**The promise returned from the Event step
        @type {Promise}*/
        this.promise = promise;

        /**The event arguments injected into the Event step.
        @type {Any}*/
        this.args = args;
    };

    //apply any configuration options passed into the constructor
    applyConfig(config);
};

/**Represents a step in the EventStream that is executed in the order in which it was added to the EventStream.
 @class
 @param {EVUI.Modules.EventStream.Constants.Fn_Step_Handler} handler The function to execute for this step.
 @param {String} type A value from the EVUI.Modules.EventStream.EventStreamStepType enum.
 @param {String} key The key of the event by which it can be looked up.
 @param {String} name The human-readable name of the step.
 @param {Numner} timeout The amount of time the asynchronous operation of the step can take before it is automatically canceled.*/
EVUI.Modules.EventStream.EventStreamStep = function (handler, type, key, name, timeout)
{
    /**String. A human-readable name to give the step.
    @type {String}*/
    this.name = (typeof name === "string") ? name : null;

    /**String. A string key used to identify this event and prevent propagation of other events with the same key.
    @type {String}*/
    this.key = (typeof key === "string") ? key : null;

    /**Number. The duration of inactivity during the asynchronous portion of this step to wait before timing out.
    @type {Number}*/
    this.timeout = (typeof timeout === "number" && timeout > 0) ? Math.floor(timeout) : -1;

    /**Function. A function to execute either as a work task or as an event trigger.
    @type {EVUI.Modules.EventStream.Constants.Fn_Step_Handler}*/
    this.handler = (typeof handler === "function") ? handler : function (jobOrEventArgs) { };

    /**String. A value from EVUI.Modules.EventStream.EventStreamStepType. Controls how the handler function is executed. If "job" it is executed asynchronously like a promise and is fed a callback object. If "event" it is executed synchronously and can return false to cancel the EventStream.
    @type {String}*/
    this.type = (typeof type === "string") ? type : EVUI.Modules.EventStream.EventStreamStepType.Job;
};

/**Represents the parameter object for the callback handed to the EventStreamStep's "Job" function.
 @class*/
EVUI.Modules.EventStream.EventStreamJobResult = function ()
{
    /**Any. Any value passed into Resolve function in a Job step.
    @type {Any}*/
    this.resolvedValue = null;

    /**Boolean. Whether or not the operation succeeded. False will cause the execution to stop and result in the OnError event being called.
    @type {Boolean}*/
    this.success = false;

    /**Boolean. Whether or not to cancel the operation. True will cause the execution to stop and result in the OnCancel event being called.
    @type {Boolean}*/
    this.canceled = false;

    /**Boolean. Whether or not the EventStream was instructed to seek to another step.
    @type {Boolean}*/
    this.seeking = false;

    /**String. Any message to be used when Success is set to false.
    @type {String}*/
    this.message = null;

    /**Object. An exception object from a catch block. If Success is false, this exception is passed into the EventStream's OnError event args.
    @type {Error}*/
    this.error = null;

    /**Object. An instance of EVUI.Modules.EventStream.EventStreamError that occurred in an enclosing event stream of this event stream.
    @type {EVUI.Modules.EventStream.EventStreamError}*/
    this.innerError = null;
};

/**The EventArgs object for all events in the EventStream, serves as the parameter for all EventHandlers.
 @class*/
EVUI.Modules.EventStream.EventStreamEventArgs = function (state)
{
    /**String. The human-readable name of the current EventStreamStep.
    @type {String}*/
    this.name = null;

    /**String. The unique event key string of the current EventStreamStep.
    @type {String}*/
    this.key = null;

    /**String. The type of event being handled (Event or GlobalEvent).
    @type {String}*/
    this.stepType = null;

    /**Number. The index of the current step in the sequence of steps.
     @type {Number}*/
    this.currentStep = -1;

    /**Number. The total number of steps in the EventStream.
    @type {Number}*/
    this.totalSteps = -1;

    /**Object. An instance of EventStreamError. Will only be populated if there was an error.
    @type {EVUI.Modules.EventStream.EventStreamError}*/
    this.error = null;

    /**Number. The current status of the EventStream. A value from EventStreamStatus.
    @type {Number}*/
    this.status = EVUI.Modules.EventStream.EventStreamStatus.NotStarted;

    /**Function. Cancels the execution of the EventStream. Returns true if the execution was canceled, or false if it was not cancelable.
    @returns {Boolean}*/
    this.cancel = function () { return false; };

    /**Function. Pauses the execution of the EventStream. Returns true if the execution was paused, or false if it was not pausable.
    @returns {Boolean}*/
    this.pause = function () { return false; };

    /**Function. Resumes a paused execution of the EventStream. Returns true if the execution was resumed, or false if it was not resumable.
    @returns {Boolean}*/
    this.resume = function () { return false; };

    /**Function. Stops execution and seeks the EventStream to a new position. Returns true if the EventStream was able to seek to the given step, or false if seeking is not enabled or if the parameters were invalid.
    @param {Number|String} indexOrKey The index or key of the EventStreamStep to seek to.
    @returns {Boolean}*/
    this.seek = function (indexOrKey) { return false; };

    /**Function. Stops any other steps from executing with the same event key as the current step.*/
    this.stopPropagation = function () { return false };

    /**Object. The public event state of the EventStream.
    @type {Object}*/
    this.state = (state != null) ? state : {};
};

/**Object representing the arguments injected into a "job" step.
@class EventStreamJobArgs
@param {EVUI.Modules.EventStream.EventStream} eventStream The EventStream this job args is for.
@param {EVUI.Modules.EventStream.Constants.Fn_Job_Callback} callback The callback function that continues the EventStream.*/
EVUI.Modules.EventStream.EventStreamJobArgs = function (eventStream, callback)
{
    if (eventStream instanceof EVUI.Modules.EventStream.EventStream === false) throw TypeError("eventStream must be a EVUI.Modules.EventStream.EventStream");
    if (typeof callback !== "function") throw TypeError("Callback must be a function.");

    var _eventStream = eventStream;
    var _callback = callback;

    /**String. The human-readable name given to the Job step.
    @type {String}*/
    this.name = null;

    /**String. The unique key given to the Job step.
    @type {String}*/
    this.key = null;

    /**The value that was returned by the previous Job step in the EventStream.
    @type {Any}*/
    this.resolvedValue = null;

    /**Object. The EVUI.Modules.EventStream.EventStream that is currently executing.
    @type {EVUI.Modules.EventStream.EventStream}*/
    this.eventStream = _eventStream;

    /**Cancels the Job and ends the EventStream without raising error handling.*/
    this.cancel = function ()
    {
        var result = new EVUI.Modules.EventStream.EventStreamJobResult();
        result.canceled = true;

        return _callback(result);
    };

    /**Seeks the EventStream to a different step.
    @param {Number|EVUI.Modules.EventStream.EventStreamStep|String} indexOrKey Either the step object, the index of the step object, or the key of the step object to seek to.*/
    this.seek = function (indexOrKey)
    {
        _eventStream.seek(indexOrKey);
        var result = new EVUI.Modules.EventStream.EventStreamJobResult();
        result.success = true;
        result.seeking = true;

        return _callback(result);
    };

    /** Resolves the job and allows the EventStream to advance to the next step.
    @param {Any} value Any value to pass on to the next Job step in the EventStream. */
    this.resolve = function (value)
    {
        var result = new EVUI.Modules.EventStream.EventStreamJobResult();
        result.success = true;
        result.resolvedValue = value;

        return _callback(result);
    };

    /**Ends this step in the EventStream with an error.
    @param {String} message The message to log as an error.
    @param {Error} ex An exception thrown during the course of the Job.
    @param {EVUI.Modules.EventStream.EventStreamError}*/
    this.reject = function (message, ex, innerError)
    {
        if (typeof message !== "string") message = (message != null) ? message.toString() : "Process manually ended with an unknown error.";
        if (message instanceof Error) ex = message;

        var error = new EVUI.Modules.EventStream.EventStreamJobResult();
        error.success = false;
        error.message = message;
        if (ex instanceof Error) error.error = ex;
        if (innerError instanceof EVUI.Modules.EventStream.EventStreamError) error.innerError = innerError;

        return _callback(error);
    };

    /**Gets The EventStream's jobState object that is only accessible to Job steps.
    @returns {Object}*/
    this.getState = function ()
    {
        return _eventStream.jobState;
    };

    /**Any. Sets The EventStream's jobState object that is only accessible to Job steps.
    @returns {Any}*/
    this.setState = function (value)
    {
        _eventStream.jobState = value;
        return value;
    };
};

/**Represents an aggregation of data about an error that occurred during the execution of the EventStream.
 @class*/
EVUI.Modules.EventStream.EventStreamError = function (message, exception, stage, key)
{
    /**String. A Message describing the error.
    @type {String}*/
    this.message = message;

    /**Object. An exception object captured from in a catch block.
    @type {Error}*/
    this.exception = (exception instanceof Error) ? exception : null;

    /**String. The stage when the error occurred. Must be a value from EVUI.Modules.EventStream.EventStreamStage.
    @type {String}*/
    this.stage = stage;

    /**String. The Key that belongs to the step where the error occurred.
    @type {String}*/
    this.key = key;

    /**Object. An instance of EVUI.Modules.EventStream.EventStreamError. If an error occurred while reporting the error, this will be populated with the original error.
    @type {EVUI.Modules.EventStream.EventStreamError}*/
    this.innerError = null;

    /**Gets a string of the error message.
    @method GetErrorMessage*/
    this.getErrorMessage = function ()
    {
        var message = "Error:";
        if (this.message != null) message += " " + this.message + " ";
        if (this.stage != null) message += "Stage: " + stage + ". ";
        if (this.key != null) message += "Step: \"" + this.key + "\"."
        if (this.exception != null) message += "\nException: " +  this.exception.stack;
        if (this.innerError != null) message += "\nInnerError: " + this.innerError.getErrorMessage();

        return message;
    };
};

/**Configuration arguments for instantiating a new EventStream.
@class*/
EVUI.Modules.EventStream.EventStreamConfig = function ()
{
    /**Boolean. Whether or not the stream can seek and forth between steps. True by default.
    @type {Boolean}*/
    this.canSeek = true;

    /**Boolean. Whether or not a crash in an Event handler will cause the EventStream to stop executing. False by default.
    @type {Boolean}*/
    this.endExecutionOnEventHandlerCrash = false;

    /**Number. The number of milliseconds to wait on each step before failing the EventStream. A negative number means no timeout. -1 by default.
    @type {Number}*/
    this.timeout = -1;

    /**Any. Any data to carry between Jobs in the EventStream. A plain object by default.
    @type {Any}*/
    this.jobState = {};

    /**Any. Any data to carry between Events in the EventStream. A plain object by default.
    @type {Any}*/
    this.eventState = {};

    /**Number. When the EventStream is running, this is the number of sequential steps that can be executed before introducing a shot timeout to free up the thread to allow other processes to continue, otherwise an infinite step loop (which is driven by promises) will lock the thread. Small numbers will slow down the EventStream, high numbers may result in long thread locks. 250 by default.
    @type {Number}*/
    this.skipInterval = 250;

    /**Synchronous event handler for handling cases where the EventStream was canceled before it was finished. Cannot be an async function.
    @type {EVUI.Modules.EventStream.Constants.Fn_OnCancel}*/
    this.onCancel = null;

    /**Synchronous event handler for handling cases where an error occurred at any point during the process. Cannot be an async function.
    @type {EVUI.Modules.EventStream.Constants.Fn_OnError}*/
    this.onError = null;

    /**Synchronous event handler that executes whenever the EventStream has been completed or terminated. Cannot be an async function.
    @type {EVUI.Modules.EventStream.Constants.Fn_OnComplete}*/
    this.onComplete = null;

    /**Takes the event args generated for default events and gives the consumer of the EventStream a chance to inject its own event args. Cannot be an async function.
    @type {EVUI.Modules.EventStream.Constants.Fn_ProcessInjectedEventArgs}*/
    this.processInjectedEventArgs = null;

    /**Takes the event args that were passed into the event handler and gives the consumer a chance to react to any changes made to them or react to the value returned from the event handler. Cannot be an async function.
    @type {EVUI.Modules.EventStream.Constants.Fn_ProcessReturnedEventArgs}*/
    this.processReturnedEventArgs = null;

    /**Overridable function for passing a custom value into the resolve function of a promise if the EventStream is running in async mode. Cannot be an async function.*/
    this.getPromiseResolutionValue = null;

    /**Object. A BubblingEventManager used to supply bubbling events for the EventStream.
    @type {EVUI.Modules.EventStream.BubblingEventManager}*/
    this.bubblingEvents = null;

    /**Any. The "this" context to execute job and event handlers under.
    @type {Any}*/
    this.context = null;

    /**Boolean. Whether or not the steps added to the EventStream should have their properties extended onto a fresh step object.
    @type {Boolean}*/
    this.extendSteps = true;
};

/**An object that ties together an event name, its callback its priority (if there are other events with the same name) and the unique ID of it's handle.
@param {String} eventName The name of the event.
@param {EVUI.Modules.EventStream.Constants.Fn_Event_Handler} handler The function to call when the event is invoked.
@param {Number} priority The priority of this event relative to other events with the same name.
@param {Boolean} immutable Whether or not this EventStreamListener is immutable and cannot be changed or removed..
@class*/
EVUI.Modules.EventStream.EventStreamEventListener = function (eventName, handler, priority, immutable)
{
    if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(eventName) === true) throw Error("event name must be a non-whitespace string.");
    if (typeof handler !== "function") throw Error("handler must be a function.");

    var _handlerId = EVUI.Modules.Core.Utils.makeGuid();
    var _priority = typeof priority === "number" ? priority : 0;
    var _eventName = eventName;
    var _handler = handler;
    var _immutable = (typeof immutable === "boolean") ? immutable : false;

    /**String. Read-only. The name of the event.
    @type {String}*/
    this.eventName = null;
    Object.defineProperty(this, "eventName", {
        get: function () { return _eventName; },
        enumerable: true,
        configurable: false
    });

    /**Function. The function to call when this event is invoked.
    @type {EVUI.Modules.EventStream.Constants.Fn_Event_Handler}*/
    this.handler = null;
    Object.defineProperty(this, "handler", {
        get: function () { return _handler },
        set: function (value)
        {
            if (_immutable === true) throw Error("EventStreamEventListener is immutable and cannot be changed or removed.");
            if (value != null && typeof value !== "function") throw Error("handler must be a function.")
            _handler = value;
        },
        enumerable: true,
        configurable: false
    });

    /**Number. The priority of this event relative to other events with the same name.
    @type {Number}*/
    this.priority = 0;
    Object.defineProperty(this, "priority", {
        get: function () { return _priority; },
        set: function (value)
        {
            if (_immutable === true) throw Error("EventStreamEventListener is immutable and cannot be changed or removed.");
            if (typeof value !== "number") throw Error("priority must be a number.");
            _priority = value;
        },
        enumerable: true,
        configurable: false
    });

    /**String. Read-only. The unique ID of this event listener.
    @type {String}*/
    this.handlerId = _handlerId;
    Object.defineProperty(this, "handlerId", {
        get: function () { return _handlerId; },
        enumerable: true,
        configurable: false
    });

    /**Boolean. Whether or not this EventStreamListener is immutable and cannot be changed or removed.
    @type {Boolean}*/
    this.immutable = false;
    Object.defineProperty(this, "immutable", {
        get: function () { return _immutable; },
        enumerable: true,
        configurable: false
    });
};

/**Object for containing configuration options for a EventStreamListener.
@class*/
EVUI.Modules.EventStream.EventStreamEventListenerOptions = function ()
{
    /**Boolean. Whether or not the EventStreamListener will be immutable and cannot be changed or removed.
    @type {Boolean}*/
    this.immutable = false;

    /**Whether or not the EventStreamListener will be fired exactly once then removed.
    @type {Boolean}*/
    this.once = false;

    /**Number. The priority of this event relative to other events with the same name.
    @type {Number}*/
    this.priority = null;

    /**Boolean. The type of event that should cause this event to fire.
    @type {Boolean}*/
    this.eventType = EVUI.Modules.EventStream.EventStreamEventType.Event;
};

/**Controller for managing a stack of secondary event handlers that "bubble" in order of addition after the primary event has executed by an EventStream. Assign to an EventStream's bubblingEvents property to use.
@class*/
EVUI.Modules.EventStream.BubblingEventManager = function ()
{
    var _eventsDictionary = {}; //the internal registry of events. The keys are event keys, and the values are arrays of InternalEventListners.

    /**Add an event listener to fire after an event with the same key has been executed.
    @param {String} eventKey The key of the event in the EventStream to execute after.
    @param {EVUI.Modules.EventStream.Constants.Fn_Event_Handler} handler The function to fire.
    @param {EVUI.Modules.EventStream.EventStreamEventListenerOptions} options Options for configuring the event.
    @returns {EVUI.Modules.EventStream.EventStreamEventListener}*/
    this.addEventListener = function (eventKey, handler, options)
    {
        var listener = new InternalEventListener();

        if (EVUI.Modules.Core.Utils.instanceOf(eventKey, EVUI.Modules.EventStream.EventStreamEventListener) === true) //handed a complete event listener object
        {
            listener.listener = eventKey;

            if (handler != null && typeof handler === "object") //second parameter could be the options object
            {
                options = handler;
            }

            if (options != null && typeof options === "object")
            {
                if (EVUI.Modules.Core.Utils.instanceOf(options, EVUI.Modules.EventStream.EventStreamEventListenerOptions) === true) //options object was a real options object, use it
                {
                    listener.options = options;
                }
                else //otherwise extend it onto a different options object
                {
                    options = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.EventStream.EventStreamEventListenerOptions(), options);
                }
            }
            else //no options - just make a new one
            {
                listener.options = new EVUI.Modules.EventStream.EventStreamEventListenerOptions();
            }

            listener.options.immutable = eventKey.immutable;
        }
        else //handed normal parameters, make the listener object
        {
            if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(eventKey) === true) throw Error("eventKey must be a non-whitespace string.");
            if (typeof handler !== "function") throw Error("Function expected.");
            if (options == null || typeof options !== "object")
            {
                options = new EVUI.Modules.EventStream.EventStreamEventListenerOptions();
            }
            else
            {
                options = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.EventStream.EventStreamEventListenerOptions(), options);
            }

            var eventListener = new EVUI.Modules.EventStream.EventStreamEventListener(eventKey, handler, options.priority, options.immutable);
            listener.listener = eventListener;
            listener.options = options;
        }

        //set the type of event that should raise this event
        var lowerEventType = typeof options.eventType === "string" ? options.eventType.toLowerCase() : options.eventType;
        if (lowerEventType !== EVUI.Modules.EventStream.EventStreamEventType.GlobalEvent && lowerEventType !== EVUI.Modules.EventStream.EventStreamEventType.Event)
        {
            options.eventType = EVUI.Modules.EventStream.EventStreamEventType.Event;
        }
        else
        {
            options.eventType = lowerEventType;
        }       

        //add the listener to the events dictionary
        var existingEvents = _eventsDictionary[listener.listener.eventName];
        if (existingEvents == null)
        {
            existingEvents = [];
            _eventsDictionary[listener.listener.eventName] = existingEvents;
        }

        //calculate the max ordinal in the events list already to ensure that they fire in order of addition.
        var maxOrdinal = 0;
        var numEvents = existingEvents.length;
        for (var x = 0; x < numEvents; x++)
        {
            var curEvent = existingEvents[x];
            if (curEvent.ordinal >= maxOrdinal) maxOrdinal = curEvent.ordinal + 1;
        }

        listener.ordinal = maxOrdinal;
        existingEvents.push(listener);

        return listener.listener;
    };

    /**Gets an array of all the EventStreamEventListeners in order of execution for the given step. Note that events with the "once" option are removed from the internal events dictionary when this function is called.
    @param {EVUI.Modules.EventStream.EventStreamStep} step The step to get the bubbling events for.
    @returns {EVUI.Modules.EventStream.EventStreamEventListener[]}*/
    this.getBubblingEvents = function (step)
    {
        var keyEvents = _eventsDictionary[step.key];
        if (keyEvents == null || keyEvents.length === 0) return null;

        var eventsToFire = [];

        //go add a step for each "bubbling" event
        var numEvents = keyEvents.length;
        for (var x = 0; x < numEvents; x++)
        {
            var curEvent = keyEvents[x];

            //sort the list into global and non-global events
            if (step.type === EVUI.Modules.EventStream.EventStreamStepType.GlobalEvent)
            {
                if (curEvent.options.eventType !== EVUI.Modules.EventStream.EventStreamEventType.GlobalEvent) continue;
                eventsToFire.push(curEvent);
            }
            else 
            {
                if (curEvent.options.eventType !== EVUI.Modules.EventStream.EventStreamEventType.Event) continue;
                eventsToFire.push(curEvent);
            }

            //remove any event with "once" set to true so that it only fires once.
            if (curEvent.options.once === true)
            {
                if (index !== -1) keyEvents.splice(x, 1);
                x--;
            }
        }

        if (keyEvents.length === 0)
        {
            delete _eventsDictionary[step.key];
        }

        var numEventsToFire = eventsToFire.length;
        if (numEventsToFire === 0) return null;

        //sort the events based on their priority first, then their order of addition if they have the same priority.
        eventsToFire.sort(function (listener1, listener2)
        {
            if (listener1.listener.priority === listener2.listener.priority)
            {
                return listener1.orindal - listener2.ordinal;
            }
            else
            {
                return listener2.listener.priority - listener1.listener.priority;
            }
        });

        var listeners = [];
        for (var x = 0; x < numEventsToFire; x++)
        {
            listeners.push(eventsToFire[x].listener)
        };

        return listeners;
    };

    /**Removes an event listener based on its event name, its id, or its handling function.
    @param {String} eventKeyOrId The name or ID of the event to remove.
    @param {Function} handler The handling function of the event to remove.
    @returns {Boolean}*/
    this.removeEventListener = function (eventKeyOrId, handler)
    {
        var existingList = _eventsDictionary[eventKeyOrId];
        if (existingList != null)
        {
            var removed = false;
            var numInList = existingList.length;
            for (var x = 0; x < numInList; x++)
            {
                var curListener = existingList[x];
                if (curListener.listener.handler === handler && curListener.listener.immutable === false)
                {
                    removed = true;
                    existingList.splice(x, 1);
                    x--;
                    numInList--;

                    if (numInList === 0)
                    {
                        delete _eventsDictionary[eventKeyOrId];
                        break;
                    }
                }
            }

            return removed;
        }
        else
        {
            for (var prop in _eventsDictionary)
            {
                var curListeners = _eventsDictionary[prop];
                var removed = false;

                var numListeners = curListeners.length;
                for (var x = 0; x < numListeners; x++)
                {
                    var curListener = curListeners[x];
                    if (curListener.listener.immutable === false && (curListener.handlerId === eventKeyOrId || curListener.listener.handler === handler))
                    {
                        curListeners.splice(x, 1);
                        numListeners--;

                        if (numListeners === 0)
                        {
                            delete _eventsDictionary[eventKeyOrId];
                        }

                        removed = true;
                    }
                }
            }

            return removed;
        }
    };

    /**Represents the data needed for a bubbling event listener to fire after the main handler for an event fires.
    @class*/
    var InternalEventListener = function ()
    {
        /**Object. The event listener to fire.
        @type {EVUI.Modules.EventStream.EventStreamEventListener}*/
        this.listener = null;

        /**Object. The configuration options for the event listener.
        @type {EVUI.Modules.EventStream.EventStreamEventListenerOptions}*/
        this.options = null;

        /**Number. The priority number of this event relative to the other events with the same name. Is used to sort event handlers when the handler's own priority property is equal to another's.
        @type {Number}*/
        this.ordinal = 0;
    };
};

/**Status enum for describing the current state of an instance of EVUI.Modules.EventStream.EventStream.
 @enum*/
EVUI.Modules.EventStream.EventStreamStatus =
{
    /**Work has not started yet.*/
    NotStarted: 0,
    /**Event chain is currently executing.*/
    Working: 1,
    /**Event chain was paused and is awaiting being resumed.*/
    Paused: 2,
    /**Event chain has completed.*/
    Finished: 3,
    /**Event chain has been canceled.*/
    Canceled: 4,
    /**Event chain ended with an error.*/
    Error: 5,
    /*Event chain is going to execute a step out of sequence.*/
    Seeking: 6
};
Object.freeze(EVUI.Modules.EventStream.EventStreamStatus);

/**State enum for indicating what part of the execution of an EventStreamStep an error occurred in.
 @enum*/
EVUI.Modules.EventStream.EventStreamStage =
{
    /**Stage was during the execution of a Job function.*/
    Job: "job",
    /**Stage was during the execution of a EventHandler function.*/
    Handler: "handler",
    /**Stage was generating custom event args.*/
    ProcessInjectedEventArgs: "processInjectedEventArgs",
    /**Stage was processing the event arguments that were returned from the event handler.*/
    ProcessReturnedEventArgs: "processReturnedEventArgs",
    /**Stage was caused by a custom error being raised.*/
    ErrorCommand: "errorCommand",
};
Object.freeze(EVUI.Modules.EventStream.EventStreamStage);

/**Sets the behavior for the Handler function in a EventStreamStep.
 @enum*/
EVUI.Modules.EventStream.EventStreamStepType =
{
    /**The default. Function is executed and is passed an object with the EventStream publicly accessible as well as a callback function to call to continue the operation.*/
    Job: "job",
    /**Function is executed and is passed an event args parameter (either the default args or a custom made set of args).*/
    Event: "event",
    /**Function is executed and is passed an event args parameter (either the default args or a custom made set of args). Exactly the same as Event, but used to flag events that are on Global instances of objects and not local instances.*/
    GlobalEvent: "global",

    /**Takes a string and returns a correct EventStreamStepType.
    @method GetStepType
    @param {String} stepType The string to match against one of the existing step types.
    @returns {String}*/
    getStepType: function (stepType)
    {
        if (typeof stepType !== "string") return this.Job;
        var lowerStepType = stepType.toLowerCase();

        if (lowerStepType === this.Job) return this.Job;
        if (lowerStepType === this.Event) return this.Event;
        if (lowerStepType === this.GlobalEvent.toLowerCase()) return this.GlobalEvent;
        return this.Job;
    }
};

/**Sets the behavior for the Handler function in a EventStreamStep.
 @enum*/
EVUI.Modules.EventStream.EventStreamEventType =
{
    /**Function is executed and is passed an event args parameter (either the default args or a custom made set of args).*/
    Event: "event",
    /**Function is executed and is passed an event args parameter (either the default args or a custom made set of args). Exactly the same as Event, but used to flag events that are on Global instances of objects and not local instances.*/
    GlobalEvent: "global",
}

Object.freeze(EVUI.Modules.EventStream.EventStreamStepType);
Object.freeze(EVUI.Modules.EventStream);

/**Constructor reference for the EventStream.*/
EVUI.Constructors.EventStream = EVUI.Modules.EventStream.EventStream;
