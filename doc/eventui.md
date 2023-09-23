# EventUI

## Overview
EventUI is a JavaScript library of UI components centered around an event-based strategy for managing asynchronous logic when performing common UI tasks in data-driven web applications.

The primary issue that EventUI addresses is a problem that arises when some part of a standard UI operation - like showing a modal - needs some asynchronous behavior to be displayed or populated (like hitting a server for data that the modal will display or to get the markup of the modal itself), but the library/framework being used to manage the displaying of the modal doesn't give an adequate "hook" to do asynchronous logic in the 'show modal' process, which commonly results in an inelegant solution that can cause a race condition, a jerky UI experience, or a code pattern that is difficult to maintain or extend. 

EventUI addresses this problem by providing highly customizable UI components that come with built-in overridable event lifecycles where the events act as hooks where asynchronous code (or synchronous code - EventUI handles both cases) can be executed as part of the normal flow of a UI operation by blocking the progress of the operation until the event's code has completed. This makes it far easier to reason about doing things like show data driven modals with a consistent pattern that is easy for developers to implement.

## An Event-Driven Example

Compare, for instance, EventUI's modals with Bootstrap's modals. For a piece of static HTML that doesn't need to be populated with data from a server, Bootstrap is a fabulous choice because of it's simplicity. Showing a modal in this case is easy:

	$("#myModal").modal("show");

Boom. Done. Modal. 

Now, if this modal needs some dynamic content, things start to get a little bit more tricky:

	async function ShowMyModal()
	{
		var modalRoot = $("#myModal");
		modalRoot.modal("show");

		var response = await fetch(/*some request*/);

		if (response.ok === true)
		{
			//populate the modal with data from the response
		}
		else
		{
			//request failed. Either show an error message or hide the modal.
		}
	};

	await ShowMyModal();

Getting data to show in the modal isn't hard, but this code will cause an empty modal to appear, sit there empty for a moment, then get populated with data. Or, if the request fails, one of several things might happen:
1. The request could time out, in which case the error handler will not be fired for some time and the modal will sit there, empty, and the user will be confused.
1. The request could fail quickly, in which case an error message can be put into the modal - this is probably the best idea, it leaves a disappointed user instead of a confused one. Or the modal could be immediately be hidden in the error handler, but this will cause the modal to flicker in and out of existence and confuse the user and make them think the site has glitched out.

Or, the request could succeed, but bring with it a large amount of data that throws off the alignment of the modal (which is already visible by the time the request completes) in the center of the screen and look broken. It technically worked, but is a sub-par experience for the user.

The easiest solution to making a smooth experience here is to do one of two things: either show the modal once the request completes so it's already populated when Bootstrap shows it, or just throw a loading spinner in the modal while the content loads. 

Both of these solutions are well and good, but this means that each modal needs a hand-crafted "show" function to manage the showing and population of the modal, and knowing how every developer will probably have their own recipe for handling this use case (i.e. modal X has a loading spinner, modal Y waits the response to complete before being shown, or modal Z sits there blank until the response arrives), this will cause uneven UX or difficult maintenance by other programmers down the road. Worse yet, the same modal could have multiple functions that show it, and each behaves differently.

What is needed is a little bit of structure to make the showing a data-driven modal a more uniform process. In EventUI, the modal could be declared and shown like so:

    $evui.addModal({
        id: "myModal",
        element: "#myModal",
        onShow: async function (eventArgs) //fires when the command to show the modal is issued and awaits the function before continuing to show the modal
        {
            var response = await fetch(/*some request*/)

            if (response.ok === true)
            {
                //populate the modal with data 
            }
            else
            {
                //populate error message or call eventArgs.cancel() to prevent the modal from ever being seen
            }
        }
    });

    await $evui.showModalAsync("myModal");

