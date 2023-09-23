$evui.init(async function ()
{
    console.log("first");
});

$evui.init(async function ()
{
    await $evui.waitAsync(3000);
    console.log("second");
});

$evui.init(async function ()
{

    $evui.panes.addPane(
        {
            id: "test",
            loadSettings:
            {
                httpLoadArgs:
                {
                    url: "/Partials/Pane/Http.html"
                }
            },
            showSettings:
            {
                center: true
            }
        });

    await $evui.panes.loadPaneAsync("test")
    await $evui.panes.showPaneAsync("test")
    $evui.panes.hidePane("test", null, function ()
    {
        console.log("sync");
    });
    await $evui.panes.hidePaneAsync("test");
    await $evui.panes.unloadPaneAsync("test");
    $evui.panes.showPane("test", null, function ()
    {
        console.log("sync2")
    });
}).catch(function (ex)
{
    console.log(ex.stack);
});

$evui.init(function ()
{
    console.log("load1 start")
    $evui.panes.loadPane("test", null, function ()
    {
        console.log("load1 end")
    });

    console.log("show1 start")
    $evui.panes.showPane("test", null, function ()
    {
        console.log("show1 end")
    });

    console.log("load1 start")
    $evui.panes.loadPane("test", null, function ()
    {
        console.log("load1 end")
    });

    console.log("hide2 start")
    $evui.panes.hidePane("test", null, function ()
    {
        console.log("hide2 end")
    });

    console.log("unload2 start")
    $evui.panes.unloadPane("test", null, function ()
    {
        console.log("unload2 end")
    });

    console.log("load2 start")
    $evui.panes.loadPane("test", null, function ()
    {
        console.log("load2 end")
    });

    console.log("hide1 start")
    $evui.panes.hidePane("test", null, function ()
    {
        console.log("hide1 end")
    });

    console.log("show2 start")
    $evui.panes.showPane("test", null, function ()
    {
        console.log("show2 end")
    });

    console.log("show3 start")
    $evui.panes.showPane("test", null, function ()
    {
        console.log("show3 end")
    });

    console.log("show1 start")
    $evui.panes.showPane("test", null, function ()
    {
        console.log("show1 end")
    });

    console.log("unload1 start")
    $evui.panes.unloadPane("test", null, function ()
    {
        console.log("unload1 end")
    });

    console.log("hide4 start")
    $evui.panes.hidePane("test", null, function ()
    {
        console.log("hide4 end")
    });
});

$evui.init(function ()
{
    console.log("load1 start")
    $evui.panes.loadPane("test", null, function ()
    {
        console.log("load1 end")
    });

    console.log("show1 start")
    $evui.panes.showPane("test", null, function ()
    {
        console.log("show1 end")
    });
});