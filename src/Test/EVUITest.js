﻿/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

if ($evui == null) $evui = {};

EVUITest = {};

EVUITest.Constants = {};

/**Function definition for the basic arguments for a Test to run in the TestRunner.
@param {EVUITest.Constants.Fn_TestPass} pass A function to call once the test is complete.
@param {EVUITest.Constants.Fn_TestFail} fail A function to call if the test fails.
@param {Any} args The arguments passed into the test.*/
EVUITest.Constants.Fn_Test = function (pass, fail, ...args) { };

/**Function definition for the basic arguments for a Test to run in the TestRunner.*/
EVUITest.Constants.Fn_TestPass = function () { };

/**Function definition for the basic arguments for a Test to run in the TestRunner.
@param {String} reason The reason why the test failed.*/
EVUITest.Constants.Fn_TestFail = function (reason) { };

/**A predicate function that is fed the assertion value and returns true or false. 
@param {Any} assertionValue The value wrapped by the assertion.
@returns {Boolean}*/
EVUITest.Constants.Fn_Predicate = function (assertionValue) { };

/**A predicate function that takes a ValueEqualityContext and determines if the values are equal or not.
@param {EVUITest.ValueEqualityContext} equalityContext The comparison context of the values.
@returns {Boolean}*/
EVUITest.Constants.Fn_EqualityComparer = function (equalityContext) { };

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
    /**Number. The Id of the test.
    @type {Number}*/
    this.id = null;

    /**String. The name of the test. Used for logging purposes.
    @type {String}*/
    this.name = null;

    /**Array. Arguments to pass into the test. Multiple elements in the array will result in multiple test runs (one for each value). If more than one parameter is desired, make the elements of the array be arrays of the parameters to pass into each test instance.
    @type {[]}*/
    this.testArgs = null;

    /**Function. The test to run. Can take any number of parameters, but the first parameter is always a TestExecutionArgs instance
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

    /**Number. The number of milliseconds the test took.
    @type {Number}*/
    this.duration = 0;

    /**Number. The incremental unique ID of this test.
    @type {Number}*/
    this.instanceId = 0;

    /**Number. The ordinal of this test in the set of tests that contained it.
    @type {Number}*/
    this.testSetId = 0;
};

/**Simple utility class used for writing output from the TestHost. The default implementation writes to the console, but it can be overwritten to write to anything.
@class*/
EVUITest.OutputWriter = function ()
{
    /**Writes the output of a TestResult.
    @param {EVUITest.TestResult} testResult The result of a test.*/
    this.writeTestOuput = function (testResult)
    {
        var output = this.formatTestOutput(testResult);
        this.writeOutput(output);
    };

    /**Writes arbitrary output.
    @param {Any} args Any arguments to write to output.*/
    this.writeOutput = function (...args)
    {
        console.log(...args);
    };

    /**Formats a testResult into a loggable string.
    @param {EVUITest.TestResult} testResult The result of a test.*/
    this.formatTestOutput = function (testResult)
    {
        if (testResult == null) return null;

        var output = "Test #" + testResult.testId + " - \"" + testResult.testName + "\" ";

        if (testResult.success === true)
        {
            output += "SUCCEDED in " + testResult.duration + "ms."
        }
        else
        {
            output += "FAILED  in " + testResult.duration + "ms.";

            if (typeof testResult.reason === "string" && testResult.reason.trim().length > 0)
            {
                output += "\nReason: " + testResult.reason;
            }
            else if (testResult.error instanceof Error)
            {
                output += "\nError: " + testResult.error.stack;
            }
        }

        if (testResult.arguments != null && testResult.arguments.length > 0)
        {
            var argsStr = "\n\nWith Arguments:\n";

            if (typeof arguments === "function")
            {
                argsStr += testResult.arguments.toString();
            }
            else if (typeof arguments === "object")
            {
                argsStr += JSON.stringify(testResult.arguments);
            }
            else
            {
                argsStr += testResult.arguments.toString();
            }

            output += argsStr;
        }

        return output;
    };
};

/**Settings for running tests.
@class*/
EVUITest.TestOptions = function ()
{
    /**Number. The number of milliseconds to wait before automatically failing the test.
    @type {Number}*/
    this.timeout = 100;

    /**Array. In the event of an asynchronous portion of a test crashing without a try-catch capturing the error, this is the window's onerror handler's list of code files to associate with the error. If an error comes from a file that meets the filter, it is associated with the test. If not, the error is ignored.
    @type {String|RegExp|String[]|RegExp[]}*/
    this.fileFilter = new RegExp(/.*\.js/ig);
};

