# EventUI

## Overview
EventUI is a JavaScript library of UI components centered around an event-based strategy for managing asynchronous logic when performing common UI tasks in data-driven web applications.

The primary issue that EventUI addresses is a problem that arises when some part of a standard UI operation - like showing a modal - needs some asynchronous behavior to be displayed or populated (like hitting a server for data that the modal will display or to get the markup of the modal itself), but the library/framework being used to manage the displaying of the modal doesn't give an adequate "hook" to do asynchronous logic in the 'show modal' process, which commonly results in an inelegant solution that can cause a race condition, a jerky UI experience, or a code pattern that is difficult to maintain or extend. 

EventUI addresses this problem by providing highly customizable UI components that come with built-in overridable event lifecycles where the events act as hooks where asynchronous code (or synchronous code - EventUI handles both cases) can be executed as part of the normal flow of a UI operation by blocking the progress of the operation until the event's code has completed. This makes it far easier to reason about doing things like show data driven modals with a consistent pattern that is easy for developers to implement.

