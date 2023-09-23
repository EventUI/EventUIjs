$evui.init(function ()
{
    var div = document.createElement("div");
    var outerDiv = document.createElement("div");

    document.body.append(outerDiv);
    outerDiv.append(div);

    div.addAsyncEventListener("click", async function (eventArgs)
    {
        await $evui.waitAsync(700);
        $evui.log(eventArgs.eventSequenceId + " - Async-Inner-One");
    });

    div.addAsyncEventListener("click", async function (eventArgs)
    {
        await $evui.waitAsync(400);
        $evui.log(eventArgs.eventSequenceId + " - Async-Inner-Two");
    });

    outerDiv.addAsyncEventListener("click", async function (eventArgs)
    {
        await $evui.waitAsync(300);
        $evui.log(eventArgs.eventSequenceId + " - Async-Outer-One");
    });

    outerDiv.addAsyncEventListener("click", async function (eventArgs)
    {
        await $evui.waitAsync(500);
        $evui.log(eventArgs.eventSequenceId + " - Async-Outer-Two");
    });

    addAsyncEventListener("click", async function (eventArgs)
    {
        await $evui.waitAsync(550);
        $evui.log(eventArgs.eventSequenceId + " - Async-Window-One");
    });

    addAsyncEventListener("click", async function (eventArgs)
    {
        await $evui.waitAsync(500);
        $evui.log(eventArgs.eventSequenceId + " - Async-Window-Two");
    });

    //div.addEventListener("click", async function (eventArgs)
    //{
    //    await $evui.waitAsync(700);
    //    $evui.log("Sync-Inner-One");
    //});

    //div.addEventListener("click", async function (eventArgs)
    //{
    //    await $evui.waitAsync(400);
    //    $evui.log("Sync-Inner-Two");
    //});

    //outerDiv.addEventListener("click", async function (eventArgs)
    //{
    //    await $evui.waitAsync(300);
    //    $evui.log("Sync-Outer-One");
    //});

    //outerDiv.addEventListener("click", async function (eventArgs)
    //{
    //    await $evui.waitAsync(500);
    //    $evui.log("Sync-Outer-Two");
    //});

    //window.addEventListener("click", async function (eventArgs)
    //{
    //    await $evui.waitAsync(550);
    //    $evui.log("Sync-Window-One");
    //});

    //window.addEventListener("click", async function (eventArgs)
    //{
    //    await $evui.waitAsync(500);
    //    $evui.log("Sync-Window-Two");
    //});

    div.click();
    div.click();
});