/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

EVUIUnit.TestStatusUpdate = class
{
    /**A special code on every message sent to the UnitTestHost that tells it which message it has recieved.
    @type {String}*/
    messageCode = EVUIUnit.MessageCodes.None;
};

EVUIUnit.MessageCodes =
{
    None: "none",
    TestReady: "evui.unit.test.ready",
    OutputMessagePush: "evui.unit.output.push",
    TestComplete: "evui.unit.test.completed"
};

EVUIUnit.OuputMessagePush = class extends EVUIUnit.TestStatusUpdate
{
    constructor()
    {
        super();
        this.messageCode = EVUIUnit.MessageCodes.OutputMessagePush
    }

    /**A OutputWriterMessage sent by the UnitTestRunner
    @type {EVUITest.OutputWiterMessage}*/
    message = null;
};

EVUIUnit.TestCompleteMessage = class extends EVUIUnit.TestStatusUpdate
{
    constructor()
    {
        super();
        this.messageCode = EVUIUnit.MessageCodes.TestComplete;
    }

    /**An array of TestResult indicating the results of all the tests that were run by the UnitTestRunner.
    @type {EVUITest.TestResult[]}*/
    testResults = [];
}