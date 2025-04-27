/**Copyright (c) 2025 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

if ($evui == null) $evui = {};

/**Root namespace for the EventUI Test library.
@namespace*/
EVUITest = {};

/**Constants table for the EventUI Test library.
@static*/
EVUITest.Constants = {};

/**Function definition for the basic arguments for a Test to run in the TestRunner.
@param {EVUITest.TestHostArgs} testHostArgs An arguments object for the test that contains the functions used to pass or fail the test, as well as some metadata about the test.
@param {Any} args The arguments passed into the test.*/
EVUITest.Constants.Fn_Test = function (testHostArgs, ...args) { };

/**Function definition for the basic arguments for a Test to run in the TestRunner.*/
EVUITest.Constants.Fn_TestPass = function () { };

/**Function definition for the basic arguments for a Test to run in the TestRunner.
@param {String} reason The reason why the test failed.  
@param {Boolean} isSimulatedFailure Whether or not the failure is an expected or simulated failure that should be treated as the "successful" result.*/
EVUITest.Constants.Fn_TestFail = function (reason, isSimulatedFailure) { };

/**A predicate function that is fed the assertion value and returns true or false. 
@param {Any} assertionValue The value wrapped by the assertion.
@returns {Boolean}*/
EVUITest.Constants.Fn_Predicate = function (assertionValue) { };

/**A predicate function that takes a ValueEqualityContext and determines if the values are equal or not.
@param {EVUITest.ValueEqualityContext} equalityContext The comparison context of the values.
@returns {Boolean}*/
EVUITest.Constants.Fn_EqualityComparer = function (equalityContext) { };

/**A symbol used to mark a function on an object's prototype as being an equality test. Used to invoke a Fn_EqualityComparer function
to compare two values.
@type {Symbol}*/
EVUITest.Constants.Symbol_EqualityComparer = Symbol("evui.test.equality");

Object.freeze(EVUITest.Constants);

/**Default settings for the Assertions module.
@class*/
EVUITest.Settings = {};

/**Boolean. Whether or not Assertions should throw an Error if the Assertion should fail.
@type {Boolean}*/
EVUITest.Settings.throwOnFailure = true;

/**Boolean. Whether or not Assertions should use the outputWriter to emit log messages about successful assertions.
@type {Boolean}*/
EVUITest.Settings.logOnSuccess = false;

/**Object. The utility used to write the output of test results. Can be a custom implementation of EVUITest.OutputWriter, but must have the same function signatures as the default EVUITest.OutputWriter.
@type {EVUITest.OutputWriter}*/
EVUITest.Settings.outputWriter = null;
(function ()
{
    var writer = null;

    Object.defineProperty(EVUITest.Settings, "outputWriter", {
        get: function ()
        {
            if (writer == null) writer = new EVUITest.OutputWriter();
            return writer;
        },
        set: function (value)
        {
            if (typeof value !== "object") throw Error("Object expected.");
            writer = value;
        },
        enumerable: true,
        configurable: false
    });
})();

/**Object representing a test to run in the TestHost.
@class*/
EVUITest.Test = function ()
{
    /**String. The name of the test. Used for logging purposes.
    @type {String}*/
    this.name = null;

    /**Array. Arguments to pass into the test. Multiple elements in the array will result in multiple test runs (one for each value). If more than one parameter is desired, make the elements of the array be arrays of the parameters to pass into each test instance.
    @type {[]}*/
    this.testArgs = null;

    /**Function. The test to run. Can take any number of parameters, but the first parameter is always a TestHostArgs instance
    @type {EVUITest.Constants.Fn_Test}*/
    this.test = null;

    /**Object. The options to control how the test behaves.
    @type {EVUITest.TestOptions}*/
    this.options = null;
};

/**Object that represents the result of running a test.
@class*/
EVUITest.TestResult = function ()
{
    /**Number. The ID of the test that was run.
    @type {Number}*/
    this.testId = -1;

    /**Boolean. Whether or not the test was successful.
    @type {Boolean}*/
    this.success = false;

    /**String. The error message if the test failed.
    @type {String}*/
    this.reason = null;

    /**Array. The array of user-provided values that was fed into the test function.
    @type {Array}*/
    this.testName = null;

    /**Array. The arguments that were passed into the test.
    @type {Array}*/
    this.arguments = null;

    /**Object. If the test crashed, this is the Error thrown inside the test.
    @type {Error}*/
    this.error = null;

    /**Boolean. Whether or not this test was intentionally failed and not a result of the test failing organically.
    @type {Boolean}*/
    this.intentionalFailure = false;

    /**Number. The number of milliseconds the test took.
    @type {Number}*/
    this.duration = 0;

    /**Number. The incremental unique ID of this test.
    @type {Number}*/
    this.instanceId = 0;

    /**Number. The ordinal of this test in the set of tests that contained it.
    @type {Number}*/
    this.instanceInSet = 0;

    /**Object. The TestOptions used for the test.
    @type {EVUITest.TestOptions}*/
    this.options = null;

    /**Array. An array of the output that was logged during the test.
    @type {EVUI.TestHostOutput[]}*/
    this.output = [];
};

/**Simple utility class used for writing output from the TestHost. The default implementation writes to the console, but it can be overwritten to write to anything.
@class*/
EVUITest.OutputWriter = function ()
{
    var _self = this;

    /**Writes arbitrary output. Override to implement custom logging behavior.
    @param {Any} args Any arguments to write to output.*/
    this.writeOutput = function (...args)
    {
        console.log(...args);
    };

    /**Logs a "critical" level log message.
    @param {String} message The message to log.*/
    this.logCritical = function (message)
    {
        this.log(message, EVUITest.LogLevel.Critical);
    };

    /**Logs a "error" level log message.
    @param {String} message The message to log.*/
    this.logError = function (message)
    {
        this.log(message, EVUITest.LogLevel.Error);
    };

    /**Logs a "warning" level log message.
    @param {String} message The message to log.*/
    this.logWarning = function (message)
    {
        this.log(message, EVUITest.LogLevel.Warn); 
    };

    /**Logs a "debug" level log message.
    @param {String} message The message to log.*/
    this.logDebug = function (message)
    {
        this.log(message, EVUITest.LogLevel.Debug);
    };

    /**Logs a "info" level log message.
    @param {String} message The message to log.*/
    this.logInfo = function (message)
    {
        this.log(message, EVUITest.LogLevel.Info);
    };

    /**Logs a message by creating a OutputWriterMessage and passing it to writeOutput.
    @param {String} message The message to log.
    @param {String} level The LogLevel enum value to associate with the log message.*/
    this.log = function (message, level)
    {
        if (typeof message == null) return;
        if (typeof level !== "string") level = EVUITest.LogLevel.Info;

        var logMessage = new EVUITest.OutputWriterMessage();
        logMessage.message = message;
        logMessage.logLevel = level;

        _self.writeOutput(logMessage)
    }
};

/**Represents an output message from the EVUITest library that ties together a log message with a log level code.
@class */
EVUITest.OutputWriterMessage = function ()
{
    /**A value from the LogLevel enum indicating the level of severity of the log message.
    @type {String}*/
    this.logLevel = EVUITest.LogLevel.Info;

    /**The message to log. Must be able to be sent in an iframe message.
    @type {Any}*/
    this.message = null;

    /**The UTC ISO timestamp for when this log statement was made.
    @type {String}*/
    this.timestamp = new Date(Date.now()).toISOString();
};

/**The importance level of a log message.
@enum*/
EVUITest.LogLevel =
{
    None: "none",
    Trace: "trace",
    Debug: "debug",
    Info: "info",
    Warn: "warn",
    Error: "error",
    Critical: "critical"
};

/**Settings for running tests.
@class*/
EVUITest.TestOptions = function ()
{
    /**Number. The number of milliseconds to wait before automatically failing the test. 100ms by default. Note that this cannot be set once the test has begun.
    @type {Number}*/
    this.timeout = 100;

    /**Array. In the event of an asynchronous portion of a test crashing without a try-catch capturing the error, this is the window's onerror handler's list of code files to associate with the error. If an error comes from a file that meets the filter, it is associated with the test. If not, the error is ignored.
    @type {String|RegExp|String[]|RegExp[]}*/
    this.fileFilter = new RegExp(/.*\.js$/ig);

    /**Boolean. Whether or not a failing test is considered a successful test (and a non-failing result counts as unsuccessful test). False by default.
    @type {Boolean}*/
    this.shouldFail = false;

    /**Boolean. Whether or not a test is consider successful if it finishes without calling TestArgs.pass(). True by default.
    @type {Boolean}*/
    this.implicitSuccess = true;
};

