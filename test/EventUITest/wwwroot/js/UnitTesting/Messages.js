/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

EVUIUnit.Resources.TestStatusUpdate = class
{
    /**A special code on every message sent to the UnitTestHost that tells it which message it has recieved.
    @type {String}*/
    messageCode = EVUIUnit.Resources.MessageCodes.None;
};

EVUIUnit.Resources.MessageCodes =
{
    None: "none",
    TestReady: "evui.unit.test.ready",
    OutputMessagePush: "evui.unit.output.push",
    TestComplete: "evui.unit.test.completed"
};

EVUIUnit.Resources.OuputMessagePush = class extends EVUIUnit.Resources.TestStatusUpdate
{
    constructor()
    {
        super();
        this.messageCode = EVUIUnit.Resources.MessageCodes.OutputMessagePush
    }

    /**A OutputWriterMessage sent by the UnitTestRunner
    @type {EVUITest.OutputWiterMessage}*/
    message = null;
};