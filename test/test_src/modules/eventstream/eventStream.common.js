const EventStreamTest = {};

EventStreamTest.EventingComponent = function ()
{
    var _self = this;
    var _executing = false;


    this.primaryBubbler = new EVUI.Modules.EventStream.BubblingEventManager();
    this.secondaryBubbler = new EVUI.Modules.EventStream.BubblingEventManager();

    this.executeAsync = function (context)
    {
        if (_executing === true) throw Error("EventStream executing.");
        _executing = true;

        var es = buildEventStream(context);
        return es.executeAsync();
    }

    this.firstEvent = function (eventArgs)
    {

    };

    this.secondEvent = function (eventArgs)
    {

    };

    var buildEventStream = function (context)
    {
        var es = new EVUI.Modules.EventStream.EventStream();
        es.bubblingEvents = [_self.primaryBubbler, _self.secondaryBubbler];
        es.context = _self;
        es.eventState = context;
        es.getPromiseResolutionValue = function ()
        {
            return true;
        };

        es.onComplete = function ()
        {
            _executing = false;
        };

        es.addJob("job1", function (jobArgs)
        {
            job1(jobArgs);

            jobArgs.resolve();
        });

        es.addEvent("first", function (eventArgs)
        {
            if (typeof this.firstEvent === "function")
            {
                return this.firstEvent(eventArgs);
            }
        });

        es.addJob("job2", function (jobArgs)
        {
            job2(jobArgs);            
            jobArgs.resolve();
        });

        es.addEvent("second", function (eventArgs)
        {
            if (typeof this.secondEvent === "function")
            {
                return this.secondEvent(eventArgs);
            }
        });

        return es;
    };

    var job1 = function (jobArgs)
    {
        if ($evui.isObject(jobArgs.eventStream.eventState) === true) jobArgs.eventStream.eventState.sequence.push("job1");
        $evui.log("Job1 Firing");
    };

    var job2 = function (jobArgs)
    {
        if ($evui.isObject(jobArgs.eventStream.eventState) === true) jobArgs.eventStream.eventState.sequence.push("job2");
        $evui.log("Job2 Firing");
    };
};

EventStreamTest.EventContext = function ()
{
    this.sequence = [];
};