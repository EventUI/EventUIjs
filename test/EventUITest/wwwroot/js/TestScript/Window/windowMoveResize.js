$evui.init(function ()
{
    var test = document.createElement("div");
    test.setAttribute("id", "testDialog");
    document.body.appendChild(test);

    $evui.css({
        selector: ".testSize",
        rules:
        {
            width: "100%",
            height: "100%"
        }
    });

    $evui.css({
        selector: "#testDialog",
        rules:
        {
            minHeight: "250px",
            minWidth: "250px",
            backgroundColor: "blue"
        }
    });

    $evui.addPane({
        id: "testDialog",
        loadSettings:
        {
            selector: "#testDialog"
        },
        showSettings:
        {
            center: true,
            clipSettings:
            {
                mode: "shift"
            }
        },

        resizeMoveSettings:
        {
            canDragMove: true,
            canResizeBottom: true,
            canResizeLeft: true,
            canResizeRight: true,
            canResizeTop: true,
            dragHandleMargin: 20
        },
        onLoaded: function (paneArgs)
        {
            this.element.setAttribute(EVUI.Modules.Panes.Constants.Attribute_Drag, "");
        }
    });

    $evui.showPane("testDialog");
});