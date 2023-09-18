# EventUI

## Overview
EventUI is a JavaScript library of UI components centered around an event-based strategy for managing asynchronous logic and preventing race condition related bugs.

The core issue being addressed by EventUI is the extreme ease with which large single-page applications can accidentally spawn race conditions (and the hellishly difficult bugs to fix that ensue), especially when such applications have many authors who are often unaware of the asynchronous sequences the other authors have already folded into the application. Often, each developer writes their own little "island" in the application that just-so-happens to work (at the time of authoring) because it just-so-happens to execute at the right time in a sequence of asynchronous operations going on in the application at the time of invocation, but as soon as something changes the asynchronous flow in the application, foundational flaws appear in the application's architecture and very difficult bugs to reason about and fix occur that require major refactoring to properly address.

## Organization
EventUI is organized as a collection JavaScript codefiles, each of which contains a module (note: not an ECMA module export, but rather just a vanilla codefile with a single piece of functionality - module exports are coming soon), and some modules are reliant on other modules to do their jobs. 
The primary modules encapsulate UI components and functionality (modals, dropdowns, data binding, etc), and the supporting modules (object diffs and observers, lightweight html object model, runtime css class composition, etc) are components used by the main components to do their jobs.

EventUI offers the following modules:

- 



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