/**A simple utility that runs a test single delegate that can contain any arbitrary testing code. The entry point to the EVUI unit testing Selenium integration.
@class*/
EVUITest.TestHostController = function ()
{
    var _self = this;
    var _executing = false;
    var _testQueue = [];
    var _messageIDCounter = 0;
    var _idCounter = 1;
    var _instanceCounter = 1;
    var _outputWriter = null;
    var _testResults = [];
    var _testCounter = 0;
    var _currentTestInstance = null;

    /**Boolean. Whether or not the Host is currently running.
    @type {Boolean}*/
    this.executing = false;
    Object.defineProperty(this, "executing", {
        get: function ()
        {
            return _executing;
        },
        configurable: false,
        enumerable: true
    });

    /**Object. The OutputWriter used by the TestHost.
    @type {EVUITest.OutputWriter}*/
    this.outputWriter = null;
    Object.defineProperty(this, "outputWriter", {
        get: function ()
        {
            if (_outputWriter == null) return EVUITest.Settings.outputWriter;
            return _outputWriter;
        },
        set: function (value)
        {
            if (typeof value !== "object" || value == null) throw Error("Object expected.")
            _outputWriter = value;
        },
        configurable: false,
        enumerable: false
    });

    /**Object. Control options for the test host.
    @type {EVUITest.TestOptions}*/
    this.options = new EVUITest.TestOptions();

    /**Awaitable. Runs a test function based on the Test passed in.
    @param {String|EVUITest.Constants.Fn_Test|EVUITest.Test} name The name of the test being run, a test function to run, or a Test yolo to run.
    @param {EVUITest.Constants.Fn_Test|EVUITest.Test} test The test function to run, or a Test yolo to run.
    @returns {Promise<EVUITest.TestResult[]>}*/
    this.runAsync = function (name, test)
    {
        var resolvedTest = getTestAmbiguously(name, test);
        if (resolvedTest == null) throw Error("Test YOLO or function expected.");

        resolvedTest.instances = getTestInstances(resolvedTest);

        if (_executing === true)
        {
            _testQueue.push(resolvedTest);

            return new Promise(function (resolve)
            {
                resolvedTest.callback = function (testState)
                {
                    resolve(testState.results);
                }
            });
        }

        return new Promise(function (resolve)
        {
            executeTest(resolvedTest, function (testState)
            {
                resolve(testState.results);
            });
        });
    };

    /**Uses the outputWriter to write arbitrary output.
    @param {Any} args Any arguments to write as output.*/
    this.writeOutput = function (...args)
    {
        writeOutput(...args);
    };

    /**Gets a copy of the internal TestResults list.
    @returns {EVUITest.TestResult[]}*/
    this.getResults = function ()
    {
        return _testResults.slice();
    };

    /**Clears the internal TestResults list of all results.*/
    this.clearResults = function ()
    {
        _testResults.splice(0, _testResults.length);
    };

    /**Formats a testResult into a loggable string.
    @param {EVUITest.TestResult} testResult The result of a test.
    @returns {EVUITest.OutputWiterMessage}*/
    var formatTestOutput = function (testResult)
    {
        if (testResult == null) return null;

        var outputMessage = new EVUITest.OutputWriterMessage();
        var output = "Test #" + testResult.testId + ":" + testResult.instanceInSet + " - \"" + testResult.testName + "\" ";

        if (testResult.success === true)
        {
            outputMessage.logLevel = EVUITest.LogLevel.Debug;
            output += "SUCCEDED in " + testResult.duration.toFixed(3) + "ms."
        }
        else
        {
            if (testResult.intentionalFailure === true)
            {
                outputMessage.logLevel = EVUITest.LogLevel.Debug;
                output += "SIMULATED FAILURE  in " + testResult.duration.toFixed(3) + "ms.";
            }
            else
            {
                outputMessage.logLevel = EVUITest.LogLevel.Error;
                output += "FAILED  in " + testResult.duration.toFixed(3) + "ms.";
            }

            if (typeof testResult.reason === "string" && testResult.reason.trim().length > 0)
            {
                output += "\nReason: " + testResult.reason;
            }
            else if (testResult.error instanceof Error && testResult.intentionalFailure !== true)
            {
                output += "\n" + testResult.error.stack;
            }
        }

        if (testResult.arguments != null && testResult.arguments.length > 0)
        {
            var argsStr = " With Arguments:\t";

            if (typeof arguments === "function")
            {
                argsStr += testResult.arguments.toString();
            }
            else if (typeof arguments === "object")
            {
                try
                {
                    argsStr += JSON.stringify(testResult.arguments);
                }
                catch (ex)
                {
                    argsStr += "<JSON.stringify crashed: " + ex.message.replace(/\n\r|\r\n|\n|\r|\t/g, " ").replace(/\s+/g, " ") + ">";
                }
            }
            else
            {
                argsStr += testResult.arguments.toString();
            }

            output += argsStr
        }

        outputMessage.message = output;
        return outputMessage;
    };

    /**Takes ambiguous user input and makes a TestState object from it.
    @param {String|EVUITest.Test|EVUITest.Constants.Fn_Test} name Either the name of the test, a test yolo, or a test function.
    @param {EVUITest.Test|EVUITest.Constants.Fn_Test} test The test to turn into a TestState.*/
    var getTestAmbiguously = function (name, test)
    {
        var testType = typeof test;
        var nameType = typeof name;

        if (name == null || (nameType !== "object" && nameType !== "function" && nameType !== "string")) return null;

        if (nameType === "string")
        {
            if (test == null || (testType !== "object" && testType !== "function")) return null;
        }
        else
        {
            test = name;
            testType = nameType;
        }        

        var state = new TestState();
        var realTest = new EVUITest.Test(state);

        //if we were handed an object, populate the realTest with its values
        if (testType === "object")
        {
            var args = getTestArguments(test.testArgs);           

            //move the properties from the user's test onto the real test
            extend(realTest, test, ["id", "testArgs"]);

            realTest.testArgs = args;
            state.arguments = args;
        }
        else if (testType === "function") //if the test was just a function, just set the actual test part of the test.
        {
            realTest.test = test;
            state.arguments = [];
        }
        else
        {
            return null;
        }

        if (typeof (realTest.test) !== "function") throw Error("Test must have a test property that is a function.");

        name = (typeof realTest.name === "string" && realTest.name.trim().length > 0) ? realTest.name : name;
        name = (typeof name === "string" && name.trim().length > 0) ? name : "<anonymous>";

        realTest.name = name;
        state.test = realTest;

        return state;
    };

    /**Gets the complete array of test arguments from the user's input, regardless if it was a properly formatted array, a generator function, or a vanilla function
    @param {[]} args
    @returns {[]} */
    var getTestArguments = function (args)
    {
        if (args == null) return [];
        
        if (Array.isArray(args) === false) //args should be an array of arrays
        {
            if (typeof args === "function")
            {
                var returnedArgs = args(); //get the result of the arguments function call to use as the arguments for the test
                if (typeof returnedArgs === "object" && returnedArgs != null && typeof returnedArgs[Symbol.iterator] === "function")
                {
                    if (typeof returnedArgs.next === "function") //if we got an object with a "next" function, it's an iterator
                    {
                        args = [];
                        var result = returnedArgs.next(); //use the iterator to get the full list of parameters in advance
                        while (result != null && result.done === false)
                        {
                            args.push(Array.isArray(result.value) === false ? [result.value] : result.value); //very result needs to be wrapped in an array
                            result = returnedArgs.next();
                        }
                    }
                    else //not an iterator
                    {
                        if (Array.isArray(returnedArgs) === false) //again, ensure the value is an array
                        {
                            args = [returnedArgs];
                        }
                        else
                        {
                            args = returnedArgs;
                        }
                    }
                }
                else //wasn't even an object, wrap it in an array
                {
                    args = [returnedArgs];
                }
            }
            else //was not an array, wrap it in an array
            {
                args = [args];
            }
        }
        else //it WAS an array - make a copy of it so it cant be manipulated during the test
        {
            args = args.slice();
        }

        return args;
    }

    /**Gets the next test in the test queue.
    @returns {TestState}*/
    var getNextTest = function ()
    {
        var testToRun = _testQueue.shift();
        return testToRun;
    };

    /**Utility function for ensuring that there is a valid outputWriter before attempting to write any output about the results of a test instance.
    @param {EVUITest.TestResult} testResult The result object representing the test that was just completed..*/
    var writeTestOutput = function (testResult)
    {
        if (typeof _self.outputWriter?.writeOutput !== "function")
        {
            console.log("Invalid outputWriter! The outputWriter must have a \"writeOutput\" function.");
        }
        else
        {
            try
            {
                var testLogMessage = formatTestOutput(testResult);
                writeOutput(testLogMessage);
            }
            catch (ex)
            {
                var errorLogMessage = new EVUITest.OutputWriterMessage();
                errorLogMessage.logLevel = EVUITest.LogLevel.Critical;
                errorLogMessage.message = "Error generating log message: " + ex.stack;

                writeOutput(errorLogMessage);
            }
        }
    };

    /**Utility function for writing arbitrary content to the outputWriter's destination.
    @param {Any} args Any values to write as output.*/
    var writeOutput = function (...args)
    {
        if (typeof _self.outputWriter?.writeOutput !== "function")
        {
            console.log("Invalid outputWriter! The outputWriter must have a \"writeOutput\" function that accepts an ...args set of arguments.");
        }
        else
        {
            try
            {
                _self.outputWriter.writeOutput(...args);
            }
            catch (ex)
            {
                console.log(ex);
            }
        }
    }

    /**Executes a test via executing all of the test instances made from its arguments list.
    @param {TestState} testState THe internal property bag holding state information about a test.
    @param {Function} callback A callback function to call once all instances of this test have been run.*/
    var executeTest = function (testState, callback)
    {
        _executing = true;
        var numInstances = testState.instances.length;
        if (typeof callback === "function" && typeof testState.callback !== "function") testState.callback = callback;

        var runTest = function (index)
        {
            if (index >= numInstances)
            {
                try
                {
                    callback(testState);
                }
                catch (ex)
                {
                    var errorLogMessage = new EVUITest.OutputWriterMessage();
                    errorLogMessage.logLevel = EVUITest.LogLevel.Critical;
                    errorLogMessage.message = "Error in " + testState.test.name + " callback: " + ex.stack;

                    writeOutput(errorLogMessage);
                }

                var next = getNextTest();
                if (next != null)
                {
                    executeTest(next, next.callback);
                }
                else
                {
                    _executing = false;
                }

                return;
            }

            executeInstance(testState.instances[index], function (testInstance)
            {
                var testResult = makeResultFromState(testInstance);
                testState.results.push(testResult);

                _testResults.push(testResult);

                writeTestOutput(testResult);
                runTest(++index);
            });
        };

        runTest(0);
    };

    /**Executes an instance of a test (a test function combined with a set of arguments).
    @param {TestInstance} testInstance The instance of the test to run.
    @param {Function} callback A callback function to call once the test instance has finished running - takes the completed test instance as a parameter.*/
    var executeInstance = function (testInstance, callback)
    {
        var testFinished = false; //flag to make sure that the callback is not called twice
        var finalOptions = makeFinalOptions(testInstance.state.test.options, _self.options); //combination of the options on the test and on the host
        var timeout = typeof finalOptions.timeout !== "number" ? 100 : finalOptions.timeout; //timeout before the test auto-fails.
        var timeoutID = -1; //id of the setTimeout return value. Used to cancel the timeout in the event the test completes before it expires.

        finalOptions.timeout = timeout;
        testInstance.options = finalOptions;
        _currentTestInstance = testInstance;

        var existingOutputWriter = _self.outputWriter.writeOutput;
        _self.outputWriter.writeOutput = function (...args)
        {
            var loggedMessage = new EVUITest.TestHostOutput();
            loggedMessage.id = _messageIDCounter++;
            loggedMessage.instanceId = testInstance.instanceId;
            loggedMessage.testId = testInstance.state.testId;
            loggedMessage.message = args;
            loggedMessage.timestamp = Date.now();

            testInstance.output.push(loggedMessage);

            existingOutputWriter(args);
        }

        var finish = function () //final function to call on all exit paths from this function
        {
            removeEventListener("error", errorHandler);

            if (timeoutID > -1) clearTimeout(timeoutID);

            _currentTestInstance = null;
            _self.outputWriter.writeOutput = existingOutputWriter;

            callback(testInstance);
        };

        var pass = function () //function to call when the test passes
        {
            if (testFinished === true) return;
            testFinished = true;

            testInstance.success = true;
            testInstance.endTime = performance.now();

            finish();
        };

        var fail = function (reasonOrEx, expectedFailure) //function to call when the test fails
        {
            if (testFinished === true) return;
            testFinished = true;

            testInstance.success = false;
            testInstance.intentionalFailure = (typeof expectedFailure === "boolean") ? expectedFailure : false;
            testInstance.endTime = performance.now();

            if (typeof reasonOrEx === "string")
            {
                testInstance.reason = reasonOrEx;
            }
            else if (reasonOrEx instanceof Error)
            {
                testInstance.error = reasonOrEx;
            }
            else //make an error so we get a stack trace
            {
                testInstance.error = Error("Manually failed for an unknown reason.");
            }

            finish();
        };

        var errorHandler = function (args) //event handler to attach to the window to catch errors that would normally escape the try-catch below due to being in a different stack frame
        {
            //if the error came from a script file that we don't care about, do nothing
            if (meetsScriptFilter(args.filename, finalOptions.fileFilter) === false) return;

            fail(args.error);
        };

        //add the global error event listener to catch exceptions thrown not on the stack trace of the promise (i.e. in a callback for a native API, like a XMLHttpRequest)
        addEventListener("error", errorHandler);

        var runTest = function ()
        {
            try
            {
                _testCounter++;
                _self.outputWriter.logDebug("RUNNING Test #" + testInstance.state.testId + ":" + testInstance.instanceInSet + " - \"" + testInstance.state.test.name + "\"");

                var testArgs = new EVUITest.TestHostArgs();
                testArgs.fail = fail;
                testArgs.pass = pass;
                testArgs.outputWriter = _self.outputWriter;
                testArgs.parameters = testInstance.arguments.slice();
                testArgs.options = finalOptions;

                timeoutID = setTimeout(function () //set the timeout failsafe
                {
                    fail(new Error("Timeout reached after " + timeout + "ms."))
                }, timeout);

                //make the final args array to use to invoke the test. The first two parameters are always the pass and fail functions
                var allArgs = [testArgs].concat(testInstance.arguments);
                testInstance.startTime = performance.now();

                var result = testInstance.testFn.apply(this, allArgs);
                if (result instanceof Promise)
                {
                    result.then(function ()
                    {
                        if (testFinished === false && finalOptions.implicitSuccess === true) pass();
                    });

                    result.catch(function (ex) //if we had an async function, listen for its failure (which would normally escape the try catch here)
                    {
                        fail(ex);
                    });
                }
                else
                {
                    if (testFinished === false && finalOptions.implicitSuccess === true) pass();
                }
            }
            catch (ex)
            {
                fail(ex);
            }
        };

        //because the test host runs tests in one big recursive loop, this resets the stack frame for every test run and prevents an eventual stack overflow and allows for log messages to come through mid-test
        if (_testCounter > 0 && _testCounter % 5 === 0)
        {
            setTimeout(runTest); //run a timeout to let go of the thread and let any pending calls in the event loop fire
        }
        else
        {
            Promise.resolve().then(runTest); //run the test in the faster promise event queue for better performance
        }
    };

    /**Creates a TestInstance for every set of arguments in the args list provided by the user.
    @param {TestState} testState The internal property bag of state about the test being run.*/
    var getTestInstances = function (testState)
    {
        var instances = [];
        var numArgs = testState.arguments.length;

        if (numArgs == 0)
        {
            var instance = new TestInstance();
            instance.arguments = [];
            instance.state = testState;
            instance.instanceInSet = 1;
            instance.testFn = testState.test.test;

            instances.push(instance);
        }
        else
        {
            for (var x = 0; x < numArgs; x++)
            {
                var instance = new TestInstance();
                instance.arguments = (Array.isArray(testState.arguments[x]) === false) ? [testState.arguments[x]] : testState.arguments[x];
                instance.state = testState;
                instance.instanceInSet = x + 1;
                instance.testFn = testState.test.test;

                instances.push(instance);
            }
        }

        return instances;
    };

    /**Makes a TestResult from a TestInstance.
    @param {TestInstance} testInstance The instance of the test that was just completed.
    @type {EVUITest.TestResult}*/
    var makeResultFromState = function (testInstance)
    {
        var result = new EVUITest.TestResult();

        result.testId = testInstance.state.testId;
        result.arguments = testInstance.arguments;
        result.duration = testInstance.endTime - testInstance.startTime;
        result.error = testInstance.error;
        result.success = testInstance.success;
        result.testId = testInstance.state.testId;
        result.testName = testInstance.state.test.name;
        result.instanceId = testInstance.instanceId;
        result.instanceInSet = testInstance.instanceInSet;
        result.reason = testInstance.reason;
        result.intentionalFailure = testInstance.intentionalFailure;
        result.options = testInstance.options;
        result.output = testInstance.output;

        if (testInstance.options.shouldFail === true) //if we were supposed to fail the test, invert the success/fail flags but mark the fail as intentional
        {
            if (result.success === true)
            {
                result.success = false;
                if (typeof result.reason !== "string") result.reason = "Test PASSED but was expected to FAIL.";
            }
            else
            {
                result.intentionalFailure = true;
            }
        }

        return result;
    }

    /**Performs an inheritance operation on the various option sets we can use to make the final options set.
    @param {EVUITest.TestOptions} testOptions The options settings that apply to the whole test.
    @param {EVUITest.TestOptions} hostOptions The options settings that applies to all tests in the test runner.
    @returns {EVUITest.TestOptions}*/
    var makeFinalOptions = function (testOptions, hostOptions)
    {
        var finalOptions = new EVUITest.TestOptions();

        extend(finalOptions, hostOptions);
        extend(finalOptions, testOptions);

        return finalOptions;
    };

    /**Determines whether or not the script reported in the global error handler is one of the relevant scripts being watched for exceptions and not a random 3rd party library.
    @param {String} scriptName The name of the script that crashed.
    @param {RegExp|String|RegExp[]|String{}} filter The filter to determine if the script file applies or not.
    @returns {Boolean}*/
    var meetsScriptFilter = function (scriptName, filter)
    {
        if (Array.isArray(filter) === true)
        {
            var numInFilter = filter.length;
            for (var x = 0; x < numInFilter; x++)
            {
                var curFilter = filter[x];
                if (typeof curFilter === "string")
                {
                    if (curFilter === scriptName)
                    {
                        return true;
                    }
                }
                else if (curFilter instanceof RegExp)
                {
                    if (curFilter.test(scriptName) === true)
                    {
                        return true;
                    }
                }
            }
        }
        else if (typeof filter === "string")
        {
            if (scriptName === filter) return true;
        }
        else if (filter instanceof RegExp)
        {
            if (filter.test(scriptName) === true) return true;
        }

        return false;
    };

    /**Simple extend function, moved vales from the source onto the target if the target is missing one of the values from the source.
    @param {Object} target The object to receive properties.
    @param {Object} source The source of the values for the target.
    @returns {Object} */
    var extend = function (target, source, filter)
    {
        if (target == null) return target;
        if (source == null) return target;

        if (typeof target !== "object" || typeof source !== "object") return target;
        var filterObj = {};

        if (Array.isArray(filter))
        {
            var numFilter = filter.length;
            for (var x = 0; x < numFilter; x++)
            {
                filterObj[filter[x]] = true;
            }
        }

        for (var prop in source)
        {
            if (filterObj[prop] === true) continue;

            var sourceValue = source[prop];
            if (sourceValue !== undefined)
            {
                target[prop] = sourceValue;
            }
        }

        return target;
    };

    /**The internal state property bag that contains all the known info about a user's test.
    @class*/
    var TestState = function ()
    {
        /**Number. The unique ID of the test.
        @type {Number}*/
        this.testId = _idCounter++;

        /**Object. The actual test to run.
        @type {EVUITest.Test}*/
        this.test = null;

        /**Array.The arguments given by the user to run the test with.
        @type {[[]]}*/
        this.arguments = null;

        /**Array. An instance of each test the user "requested" by providing multiple parameters.
        @type {TestInstance[]}*/
        this.instances = [];

        /**Array. The array of all the test results produced by the source test.
        @type {EVUITest.TestResult}*/
        this.results = [];

        /**Function. A callback to call once this test has completed running all of its instances.
        @type {Function}*/
        this.callback = null;
    };

    /**Represents a single invocation of a user's test with a set of given parameters.
    @class*/
    var TestInstance = function ()
    {
        /**Number. THe unique ID of this test instance.
        @type {Number}*/
        this.instanceId = _instanceCounter++;

        /**Number. The index of this test in a set of tests spawned by a Test with multiple argument sets.
        @type {Number}*/
        this.instanceInSet = 0;

        /**Object. The TestState associated with this TestInstance.
        @type {TestState}*/
        this.state = null;

        /**Number. The starting timestamp of the TestInstance immediately before running the test.
        @type {Number}*/
        this.startTime = null;

        /**Number. The ending timestamp of the TestInstance immediately after running the test.*/
        this.endTime = null;

        /**Array. The arguments passed into the test.
        @type {Array}*/
        this.arguments = null;

        /**Boolean. Whether or not the test succeeded.
        @type {Boolean}*/
        this.success = false;

        /**Boolean. Whether or not the failure was intentional.
        @type {Boolean}*/
        this.intentionalFailure = false;

        /**String. If the test was manually failed, this is the reason why.
        @type {String}*/
        this.reason = null;

        /**Error. If the test crashed, this is the exception that was thrown.
        @type {Error}*/
        this.error = null;

        /**Function. The actual test being run.
        @type {EVUITest.Constants.Fn_Test}*/
        this.testFn = null;

        /**Object. The options used for the test.
        @type {EVUITest.TestOptions}*/
        this.options = null;

        /**Array. An array of the arguments passed into the OutputWriter while this test was running.
        @type {EVUITest.TestHostOutput}*/
        this.output = [];
    }
};

