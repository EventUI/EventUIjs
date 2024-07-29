/**Copyright (c) 2024 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

/**Module for containing a DOM helper utility for simple DOM manipulation.
@module*/
EVUI.Modules.Dom = {};

EVUI.Modules.Dom.Dependencies =
{
    Core: Object.freeze({ required: true }),
    DomTree: Object.freeze({ required: false})
};

(function ()
{
    var checked = false;

    Object.defineProperty(EVUI.Modules.Dom.Dependencies, "checked",
        {
            get: function () { return checked; },
            set: function (value)
            {
                if (typeof value === "boolean") checked = value;
            },
            configurable: false,
            enumberable: true
        });
})();

Object.freeze(EVUI.Modules.Dom.Dependencies);

/**Constants table for variables related to getting references to UI controls.*/
EVUI.Modules.Dom.Constants = {};

EVUI.Modules.Dom.Constants.PreviousDisplayState = "evuiDisplayState";

/**A function that handles a generic browser event.
@param {Event} browserEvent The browser's Event object, which will be different depending on the type of event that was raised.*/
EVUI.Modules.Dom.Constants.Fn_BrowserEventHandler = function (browserEvent) { };

Object.freeze(EVUI.Modules.Dom.Constants);

/**Utility for lazily getting a reference to a HTMLElement that exists in the DOM by its ID.
@class
@param {String} id The ID of an element to find (without the #).
@param {Object} attributes Any special metadata about the control to associate with it. */
EVUI.Modules.Dom.ControlInfo = function (id, attributes)
{
    if (EVUI.Modules.Dom.Dependencies.checked !== true)
    {
        if (EVUI.Modules.Core == null) throw Error("Dependency missing: EVUI.Modules.Core is required.");
        EVUI.Modules.Core.Utils.requireAll(EVUI.Modules.Dom.Dependencies);
    }

    if (typeof id !== "string") throw Error("ID must be a string.");

    var _id = id;

    /**@type {HTMLElement} */
    var _control = null;
    var _helper = null;

    /**String. The HTML ID of the element being wrapped by the ControlInfo.
    @type {String}*/
    this.id = null;
    Object.defineProperty(this, "id",
        {
            get: function () { return _id; },
            configurable: false,
            enumerable: true
        });

    /**Object. An Element with the given id.
    @type {HTMLElement}*/
    this.control = null;
    Object.defineProperty(this, "control",
        {
            get: function ()
            {
                return _control;
            },
            configurable: false,
            enumerable: true
        });

    /**A special property bag for containing any additional metadata about the control.
    @type {Object}*/
    this.attributes = (attributes == null) ? {} : attributes;

    /**Queries the DOM and gets a reference to the HTML Element with the given ID. If the DOM has already been queried, the query is skipped and the previously returned value is returned instead.
    @param {any} reQuery Whether or not to ignore the previously searched result and to force a new query for the Element.
    @returns {HTMLElement}*/
    this.getControl = function (reQuery)
    {
        if (reQuery !== true && _control != null) return _control;

        if (_id.startsWith("#") === true)
        {
            _control = document.getElementById(_id.substring(1));
        }
        else
        {
            _control = document.getElementById(_id);
        }

        return _control;
    };

    /**Queries the DOM and gets a reference to the HTML Element with the given ID. If the DOM has already been queried, the query is skipped and the previously returned value is returned instead.
    @param {any} reQuery Whether or not to ignore the previously searched result and to force a new query for the Element.
    @returns {EVUI.Modules.Dom.DomHelper}*/
    this.getHelper = function (reQuery)
    {
        if (reQuery !== true && _helper != null) return _helper;

        var control = this.getControl(reQuery);
        if (control == null) return null;

        _helper = new EVUI.Modules.Dom.DomHelper(control);
        return _helper;
    };
};

