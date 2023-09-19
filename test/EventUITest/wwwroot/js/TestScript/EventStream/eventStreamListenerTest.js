const { Promise } = require("core-js");

$evui.init(function ()
{
    var es = $evui.eventStream();
    es.addStep({
        key: "a",
        type: "event",
        handler: function (eventArgs)
        {
            $evui.log("I am event a.");
        }
    });

    es.addStep({
        key: "b",
        type: "event",
        handler: function (eventArgs)
        {
            $evui.log("I am event b.");
        }
    });

    var bubbler = new EVUI.Modules.EventStream.BubblingEventManager();

    bubbler.addEventListener("a", function (eventArgs)
    {
        $evui.log('I am a bubbled event for event a.');
    });

    bubbler.addEventListener("a", function (eventArgs)
    {
        $evui.log('I am a bubbled event #2 for event a.');
    });

    bubbler.addEventListener("b", function (eventArgs)
    {
        $evui.log('I am a bubbled event for event b.');
    });

    bubbler.addEventListener("b", function (eventArgs)
    {
        $evui.log('I am a bubbled event #2 for event b.');
    });

    es.bubblingEvents = bubbler;
    es.execute();
});