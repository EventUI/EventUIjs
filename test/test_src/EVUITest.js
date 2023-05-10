/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

/**Root namespace for the EVUI testing library.
@module*/
EVUITest = {};

EVUITest.Constants = {};

/**Callback definition for the results of running a test or group of tests.
@param {EVUITest.TestResult[]} testResults The results of all the tests that were run.*/
EVUITest.Constants.Fn_TestRunCallback = function (testResults) { };

/**Function definition for the basic arguments for a Test to run in the TestRunner.
@param {EVUITest.TestExecutionArgs} testArgs The execution args for the test.*/
EVUITest.Constants.Fn_Test = function (testArgs) { };

/**Utility class for running a series of tests in order.
@class*/
EVUITest.TestRunnerFactory = (function ()
{
    var _testIdCounter = 0;
    var _created = false;
    var _running = false;

    var TestRunnerFactory = function ()
    {
        if (_created === true) throw Error("Only one instance of TestRunnerFactory can exist at a time.");
        _created = true;

        /**Creates a new TestRunner.
        @param {String} name The name to give the test runner.
        @param {EVUITest.TestOptions} options The configuration options for the test runner.
        @returns {TestRunner}*/
        this.createTestRunner = function (name, options)
        {
            return new TestRunner(name, options);
        };
    };

    /**The implementation of the TestRunner.
    @class*/
    var TestRunner = function (name, options)
    {
        var _self = this;
        var _name = (typeof name !== "string") ? "<anonymous>" : name;
        var _options = (options != null && typeof options === "object") ? extend(new EVUITest.TestOptions(), options) : new EVUITest.TestOptions();

        /**The internal array of state objects injected into each test.
        @type {TestState[]}*/
        var _tests = [];

        /**String. The name of the TestRunner. Used for logging purposes.
        @type {String}*/
        this.name = null;
        Object.defineProperty(this, "name", {
            get: function ()
            {
                return _name;
            },
            configurable: false,
            enumerable: true
        });

        /**Object. The options for the TestRunner.
        @type {EVUITest.TestOptions}*/
        this.options = null;
        Object.defineProperty(this, "options", {
            get: function ()
            {
                return _options;
            },
            configurable: false,
            enumerable: true
        });

        /**Adds a test to the TestRunner.
        @param {EVUITest.Test} test A YOLO of the test to add.
        @returns {EVUITest.Test}*/
        this.addTest = function (test)
        {
            var testState = getTestAmbiguously(test);
            if (testState == null) throw Error("Object or function expected.");

            testState.testRunner = this;

            _tests.push(testState);
            return testState.test;
        };

        /**Removes a test from the TestRunner.
        @param {EVUITest.Test|Number} testOrId Either the test to remove or the ID of the test to remove.
        @returns {Boolean}*/
        this.removeTest = function (testOrId)
        {
            var testId = null;

            if (typeof testOrId === "number")
            {
                testId = testOrId;
            }
            else if (typeof testOrId === "object" && testOrId != null)
            {
                testId = testOrId.id;
                if (typeof testId !== "number") return false;
            }

            var numTests = _tests.length;
            for (var x = 0; x < numTests; x++)
            {
                var curTest = _tests[x];
                if (curTest.id === testId)
                {
                    _tests.splice(x, 1);
                    return true;
                }
            }

            return false;
        };

        /**Gets a test from the TestRunner based on its ID.
        @param {Number} testId*/
        this.getTest = function (testId)
        {
            var testById = getTestById(testId);
            if (testById != null) return testById.test;

            return null;
        };

        /**Gets all the tests in the test runner.
        @returns {EVUITest.Test[]}*/
        this.getTests = function ()
        {
            var tests = [];
            var numTests = _tests.length;
            for (var x = 0; x < numTests; x++)
            {
                tests.push(_tests[x].test);
            }

            return tests;
        };

        /**Executes all the tests in the test runner.
        @param {EVUITest.Constants.Fn_TestRunCallback} callback A callback function to call once all the tests have been run.*/
        this.executeTests = function (callback)
        {
            var currentTests = _tests.slice();
            var allResults = [];
            var numTests = currentTests.length;
            var testIndex = 0;

            if (numTests === 0) return callback(allResults);

            var executeTestCallback = function (testResults)
            {
                if (testResults != null)
                {
                    allResults = allResults.concat(testResults);
                }

                testIndex++;
                if (testIndex === numTests) return callback(allResults);

                launchTest(currentTests[testIndex], executeTestCallback);
            };

            launchTest(currentTests[testIndex], executeTestCallback);
        };

        /**Awaitable.Executes all the tests in the test runner.
        @returns {Promise<EVUITest.TestResult[]>}*/
        this.executeTestsAsync = function ()
        {
            return new Promise(function (resolve)
            {
                _self.executeTests(function (results)
                {
                    resolve(results);
                });
            });
        };

        /**Utility function to get a test by it's ID.
        @param {Number} id The id of the test to get.*/
        var getTestById = function (id)
        {
            var numTests = _tests.length;
            for (var x = 0; x < numTests; x++)
            {
                var curTest = _tests[x];
                if (curTest.id === id) return curTest;
            }

            return null;
        };
    };

    /**Launches a test and executes it once per set of arguments provided.
    @param {TestState} testState The internal state object of the test being run.
    @param {EVUITest.Constants.Fn_TestRunCallback} callback The callback function to call once the test has been run.*/
    var launchTest = function (testState, callback)
    {
        //if any test is running, sit there and wait for a turn to be the active test running. We do this because the global onerror handler can't figure out which test has failed if we have multiple async tests running at the same time
        if (_running === true)
        {
            setTimeout(function ()
            {
                launchTest(testState, callback);
            }, 10);

            return;
        }

        _running = true;

        //get all the arguments from the arguments factory
        var allArgs = testState.argsFactory.getAllArgs();
        var numArgs = allArgs.length;

        var testResults = [];

        if (numArgs === 0) //no args, just run the test once
        {
            triggerTestExecute(testState, null, 0, function (testResult)
            {
                testResults.push(testResult);
                _running = false;

                callback(testResults);
            });
        }
        else //we have at least one set of arguments, run the test for each set of arguments SERIALLY
        {
            var curIndex = 0;

            var executeCallback = function (testResult)
            {
                testResults.push(testResult);

                curIndex++;
                if (curIndex === numArgs)
                {
                    _running = false;
                    return callback(testResults);
                }
                var curArgs = allArgs[curIndex];
                triggerTestExecute(testState, curArgs, curIndex, executeCallback);
            };

            triggerTestExecute(testState, allArgs[curIndex], curIndex, function (testResult)
            {
                executeCallback(testResult);
            });
        }
    };

    /**Triggers the execution of a test.
    @param {TestState} testState The state information about the test being run.
    @param {EVUITest.TestArgs} args The arguments to feed into the test.
    @param {Number} index The index of the args in the list of all the args for the test.
    @param {Function} callback The callback to call once the test has completed.*/
    var triggerTestExecute = function (testState, args, index, callback)
    {
        //make the arguments that will be fed into the test function
        var exeArgs = new EVUITest.TestExecutionArgs();
        exeArgs.options = makeFinalOptions((args != null) ? args.options : null, testState.test.options, testState.testRunner.options);
        exeArgs.testId = testState.id;
        exeArgs.testName = testState.test.name;
        exeArgs.runnerName = testState.testRunner.name;
        exeArgs.argsName = (args != null && typeof args.name === "string") ? args.name : null;

        //all the state information we know about the current testing session
        var testSession = new TestSession();
        testSession.testRunner = this;
        testSession.args = args;
        testSession.callback = callback;
        testSession.testState = testState;
        testSession.options = exeArgs.options;
        testSession.executionArgs = exeArgs;

        //whether or not one of the "exit paths" has already invoked the callback.
        var callbackInvoked = false;

        //flag to know if the test was manually failed or passed. If it was manually passed, we don't need to set a timeout
        var manuallyCompleted = false;

        var testResult = new EVUITest.TestResult();
        testResult.testId = testState.id;
        testResult.testResultId = index;
        testResult.testName = testState.test.name;
        testResult.argsName = (args != null && typeof args.name === "string") ? args.name : null;
        testResult.runnerName = testState.testRunner.name;
        testResult.argsName = testSession.args.name;

        //common callback that ensures we clean up whatever resources we attached to the window
        var finish = function (result)
        {
            removeEventListener("error", errorHandler);
            if (testSession.timeoutId !== -1) clearTimeout(testSession.timeoutId)

            if (callbackInvoked === false)
            {
                if (exeArgs.options.testHost != null) exeArgs.options.testHost.addResult(result);

                if (testSession.timeoutId > 0) clearTimeout(testSession.timeoutId);
                callbackInvoked = true;

                callback(result);
            }
        };

        //onerror handler function reference to add and remove
        var errorHandler = function (args)
        {
            //if the error came from a script file that we don't care about, do nothing
            if (meetsScriptFilter(args.filename, testSession.options.fileFilter) === false) return;

            //otherwise kill the test.
            testResult.success = false;
            testResult.message = args.error.message;

            finish(testResult);
        };

        //add the global error event listener to catch exceptions thrown not on the stack trace of the promise (i.e. in a callback for a native API, like a XMLHttpRequest)
        addEventListener("error", errorHandler);

        new Promise(function (resolve, reject)
        {
            //hook up the pass/fail options to trigger the promise's native API to resolve or reject itself (and also set the "manually competed" flag so we know not to set a timeout waiting for the test to fail)
            exeArgs.pass = function ()
            {
                manuallyCompleted = true;
                resolve();
            };

            exeArgs.fail = function (reason)
            {
                manuallyCompleted = true;
                reject(reason);
            };

            var testToRun = testSession.testState.test.test;
            if (typeof testToRun !== "function") throw Error("Test failed - no test function associated with Test object.");

            //make the arguments array to feed into the test function. Make a new array or a copy so we can put the args first without disturbing the actual array.
            var argsArray = null;
            if (Array.isArray(args.args) === true)
            {
                argsArray = testSession.args.args.slice();
            }
            else
            {
                argsArray = [args.args];
            }

            //set the array of user arguments passed into the function as they were provided by the user
            exeArgs.testArgs = argsArray.slice();

            //put args at front of parameters to pass into test
            argsArray.unshift(exeArgs);

            //make sure the args can't be mutated during the test.
            Object.freeze(exeArgs);

            testSession.timeoutId = setTimeout(function ()
            {
                throw Error("Test timed out.");
            }, testSession.options.timeout);

            var result = null;

            //run the actual test using whatever context we have or run it in no context
            if (testSession.testState.test.testContext != null)
            {
                result = testToRun.apply(testSession.testState.test.testContext, argsArray);
            }
            else
            {
                result = testToRun.apply(this, argsArray);
            }

            if (result instanceof Promise)
            {
                result.catch(function (ex)
                {
                    reject(ex);
                }).then()
                {
                    resolve();
                }
            }
        }).catch(function (reason)
        {
            testResult.success = false;

            if (reason instanceof Error)
            {
                testResult.message = reason.message;
            }
            else if (typeof reason === "string")
            {
                testResult.message = reason;
            }

            finish(testResult);
        }).then(function ()
        {
            testResult.success = true;
            finish(testResult);
        });
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

    /**Takes ambiguous user input and makes a TestState object from it.
    @param {EVUITest.Test|Function} test The test to turn into a TestState.*/
    var getTestAmbiguously = function (test)
    {
        var testType = typeof test;
        if (test == null || (testType !== "object" && testType !== "function")) return null;

        var state = new TestState();
        var realTest = new EVUITest.Test(state);

        //if we were handed an object, populate the realTest with its values
        if (testType === "object")
        {
            var args = test.args;
            if (args != null)
            {
                if (typeof args === "object") //if the arguments is an object, we need to either make it the args factory or add its args to the existing args factory.
                {
                    if (args instanceof EVUITest.TestArgsFactory === true)
                    {
                        state.argsFactory = args;
                    }
                    else if (typeof args.getAllArgs === "function") //duck typed - this will work as long as it gives us a valid array of arguments objects.
                    {
                        state.argsFactory = args;
                    }
                    else if (Array.isArray(args) === true) //we were given an array - this is either a single set of parameters or an array of arrays of parameters
                    {
                        var arrayOfArrays = true;
                        var numArgs = args.length;
                        for (var x = 0; x < numArgs; x++)
                        {
                            if (Array.isArray(args[x]) === false)
                            {
                                arrayOfArrays = false; //not an array of arrays, this is a single parameter array to add as a single argument
                                break;
                            }
                        }

                        if (arrayOfArrays === false)
                        {
                            state.argsFactory.addArgs(args);
                        }
                        else //it was an array of arrays - add each element as a set of arguments
                        {
                            for (var x = 0; x < numArgs; x++)
                            {
                                state.argsFactory.addArgs(args[x]);
                            }
                        }
                    }
                    else //args is just a regular object, add it as a single argument
                    {
                        state.argsFactory.addArgs(args);
                    }
                }
                else //args is some other non-object value, add it as a single argument
                {
                    state.argsFactory.addArgs(args);
                }
            }

            //move the properties from the user's test onto the real test
            extend(realTest, test, ["id", "args"]);
        }
        else if (testType === "function") //if the test was just a function, just set the actual test part of the test.
        {
            realTest.test = test;
        }
        else
        {
            return null;
        }

        state.id = _testIdCounter++;
        state.test = realTest;

        return state;
    };

    /**Performs an inheritance operation on the various option sets we can use to make the final options set.
    @param {EVUITest.TestOptions} argsOptions The options settings from the actual test arguments.
    @param {EVUITest.TestOptions} testOptions The options settings that apply to the whole test.
    @param {EVUITest.TestOptions} suiteOptions The options settings that applies to all tests in the test runner.*/
    var makeFinalOptions = function (argsOptions, testOptions, suiteOptions)
    {
        var finalOptions = new EVUITest.TestOptions();
        extend(finalOptions, suiteOptions);
        extend(finalOptions, testOptions);
        extend(finalOptions, argsOptions);

        return Object.freeze(finalOptions);
    };

    /**The internal state object injected into a Test object that gives it access to the guts of its parent TestRunner.
    @class*/
    var TestState = function ()
    {
        /**Number. The id of the test.
        @type {Number}*/
        this.id = -1;

        /**Object. The arguments factory for the test.
        @type {EVUITest.TestArgsFactory}*/
        this.argsFactory = new EVUITest.TestArgsFactory();

        /**Object. The public test object that the user gets to see.
        @type {EVUITest.Test}*/
        this.test = null;

        /**Object. The parent test runner of the test.
        @type {TestRunner}*/
        this.testRunner = null;

        /**Launches a specific test. Invoked from the actual Test object.*/
        this.launchTest = function (callback)
        {
            launchTest(this, callback);
        };
    };

    /**State object representing everything known about the test.*/
    var TestSession = function ()
    {
        /**Object. The handle to the state of the Test.
        @type {TestState}*/
        this.testState = null;

        /**Object. The arguments being fed into the test.
        @type {EVUITest.TestArgs}*/
        this.args = null;

        /**Object. The options being used to run the test.
        @type {EVUITest.TestOptions}*/
        this.options = null;

        /**Function. The callback function to call once the test has completed.
        @type {Function}*/
        this.callback = null;

        /**Object. The TestRunner arguments passed into the test when it is run.
        @type {EVUITest.TestExecutionArgs}*/
        this.executionArgs = null;

        /**Number. If the test was not resolved before it exited, this is the ID of the timeout waiting to fail the test.
        @type {Number}*/
        this.timeoutId = -1;
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

    return new TestRunnerFactory();
})();

/**Object representing a test to run in a TestRunner.
@class*/
EVUITest.Test = function (testState)
{
    var _testState = testState;

    /**Number. The Id of the test.
    @type {Number}*/
    this.id = null;
    Object.defineProperty(this, "id", {
        get: function ()
        {
            return _testState.id;
        },
        configurable: false,
        enumerable: true
    });

    /**String. The name of the test. Used for logging purposes.*/
    this.name = null;

    /**Object. The arguments factory that will generate the TestArgs to be fed into the Test's test function.
    @type {EVUITest.TestArgsFactory}*/
    this.args = null;
    Object.defineProperty(this, "args", {
        get: function ()
        {
            return _testState.argsFactory;
        },
        configurable: false,
        enumerable: true
    });

    /**Function. The test to run. Can take any number of parameters, but the first parameter is always a TestExecutionArgs instance
    @type {EVUITest.Constants.Fn_Test}*/
    this.test = null;

    /**Any. Optional. Any object to use as the "this" context to run the test in.
    @type {Any}*/
    this.testContext = null;

    /**Object. The options to control how the test behaves.
    @type {EVUITest.TestOptions}*/
    this.options = null;

    /**Runs the test with all its arguments and calls the callback when complete.
    @param {EVUITest.Constants.Fn_TestRunCallback} callback The callback to call once the test is complete or failed.*/
    this.run = function (callback)
    {
        _testState.launchTest(callback);
    };

    /**Awaitable. Runs the test with all its arguments and calls the callback when complete.
    @returns {Promise<EVUITest.TestResult[]>}*/
    this.runAsync = function ()
    {
        return new Promise(function (resolve)
        {
            _testState.launchTest(function (result)
            {
                resolve(result);
            });
        }); 
    };
};

/**Object that represents a factory for producing TestArgs objects to feed into a test.
@class*/
EVUITest.TestArgsFactory = function ()
{    
    /**All of the arguments that have been added to the factory.
    @type {EVUITest.TestArgs[]}*/
    var _args = [];

    /**Adds a set of values 
    @param {Array|EVUITest.TestArgs} argsArray Either a YOLO TestArgs object, or a value/array of values to set as arguments for an iteration of a test.
    @param {String|EVUITest.TestOptions} name
    @param {EVUITest.TestOptions}*/
    this.addArgs = function (argsArray, name, options)
    {
        var testArgs = new EVUITest.TestArgs();

        if (argsArray != null && typeof argsArray === "object") //we were given an object
        {
            if (argsArray.args !== undefined) //and it has the required property to be considered an TestArgs object, so use it as the basis for the real object.
            {
                testArgs = extend(testArgs, argsArray);
                _args.push(testArgs);

                return testArgs;
            }
            else //otherwise its some random object to turn into an array of arguments.
            {
                if (Array.isArray(argsArray) === false)
                {
                    argsArray = [argsArray];
                }
                else
                {
                    argsArray = argsArray.slice();
                }

                testArgs.args = argsArray;
            }
        }
        else
        {
            testArgs.args = [argsArray];
        }

        //fall back for the other parameters for the test args
        if (typeof name === "string")
        {
            testArgs.name = name;
        }
        else if (name != null && typeof name === "object") //name was actually an options object
        {
            testArgs.options = name;
        }

        if (testArgs.options == null && options != null && typeof options === "object") //no options object yet, use the one provided
        {
            testArgs.options = options;
        }

        //make sure our required properties are at least somewhat populated
        if (testArgs.options == null) testArgs.options = new EVUITest.TestOptions();

        _args.push(testArgs);
        return testArgs;
    };

    /**Gets a COPY of the internal test arguments array.
    @returns {EVUITest.TestArgs[]}*/
    this.getAllArgs = function ()
    {
        return _args.slice();
    };

    /**Removes a set of arguments from the factory.
    @param {EVUITest.TestArgs} args*/
    this.removeArgs = function (args)
    {
        if (args == null || args instanceof EVUITest.TestArgs === false) return false;

        var numArgs = _args.length;
        for (var x = 0; x < numArgs; x++)
        {
            if (args === _args[x])
            {
                _args.splice(x, 1);
                return true;
            }
        }

        return false;
    };

    /**Makes a clone of this TestArgsFactory with a new set of TestArgs that are exactly the same as the current set. Note the actual argument object references will be unchanged.
    @returns {EVUITest.TestArgsFactory}*/
    this.clone = function ()
    {
        var allArgs = this.getAllArgs();
        var other = new EVUITest.TestArgsFactory();

        var numArgs = allArgs.length;
        for (var x = 0; x < numArgs; x++)
        {
            other.addArgs(allArgs[x]);
        }

        return other;
    };
};

/**Object representing the metadata to feed into a Test when it is run.
@class*/
EVUITest.TestArgs = function ()
{
    /**String. The name of the TestArguments. Used for logging purposes.
    @type {String}*/
    this.name = null;

    /**Array. An array of values to feed into the Test function (via function.apply).
    @type {Array}*/
    this.args = null;

    /**Object. The specific options that apply only to this set of TestArguments.
    @type {EVUITest.TestOptions}*/
    this.options = null;
};

/**Object that is passed into each test function. "pass" or "fail" must be called to advance to the next test.
@class*/
EVUITest.TestExecutionArgs = function ()
{
    /**String. The name of the TestRunner running the test. Used for logging purposes.
    @type {String}*/
    this.runnerName = null;

    /**Number. The ID of the test that was run.
    @type {Number}*/
    this.testId = -1;

    /**String. The name of the test being run.
    @type {String}*/
    this.testName = null;

    /**Array. The array of user-provided values fed into the test function.
    @type {Array}*/
    this.testArgs = null;

    /**String. The name of the set of arguments being run.
    @type {String}*/
    this.argsName = null;

    /**Object. The final set of TestOptions used for running the test.
    @type {EVUITest.TestOptions}*/
    this.options = null;

    /**Function to call to pass the test and advance to the next test.*/
    this.pass = function () { };

    /**Function to call to fail the test and advance to the enxt test.
    @param {String|Error} reason The reason for the failure.*/
    this.fail = function (reason) { };
};

/**Object that represents the result of running a test.
@class*/
EVUITest.TestResult = function ()
{
    /**Number. The ID of the result in the set of results all belonging to the same test.
    @type {Number}*/
    this.testResultId = -1;

    /**Number. The ID of the test that was run.
    @type {Number}*/
    this.testId = -1;

    /**Boolean. Whether or not the test was successful.
    @type {Boolean}*/
    this.success = false;

    /**String. The error message if the test failed.*/
    this.message = null;

    /**String. The name of the TestRunner running the test.
    @type {String}*/
    this.runnerName = null;

    /**Array. The array of user-provided values that was fed into the test function.
    @type {Array}*/
    this.testName = null;

    /**String. The name of the set of arguments that was run.
    @type {String}*/
    this.argsName = null;
};

/**Gets a message about the completion of the test.
@returns {String}*/
EVUITest.TestResult.prototype.getResultMessage = function ()
{
    var messageStart = "Test #" + this.testId + " ";
    var testName = "";
    var messageEnd = "";

    var partialName = false;
    if (typeof this.runnerName === "string" && this.runnerName.trim().length > 0)
    {
        partialName = true;
        testName += this.runnerName;
    }

    if (typeof this.testName === "string" && this.testName.trim().length > 0)
    {
        testName += (partialName === true) ? ":" + this.testName : this.testName;
        partialName = true;
    }

    if (typeof this.argsName === "string" && this.argsName.trim().length > 0)
    {
        testName += (partialName === true) ? ":" + this.argsName : this.argsName;
    }

    if (this.success === true)
    {
        messageEnd = " succeeded!";
    }
    else
    {
        messageEnd = " failed!";
        if (typeof this.message === "string" && this.message.trim().length > 0)
        {
            messageEnd += "\n\Reason:\n\t" + this.message;
        }
    }

    if (testName.length === 0)
    {
        return messageStart + messageEnd;
    }
    else
    {
        return messageStart + "(" + testName + ")" + messageEnd;
    }
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

    /**Object. A TestHost to associate with the TestRunner. When the TestRunner completes a batch of tests, the results will be added to the TestHost.
    @type {EVUITest.TestHost}*/
    this.testHost = null;
};

/**Function definition for the test delegate to be made to run in a TestHost.
@param {Function} resolve  A function to call to complete the TestHost's execution by resolving the underlying promise.
@param {Function} reject A function to call to complete the TestHost's execution by rejecting the underlying promise.*/
EVUITest.Constants.Fn_TestHostRun = function (resolve, reject) { };

/**A simple utility that runs a test single delegate that can contain any arbitrary testing code. The entry point to the EVUI unit testing Selenium integration.
@class*/
EVUITest.TestHost = (function ()
{
    /**Implementation of the TestHost singleton.
    @class*/
    var TestHost = function ()
    {
        var _self = this;
        var _executing = false;
        var _testResults = [];
        var _finalResult = null;

        /**Boolean. Whether or not the Host is currently running.
        @type {Boolean}*/
        this.executing = false;
        Object.defineProperty(this, "executing", {
            get: function()
            {
                return _executing;
            },
            configurable: false,
            enumerable: true
        });

        /**Awaitable. Runs a test function based on the TestHostArgs passed in.
        @param {EVUITest.TestHostArgs|EVUITest.Constants.Fn_TestHostRun} hostArgs The arguments to run as a test.
        @returns {Promise<EVUITest.TestHostResult>}*/
        this.runAsync = function (hostArgs)
        {
            if (_executing === true) throw Error("TestHost is currently executing.");
            this.reset();

            _executing = true;

            if (typeof hostArgs === "function")
            {
                var test = hostArgs;

                hostArgs = new EVUITest.TestHostArgs();
                hostArgs.test = test;
                hostArgs.testName = null;
            }

            var timeoutDuration = hostArgs.timeout;
            if (typeof timeoutDuration !== "number") timeoutDuration = 1000;

            return new Promise(function (resolve)
            {
                var finish = function (ex)
                {
                    clearTimeout(timeoutId);

                    if (_executing === false) return;

                    _executing = false;
                    _finalResult = makeFinalResult(hostArgs, ex);

                    var status = _self.getStatus()
                    _self.reset();

                    resolve(status);
                }

                var timeoutId = setTimeout(function ()
                {
                    finish(new Error("Timeout hit after " + timeoutDuration + "ms."));
                }, timeoutDuration);

                new Promise(function (innerResolve, innerReject)
                {
                    var result = hostArgs.test(innerResolve, innerReject);
                    if (result instanceof Promise)
                    {
                        result.catch(function (ex)
                        {
                            innerReject(ex);
                        }).then(function ()
                        {
                            innerResolve();
                        });
                    }
                }).catch(function (reason)
                {
                    if (reason instanceof Error === false) reason = new Error(reason);
                    finish(reason);

                }).then(function ()
                {
                    finish();
                });
            });
        };

        /**Adds a result to the TestHost's collection of TestResults.
        @param {EVUITest.TestResult} result*/
        this.addResult = function(result)
        {
            if (result == null || typeof result !== "object") return;

            var realResult = new EVUITest.TestResult();
            realResult.testResultId = (typeof result.testResultId === "number") ? result.testResultId : -1;
            realResult.argsName = (typeof result.argsName === "string") ? result.argsName : null;
            realResult.message = (typeof result.message === "string") ? result.message : null;
            realResult.runnerName = (typeof result.runnerName === "string") ? result.runnerName : null;
            realResult.success = (typeof result.success === "boolean") ? result.success : false;
            realResult.testId = (typeof result.testId === "number") ? result.testId : -1;
            realResult.testName = (typeof result.testName === "string") ? result.testName : null;

            _testResults.push(realResult);
        };

        /**Gets the current result set and execution status of the TestHost.
        @returns {EVUITest.TestHostResult}*/
        this.getStatus = function ()
        {
            var results = new EVUITest.TestHostResult();
            results.finished = !_executing;
            results.testResults = _testResults.slice();
            results.finalResult = _finalResult;

            return results;
        };

        /**Resets the TestHost.*/
        this.reset = function ()
        {
            _executing = false;
            _testResults = [];
            _finalResult = null;
        };

        /**Makes the TestResult indicating whether or not the TestHost completed successfully.
        @returns {EVUITest.TestResult}*/
        var makeFinalResult = function (hostArgs, ex)
        {
            var result = new EVUITest.TestResult();
            result.success = (ex == null);
            result.message = (ex == null) ? "TestHost completed successfully." : "TestHost crashed: \n\t" + ex.message;
            result.runnerName = "TestHost";
            result.testId = -1;
            result.testName = (typeof hostArgs.testName === "string") ? hostArgs.testName : "<anonymous>";

            return result;
        };
    }

    return new TestHost();
})();

/**The aggregate results of a TestHost's execution of a test function.
@class*/
EVUITest.TestHostResult = function ()
{
    /**Array. The results of all the tests that were run.
    @type {EVUITest.TestResult[]}*/
    this.testResults = [];

    /**Boolean. Whether or not the TestHost has completed or not.
    @type {Boolean}*/
    this.finished = false;

    /**Object. The final result of the TestHost.
    @type {EVUITest.TestResult}*/
    this.finalResult = null;
};

/**Arguments to feed the TestHost.
@class*/
EVUITest.TestHostArgs = function ()
{
    /**String. The name of the test being run.
    @type {String}*/
    this.testName = null;

    /**Number. The number of milliseconds to wait before automatically failing the test.
    @type {Number}*/
    this.timeout = 1000;

    /**Function. The test function to run - takes the underlying Promise's resolve and reject functions as parameters.
    @type {EVUITest.Constants.Fn_TestHostRun}*/
    this.test = null;
};