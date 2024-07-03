$evui.init(function ()
{
    var d = document.createElement("div");
    d.classList.add("testDialog");

    $evui.css({
        selector: ".testDialog",
        rules:
        {
            height: "400px",
            width: "500px",
            background: "red"
        }
    });

    d.setAttribute("evui-dlg-drag-handle", "");

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
            canResizeBottom: false,
            canResizeTop: false,
            canDragMove: true
        },
        autoCloseSettings:
        {
            autoCloseKeys: ["Ctrl"]
        },
        onShow: function ()
        {
            console.log(this.myProp);
        }
    });

    $evui.dialogs.onInitialize = function ()
    {
        console.log(this);
    }

    dialog.show();
});