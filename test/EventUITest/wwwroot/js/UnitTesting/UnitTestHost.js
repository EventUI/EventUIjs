/**Copyright (c) 2025 Richard H Stannard
 
This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

/**The controller which launches TestRunner iframes and collects/displays their results.
@class*/
EVUIUnit.HostController = class
{
    /**ID couinter for TestSessions run by this host.
    @type {Number}*/
    #testSessionID = 0;

    /**Whether or not the test runner has been initialized and loaded with tests.*/
    #initialized = false;

    /**The arguments telling this host what files to run.
    @type {EVUIUnit.TestHostServerArgs} */
    #serverArgs = null;

    /**The root element to look for child elements inside of.
    @type {Element}*/
    #rootElement = null;

    /**The element into which log message divs will be appended.
    @type {Element}*/
    #outputElement = null;

    /**The maximum amount of time to wait between status updates before failing a test.
    @type {Number}*/
    Timeout = 10;

    /**Initializes the controller with the arugments it will run and the root element under which the required child elements can be found.
    @param {EVUIUnit.TestHostServerArgs} serverArgs The arguments as to what tests will be run.
    @param {Element} rootElement The root element to search under for the other elements used by the host.*/
    initialize(serverArgs, rootElement)
    {
        if (serverArgs == null || typeof serverArgs !== "object") throw Error("Object expected.");
        if (this.#initialized === true) throw Error("Already initialized."); //we basically don't want this re-initialized with new data while it's in the middle of running itself, its designed to be an intentional one-time use object.

        this.#initialized = true;
        this.#serverArgs = this.#cloneServerArgs(serverArgs);

        this.#rootElement = rootElement;
        if (this.#rootElement != null) this.#outputElement = this.#rootElement.querySelector("." + EVUIUnit.Constants.Class_TestOutput);
    };

    /**Runs a test file asynchronously.
    @param {String} fileName THe name of a file to test the code of.
    @returns {Promise<EVUIUnit.TestHostFileResults>} */
    runFileAsync(fileName)
    {
        return new Promise((resolve) =>
        {
            var session = new this.#TestSession();
            session.id = this.#serverArgs.sessionId + ":" + (this.#testSessionID++).toString();
            session.fileName = fileName;
            session.isCritical = this.#serverArgs.criticalFails.indexOf(fileName) !== -1;
            session.completeCallback = (results) =>
            {
                var serverResult = new EVUIUnit.TestHostFileResults();
                serverResult.fileName = session.fileName;
                serverResult.timedOut = session.timedOut;
                serverResult.results = results;
                serverResult.duration = session.iframeClosedAt - session.iframeReadyAt;

                resolve(serverResult);
            }

            this.#attachIFrame(session);
            this.#launchIFrame(session);
        });
    }

    /**Writes a messager to the output element.
    @param {String} message The message to log.
    @param {String} logLevel  A value from the EVUITest.LogLevel indicating the severity of the log message.*/
    writeMessage(message, logLevel)
    {
        if (this.#outputElement == null) return console.log(message, logLevel);

        //make a DIV and stuff it with an element that will contain the actual text - the divs act as separators between the inner log statements.
        var messageDiv = document.createElement("div");
        var innerNode = null;
        var className = null;

        if (logLevel === EVUITest.LogLevel.Critical)
        {
            innerNode = document.createElement("strong");
            innerNode.innerText = message;

            className = EVUIUnit.Constants.Class_TestOutput_Critical;
        }
        else if (logLevel === EVUITest.LogLevel.Error)
        {
            innerNode = document.createElement("span");
            innerNode.innerText = message;

            className = EVUIUnit.Constants.Class_TestOutput_Error;
        }
        else if (logLevel === EVUITest.LogLevel.Warn)
        {
            innerNode = document.createElement("span");
            innerNode.innerText = message;

            className = EVUIUnit.Constants.Class_TestOutput_Warn;
        }
        else if (logLevel === EVUITest.LogLevel.Debug)
        {
            innerNode = document.createElement("span");
            innerNode.innerText = message;

            className = EVUIUnit.Constants.Class_TestOutput_Debug;
        }
        else
        {
            innerNode = document.createElement("span");
            innerNode.innerText = message;

            className = EVUIUnit.Constants.Class_TestOutput_Normal;

            if (logLevel !== EVUITest.LogLevel.Debug &&
                logLevel !== EVUITest.LogLevel.Info &&
                logLevel !== EVUITest.LogLevel.Warn &&
                logLevel !== EVUITest.LogLevel.Trace)
            {
                className = EVUIUnit.Constants.Class_TestOutput_Console;
            }
        }

        //if we had an inner node to stuff the div with, insert it into the message DIV
        if (innerNode != null) messageDiv.append(innerNode);

        //tag the div with the class that will color it according to its importance.
        messageDiv.classList.add(className);

        //append to the output element and scroll to the bottom.
        this.#outputElement.append(messageDiv);
        this.#outputElement.scrollTo(0, this.#outputElement.scrollHeight);
    };

    /**Clears the message area of all content.*/
    clearMessageArea()
    {
        if (this.#outputElement == null) return;

        var numChildren = this.#outputElement.childNodes;
        while (numChildren > 0)
        {
            this.#outputElement.childNodes[0].remove();
            numChildren--
        }
    }

    /**Runs all the tests that were passed into the initialize function's serverArgs parameter in order.
    @returns {EVUIUnit.TestHostFileResults[]}*/
    async runAllAsync()
    {
        var allResults = [];

        var files = this.#serverArgs.runOrder.slice();
        var numFiles = files.length;
        for (var x = 0; x < numFiles; x++)
        {
            var fileResults = await this.runFileAsync(files[x]);
            if (fileResults != null) allResults.push(fileResults);
        }

        return allResults;
    }

    /**Inserts the test iframe into the DOM (appended to the body) so that it begins to load and run, then starts the timeout for the test file.
    @param {#TestSession} session The session whose iframe is being launched.*/
    #launchIFrame(session)
    {
        this.#setTimeout(session);
        session.iframeLaunchedAt = Date.now();

        document.body.append(session.iframe);
    };

    /**Removes a test iframe from the DOM.
    @param {#TestSession} session The session to stop.*/
    #removeIFrame(session)
    {
        session.iframe.remove();
        session.iframe.src = null;
        session.iframeClosedAt = Date.now();
        window.removeEventListener("message", session.logHandler);
    };

    /**Clones the serverArgs passed in by the user so that it cannot be tempered with while tests are executing.
    @param {EVUIUnit.TestHostServerArgs} serverArgs The user's serverArgs
    @returns {EVUIUnit.TestHostServerArgs}*/
    #cloneServerArgs(serverArgs)
    {
        var newArgs = new EVUIUnit.TestHostServerArgs();
        if (serverArgs != null && typeof serverArgs === "object")
        {
            if (Array.isArray(serverArgs.runOrder) === true) newArgs.runOrder = serverArgs.runOrder.slice();
            if (Array.isArray(serverArgs.criticalFails) === true) newArgs.criticalFails = serverArgs.criticalFails.slice();
            if (typeof serverArgs === "string") newArgs.sessionId = serverArgs.sessionId;
        }

        if (newArgs.sessionId == null) newArgs.sessionId = Math.round((Math.random() * 10000000)).toString(36);
        return newArgs;
    }

    /**Builds the iframe. Points it at the right URL and hooks upp the message handlers.
    @param {$TestSession} session The test session to build the iframe for.*/
    #attachIFrame(session)
    {
        var iframe = document.createElement("iframe");
        iframe.src = EVUIUnit.Constants.Path_TestRunner + "?" + EVUIUnit.Constants.QS_TestFile + "=" + encodeURIComponent(session.fileName) + "&" + EVUIUnit.Constants.QS_TestSession + "=" + encodeURIComponent(session.id);
        var onMessageHandler = (args) =>
        {
            this.#handleIFrameMessage(session, args);
        }

        window.addEventListener("message", onMessageHandler);

        session.iframe = iframe;
        session.logHandler = onMessageHandler;
    };

    /**Takes a message event from an iframe and takes the appropraite action.
     * 
     * @param {#TestSession} session The session whose messages are being handled.
     * @param {MessageEvent} messageEventArgs The event args produced by the window when it received this message.
     */
    #handleIFrameMessage(session, messageEventArgs)
    {
        var message = messageEventArgs.data;
        if (message == null || typeof message !== "object") return;
        if (message.testSessionId !== session.id) return; //since there may at some point be more than one message listener on the window, we want to make sure only tests related to this one get processed here

        messageEventArgs.stopImmediatePropagation(); //if this is the right handler for this message, there's no need for it to propagate further
        messageEventArgs.stopPropagation();

        if (message.messageCode === EVUIUnit.MessageCodes.TestReady) //test file has loaded and is being executed
        {
            session.iframeReadyAt = Date.now();
            session.lastStatusUpdateAt = Date.now();
            this.writeMessage("\r\nTEST FILE " + session.fileName);
        }
        else if (message.messageCode === EVUIUnit.MessageCodes.OutputPushMessage) //getting a message to write to the output area. Also, push back the timeout since this iframe is still alive
        {
            session.lastStatusUpdateAt = Date.now();
            this.#setTimeout(session);
            this.#writeMessageOutput(session, message.message);
        }
        else if (message.messageCode === EVUIUnit.MessageCodes.TestComplete) //test all done, collect rhe results, clear the timeout, and finish the job
        {
            session.lastStatusUpdateAt = Date.now();
            session.results = message.testResults;

            if (session.timeoutID !== -1)
            {
                clearTimeout(session.timeoutID);
                session.timeoutID = -1;
            }

            this.#finish(session);
        }
    };

    /**Sets (or rests) the timeout for a test file.
    @param {#TestSession} session The session to set the timeout for.*/
    #setTimeout(session)
    {
        if (session.timeoutID !== -1)
        {
            clearTimeout(session.timeoutID);
            session.timeoutID = -1;
        }

        session.timeoutID = setTimeout(() =>
        {
            session.timedOut = true;
            session.lastStatusUpdateAt = Date.now();
            session.timeoutID = -1;

            this.#finish(session);

        }, this.Timeout * 1000);
    };

    /**Completes the test file and removes the iframe from the DOM.
    @param {#TestSession} session*/
    #finish(session)
    {
        if (session.finished === true) return;
        session.finished = true;

        if (session.timedOut === true)
        {
            this.writeMessage("TEST FILE \t\t" + session.fileName + " TIMED OUT AFTER " + (session.lastStatusUpdateAt - session.iframeReadyAt) + "ms.")
        }
        else
        {
            this.writeMessage("TEST FILE \t\t" + session.fileName + " COMPLETED AFTER " + (session.lastStatusUpdateAt - session.iframeReadyAt) + "ms.")
        }

        this.#removeIFrame(session);
        session.completeCallback(session.results);
    }

    /**Internal switch for formatting log statements.
    @param {#TestSession} session The test session having a message written.
    @param {EVUITest.OutputWriterMessage} message THe message being written to output.*/
    #writeMessageOutput(session, message)
    {
        if (typeof message === "object")
        {
            this.writeMessage(`${message.timestamp} - [${message.logLevel?.toUpperCase()}]: ${message.message}`, message.logLevel);
        }
        else
        {
            this.writeMessage(message);
        }
    };

    /**State object for a test file in progress.
    @class */
    #TestSession = class
    {
        /**Number. The ID of the test session.
        @type {Number}*/
        id = -1;

        /**String. The name of the file being tested.
        @type {String}*/
        fileName = null;

        /**Object. The IFrame element running the test.
        @type {IFrameElement}*/
        iframe = null;

        /**Boolean. Whether or not an error in this file consititutes a critical failure that should stop the testing process.
        @type {Boolean}*/
        isCritical = false;

        /**Function. The callback function that signals the test is complete.
        @type {Function}*/
        completeCallback = null;

        /**Number. Timestamp from when the iframe was initially launched.
        @type {Number}*/
        iframeLaunchedAt = 0;

        /**Number. Timestamp from when the iframe signaled that it was ready to begin running test code.
        @type {Number}*/
        iframeReadyAt = 0;

        /**Number. Timestamp of the last time the iframe sent a message to the host.
        @type {Number}*/
        lastStatusUpdateAt = 0;

        /**Number. Timestamp of when the iframe has completed and been closed.
        @type {Number}*/
        iframeClosedAt = 0;

        /**Number. The ID of the timeout that is used to determine if the test timed out or not.
        @type {Number}*/
        timeoutID = -1;

        /**Boolean. Whether or not the timeout was hit.
        @type {Boolean}*/
        timedOut = false;

        /**Boolean. Whether or not the test file has finished running.
        @type {Boolean}*/
        finished = false;

        /**Function. The event handler attached to the window's onMessage event.
        @type {Function}*/
        logHandler = null;

        /**Array. The results of the test.
        @type {EVUITest.TestResult[]}*/
        results = [];
    }
};

/**The arugments passed into the host telling it what files to run.
@class*/
EVUIUnit.TestHostServerArgs = class
{
    /**String. The ID of the test host session.
    @type {String}*/
    sessionId = null;

    /**Array. An array of file paths relative to the root of the site to run.
    @type {String}*/
    runOrder = [];

    /**Array. An array of file paths relative to the root of the site that count as critical "do not continue" fails.
    @type {String[]}*/
    criticalFails = [];
};

/**The result object produced by the TestHost once it has completed running a file.
@class */
EVUIUnit.TestHostFileResults = class
{
    /**String. The name of the file that was run.
    @type {String}*/
    fileName = null;

    /**Array. The array of TestResults produced by the TestRunner.
    @type {EVUITest.TestResult}*/
    results = [];

    /**Boolean. Whether or not the file timed out.
    @type {Boolean}*/
    timedOut = false;

    /**Number. THe numbner of milliseconds that elapsed during the test.
    @type {Number}*/
    duration = 0;

    /**Gets an array of all the failed tests in the file.
    @returns {EVUITest.TestResult[]}*/
    getFailures()
    {
        if (this.results == null) return [];

        var fails = [];
        var numResults = this.results.length;
        for (var x = 0; x < numResults; x++)
        {
            var curResult = this.results[x];
            if (curResult.success === false)
            {
                fails.push(curResult);
            }
        }

        return fails;
    }
};