EVUITest.TestHostOutput = function ()
{
    this.id = -1;
    this.testId = -1;
    this.instanceId = -1;
    this.timestamp = -1;
    this.message = null;
};

/**The arguments made by EventUI Test that are injected as the first parameter into every test.
@class*/
EVUITest.TestHostArgs = function ()
{
    /**Function. Indicates that the test has passed.
    @type {EVUITest.Constants.Fn_TestPass}*/
    this.pass = function () { };

    /**Function. Indicates that the test has failed (and, optionally, that the failure was expected).
    @type {EVUITest.Constants.Fn_TestFail}*/
    this.fail = function (reasonOrEx, intentionalFailure) { };

    /**Array. The array of parameters provided to the test that were passed into the test function.
    @type {[]}*/
    this.parameters = null;

    /**Object. The OutputWriter that belongs to the TestHost running the test.
    @type {EVUITest.OutputWriter}*/
    this.outputWriter = null;

    /**Object. The options being used for this test.
    @type {EVUITest.TestOptions}*/
    this.options = null;
};

/**An object which runs simple tests on a constructor argument parameter.
@param {Any} value The value to make an assertion operation on.
@param {EVUITest.AssertionSettings|EVUITest.ValueCompareOptions|EVUITest.AssertionLogOptions} settings Optional arguments to feed into the Assertion.
@class*/
EVUITest.Assertion = function (value, settings)
{
    /**The value being tested by the assertion.
    @type {Any}*/
    var _value = value;

    /**The internal default settings for how the Assertion will perform its comparison operation.
    @type {EVUITest.AssertionSettings}*/
    var _settings = null;

    /**Object. The latest comparison made by this Assertion.
    @type {EVUITest.ValueCompareResult|EVUITest.ValueContainmentResult|EVUITest.ValuePredicateResult}*/
    var _lastComparison = null;

    /**Returns the value wrapped by the Assertion.
    @type {Any}*/
    this.getValue = function ()
    {
        return _value;
    };

    /**Sets the internal default settings (or reverts them to the default if the setting parameter is omitted) for the Assertion.
    @param {EVUITest.AssertionSettings|EVUITest.ValueCompareOptions|EVUITest.AssertionLogOptions} assertionSettings The settings to give the assertion.
    @returns {EVUITest.Assertion} */
    this.setSettings = function (assertionSettings)
    {
        assertionSettings = getSettingsAmbiguously(assertionSettings);
        assertionSettings = ensureSettings(assertionSettings);

        _settings = assertionSettings;

        return this;
    };

    /**Gets the settings used by this Assertion.
    @returns {EVUITest.AssertionSettings}*/
    this.getSettings = function ()
    {
        return _settings;
    };

    /**Gets the latest comparison made by the Assertion.
    @returns {EVUITest.ValueCompareResult|EVUITest.ValueContainmentResult|EVUITest.ValuePredicateResult}*/
    this.getLastComparison = function ()
    {
        return _lastComparison;
    };

    /**Returns the success of the latest comparison made by the Assertion. If the Assertion has not been used yet, false is returned.
    @returns {Boolean}*/
    this.isSuccess = function ()
    {
        if (_lastComparison != null) return _lastComparison.success;
        return false;
    };

    /**Determines if two values are equal using strict ValueCompareOptions rules by default.
    @param {any} b The value to compare against the Assertion's value.
    @param {EVUITest.AssertionSettings|EVUITest.ValueCompareOptions|EVUITest.AssertionLogOptions} compareOptions Optional. The options for the operation - can be a YOLO of any combination of ValueCompareOptions, AssertionLogOptions, or AssertionSettings.
    @returns {EVUITest.ValueCompareResult}*/
    this.is = function (b, compareOptions)
    {
        var defaultSettings = {};
        defaultSettings.affirmitiveCheck = true;
        defaultSettings.compareType = EVUITest.ValueCompareType.Equality;
        defaultSettings.shortCircuit = true;

        var error = executeAssertion(b, compareOptions, defaultSettings);
        if (error != null) throw new Error(error.message);

        return _lastComparison;
    };

    /**Determines if two values are NOT equal using strict ValueCompareOptions rules by default.
    @param {any} b The value to compare against the Assertion's value.
    @param {EVUITest.AssertionSettings|EVUITest.ValueCompareOptions|EVUITest.AssertionLogOptions} compareOptions Optional. The options for the operation - can be a YOLO of any combination of ValueCompareOptions, AssertionLogOptions, or AssertionSettings.
    @returns {EVUITest.ValueCompareResult}*/
    this.isNot = function (b, compareOptions)
    {
        var defaultSettings = {};
        defaultSettings.affirmitiveCheck = false;
        defaultSettings.compareType = EVUITest.ValueCompareType.Equality;
        defaultSettings.shortCircuit = true;

        var error = executeAssertion(b, compareOptions, defaultSettings);
        if (error != null) throw new Error(error.message);

        return _lastComparison;
    };

    /**Determines if the predicate function returns true (as determined by a strict comparison to the boolean 'true' by default) when executed and passed the Assertion's value as a parameter.
    @param {EVUITest.Constants.Fn_Predicate} predicate The function to feed Assertion's value into.
    @param {EVUITest.AssertionSettings|EVUITest.ValueCompareOptions|EVUITest.AssertionLogOptions} compareOptions Optional. The options for the operation - can be a YOLO of any combination of ValueCompareOptions, AssertionLogOptions, or AssertionSettings.
    @returns {EVUITest.ValuePredicateResult}*/
    this.isTrue = function (predicate, compareOptions)
    {
        var defaultSettings = {};
        defaultSettings.affirmitiveCheck = true;
        defaultSettings.compareType = EVUITest.ValueCompareType.Predicate;

        var error = executeAssertion(predicate, compareOptions, defaultSettings);
        if (error != null) throw new Error(error.message);

        return _lastComparison;
    };

    /**Determines if the predicate function returns false (as determined by a strict comparison to the boolean 'false' by default) when executed and passed the Assertion's value as a parameter.
    @param {EVUITest.Constants.Fn_Predicate} predicate The function to feed Assertion's value into.
    @param {EVUITest.AssertionSettings|EVUITest.ValueCompareOptions|EVUITest.AssertionLogOptions} compareOptions Optional. The options for the operation - can be a YOLO of any combination of ValueCompareOptions, AssertionLogOptions, or AssertionSettings.
    @returns {EVUITest.ValuePredicateResult}*/
    this.isFalse = function (predicate, compareOptions)
    {
        var defaultSettings = {};
        defaultSettings.affirmitiveCheck = false;
        defaultSettings.compareType = EVUITest.ValueCompareType.Predicate;

        var error = executeAssertion(predicate, compareOptions, defaultSettings);
        if (error != null) throw new Error(error.message);

        return _lastComparison;
    };

    /**Determines if an Array contains the given value based on strict ValueCompareOptions by default.
    @param {Any} value The value to find in the Assertion's value.
    @param {EVUITest.AssertionSettings|EVUITest.ValueCompareOptions|EVUITest.AssertionLogOptions} compareOptions Optional. The options for the operation - can be a YOLO of any combination of ValueCompareOptions, AssertionLogOptions, or AssertionSettings.
    @returns {EVUITest.ValueContainmentResult}*/
    this.contains = function (value, compareOptions)
    {
        var defaultSettings = {};
        defaultSettings.affirmitiveCheck = true;
        defaultSettings.compareType = EVUITest.ValueCompareType.Containment;

        var error = executeAssertion(value, compareOptions, defaultSettings);
        if (error != null) throw new Error(error.message);

        return _lastComparison;
    };

    /**Determines if an Array does not contain the given value based on strict ValueCompareOptions by default.
    @param {Any} value The value to find in the Assertion's value.
    @param {EVUITest.AssertionSettings|EVUITest.ValueCompareOptions|EVUITest.AssertionLogOptions} compareOptions Optional. The options for the operation - can be a YOLO of any combination of ValueCompareOptions, AssertionLogOptions, or AssertionSettings.
    @returns {EVUITest.ValueContainmentResult}*/
    this.doesNotContain = function (value, compareOptions)
    {
        var defaultSettings = {};
        defaultSettings.affirmitiveCheck = false;
        defaultSettings.compareType = EVUITest.ValueCompareType.Containment;

        var error = executeAssertion(value, compareOptions, defaultSettings);
        if (error != null) throw new Error(error.message);

        return _lastComparison;
    };

    /**Determines if two values are "equivalent" in that
    1. If both are objects, their property values match (excluding functions) regardless if the object references differ.
    
    Otherwise equivalence is based on strict ValueCompareOptions by default.
    @param {Any} b The value to compare against the Assertion's value.
    @param {EVUITest.AssertionSettings|EVUITest.ValueCompareOptions|EVUITest.AssertionLogOptions} compareOptions Optional. The options for the operation - can be a YOLO of any combination of ValueCompareOptions, AssertionLogOptions, or AssertionSettings.
    @returns {EVUITest.ValueCompareResult}*/
    this.isEquivalentTo = function (b, compareOptions)
    {
        var defaultSettings = {};
        defaultSettings.affirmitiveCheck = true;
        defaultSettings.compareType = EVUITest.ValueCompareType.Equivalency;
        defaultSettings.shortCircuit = true;
        defaultSettings.ignoreReferences = true;
        defaultSettings.functionCompareType = EVUITest.FunctionCompareType.Ignore;

        var error = executeAssertion(b, compareOptions, defaultSettings);
        if (error != null) throw new Error(error.message);

        return _lastComparison;
    };

    /**Determines if two values are NOT "equivalent" in that:
    1. If both are objects, at least one of their property values do not match (excluding functions) regardless if the object references differ.

    Otherwise equivalence is based on strict ValueCompareOptions by default.
    @param {Any} b The value to compare against the Assertion's value.
    @param {EVUITest.AssertionSettings|EVUITest.ValueCompareOptions|EVUITest.AssertionLogOptions} compareOptions Optional. The options for the operation - can be a YOLO of any combination of ValueCompareOptions, AssertionLogOptions, or AssertionSettings.
    @returns {EVUITest.ValueCompareResult}*/
    this.isNotEquivalentTo = function (b, compareOptions)
    {
        var defaultSettings = {};
        defaultSettings.affirmitiveCheck = false;
        defaultSettings.compareType = EVUITest.ValueCompareType.Equivalency;
        defaultSettings.shortCircuit = true;
        defaultSettings.ignoreReferences = true;
        defaultSettings.functionCompareType = EVUITest.FunctionCompareType.Ignore;

        var error = executeAssertion(b, compareOptions, defaultSettings);
        if (error != null) throw new Error(error.message);

        return _lastComparison;
    };

    /**Determines if two values are "roughly" the same in that:
    1. If both are objects, their property values match regardless if the object references differ. 
    2. If an object being compared is an array, the order of elements does not matter.
    3. If strings are being compared, their case does not matter.
    4. When objects are compared, mismatches in their child object's relative hierarchy are ignored as long as their property values match.
    5. If both are objects, the functions attached to the objects are ignored.

    Otherwise, loose equality is used by default.
    @param {Any} b The value to compare against the Assertion's value.
    @param {EVUITest.AssertionSettings|EVUITest.ValueCompareOptions|EVUITest.AssertionLogOptions} compareOptions Optional. The options for the operation - can be a YOLO of any combination of ValueCompareOptions, AssertionLogOptions, or AssertionSettings.
    @returns {EVUITest.ValueCompareResult}*/
    this.isRoughly = function (b, compareOptions)
    {
        var defaultSettings = {};
        defaultSettings.affirmitiveCheck = true;
        defaultSettings.compareType = EVUITest.ValueCompareType.Equivalency;
        defaultSettings.shortCircuit = true;
        defaultSettings.ignoreReferences = true;
        defaultSettings.ignoreOrder = true;
        defaultSettings.strictEquals = false;
        defaultSettings.ignoreCase = true;
        defaultSettings.ignoreRelativeReferences = true;
        defaultSettings.functionCompareType = EVUITest.FunctionCompareType.Ignore;

        var error = executeAssertion(b, compareOptions, defaultSettings);
        if (error != null) throw new Error(error.message);

        return _lastComparison;
    };

    /**Determines if two values are NOT "roughly" the same in that:
    1. If both are objects, their property values match regardless if the object references differ. 
    2. If an object being compared is an array, the order of elements does not matter.
    3. If strings are being compared, their case does not matter.
    4. When objects are compared, mismatches in their child object's relative hierarchy are ignored as long as their property values match.
    5. If both are objects, the functions attached to the objects are ignored.

    Otherwise, loose equality is used by default.
    @param {any} b The value to compare against the Assertion's value.
    @param {EVUITest.AssertionSettings|EVUITest.ValueCompareOptions|EVUITest.AssertionLogOptions} compareOptions Optional. The options for the operation - can be a YOLO of any combination of ValueCompareOptions, AssertionLogOptions, or AssertionSettings.
    @returns {EVUITest.ValueCompareResult}*/
    this.isNotRoughly = function (b, compareOptions)
    {
        var defaultSettings = {};
        defaultSettings.affirmitiveCheck = false;
        defaultSettings.compareType = EVUITest.ValueCompareType.Equivalency;
        defaultSettings.shortCircuit = true;
        defaultSettings.ignoreReferences = true;
        defaultSettings.ignoreOrder = true;
        defaultSettings.strictEquals = false;
        defaultSettings.ignoreCase = true;
        defaultSettings.ignoreRelativeReferences = true;
        defaultSettings.functionCompareType = EVUITest.FunctionCompareType.Ignore;

        var error = executeAssertion(b, compareOptions, defaultSettings);
        if (error != null) throw new Error(error.message);

        return _lastComparison;
    };

    /**Performs an arbitrary comparison between two values as specified by the compareOptions parameter.
    @param {Any} b Any value or predicate function to use in the comparison.
    @param {EVUITest.AssertionSettings|EVUITest.ValueCompareOptions|EVUITest.AssertionLogOptions} compareOptions The options for the operation - can be a YOLO of any combination of ValueCompareOptions, AssertionLogOptions, or AssertionSettings.
    @returns {EVUITest.ValueCompareResult|EVUITest.ValueContainmentResult|EVUITest.ValuePredicateResult}*/
    this.compare = function (b, compareOptions)
    {
        if (compareOptions == null || typeof compareOptions !== "object") compareOptions = {};

        var error = executeAssertion(b, compareOptions, {});
        if (error != null) throw new Error(error.message);

        return _lastComparison;
    };

    /**Executes the assertion requested by one of the top-level public functions.
    @param {Any} b The value to test against in the assertion.
    @param {EVUITest.ValueCompareOptions} userOptions The comparison options provided by the user.
    @param {EVUITest.ValueCompareOptions} defaultSettings The required settings to make sure the operation does the right thing.
    @returns {Error}*/
    var executeAssertion = function (b, userOptions, defaultSettings)
    {
        var settings = ensureSettings(getSettingsAmbiguously(userOptions));
        settings.compareOptions = applyCompareSettingsInheritance(settings.compareOptions, defaultSettings);
        settings.comparer = getComparer(settings);

        var comparisonResult = settings.comparer.compare(_value, b, settings.compareOptions);
        var logMessage = getComparisonMessage(comparisonResult);

        comparisonResult.message = logMessage;
        _lastComparison = Object.freeze(comparisonResult);

        var logOnSuccess = typeof settings.logOnSuccess === "boolean" ? settings.logOnSuccess : _settings.logOnSuccess;
        var throwOnFailure = typeof settings.throwOnFailure === "boolean" ? settings.throwOnFailure : _settings.throwOnFailure;

        var outputMessage = new EVUITest.OutputWriterMessage();
        outputMessage.message = logMessage;

        if (comparisonResult.success === true)
        {
            outputMessage.logLevel = EVUITest.LogLevel.Debug;
            if (logOnSuccess !== false) writeOutput(outputMessage, settings);
        }
        else
        {
            outputMessage.logLevel = EVUITest.LogLevel.Error;

            if (throwOnFailure !== false) return Error(logMessage);
            writeOutput(outputMessage, settings);
        }
    };

    /**Gets the correct ValueComparer to use in the Assertion operation.
    @param {EVUITest.AssertionSettings} settings The object derived from user's AssertionSettings.
    @returns {EVUITest.ValueComparer} */
    var getComparer = function (settings)
    {
        if (settings != null && settings.comparer instanceof EVUITest.ValueComparer === true)
        {
            return settings.comparer;
        }
        else if (_settings.comparer instanceof EVUITest.ValueComparer === true)
        {
            return _settings.comparer;
        }
        else
        {
            return EVUITest.ValueComparer.Default;
        }
    };

    /**Gets an AssertionSettings object based on ambiguous user input.
    @param {EVUITest.AssertionSettings|EVUITest.ValueCompareOptions|EVUITest.AssertionLogOptions} userSettings The YOLO graph provided by the user.
    @returns {EVUITest.AssertionSettings} */
    var getSettingsAmbiguously = function (userSettings)
    {
        if (userSettings == null || typeof userSettings !== "object") return;

        var comparer = EVUITest.ValueComparer.Default;
        var compareOptions = {};
        var logOptions = {};
        var assertionSettings = {};

        if (typeof userSettings.compareOptions === "object" && userSettings.compareOptions != null)
        {
            compareOptions = userSettings.compareOptions;
        }
        else
        {
            if (typeof userSettings.affirmitiveCheck === "boolean") compareOptions.affirmitiveCheck = userSettings.affirmitiveCheck;
            if (Array.isArray(userSettings.equalityComparers) === true) compareOptions.equalityComparers = userSettings.equalityComparers;
            if (typeof userSettings.ignoreCase === "boolean") compareOptions.ignoreCase = userSettings.ignoreCase;
            if (typeof userSettings.ignoreOrder === "boolean") compareOptions.ignoreOrder = userSettings.ignoreOrder;
            if (typeof userSettings.ignoreReferences === "boolean") compareOptions.ignoreReferences = userSettings.ignoreReferences;
            if (typeof userSettings.nullCheckOnly === "boolean") compareOptions.nullCheckOnly = userSettings.nullCheckOnly;
            if (typeof userSettings.recursive === "boolean") compareOptions.recursive = userSettings.recursive;
            if (typeof userSettings.shortCircuit === "boolean") compareOptions.shortCircuit = userSettings.shortCircuit;
            if (typeof userSettings.strictEquals === "boolean") compareOptions.strictEquals = userSettings.strictEquals;
            if (typeof userSettings.functionCompareType === "string") compareOptions.functionCompareType = userSettings.functionCompareType;
        }

        if (typeof userSettings.logOptions === "object" && userSettings.logOptions != null)
        {
            logOptions = userSettings.logOptions;
        }
        else
        {
            if (typeof userSettings.stringifyObjects === "boolean") logOptions.stringifyObjects = userSettings.stringifyObjects;
            if (typeof userSettings.stringifyFunctions === "boolean") logOptions.stringifyFunctions = userSettings.stringifyFunctions;
            if (typeof userSettings.maxStringLength === "number") logOptions.maxStringLength = userSettings.maxStringLength;
        }

        if (typeof userSettings.logOnSuccess === "boolean") assertionSettings.logOnSuccess = userSettings.logOnSuccess;
        if (typeof userSettings.throwOnFailure === "boolean") assertionSettings.throwOnFailure = userSettings.throwOnFailure;

        assertionSettings.compareOptions = compareOptions;
        assertionSettings.comparer = comparer;
        assertionSettings.logOptions = logOptions;

        if (typeof assertionSettings.logOnSuccess !== "boolean") assertionSettings.logOnSuccess = EVUITest.Settings.logOnSuccess;
        if (typeof assertionSettings.throwOnFailure !== "boolean") assertionSettings.throwOnFailure = EVUITest.Settings.throwOnFailure;

        if (typeof assertionSettings.logOnSuccess !== "boolean") assertionSettings.logOnSuccess = true;
        if (typeof assertionSettings.throwOnFailure !== "boolean") assertionSettings.throwOnFailure = true;


        return assertionSettings;
    };

    /**Applies the "inheritance chain" of options to the user's options object so that all required properties are present, but the user's settings are maintained.
    @param {EVUITest.ValueCompareOptions} userOptions The options object made from the user's options parameter.
    @param {EVUITest.ValueCompareOptions} requiredSettings The settings for the operation that are mandatory so that the comparer behaves correctly.
    @returns {EVUITest.ValueCompareOptions} */
    var applyCompareSettingsInheritance = function (userOptions, requiredSettings)
    {
        var newOptions = {};

        //most specific - the user's options for the operation
        if (userOptions != null)
        {
            newOptions = extend(newOptions, userOptions);
        }

        //less specific - global options for all operations
        if (_settings.compareOptions != null)
        {
            newOptions = extend(newOptions, _settings.compareOptions);
        }

        //overwrite any required settings
        if (requiredSettings != null)
        {
            for (var prop in requiredSettings)
            {
                newOptions[prop] = requiredSettings[prop];
            }
        }

        return newOptions;
    };

    /**Simple extend function, moved vales from the source onto the target if the target is missing one of the values from the source.\
    @param {Object} target The object to receive properties.
    @param {Object} source The source of the values for the target.
    @returns {Object} */
    var extend = function (target, source)
    {
        if (target == null) return target;
        if (source == null) return target;

        if (typeof target !== "object" || typeof source !== "object") return target;

        for (var prop in source)
        {
            var sourceValue = source[prop];
            var targetValue = target[prop];

            if (targetValue == null)
            {
                target[prop] = sourceValue;
            }
        }

        return target;
    };

    /**Ensures that a valid AssertionSettings object is returned.
    @param {EVUITest.AssertionSettings} settings The user's AssertionSettings YOLO graph.
    @returns {EVUITest.AssertionSettings}*/
    var ensureSettings = function (settings)
    {
        if (settings == null || typeof settings !== "object")
        {
            settings = new EVUITest.AssertionSettings();
            settings.comparer = EVUITest.ValueComparer.Default;
            settings.outputWriter = EVUITest.Settings.outputWriter;
            settings.compareOptions = {};
            settings.logOptions = {};
        }
        else
        {
            if (settings.comparer instanceof EVUITest.ValueComparer === false) settings.comparer = EVUITest.ValueComparer.Default;
            if (settings.compareOptions == null || typeof settings.compareOptions !== "object") settings.compareOptions = {};
            if (settings.logOptions == null || typeof settings.logOptions !== "object") settings.logOptions = {};

            if (typeof settings.logOnSuccess !== "boolean") settings.logOnSuccess = EVUITest.Settings.logOnSuccess;
            if (typeof settings.throwOnFailure !== "boolean") settings.throwOnFailure = EVUITest.Settings.throwOnFailure;
            if (typeof settings.outputWriter == null || typeof settings.outputWriter !== "object") settings.outputWriter = EVUITest.Settings.outputWriter;
        }

        if (typeof settings.logOnSuccess !== "boolean") settings.logOnSuccess = true;
        if (typeof settings.throwOnFailure !== "boolean") settings.throwOnFailure = true;

        return settings;
    };

    /**Writes output to the console or whatever has been assigned as the output writer.
    @param {Any} output Any output to write.
    @param {EVUITest.AssertionSettings} settings The settings for the assertion.*/
    var writeOutput = function (output, settings)
    {
        try
        {
            if (settings.outputWriter == null)
            {
                console.log(output);
            }
            else
            {
                settings.outputWriter.writeOutput(output);
            }
        }
        catch (ex)
        {
            console.log(ex);
        }
    };

    /**Builds the message that will be logged or wrapped in an Error if the assertion failed.
    @param {EVUITest.ValueCompareResult|EVUITest.ValueContainmentResult|EVUITest.ValuePredicateResult} comparisonResult
    @returns {String} */
    var getComparisonMessage = function (comparisonResult)
    {
        if (comparisonResult == null) throw Error("Unknown Comparison - comparison was null.");

        if (comparisonResult.resultType === EVUITest.ValueResultType.Compare)
        {
            return getValueCompareMessage(comparisonResult);
        }
        else if (comparisonResult.resultType === EVUITest.ValueResultType.Containment)
        {
            return getContainmentCompareMessage(comparisonResult);
        }
        else if (comparisonResult.resultType === EVUITest.ValueResultType.Predicate)
        {
            return getPredicateCompareMessage(comparisonResult);
        }
        else
        {
            throw Error("Unknown Comparison - resultType must be a value from ValueResultType.");
        }
    };

    /**Gets the log or error message for a ValueCompareResult.
    @param {EVUITest.ValueCompareResult} valueComparison The comparison to make the message for.
    @returns {String} */
    var getValueCompareMessage = function (valueComparison)
    {
        var prefix = (valueComparison.success === true) ? "Assertion SUCCEEDED: " : "Assertion FAILED: ";

        var logOptions = extend({}, _settings.logOptions);
        logOptions.stringifyObjects = false;
        logOptions.stringifyFunctions = false;

        var aName = getValueStringForm(valueComparison.a, logOptions);
        var bName = getValueStringForm(valueComparison.b, logOptions);
        var comparisonVerb = getOperationStringForm(valueComparison);
        var message = aName + " " + comparisonVerb + " " + bName + ".";
        var compareMessage = "\nExpected: " + getValueStringForm(valueComparison.a, _settings.logOptions) + "\nActual: " + getValueStringForm(valueComparison.b, _settings.logOptions);

        if (valueComparison.aType === "object" && valueComparison.bType === "object")
        {
            if (valueComparison.success === false)
            {
                if (valueComparison.a != null && valueComparison.b != null)
                {
                    var firstDiff = getFirstFailedValueComparison(valueComparison);

                    var path = null;

                    if (typeof firstDiff.path === "string" && firstDiff.path.trim().length > 0)
                    {
                        path = firstDiff.path;
                    }

                    if (path == null)
                    {
                        path = "root comparison";
                        compareMessage = "\nDifference found at " + path + ":  \n\tExpected: " + getValueStringForm(firstDiff.a, _settings.logOptions) + "\n\tActual: " + getValueStringForm(firstDiff.b, _settings.logOptions) + "\n";
                    }
                    else
                    {
                        compareMessage = "\nDifference found at \"" + path + "\":  \n\tExpected: " + getValueStringForm(firstDiff.a, _settings.logOptions) + "\n\tActual: " + getValueStringForm(firstDiff.b, _settings.logOptions) + "\n in Objects" + compareMessage;
                    }
                }
            }
        }

        return prefix + message + compareMessage;
    };

    /**Gets the "string" version of a value to appear in a log or error message.
    @param {Any} value The value to get the string version of.
    @param {EVUITest.AssertionLogOptions} logOptions The options for how the value should be logged or displayed in an error message.
    @returns {String} */
    var getValueStringForm = function (value, logOptions)
    {
        var valueStr = null;
        var maxStrLength = (logOptions != null && typeof logOptions.maxStringLength === "number" && logOptions.maxStringLength >= 0) ? logOptions.maxStringLength : 1000;
        var typeofVal = typeof value;

        if (typeofVal === "object")
        {
            if (value == null)
            {
                return "Object (NULL)";
            }

            var objType = value.constructor.name;
            if (objType === "" || objType == null)
            {
                if (Array.isArray(value) === true)
                {
                    valueStr = "Array";
                }
                else
                {
                    valueStr = "Object";
                }
            }
            else
            {
                valueStr = value.constructor.name;
            }

            if (logOptions != null && logOptions.stringifyObjects !== false)
            {
                if (maxStrLength === 0) return valueStr;

                var valueJSON = "";

                try
                {
                    valueJSON = JSON.stringify(value);
                }
                catch (ex)
                {
                    valueJSON = "Exception in JSON.stringify: " + ex.message;
                }


                if (valueJSON.length > maxStrLength) valueJSON = valueJSON.substring(0, maxStrLength) + "...";

                return valueStr + " - (" + valueJSON + ")";
            }

            return valueStr;
        }
        else if (typeofVal === "function")
        {
            valueStr = "Function";

            if (value.name !== "" && value.name != null) valueStr = value.name + "()";

            if (maxStrLength === 0) return valueStr;

            if (logOptions != null && logOptions.stringifyFunctions === true)
            {
                var fnStr = value.toString();
                if (fnStr.length > maxStrLength) fnStr = fnStr.substring(0, maxStrLength) + "...";

                return valueStr + " - (" + fnStr + ")";
            }

            return valueStr;
        }
        else
        {
            if (typeofVal === "string")
            {
                if (maxStrLength > 0 && value.length > maxStrLength) value = value.substring(0, maxStrLength);
                return "\"" + value + "\"";
            }
            else if (typeofVal === "number" || typeofVal === "boolean" || typeofVal === "symbol")
            {
                return value.toString();
            }
            else if (typeofVal === "undefined")
            {
                return "undefined";
            }
            else if (typeofVal === "bigint")
            {
                return value.toString() + "n";
            }
            else
            {
                return value.toString();
            }
        }
    };

    /**Gets the string that represents the type of comparison that was made.
    @param {EVUITest.ValueCompareResult|EVUITest.ValueContainmentResult|EVUITest.ValuePredicateResult} comparisonResult The comparison to get the operation name for.
    @returns {String} */
    var getOperationStringForm = function (comparisonResult)
    {
        if (comparisonResult.options.compareType === EVUITest.ValueCompareType.Equality)
        {
            if (comparisonResult.valuesEqual === false)
            {
                return "did NOT equal";
            }
            else
            {
                return "equals";
            }
        }
        else if (comparisonResult.options.compareType === EVUITest.ValueCompareType.Equivalency)
        {
            if (comparisonResult.valuesEqual === false)
            {
                return "was NOT equivalent to";
            }
            else
            {
                return "was equivalent to";
            }
        }
        else if (comparisonResult.options.compareType === EVUITest.ValueCompareType.Roughly)
        {
            if (comparisonResult.valuesEqual === false)
            {
                return "was NOT roughly equivalent to";
            }
            else
            {
                return "was roughly equivalent to";
            }
        }
        else if (comparisonResult.options.compareType === EVUITest.ValueCompareType.Containment)
        {
            if (comparisonResult.contains === false)
            {
                return "did NOT contain";
            }
            else
            {
                return "contains";
            }
        }
        else if (comparisonResult.options.compareType === EVUITest.ValueCompareType.Predicate)
        {
            return "returned";
        }
        else
        {
            return "performed an unknown compare type on";
        }
    };

    /**Gets the first comparison failure between two objects, including those that were not due to a reference mismatch.
    @param {EVUITest.ValueCompareResult} valueComparison The comparison to get the first failed comparison from.
    @returns {EVUITest.ValueCompareResult} */
    var getFirstFailedValueComparison = function (valueComparison)
    {
        var stack = [];
        var search = function (comparison)
        {
            var numInStack = stack.length;
            for (var x = 0; x < numInStack; x++)
            {
                var curInStack = stack[x];
                if (curInStack.a === comparison.a && curInStack.b === comparison.b)
                {
                    return null;
                }
            }

            var numChildren = (comparison.childComparisons == null) ? 0 : comparison.childComparisons.length;
            if (numChildren === 0)
            {
                return comparison;
            }
            else if (comparison.options.ignoreReferences === false)
            {
                return comparison;
            }

            stack.push(comparison);

            for (var x = 0; x < numChildren; x++)
            {
                var curChild = comparison.childComparisons[x];
                if (curChild.success === false)
                {
                    var searchResult = search(curChild);
                    if (searchResult != null) return searchResult;
                }
            }

            stack.pop();
        }

        return search(valueComparison);
    };

    /**Gets the log or error message for a containment comparison.
    @param {EVUITest.ValueContainmentResult} containmentComparison The containment comparison result.
    @returns {String} */
    var getContainmentCompareMessage = function (containmentComparison)
    {
        var prefix = (containmentComparison.success === true) ? "Assertion SUCCEEDED: " : "Assertion FAILED: ";

        var logOptions = extend({}, _settings.logOptions);
        logOptions.stringifyObjects = false;
        logOptions.stringifyFunctions = false;

        var aName = getValueStringForm(containmentComparison.container, logOptions);
        var bName = getValueStringForm(containmentComparison.value, logOptions);
        var comparisionVerb = getOperationStringForm(containmentComparison);

        var message = aName + " " + comparisionVerb + " " + bName + ".";
        var compareMessage = "\nSearched In: " + getValueStringForm(containmentComparison.container, _settings.logOptions) + "\nFor: " + getValueStringForm(containmentComparison.value, _settings.logOptions);

        return prefix + message + compareMessage;
    };

    /**Gets the log or error message for a predicate comparison.
    @param {EVUITest.ValuePredicateResult} predicateComparison The predicate comparison result.
    @returns {String}*/
    var getPredicateCompareMessage = function (predicateComparison)
    {
        var prefix = (predicateComparison.success === true) ? "Assertion SUCCEEDED: " : "Assertion FAILED: ";

        var logOptions = extend({}, _settings.logOptions);
        logOptions.stringifyObjects = false;
        logOptions.stringifyFunctions = false;

        var aName = getValueStringForm(predicateComparison.predicate, logOptions);
        var bName = getValueStringForm(predicateComparison.returnValue, logOptions);
        var comparisionVerb = getOperationStringForm(predicateComparison);

        logOptions.stringifyFunctions = true;
        logOptions.stringifyObjects = (_settings.logOptions != null) ? _settings.logOptions.stringifyObjects : false;

        var message = aName + " " + comparisionVerb + " " + bName + ".";
        var compareMessage = "\nExecuted: " + getValueStringForm(predicateComparison.predicate, logOptions) + "\nWith: " + getValueStringForm(predicateComparison.value, logOptions);

        if (predicateComparison.success === false)
        {
            compareMessage += "\nExpected: " + getValueStringForm(predicateComparison.options.affirmitiveCheck, _settings.logOptions) + "\nActual: " + getValueStringForm(predicateComparison.returnValue, _settings.logOptions);
        }

        return prefix + message + compareMessage;
    };

    _settings = ensureSettings(getSettingsAmbiguously(settings));
};

