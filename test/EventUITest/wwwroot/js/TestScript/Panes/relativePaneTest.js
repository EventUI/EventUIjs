$evui.init(function ()
{

    var relativeElement = document.getElementById("point");
    var menu = document.getElementById("menu");
    var desc = document.getElementById("desc");

    $evui.panes.addPane({
        id: "test",
        element: menu
    });

    var curOrientation = 0;
    var curAlignment = 0;

    var getNextOrientation = function (orientation)
    {
        switch (orientation)
        {
            case 0:
                return "top left";
            case 1:
                return "bottom left";
            case 2:
                return "bottom right";
            case 3:
                return "top right";
        }
    };

    var getNextAlignment = function (alignment)
    {
        switch (alignment)
        {
            case 0:
                return EVUI.Modules.Panes.RelativePositionAlignment.None;
            case 1:
                return EVUI.Modules.Panes.RelativePositionAlignment.Top;
            case 2:
                return EVUI.Modules.Panes.RelativePositionAlignment.YCenter;
            case 3:
                return EVUI.Modules.Panes.RelativePositionAlignment.Bottom;
            case 4:
                return EVUI.Modules.Panes.RelativePositionAlignment.Left;
            case 5:
                return EVUI.Modules.Panes.RelativePositionAlignment.XCenter;
            case 6:
                return EVUI.Modules.Panes.RelativePositionAlignment.Right;
        }
    };

    var nextTest = function ()
    {
        var nextAlignment = null;
        var nextOrientation = null;

        if (curAlignment < 6)
        {
            curAlignment++;
        }
        else
        {
            curAlignment = 0;
            if (curOrientation < 3)
            {
                curOrientation++;
            }
            else
            {
                curOrientation = 0;
            }
        }

        nextAlignment = getNextAlignment(curAlignment);
        nextOrientation = getNextOrientation(curOrientation);

        setDescription(nextOrientation, nextAlignment);

        $evui.panes.showPane("test", {
            relativePosition:
            {
                relativeElement: relativeElement,
                orientation: nextOrientation,
                alignment: nextAlignment
            },
            clipSettings:
            {
                mode: "shift"
            }            
        });
    };

    var previousTest = function ()
    {
        var nextAlignment = null;
        var nextOrientation = null;

        if (curAlignment >= 0)
        {
            curAlignment--;
        }
        else
        {
            curAlignment = 6;
            if (curOrientation >= 0)
            {
                curOrientation--;
            }
            else
            {
                curOrientation = 3;
            }
        }

        nextAlignment = getNextAlignment(curAlignment);
        nextOrientation = getNextOrientation(curOrientation);

        setDescription(nextOrientation, nextAlignment);

        $evui.panes.showPane("test", {
            relativePosition:
            {
                relativeElement: relativeElement,
                orientation: nextOrientation,
                alignment: nextAlignment
            },
            clipSettings:
            {
                mode: "shift"
            }            
        });
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

    var setDescription = function (orientation, alignment)
    {
        desc.innerText = "orientation: " + orientation;
        desc.innerText += "\nalignment: " + alignment
    };
});