EventUI gives the programmer a hook (in this case, the first event in the 'show' process, which fires when the modal's root element is available in memory but before it is visible to the user) to get the data before the modal is ever shown that will block the showing of the modal before it is positioned and made visible to the user. 

If the request is successful, the modal is populated with data before being positioned, so it will be in the center of the viewport no matter how big it gets. 

If the request fails, the `eventArgs` object (a `ModalEventArgs` instance) passed into the event gives the option to cancel showing the modal, which will prevent it from ever being seen (although this doesn't fix the problem of confusing the user, it's better than a flickering modal). All of EventUI's event handlers use custom event argument objects that are not related to the DOM's native `Event` object.

Finally, there is now one simple call to show this modal that can be used everywhere in the codebase: `await $evui.showModalAsync("myModal")`. The modal is declared once, then can be re-used infinitely. Other modals that are declared will all follow the same event-driven pattern (although the problem of uneven UX still exists if different programmers use loading spinners and such in uneven ways, but it will be easier to homogenize than hand-crafted show functions).

## Modular Organization
EventUI is organized as a collection JavaScript codefiles, each of which contains a module (note: not an ECMA module export, but rather just a vanilla codefile with a single piece of functionality - module exports are coming soon), and some modules are reliant on other modules to do their jobs. 
The primary modules encapsulate UI components and functionality (modals, dropdowns, data binding, etc), and the supporting modules (object diffs and observers, lightweight html object model, runtime css class composition, etc) are components used by the main components to do their jobs.

EventUI offers the following modules:

1. **Data Binding**: A one-way data-binder that has been designed to bind **any** JavaScript object to plain HTML templates recursively using a simple markup pattern. When the object that was bound has been changed (or the html template changes), the Binder can selectively update the calculated virtual DOM tree to modify real DOM nodes in a minimalistic fashion so that the maximum number of DOM nodes are preserved and only the ones that require a change are created, swapped, or removed. The Binder has been optimized so that even huge objects (i.e. arrays with thousands of elements) can be compared, their DOM trees recalculated, and be updated quickly and efficiently. In addition to providing data binding functionality, every data biding operation comes with a complete event life cycle that allows for dynamic fine-tuning of the binding operation as it occurs.
1. **Panes**: A "pane" is fully functional and configurable "window" (like the browser window itself on a non-mobile device, except with a non-trademarked name) that lives inside of a a document's DOM - they are just arbitrary Elements that, once initialized as a Pane, can be dragged and moved or resized, centered or positioned relative to arbitrary points or relative to other elements, anchored to other elements or parts of the screen. The "Pane" is a super configurable raw base class that can be configured to have different behavior sets and comes with a complete event life cycle for managing its behavior when it is being loaded into the DOM, hidden, shown, moved, resized, or unloaded from the DOM, which provides developers with hooks to customize exactly how the Pane should behave in different use cases. The raw Pane is available for use, as well as 4 pre-canned flavors of Panes that are most common in web applications:
    1. **Dropdowns**: The classic application menu drop-down or context menu. They are Panes that are configured to be positioned relative to a point or element, are aware of their "bounds" that they must stay inside of (i.e. not go off the screen or outside of some arbitrary zone or DOM element), can chain off each other to form sub-menus, and dismiss following a mouse action (which can be intercepted using the event lifecycle provided by the underlying Pane).
    1. **Modals**: The classic, front-and-center modal dialog. These are Panes that are configured to be centered on the screen and **stay** centered in the screen when it resizes, and (like all Panes) have configurable show/hide CSS transitions, backdrops, and an automatic z-index calculations so that subsequent modals always appear 'on top' when shown.
    1. **Dialogs**: The more modern flavor or modal dialog, these have all the same behaviors as modals (except they are positioned relative to a point and don't have a backdrop on by default), but they also have 'handles' (configurable zones) that can be used to drag to resize or move the dialog. The dragging and resizing are also configurable, with min/max sizes enforced from both its own configuration and CSS max-width and max-height properties, as well as controls over which dimensions the dialog can grow in and the bounding box (either nothing, the window, an element, or an arbitrary box) that the dialog must stay inside of when moved or resized.
    1. **Pop-Ins**: These are 'banner-like' Panes that are anchored between other elements to form a 'bar' that is anchored in between other elements on the X and/or Y axes. The most common use case for these are things like horizontal or vertical navigation bars, or those annoying 'accept cookies' banners that pop up on most web sites (thank you EU bureaucrats for keeping us safe from fully functional websites).
1. **Data-Driven Tree View**: No UI library could be complete without some sort of TreeView, and EventUI is no exception! The TreeView in EventUI is a recursive tree structure that uses the data-binding module to dynamically stamp out HTML partials for tree view nodes to mirror a backing data object. The best part about this tree view is that, if the backing data object is changed (say has objects that map to child nodes added or removed), the tree view can automatically re-organize and alter itself to mirror the backing data object when instructed to do so, which makes managing the tree view easy. Furthermore, the EventUI TreeView is ***lazy*** so it doesn't generate nodes until they are needed to become visible - this makes it so a huge amount of data can be bound to the tree, but only the portion at the root is initially visible so the startup time on the page to generate the tree view is mercifully short.
1. **Runtime CSS Classes**: Instead of in-lining style properties directly on HTML tags, or worse yet - making style tags and stuffing them with CSS strings at runtime - EventUI uses the browser's native CSSRule API to generate and edit CSS classes in memory without adding a style tag for every batch of changes - all that is needed is one style tag (that was not loaded via a cross-origin request, browser security prevents reading or writing CSSRules in that case) to hook into and manipulate CSS rules dynamically, including **removing** existing rules from existing selectors. 
1. **Object Diffing**: A standalone utility for comparing two objects and quickly identifying the differences and similarities between both. The diffing algorithm can be configured so that deep objects graphs can be compared based on property values or by reference (i.e. answering the questions of "are these two object graphs equivalent?" versus "do both objects contain the same object instance?"). In addition, the diff module contains functionality for generating **value hash codes** for objects to easily determine object equality. The diff utility produces an object graph that enumerates all the properties in common, that are different, and all comparisons made total between two graphs that contain metadata on the comparison made and why the values were deemed to be different beyond a simple value equality comparison.
1. **Recursive Object and Array Observers**: Figuring out when an object (or one of its child objects) has changed is a critical part of data binding, so EventUI includes object and array observers that can report back any changes made to an object since it was initially snapshotted - they report back not only that something changed, but what it changed from, what it changed to, and what type of change occurred. In the case of objects, this is whether or not a property was changed, added, or removed, or in the case of arrays, this is if an element was added, removed, moved, or had its index shifted following the insertion or removal of elements before or after it in the array. 
1. **Lightweight DOM Tree Parsing & Scaffolding**: In order to properly do data-binding, it was necessary to create lightweight and non-circular representations of DOM nodes that contained only the data relevant to their markup so that they can be diffed (any DOM node has circular references in it that will wind up grabbing the entire Window object eventually, which is an explosive version of 'scope creep' when diffing), and converted to and from actual DOM Nodes. Although it is usually faster to let the DOM parse HTML into Nodes via a DOMParser, it sometimes enforces rules that make generating arbitrary HTML (like putting a `<td>` NOT a `<tr>`) impossible. EventUI can parse HTML into a lightweight DOM Tree (or directly into DOM nodes) that can be manipulated and converted into DOM nodes and vice-versa.
1. **Non-DOM Bound Custom Events**: Probably one of the most useful features of jQuery is the ease with which custom events can be dispatched and subscribed to (doing this manually is a verbose pain in the ass), but it still suffers from the inherent weakness of native DOM events in that it 1) is bound to an EventTarget (i.e. an Element) and 2) cannot properly handle (await) asynchronous functions. EventUI's custom events do NOT use the DOM, but instead synthesize the same behavior without being bound to an element or the document, and also work properly with async functions so that stacks of async listeners for the same event don't race each other.
1. 