/**Settings that control the behavior of the Assertion.
@class*/
EVUITest.AssertionSettings = function ()
{
    /**Object. The ValueComparer used to perform the comparison work of the Assertion.
    @type {EVUITest.ValueComparer}*/
    this.comparer = null;

    /**Object. The default options to feed into the ValueComparer when the Assertion executes.
    @type {EVUITest.OutputWriter}*/
    this.outputWriter = null;

    /**Object. The default options to feed into the ValueComparer when the Assertion executes.
    @type {EVUITest.ValueCompareOptions}*/
    this.compareOptions = null;

    /**Object. The options for Assertion's message generation.
    @type {EVUITest.AssertionLogOptions}*/
    this.logOptions = null;

    /**Boolean. Whether or not the Assertion should throw an error when it fails.
    @type {Boolean}*/
    this.throwOnFailure = EVUITest.Settings.throwOnFailure;

    /**Boolean. Whether or not the Assertion should log its success.
    @type {Boolean}*/
    this.logOnSuccess = EVUITest.Settings.logOnSuccess;
};

/**Settings that control how log/error messages are generated for an Assertion.
@class*/
EVUITest.AssertionLogOptions = function ()
{
    /**Boolean. Whether or not to stringify objects in error and log messages.
    @type {Boolean}*/
    this.stringifyObjects = true;

    /**Boolean. Whether or not to stringify functions in error and log messages.
    @type {Boolean}*/
    this.stringifyFunctions = true;

    /**Number. The maximum length for a string (a raw string or stringified object/function) in an error message.
    @type {Number}*/
    this.maxStringLength = 1000;
};

