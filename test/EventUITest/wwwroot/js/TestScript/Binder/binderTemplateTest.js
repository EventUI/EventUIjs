$evui.init(function ()
{
    $evui.addBindingHtmlContent({
        key: "hades",
        content: "<span><strong>{{prop1}}</strong>{{prop2}}<strong>{{prop3}}</strong>{{prop4}}<strong>{{prop5}}</strong>{{prop6}}<strong>{{prop7}}</strong>{{prop8}}</span>"
    });

    $evui.addBindingHtmlContent({
        key: "hadesRemote",
        url: "/Partials/Binder/Simple.html"
    });

    $evui.addBindingTemplate({
        templateName: "test1",
        htmlContent: "hades",
        onBind: function (args)
        {
            args.context.now = Date.now();
            console.log(args.binding.id + " onBind")
        },
        onSetHtmlContent: function (args)
        {
            console.log(args.binding.id + " onSetHtmlContent " + (Date.now() - args.context.now));
        },
        onSetBindings: function (args)
        {
            console.log(args.binding.id + " onSetBindings " + (Date.now() - args.context.now));
        },
        onBindTemplate: function (args)
        {
            console.log(args.binding.id + " onBindTemplate " + (Date.now() - args.context.now));
        },
        onBindChildren: function (args)
        {
            console.log(args.binding.id + " onBindChildren " + (Date.now() - args.context.now));
        },
        onBound: function (args)
        {
            console.log(args.binding.id + " onBound " + (Date.now() - args.context.now));
        },
        options: { asdf: 123 }
    });

    //var start = Date.now();

    //var numFinished = 0;
    //var commonCallback = function ()
    //{
    //    numFinished++;
    //    if (numFinished === 4)
    //    {
    //        console.log("All done: " + (Date.now() - start));
    //    }
    //};

    //$evui.bind("test1", {
    //    bindingTarget: document.getElementById("binding1"),
    //    bindingSource: { prop1: "123", prop2: "456" }
    //}, commonCallback);

    //$evui.bind({
    //    templateName: "test1",
    //    source: { prop1: "abc", prop2: "def" },
    //    element: document.getElementById("binding2"),
    //    htmlContent: "hades"
    //}, commonCallback);

    //$evui.bind({
    //    templateName: "test1",
    //    htmlContent: "hades",
    //    element: document.getElementById("binding3")
    //}, { prop1: "Hades", prop2: "Cat" }, commonCallback);

    //$evui.bind({
    //    bindingSource: { prop1: "The ", prop2: " Simpsons" },
    //    bindingTarget: document.getElementById("binding4"),
    //    templateName: "test1"
    //}, commonCallback);
});

//$evui.init(async function ()
//{
//    var now = Date.now();
//    var ele = document.getElementById("binding4")
//    var binding = null;
//    for (var x = 0; x < 1000; x++)
//    {
//        binding = await $evui.bindAsync({ element: ele, source: { prop1: x, prop2: "<br>" }, htmlContent: "hades" });
//    }

//    console.log("Top level " + (Date.now() - now));
//});

