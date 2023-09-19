$evui.init(async function ()
{
    var makeData = function (numRows)
    {
        var guid = $evui.guid();
        var data = [];
        for (var x = 0; x < numRows; x++)
        {
            data.push({ index: x, label: "hades " + guid});
        }

        return data;
    }

    var htmlContent = "<div><label>{{index}}</label><strong>{{label}}</strong></div>";
    $evui.binder.addBindingTemplate({
        templateName: "test",
        htmlContent: htmlContent,        
        onBind: function (bindArgs)
        {
            if (bindArgs.binding.parentBinding != null && bindArgs.binding.source.index > 33 && bindArgs.binding.source.index < 67)
            {
                bindArgs.pause();
                setTimeout(function ()
                {
                    bindArgs.binding.source.label += " LATE";
                    bindArgs.resume();
                }, 100);
            }
        }
    });

    var binding = null;
    var run = async function ()
    {
        var data = makeData(100);
        if (binding == null)
        {
            binding = await $evui.bindAsync({
                templateName: "test",
                source: data,
                element: document.getElementById("insertion"),
                insertionMode: EVUI.Modules.Binding.BindingInsertionMode.Append
            });
        }
        else
        {
            binding.source = data;
            await binding.updateAsync();
        }
    };

    var button = document.getElementById("go");
    button.onclick = run;

});