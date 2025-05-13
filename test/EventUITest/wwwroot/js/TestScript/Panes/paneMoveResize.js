$evui.init(function ()
{
    var d = document.createElement("div");
    d.classList.add("testDialog");
    d.style.height = "200px";
    d.style.width = "200px";
    d.style.background = "blue";

    //$evui.css({
    //    selector: ".testDialog",
    //    rules:
    //    {
    //        height: "400px",
    //        width: "500px",
    //        background: "red"
    //    }
    //});

    d.setAttribute("evui-pane-drag-handle", "");

    var dialog = $evui.addPane({
        id: "test",
        myProp: 1,
        template: "dialog",
        loadSettings:
        {
            element: d
        },
        resizeMoveSettings:
        {
            canResizeBottom: true,
            canResizeTop: true,
            canDragMove: true,
            retainResizedDimensions: true
        },
        autoHideSettings:
        {
            autoHideKeys: ["Control"]
        },
        onShow: function ()
        {
            console.log(this.myProp);
        }, 
        onMove: async function (args)
        {
            console.log("Moved", args.moveArgs);
        },
        onResize: async function (args)
        {
            console.log("Resized", args.resizeArgs);
        },
    });

    $evui.panes.onInitialize = function ()
    {
        console.log(this);
    }

    dialog.show();
});