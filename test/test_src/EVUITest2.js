/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

if ($evui == null) $evui = {};

EVUITest2 = {};

EVUITest2.Constants = {};

/**Function definition for the basic arguments for a Test to run in the TestRunner.
@param {EVUITest2.Constants.Fn_TestPass} pass A function to call once the test is complete.
@param {EVUITest2.Constants.Fn_TestFail} fail A function to call if the test fails.
@param {Any} args The arguments passed into the test.*/
EVUITest2.Constants.Fn_Test = function (pass, fail, ...args) { };

/**Function definition for the basic arguments for a Test to run in the TestRunner.*/
EVUITest2.Constants.Fn_TestPass = function () { };

/**Function definition for the basic arguments for a Test to run in the TestRunner.
@param {String} reason The reason why the test failed.*/
EVUITest2.Constants.Fn_TestFail = function (reason) { };

/**Object representing a test to run in the TestHost.
@class*/
EVUITest2.Test = function ()
{
    var _testArgs = [];

    /**Number. The Id of the test.
    @type {Number}*/
    this.id = null;

    /**String. The name of the test. Used for logging purposes.*/
    this.name = null;

    /**Array. Arguments to pass into the test. Multiple elements in the array will result in multiple test runs (one for each value). If more than one parameter is desired, make the elements of the array be arrays of the parameters to pass into each test instance.
    @type {[[]]}*/
    this.testArgs = null;

    /**Function. The test to run. Can take any number of parameters, but the first parameter is always a TestExecutionArgs instance
    @type {EVUITest2.Constants.Fn_Test}*/
    this.test = null;

    /**Object. The options to control how the test behaves.
    @type {EVUITest2.TestOptions}*/
    this.options = null;
};

/**Object that represents the result of running a test.
@class*/
EVUITest2.TestResult = function ()
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

    /**Number. The incremental unqiue ID of this test.
    @type {Number}*/
    this.instanceId = 0;

    /**Number. The ordinal of this test in the set of tests that contained it.
    @type {Number}*/
    this.testSetId = 0;
};

/**Simple utility class used for writing output from the TestHost. The default implementation writes to the console, but it can be overwritten to write to anything.
@class*/
EVUITest2.OutputWriter = function ()
{
    /**Writes the output of a TestResult.
    @param {EVUITest2.TestResult} testResult The result of a test.*/
    this.writeTestOuput = function (testResult)
    {
        var output = this.formatTestOutput(testResult);
        this.writeOutput(output);
    };

    /**Writes arbitrary output.
    @param {Any} args Any arguments to write to outpit.*/
    this.writeOutput = function (...args)
    {
        console.log(...args);
    };

    /**Formats a testResult into a loggable string.
    @param {EVUITest2.TestResult} testResult The result of a test.*/
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

        if (testResult.arguments != null)
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
EVUITest2.TestOptions = function ()
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
EVUITest2.TestHostController = function ()
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

    /**Object. A simple interface for writing a TestResult to an output source. Defaults to console output.
    @type {EVUITest2.OutputWriter}*/
    this.outputWriter = new EVUITest2.OutputWriter();

    /**Object. Control options for the test host.
    @type {EVUITest2.TestOptions}*/
    this.options = new EVUITest2.TestOptions();

    /**Awaitable. Runs a test function based on the TestHostArgs passed in.
    @param {String|EVUITest2.Constants.Fn_Test|EVUITest2.Test} name The name of the test being run, a test function to run, or a Test yolo to run.
    @param {EVUITest2.Constants.Fn_Test|EVUITest2.Test} test The test function to run, or a Test yolo to run.
    @returns {Promise<EVUITest2.TestResult>}*/
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
    @param {String|EVUITest2.Test|EVUITest2.Constants.Fn_Test} name Either the name of the test, a test yolo, or a test function.
    @param {EVUITest2.Test|EVUITest2.Constants.Fn_Test} test The test to turn into a TestState.*/
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

        name = (typeof test.name === "string" && test.name.trim().length > 0) ? test.name : "<anonymous>";

        var state = new TestState();
        var realTest = new EVUITest2.Test(state);

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
        }
        else
        {
            return null;
        }

        if (typeof (realTest.test) !== "function") throw Error("Test must have a test property that is a function.");

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
    var writeTestOuput = function (testInstance)
    {
        //ensure we have at least the default output writer
        if (_self.outputWriter == null) _self.outputWriter = new EVUITest2.OutputWriter();

        if (typeof _self.outputWriter.writeTestOuput !== "function")
        {
            console.log("Invalid outputWriter! The outputWriter must have a \"writeTestOutput\" function that accepts a TestResult as a parameter.");
        }
        else
        {
            var result = makeResultFromState(testInstance);

            try
            {
                _self.outputWriter.writeTestOuput(result);
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
        if (typeof _self.outputWriter.writeOutput !== "function")
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

    /**Executes a test via executing all of the test instances made from its arugments list.
    @param {TestState} testState THe internal property bag holding state information about a test.
    @param {Function} callback A callback function to call once all instances of this test have been run.*/
    var executeTest = function (testState, callback)
    {
        _executing = true;
        var numInstances = testState.instances.length;

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
                   writeOuput("Error in " + testState.test.name + " callback!", ex);
                }

                var next = getNextTest();
                if (next != null)
                {
                    executeTest(testState, testState.callback);
                }
                else
                {
                    _executing = false;
                }

                return;
            }

            executeInstance(testState.instances[index], function (testInstance)
            {
                writeTestOuput(testInstance);
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

        var fail = function (reasonOrEx) //function to call whent he test fails
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

                //make the final args array to use to invoke the test. The first two parameters are awlays the pass and fail functions
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
    @type {EVUITest2.TestResult}*/
    var makeResultFromState = function (testInstance)
    {
        var result = new EVUITest2.TestResult();

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
    @param {EVUITest2.TestOptions} testOptions The options settings that apply to the whole test.
    @param {EVUITest2.TestOptions} hostOptions The options settings that applies to all tests in the test runner.*/
    var makeFinalOptions = function (testOptions, hostOptions)
    {
        var finalOptions = new EVUITest2.TestOptions();

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
        /**Number. The unqiue ID of the test.
        @type {Number}*/
        this.testId = _idCounter++;

        /**Object. The actual test to run.
        @type {EVUITest2.Test}*/
        this.test = null;

        /**Array.The arugments given by the user to run the test with.
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

        /**Error. If the test crashed, this is the exception that was thrown.*/
        this.error = null;

        /**Function. The actual test being run.
        @type {EVUITest2.Constants.Fn_Test}*/
        this.testFn = null;
    }
};

/**Global instance of the TestHost.
@type {EVUITest2.TestHostController}*/
EVUITest2.TestHost = null;
(function ()
{
    var host = null;

    Object.defineProperty(EVUITest2, "TestHost", {
        get: function ()
        {
            if (host == null)
            {
                host = new EVUITest2.TestHostController();
            }

            return host;
        },
        enumerable: true
    });
}());

/**The singleton instance of the TestHostController used to run tests.
@type {EVUITest2.TestHostController}*/
$evui.testHost = null;
Object.defineProperty($evui, "testHost", {
    get: function ()
    {
        return EVUITest2.TestHost;
    }
});