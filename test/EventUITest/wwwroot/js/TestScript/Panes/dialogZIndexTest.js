$evui.init(function ()
{
    var d = document.createElement("div");
    d.classList.add("testDialog");
    d.setAttribute("evui-pane-drag-handle", "");

    $evui.css({
        selector: ".testDialog",
        rules:
        {
            height: "400px",
            width: "500px",
            background: "red",
            display: "none"
        }
    });

    var d2 = document.createElement("div");
    d2.classList.add("testDialog2");
    d2.setAttribute("evui-pane-drag-handle", "");

    $evui.css({
        selector: ".testDialog2",
        rules:
        {
            height: "400px",
            width: "500px",
            background: "blue",
            display: "none"
        }
    });

    document.body.appendChild(d);
    document.body.appendChild(d2);
});