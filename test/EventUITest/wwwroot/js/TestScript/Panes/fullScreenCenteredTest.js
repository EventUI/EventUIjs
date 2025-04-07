$evui.init(function ()
{

    var win = document.getElementById("win");

    var ref = $evui.panes.addPane({
        id: "test",
        element: win,
        autoHideSettings: {
            autoHideKeys: ["Escape"]
        }
    });

    var showFullscreen = function (args)
    {
        if (args.ctrlKey === true)
        {
            $evui.panes.showPane("test", {
                fullscreen: true,
                clipSettings:
                {
                    clipBounds:
                    {
                        top: 0,
                        left: 0,
                        right: 1000,
                        bottom: 800
                    },
                    mode: "shift",
                },
            });
        }
        else
        {
            $evui.panes.showPane("test", {
                fullscreen: true,                
            });
        }
    };

    var showCentered = function ()
    {
        $evui.panes.showPane("test", {
            center: true,            
        });
    };

    document.getElementById("fullscreen").onclick = showFullscreen;
    document.getElementById("center").onclick = showCentered;
});
