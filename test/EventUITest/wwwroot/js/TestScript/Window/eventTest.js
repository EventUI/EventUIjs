$evui.init(async function ()
{
    $evui.css({
        selector: ".testDiv",
        rules: "background-color:blue; height: 50px; width: 50px;"
    });

    var dd = document.createElement("div");
    dd.classList.add("testDiv");

    console.log("WINDOWS")

    var timedEvent = function (args)
    {
        console.log(args.key + " : " + (Date.now() - args.context));
    }

    $evui.panes.onHide = timedEvent;
    $evui.panes.onHidden = timedEvent;
    $evui.panes.onInitialize = timedEvent;
    $evui.panes.onLoad = timedEvent;
    $evui.panes.onLoaded = timedEvent;
    $evui.panes.onPosition = timedEvent;
    $evui.panes.onShow = timedEvent;
    $evui.panes.onShown = timedEvent;
    $evui.panes.onUnload = timedEvent;
    $evui.panes.onUnloaded = timedEvent;

    var now = Date.now();

    $evui.addPane({
        id: "test",
        loadSettings:
        {
            element: dd
        },
        showSettings:
        {
            center: true
        },
        onHidden: timedEvent,
        onHide: timedEvent,
        onInitialize: timedEvent,
        onLoad: timedEvent,
        onLoaded: timedEvent,
        onPosition: timedEvent,
        onShow: timedEvent,
        onShown: timedEvent,
        onUnload: timedEvent,
        onUnloaded: timedEvent,
        unloadOnHide: true,
    });

    console.log("Adding: " + (Date.now() - now));
    now = Date.now()

    await $evui.showPaneAsync("test", {
        context: now
    });

    console.log("Showed: " + (Date.now() - now));
    now = Date.now();

    await $evui.hidePaneAsync("test", { context: now });

    console.log("Hidden: " + (Date.now() - now));

    $evui.dropdowns.onHide = timedEvent;
    $evui.dropdowns.onHidden = timedEvent;
    $evui.dropdowns.onInitialize = timedEvent;
    $evui.dropdowns.onLoad = timedEvent;
    $evui.dropdowns.onLoaded = timedEvent;
    $evui.dropdowns.onPosition = timedEvent;
    $evui.dropdowns.onShow = timedEvent;
    $evui.dropdowns.onShown = timedEvent;
    $evui.dropdowns.onUnload = timedEvent;
    $evui.dropdowns.onUnloaded = timedEvent;

    console.log("DROPDOWNS")

    var now = Date.now();

    $evui.addDropdown({
        id: "test",
        loadSettings:
        {
            element: dd
        },
        showSettings:
        {
            x: 500,
            y: 500
        },
        onHidden: timedEvent,
        onHide: timedEvent,
        onInitialize: timedEvent,
        onLoad: timedEvent,
        onLoaded: timedEvent,
        onPosition: timedEvent,
        onShow: timedEvent,
        onShown: timedEvent,
        onUnload: timedEvent,
        onUnloaded: timedEvent,
        unloadOnHide: true,
    });

    console.log("Adding: " + (Date.now() - now));
    now = Date.now()

    await $evui.showDropdownAsync("test", {
        context: now
    });

    console.log("Showed: " + (Date.now() - now));
    now = Date.now();

    await $evui.hideDropdownAsync("test", { context: now });

    console.log("Hidden: " + (Date.now() - now));
});