﻿$evui.init(function ()
{
    var dd = document.createElement("div");
    dd.style.height = "125px";
    dd.style.width = "125px";

    $evui.css({
        selector: ".divStyle",
        rules: {
            backgroundColor: "red"
        }
    });

    dd.classList.add("divStyle");

    //document.body.appendChild(dd);

    $evui.showDropdown("anotherTest", {
        context: "123",
        loadArgs:
        {
            loadSettings:
            {
                element: dd,
            },
        },
        showSettings:
        {
            x: 500,
            y: 500,
            showTransition:
            {
                css:
                {
                    backgroundColor: "blue"
                },
                duration: 2000
            }
        }
    });
});