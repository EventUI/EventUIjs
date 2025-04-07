$evui.init(async function ()
{
    $evui.addBindingHtmlContent("content", "<div class='{{class1}} {{class2}} unboundClass'>Content</div>");

    var data = {
        class1: "someClass",
        class2: "someOtherClass"
    };

    var binding = await $evui.bindAsync({ source: data, htmlContent: "content", element: document.getElementById("insertionDiv") });

    var printOutput = function ()
    {
        var value = $evui.dom(binding.getBoundContent()[0]).attr("class");
        var outputDiv = $evui.dom("#output").text(value);
    };

    var addClass = function (className)
    {
        binding.getBoundContent()[0].classList.add(className);
        printOutput();
    };

    var removeClass = function (className)
    {
        binding.getBoundContent()[0].classList.remove(className);
        printOutput();
    };

    var changeClass = async function (className, class1)
    {
        if (class1 === true)
        {
            data.class1 = className;
        }
        else
        {
            data.class2 = className;
        }

        await binding.updateAsync();
        printOutput();
    };

    $evui.dom("#add").on("click", function (args)
    {
        var newClassValue = $evui.dom("#addClass").val();
        if ($evui.isStringValid(newClassValue) === false) return;

        addClass(newClassValue);
    });

    $evui.dom("#remove").on("click", function (args)
    {
        var newClassValue = $evui.dom("#removeClass").val();
        if ($evui.isStringValid(newClassValue) === false) return;

        removeClass(newClassValue);
    });

    $evui.dom("#change1").on("click", async function (args)
    {
        var newClassValue = $evui.dom("#class1").val();
        await changeClass(newClassValue, true);
    });

    $evui.dom("#change2").on("click", async function (args)
    {
        var newClassValue = $evui.dom("#class2").val();
        await changeClass(newClassValue, false);
    });
});