$evui.init(function ()
{
    var div = document.createElement("div");
    var outerDiv = document.createElement("div");

    document.body.append(outerDiv);
    document.body.append(div);

    var added = false;
    var add = function ()
    {
        $evui.log("Added at runtime.");
    }
        outerDiv.append(div);
    div.onclick = function (eventArgs)
    {
        $evui.log("Inner Div");

        eventArgs.abc = $evui.guid();

        outerDiv.addEventListener("click", function ()
        {
            console.log("Added at runtime.")
        });
    };

    outerDiv.onclick = function (eventArgs)
    {
        $evui.log("Outer Div");
        $evui.log(eventArgs.abc);
    };

    document.onclick = function (eventArgs)
    {
        $evui.log("doc");
        $evui.log(eventArgs.abc);
    };

    div.click(); 

    document.onmousemove = function (eventArgs)
    {
        eventArgs.abc = $evui.guid();
        $evui.log(eventArgs.abc)
    };

    window.onmousemove = function (eventArgs)
    {
        $evui.log(eventArgs.abc)
    };
});