/**Copyright (c) 2023 Richard H Stannard
 
This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

EVUIUnit.Controllers.HostController = class
{
    #testSessionID = 0;
    #initialized = false;

    /**
     * 
    @type {EVUIUnit.Resources.TestHostServerArgs} */
    #serverArgs = null;

    /**
    @type {#TestSession[]}*/
    #fileSessions = [];

    #rootElement = null;
    #outputElement = null;

    Timeout = 10;

    /**
     * 
     * @param {any} serverArgs
     */
    initialize(serverArgs, rootElement)
    {
        if (serverArgs == null || typeof serverArgs !== "object") throw Error("Object expected.");
        if (this.#initialized === true) throw Error("Already initialized.");

        this.#initialized = true;
        this.#serverArgs = this.#cloneServerArgs(serverArgs);

        this.#rootElement = rootElement;
        if (this.#rootElement != null) this.#outputElement = this.#rootElement.querySelector("." + EVUIUnit.Constants.Class_TestOutput);
    };

    runFileAsync(fileName)
    {
        return new Promise((resolve) =>
        {
            var session = new this.#TestSession();
            session.id = this.#testSessionID++;
            session.fileName = fileName;
            session.isCritical = this.#serverArgs.criticalFails.indexOf(fileName) !== -1;
            session.completeCallback = () =>
            {
                resolve();
            }

            this.#attachIFrame(session);
            this.#launchIFrame(session);
        });
    }

    writeMessage(message, logLevel)
    {
        if (this.#outputElement == null) return console.log(message, logLevel);

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

        if (innerNode != null) messageDiv.append(innerNode);
        messageDiv.classList.add(className);

        this.#outputElement.append(messageDiv);
        this.#outputElement.scrollTo(0, this.#outputElement.scrollHeight);
    };

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

    async runAllAsync()
    {
        var numFiles = this.#serverArgs.runOrder.length;
        for (var x = 0; x < numFiles; x++)
        {
            await this.runFileAsync(this.#serverArgs.runOrder[x]);
        }
    }

    #launchIFrame(session)
    {
        this.#setTimeout(session);
        session.iframeLaunchedAt = Date.now();

        document.body.append(session.iframe);
    };

    #removeIFrame(session)
    {
        session.iframe.remove();
        session.iframe.src = null;
        session.iframeClosedAt = Date.now();
        window.removeEventListener("message", session.logHandler);
    };

    #cloneServerArgs(serverArgs)
    {
        var newArgs = new EVUIUnit.Resources.TestHostServerArgs();
        if (serverArgs != null && typeof serverArgs === "object")
        {
            if (Array.isArray(serverArgs.runOrder) === true) newArgs.runOrder = serverArgs.runOrder.slice();
            if (Array.isArray(serverArgs.criticalFails) === true) newArgs.criticalFails = serverArgs.criticalFails.slice();
        }

        return newArgs;
    }

    #attachIFrame(session)
    {
        var iframe = document.createElement("iframe");
        iframe.src = EVUIUnit.Constants.Path_TestRunner + "?" + EVUIUnit.Constants.QS_TestFile + "=" + encodeURIComponent(session.fileName) + "&" + EVUIUnit.Constants.QS_TestSession + "=" + encodeURIComponent(this.#serverArgs.sessionId);
        var onMessageHandler = (args) =>
        {
            this.#handleIFrameMessage(session, args);
        }

        window.addEventListener("message", onMessageHandler);

        session.iframe = iframe;
        session.logHandler = onMessageHandler;
    };

    /**
     * 
     * @param {any} session
     * @param {MessageEvent} messageEventArgs
     */
    #handleIFrameMessage(session, messageEventArgs)
    {
        var message = messageEventArgs.data;
        if (message == null || typeof message !== "object") return;

        if (message.messageCode === EVUIUnit.Resources.MessageCodes.TestReady)
        {
            session.iframeReadyAt = Date.now();
            session.lastStatusUpdateAt = Date.now();
            this.writeMessage("\r\nTEST FILE " + session.fileName);
        }
        else if (message.messageCode === EVUIUnit.Resources.MessageCodes.OutputMessagePush)
        {
            session.lastStatusUpdateAt = Date.now();
            this.#setTimeout(session);
            this.#writeMessageOutput(session, message.message);
        }
        else if (message.messageCode === EVUIUnit.Resources.MessageCodes.TestComplete)
        {
            session.lastStatusUpdateAt = Date.now();

            if (session.timeoutID !== -1)
            {
                clearTimeout(session.timeoutID);
                session.timeoutID = -1;

                this.#finish(session);
            }
        }
    };

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

            this.#finish(session);

        }, this.Timeout * 1000);
    };

    #finish(session)
    {
        if (session.timedOut === true)
        {
            this.writeMessage("TEST FILE \t\t" + session.fileName + " TIMED OUT AFTER " + (session.lastStatusUpdateAt - session.iframeReadyAt) + "ms.")
        }
        else
        {
            this.writeMessage("TEST FILE \t\t" + session.fileName + " COMPLETED AFTER " + (session.lastStatusUpdateAt - session.iframeReadyAt) + "ms.")
        }

        this.#removeIFrame(session);
        session.completeCallback();
    }

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

    #TestSession = class
    {
        id = -1;
        fileName = null;
        iframe = null;
        isCritical = false;
        completeCallback = null;
        iframeLaunchedAt = 0;
        iframeReadyAt = 0;
        lastStatusUpdateAt = 0;
        iframeClosedAt = 0;
        timeoutID = -1;
        timedOut = false;
        logHandler = null;
    }
};

EVUIUnit.Resources.TestHostServerArgs = class
{
    sessionId = null;
    runOrder = [];
    criticalFails = [];
};