/**Object for making various kinds of comparisons between values, objects, and functions.
@class*/
EVUITest.ValueComparer = function ()
{
    //self reference for closures
    var _self = this;

    /**Executes a "compare" operation that can be a value comparison, a "containment" check where an element is looked for in an array, or a predicate function validated against its expected result.
    @param {Any} a Either the first value to compare, the array to search in for a containment check, or the value to feed into a predicate function.
    @param {Any} b Either The second value to compare, the value to find in an array, or the predicate function.
    @param {EVUITest.ValueCompareOptions} options The settings that control what type of "comparison" is done and the rules for determining the equality of values.
    @returns {EVUITest.ValueCompareResult|EVUITest.ValueContainmentResult|EVUITest.ValuePredicateResult}*/
    this.compare = function (a, b, options)
    {
        options = ensureOptions(options);
        var context = buildComparisonContext(a, b, options);
        var result = null;

        if (options.compareType === EVUITest.ValueCompareType.Equality ||
            options.compareType === EVUITest.ValueCompareType.Equivalency ||
            options.compareType === EVUITest.ValueCompareType.Roughly)
        {
            result = compareValues(a, b, context);
        }
        else if (options.compareType === EVUITest.ValueCompareType.Containment)
        {
            result = containmentCompare(a, b, context);
        }
        else if (options.compareType === EVUITest.ValueCompareType.Predicate)
        {
            result = predicateCompare(a, b, context);
        }
        else
        {
            throw Error("Invalid comparison type. Must be a value from EVUITest2.ValueCompareType.");
        }

        deTagReferences(context);
        return result;
    };

    /**Creates a ComparisonContext object to hold the state data about the comparison. 
    @param {Any} a Either the first value to compare, the array to search in for a containment check, or the value to feed into a predicate function.
    @param {Any} b Either The second value to compare, the value to find in an array, or the predicate function.
    @param {EVUITest.ValueCompareOptions} options The settings that control what type of "comparison" is done and the rules for determining the equality of values.
    @returns {ComparisonContext} */
    var buildComparisonContext = function (a, b, options)
    {
        var context = new ComparisonContext();

        if (isObject(a) === true) context.aRoot = a;
        if (isObject(b) === true) context.bRoot = b;

        context.options = Object.freeze(extend({}, options));

        return context;
    };

    /**Compares two arbitrary values.
    @param {any} a A value.
    @param {any} b A value to compare against.
    @param {ComparisonContext} context The contextual information about the comparison.
    @param {EVUITest.ValueCompareResult} parentComparison The comparison that is the direct parent to this one.
    @returns {EVUITest.ValueCompareResult}*/
    var compareValues = function (a, b, context, key, parentComparison)
    {
        var comparison = new EVUITest.ValueCompareResult(parentComparison);
        comparison.a = a;
        comparison.b = b;
        comparison.aType = typeof a;
        comparison.bType = typeof b;
        comparison.key = key;
        comparison.path = (parentComparison != null && typeof parentComparison.path === "string" && parentComparison.path.trim().length > 0) ? parentComparison.path + "." + key : key;
        comparison.options = context.options;

        if (comparison.aType === "object" && comparison.bType === "object" && a != null && b != null)
        {
            var comparisonExecuted = applyCustomComparer(comparison, context);
            if (comparisonExecuted === false)
            {
                if (context.options.recursive === false && parentComparison != null)
                {
                    comparison.valuesEqual = valuesEqual(comparison, context);
                }
                else
                {
                    comparison.valuesEqual = objectsEqual(comparison, context);
                }
            }
        }
        else
        {
            comparison.valuesEqual = valuesEqual(comparison, context);
        }        

        if (context.options.affirmitiveCheck === false)
        {
            if (comparison.valuesEqual === false)
            {
                comparison.success = true;
            }
        }
        else
        {
            comparison.success = comparison.valuesEqual;
        }

        if (parentComparison != null)
        {
            if (parentComparison.childComparisons == null) parentComparison.childComparisons = [];
            parentComparison.childComparisons.push(comparison);
        }

        return comparison;
    };

    /**Looks up to see if there are any custom comparers to be used in this comparison. If so, the custom comparers are used instead of the default compare logic. Returns true if a custom comparer was used.
    @param {EVUITest.ValueCompareResult} comparison The comparison to check against the custom equality comparers list.
    @param {ComparisonContext} context The active comparison context.
    @returns {Boolean}*/
    var applyCustomComparer = function (comparison, context)
    {
        var aComparer = comparison.a[EVUITest.Constants.Symbol_EqualityComparer];
        var bComparer = comparison.b[EVUITest.Constants.Symbol_EqualityComparer];

        var aType = typeof aComparer;
        var bType = typeof bComparer;

        if (aType !== "function" && bType !== "function") return false;

        var comparisonContext = buildEqualityContext(comparison, context);

        if (aType === "function" && bType === "function")
        {
            if (aComparer === bComparer)
            {
                var aEquals = aComparer(comparisonContext);
                if (typeof aEquals !== "boolean") throw Error("a's custom comparer at " + comparison.path + " did not return a boolean. Returned " + aEquals + " instead.");

                comparison.valuesEqual = aEquals;
            }
            else
            {
                var aEquals = aComparer(comparisonContext);
                var bEquals = bComparer(comparisonContext);

                if (typeof aEquals !== "boolean") throw Error("a's custom comparer at " + comparison.path + " did not return a boolean. Returned " + aEquals + " instead.");
                if (typeof bEquals !== "boolean") throw Error("b's custom comparer at " + comparison.path + " did not return a boolean. Returned " + bEquals + " instead.");
                if (aEquals !== bEquals) throw Error("Custom equality disagreement: both values at " + comparison.path + " had custom value comparers that disagreed on equality. a's comparer returned " + aEquals + " and b's comparer returned " + bEquals + ".");

                comparison.valuesEqual = aEquals;
            }
        }
        else if (aType === "function")
        {
            var aEquals = aComparer(comparisonContext);
            if (typeof aEquals !== "boolean") throw Error("a's custom comparer at " + comparison.path + " did not return a boolean. Returned " + aEquals + " instead.");
            
            comparison.valuesEqual = aEquals;
        }
        else if (bType === "function")
        {
            var bEquals = bComparer(comparisonContext);
            if (typeof bEquals !== "boolean") throw Error("b's custom comparer at " + comparison.path + " did not return a boolean. Returned " + bEquals + " instead.");
            
            comparison.valuesEqual = bEquals;
        }

        return true;
    };

    /**Determines if a predicate function returns true or not when passed a value as a parameter.
    @param {any} value The value to feed into the predicate.
    @param {any} predicate The function to execute.
    @param {ComparisonContext} context The contextual information about the comparison.
    @returns {EVUITest.ValuePredicateResult}*/
    var predicateCompare = function (value, predicate, context)
    {
        if (typeof predicate !== "function") throw Error("Second parameter in a predicate compare must be a function.");
        var predicateResult = new EVUITest.ValuePredicateResult();
        predicateResult.predicate = predicate;
        predicateResult.value = value;
        predicateResult.valueType = typeof value;
        predicateResult.options = context.options;
        predicateResult.returnValue = predicate(value);

        var booleanComparison = null;
        if (context.options.affirmitiveCheck === false)
        {
            booleanComparison = compareValues(predicateResult.returnValue, false, context);
        }
        else
        {
            booleanComparison = compareValues(predicateResult.returnValue, true, context);
        }

        predicateResult.success = booleanComparison.success;

        return predicateResult;
    };

    /**Does a containment "compare" operation where it looks to figure out if an array of elements contains another element.
    @param {Array} array The array to look in.
    @param {Any} value The value to find.
    @param {ComparisonContext} context The contextual information about the comparison.
    @returns {EVUITest.ValueContainmentResult}*/
    var containmentCompare = function (array, value, context)
    {
        var containmentComparison = new EVUITest.ValueContainmentResult();
        containmentComparison.container = array;
        containmentComparison.value = value;
        containmentComparison.valueType = typeof value;

        if (isArray(array) === false) throw Error("First value in a containment compare must be an Array.");
        var numInA = array.length;

        for (var x = 0; x < numInA; x++)
        {
            var matchComparison = compareValues(array[x], value);
            if (matchComparison.valuesEqual === true)
            {
                containmentComparison.contains = true;
                break;
            }
        }

        if (context.options.affirmitiveCheck === false)
        {
            if (containmentComparison.contains === false)
            {
                containmentComparison.success = true;
            }
            else
            {
                containmentComparison.success = false;
            }
        }
        else
        {
            containmentComparison.success = containmentComparison.contains;
        }

        return containmentComparison;
    };

    /**Determines whether or not an object can be treated like an array.
    @param {any} val The value to test for being an array.
    @returns {Boolean}*/
    var isArray = function (val)
    {
        if (isObject(val) === false) return false;

        if (Array.isArray(val) === true) return true;
        if (typeof val.length === "number") return true;

        return false;
    };

    /**Build a ValueEqualityContext object that can be fed into the objects's Symbol_ValuesEqual function.
    @param {EVUITest.ValueCompareResult} comparison The comparison being fed into an objects's Symbol_ValuesEqual function.
    @param {ComparisonContext} context The contextual information about the comparison.
    @returns {EVUITest.ValueEqualityContext}*/
    var buildEqualityContext = function (comparison, context)
    {
        var currentContext = new EVUITest.ValueEqualityContext();
        currentContext.comparer = _self;
        currentContext.a = comparison.a;
        currentContext.b = comparison.b;
        currentContext.aRoot = context.aRoot;
        currentContext.bRoot = context.bRoot;
        currentContext.key = comparison.key;
        currentContext.path = comparison.path;
        currentContext.options = context.options;

        var parentComparison = comparison.getParentComparison();
        if (parentComparison != null)
        {
            currentContext.aParent = parentComparison.a;
            currentContext.bParent = parentComparison.b;
        }

        return currentContext;
    };

    /**Determines if two values are equal depending on the settings of the ComparisonContext.
    @param {EVUITest.ValueCompareResult} comparison The comparison with the values to compare.
    @param {ComparisonContext} context The contextual information about the comparison.
    @returns {Boolean} */
    var valuesEqual = function (comparison, context)
    {
        var a = comparison.a;
        var b = comparison.b;

        if (context.options.ignoreCase === true)
        {
            if (typeof a === "string") a = a.toLocaleLowerCase();
            if (typeof b === "string") b = b.toLocaleLowerCase();
        }

        if (context.options.nullCheckOnly === true)
        {
            if (a === undefined) a = null;
            if (b === undefined) b = null;
        }

        var aFunc = typeof a === "function";
        var bFunc = typeof b === "function";

        if (aFunc === true || bFunc === true) 
        {
            if (context.options.functionCompareType === EVUITest.FunctionCompareType.Ignore) //if either is a function and we're ignoring function comparisons, just return true
            {
                return true;
            }
            else if (aFunc === true && bFunc === true) //if both are functions, see if their "value" (their string text) or reference are the same
            {
                if (context.options.functionCompareType === EVUITest.FunctionCompareType.Value)
                {
                    a = a.toString();
                    b = b.toString();
                }
                else if (context.options.functionCompareType === EVUITest.FunctionCompareType.Reference)
                {
                    return a == b;
                }
            }
        }
        

        if (context.options.strictEquals === false)
        {
            return a == b;
        }
        else
        {
            return a === b;
        }
    };

    /**Determines if two objects are equal or equal graphs of each other.
    @param {EVUITest.ValueCompareResult} comparison The comparison of objects.
    @param {ComparisonContext} context The contextual information about the comparison.
    @returns {Boolean}*/
    var objectsEqual = function (comparison, context)
    {
        //if object references matter (or we know we have the same reference), do the normal comparison
        if (context.options.ignoreReferences !== true || comparison.a === comparison.b)
        {
            return valuesEqual(comparison, context);
        }

        var circularRef = getComparisonFromStack(comparison, context);
        if (circularRef != null) return true; //not sure what to do here - if the graph is circular, should this count as the compared objects being equal or not? Went with "true" because it basically skips the comparison and doesn't cause a failure up the line.

        //add this comparison to the compare stack so we cant get into a circular loop
        var stackItem = new CompareStackItem();
        stackItem.compareResult = comparison;

        context.compareStack.push(stackItem);

        //make sure the structure of object references is the same between both objects (unless we are specifically told to ignore this difference)
        if (context.options.ignoreRelativeReferences !== true && validateRelativeReferences(comparison, context) === false) return false;

        //if both objects are arrays, do the special array comparison logic
        if (isArray(comparison.a) && isArray(comparison.b))
        {
            return arraysEqual(comparison, context);
        }

        //we have two non-arrays. Build a combined list of all the property keys in both objects
        var propsDic = {};
        for (var prop in comparison.a)
        {
            propsDic[prop] = true;
        }

        for (var prop in comparison.b)
        {
            propsDic[prop] = true;
        }

        var anyFails = false;
        var allProps = Object.keys(propsDic);
        var numKeys = allProps.length;
        for (var x = 0; x < numKeys; x++) //for every key in the combined keys list
        {
            var curKey = allProps[x];

            var aValue = comparison.a[curKey];
            var bValue = comparison.b[curKey];

            //recursively invoke the comparison logic for each pair of values
            var childComparison = compareValues(aValue, bValue, context, curKey, comparison);
            if (childComparison == null) continue;

            if (childComparison.valuesEqual === false) //failed a child comparison, this object is not equal to its comparison target
            {
                anyFails = true;
                if (context.options.shortCircuit === true) //if we are short-circuiting the comparison, we now know if the objects are equal or not and don't have to do any more work
                {
                    return false;
                }
            }
        }

        //remove this item from the comparison stack
        context.compareStack.pop();

        return (anyFails === false) ? true : false;
    };

    /**Determines if two arrays are equal or not.
    @param {EVUITest.ValueCompareResult} comparison The comparison containing the two arrays.
    @param {ComparisonContext} context The contextual information about the comparison.
    @returns {Boolean}*/
    var arraysEqual = function (comparison, context)
    {
        var arr1Length = comparison.a.length;
        var arr2Length = comparison.b.length;

        if (arr1Length !== arr2Length) return false;

        if (context.options.ignoreOrder === true)
        {
            comparison.valuesEqual = arrayContentsMatch(comparison, context);
        }
        else
        {
            var matches = true;
            for (var x = 0; x < arr1Length; x++)
            {
                var aVal = comparison.a[x];
                var bVal = comparison.b[x];
                var curKey = x.toString();

                var childComparison = compareValues(aVal, bVal, context, curKey, comparison);
                if (childComparison == null) continue;

                if (childComparison.valuesEqual === false)
                {
                    matches = false;
                    comparison.valuesEqual = false;
                    if (context.options.shortCircuit === true) break;
                }
            }

            comparison.valuesEqual = matches;
        }

        return comparison.valuesEqual;
    };

    /**Determines if the contents of two arrays are equal regardless of the order of items in the arrays.
    @param {EVUITest.ValueCompareResult} comparison The comparison holding the arrays.
    @param {ComparisonContext} context The contextual information about the comparison.
    @returns {Boolean}*/
    var arrayContentsMatch = function (comparison, context)
    {
        if (comparison.a.length !== comparison.b.length) return false;

        var contentADic = {};
        var contentBDic = {};
        var allKeys = {};
        var taggedObjects = [];

        var numEles = comparison.a.length;
        for (var x = 0; x < numEles; x++)
        {
            var aVal = comparison.a[x];
            var bVal = comparison.b[x];

            var aType = typeof aVal;
            var bType = typeof bVal;

            var aKey = getArrayEquivalencyKey(aVal, aType, taggedObjects, context);
            var bKey = getArrayEquivalencyKey(bVal, bType, taggedObjects, context);

            //build our "union" dictionary of all keys
            allKeys[aKey] = true;
            allKeys[bKey] = true;

            //get/create and add to the array of values with the same key for "a"
            var aVals = contentADic[aKey];
            if (aVals == null)
            {
                aVals = [];
                contentADic[aKey] = aVals;
            }

            aVals.push(aVal);

            //get/create and add to the array of values with the same key for "b"
            var bVals = contentBDic[bKey];
            if (bVals == null)
            {
                bVals = [];
                contentBDic[bKey] = bVals;
            }

            bVals.push(bVal);
        }

        //make an array for all the objects we couldn't resolve via tagging
        var untaggedObjects = [];

        //first sweep all the "tagged" objects to make sure that they all did actually have tags (i.e. a frozen or sealed object)
        var numTagged = taggedObjects.length;
        for (var x = 0; x < numTagged; x++)
        {
            var curTagged = taggedObjects[x];
            var curTag = curTagged[context.tagKey];

            if (curTag === undefined)
            {
                untaggedObjects.push(curTagged);
            }
        }

        var mismatched = false;

        //for every key in the union dictionary, get the content arrays built above and see if they have the same length, 
        //which indicates that the same value or reference appeared the same number of times in the arrays then their contents are equivalent
        var allKeys = Object.keys(allKeys);
        var numKeys = allKeys.length;
        for (var x = 0; x < numKeys; x++)
        {
            var curKey = allKeys[x];

            var aVals = contentADic[curKey];
            var bVals = contentBDic[curKey];

            var isObject = curKey.indexOf("object-") === 0;

            if (isObject === false) //not an object, we have a mismatch if either list is missing or if their lengths don't match
            {
                if (aVals == null || bVals == null)
                {
                    mismatched = true;
                    break;
                }

                if (aVals.length !== bVals.length)
                {
                    mismatched = true;
                    break;
                }
            }
            else
            {
                var numAVals = aVals == null ? -1 : aVals.length;
                var numBVals = bVals == null ? -1 : bVals.length;

                if (numAVals !== numBVals) //if the number of objects referenced was different, we need to do a very expensive cross-check to see if all the contents match so add them to the untagged objects list
                {
                    if (numAVals > 0) untaggedObjects.push(aVals[0]);
                    if (numBVals > 0) untaggedObjects.push(bVals[0]);
                }
            }
        }

        //now, if we have any objects that were different between the two lists, we need to use whatever logic specified in the options to determine that all the objects in the list have a match somewhere else in the list.
        var numUntagged = untaggedObjects.length;
        for (var x = 0; x < numUntagged; x++)
        {
            var matched = false;

            for (var y = 0; y < numUntagged; y++)
            {
                if (x === y) continue;

                var outer = untaggedObjects[x];
                var inner = untaggedObjects[y];

                var comparison = compareValues(outer, inner, context);
                if (comparison.success === true)
                {
                    matched = true;
                    break;
                }
            }

            if (matched === false)
            {
                mismatched = true;
                break;
            }
        }

        //finally, UN-tag all the objects so they return to their pristine state
        for (var x = 0; x < numTagged; x++)
        {
            delete taggedObjects[x][context.tagKey];
        }

        return mismatched;
    };

    /**Computes a "key" to use in a lookup dictionary of values when doing an array equivalence check.
    @param {Any} value The value to make the key for.
    @param {String} valueType The typeof the value.
    @param {Array} taggedObjects The array of objects that have had the context's tagKey applied to them.
    @param {ComparisonContext} context The contextual information about the comparison.
    @returns {String}*/
    var getArrayEquivalencyKey = function (value, valueType, taggedObjects, context)
    {
        var key = null;

        //see if we have a tagged object
        if (valueType === "object" || valueType === "undefined" || valueType === "function")
        {
            if (value != null)
            {
                key = value[context.tagKey];
                if (key == null) //not tagged yet - tag the object
                {
                    key = "ref-" + Math.random().toString(36);
                    value[context.tagKey] = key;

                    taggedObjects.push(value);
                }
            }
            else
            {
                key = (value === undefined && context.options.nullCheckOnly === false) ? "undefined" : "null";
            }
        }
        else //make a unique string key for the value
        {
            if (valueType === "string" && context.options.ignoreCase === true)
            {
                value = value.toLocaleLowerCase();
            }

            if (context.options.strictEquals === false)
            {
                key = value.toString();
            }
            else
            {
                key = valueType + "-" + value.toString();
            }
        }

        return key;
    }

    /**Looks in the ComparisonContext's compareStack for a previous comparison involving the current target of the comparison.
    @param {EVUITest.ValueCompareResult} curComparison The current comparison.
    @param {ComparisonContext} context The context for the comparison.
    @returns {CompareStackItem}*/
    var getComparisonFromStack = function (curComparison, context)
    {
        var numInStack = context.compareStack.length;
        for (var x = 0; x < numInStack; x++)
        {
            var curStack = context.compareStack[x];
            if (curStack.compareResult.a === curComparison.a && curStack.compareResult.b === curComparison.b)
            {
                return curStack;
            }
        }

        return null;
    };

    /**Determines whether or not a value is a non-null object.
    @param {any} value The value to test.
    @returns {Boolean}*/
    var isObject = function (value)
    {
        return (value != null && typeof value === "object");
    };

    /**Creates a ValueComparerOptions object that is appropriate for the type of comparison and uses as many of the user's default values as possible.
    @param {EVUITest.ValueCompareOptions} options The user's options object.
    @returns {EVUITest.ValueCompareOptions}*/
    var ensureOptions = function (options)
    {
        var compareType;
        var strictEquals;
        var ignoreCase;
        var ignoreReferences;
        var ignoreOrder;
        var equalityComparers;
        var recursive;
        var affirmativeCheck;
        var nullCheckOnly;
        var shortCircuit;
        var ignoreRelativeReferences;
        var functionCompareType;

        //pull all the options off of the user's options object
        if (isObject(options) === true)
        {
            compareType = options.compareType;
            strictEquals = options.strictEquals;
            ignoreCase = options.ignoreCase;
            ignoreReferences = options.ignoreReferences;
            ignoreOrder = options.ignoreOrder;
            recursive = options.recursive;
            affirmativeCheck = options.affirmitiveCheck;
            nullCheckOnly = options.nullCheckOnly;
            shortCircuit = options.shortCircuit;
            ignoreRelativeReferences - options.ignoreRelativeReferences;
            functionCompareType = options.functionCompareType;
        }
        else
        {
            options = new EVUITest.ValueCompareOptions();
        }

        //if any of the values as invalid, assign it to the default value
        if (typeof ignoreCase !== "boolean") ignoreCase = false;
        if (typeof recursive !== "boolean") recursive = true;
        if (typeof affirmativeCheck !== "boolean") affirmativeCheck = true;
        if (typeof nullCheckOnly !== "boolean") nullCheckOnly = true;
        if (typeof shortCircuit !== "boolean") shortCircuit = true;
        if (typeof ignoreRelativeReferences !== "boolean") ignoreRelativeReferences = false;
        

        if (Array.isArray(equalityComparers) === false) equalityComparers = [];

        //the default comparison type is "equality" - if no type was provided or an invalid type was provided, the default is used
        if (typeof compareType === "string")
        {
            compareType = compareType.toLowerCase();
            if (compareType !== EVUITest.ValueCompareType.Containment
                && compareType !== EVUITest.ValueCompareType.Equality
                && compareType !== EVUITest.ValueCompareType.Equivalency
                && compareType !== EVUITest.ValueCompareType.Predicate)
            {
                compareType = EVUITest.ValueCompareType.Equality;
            }
        }
        else
        {
            compareType = EVUITest.ValueCompareType.Equality;
        }

        //set the comparison options for the "fuzzy" compare types
        if (compareType === EVUITest.ValueCompareType.Equivalency)
        {
            if (typeof strictEquals !== "boolean") strictEquals = true;
            if (typeof ignoreReferences !== "boolean") ignoreReferences = true;
            if (typeof ignoreOrder !== "boolean") ignoreOrder = false;
            if (typeof functionCompareType !== "string") functionCompareType = EVUITest.FunctionCompareType.Ignore;
        }
        else if (compareType === EVUITest.ValueCompareType.Roughly)
        {
            if (typeof strictEquals !== "boolean") strictEquals = false;
            if (typeof ignoreReferences !== "boolean") ignoreReferences = true;
            if (typeof ignoreOrder !== "boolean") ignoreOrder = true;
            if (typeof functionCompareType !== "string") functionCompareType = EVUITest.FunctionCompareType.Ignore;
        }
        else
        {
            if (typeof strictEquals !== "boolean") strictEquals = true;
            if (typeof ignoreReferences !== "boolean") ignoreReferences = false;
            if (typeof ignoreOrder !== "boolean") ignoreOrder = false;
            if (typeof functionCompareType !== "string") functionCompareType = EVUITest.FunctionCompareType.Reference;
        }

        //populate the full options object with all the resolved values
        options.compareType = compareType;
        options.ignoreCase = ignoreCase;
        options.ignoreOrder = ignoreOrder;
        options.ignoreReferences = ignoreReferences;
        options.strictEquals = strictEquals;
        options.recursive = recursive;
        options.affirmitiveCheck = affirmativeCheck;
        options.nullCheckOnly = nullCheckOnly;
        options.shortCircuit = shortCircuit;
        options.ignoreRelativeReferences = ignoreRelativeReferences;
        options.functionCompareType = functionCompareType;

        return options;
    };

    /**A very simple extend algorithm that fills in the gaps in another object with properties from a different object.
    @param {Object} target The object to receive the properties.
    @param {Object} source The source of the properties to assign to the target.
    @returns {Object} */
    var extend = function (target, source)
    {
        if (target == null) return target;
        if (source == null) return target;

        if (typeof target !== "object" || typeof source !== "object") return target;

        for (var prop in source)
        {
            var sourceValue = source[prop];
            var targetValue = target[prop];

            if (targetValue == null)
            {
                target[prop] = sourceValue;
            }
        }

        return target;
    };

    /**Validates that the same objects are appearing in the same places in both object graphs.
    @param {EVUITest.ValueCompareResult} comparison The two objects being compared.
    @param {ComparisonContext} context
    @returns {Boolean}*/
    var validateRelativeReferences = function (comparison, context)
    {
        //make sure the current path for the comparison gets added to both ExistingObject records for a and b
        var existing = addExistingObjects(comparison, context);

        var numAPaths = existing.aObj.paths.length;
        var numBPaths = existing.bObj.paths.length;

        if (numAPaths !== numBPaths) return false; //one referenced more other than the other, references out of sync

        var paths = {};
        for (var x = 0; x < numAPaths; x++)
        {
            paths[existing.aObj.paths[x]] = true;
        }

        //make sure that, for every path reference a appears at, reference b also appears
        for (var x = 0; x < numBPaths; x++)
        {
            if (paths[existing.bObj.paths[x]] !== true) return false;
        }

        return true;
    };

    /**Adds the comparison's a and b object values to the lookup tables for each object graph's child objects and/or records the paths that the objects occur at.
    @param {EVUITest.ValueCompareResult} comparison The comparison whose data is being added to the lookup table.
    @param {ComparisonContext} context The comparison in progress.*/
    var addExistingObjects = function (comparison, context)
    {
        var existingInA = context.aObjects[comparison.a[context.referenceKey]];
        if (existingInA == null)
        {
            existingInA = new ExistingObject(comparison.a);
            comparison.a[context.referenceKey] = Math.random();
            context.aObjects[comparison.a[context.referenceKey]] = existingInA;
        }

        existingInA.paths.push(comparison.path);        

        var existingInB = context.bObjects[comparison.b[context.referenceKey]];
        if (existingInB == null)
        {
            existingInB = new ExistingObject(comparison.b);
            comparison.b[context.referenceKey] = Math.random();
            context.bObjects[comparison.b[context.referenceKey]] = existingInB;
        }

        existingInB.paths.push(comparison.path);

        var returnValue =
        {
            aObj: existingInA,
            bObj: existingInB
        };

        return returnValue;
    };

    /**Removes all the referenceKey tags added to objects during the compare operation.
    @param {ComparisonContext} context The compare session in progress.*/
    var deTagReferences = function(context)
    {
        var inA = Object.keys(context.aObjects);
        var numInA = inA.length;
        for (var x = 0; x < numInA; x++)
        {
            delete context.aObjects[inA[x]].obj[context.referenceKey];
        }

        var inB = Object.keys(context.bObjects);
        var numInB = inB.length;
        for (var x = 0; x < numInB; x++)
        {
            delete context.bObjects[inB[x]].obj[context.referenceKey];
        }
    };

    /**The contextual information about a comparison in progress.
    @class*/
    var ComparisonContext = function ()
    {
        /**Object. The root object of the comparison.
        @type {Object}*/
        this.aRoot = null;

        /**Object. The other root object of the comparison. 
        @type {Object}*/
        this.bRoot = null;

        /**Object. The comparison options for what determines equality in this compare session.
        @type {EVUITest.ValueCompareOptions}*/
        this.options = null;

        /**Array. The stack of previous comparisons occurring above the current comparison in a recursive comparison context. Used to detect circular references.
        @type {CompareStackItem[]}*/
        this.compareStack = [];

        /**Object. Dictionary of refereneceKey values to ExistingObject instances for object graph a.
        @type {Object}*/
        this.aObjects = {};

        /**Object. Dictionary of refereneceKey values to ExistingObject instances for object graph b.
        @type {Object}*/
        this.bObjects = {};

        /**String. The key with which objects are tagged to make comparing object references easier.
        @type {String}*/
        this.tagKey = (Math.random() * 1000).toString(36);
        if (typeof Symbol !== "undefined")
        {
            this.tagKey = Symbol(this.tagKey);
        }

        /**String. The key with which object references are stored in the 'aObjects' and 'bObjects' lookup tables.
        @type {String}*/
        this.referenceKey = (Math.random() * 1000).toString(36);
        if (typeof Symbol !== "undefined")
        {
            this.referenceKey = Symbol(this.referenceKey);
        }
    };

    /**An element on a stack of comparisons built during a recursive compare operation.
    @class*/
    var CompareStackItem = function ()
    {
        /**Object. A possible parent comparison to another comparison.
        @type {EVUITest.ValueCompareResult}*/
        this.compareResult = null;
    };

    /**Container for a previously encountered object.
    @class*/
    var ExistingObject = function (obj)
    {
        /**Object. The object from the 'a' graph.
        @type {Object}*/
        this.obj = obj;
        /**Array. All of the paths in the object graph that point to this object.
        @type {String[]}*/
        this.paths = [];
    };
};

