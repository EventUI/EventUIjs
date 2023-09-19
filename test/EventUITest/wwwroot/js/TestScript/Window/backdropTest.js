$evui.init(async function ()
{
    var div = document.createElement("div");
    div.style.height = "200px";
    div.style.width = "200px";
    div.style.backgroundColor = "blue";
    div.setAttribute(EVUI.Modules.Panes.Constants.Attribute_Drag, "");

    var div2 = document.createElement("div");
    div2.style.height = "300px";
    div2.style.width = "300px";
    div2.style.background = "orange";
    div2.setAttribute(EVUI.Modules.Panes.Constants.Attribute_Drag, "");

    //$evui.css("@keyframes color-me-in { 0% { background: black; } 50% { background: orange; opacity: 50%} 100% { background: green; opacity: 0% }}");

    var style = document.createElement("style");
    style.innerHTML = "@keyframes color-me-in { 0% { background: black; } 50% { background: orange; opacity: 50%} 100% { background: green; opacity: 0% }}";
    //document.head.appendChild(style);

    await $evui.showPaneAsync({
        id: "test",
        loadSettings:
        {
            element: div
        },
        showSettings:
        {
            center: true,
            backdropSettings:
            {
                showBackdrop: true,
                backdropHideTransition:
                {
                    css: "animation: color-me-in 2s",
                    keyframes: "@keyframes color-me-in { 0% { background: black; } 100% { background: green; opacity: 0% }}",
                    duration: 2000
                },
                backdropShowTransition:
                {
                    css: "animation: color-me-in 2s",
                    keyframes: "@keyframes color-me-in { 0% { background: black; opacity:0% } 50% { background: red; opacity: 37.5%} 100% { background: blue; opacity: 75%% }}",
                    duration: 2000
                }
            }
        }
    });

    await $evui.showPaneAsync({
        id: "test2",
        loadSettings:
        {
            element: div2
        },
        showSettings:
        {
            absolutePosition:
            {
                top: 500,
                left: 500
            },
            backdropSettings:
            {
                showBackdrop: true,
                backdropHideTransition:
                {
                    css: { backgroundColor: "orange" },
                    duration: 1000
                },
                backdropShowTransition:
                {
                    css: { backgroundColor: "magenta" },
                    duration: 2000
                }
            }
        }
    });

    await $evui.waitAsync(2000);

    await $evui.hidePaneAsync("test2");
    await $evui.waitAsync(2000);

    $evui.hidePane("test");
});