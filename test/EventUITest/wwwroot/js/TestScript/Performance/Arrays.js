$evui.init(function ()
{
    var testIterations = 10;
    var numAdds = 100000;
    var pushArr = [];
    var ctrArr = [];
    
    var testPush = function ()
    {
        var now = Date.now();

        pushArr.splice(0, numAdds);
        for (var x = 0; x < numAdds; x++)
        {
            pushArr.push(x);
        }

        var elapsed = Date.now() - now;
        console.log("Push: " + elapsed);

        return elapsed;
    };

    var testCtr = function ()
    {
        var now = Date.now();
        var ctr = 0;

        ctrArr.splice(0, numAdds);
        for (var x = 0; x < numAdds; x++)
        {
            ctrArr[ctr++] = x;
        }

        var elapsed = Date.now() - now;
        console.log("Assign: " + elapsed);

        return elapsed;
    };

    var pushSum = 0;
    window.setTimeout(function ()
    {
        for (var x = 0; x < testIterations; x++)
        {
            pushSum += testPush();
        }

        console.log("Push avg: " + (pushSum / testIterations))
    }, 10);

    var ctrSum = 0;
    window.setTimeout(function ()
    {
        for (var x = 0; x < testIterations; x++)
        {
            ctrSum += testCtr();
        }

        console.log("Ctr avg: " + (ctrSum / testIterations))
    }, 100);



});