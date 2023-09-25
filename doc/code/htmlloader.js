$evui.init(async function ()
{
    var htmlStr = await $evui.htmlLoader.loadHtmlAsync("https://someUrl.com/some/endpoint");

    var htmlStr = await $evui.htmlLoader.loadHtmlAsync({
        url: "https://someUrl.com/some/endpoint"
    });


    var htmlStr = await $evui.htmlLoader.loadHtmlAsync({
        url: "https://someUrl.com/some/endpoint",
        httpArgs: {
            headers: [{ key: "someHeader", value: "someValue" }],
            withCredentials: true
        }
    });

    $evui.httpManager.onError = (eventArgs) =>
    {
        console.log(`${eventArgs.request.url} failed with a status code of ${eventArgs.requestStatus}`);
    }

    var myHttp = new EVUI.Modules.Http.HttpManager();
    var myLoader = new EVUI.Modules.HtmlLoader.HtmlLoaderController({ httpManager: myHttp });

    myHttp.onComplete = (eventArgs) =>
    {
        console.log(`HtmlPartialLoader finished loading: ${eventArgs.request.url}!`);
    };

    var html = await myLoader.loadHtmlAsync(/*some URL*/);
})
