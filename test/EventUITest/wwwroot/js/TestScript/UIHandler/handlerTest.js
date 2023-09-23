$evui.init(function ()
{
    var top = $evui.dom("#top");
    top.on("click", function (event)
    {

    });


    $evui.uiHandler.onHandle = function (handlerArgs)
    {
        var composedPath = handlerArgs.eventArgs.composedPath();
        handlerArgs.eventArgs.stopPropagation();
    };

    $evui.addUIHandler("test", function (eventArgs)
    {
        eventArgs.cancel();
    });

    $evui.addUIHandler("test2", function (eventArgs)
    {
        alert("I wasn't prevented.");
    });
});