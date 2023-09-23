$evui.init(function ()
{
    var source =
    {
        prop1: "Hades",
        prop2:
        {
            a: "123",
            b: "<strong>Is a Cat</strong>"
        },
        subObject:
        {
            prop3: "Hendrix",
            prop2: "Another with the same name",
            subSubObject:
            {
                prop1: "Deeper Still",
                unique: "<button onclick=\"alert('Test')\">Alert</button>"
            }
        },
        subArray:
            [
                { name: "Bella", desc: "Is a scaredy cat." },
                { name: "Hendrix", desc: "Is an old cat." },
                { name: "Hades", desc: "Is a hungry cat." },
                [
                    { food: "chicken" },
                    { food: "beef" },
                    { food: "rabbit" }
                ]
            ]
    };

    $evui.addBindingHtmlContent({
        key: "topContent",
        url: "/Partials/Binder/Recursion/TopContent.html"
    });

    $evui.addBindingHtmlContent({
        key: "subContent",
        url: "/Partials/Binder/Recursion/SubContent.html"
    });

    $evui.addBindingHtmlContent({
        key: "subSubContent",
        url: "/Partials/Binder/Recursion/SubSubContent.html"
    });

    $evui.addBindingHtmlContent({
        key: "arrayContent",
        url: "/Partials/Binder/Recursion/ArrayContent.html"
    });

    $evui.addBindingHtmlContent({
        key: "arraySubContent",
        url: "/Partials/Binder/Recursion/ArraySubContent.html"
    });

    var target = $evui.dom("#insertion");

    var build = document.getElementById("build");
    var clear = document.getElementById("clear");
    var updateRoot = document.getElementById("updateRoot");
    var updateSub = document.getElementById("updateSub");
    var updateSubSub = document.getElementById("updateSubSub");
    var updateArray = document.getElementById("updateArray");
    var updateSubArray = document.getElementById("updateSubArray");

    var binding = null;

    build.onclick = async function ()
    {
        if (binding != null) binding.dispose();
        binding = await $evui.bindAsync({
            source: source,
            htmlContent: "topContent",
            element: target
        });
    };

    clear.onclick = function ()
    {
        if (binding == null) return;
        binding.dispose();
        binding = null;
    };

    updateRoot.onclick = async function ()
    {
        if (binding == null) return;
        source.prop1 = source.prop1 === "Hades" ? "Hendrix" : "Hades";
        source.prop2.a = source.prop2.a === "123" ? "456" : "123";

        await binding.updateAsync();
    };

    updateSub.onclick = async function ()
    {
        if (binding == null) return;
        source.subObject.prop2 = "Changed: " + $evui.guid();

        await binding.updateAsync();
    };

    updateSubSub.onclick = async function ()
    {
        if (binding == null) return;
        source.subObject.subSubObject.prop1 = source.subObject.subSubObject.prop1 === "Deeper Still" ? "Changed from the top" : "Deeper Still";

        await binding.updateAsync();
    };

    updateArray.onclick = async function ()
    {
        if (binding == null) return;
        if (source.subArray.length === 0)
        {
            source.subArray = [
                { name: "Bella", desc: "Is a scaredy cat." },
                { name: "Hendrix", desc: "Is an old cat." },
                { name: "Hades", desc: "Is a hungry cat." },
                [
                    { food: "chicken" },
                    { food: "beef" },
                    { food: "rabbit" }
                ]
            ]
        }
        else
        {
            source.subArray.splice(0, 1);
        }

        await binding.updateAsync();
    };

    updateSubArray.onclick = async function ()
    {
        if (binding == null) return;
        if (source.subArray.length === 0) return;

        var last = source.subArray[source.subArray.length - 1];
        last.push({ food: $evui.guid() });
        last.push({ food: $evui.guid() });

        await binding.updateAsync();
    };
});