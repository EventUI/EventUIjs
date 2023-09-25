$evui.init(async () =>
{
    var loadResult = await $evui.loadPlaceholderAsync({
        httpArgs: {
            url: "/partials/htmlLoader/somePartial.html"
        }
    });

    console.log(loadResult);

    var loadResult2 = await $evui.loadPlaceholderAsync({
        httpArgs: {
            url: "/partials/htmlLoader/partialWithChildren.html"
        }
    });

    console.log(loadResult2);

    document.body.append(loadResult2.placeholder);
});

