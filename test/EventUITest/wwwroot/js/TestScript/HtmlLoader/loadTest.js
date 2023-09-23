$evui.init(async () =>
{
    var loadResult = await $evui.loadPlaceholderAsync({
        httpArgs: {
            url: "/partials/htmlLoader/somePartial.html"
        }
    });

    console.log(loadResult);
});

