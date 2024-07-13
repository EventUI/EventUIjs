$evui.init(function ()
{
    $evui.addPane({
        id: "http",
        loadSettings:
        {
            httpLoadArgs:
            {
                url: "/partials/Pane/Http.html"
            }
        },
        onShow: function ()
        {
            console.log("show")
        }
    })
});