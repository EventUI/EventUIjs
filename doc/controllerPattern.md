# EventUI Namespace Controller Pattern

## EVUI.Modules vs $evui

EventUI is structured using plain objects as namespaces to store module implementations, starting with the root namespace declaration `EVUI` and branching out into the `Modules` sub-object from there.

For example, the Core module's object definitions can be accessed via the `EVUI.Modules.Core` object.

To further the example, one of the most commonly used functions throughout the library is `EVUI.Modules.Core.Utils.stringIsNullOrWhiteSpace(str)`, which checks to make sure the parameter is a string that contains at least one non-whitespace character. Typing out `EVUI.Modules.Core.Utils.stringIsNullOrWhiteSpace(str)` over and over is very long-winded and ultimately a pain that makes the library less usable. 

Enter the `$evui` object, which contains the shorthand syntax for exposing the section of EventUI's functionality that is intended to be consumed by end users.

So `EVUI.Modules.Core.Utils.stringIsNullOrWhiteSpace(str)` is accessed via `$evui.strIsValid(str)`, which simply invokes `EVUI.Modules.Core.Utils.stringIsNullOrWhiteSpace(str)` and returns the result, but requires a lot less typing to do the same thing.

The key takeaway is that EventUI contains two ways of accessing all of it's functionality:
1. The longhand `EVUI.Modules.XXX` namespace syntax.
1. The shorthand `$evui.XXX` syntax.

Unless there is something *really* specific that needs to be done, `$evui` should be used over `EVUI.Modules`.

One key difference between `$evui` and `EVUI.Modules` is that all Module sub-objects are frozen and cannot be modified. This is because EventUI's internal implementation only uses the longhand syntax, and freezing the definitions of the longhand syntax provides some measure of stability in that the longhand functionality of the library behaves exactly as intended. `$evui`, however, is fully mutable and can be edited without impacting the library's core functionality.

## Singleton Objects

The pattern followed by almost all the Modules in EventUI is that each module contains a core controller-like object and a handful of object definitions used by that the controller consumes to do its job. In order to cut down on object-instantiation overhead, there is usually a single instance of the controller object per module that is globally used by EventUI that is instantiated the first time it is accessed. 

For example, the `EVUI.Modules.Http` module's primary controller is the `EVUI.Modules.Http.HttpManager`, which exists as a (big) constructor function. In order to avoid executing the entire constructor every time it's needed by another module, a singleton instance of this constructor is declared in the Http module that is accessed via `EVUI.Modules.Http.Http` and is what is normally used by other modules to make their Http requests.

However, calling `EVUI.Modules.Http.Http.executeRequestAsync` to make a Http request is long-winded and awkward, so the same functionality is exposed as `$evui.httpAsync` in the `$evui` object for end-users. Should the `HttpManager` found at `EVUI.Modules.Http.Http` be needed, it can also be accessed via `$evui.httpManager`.

### Singleton Object Global Events

The secondary reason for the global instances of module controller objects is that the controllers which offer event-driven functionality (like how Http does) is that using the singleton instance ensures that the events attached to the controller itself fire every time the singleton object is used (which, by default, is everywhere).

For example, say that every time a Http request fails, the request Url and status code should be logged. Because all controllers share the same instance of `HttpManager` by default, the event can be set in one place and used everywhere:

    $evui.httpManager.onError = (eventArgs) =>
    {
        console.log(`${eventArgs.request.url} failed with a status code of ${eventArgs.requestStatus}`);
    }

So if the `$evui.htmlLoader` Http request fails, the onError handler of the `$evui.httpManager` will fire.

## Custom Controller Instances

Should there be some reason to NOT use the global instance of a controller, controllers can be instantiated like any other object and be fed its dependencies into its constructor. If a dependency is omitted, the singleton object version of the dependency will be used instead.

For example, the `$evui.htmlLoader` object will forever use the `$evui.http` object, but if a custom `HtmlLoaderController` with it's own `HttpManager` is desired, this can be done like so:

    var myHttp = new EVUI.Modules.Http.HttpManager();
    var myLoader = new EVUI.Modules.HtmlLoader.HtmlLoaderController({ httpManager: myHttp });

    myHttp.onComplete = (eventArgs) =>
    {
        console.log(`HtmlPartialLoader finished loading: ${eventArgs.request.url}!`);
    };

    var html = await myLoader.loadHtmlAsync(/*some URL*/);

This allows for custom functionality that does not pollute the singleton objects that EventUI uses under the hood, but comes at the price of not being called via the `$evui` object and are instead just regular variables.

Note that if a custom controller is desired, the longhand version of the EventUI syntax must be used.







