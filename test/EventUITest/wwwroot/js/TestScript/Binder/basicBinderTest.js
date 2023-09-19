$evui.init(async function ()
{
    var obj = { prop1: "a", prop2: "b" };
    var template = "<span>{{prop1}}</span><strong>{{prop2}}</strong>";

    var bindArgs = new EVUI.Modules.Binding.BindArgs();
    bindArgs.bindingSource = obj;
    bindArgs.bindingTarget = document.getElementById("bindSite");
    var now = Date.now();

    await $evui.bindAsync({
        
        htmlContent: template,
        onBound: function (args)
        {

        }
    }, bindArgs);

    console.log("#1 went:" + (Date.now() - now));
    now = Date.now();
    $evui.bind({
        source: obj,
        element: document.getElementById("bindSite"),
        htmlContent: template,
        onBind: function (args)
        {

            console.log(args);
        },
        onBound: function (args)
        {
            console.log("#2 went:" + (Date.now() - now));
        }
    }, function (binding)
    {
        console.log("#2" + binding);

    });

    console.log("#2 finished:" + (Date.now() - now));
});