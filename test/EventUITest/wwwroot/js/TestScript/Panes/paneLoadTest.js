$evui.init(function ()
{
    $evui.panes.addPane({ id: "testDirect" });
    $evui.panes.addPane({ id: "testCSS" });
    $evui.panes.addPane({ id: "testHTTP" });
    $evui.panes.addPane({ id: "testPlaceholder" });

    var refButton = document.getElementById("ref");
    var cssButton = document.getElementById("css");
    var httpButton = document.getElementById("http");
    var placeholderButton = document.getElementById("placeholder");

    refButton.onclick = function ()
    {
        $evui.panes.loadPane("testDirect", {
            element: document.getElementById("direct")            
        }, function (success)
        {

            $evui.panes.showPane("testDirect", {
                center: true                
            });
        });
    };

    cssButton.onclick = function ()
    {
        $evui.panes.loadPane("testCSS", {
            selector: "#cssMode"            
        }, function (success)
        {
            $evui.panes.showPane("testCSS", {
                center: true                
            });
        });
    };

    httpButton.onclick = function ()
    {
        $evui.panes.loadPane("testHTTP", {
            httpLoadArgs:
            {
                url: "/Partials/Pane/Http.html",
                method: "GET"
            }            
        }, function (success)
        {

            $evui.panes.showPane("testHTTP", {
                center: true
            });

        });
    };

    placeholderButton.onclick = function ()
    {
        $evui.panes.loadPane("testPlaceholder", {
            placeholderLoadArgs:
            {
                placeholderID: "testPlaceholder",
            }        
        }, function (success)
        {
            $evui.panes.showPane("testPlaceholder", {
                center: true                
            });
        });
    };
});