/**The default instance of the ValueComparer that is used unless a different value comparer is specified.
@type {EVUITest.ValueComparer}*/
EVUITest.ValueComparer.Default = null;

(function ()
{
    var comparer = null;

    Object.defineProperty(EVUITest.ValueComparer, "Default", {
        get: function ()
        {
            if (comparer == null)
            {
                comparer = Object.freeze(new EVUITest.ValueComparer());
            }

            return comparer;
        },
        configurable: false,
        enumerable: false
    });
})();

/**The type of comparison being made.
@enum*/
EVUITest.ValueCompareType =
{
    /**Default.*/
    None: "none",
    /**A comparison that determines if two values are equal. If objects are being compared, differences in reference, value, and array order are not ignored.*/
    Equality: "equality",
    /**A comparison that determines if two values are equivalents. If objects are being compared differences in object references are ignored, but their values and array order are not.*/
    Equivalency: "equivalence",
    /**A comparison that determines if a value, when fed into a predicate function, returns true.*/
    Predicate: "predicate",
    /**A comparison that determines if a value is present in an array.*/
    Containment: "containment",
    /**A comparison that determines if two values are roughly equal. If objects are being compared, their object references and array orders are ignored, and only their values are compared.*/
    Roughly: "roughly"
};

/**Enum for determining which result type was returned by the ValueComparer's compare function.
@enum*/
EVUITest.ValueResultType =
{
    /**Default.*/
    None: "none",
    /**Result is a ValueComparisonResult.*/
    Compare: "compare",
    /**Result is a ValueContainmentResult.*/
    Containment: "containment",
    /**Result is a ValuePredicateResult.*/
    Predicate: "predicate"
};

