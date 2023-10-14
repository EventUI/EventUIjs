/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

EVUIUnit.Resources.TestStatusUpdate = class
{
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

    message = null;
    level = EVUIUnit.Resources.LogLevel.None;
};

EVUIUnit.Resources.LogLevel =
{
    None: "none",
    Trace: "trace",
    Debug: "debug",
    Info: "info",
    Warn: "warn",
    Error: "error",
    Critial: "critical"
};