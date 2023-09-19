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

    var dialog = $evui.addDialog({
        id: "test",
        myProp: 1,
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
});