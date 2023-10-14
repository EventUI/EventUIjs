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
        });
    }

    writeMessage(message, messageType)
    {
        if (this.#outputElement == null) return console.log(message, messageType);

        var messageDiv = document.createElement("div");
        messageDiv.innerText = message;

        if (messageType === "sdasd")
        {

        }

        this.#outputElement.append(messageDiv);
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
        iframe.src = EVUIUnit.Constants.Path_TestRunner + "?" + EVUIUnit.Constants.QS_TestFile + "=" + encodeUriComponent(session.fileName);
        iframe.addEventListener("message", (args) =>
        {
            this.#handleIFrameMessage(session, args);
        });

        session.iframe = iframe;
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
        }
        else if (message.messageCode === EVUIUnit.Resources.MessageCodes.OutputMessagePush)
        {
            this.#setTimeout(session);
            this.#writeMessageOutput(session, message.message);
        }
        else if (message.messageCode === EVUIUnit.Resources.MessageCodes.TestComplete)
        {
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
            this.#finish(session);

        }, this.Timeout * 1000);
    };

    #finish(session)
    {
        this.#removeIFrame(session);
        session.completeCallback();
    }

    #writeMessageOutput(session, message)
    {
        console.log(message, session);
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
    }
};

EVUIUnit.Resources.TestHostServerArgs = class
{
    runOrder = [];
    criticalFails = [];
};