/**Utility object for common DOM manipulation.
@param {HTMLElement|HTMLElement[]|String|JQuery} elementsOrCssSelector Either an array of HTMLElements, a single HTMLElement, a jQuery object, a CSS selector, or a string of HTML.
@param {HTMLElement|JQuery} context A context node used to limit the scope of the search.
@class*/
EVUI.Modules.Dom.DomHelper = (function ()
{
    var _domMetadataPropName = null;
    var _snakeCaseRegex = /-[A-Za-z]{1}/gi;

    /** Utility object for common DOM manipulation.
    @param {HTMLElement|HTMLElement[]|String|JQuery} elementsOrCssSelector Either an array of HTMLElements, a single HTMLElement, a jQuery object, a CSS selector, or a string of HTML.
    @param {HTMLElement|JQuery} context A context node used to limit the scope of the search. */
    var DomHelper = function (elementsOrCssSelector, context)
    {
        if (EVUI.Modules.Dom.Dependencies.checked !== true)
        {
            if (EVUI.Modules.Core == null) throw Error("Dependency missing: EVUI.Modules.Core is required.");
            EVUI.Modules.Core.Utils.requireAll(EVUI.Modules.Dom.Dependencies);
        }

        /**The Elements contained within the DomHelper.
        @type {Node[]}*/
        this.elements = Object.freeze(processElements(elementsOrCssSelector, context));
    };

    /**Contains details about the state of a DOM node.
    @class*/
    var DomMetadata = function ()
    {
        /**String. The previous display property on a DOM node. Used to restore its original display property upon being un-hidden.
        @type {String}*/
        this.previousDisplayState = null;

        /**Boolean. Whether or not the previous display state was inlined on the element and not part of a class.
        @type {Boolean}*/
        this.displayStateWasInlined = false;
    };

    /**Gets a DomMetadata object from a Node.
    @param {Element} element The element to get the metadata from.
    @returns {DomMetadata}*/
    var getDomMetadata = function (element)
    {
        if (_domMetadataPropName == null) _domMetadataPropName = EVUI.Modules.Core.Utils.getHashCode("@EVUIDom:" + EVUI.Modules.Core.Utils.makeGuid()).toString(36);

        var metadata = element[_domMetadataPropName];
        if (metadata == null)
        {
            metadata = new DomMetadata();
            element[_domMetadataPropName] = metadata;
        }

        return metadata;
    };

    /**Function definition for iterating over a collection of elements.
     @param {Element} element The element to iterate over.*/
    var Fn_Element_Apply = function (element) { };

    /**Runs a function over an array of Elements.
    @param {Element[]} elements The elements to pass into the function.
    @param {Fn_Element_Apply} fn The function modifying the elements.*/
    var applyToAll = function (elements, fn)
    {
        if (elements == null) return;

        var numElements = elements.length;
        for (var x = 0; x < numElements; x++)
        {
            var ele = elements[x];
            if (ele == null) continue;

            fn(ele);
        }
    };

    /**Returns the first element in the DomHelper's elements array.
    @returns {Element}*/
    DomHelper.prototype.first = function ()
    {
        return this.elements[0];
    }

    /**Hides all the Elements in the DomHelper by setting their style's display property to "none".
    @returns {EVUI.Modules.Dom.DomHelper}*/
    DomHelper.prototype.hide = function ()
    {
        applyToAll(this.elements, function (element)
        {
            var nodeType = element.nodeType;
            if (nodeType !== Node.ELEMENT_NODE) return; //hiding only applies to elements

            var meta = getDomMetadata(element);

            var existingDisplayState = null;
            var hadInlinedDisplay = false;

            if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(element.style.display) == false) //get the inlined display style
            {
                existingDisplayState = element.style.display;
                hadInlinedDisplay = true;
            }

            if (existingDisplayState === "none") return; //already has an inlined display none on it, nothing to do

            if (existingDisplayState == null) //get the computed display style
            {
                var computedStyle = getComputedStyle(element);
                existingDisplayState = computedStyle.display;
                hadInlinedDisplay = false;
            }

            //remember the last display state so it can be restored when we show the element again
            meta.displayStateWasInlined = hadInlinedDisplay;
            meta.previousDisplayState = existingDisplayState;

            element.style.display = "none";
        });

        return this;
    };

    /**Shows all the Elements in the DomHelper by either restoring their previous display value or setting their style's display value to "inline-block".
    @returns {EVUI.Modules.Dom.DomHelper}*/
    DomHelper.prototype.show = function ()
    {
        applyToAll(this.elements, function (element)
        {
            var nodeType = element.nodeType;
            if (nodeType !== Node.ELEMENT_NODE) return; //hiding only applies to elements

            var meta = getDomMetadata(element);

            if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(meta.previousDisplayState) === false)
            {
                if (meta.displayStateWasInlined === false) //part of the class - just remove the inlined display:none
                {
                    element.style.display = null;
                }
                else
                {
                    element.style.display = meta.previousDisplayState;
                }
            }
            else //had no display state, default to inline-block.
            {
                element.style.display = "inline-block";
            }

            meta.previousDisplayState = null;
            meta.displayStateWasInlined = false;
        });

        return this;
    };

    /**Gets the outerHeight of the first element in the elements array.
    @param {Boolean} includeMargin Whether or not to include the margin for calculating the outerHeight of the element.
    @returns {Numnber}*/
    DomHelper.prototype.outerHeight = function (includeMargin)
    {
        if (this.elements == null) return 0;
        if (this.elements.length > 0)
        {
            return outerHeight(this.elements[0], includeMargin)
        }
        else
        {
            return 0;
        }
    };

    /**Gets the outerWidth of the first element in the elements array.
    @param {Boolean} includeMargin Whether or not to include the margin for calculating the outerWidth of the element.
    @returns {Number}*/
    DomHelper.prototype.outerWidth = function (includeMargin)
    {
        if (this.elements == null) return 0;
        if (this.elements.length > 0)
        {
            return outerWidth(this.elements[0], includeMargin)
        }
        else
        {
            return 0;
        }
    };

    /**Appends content to the elements referenced by the DomHelper. Returns a new DomHelper with the new content.
    @param {String|Element} htmlOrElement Either a string of HTML or an Element to append to each element in the DomHelper.
    @returns {EVUI.Modules.Dom.DomHelper}*/
    DomHelper.prototype.append = function (htmlOrElement)
    {
        return injectHtml(this.elements, htmlOrElement, "append");
    };

    /**Prepends content to the elements referenced by the DomHelper. Returns a new DomHelper with the new content.
    @param {String|Element} htmlOrElement Either a string of HTML or an Element to prepend to each element in the DomHelper.
    @returns {EVUI.Modules.Dom.DomHelper}*/
    DomHelper.prototype.prepend = function (htmlOrElement)
    {
        return injectHtml(this.elements, htmlOrElement, "prepend");
    };

    /**Appends content to the elements referenced by the DomHelper. Returns a new DomHelper with the new content.
    @param {String|Element} htmlOrElement Either a string of HTML or an Element to insert before each element in the DomHelper.
    @returns {EVUI.Modules.Dom.DomHelper}*/
    DomHelper.prototype.insertBefore = function (htmlOrElement)
    {
        return injectHtml(this.elements, htmlOrElement, "before");
    };

    /**Appends content to the elements referenced by the DomHelper. Returns a new DomHelper with the new content.
    @param {String|Element} htmlOrElement Either a string of HTML or an Element to insert after each element in the DomHelper.
    @returns {EVUI.Modules.Dom.DomHelper}*/
    DomHelper.prototype.insertAfter = function (htmlOrElement)
    {
        return injectHtml(this.elements, htmlOrElement, "after");
    };

    /**Removes all the elements referenced by the DomHelper.
    @returns {EVUI.Modules.Dom.DomHelper}*/
    DomHelper.prototype.remove = function ()
    {
        applyToAll(this.elements, function (element)
        {
            if (element.nodeType === Node.TEXT_NODE || element.nodeType === Node.ELEMENT_NODE)
            {
                element.remove();
            }
        });

        return this;
    };

    /**Removes all child nodes from the elements references by the DomHelper.
    @returns {EVUI.Modules.Dom.DomHelper}*/
    DomHelper.prototype.empty = function ()
    {
        applyToAll(this.elements, function (element)
        {
            if (element.childNodes != null)
            {
                var node = element.childNodes[0];
                while (node != null)
                {
                    node.remove();
                    node = element.childNodes[0];
                }
            }

            if (element.textContent !== undefined) element.textContent = null;
        });

        return this;
    };

    /**Replaces all the content referenced by the DomHelper with the provided content.
    @param {String|Element} htmlOrElement Either a string of HTML, or an Element to replace the elements referenced by the DomHelper with.
    @returns {EVUI.Modules.Dom.DomHelper}*/
    DomHelper.prototype.replace = function (htmlOrElement)
    {
        var newContent = [];

        applyToAll(this.elements, function (element)
        {
            if (element.nodeType !== Node.ELEMENT_NODE && element.nodeType !== Node.TEXT_NODE) return;

            var htmlContent = ambiguousContentToHtmlArray(htmlOrElement);
            var frag = document.createDocumentFragment();

            var numContent = htmlContent.length;
            for (var x = 0; x < numContent; x++)
            {
                var content = htmlContent[x];

                frag.append(content);
                newContent.push(content);
            }

            element.replaceWith(frag);
        });

        return new EVUI.Modules.Dom.DomHelper(newContent);
    };

    /**Gets the offset of the first element in the elements array relative to its position in the window.
    @returns {EVUI.Modules.Dom.ElementBounds}*/
    DomHelper.prototype.offset = function ()
    {
        var offset = new EVUI.Modules.Dom.ElementBounds();

        if (this.elements == null || this.elements.length === 0) return offset;

        var element = this.elements[0];

        if (element === window)
        {
            offset.top = window.scrollY;
            offset.left = window.scrollX;
            offset.bottom = window.scrollY + this.outerHeight();
            offset.right = window.scrollX + this.outerWidth();

            return offset;
        }

        if (element instanceof DocumentFragment) return offset;

        var inlinedDisplay = element.style.display;
        element.style.display = "inline-block"; //this fixes issues with elements with no measurements on them not reflecting their children's dimensions

        var bounds = element.getBoundingClientRect()

        offset.left = bounds.left + window.scrollX;
        offset.top = bounds.top + window.scrollY;
        offset.right = offset.left + bounds.width
        offset.bottom = offset.top + bounds.height;

        element.style.display = inlinedDisplay;

        return offset;
    };

    /**Gets or sets an attribute value on the elements referenced by the DomHelper. Removes the attribute if the value is null, otherwise it returns the first element's attribute value.
    @param {String} key The name of the attribute to get or set.
    @param {String} value The value to set the attribute to.
    @returns {String|EVUI.Modules.Dom.DomHelper}*/
    DomHelper.prototype.attr = function (key, value)
    {
        if (this.elements == null || EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(key) === true) return;

        if (value === undefined)
        {
            return (this.elements.length === 0) ? null : this.elements[0].getAttribute(key);
        }

        applyToAll(this.elements, function (element)
        {
            if (element.nodeType === Node.ELEMENT_NODE)
            {
                if (value === null)
                {
                    element.removeAttribute(key);
                }
                else
                {
                    element.setAttribute(key, value.toString());
                }
            }
        });

        return this;
    };

    /**Adds a class to every element referenced by the DomHelper.
    @param {String|String[]} cssClass Either a single CSS class name, a string of space-separated CSS class names, or an array of CSS class names.
    @returns {EVUI.Modules.Dom.DomHelper} */
    DomHelper.prototype.addClass = function (cssClass)
    {
        classOp(this.elements, cssClass, "add");
        return this;
    };

    /**Removes a class from every element referenced by the DomHelper.
    @param {String|String[]} cssClass Either a single CSS class name, a string of space-separated CSS class names, or an array of CSS class names.
    @returns {EVUI.Modules.Dom.DomHelper} */
    DomHelper.prototype.removeClass = function (cssClass)
    {
        classOp(this.elements, cssClass, "remove");
        return this;
    };

    /**Adds a class to every element referenced by the DomHelper.
    @param {String|String[]} cssClass Either a single CSS class name, a string of space-separated CSS class names, or an array of CSS class names.
    @param {Boolean} force If true, forces the class to be added to the element. If false, forces the class to be removed from the element.
    @returns {EVUI.Modules.Dom.DomHelper} */
    DomHelper.prototype.toggleClass = function (cssClass, force)
    {
        classOp(this.elements, cssClass, "toggle", force);
        return this;
    };

    /**Returns whether or not ANY of the elements referenced by the DomHelper have the given CSS class. If inclusive is set to true, this returns whether or not ALL elements have the given class.
    @param {Strign} cssClass The CSS class to test for the presence of.
    @param {any} inclusive If set to true, ensures that all elements referenced by the DomHelper have the given CSS class.
    @returns {Boolean}*/
    DomHelper.prototype.hasClass = function (cssClass, inclusive)
    {
        if (typeof cssClass !== "string" || this.elements == null) return false;

        var found = false;
        var numEles = this.elements.length;
        for (var x = 0; x < numEles; x++)
        {
            var curEle = this.elements[x];
            if (curEle.nodeType !== Node.ELEMENT_NODE) continue;

            var hasClass = curEle.classList.contains(cssClass);
            if (inclusive === true && hasClass === false) return false;
            if (hasClass === true)
            {
                found = true;
                if (inclusive !== true) break;
            }
        }

        return found;
    };

    /**Sets the innerText of all elements referenced by the DomHelper.
    @param {String} text The value to set the inner text to.
    @returns {EVUI.Modules.Dom.DomHelper} */
    DomHelper.prototype.text = function (text)
    {
        applyToAll(this.elements, function (element)
        {
            if (element.innerText === undefined) return;
           
            element.innerText = text;
        });

        return this;
    };

    /**Adds an event listener to each matched element with the given handler for the provided events.
    @param {String|String[]} event Either a single event name, or an array of event names, or a space delineated string of event names to add.
    @param {EVUI.Modules.Dom.Constants.Fn_BrowserEventHandler} handler The event handling function to listen for the events. */
    DomHelper.prototype.on = function (event, handler)
    {
        if (event == null || typeof handler !== "function" || this.elements == null) return;

        if (typeof event === "string") event = event.split(/\s+/);
        if (EVUI.Modules.Core.Utils.isArray(event) === false) event = [event];
        var numEvents = event.length;

        if (numEvents == 0) return;

        applyToAll(this.elements, function (element)
        {
            if (element instanceof DocumentFragment === true) return;
            for (var x = 0; x < numEvents; x++)
            {
                var curEvent = event[x];
                if (typeof curEvent !== "string") continue;

                element.addEventListener(curEvent, handler);
            }
        });
    };

    /**Removes an event listener from each matched element with the given handler for the provided events. Requires that both the name and the handling function reference match those that were originally added to the element.
    @param {String|String[]} event Either a single event name, or an array of event names, or a space delineated string of event names to remove.
    @param {EVUI.Modules.Dom.Constants.Fn_BrowserEventHandler} handler The event handling function to remove from the elements's event listeners. */
    DomHelper.prototype.off = function (event, handler)
    {
        if (event == null || typeof handler !== "function" || this.elements == null) return;

        if (typeof event === "string") event = event.split(/\s+/);
        if (EVUI.Modules.Core.Utils.isArray(event) === false) event = [event];
        var numEvents = event.length;

        if (numEvents == 0) return;

        applyToAll(this.elements, function (element)
        {
            if (element instanceof DocumentFragment) return;
            for (var x = 0; x < numEvents; x++)
            {
                var curEvent = event[x];
                if (typeof curEvent !== "string") continue;

                element.removeEventListener(curEvent, handler);
            }
        });
    };

    /**Either gets the value of the first element referenced by the DomHelper or sets the value of the first element referenced by the DomHelper.
    @param {Any} value The value to set. If omitted, returns the value instead.
    @returns {Any|EVUI.Modules.Dom.DomHelper} */
    DomHelper.prototype.val = function (value)
    {
        if (this.elements.length === 0) return;
        if (typeof value !== "undefined")
        {
            this.elements[0].value = value;
            return this;
        }
        else
        {
            return this.elements[0].value;
        }
    };

    /**Either gets the computed style value of the first matching element, or sets CSS properties on a variety 
    @param {String|Object} propName Either the name of the CSS property to get or set, or an object containing the properties to set.
    @param {String|Number} propValue The value to set a CSS property to.*/
    DomHelper.prototype.css = function (propName, propValue)
    {
        if (this.elements.length === 0) return;
        if (typeof propName === "string") //either getting or setting a CSS property value
        {
            propName = normalizeStylePropertyName(propName); //normalize snake-case to camelCase
            if (propName == null) return;

            if (typeof propValue === "undefined") //no value provided, we are getting a vaue
            {
                try
                {
                    return getComputedStyle(this.elements[0])[propName]
                }
                catch (ex)
                {
                    return;
                }
            }
            else //value provided, set for all elements
            {
                applyToAll(this.elements, function (curEle)
                {
                    if (curEle.style == null) return;
                    curEle.style[propName] = propValue;
                });
            }
        }
        else if (EVUI.Modules.Core.Utils.isObject(propName) === true) //we were passed an object of key-value pairs of CSS properties to populate
        {
            //build a dictionary and array list of camelCase properties and their respective values
            var settingsObj = {};
            var settingsProps = [];
            var numProps = 0;
            for (var prop in propName)
            {
                var camelCaseProp = normalizeStylePropertyName(prop);
                if (prop == null) continue;

                settingsObj[camelCaseProp] = propName[prop];
                numProps = settingsProps.push(camelCaseProp);
            }

            //set all values for all elements
            applyToAll(this.elements, function (ele)
            {
                if (ele.style == null) return;

                for (var x = 0; x < numProps; x++)
                {
                    var curProp = settingsProps[x]
                    ele.style[curProp] = settingsObj[curProp];
                }
            });
        }
    };

    /**Turns a snake-case string into a camel case string. 
    @param {String} propName The string to convert.
    @returns {String}*/
    var normalizeStylePropertyName = function (propName)
    {
        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(propName) === true) return null;
        return propName.replace(_snakeCaseRegex, function (value)
        {
            return value.substring(1, value.length).toUpperCase();
        })
    };

    /**Performs an operation on the set of elements pertaining to a CSS class.
    @param {Element[]} elements The elements that are the target of the class operation.
    @param {String|String[]} cssClasses The CSS classes that are the subject of the operation.
    @param {String} op The operation to perform. Can be one of the following: add, remove, or toggle.
    @param {Boolean} force In a "toggle" context, and is true, forces the class to be added to the element. If false, forces the class to be removed from the element.*/
    var classOp = function (elements, cssClasses, op, force)
    {
        if (cssClasses == null || elements == null) return;

        if (typeof cssClasses === "string") cssClasses = cssClasses.split(/\s+/);
        if (EVUI.Modules.Core.Utils.isArray(cssClasses) === false) cssClasses = [cssClasses];
        var numClasses = cssClasses.length;

        if (numClasses == 0) return;

        applyToAll(elements, function (element)
        {
            if (element.nodeType !== Node.ELEMENT_NODE) return;

            for (var x = 0; x < numClasses; x++)
            {
                var curClass = cssClasses[x];
                if (typeof curClass !== "string") continue;

                switch (op)
                {
                    case "add":
                        element.classList.add(curClass);
                        break;

                    case "remove":
                        element.classList.remove(curClass);
                        break;

                    case "toggle":
                        if (typeof force === "boolean")
                        {
                            element.classList.toggle(curClass, force);
                        }
                        else
                        {
                            element.classList.toggle(curClass);
                        }

                        break;
                }
            }
        });
    }

    /**Gets the outerHeight of an element.
    @param {Element|Document|Window} element The element to get the outer hight of.
    @param {Bololean} includeMargin Whether or not to include the element's margins in the calculation.
    @returns {Number}*/
    var outerHeight = function (element, includeMargin)
    {
        if (element === window)
        {
            return document.documentElement.clientHeight;
        }
        else if (element.nodeType === Node.DOCUMENT_FRAGMENT_NODE)
        {
            return 0;
        }
        else if (element.nodeType === Node.DOCUMENT_NODE)
        {
            return Math.max(document.documentElement.scrollHeight, document.documentElement.offsetHeight, document.documentElement.clientHeight);
        }
        else
        {
            var style = getComputedStyle(element);
            var rawHeight = parsePx(style.height);
            var borderTop = parsePx(style.borderTop);
            var borderBottom = parsePx(style.borderBottom);
            var border = borderTop + borderBottom;

            var marginTop = parsePx(style.marginTop);
            var marginBottom = parsePx(style.marginBottom);
            var margin = marginTop + marginBottom;

            var height = rawHeight + ((border > 0) ? border : 0);
            if (includeMargin === true && margin > 0) height += margin;

            return height;
        }
    };

    /**Gets the outerWidth of an element.
    @param {Element|Document|Window} element The element to get the outer width of.
    @param {Bololean} includeMargin Whether or not to include the element's margins in the calculation.
    @returns {Number}*/
    var outerWidth = function (element, includeMargin, style)
    {
        if (element === window)
        {
            return document.documentElement.clientWidth;
        }
        else if (element.nodeType === Node.DOCUMENT_FRAGMENT_NODE)
        {
            return 0;
        }
        else if (element.nodeType === Node.DOCUMENT_NODE)
        {
            return Math.max(document.documentElement.scrollWidth, document.documentElement.offsetWidth, document.documentElement.clientWidth);
        }
        else
        {
            var style = getComputedStyle(element);
            var rawWidth = parsePx(style.width);
            var borderLeft = parsePx(style.borderLeft);
            var borderRight = parsePx(style.borderRight);
            var border = borderLeft + borderRight;

            var marginLeft = parsePx(style.marginLeft);
            var marginRight = parsePx(style.marginRight);
            var margin = marginLeft + marginRight;

            var width = rawWidth + ((border > 0) ? border : 0);
            if (includeMargin === true && margin > 0) width += margin;

            return width;
        }
    };

    /**Takes a value in pixels (i.e. "5px") and turns it into a number.
    @param {String} pxValue The value as a string in pixels.
    @returns {Number} */
    var parsePx = function (pxValue)
    {
        var pxIndex = pxValue.indexOf("px");
        if (pxIndex > 0) pxValue = pxValue.substring(0, pxIndex);

        var value = parseFloat(pxValue);

        if (isNaN(value) === true) return 0;
        return value;
    };

    /**Takes a string of HTML and turns it into an array of nodes.
    @param {String} html The HTML to turn into Nodes.
    @returns {Node[]} */
    var htmlToElements = function (html)
    {
        if (EVUI.Modules.DomTree != null)
        {
            var frag = EVUI.Modules.DomTree.Converter.htmlToDocumentFragment(html);
            if (frag == null) return [];

            var eles = [];
            var numEles = frag.childNodes.length;
            for (var x = 0; x < numEles; x++)
            {
                eles.push(frag.childNodes[x]);
            }

            return eles;
        }

        var docFrag = document.createDocumentFragment();
        var element = document.createElement("div");
        element.innerHTML = html;

        var elements = [];
        var numChildren = element.childNodes.length;
        for (var x = 0; x < numChildren; x++)
        {
            var curEle = element.childNodes[0];
            docFrag.appendChild(curEle);
            elements.push(curEle);
        }

        return elements;
    };

    /**Turns ambiguous content into an array of Elements.
    @param {Any} htmlOrElement Can be any valid form of HTML string, document, window, node list, jQuery, DomHelper.
    @returns {HTMLElement[]}*/
    var ambiguousContentToHtmlArray = function (htmlOrElement)
    {
        var content = null;

        if (EVUI.Modules.Core.Utils.isElement(htmlOrElement) === true)
        {
            content = [htmlOrElement];
        }
        else if (htmlOrElement instanceof Document || htmlOrElement === window)
        {
            content = [htmlOrElement];
        }
        else if (htmlOrElement instanceof DocumentFragment)
        {
            content = [htmlOrElement];
        }
        else if (typeof htmlOrElement === "string")
        {
            content = htmlToElements(htmlOrElement);
        }
        else if (EVUI.Modules.Core.Utils.isjQuery(htmlOrElement) === true)
        {
            var jqEles = htmlOrElement;
            content = [];

            jqEles.each(function (index, element) { content.push(element) });
        }
        else if (htmlOrElement instanceof NodeList)
        {
            content = [];
            var numContent = htmlOrElement.length;
            for (var x = 0; x < numContent; x++)
            {
                content.push(htmlOrElement[x]);
            }
        }
        else if (EVUI.Modules.Core.Utils.isArray(htmlOrElement) === true)
        {
            content = [];
            var numEles = htmlOrElement.length;
            for (var x = 0; x < numEles; x++)
            {
                var item = htmlOrElement[x];
                if (EVUI.Modules.Core.Utils.isElement(item) || item instanceof DocumentFragment || item instanceof Document || item === window) content.push(item)
            }
        }
        else if (EVUI.Modules.Core.Utils.isDomHelper(htmlOrElement) === true)
        {
            content = htmlOrElement.elements.slice();
        }

        return content;
    };

    /**Injects HTML into the DOM and returns a DomHelper with the new content. 
     * @param {Element[]} elements The elements to have HTML content added to or around them.
     * @param {String|Element} htmlOrElement The content to add to or around the elements.
     * @param {String} action The action to perform. Can be one of: "append", "prepend", "after", or "before".
     */
    var injectHtml = function (elements, htmlOrElement, action) 
    {
        var newContent = [];

        applyToAll(elements, function (element)
        {
            if (element === window) return; //cant add DOM nodes to window
            if ((element === document || element instanceof DocumentFragment) && (action === "before" || action === "after")) return; //cant insert before/after a documentFragment because it isn't in the DOM

            //turn whatever the user gave us into an Element array
            var content = ambiguousContentToHtmlArray(htmlOrElement)

            //make a document fragment to stick the nodes into so we can add them to the DOM in one operation.
            var docFrag = document.createDocumentFragment();

            var numContent = content.length;
            for (var x = 0; x < numContent; x++)
            {
                //if we're adding DOM nodes that are already in the DOM, clone them so we don't remove them from their current location.
                var curContent = (EVUI.Modules.Core.Utils.isOrphanedNode(content[x]) === false) ? content[x].cloneNode(true) : content[x];

                if (curContent instanceof DocumentFragment)
                {
                    var numDocFragContent = curContent.childNodes.length;
                    for (var y = 0; y < numDocFragContent; y++)
                    {
                        newContent.push(curContent.childNodes[y]);
                    }

                    docFrag.appendChild(curContent);
                }
                else
                {

                    newContent.push(curContent);
                    docFrag.appendChild(curContent);
                }
            }

            switch (action)
            {
                case "append":
                    element.append(docFrag);
                    break;

                case "prepend":
                    element.prepend(docFrag);
                    break;

                case "before":
                    element.before(docFrag);
                    break;

                case "after":
                    element.after(docFrag);
                    break;

            }
        });

        return new EVUI.Modules.Dom.DomHelper(newContent);
    };

    /**If the CSS selector passed into the DomHelper has a context, this alters the selectors to not include elements outside of the context. 
    @param {String} selectorWithContext A CSS selector that has a context node to search inside of.
    @returns {String} */
    var scopeSelectors = function (selectorWithContext)
    {
        var totalSelector = "";
        var segments = selectorWithContext.split(",");
        var numSegments = segments.length;
        var validSelectors = 0;

        for (var x = 0; x < numSegments; x++)
        {
            var curSeg = segments[x].trim();
            if (curSeg.length === 0) continue;

            if (validSelectors > 0) totalSelector += ", ";
            totalSelector += ":scope " + curSeg;
            validSelectors++;
        }

        return totalSelector;
    };

    /**Processes the input to the DomHelper's constructor and builds the element list with the results.
    @param {any} elementsOrSelector The content to turn into a element array.
    @param {Element|DocumentFragment} context A context to narrow the search by.
    @returns {Element[]} */
    var processElements = function (elementsOrSelector, context)
    {
        if (typeof elementsOrSelector === "string" && elementsOrSelector.trim().startsWith("<") === false)
        {
            try //this will fail if we were handed a piece of HTML
            {
                var result = null;

                if (context != null)
                {
                    if (EVUI.Modules.Core.Utils.isElement(context))
                    {
                        result = context.querySelectorAll(scopeSelectors(elementsOrSelector));
                    }
                    else if (context instanceof Document || context instanceof DocumentFragment)
                    {
                        result = context.querySelectorAll(elementsOrSelector);
                    }
                    else if (EVUI.Modules.Core.Utils.isjQuery(context) === true && context.length > 0)
                    {
                        context = context[0];
                        result = context.querySelectorAll(scopeSelectors(elementsOrSelector));
                    }
                    else if (EVUI.Modules.Core.Utils.isDomHelper(context) === true && context.elements.length > 0)
                    {
                        context = context.elements[0];
                        result = context.querySelectorAll(scopeSelectors(elementsOrSelector));
                    }
                    else
                    {
                        throw Error("Invalid context.");
                    }
                }
                else
                {
                    result = document.querySelectorAll(elementsOrSelector);
                }
            }
            catch (ex)
            {
            }

            if (result == null) return [];

            elementsOrSelector = [];
            var numResult = result.length;
            for (var x = 0; x < numResult; x++)
            {
                elementsOrSelector.push(result[x]);
            }
        }
        else
        {
            elementsOrSelector = ambiguousContentToHtmlArray(elementsOrSelector);
        }

        if (elementsOrSelector == null) return [];

        elementsOrSelector = elementsOrSelector.filter(function (ele) { return ele instanceof Node || ele === window || ele === document || ele instanceof DocumentFragment });

        return elementsOrSelector;
    }

    return DomHelper;
}());