/**Enum for determining how functions are determined to be equal (or ignored entirely) when comparing two objects.
 @enum */
EVUITest.FunctionCompareType =
{
    /**Default.*/
    None: "none",
    /**Functions will be ignored and will not be compared.*/
    Ignore: "ignore",
    /**Functions must be the same reference in order to be considered equal.*/
    Reference: "reference",
    /**Functions must either be the same reference or have the same .toString() value to be considered equal.*/
    Value: "value"
};

/**The result of comparing two values.
@class*/
EVUITest.ValueCompareResult = function (parent)
{
    var _parent = parent;

    /**String. The value from the ValueResultType enum indicating what type of result object this is.
    @type {String}*/
    this.resultType = EVUITest.ValueResultType.Compare;

    /**Any. The first value being compared.
    @type {Any}*/
    this.a = undefined;

    /**Any. The second value being compared.
    @type {Any}*/
    this.b = undefined;

    /**String. The result of the typeof operator on the "a" value.
    @type {String}*/
    this.aType = "undefined";

    /**String. The result of the typeof operator on the "b" value.
    @type {String}*/
    this.bType = "undefined";

    /**String. If this value is a property of an object, this is the property key of the property in its parent object.
    @type {String}*/
    this.key = null;

    /**String. If this value is a nested property of an object, this is the "path" of property keys from the root object to this value.
    @type {String}*/
    this.path = null;

    /**Object. The options used to determine if the values were equal or equivalent. 
    @type {EVUITest.ValueCompareOptions}*/
    this.options = null;

    /**Array. If this comparison was between two objects, these are the child comparisons of the properties of both objects (if the "shortCircuit" option is true this list will stop at the first different property).
    @type {EVUITest.ValueCompareResult[]}*/
    this.childComparisons = null;

    /**Boolean. Whether or not the comparison was considered a "success" based on the options provided. This is true if the expected equality result (equals/not equals) matches the actual equality comparison's result.
    @type {Boolean}*/
    this.success = false;

    /**Boolean. Whether or not a strict equality comparison returned true or false when a and b were compared. 
    @type {Boolean}*/
    this.valuesEqual = false;

    /**String. A formatted string describing the result of the comparison.
    @type {String}*/
    this.message = null;

    /**If this comparison was a child comparison of another comparison, this returns the parent ValueCompareResult that contains this one.
    @type {EVUITest.ValueCompareResult}*/
    this.getParentComparison = function ()
    {
        return _parent;
    }
};