$evui.init(async function ()
{
    /*    await $evui.waitAsync(1000);*/

    var button1 = document.getElementById("test");

    var makeOptions = function ()
    {
        var options = new EVUI.Modules.Binding.BindOptions();
        options.suppressChildEvents = document.getElementById("noChildEvents").checked;
        options.ignoreRaceConditions = document.getElementById("noRace").checked;

        return options;
    };

    button1.onclick = async function ()
    {
        var ele = document.getElementById("binding4");
        ele.innerHTML = "";

        var source = [];

        for (var x = 0; x < 1000; x++)
        {
            source.push({
                prop1: x,
                prop2: "\"",
                prop3: "hades",
                prop4: ".*",
                prop5: "isHungry",
                prop6: x * 2,
                prop7: "meow",
                prop8: "<br>"
            });
        }

        var binding = await $evui.bindAsync({ element: ele, source: source, htmlContent: "hades", options: makeOptions() });
        var childBindings = binding.getChildBindings();
        var runs = [];
        for (var x = 0; x < 12; x++)
        {
            var now = Date.now();
            var guid = $evui.guid();
            var tasks = []
            for (var y = 0; y < 1000; y++)
            {
                if (y % 10 === 0)
                {
                    source[y].prop1 = "CHANGED " + guid;
                    tasks.push(childBindings[y].updateAsync());
                }
            }

            await Promise.all(tasks);

            //await binding.bindAsync()
            var elapsed = Date.now() - now;
            runs.push(elapsed);

            console.log("Array " + (elapsed));
        }

        var sum = 0;
        runs.sort(function (a, b) { return b - a });
        for (var x = 2; x < 12; x++)
        {
            sum += runs[x];
        }

        console.log("Modify Content Average: " + (sum / 10));
    };

    var button2 = document.getElementById("test2");

    button2.onclick = async function ()
    {
        var ele = document.getElementById("binding4");
        ele.innerHTML = "";

        var source = [];

        for (var x = 0; x < 1000; x++)
        {
            source.push({
                prop1: x,
                prop2: "\"",
                prop3: "hades",
                prop4: ".*",
                prop5: "isHungry",
                prop6: x * 2,
                prop7: "meow",
                prop8: "<br>"
            });
        }

        var runs = [];

        for (var x = 0; x < 12; x++)
        {
            var now = Date.now();
            var binding = await $evui.bindAsync({ element: ele, source: source, htmlContent: "hades", options: makeOptions()});
            var elapsed = Date.now() - now;
            runs.push(elapsed);

            if (x !== 11)
            {
                now = Date.now();
                binding.dispose()
                console.log("Dispose: " + (Date.now() - now));
            }

            console.log("Array " + (elapsed));
        }

        var sum = 0;
        runs.sort(function (a, b) { return b - a });
        for (var x = 2; x < 12; x++)
        {
            sum += runs[x];
        }

        console.log("DomParser Average: " + (sum / 10));
    };

    var finalBinding = null;
    var button3 = document.getElementById("test3");
    button3.onclick = async function ()
    {
        var ele = document.getElementById("binding4");
        ele.innerHTML = "";
        var runs = [];

        for (var x = 0; x < 12; x++)
        {
            var source = [];

            for (var y = 0; y < 10000; y++)
            {
                source.push({
                    prop1: y,
                    prop2: "\"",
                    prop3: "hades",
                    prop4: ".*",
                    prop5: "isHungry",
                    prop6: x * 2,
                    prop7: "meow",
                    prop8: "<br>"
                });
            }

            var now = Date.now();
            var binding = await $evui.bindAsync({ element: ele, source: source, htmlContent: "hades", options: makeOptions() });
            var elapsed = Date.now() - now;
            runs.push(elapsed);

            for (var y = 0; y < 100; y++)
            {
                source.push({
                    prop1: y + 10000,
                    prop2: "\"",
                    prop3: "hades",
                    prop4: ".*",
                    prop5: "isHungry",
                    prop6: (y + 10000) * 2,
                    prop7: "meow",
                    prop8: "<br>"
                });
            }

            var now = Date.now();
            await binding.updateAsync()
            console.log("Append " + (Date.now() - now));

            if (x !== 11)
            {
                now = Date.now();
                binding.dispose()
                finalBinding = binding;
                console.log("Dispose: " + (Date.now() - now));
            }

            console.log("Array " + (elapsed));
        }

        var sum = 0;
        runs.sort(function (a, b) { return b - a });
        for (var x = 2; x < 12; x++)
        {
            sum += runs[x];
        }

        console.log("DomParser Average: " + (sum / 10));
    }

    var button4 = document.getElementById("test4");

    button4.onclick = async function ()
    {
        var ele = document.getElementById("binding4");
        ele.innerHTML = "";

        var source = [];

        for (var x = 0; x < 1000; x++)
        {
            source.push({
                prop1: x,
                prop2: "\"",
                prop3: "hades",
                prop4: ".*",
                prop5: "isHungry",
                prop6: x * 2,
                prop7: "meow",
                prop8: "<br>"
            });
        }

        var binding = await $evui.bindAsync({ element: ele, source: source, htmlContent: "hades", options: makeOptions() });

        var runs = [];
        for (var x = 0; x < 12; x++)
        {
            var now = Date.now();
            var guid = $evui.guid();
            for (var y = 0; y < 1000; y++)
            {
                if (y % 10 === 0)
                {
                    source[y].prop1 = "CHANGED " + guid;                   
                }
            }

            await binding.updateAsync()
            var elapsed = Date.now() - now;
            runs.push(elapsed);

            console.log("Array " + (elapsed));
        }

        var sum = 0;
        runs.sort(function (a, b) { return b - a });
        for (var x = 2; x < 12; x++)
        {
            sum += runs[x];
        }

        console.log("Modify Content Average: " + (sum / 10));
    };
});