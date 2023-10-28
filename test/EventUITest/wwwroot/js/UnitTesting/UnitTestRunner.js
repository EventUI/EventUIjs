/**Copyright (c) 2023 Richard H Stannard
 
This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

/**Controller that manages the loading and execution of a single test file.
@class*/
EVUIUnit.TestRunner = class
{
    /**Special getter to determine if we are running in an iframe.
    @type {Boolean}*/
    get #isChildWindow()  { return window.parent != window; }

    /**The arguments passed into the test runner.
    @type {EVUIUnit.TestRunnerServerArgs}*/
    #runnerArgs = null;

    /**Indicates if the test is currently running or not.
    @type {Boolean}*/
    #testRunning = false;

    /**Whether or not the controller has had its parameters set.
    @type {Boolean}*/
    #initialized = false;

    /**The name of the function to run in order to execute the test code.
    @type {String}*/
    #functionName = null;

    /**The length of the timeout for the test file in seconds.
    @type {Number}*/
    #timeout = 10;

    /**Initializes the test runner with a set of arguments.
    @param {EVUIUnit.TestRunnerServerArgs} testRunnerArgs The arguments to feed th rest runner.*/
    initialize(testRunnerArgs)
    {
        if (testRunnerArgs == null || typeof testRunnerArgs !== "object") throw Error("Object expected.");
        if (this.#initialized === true) throw Error("Already initialized.");
        this.#initialized = true;

        this.#runnerArgs = this.#cloneRunnerArgs(testRunnerArgs);
        this.#functionName = "TEST_CODE";

        EVUITest.Settings.outputWriter.writeOutput = (outputMessage) =>
        {
            this.writeOutput(outputMessage);
        }
    }

    /**Writes output to the parent iframe in the form of a message or logs a message to the console if not running in an iframe.
    @param {String|EVUITest.OutputWiterMessage} output The ooutput to send or log.
    @param {any} outputLevel The LogLevel enum value indicating the importance of the msaage being logged.*/
    writeOutput(output, outputLevel)
    {
        if (output == null) return;

        if (this.#isChildWindow === false)
        {
            var message = output;
            var level = outputLevel;
            var timestamp = null;

            if (typeof output === "object")
            {
                message = output.message;

                if (output.logLevel != null) level = output.logLevel;
                if (output.timestamp != null) timestamp = output.timestamp;
            }

            if (typeof level !== "string") level = EVUITest.LogLevel.Info;
            if (typeof timestamp !== "string") timestamp = new Date(Date.now()).toISOString();

            console.log(`${timestamp} - [${level.toUpperCase()}]: ${message}`);

            return;
        }

        var message = output;
        if (typeof output !== "object")
        {
            message = new EVUITest.OutputWiterMessage();
            message.message = output;

            if (typeof outputLevel !== "string") outputLevel = EVUITest.LogLevel.Info;
            message.level = outputLevel;
        }

        var pushMessage = new EVUIUnit.OuputPushMessage();
        pushMessage.testSessionId = this.#runnerArgs.testSessionId;
        pushMessage.message = message;

        window.parent.postMessage(pushMessage);
    }

    /**Runs the test file by stuffing it into a new scipt tag and exeucting it within a function wrapper.*/
    async run()
    {
        if (this.#testRunning === true) return;
        this.#testRunning = true;

        try
        {
            if (typeof this.#runnerArgs.testFilePath !== "string") throw Error("No file path specified.");

            var script = await this.#getScriptText();
            var injectionResult = await this.#injectScript(script, this.#runnerArgs.debug);
            if (injectionResult === false) throw Error("Failed to inject test code.");

            this.#sendTestStartMessage();

            await window[this.#functionName]();
            var now = Date.now();

            while ($evui.testHost.executing === true)
            {
                await this.#waitAsync(10);
                if (Date.now() - now > (this.#timeout * 1000)) throw Error("Test timeout hit.")
            }
        }
        catch (ex)
        {
            var outputMessage = new EVUITest.OutputWiterMessage();
            outputMessage.logLevel = EVUITest.LogLevel.Critical;
            outputMessage.message = "Error executing test function wrapper: " + ex.stack;

            this.writeOutput(outputMessage);
        }
        finally
        {
            this.#sendTestEndMessage($evui.testHost.getResults());
            this.#testRunning = false;
        }
    }

    /**Makes a request to the local server for the script text to run and wraps it in a function.
    @returns {String}*/
    async #getScriptText()
    {
        var url = this.#runnerArgs?.testFilePath;
        if (typeof url !== "string") throw Error("No testFilePath to pull test code from.");

        var qsExtension = url.indexOf("?") !== -1 ? "&" : "?";
        url += qsExtension + "rand=" + (Math.random() * 10000).toString(36);

        var response = await fetch(url, {
            headers: {
                "Content-Type": "text/plain",
                "Accept": "text/plain"
            }
        });

        var responseText = await response.text();
        if (typeof responseText !== "string" || responseText.trim().length === 0)
        {
            this.#sendTestStartMessage();
            throw Error("No code found for test file " + this.#runnerArgs.testFilePath);
        }
        if (this.#runnerArgs.debug === true) responseText = "debugger;" + responseText;

        var finalScript = `window["${this.#functionName}"] = async function() {${responseText}};`

        return finalScript;
    };

    /**Injects the wrapped script into a script tag and attaches it to the body of the document.
    @param {String} scriptText The function-wrapped string of code to run.
    @returns {Boolean}*/
    async #injectScript(scriptText)
    {
        var success = true;
        var errorHandler = (errorArgs) =>
        {
            if (success === false) this.writeOutput("CODE INJECTION PARSE ERROR:" + errorArgs.error.stack, EVUITest.LogLevel.Critical);
            success = false;           
        };

        //we add a global error handler to catch parse errors in the script when its being read by the browser after being inserted
        window.addEventListener("error", errorHandler);

        var scriptTag = document.createElement("script");
        scriptTag.innerHTML = scriptText;

        try
        {
            document.body.append(scriptTag);
        }
        catch (ex)
        {
            errorHandler({ error: ex });
        }

        return new Promise((resolve) =>
        {
            setTimeout(function ()
            {
                window.removeEventListener("error", errorHandler);
                resolve(success);
            }, 10);
        });
    };   

    /**Clones the user's TestRunnerServerArgs into a real instance of TestRunnerServerArgs.
    @param {EVUIUnit.TestRunnerServerArgs} serverArgs The user's server arguments object.
    @returns {EVUIUnit.TestRunnerServerArgs}*/
    #cloneRunnerArgs(serverArgs)
    {
        var newArgs = new EVUIUnit.TestRunnerServerArgs();
        newArgs.testFilePath = serverArgs.testFilePath;
        newArgs.debug = typeof serverArgs.debug === "boolean" ? serverArgs.debug : false; 
        newArgs.testSessionId = serverArgs.testSessionId;

        return newArgs;
    }

    /**Sends a message to the parent iframe indicating that the test code is about to be executed.*/
    #sendTestStartMessage()
    {
        if (this.#isChildWindow === false)
        {
            return this.writeOutput("Test starting!");
        }

        var pushMessage = new EVUIUnit.TestStatusUpdate();
        pushMessage.messageCode = EVUIUnit.MessageCodes.TestReady;
        pushMessage.testSessionId = this.#runnerArgs.testSessionId;

        window.parent.postMessage(pushMessage);
    }

    /**Sends a message to the parent iframe indicating the test is complete and carries the batch of test results.
    @param {EVUITest.TestResult[]} results The results of the tests run in the code file.*/
    #sendTestEndMessage(results)
    {
        if (this.#isChildWindow === false)
        {
            return this.writeOutput("Test complete!");
        }

        var pushMessage = new EVUIUnit.TestCompleteMessage();
        pushMessage.testResults = (Array.isArray(results) === false) ? [] : results;
        pushMessage.testSessionId = this.#runnerArgs.testSessionId;

        window.parent.postMessage(pushMessage);
    }

    /**Waits for the given number of milliseconds before resolving the underlying promise.
    @param {Number} duration The amount of time to wait.*/
    #waitAsync(duration)
    {
        return new Promise((resolve) =>
        {
            setTimeout(function ()
            {
                resolve();
            }, duration);
        });
    }
}

/**Arguments to feed into the test runner.*/
EVUIUnit.TestRunnerServerArgs = class
{
    /**String. The resolvable path to the test code file to run.
    @type {String}*/
    testFilePath = null;

    /**String. The ID of the test session running this iframe.
    @type {String}*/
    testSessionId = null;

    /**Boolean. Whether or not a "debugger" statement should be inserted at the beginning of the codefile.
    @type {Boolean}*/
    debug = false;
};