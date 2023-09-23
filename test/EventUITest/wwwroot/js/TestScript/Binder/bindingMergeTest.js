$evui.init(function ()
{
    var binding = null;
    var mergeButton = document.getElementById("test");
    mergeButton.onclick = async function ()
    {
        //if (binding != null) binding.dispose();

        var source =
        {
            prop: "hades",
            prop2: "<br />"
        }

        var tempalte = "<span>{{prop}}</span>{{prop2}}";
        var ele = document.getElementById("insertion");

        if (binding == null)
        {
            binding = await $evui.bindAsync({ element: ele, htmlContent: tempalte, source: source });
        }
        else
        {
            source.prop = "hades";
            source.prop2 = "<br/>"
            binding.bindAsync(source);
        }

        await $evui.waitAsync(500);

        source.prop = "hendrix";
        source.prop2 = "<strong>is a lap cat</strong>";
        await binding.bindAsync();

        await $evui.waitAsync(500);
        source.prop = "<strong><h1>Test</h1></strong>";
        await binding.bindAsync();

        await $evui.waitAsync(500);
        source.prop = ""
        await binding.bindAsync();
    };

    var appendSource = [];
    var appendButton = document.getElementById("test2");
    appendButton.onclick = async function (args)
    {
        //if (binding != null && binding.source !== appendSource) binding.dispose();

        for (var x = 0; x < 200; x++)
        {
            appendSource.push({ prop: appendSource.length, prop2: "hades<br/>" });
        }

        if (binding == null)
        {
            var tempalte = "<span>{{prop}}</span>{{prop2}}";
            var ele = document.getElementById("insertion");
            binding = await $evui.bindAsync({ element: ele, htmlContent: tempalte, source: appendSource });
        }
        else
        {
            //await binding.bindAsync(appendSource);
            binding.source = appendSource;
            await binding.updateAsync();
        }
    };
});