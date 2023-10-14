/**Copyright (c) 2023 Richard H Stannard
 
This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

EVUIUnit.Controllers.TestRunner = class
{
    get #isChildWindow()  { return window.parent != null; }
    
    #runnerArgs = null;
    #testRunning = false;
    #initialized = false;
    #functionName = null;

    testCodeWrapper = null;

    initialize(testRunnerArgs, testHost)
    {
        if (testRunnerArgs == null || typeof testRunnerArgs !== "object") throw Error("Object expected.");
        if (this.#initialized === true) throw Error("Already initialized.");

        this.#initialized = true;
        this.#runnerArgs = this.#cloneRunnerArgs(testRunnerArgs);
        this.#functionName = "INJECTED_CODE_" + (Math.random() * 10000).toString(36).replace(".", "").toUpperCase();
    }

    writeOutput(ouput, outputLevel)
    {
        if (typeof output !== "string") throw Error("String expected.");

        if (typeof outputLevel !== "string") outputLevel = EVUIUnit.Resources.LogLevel.Info;
        if (outputLevel === EVUIUnit.Resources.LogLevel.None) return;

        if (this.#isChildWindow === false)
        {
            return console.log(`${outputLevel.toUpperCase()}: ${output}`);
        }

        var pushMessage = new EVUIUnit.Resources.OuputMessagePush();
        pushMessage.level = outputLevel;
        pushMessage.message = ouput;

        window.parent.postMessage(pushMessage);
    }

    #getOutputLevel(outputMessage)
    {
        var succeeded
    }

    async run()
    {

    }

    async #getScriptText()
    {
        var url = this.#runnerArgs?.testFilePath;
        if (typeof url !== "string") throw Error("No testFilePath to pull test code from.");

        var qsExtension = url.indexOf("?") !== -1 ? "&" : "?";
        url += qsExtension + "rand=" + (Math.random() * 10000).toString(36);

        var response = await fetch({
            url: url,
            method: "GET"
        });

        var responseText = await response.text();
        if (typeof responseText !== "string" || responseTest.trim().length === 0) throw Error("No code found for test file " + this.#runnerArgs.testFilePath);

        var finalScript = `var ${functionName} = async function() {${responseText}};`

        return finalScript;
    };

    #injectScript(scriptText)
    {
        var errorHandler = (errorArgs) =>
        {
            this.writeOutput("CODE INJECTION PARSE ERROR:" + errorArgs.error.stack, EVUIUnit.Resources.LogLevel.Critial);
        };

        window.addEventListener("error", errorHandler);

        var scriptTag = document.createElement("script");
        scriptTag.innerText = scriptText;

        document.body.append(scriptTag);

        window.removeEventListener("error", errorHandler);
    }

    #cloneRunnerArgs(serverArgs)
    {
        var newArgs = new EVUIUnit.Resources.TestRunnerServerArgs();
        newArgs.testFilePath = serverArgs.testFilePath;

        return newArgs;
    }
}

EVUIUnit.Resources.TestRunnerServerArgs = class
{
    testFilePath = null;
};