/**The current bounds of the element relative to the entire document using the current style and the outerWidth and outerHeight functions.
@class*/
EVUI.Modules.Dom.ElementBounds = function ()
{
    /**The top edge of the element.
    @type {Number}*/
    this.top = 0;

    /**The left edge of the element.
    @type {Number}*/
    this.left = 0;

    /**The bottom edge of the element.
    @type {Number}*/
    this.bottom = 0;

    /**The right edge of the element.
    @type {Number}*/
    this.right = 0;
};

/**Gets the ElementBounds relative to the current scrolled position of the window.
@returns {EVUI.Modules.Dom.ElementBounds}*/
EVUI.Modules.Dom.ElementBounds.prototype.toWindowRelativeBounds = function ()
{
    var xOffset = window.pageXOffset;
    var yOffset = window.pageYOffset;

    var newBounds = new EVUI.Modules.Dom.ElementBounds();
    newBounds.top = this.top - yOffset;
    newBounds.bottom = this.bottom - yOffset;
    newBounds.left = this.left - xOffset;
    newBounds.right = this.right - xOffset;

    return newBounds;
};

/**Gets a new instance of a ControlInfo.
@param {String} id The ID of the element the ControlInfo object is wrapping.
@returns {EVUI.Modules.Dom.ControlInfo}*/
$evui.control = function (id, attributes)
{
    return new EVUI.Modules.Dom.ControlInfo(id, attributes);
};

/**Gets a new instance of a DomHelper.
@param {HTMLElement|HTMLElement[]|String|JQuery|EVUI.Modules.Dom.DomHelper} elementsOrCssSelector Either an array of HTMLElements, a single HTMLElement, a jQuery object, a CSS selector, another DomHelper, or a string of HTML.
@param {HTMLElement|JQuery} context A context node used to limit the scope of the search.
@returns {EVUI.Modules.Dom.DomHelper} */
$evui.dom = function (elementsOrCssSelector, context)
{
    return new EVUI.Modules.Dom.DomHelper(elementsOrCssSelector, context);
};

Object.freeze(EVUI.Modules.Dom);