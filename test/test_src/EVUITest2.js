/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

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

/**Object representing a test to run in a TestRunner.
@class*/
EVUITest2.Test = function ()
{
    var _testArgs = [];

    /**Number. The Id of the test.
    @type {Number}*/
    this.id = null;

    /**String. The name of the test. Used for logging purposes.*/
    this.name = null;

    /**Array. Arguments to pass into the test. Multiple elements in the array will result in multiple test runs (one for each a).
    @type {[]}*/
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

    /**String. The error message if the test failed.*/
    this.reason = null;

    /**Array. The array of user-provided values that was fed into the test function.
    @type {Array}*/
    this.testName = null;

    this.arguments = null;

    this.error = null;

    this.duration = 0;

    this.instanceId = 0;

    this.testSetId = 0;
};

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

    this.writeOutput = function (...args)
    {
        writeOutput(...args);
    };

    /**Takes ambiguous user input and makes a TestState object from it.
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

    var getNextTest = function ()
    {
        var testToRun = _testQueue.shift();
        return testToRun;
    };

    /**
    @param {TestInstance} testState*/
    var writeTestOuput = function (testState)
    {
        if (_self.outputWriter == null) _self.outputWriter = new EVUITest2.OutputWriter();

        if (typeof _self.outputWriter.writeTestOuput !== "function")
        {
            console.log("Invalid outputWriter! The outputWriter must have a \"writeTestOutput\" function that accepts a TestResult as a parameter.");
        }
        else
        {
            var result = makeResultFromState(testState);

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

    var writeOutput = function (...args)
    {
        if (typeof _self.outputWriter.writeOutput !== "function")
        {
            console.log("Invalid outputWriter! The outputWriter must have a \"writeOutput\" function that accepts a ...args set of arguments.");
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

    /**
    @param {TestState} testState*/
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

    /**
    @param {TestInstance} testInstance*/
    var executeInstance = function (testInstance, callback)
    {
        var testFinished = false;
        var finalOptions = makeFinalOptions(testInstance.state.test.options, _self.options);
        var timeout = typeof finalOptions.timeout !== "number" ? 100 : finalOptions.timeout;
        var timeoutID = -1;

        var finish = function ()
        {
            removeEventListener("error", errorHandler);

            if (timeoutID > 0) clearTimeout(timeoutID);
            callback(testInstance);
        }

        var pass = function ()
        {
            if (testFinished === true) return;
            testFinished = true;

            testInstance.success = true;
            testInstance.endTime = performance.now();

            finish();
        };

        var fail = function (reasonOrEx)
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
            else
            {
                testInstance.error = new Error("Manually failed for an unknown reason.");
            }

            finish();
        };

        var errorHandler = function (args)
        {
            //if the error came from a script file that we don't care about, do nothing
            if (meetsScriptFilter(args.filename, finalOptions.fileFilter) === false) return;

            fail(args.error);
        };

        //add the global error event listener to catch exceptions thrown not on the stack trace of the promise (i.e. in a callback for a native API, like a XMLHttpRequest)
        addEventListener("error", errorHandler);

        Promise.resolve().then(function ()
        {
            try
            {
                timeoutID = setTimeout(function ()
                {
                    fail(new Error("Timeout reached after " + timeout + "ms."))
                }, timeout);

                var allArgs = [pass, fail].concat(testInstance.arguments);
                testInstance.startTime = performance.now();

                var result = testInstance.testFn.apply(this, allArgs);
                if (result instanceof Promise)
                {
                    result.catch(function (ex)
                    {
                        fail(ex);
                    });
                }
            }
            catch (ex)
            {
                testInstance.endTime = performance.now();
                fail(ex);
            }
        });
    };

    /**
    @param {TestState} testState*/
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

    /**
    @param {TestInstance} testState*/
    var makeResultFromState = function (testState)
    {
        var result = new EVUITest2.TestResult();

        result.arguments = testState.arguments;
        result.duration = testState.endTime - testState.startTime;
        result.error = testState.error;
        result.success = testState.success;
        result.testId = testState.state.testId;
        result.testName = testState.state.test.name;
        result.instanceId = testState.instanceId;
        result.testSetId = testState.instanceInSet;

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

    var TestState = function ()
    {
        this.testId = _idCounter++;

        /**
        @type {EVUITest2.Test}*/
        this.test = null;

        /**
        @type {[]}*/
        this.arguments = null;

        /**
        @type {TestInstance[]}*/
        this.instances = [];

        this.running = false;

        this.callback = null;
    };

    var TestInstance = function ()
    {
        this.instanceId = _instanceCounter++;

        this.instanceInSet = 0;

        /**
        @type {TestState}*/
        this.state = null;

        this.startTime = null;

        this.endTime = null;

        this.arguments = null;

        this.success = false;

        this.reason = null;

        this.error = null;

        this.testFn = null;
    }
};

/**
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

/**
@type {EVUITest2.TestHostController}*/
$evui.testHost = null;
Object.defineProperty($evui, "testHost", {
    get: function ()
    {
        return EVUITest2.TestHost;
    }
})
