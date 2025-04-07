$evui.testAsync({
    name: "BubblingEventManager Test",
    test: async function (testHostArgs)
    {
        var eventingComponent = new EventStreamTest.EventingComponent();
        eventingComponent.firstEvent = async function (eventArgs)
        {
            await $evui.waitAsync(50);
            eventArgs.state.sequence.push("first");
        };

        eventingComponent.secondEvent = async function (eventArgs)
        {
            eventArgs.pause();
            setTimeout(function ()
            {
                eventArgs.state.sequence.push("second");
                eventArgs.resume();
            });
        };

        eventingComponent.primaryBubbler.addEventListener("first", function (eventArgs)
        {
            eventArgs.state.sequence.push("primary-first-1");
        });

        eventingComponent.primaryBubbler.addEventListener("first", function (eventArgs)
        {
            eventArgs.state.sequence.push("primary-first-2");
        });

        eventingComponent.secondaryBubbler.addEventListener("first", function (eventArgs)
        {
            eventArgs.state.sequence.push("secondary-first-1");
        });

        eventingComponent.secondaryBubbler.addEventListener("first", function (eventArgs)
        {
            eventArgs.state.sequence.push("secondary-first-2");
        });

        eventingComponent.primaryBubbler.addEventListener("second", function (eventArgs)
        {
            eventArgs.state.sequence.push("primary-second-1");
        });

        eventingComponent.primaryBubbler.addEventListener("second", function (eventArgs)
        {
            eventArgs.state.sequence.push("primary-second-2");
        });

        eventingComponent.secondaryBubbler.addEventListener("second", function (eventArgs)
        {
            eventArgs.state.sequence.push("secondary-second-1");
        });

        eventingComponent.secondaryBubbler.addEventListener("second", function (eventArgs)
        {
            eventArgs.state.sequence.push("secondary-second-2");
        });

        var finalSequence = [
            "job1",
            "first",
            "primary-first-1",
            "primary-first-2",
            "secondary-first-1",
            "secondary-first-2",
            "job2",
            "second",
            "primary-second-1",
            "primary-second-2",
            "secondary-second-1",
            "secondary-second-2",
        ];

        var context = new EventStreamTest.EventContext();
        await eventingComponent.executeAsync(context);

        $evui.assert(finalSequence).isEquivalentTo(context.sequence);
    }
})