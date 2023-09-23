$evui.init(function ()
{
    var div = document.createElement("div");
    var outerDiv = document.createElement("div");

    document.body.append(outerDiv);
    document.body.append(div);


    div.onclick = function (eventArgs)
    {
        $evui.log("Inner Div");
        $evui.log(eventArgs.composedPath());
        outerDiv.append(div);
    };

    outerDiv.onclick = function ()
    {
        $evui.log("Outer Div");
    };

    document.onclick = function ()
    {
        $evui.log("doc");
    };

    div.click();
});