/**A simple utility that runs a test single delegate that can contain any arbitrary testing code. The entry point to the EVUI unit testing Selenium integration.
@class*/
EVUITest.TestHostController = function ()
{
    var _self = this;
    var _executing = false;
    var _testQueue = [];
    var _idCounter = 0;
    var _instanceCounter = 0;

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

    /**Object. Control options for the test host.
    @type {EVUITest.TestOptions}*/
    this.options = new EVUITest.TestOptions();

    /**Awaitable. Runs a test function based on the Test passed in.
    @param {String|EVUITest.Constants.Fn_Test|EVUITest.Test} name The name of the test being run, a test function to run, or a Test yolo to run.
    @param {EVUITest.Constants.Fn_Test|EVUITest.Test} test The test function to run, or a Test yolo to run.
    @returns {Promise}*/
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
                resolvedTest.callback = function ()
                {
                    resolve();
                }
            });
        }

        return new Promise(function (resolve)
        {
            executeTest(resolvedTest, function ()
            {
                resolve();
            });
        });
    };

    /**Uses the ouputWriter to write arbitrary output.
    @param {Any} args Any arguments to write as output.*/
    this.writeOutput = function (...args)
    {
        writeOutput(...args);
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
            var args = test.testArgs;
            if (args != null)
            {
                if (Array.isArray(args) === false)
                {
                    args = [args];
                }
                else
                {
                    args = args.slice();
                }
            }
            else
            {
                args = [];
            }

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

    /**Gets the next test in the test queue.
    @returns {TestState}*/
    var getNextTest = function ()
    {
        var testToRun = _testQueue.shift();
        return testToRun;
    };

    /**Utility function for ensuring that there is a valid outputWriter before attempting to write any output about the results of a test instance.
    @param {TestInstance} testInstance The instance of a test that was just completed.*/
    var writeTestOutput = function (testInstance)
    {
        if (typeof EVUITest.Settings.outputWriter?.writeTestOuput !== "function")
        {
            console.log("Invalid outputWriter! The outputWriter must have a \"writeTestOutput\" function that accepts a TestResult as a parameter.");
        }
        else
        {
            var result = makeResultFromState(testInstance);

            try
            {
                EVUITest.Settings.outputWriter.writeTestOuput(result);
            }
            catch (ex)
            {
                writeOutput(ex);
            }
        }
    };

    /**Utility function for writing arbitrary content to the outputWriter's destination.
    @param {Any} args Any values to write as output.*/
    var writeOutput = function (...args)
    {
        if (typeof EVUITest.Settings.outputWriter?.writeOutput !== "function")
        {
            console.log("Invalid outputWriter! The outputWriter must have a \"writeOutput\" function that accepts an ...args set of arguments.");
        }
        else
        {

            try
            {
                EVUITest.Settings.outputWriter.writeOutput(...args);
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
                    callback();
                }
                catch (ex)
                {
                    writeOutput("Error in " + testState.test.name + " callback!", ex);
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
                writeTestOutput(testInstance);
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

        var finish = function () //final function to call on all exit paths from this function
        {
            removeEventListener("error", errorHandler);

            if (timeoutID > 0) clearTimeout(timeoutID);
            callback(testInstance);
        }

        var pass = function () //function to call when the test passes
        {
            if (testFinished === true) return;
            testFinished = true;

            testInstance.success = true;
            testInstance.endTime = performance.now();

            finish();
        };

        var fail = function (reasonOrEx) //function to call when the test fails
        {
            if (testFinished === true) return;
            testFinished = true;

            testInstance.success = false;
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
                testInstance.error = new Error("Manually failed for an unknown reason.");
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

        //because the test host runs tests in one big recursive loop, this resets the stack frame for every test run and prevents an eventual stack overflow
        Promise.resolve().then(function ()
        {
            try
            {
                timeoutID = setTimeout(function () //set the timeout failsafe
                {
                    fail(new Error("Timeout reached after " + timeout + "ms."))
                }, timeout);

                //make the final args array to use to invoke the test. The first two parameters are always the pass and fail functions
                var allArgs = [pass, fail].concat(testInstance.arguments);
                testInstance.startTime = performance.now();

                var result = testInstance.testFn.apply(this, allArgs);
                if (result instanceof Promise)
                {
                    result.catch(function (ex) //if we had an async function, listen for its failure (which would normally escape the try catch here)
                    {
                        fail(ex);
                    });
                }
            }
            catch (ex)
            {
                fail(ex);
            }
        });
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
                instance.arguments = testState.arguments[x];
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

        result.arguments = testInstance.arguments;
        result.duration = testInstance.endTime - testInstance.startTime;
        result.error = testInstance.error;
        result.success = testInstance.success;
        result.testId = testInstance.state.testId;
        result.testName = testInstance.state.test.name;
        result.instanceId = testInstance.instanceId;
        result.testSetId = testInstance.instanceInSet;

        return result;
    }

    /**Performs an inheritance operation on the various option sets we can use to make the final options set.
    @param {EVUITest.TestOptions} testOptions The options settings that apply to the whole test.
    @param {EVUITest.TestOptions} hostOptions The options settings that applies to all tests in the test runner.*/
    var makeFinalOptions = function (testOptions, hostOptions)
    {
        var finalOptions = new EVUITest.TestOptions();

        extend(finalOptions, hostOptions);
        extend(finalOptions, testOptions);

        return Object.freeze(finalOptions);
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

        /**String. If the test was manually failed, this is the reason why.
        @type {String}*/
        this.reason = null;

        /**Error. If the test crashed, this is the exception that was thrown.
        @type {Error}*/
        this.error = null;

        /**Function. The actual test being run.
        @type {EVUITest.Constants.Fn_Test}*/
        this.testFn = null;
    }
};





/**An object which runs simple tests on a constructor argument parameter.
@param {Any} value The value to make an assertion operation on.
@param {EVUITest.AssertionSettings} settings Optional arguments to feed into the Assertion.
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

    /**Gets the message based on the last operation this assertion executed.
    @returns {String}*/
    this.getMessage = function ()
    {
        if (_lastComparison == null) return null;
        return getComparisonMessage(_lastComparison);
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

    /**Determines if two values are equal.
    @param {any} b The value to compare against the Assertion's value.
    @param {EVUITest.AssertionSettings|EVUITest.ValueCompareOptions|EVUITest.AssertionLogOptions} compareOptions Optional. The options for the operation - can be a YOLO of any combination of ValueCompareOptions, AssertionLogOptions, or AssertionSettings.
    @returns {EVUITest.Assertion}*/
    this.equals = function (b, compareOptions)
    {
        var defaultSettings = {};
        defaultSettings.affirmitiveCheck = true;
        defaultSettings.compareType = EVUITest.ValueCompareType.Equality;
        defaultSettings.shortCircuit = true;

        var error = executeAssertion(b, compareOptions, defaultSettings);
        if (error != null) throw new Error(error.message);

        return this;
    };

    /**Determines if two values are NOT equal.
    @param {any} b The value to compare against the Assertion's value.
    @param {EVUITest.AssertionSettings|EVUITest.ValueCompareOptions|EVUITest.AssertionLogOptions} compareOptions Optional. The options for the operation - can be a YOLO of any combination of ValueCompareOptions, AssertionLogOptions, or AssertionSettings.
    @returns {EVUITest.Assertion}*/
    this.doesNotEqual = function (b, compareOptions)
    {
        var defaultSettings = {};
        defaultSettings.affirmitiveCheck = false;
        defaultSettings.compareType = EVUITest.ValueCompareType.Equality;
        defaultSettings.shortCircuit = true;

        var error = executeAssertion(b, compareOptions, defaultSettings);
        if (error != null) throw new Error(error.message);

        return this;
    };

    /**Determines if the predicate function returns true when executed and passed the Assertion's value as a parameter.
    @param {EVUITest.Constants.Fn_Predicate} predicate The function to feed Assertion's value into.
    @param {EVUITest.AssertionSettings|EVUITest.ValueCompareOptions|EVUITest.AssertionLogOptions} compareOptions Optional. The options for the operation - can be a YOLO of any combination of ValueCompareOptions, AssertionLogOptions, or AssertionSettings.
    @returns {EVUITest.Assertion}*/
    this.isTrue = function (predicate, compareOptions)
    {
        var defaultSettings = {};
        defaultSettings.affirmitiveCheck = true;
        defaultSettings.compareType = EVUITest.ValueCompareType.Predicate;

        var error = executeAssertion(predicate, compareOptions, defaultSettings);
        if (error != null) throw new Error(error.message);

        return this;
    };


    /**Determines if the predicate function returns false when executed and passed the Assertion's value as a parameter.
    @param {EVUITest.Constants.Fn_Predicate} predicate The function to feed Assertion's value into.
    @param {EVUITest.AssertionSettings|EVUITest.ValueCompareOptions|EVUITest.AssertionLogOptions} compareOptions Optional. The options for the operation - can be a YOLO of any combination of ValueCompareOptions, AssertionLogOptions, or AssertionSettings.
    @returns {EVUITest.Assertion}*/
    this.isFalse = function (predicate, compareOptions)
    {
        var defaultSettings = {};
        defaultSettings.affirmitiveCheck = false;
        defaultSettings.compareType = EVUITest.ValueCompareType.Predicate;

        var error = executeAssertion(predicate, compareOptions, defaultSettings);
        if (error != null) throw new Error(error.message);

        return this;
    };

    /**Determines if an Array contains the given value.
    @param {Any} value The value to find in the Assertion's value.
    @param {EVUITest.AssertionSettings|EVUITest.ValueCompareOptions|EVUITest.AssertionLogOptions} compareOptions Optional. The options for the operation - can be a YOLO of any combination of ValueCompareOptions, AssertionLogOptions, or AssertionSettings.
    @returns {EVUITest.Assertion}*/
    this.contains = function (value, compareOptions)
    {
        var defaultSettings = {};
        defaultSettings.affirmitiveCheck = true;
        defaultSettings.compareType = EVUITest.ValueCompareType.Containment;

        var error = executeAssertion(value, compareOptions, defaultSettings);
        if (error != null) throw new Error(error.message);

        return this;
    };

    /**Determines if an Array does not contain the given value.
    @param {Any} value The value to find in the Assertion's value.
    @param {EVUITest.AssertionSettings|EVUITest.ValueCompareOptions|EVUITest.AssertionLogOptions} compareOptions Optional. The options for the operation - can be a YOLO of any combination of ValueCompareOptions, AssertionLogOptions, or AssertionSettings.
    @returns {EVUITest.Assertion}*/
    this.doesNotContain = function (value, compareOptions)
    {
        var defaultSettings = {};
        defaultSettings.affirmitiveCheck = false;
        defaultSettings.compareType = EVUITest.ValueCompareType.Containment;

        var error = executeAssertion(value, compareOptions, defaultSettings);
        if (error != null) throw new Error(error.message);

        return this;
    };

    /**Determines if two values are "equivalent" in that, if both are objects, their property values match regardless if the object references differ.
    @param {any} b The value to compare against the Assertion's value.
    @param {EVUITest.AssertionSettings|EVUITest.ValueCompareOptions|EVUITest.AssertionLogOptions} compareOptions Optional. The options for the operation - can be a YOLO of any combination of ValueCompareOptions, AssertionLogOptions, or AssertionSettings.
    @returns {EVUITest.Assertion}*/
    this.isEquivalentTo = function (b, compareOptions)
    {
        var defaultSettings = {};
        defaultSettings.affirmitiveCheck = true;
        defaultSettings.compareType = EVUITest.ValueCompareType.Equivalency;
        defaultSettings.shortCircuit = true;
        defaultSettings.ignoreReferences = true;

        var error = executeAssertion(b, compareOptions, defaultSettings);
        if (error != null) throw new Error(error.message);

        return this;
    };

    /**Determines if two values are NOT "equivalent" in that, if both are objects, at least one of their property values do not match regardless if the object references differ.
    @param {any} b The value to compare against the Assertion's value.
    @param {EVUITest.AssertionSettings|EVUITest.ValueCompareOptions|EVUITest.AssertionLogOptions} compareOptions Optional. The options for the operation - can be a YOLO of any combination of ValueCompareOptions, AssertionLogOptions, or AssertionSettings.
    @returns {EVUITest.Assertion}*/
    this.isNotEquivalentTo = function (b, compareOptions)
    {
        var defaultSettings = {};
        defaultSettings.affirmitiveCheck = false;
        defaultSettings.compareType = EVUITest.ValueCompareType.Equivalency;
        defaultSettings.shortCircuit = true;
        defaultSettings.ignoreReferences = true;

        var error = executeAssertion(b, compareOptions, defaultSettings);
        if (error != null) throw new Error(error.message);

        return this;
    };

    /**Determines if two values are "roughly" the same in that, if both are objects, their property values match regardless if the object references differ. If an object being compared is an array, the order of elements does not matter.
    @param {any} b The value to compare against the Assertion's value.
    @param {EVUITest.AssertionSettings|EVUITest.ValueCompareOptions|EVUITest.AssertionLogOptions} compareOptions Optional. The options for the operation - can be a YOLO of any combination of ValueCompareOptions, AssertionLogOptions, or AssertionSettings.
    @returns {EVUITest.Assertion}*/
    this.isRoughly = function (b, compareOptions)
    {
        var defaultSettings = {};
        defaultSettings.affirmitiveCheck = true;
        defaultSettings.compareType = EVUITest.ValueCompareType.Equivalency;
        defaultSettings.shortCircuit = true;
        defaultSettings.ignoreReferences = true;
        defaultSettings.ignoreOrder = true;

        var error = executeAssertion(b, compareOptions, defaultSettings);
        if (error != null) throw new Error(error.message);

        return this;
    };

    /**Determines if two values are NOT "roughly" the same in that, if both are objects, their at least one of their property values does not match regardless if the object references differ. If an object being compared is an array, the order of elements does not matter.
    @param {any} b The value to compare against the Assertion's value.
    @param {EVUITest.AssertionSettings|EVUITest.ValueCompareOptions|EVUITest.AssertionLogOptions} compareOptions Optional. The options for the operation - can be a YOLO of any combination of ValueCompareOptions, AssertionLogOptions, or AssertionSettings.
    @returns {EVUITest.Assertion}*/
    this.isNotRoughly = function (b, compareOptions)
    {
        var defaultSettings = {};
        defaultSettings.affirmitiveCheck = false;
        defaultSettings.compareType = EVUITest.ValueCompareType.Equivalency;
        defaultSettings.shortCircuit = true;
        defaultSettings.ignoreReferences = true;
        defaultSettings.ignoreOrder = true;

        var error = executeAssertion(b, compareOptions, defaultSettings);
        if (error != null) throw new Error(error.message);

        return this;
    };

    /**Performs an arbitrary comparison between two values as specified by the compareOptions parameter.
    @param {any} b Any value or predicate function to use in the comparison.
    @param {EVUITest.AssertionSettings|EVUITest.ValueCompareOptions|EVUITest.AssertionLogOptions} compareOptions The options for the operation - can be a YOLO of any combination of ValueCompareOptions, AssertionLogOptions, or AssertionSettings.
    @returns {EVUITest.Assertion}*/
    this.compare = function (b, compareOptions)
    {
        if (compareOptions == null || typeof compareOptions !== "object") throw Error("compareOptions must be an object.");

        var error = executeAssertion(b, compareOptions, {});
        if (error != null) throw new Error(error.message);

        return this;
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
        _lastComparison = Object.freeze(comparisonResult);

        var logMessage = getComparisonMessage(comparisonResult);

        var logOnSuccess = typeof settings.logOnSuccess === "boolean" ? settings.logOnSuccess : _settings.logOnSuccess;
        var throwOnFailure = typeof settings.throwOnFailure === "boolean" ? settings.throwOnFailure : _settings.throwOnFailure;

        if (comparisonResult.success === true)
        {
            if (logOnSuccess !== false) writeOutput(logMessage);
        }
        else
        {
            if (throwOnFailure !== false) return Error(logMessage);
            writeOutput(logMessage);
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

        if (userSettings instanceof EVUITest.ValueEqualityComparer === true)
        {
            comparer = userSettings;
        }
        else
        {
            if (userSettings.comparer instanceof EVUITest.ValueEqualityComparer === true) comparer = userSettings.comparer;
        }

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
            settings.compareOptions = {};
            settings.logOptions = {};
        }
        else
        {
            if (settings.comparer instanceof EVUITest.ValueComparer === false) settings.comparer = EVUITest.ValueComparer.Default;
            if (settings.compareOptions == null || typeof settings.compareOptions !== "object") settings.compareOptions = {};
            if (settings.logOptions == null || typeof settings.logOptions !== "object") settings.logOptions = {};

            if (typeof settings.logOnSuccess !== "boolean") settings.logOnSuccess = EVUITest.Settings.logOnSuccess;
            if (typeof settings.throwOnFailure == "boolean") settings.throwOnFailure = EVUITest.Settings.throwOnFailure;
        }

        if (typeof settings.logOnSuccess !== "boolean") settings.logOnSuccess = true;
        if (typeof settings.throwOnFailure !== "boolean") settings.throwOnFailure = true;

        return settings;
    };

    /**Writes output to the console or whatever has been assigned as the output writer.
    @param {Any} output Any output to write.*/
    var writeOutput = function (output)
    {
        try
        {
            if (EVUITest.Settings.outputWriter == null)
            {
                console.log(output);
            }
            else
            {
                EVUITest.Settings.outputWriter.writeOutput(output);
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
        var comparer = valueComparison.equalityComparer == null ? "" : "\nUsing ValueEqualityComparer: " + valueComparison.equalityComparer.name;

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


                    comparer = firstDiff.equalityComparer == null ? "" : "\nUsing ValueEqualityComparer: " + firstDiff.equalityComparer.name;
                }
            }
        }

        return prefix + message + compareMessage + comparer;
    };

    /**Gets the "string" version of a value to appear in a log or error message.
    @param {Any} value The value to get the string version of.
    @param {EVUITest.AssertionLogOptions} logOptions The options for how the value should be logged or displayed in an error message.
    @returns {String} */
    var getValueStringForm = function (value, logOptions)
    {
        var valueStr = null;
        var maxStrLength = (logOptions != null && typeof logOptions.maxStringLength === "number" && logOptions.maxStringLength >= 0) ? logOptions.maxStringLength : 200;
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
            return "returned " + getValueStringForm(comparisonResult.returnValue, _settings.logOptions) + " for";
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

            var numChildren = comparison.childComparisons.length;
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
        var compareMessage = "\Executed: " + getValueStringForm(predicateComparison.predicate, logOptions) + "\nWith: " + getValueStringForm(predicateComparison.value, logOptions);

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
    this.maxStringLength = 200;
};

/**Object for making various kinds of comparisons between values, objects, and functions.
@class*/
EVUITest.ValueComparer = function ()
{
    //self reference for closures
    var _self = this;

    /**
    @type {EVUITest.ValueEqualityComparer[]}*/
    var _comparers = [];

    /**Adds a ValueEqualityComparer to this ValueComparer's collection of ValueEqualityComparers.
    @param {EVUITest.ValueEqualityComparer} comparer The comparer to add.*/
    this.addEqualityComparer = function (comparer)
    {
        if (comparer == null || typeof comparer !== "object") throw Error("Object expected.");

        if (typeof comparer.name !== "string" || comparer.name.trim().length === 0) throw Error("ValueEqualityComparer must have a string name.")

        var existing = this.getEqualityComparer(comparer.name);
        if (existing != null) throw Error("A ValueEqualityComparer with the name \"" + comparer.name + "\" already exists.");

        if (typeof comparer.equals !== "function") throw Error("ValueEqualityComparer must have an equals function to perform the actual comparison.");

        _comparers.push(comparer);
    };


    /**Removes a ValueEqualityComparer from the ValueComparer's collection of ValueEqualityComparers by name.
    @param {String} name The unique key of the equality comparer to remove.
    @returns {Boolean}*/
    this.removeEqualityComparer = function (name)
    {
        if (typeof name !== "string") throw Error("String expected.");

        var numComparers = _comparers.length;
        for (var x = 0; x < numComparers; x++)
        {
            var curComparer = _comparers[x];
            if (curComparer.name === name)
            {
                _comparers.splice(x, 1);
                return true;
            }
        }

        return false;
    };

    /**Gets a COPY of the internal list of ValueEqualityComparers.
    @returns {ValueEqualityComparer[]}*/
    this.getEqualityComparers = function ()
    {
        return _comparers.slice();
    };

    /**Gets a ValueEqualityComparer by name.
    @param {String} name The unique key of the ValueEqualityComparer to get.
    @returns {ValueEqualityComparer}*/
    this.getEqualityComparer = function (name)
    {
        if (typeof name !== "string") throw Error("String expected.");

        var numComparers = _comparers.length;
        for (var x = 0; x < numComparers; x++)
        {
            var curComparer = _comparers[x];
            if (curComparer.name === name)
            {
                return curComparer;
            }
        }

        return null;
    };

    /**Executes a "compare" operation that can be a value comparison, a "containment" check where an element is looked for in an array, or a predicate function validated against its expected result.
    @param {Any} a Either the first value to compare, the array to search in for a containment check, or the value to feed into a predicate function.
    @param {Any} b Either The second value to compare, the value to find in an array, or the predicate function.
    @param {EVUITest.ValueCompareOptions} options The settings that control what type of "comparison" is done and the rules for determining the equality of values.
    @returns {EVUITest.ValueCompareResult|EVUITest.ValueContainmentResult|EVUITest.ValuePredicateResult}*/
    this.compare = function (a, b, options)
    {
        options = ensureOptions(options);
        var context = buildComparisonContext(a, b, options);

        if (options.compareType === EVUITest.ValueCompareType.Equality ||
            options.compareType === EVUITest.ValueCompareType.Equivalency ||
            options.compareType === EVUITest.ValueCompareType.Roughly)
        {
            return compareValues(a, b, context);
        }
        else if (options.compareType === EVUITest.ValueCompareType.Containment)
        {
            return containmentCompare(a, b, context);
        }
        else if (options.compareType === EVUITest.ValueCompareType.Predicate)
        {
            return predicateCompare(a, b, context);
        }
        else
        {
            throw Error("Invalid comparison type. Must be a value from EVUITest2.ValueCompareType.");
        }
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
        context.equalityComparers = buildComparerCloneList(context.options);

        return context;
    };

    /**Makes an immutable copy of the list of comparers that can be used for the target value of the comparison by combining the default list for the ValueComparer with that in the args list.
    @param {EVUITest.ValueCompareOptions} options The ValueCompareOptions that is being used in the comparison.
    @returns {EVUITest.ValueEqualityComparer[]} */
    var buildComparerCloneList = function (options)
    {
        var allComparers = null;

        if (Array.isArray(options.equalityComparers) === true)
        {
            allComparers = options.equalityComparers.concat(_comparers);
        }
        else
        {
            allComparers = _comparers;
        }

        var validComparers = [];
        var numComparers = allComparers.length;
        for (var x = 0; x < numComparers; x++)
        {
            var curComparer = allComparers[x];

            if (curComparer == null || typeof curComparer !== "object") continue;
            if (typeof curComparer.equals !== "function") continue;

            var immutable = Object.freeze(extend({}, curComparer));
            validComparers.push(immutable);
        }

        return validComparers;
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
            if (context.options.recursive === false && parentComparison != null)
            {
                comparison.valuesEqual = valuesEqual(comparison, context);
            }
            else
            {
                comparison.valuesEqual = objectsEqual(comparison, context);
            }
        }
        else
        {
            comparison.valuesEqual = valuesEqual(comparison, context);
        }

        var useCustomComparers = false;
        if (context.options.affirmitiveCheck === false)
        {
            if (comparison.valuesEqual === false)
            {
                comparison.success = true;
            }
            else
            {
                useCustomComparers = true;
            }
        }
        else
        {
            if (comparison.valuesEqual === true)
            {
                comparison.success = true;
            }
            else
            {
                useCustomComparers = true;
            }
        }

        if (useCustomComparers === true && context.equalityComparers.length > 0)
        {
            var equalityContext = Object.freeze(buildEqualityContext(comparison, context));
            var comparers = getEqualityComparers(equalityContext, context);

            var numComparers = comparers.length;
            for (var x = 0; x < numComparers; x++)
            {
                if (comparers[x].equals(equalityContext) === true)
                {
                    comparison.valuesEqual = true;
                    break;
                }
            }
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
            parentComparison.childComparisons.push(comparison);
        }

        return comparison;
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

    /**Build a ValueEqualityComparer context object that can be fed into the ValueEqualityComparer's valuesEqual function.
    @param {EVUITest.ValueCompareResult} comparison The comparison being fed into a ValueEqualityComparer.
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

    /**Gets all the ValueEqualityComparers that apply to a value.
    @param {EVUITest.ValueEqualityContext} equalityContext The metadata about the equality comparison.
    @param {ComparisonContext} context The contextual information about the comparison.
    @returns {EVUITest.ValueEqualityComparer[]}*/
    var getEqualityComparers = function (equalityContext, context)
    {
        var aType = typeof equalityContext.a;
        var comparers = [];

        var numTotal = context.equalityComparers.length;
        for (var x = 0; x < numTotal; x++)
        {
            var curComparer = context.equalityComparers[x];
            var flags = typeof curComparer.filterFlags !== "number" ? EVUITest.EqualityFilterFlags.All : curComparer.filterFlags;

            if (flags & EVUITest.EqualityFilterFlags.TypeOf === EVUITest.EqualityFilterFlags.TypeOf)
            {
                if (typeof curComparer.typeOfFilter === "string" && curComparer.typeOfFilter !== "any")
                {
                    if (aType !== curComparer.typeOfFilter) continue;
                }
            }

            if (flags & EVUITest.EqualityFilterFlags.Prototype === EVUITest.EqualityFilterFlags.Prototype)
            {
                if (typeof curComparer.prototypeFilter === "function")
                {
                    if (equalityContext.a instanceof curComparer.prototypeFilter === false) continue;
                }
            }

            if (flags & EVUITest.EqualityFilterFlags.Predicate === EVUITest.EqualityFilterFlags.Predicate)
            {
                if (typeof curComparer.predicateFilter === "function")
                {
                    if (curComparer.predicateFilter(equalityContext) === false) continue;
                }
            }

            comparers.push(curComparer);
        }

        return comparers;
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
            for (var x = 0; x < arr1Length; x++)
            {
                var aVal = comparison.a[x];
                var bVal = comparison.b[x];
                var curKey = x.toString();

                var childComparison = compareValues(aVal, bVal, context, curKey, comparison);
                if (childComparison == null) continue;

                comparison.childComparisons.push(childComparison);

                if (childComparison.valuesEqual === false)
                {
                    comparison.valuesEqual = false;
                    if (context.options.shortCircuit === true) break;
                }
            }
        }

        return comparison;
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

        //finally, un-tag all the objects so they return to their pristine state
        for (var x = 0; x < numTagged; x++)
        {
            delete taggedObjects[x][context.tagKey];
        }


        return mismatched;
    };

    /**Computes a "key" to use in a lookup dictionary of values when doing an array equivalency check.
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

        //pull all the options off of the user's options object
        if (isObject(options) === true)
        {
            compareType = options.compareType;
            strictEquals = options.strictEquals;
            ignoreCase = options.ignoreCase;
            ignoreReferences = options.ignoreReferences;
            ignoreOrder = options.ignoreOrder;
            equalityComparers = options.equalityComparers;
            recursive = options.recursive;
            affirmativeCheck = options.affirmitiveCheck;
            nullCheckOnly = options.nullCheckOnly;
            shortCircuit = options.shortCircuit;
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
        }
        else if (compareType === EVUITest.ValueCompareType.Roughly)
        {
            if (typeof strictEquals !== "boolean") strictEquals = false;
            if (typeof ignoreReferences !== "boolean") ignoreReferences = true;
            if (typeof ignoreOrder !== "boolean") ignoreOrder = true;
        }
        else
        {
            if (typeof strictEquals !== "boolean") strictEquals = true;
            if (typeof ignoreReferences !== "boolean") ignoreReferences = false;
            if (typeof ignoreOrder !== "boolean") ignoreOrder = false;
        }

        //populate the full options object with all the resolved values
        options.compareType = compareType;
        options.equalityComparers = equalityComparers;
        options.ignoreCase = ignoreCase;
        options.ignoreOrder = ignoreOrder;
        options.ignoreReferences = ignoreReferences;
        options.strictEquals = strictEquals;
        options.recursive = recursive;
        options.affirmitiveCheck = affirmativeCheck;
        options.nullCheckOnly = nullCheckOnly;
        options.shortCircuit = shortCircuit;

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

        /**Array. Any custom equality comparers used to compare different objects in a way that is different than the normal compare logic.
        @type {EVUITest.ValueEqualityComparer[]}*/
        this.equalityComparers = [];

        /**Object. The comparison options for what determines equality in this compare session.
        @type {EVUITest.ValueCompareOptions}*/
        this.options = null;

        /**Array. The stack of previous comparisons occurring above the current comparison in a recursive comparison context. Used to detect circular references.
        @type {CompareStackItem[]}*/
        this.compareStack = [];

        /**String. The key with which objects are tagged to make comparing object references easier.
        @type {String}*/
        this.tagKey = (Math.random() * 1000).toString(36);
        if (typeof Symbol !== "undefined")
        {
            this.tagKey = Symbol(this.tagKey);
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
                comparer.addEqualityComparer(EVUITest.ValueEqualityComparer.DomNodeComparer);
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
    Equivalency: "equivalency",
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

    /**Object. If this value was determined to be equal by a ValueEqualityComparer, this is the ValueEqualityComparer used to determine the equality.
    @type {EVUITest.ValueEqualityComparer}*/
    this.equalityComparer = null;

    /**Object. The options used to determine if the values were equal or equivalent. 
    @type {EVUITest.ValueCompareOptions}*/
    this.options = null;

    /**Array. If this comparison was between two objects, these are the child comparisons of the properties of both objects (if the "shortCircuit" option is true this list will stop at the first different property).
    @type {EVUITest.ValueCompareResult[]}*/
    this.childComparisons = [];

    /**Boolean. Whether or not the comparison was considered a "success" based on the options provided. This is true if the expected equality result (equals/not equals) matches the actual equality comparison's result.
    @type {Boolean}*/
    this.success = false;

    /**Boolean. Whether or not a strict equality comparison returned true or false when a and b were compared. 
    @type {Boolean}*/
    this.valuesEqual = false;

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
};

/**Options for how two values should be compared.
@class*/
EVUITest.ValueCompareOptions = function ()
{
    /**String. A value from ValueCompareType, this is the type of operation being performed by the comparison.
    @type {String}*/
    this.compareType = EVUITest.ValueCompareType.None;

    /**Boolean. Whether or not the expected result of the operation should be true. This is used for switching calls between "does a equal b" and "does b NOT equal a".
    @type {Boolean}*/
    this.affirmitiveCheck = true;

    /**Boolean. Whether or not the "===" equality comparer should be used instead of the "==" equality comparer.
    @type {Boolean}*/
    this.strictEquals = true;

    /**Boolean. Whether or not to differentiate between null and undefined - if true, null and undefined are both considered equal.
    @type {Boolean}*/
    this.nullCheckOnly = true;

    /**Boolean. Whether or not to case-normalize strings before comparing them.
    @type {Boolean}*/
    this.ignoreCase = false;

    /**Boolean. Whether or not differences in object references are ignored. If references are ignored, objects are compared based on their property values.
    @type {Boolean}*/
    this.ignoreReferences = false;

    /**Boolean. Whether or not differences between the indexes of the elements in an array should be ignored when comparing two arrays.
    @type {Boolean}*/
    this.ignoreOrder = false;

    /**Boolean. Whether or not the comparison between two objects should be recursive and dig into child objects.
    @type {Boolean}*/
    this.recursive = true;

    /**Boolean. Whether or not to stop the comparison process as soon as the first difference is found between two objects.
    @type {Boolean}*/
    this.shortCircuit = true;

    /**Array. All of the ValueEqualityComparers to use for this comparison (in addition to the ones in the ValueComparer being used for the comparison).
    @type {EVUITest.ValueEqualityComparer[]}*/
    this.equalityComparers = [];
};

/**Bit flags for determining which is used to determine if a ValueEqualityComparer applies to a given value.
@enum*/
EVUITest.EqualityFilterFlags =
{
    /**Default.*/
    None: 0,
    /**The result of the "typeof" operator on the value should be used as a filter.*/
    TypeOf: 1,
    /**The result of the "instanceof" operator should be used as a filter.*/
    Prototype: 2,
    /**The result of a predicate function should be used as a filter.*/
    Predicate: 4,
    /**All filters should be used.*/
    All: 2147483647
};

/**An object for doing a custom equality comparison between two values.
@class*/
EVUITest.ValueEqualityComparer = function ()
{
    /**String. The unique key of the comparer.
    @type {String}*/
    this.name = null;

    /**String. The result of the typeof operator on a value to use as a filter.
    @type {String}*/
    this.typeOfFilter = "any";

    /**Function. A constructor function used to create an object to use as a "type" filter.
    @type {Function}*/
    this.prototypeFilter = null;

    /**Function. A predicate function used to determine if the equality comparer applies to a value.
    @type {EVUITest.Constants.Fn_EqualityComparer}*/
    this.predicateFilter = null;

    /**Number. The bit flags for which filters to apply.
    @type {Number}*/
    this.filterFlags = EVUITest.EqualityFilterFlags.All;

    /**Function. The equality comparer function.
    @type {EVUITest.Constants.Fn_EqualityComparer}*/
    this.equals = null;
};

/**A special default ValueEqualityComparer designed to determine if two Nodes are equivalent (equivalent textContent, attributes, and/or childNodes).
@type {EVUITest.ValueEqualityComparer}*/
EVUITest.ValueEqualityComparer.DomNodeComparer = null;

//self executing function to make the standard DomNode ValueEqualityComparer.
(function ()
{
    var compareAttributes = function (aAttr, bAttr, context)
    {
        var result = context.comparer.compare(aAttr.value, bAttr.value, context.options);
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
            return context.comparer.compare(a.textContent, b.textContent, context.options);
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

    var domCompare = new EVUITest.ValueEqualityComparer();
    domCompare.prototypeFilter = Node;
    domCompare.name = "evui-dom-node";
    domCompare.typeOfFilter = "object";
    domCompare.filterFlags |= EVUITest.EqualityFilterFlags.TypeOf | EVUITest.EqualityFilterFlags.Prototype;
    domCompare.equals = function (context)
    {
        if (context.a == context.b) return true; //nodes are the same node
        if (context.options.ignoreReferences !== true) return false; //nodes are not the same node and we are not doing an equivalency check

        return compareNodes(context.a, context.b, context);
    }

    domCompare = Object.freeze(domCompare);

    Object.defineProperty(EVUITest.ValueEqualityComparer, "DomNodeComparer", {
        get: function ()
        {
            return domCompare;
        },
        configurable: false,
        enumerable: true
    });
})();

/**Parameter object that is fed into a ValueEqualityComparer's equals function. Contains all the contextual information known about a comparison at a moment in time.
@class*/
EVUITest.ValueEqualityContext = function ()
{
    /**Any. A value being compared.
    @type {Any}*/
    this.a = undefined;

    /**Any. The other value being compared.
    @type {Any}*/
    this.b = undefined;

    /**Object. The ValueComparer that is using the ValueEqualityComparer.
    @type {EVUITest.ValueComparer}*/
    this.comparer = null;

    /**Object. The ValueEqualityComparer that is currently executing.
    @type {EVUITest.ValueEqualityComparer}*/
    this.equalityComparer = null;

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


/**Creates an Assertion that can be used for unit testing values and objects against other values and objects.
@param {Any} value The value to compare against.
@param {EVUITest.AssertionSettings} settings Any non-default settings to apply to the assertion or its underlying comparison logic.
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