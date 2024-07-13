# EventUI

## Overview
EventUI is a JavaScript library of UI components centered around an event-based strategy for managing asynchronous logic when performing common UI tasks in data-driven web applications.

The primary issue that EventUI addresses is a problem that arises when some part of a standard UI operation - like showing a modal - needs some asynchronous behavior to be displayed or populated (like hitting a server for data that the modal will display or to get the markup of the modal itself), but the library/framework being used to manage the displaying of the modal doesn't give an adequate "hook" to do asynchronous logic in the 'show modal' process, which commonly results in an inelegant solution that can cause a race condition, a jerky UI experience, or a code pattern that is difficult to maintain or extend. 

EventUI addresses this problem by providing highly customizable UI components that come with built-in overridable event lifecycles where the events act as hooks where asynchronous code (or synchronous code - EventUI handles both cases) can be executed as part of the normal flow of a UI operation by blocking the progress of the operation until the event's code has completed. This makes it far easier to reason about doing things like show data driven modals with a consistent pattern that is easy for developers to implement.

## A Use Case for Events

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

    $evui.addPane({
        id: "myModal",
        element: "#myModal",
        template: "modal",
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

    await $evui.showPaneAsync("myModal");

EventUI gives the programmer a hook (in this case, the first event in the 'show' process, which fires when the modal's root element is available in memory but before it is visible to the user) to get the data before the modal is ever shown that will block the showing of the modal before it is positioned and made visible to the user. 

If the request is successful, the modal is populated with data before being positioned, so it will be in the center of the viewport no matter how big it gets. 

If the request fails, the `eventArgs` object (a `PaneEventArgs` instance) passed into the event gives the option to cancel showing the modal, which will prevent it from ever being seen (although this doesn't fix the problem of confusing the user, it's better than a flickering modal). All of EventUI's event handlers use custom event argument objects that are not related to the DOM's native `Event` object.

Finally, there is now one simple call to show this modal that can be used everywhere in the codebase: `await $evui.showPaneAsync("myModal")`. The modal is declared once, then can be re-used infinitely. Other modals that are declared will all follow the same event-driven pattern (although the problem of uneven UX still exists if different programmers use loading spinners and such in uneven ways, but it will be easier to homogenize than hand-crafted show functions).

## Modular Organization
EventUI is organized as a collection JavaScript codefiles, each of which contains a module (note: not an ECMA module export, but rather just a vanilla codefile with a single piece of functionality - module exports are coming soon), and some modules are reliant on other modules to do their jobs. 

The primary modules encapsulate UI components and functionality (modals, dropdowns, dialogs, data binding, tree views, etc), and the supporting modules (object diffs and observers, lightweight html object model, runtime css class composition, http helpers, html partial loading, custom events) are components used by the main components to do their jobs.