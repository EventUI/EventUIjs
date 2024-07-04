$evui.init(function ()
{

    var win = document.getElementById("win");
    var bounds = document.getElementById("bounds");

    var ref = $evui.panes.addPane({
        id: "test",
        element: win
    });

    var showFullscreen = function (clip)
    {
        if (clip === true)
        {
            $evui.panes.showPane("test", {
                showSettings: {
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
                    }
                }
            });
        }
        else
        {
            $evui.panes.showPane("test", {
                showSettings:
                {
                    fullscreen: true,
                }
            });
        }

    };

    var showCentered = function ()
    {
        $evui.panes.showPane("test", {
            showSettings:
            {
                center: true,
            }
        });
    };

    document.addEventListener("keydown", function (args)
    {
        if (args.key === "Enter")
        {
            if (args.shiftKey === true)
            {
                showCentered()
            }
            else
            {
                if (args.ctrlKey === true)
                {
                    showFullscreen(true);
                }
                else
                {
                    showFullscreen();
                }
            }
        }
    });
});