/**The result of checking to see if a value is contained by an array.
@class*/
EVUITest.ValueContainmentResult = function ()
{
    /**String. The value from the ValueResultType enum indicating what type of result object this is.
    @type {String}*/
    this.resultType = EVUITest.ValueResultType.Containment;

    /**Array. The array that the value is being searched for in.
    @type {Array}*/
    this.container = undefined;

    /**Any. The value to find in the array.
    @type {Any}*/
    this.value = undefined;

    /**String. The result of the typeof operator on the value.
    @type {String}*/
    this.valueType = "undefined";

    /**Object. The options used to determine if the values were equal or equivalent.
    @type {EVUITest.ValueCompareOptions}*/
    this.options = null;

    /**Boolean. Whether or not the array contained the value (when compared using the settings in the options).
    @type {Boolean}*/
    this.contains = false;

    /**Boolean. Whether or not the operation was considered a "success" based on the options provided. This is true if the expected containment result (contains/does not contain) matches the actual equality comparison's result.
    @type {Boolean}*/
    this.success = false;

    /**String. A formatted string describing the result of the comparison.
    @type {String}*/
    this.message = null;
};

/**The result of checking the result of a predicate function when fed a value.
@class*/
EVUITest.ValuePredicateResult = function ()
{
    /**String. The value from the ValueResultType enum indicating what type of result object this is.
    @type {String}*/
    this.resultType = EVUITest.ValueResultType.Predicate;

    /**Function. The predicate function being tested.
    @type {EVUITest.Constants.Fn_Predicate}*/
    this.predicate = undefined;

    /**Any. The value fed into the predicate.
    @type {Any}*/
    this.value = undefined;

    /**String. The result of the typeof operator on the value.
    @type {String}*/
    this.valueType = "undefined";

    /**Object. The options used to determine if the values were equal or equivalent.
    @type {EVUITest.ValueCompareOptions}*/
    this.options = null;

    /**Any. The value returned by the predicate when fed the value. Should be a boolean, but can be anything.
    @type {Any|Boolean}*/
    this.returnValue = undefined;

    /**Boolean. Whether or not the operation was considered a "success" based on the options provided. This is true if the expected predicate return value (true/false) matches the expected result (true/false).
    @type {Boolean}*/
    this.success = false;

    /**String. A formatted string describing the result of the comparison.
    @type {String}*/
    this.message = null;
};

/**Options for how two values should be compared.
@class*/
EVUITest.ValueCompareOptions = function ()
{
    /**String. A value from ValueCompareType, this is the type of operation being performed by the comparison.
    @type {String}*/
    this.compareType = EVUITest.ValueCompareType.None;

    /**Boolean. Whether or not the expected result of the operation should be true. This is used for switching calls between "does a equal b" and "does b NOT equal a". True by default.
    @type {Boolean}*/
    this.affirmitiveCheck = true;

    /**Boolean. Whether or not the "===" equality comparer should be used instead of the "==" equality comparer. True by default.
    @type {Boolean}*/
    this.strictEquals = true;

    /**Boolean. Whether or not to differentiate between null and undefined - if true, null and undefined are both considered equal. True by default.
    @type {Boolean}*/
    this.nullCheckOnly = true;

    /**Boolean. Whether or not to case-normalize strings before comparing them. False by default.
    @type {Boolean}*/
    this.ignoreCase = false;

    /**Boolean. Whether or not differences in object references are ignored. If references are ignored, objects are compared based on their property values. False by default.
    @type {Boolean}*/
    this.ignoreReferences = false;

    /**Boolean. Whether or not differences in where objects appear in both graphs count as valid differences (i.e. whether or not the references of objects under the root are out of sync between the A and B graphs). False by default.
    @type {Boolean}*/
    this.ignoreRelativeReferences = false;

    /**Boolean. Whether or not differences between the indexes of the elements in an array should be ignored when comparing two arrays. False by default.
    @type {Boolean}*/
    this.ignoreOrder = false;

    /**Boolean. Whether or not the comparison between two objects should be recursive and dig into child objects. True by default.
    @type {Boolean}*/
    this.recursive = true;

    /**Boolean. Whether or not to stop the comparison process as soon as the first difference is found between two objects. True by default.
    @type {Boolean}*/
    this.shortCircuit = true;

    /**String. The way in which functions should be compared in object graphs.
    @type {String}*/
    this.functionCompareType = EVUITest.FunctionCompareType.None;
};

/**A special default comparer designed to determine if two Nodes are equivalent (equivalent textContent, attributes, and/or childNodes).*/
(function ()
{
    var compareAttributes = function (aAttr, bAttr, context)
    {
        var result = context.assert(aAttr.value).is(bAttr.value);
        if (result.success === false) return false;
    };

    var compareNodes = function (a, b, context)
    {
        if (a.nodeName !== b.nodeName) return false;
        if (a.nodeType !== b.nodeType) return false;

        var couldHaveChildren = false;

        if (a.nodeType === Node.ELEMENT_NODE)
        {
            var numAttrs = a.attributes.length;
            if (numAttrs !== b.attributes.length) return false;

            for (var x = 0; x < numAttrs; x++)
            {
                var aAttr = a.attributes[x];
                var bAttr = b.attributes[x];

                if (aAttr.name !== bAttr.name) return false;

                if (compareAttributes(aAttr, bAttr, context) === false) return false;
            }

            couldHaveChildren = true;
        }
        else if (a.nodeType === Node.ATTRIBUTE_NODE)
        {
            return compareAttributes(a, b, context);
        }
        else if (a.nodeType === Node.CDATA_SECTION_NODE || a.nodeType === Node.COMMENT_NODE || a.nodeType === Node.TEXT_NODE || a.nodeType == Node.DOCUMENT_TYPE_NODE)
        {
            return context.assert(a.textContent).is(b.textContent);
        }
        else if (a.nodeType === Node.DOCUMENT_NODE || a.nodeType == Node.DOCUMENT_FRAGMENT_NODE)
        {
            couldHaveChildren = true;
        }

        if (context.options.recursive !== true) return true;

        if (couldHaveChildren === true)
        {
            var numChildren = a.childNodes.length;
            if (numChildren !== b.childNodes.length) return false;

            for (var x = 0; x < numChildren; x++)
            {
                var childrenEqual = compareNodes(a.childNodes[x], b.childNodes[x], context);
                if (childrenEqual === false) return false;
            }
        }

        return true;
    };

    Node.prototype[EVUITest.Constants.Symbol_EqualityComparer] = function (context)
    {
        if (context.a == context.b) return true; //nodes are the same node
        if (context.options.ignoreReferences !== true) return false; //nodes are not the same node and we are not doing an equivalence check

        return compareNodes(context.a, context.b, context);
    }
})();

/**A comparer used for comparing Date objects.*/
(function ()
{
    Date.prototype[EVUITest.Constants.Symbol_EqualityComparer] = function (context)
    {
        if (context.a === context.b) return true;
        if (context.a instanceof Date === false || context.b instanceof Date === false) return false;
        return context.a.getTime() === context.b.getTime();
    }
})();

/**Parameter object that is fed into an object's EVUITest.Constants.Symbol_EqualityCmparer function. Contains all the contextual information known about a comparison at a moment in time.
@class*/
EVUITest.ValueEqualityContext = function ()
{
    /**Any. A value being compared.
    @type {Any}*/
    this.a = undefined;

    /**Any. The other value being compared.
    @type {Any}*/
    this.b = undefined;

    /**Object. The ValueComparer that is being used.
    @type {EVUITest.ValueComparer}*/
    this.comparer = null;

    /**String. The "path" of object properties from the root object to the property being compared.
    @type {String}*/
    this.path = null;

    /**Object. The root of the object graph that value "a" came from.
    @type {Object}*/
    this.aRoot = null;

    /**Object. The root of the object graph that value "b" came from.
    @type {Object}*/
    this.bRoot = null;

    /**String. The property name of the value being compared in its parent object.
    @type {String}*/
    this.key = null;

    /**Object. The parent object that contained the "a" property being compared.
    @type {Object}*/
    this.aParent = null;

    /**Object. The parent object that contained the "b" property being compared.
    @type {Object}*/
    this.bParent = null;

    /**Object. The ValueCompareOptions being used by the ValueComparer to determine equality.
    @type {EVUITest.ValueCompareOptions}*/
    this.options = null;
};

/**Creates a new Assertion using the context's comparer and compare options.
@param {Any} value The value to feed into the Assertion.
@param {EVUITest.AssertionSettings} options Any options to apply to the comparison.
@returns {EVUITest.Assertion}*/
EVUITest.ValueEqualityContext.prototype.assert = function (value, options)
{
    var defaultOptions = options == null ? {} : options;

    if (defaultOptions.comparer instanceof EVUITest.ValueComparer === false) defaultOptions.comparer = this.comparer;
    if (typeof defaultOptions.compareOptions !== "object" || defaultOptions.compareOptions == null) defaultOptions.compareOptions = this.options;

    return new EVUITest.Assertion(value, defaultOptions);
}


/**Creates an Assertion that can be used for unit testing values and objects against other values and objects.
@param {Any} value The value to compare against.
@param {EVUITest.AssertionSettings|EVUITest.ValueCompareOptions|EVUITest.AssertionLogOptions} settings Any non-default settings to apply to the assertion or its underlying comparison logic.
@returns {EVUITest.Assertion}*/
$evui.assert = function (value, settings)
{
    return new EVUITest.Assertion(value, settings);
};

/**Global instance of the TestHost.
@type {EVUITest.TestHostController}*/
EVUITest.TestHost = null;
(function ()
{
    var host = null;

    Object.defineProperty(EVUITest, "TestHost", {
        get: function ()
        {
            if (host == null)
            {
                host = new EVUITest.TestHostController();
            }

            return host;
        },
        enumerable: true
    });
}());

/**The singleton instance of the TestHostController used to run tests.
@type {EVUITest.TestHostController}*/
$evui.testHost = null;
Object.defineProperty($evui, "testHost", {
    get: function ()
    {
        return EVUITest.TestHost;
    }
});

/**Awaitable. Runs a test function based on the Test passed in.
@param {String|EVUITest.Constants.Fn_Test|EVUITest.Test} name The name of the test being run, a test function to run, or a Test yolo to run.
@param {EVUITest.Constants.Fn_Test|EVUITest.Test} test The test function to run, or a Test yolo to run.
@returns {Promise}*/
$evui.testAsync = function (name, test)
{
    return EVUITest.TestHost.runAsync(name, test)
}