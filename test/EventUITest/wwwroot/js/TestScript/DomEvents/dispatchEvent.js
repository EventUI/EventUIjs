$evui.init(async function ()
{
    var div = document.createElement("div");
    var outerDiv = document.createElement("div");

    document.body.append(outerDiv);
    outerDiv.append(div);


    div.addAsyncEventListener("click", async function (eventArgs)
    {
        $evui.log("Inner Div");
        $evui.log(eventArgs);
    });

    outerDiv.addAsyncEventListener("click", function (eventArgs)
    {
        $evui.log("Outer Div");
    });

    document.addAsyncEventListener("click", function (eventArgs)
    {
        $evui.log("doc");
    });

    var event = new Event("click", { bubbles: true });
    await div.dispatchAsyncEvent(event);

    $evui.log("dispatched with bubbles");


    var event = new Event("click");
    await div.dispatchAsyncEvent(event);

    $evui.log("dispatched without bubbles");
});