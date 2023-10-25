/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

/**Class for carrying a message from a UnitTestRunner to a UnitTestHost.
@class*/
EVUIUnit.TestStatusUpdate = class
{
    /**A special code on every message sent to the UnitTestHost that tells it which message it has recieved.
    @type {String}*/
    messageCode = EVUIUnit.MessageCodes.None;

    /**The ID of the test session being run.
    @type {String}*/
    testSessionId = null;
};

/**The message "codes" that are used to communicate to the recipient of a message which message it has just received.*/
EVUIUnit.MessageCodes =
{
    /**Default. */
    None: "none",

    /**Message indicates that a test file is ready for execution.*/
    TestReady: "evui.unit.test.ready",

    /**Indicates that the message is a OutputPushMessage.*/
    OutputPushMessage: "evui.unit.output.push",

    /**Message indicates that the message is a TestCompleteMessage.*/
    TestComplete: "evui.unit.test.completed"
};

/**Message that contains a OutputWriterMessage carrying output from a TestHostController's test.
@class */
EVUIUnit.OuputPushMessage = class extends EVUIUnit.TestStatusUpdate
{
    constructor()
    {
        super();
        this.messageCode = EVUIUnit.MessageCodes.OutputPushMessage
    }

    /**A OutputWriterMessage sent by the UnitTestRunner
    @type {EVUITest.OutputWiterMessage}*/
    message = null;
};

/**Message that signals a test's completion. Contains an array of TestResults representing all tests run by the TestHostController.
@class*/
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