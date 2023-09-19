$evui.init(function ()
{
    var target = { one: 1, two: 2, three: 3, four: 4, five: 5 };
    var iterations = 10000;
    var keys = function (obj)
    {
        return Object.keys(obj);
    };

    var forIn = function (obj)
    {
        var props = [];
        for (var prop in obj)
        {
            props.push(prop);
        }

        return props;
    };

    var cache = function (obj)
    {
        return EVUI.Modules.Core.Utils.getProperties(obj);
    };


    $evui.log(keys(target));
    $evui.log(forIn(target));
    $evui.log(cache(target));

    var now = Date.now();
    for (var x = 0; x < iterations; x++)
    {
        keys(target);
    }

    var elapsed = Date.now() - now;
    $evui.log("Keys Elapsed: " + elapsed);

    var now = Date.now();
    for (var x = 0; x < iterations; x++)
    {
        forIn(target);
    }

    var elapsed = Date.now() - now;
    $evui.log("For...in Elapsed: " + elapsed);

    var now = Date.now();
    for (var x = 0; x < iterations; x++)
    {
        cache(target);
    }

    var elapsed = Date.now() - now;
    $evui.log("Cache (None) Elapsed: " + elapsed);

    var now = Date.now();

    EVUI.Modules.Core.Utils.cacheProperties(target, forIn(target));
    for (var x = 0; x < iterations; x++)
    {
        cache(target);
    }
    EVUI.Modules.Core.Utils.uncacheProperties(target);
    var elapsed = Date.now() - now;

    $evui.log("Cache (Populated) Elapsed: " + elapsed);
});