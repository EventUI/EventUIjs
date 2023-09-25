### HtmlLoader

The HtmlLoader module is a utility for three different flavors of loading Html:
1. Loading arbitrary Html from an endpoint and returning it as a string.
1. Loading a Html partial that is used for data binding purposes or for some other type of dynamic content to use at runtime.
1. Loading a Html placeholder that represents a major part of the page that is loaded on demand rather than up front.

## Arbitrary Html
The arbitrary Html use case is straight forward: by default the HtmlLoader will make a GET request to the provided Url and return the response as a string. The request made is configurable and technically be any kind of Http request, but the response is always returned as a string. A basic request would look like this:

    var htmlStr = await $evui.htmlLoader.loadHtmlAsync("https://someUrl.com/some/endpoint");

This isn't much different than a basic fetch request, the primary difference is that it's using a XMLHttpRequest under the hood created by the Http module's HttpManager to make the actual request. 

This may not seem like much of a distinction (and more like an over-complication), but the usage of the HttpManager gives expands the options that can be used when making the request.

    $evui.http.onBeforeSend = (eventArgs) =>
    {
        
    };

    var htmlStr = await $evui.htmlLoader.loadHtmlAsync({
        url: "https://someUrl.com/some/endpoint",
        httpArgs: {
            headers: [{ key: "someHeader", value: "someValue" }],
            withCredentials: true
        }
    });

This allows for customization or fine-tuning of the Http request made to the server so that the correct response is received.


