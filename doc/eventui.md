# EventUI

## Overview
EventUI is a JavaScript library of UI components centered around an event-based strategy for managing asynchronous logic and preventing race condition related bugs.

The core issue being addressed by EventUI is the extreme ease with which large single-page applications can accidentally spawn race conditions (and the hellishly difficult bugs to fix that ensue), especially when such applications have many authors who are often unaware of the asynchronous sequences the other authors have already folded into the application. Often, each developer writes their own little "island" in the application that just-so-happens to work (at the time of authoring) because it just-so-happens to execute at the right time in a sequence of asynchronous operations going on in the application at the time of invocation, but as soon as something changes the asynchronous flow in the application, foundational flaws appear in the application's architecture and very difficult bugs to reason about and fix occur that require major refactoring to properly address.

## Organization
EventUI is organized as a collection JavaScript codefiles, each of which contains a module (note: not an ECMA module export, but rather just a vanilla codefile with a single piece of functionality - module exports are coming soon), and some modules are reliant on other modules to do their jobs. 
The primary modules encapsulate UI components and functionality (modals, dropdowns, data binding, etc), and the supporting modules (object diffs and observers, lightweight html object model, runtime css class composition, etc) are components used by the main components to do their jobs.

EventUI offers the following modules:

1. **Data Binding**: A one-way data-binder that has been designed to bind **any** JavaScript object to plain HTML templates recursively using a simple markup pattern. When the object that was bound has been changed (or the html template changes), the Binder can selectively update the calculated virtual DOM tree to modify real DOM nodes in a minimalistic fashion so that the maximum number of DOM nodes are preserved and only the ones that require a change are created, swapped, or removed. The Binder has been optimized so that even huge objects (i.e. arrays with thousands of elements) can be compared, their DOM trees recalculated, and be updated quickly and efficiently. In addition to providing data binding functionality, every data biding operation comes with a complete event life cycle that allows for dynamic fine-tuning of the binding operation as it occurs.
1. **Panes**: A "pane" is fully functional and configurable "window" (like the browser window itself on a non-mobile device, except with a non-trademarked name) that lives inside of a a document's DOM - they are just arbitrary Elements that, once initialized as a Pane, can be dragged and moved or resized, centered or positioned relative to arbitrary points or relative to other elements, anchored to other elements or parts of the screen. The "Pane" is a super configurable raw base class that can be configured to have different behavior sets and comes with a complete event life cycle for managing its behavior when it is being loaded into the DOM, hidden, shown, moved, resized, or unloaded from the DOM, which provides developers with hooks to customize exactly how the Pane should behave in different use cases. The raw Pane is available for use, as well as 4 pre-canned flavors of Panes that are most common in web applications:
    1. **Dropdowns**: The classic application menu drop-down or context menu. They are Panes that are configured to be positioned relative to a point or element, are aware of their "bounds" that they must stay inside of (i.e. not go off the screen or outside of some arbitrary zone or DOM element), can chain off each other to form sub-menus, and dismiss following a mouse action (which can be intercepted using the event lifecycle provided by the underlying Pane).
    1. **Modals**: The classic, front-and-center modal dialog. These are Panes that are configured to be centered on the screen and **stay** centered in the screen when it resizes, and (like all Panes) have configurable show/hide CSS transitions, backdrops, and an automatic z-index calculations so that subsequent modals always appear 'on top' when shown.
    1. **Dialogs**: The more modern flavor or modal dialog, these have all the same behaviors as modals (except they are positioned relative to a point and don't have a backdrop on by default), but they also have 'handles' (configurable zones) that can be used to drag to resize or move the dialog. The dragging and resizing are also configurable, with min/max sizes enforced from both its own configuration and CSS max-width and max-height properties, as well as controls over which dimensions the dialog can grow in and the bounding box (either nothing, the window, an element, or an arbitrary box) that the dialog must stay inside of when moved or resized.
    1. **Pop-Ins**: These are 'banner-like' Panes that are anchored between other elements to form a 'bar' that is anchored in between other elements on the X and/or Y axes. The most common use case for these are things like horizontal or vertical navigation bars, or those annoying 'accept cookies' banners that pop up on most web sites (thank you EU bureaucrats for keeping us safe from fully functional websites).
1. **Runtime CSS Classes**: Instead of in-lining style properties directly on HTML tags, or worse yet - making style tags and stuffing them with CSS strings at runtime - EventUI uses the browser's native CSSRule API to generate and edit CSS classes in memory without adding a style tag for every batch of changes - all that is needed is one style tag (that was not loaded via a cross-origin request, browser security prevents reading or writing CSSRules in that case) to hook into and manipulate CSS rules dynamically, including **removing** existing rules from existing selectors. 
1. **Object Diffing**: A standalone utility for comparing two objects and quickly identifying the differences and similarities between both. The diffing algorithm can be configured so that deep objects graphs can be compared based on property values or by reference (i.e. answering the questions of "are these two object graphs equivalent?" versus "do both objects contain the same object instance?"). In addition, the diff module contains functionality for generating **value hash codes** for objects to easily determine object equality. The diff utility produces an object graph that enumerates all the properties in common, that are different, and all comparisons made total between two graphs that contain metadata on the comparison made and why the values were deemed to be different beyond a simple value equality comparison.



### A Basic Use Case with Race Conditions

#### The Problem
One of the most common spawning grounds for the type of bug that EventUI was designed to work around is raising a normal DOM event, either via some user action (like a click) or via a custom event dispatch (usually done with a tool like jQuery). The eventing structure in the native DOM is a beautiful thing, but it predates async functions and doesn't work properly with them: when using an async function as an event handler, the DOM's bubbling process for events won't await the async function and will instead invoke the async function, then move on to the next function in the bubbling event 'stack' without awaiting the previous function. 

Consider the following code:

    addEventListener('click', async function (event)
    {
        console.log("Handler 1 Start");
        await fetch(/*Some web service call*/);
        console.log("Handler 1 Finish");
    });

    addEventListener('click', async function (event)
    {
        console.log("Handler 2 Start");
        await fetch(/*Some other web service call*/);
        console.log("Handler 2 Finish");
    });

The output from this code sample is predictable when run initially ("Handler 1 Start" then "Handler 2 Start" will be logged), but can finish in any order (depending on which web service call takes longer). If this code relies on the response from the first call being processed before the second call, problems will inevitably arise due to the race condition that was created: there's nothing forcing handler 2 to wait for handler 1 - they will race to completion. 

If, at the time of authoring, web service call #1 is **always** faster than web service call #2, this code will behave predictably and correctly, and can likely sit there for years without issue. 

***Then something changes:*** The browser could, for some reason, start aggressively caching response to the second web service call and not hit the server at all (and will finish almost instantly), the first web service call could have additional work added to it on the server that makes it run slower, or the second web service call could be optimized on the server to make it always run faster than the first - or even worse, *sometimes* run faster than the first. 

#### A Bad Solution

If any of these things happen, the application will become unstable and bugs/crashes will occur, and the more code that relies on handler 1 finishing before handler 2, the harder this will be to correctly fix. 

This example happens to be done in such a way that a wait loop can fix the race, but it's starting to get messy and introduces issues and potential bugs of its own:

    var fetch1Finished = false;

    addEventListener('click', async function (event)
    {
        console.log("Handler 1 Start");
        await fetch(/*Some web service call*/);
        fetch1Finished = true;

        console.log("Handler 1 Finish");
    });

    addEventListener('click', async function (event)
    {
        console.log("Handler 2 Start");

        while (fetch1Finished === false)
        {
            await $evui.waitAsync(10); //wait in 10 millisecond increments in a async loop for the first call to signal that it's done
        }

        await fetch(/*Some other web service call*/);
        console.log("Handler 2 Finish");
    });

If the two handlers are 'miles apart' in the codebase, this is much harder to fix (and is usually the case).

#### A Better Solution

Now, using some of EventUI's tooling, this problem can be fixed forever:

    addAsyncEventListener('click', async function (event)
    {
        console.log("Handler 1 Start");
        await fetch(/*Some web service call*/);
        console.log("Handler 1 Finish");
    });

    addAsyncEventListener('click', async function (event)
    {
        console.log("Handler 2 Start");
        await fetch(/*Some other web service call*/);
        console.log("Handler 2 Finish");
    });

The use of EventUI's "addAsyncEventListener" (which has been appended to the EventTarget prototype, so all objects with `addEventListener` also have `addAsyncEventListener` attached to them by default) **does** respect 'awaiting' async functions, so handler 2 will **never** fire until handler 1 has finished completely. 

This does come at a cost of losing the parallelism of running both requests at the same time and instead forcing them to waterfall, but sometimes performance must be sacrificed for stability (after all, what good is performance if the application doesn't work). There are some other caveats to using `addAsyncEventListener` vs `addEventListener`, but they are not relevant to this example.

