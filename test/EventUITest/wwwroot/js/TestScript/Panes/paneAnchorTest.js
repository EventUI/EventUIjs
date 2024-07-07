
$evui.init(function ()
{
    $evui.css({
        rules: [
            {
                selector: ".selected",
                rules: {
                    borderStyle: "solid",
                    borderColor: "black",
                    borderWidth: "4px"
                }
            },
            {
                selector: ".thing",
                rules:
                {
                    height: "100px",
                    width: "100px",
                    backgroundColor: "blue"
                }
            }
        ]
    });

    var title = document.getElementById("title");
    var topBounds = document.getElementById("top");
    var leftBounds = document.getElementById("left");
    var rightBounds = document.getElementById("right");
    var bottomBounds = document.getElementById("bottom");

    var target = document.getElementById("thing");

    $evui.addPane({
        id: "test",
        element: target
    });

    var flagIndex = 1;
    var xAxisIndex = 0;
    var yAxisIndex = 0;

    var testAnchors = function ()
    {

    };

    var getNextXAxisIndex = function (index)
    {
        switch (index)
        {
            case 0:
                return EVUI.Modules.NewPanes.AnchorAlignment.None;
            case 1:
                return EVUI.Modules.NewPanes.AnchorAlignment.Left;
            case 2:
                return EVUI.Modules.NewPanes.AnchorAlignment.Center;
            case 3:
                return EVUI.Modules.NewPanes.AnchorAlignment.Right;
            case 4:
                return EVUI.Modules.NewPanes.AnchorAlignment.Elastic;
            default:
                return null;
        }
    };

    var getNextYAxisIndex = function (index)
    {
        switch (index)
        {
            case 0:
                return EVUI.Modules.NewPanes.AnchorAlignment.None;
            case 1:
                return EVUI.Modules.NewPanes.AnchorAlignment.Top;
            case 2:
                return EVUI.Modules.NewPanes.AnchorAlignment.Center;
            case 3:
                return EVUI.Modules.NewPanes.AnchorAlignment.Bottom;
            case 4:
                return EVUI.Modules.NewPanes.AnchorAlignment.Elastic;
            default:
                return null;
        }
    };

    var getNextAnchorSettings = function (flagIndex)
    {
        var anchorSettings = new EVUI.Modules.NewPanes.PaneAnchors();

        switch (flagIndex)
        {
            case 1:
                anchorSettings.top = topBounds;
                break;

            case 2:
                anchorSettings.bottom = bottomBounds;
                break;

            case 3:
                anchorSettings.top = topBounds;
                anchorSettings.bottom = bottomBounds;
                break;

            case 4:
                anchorSettings.left = leftBounds;
                break;

            case 5:
                anchorSettings.left = leftBounds;
                anchorSettings.top = topBounds;
                break;

            case 6:
                anchorSettings.left = leftBounds;
                anchorSettings.bottom = bottomBounds;
                break;

            case 7:
                anchorSettings.left = leftBounds;
                anchorSettings.bottom = bottomBounds;
                anchorSettings.top = topBounds;
                break;

            case 8:
                anchorSettings.right = rightBounds;
                break;

            case 9:
                anchorSettings.right = rightBounds;
                anchorSettings.top = topBounds;
                break;

            case 10:
                anchorSettings.right = rightBounds;
                anchorSettings.bottom = bottomBounds;
                break;

            case 11:
                anchorSettings.right = rightBounds;
                anchorSettings.bottom = bottomBounds;
                anchorSettings.top = topBounds;
                break;

            case 12:
                anchorSettings.right = rightBounds;
                anchorSettings.left = leftBounds;
                break;

            case 13:
                anchorSettings.right = rightBounds;
                anchorSettings.left = leftBounds;
                anchorSettings.top = topBounds;
                break;

            case 14:
                anchorSettings.right = rightBounds;
                anchorSettings.left = leftBounds;
                anchorSettings.bottom = bottomBounds;
                break;

            case 15:
                anchorSettings.right = rightBounds;
                anchorSettings.left = leftBounds;
                anchorSettings.top = topBounds;
                anchorSettings.bottom = bottomBounds;
        }

        return anchorSettings;
    };

    var hilightSides = function (anchorSettings)
    {
        topBounds.classList.remove("selected");
        leftBounds.classList.remove("selected");
        bottomBounds.classList.remove("selected");
        rightBounds.classList.remove("selected");

        if (anchorSettings.top != null) topBounds.classList.add("selected");
        if (anchorSettings.bottom != null) bottomBounds.classList.add("selected");
        if (anchorSettings.left != null) leftBounds.classList.add("selected");
        if (anchorSettings.right != null) rightBounds.classList.add("selected");
    };

    var positionElement = function (position)
    {
        if (position != null)
        {
            var width = position.right - position.left;
            var height = position.bottom - position.top;

            var appliedRule = $evui.css({
                selector: ".position",
                rules: {
                    top: position.top + "px",
                    left: position.left + "px",
                    height: height + "px",
                    width: width + "px",
                    position: "absolute"
                }
            });

            target.classList.add("position");
        }
    };

    var nextTest = function ()
    {
        target.classList.remove("position");

        if (xAxisIndex < 5)
        {
            if (yAxisIndex < 5)
            {
                yAxisIndex++;
            }
            else
            {
                xAxisIndex++;
                yAxisIndex = 0;
            }
        }

        if (xAxisIndex === 5)
        {
            xAxisIndex = 0;
            yAxisIndex = 0;

            if (flagIndex < 16)
            {
                flagIndex++;
            }
            else
            {
                flagIndex = 1;
            }
        }

        var settings = getNextAnchorSettings(flagIndex);
        settings.alignX = getNextXAxisIndex(xAxisIndex);
        settings.alignY = getNextYAxisIndex(yAxisIndex);

        hilightSides(settings);
        setLabel(settings);

        //var position = manager.positionPane("test", {
        //    anchors: settings,
        //    clipSettings:
        //    {
        //        mode: "shift"
        //    }
        //});

        $evui.showPane("test", {
            anchors: settings,
            clipSettings:
            {
                mode: "shift"
            }            
        });
    };

    var previousTest = function ()
    {
        target.classList.remove("position");

        if (xAxisIndex > 0)
        {
            if (yAxisIndex > 0)
            {
                yAxisIndex--;
            }
            else
            {
                xAxisIndex--;
                yAxisIndex = 4;
            }
        }

        if (xAxisIndex === 0)
        {
            xAxisIndex = 4;
            yAxisIndex = 4;

            if (flagIndex > 1)
            {
                flagIndex--;
            }
            else
            {
                flagIndex = 15;
            }
        }

        var settings = getNextAnchorSettings(flagIndex);
        settings.alignX = getNextXAxisIndex(xAxisIndex);
        settings.alignY = getNextYAxisIndex(yAxisIndex);

        hilightSides(settings);
        setLabel(settings);

        $evui.showPane("test", {
            anchors: settings,
            clipSettings:
            {
                mode: "shift"
            }            
        });
    };

    var setLabel = function (settings)
    {
        var label = "";
        label += "X-Align: " + settings.alignX + "\n";
        label += "Y-Align: " + settings.alignY + "\n";
        label += "Anchored to:"
        if (settings.top != null) label += " top";
        if (settings.bottom != null) label += " bottom";
        if (settings.left != null) label += " left";
        if (settings.right != null) label += " right";

        title.innerText = label;
    };

    window.addEventListener("keydown", function (args)
    {
        if (args.keyCode === 39)
        {
            nextTest();
        }
        else if (args.keyCode === 37)
        {
            previousTest();
        }
    });

    document.getElementById("next").onclick = nextTest;
    document.getElementById("previous").onclick = previousTest;
});