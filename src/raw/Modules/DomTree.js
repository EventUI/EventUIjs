/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/

/*#INCLUDES#*/

/*#BEGINWRAP(EVUI.Modules.DomTree|DT)#*/
/*#REPLACE(EVUI.Modules.DomTree|DT)#*/

/**Module for turning an Element, Document, or DocumentFragment into JSON and vice-versa.
@module*/
EVUI.Modules.DomTree = {};

/*#MODULEDEF(DT|"1.0"|"DomTree")#*/
/*#VERSIONCHECK(EVUI.Modules.DomTree|DT)#*/

EVUI.Modules.DomTree.Dependencies =
{
    Core: Object.freeze({ version: "1.0", required: true }),
};

(function ()
{
    var checked = false;

    Object.defineProperty(EVUI.Modules.DomTree.Dependencies, "checked",
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

Object.freeze(EVUI.Modules.DomTree.Dependencies);

EVUI.Modules.DomTree.Constants = {};

/**A selector function used to locate DomTreeElements in a hierarchy of DomTreeElements.
@param {EVUI.Modules.DomTree.DomTreeElement} domTree The DomTreeElement to test for a positive search result.
@returns {Boolean}*/
EVUI.Modules.DomTree.Constants.Fn_Selector = function (domTree) { };

/**Fiter function used for determining exception cases as to when to filter out in-line event handler attributes. Return true to NOT exclude the attribute.
@param {String} attributeName The name of the attribute.
@param {String} attributeValue The value of the attribute.
@returns {Boolean}*/
EVUI.Modules.DomTree.Constants.Fn_AttributeFilter = function (attributeName, attributeValue) { };

Object.freeze(EVUI.Modules.DomTree.Constants);

/**Utility serializer for turning HTML or XML into a JSON-serializable object structure and visa-versa.
@class*/
EVUI.Modules.DomTree.DomTreeConverter = function ()
{
    if (EVUI.Modules.Core == null) throw Error("Dependency missing: EVUI.Modules.Core is required.");
    EVUI.Modules.Core.Utils.requireAll(EVUI.Modules.DomTree.Dependencies);

    var _elementTypes = EVUI.Modules.DomTree.DomTreeElementType;
    var _externalResourceTags = ["a", "img", "svg", "link", "script", "audio", "embed", "object", "source", "video"];
    var _selfClosingTags = ["area", "base", "br", "col", "command", "embed", "hr", "img", "input", "link", "menuitem", "meta", "keygen", "param", "source", "track", "wbr"];
    var _unescapeHtml = /\&gt;|\&lt;/ig
    var _escapeCharacters = /\<!--|--\>|\<!\CDATA\[\[|\]\]\>/ig
    var _literalTextTags = /\<script|\<\/\s*script\s*\>|\<textarea|\<\/\s*textarea\s*\>|\<style|\<\/\s*style\s*\>|\<pre|\<\/\s*pre\s*\>|\<code|\<\/\s*code\s*\>/ig
    var _quotesAndComments = /\'|\"|\/\*|\*\/|\/\/"|`/g; //match any: ', ", //, /*, */
    var _tagOpenCloses = /\<\/|\/\>|<|\>/g; //match: </, />, <, >
    var _tagNameEnd = /\s|\>|\//; //match: whitespace, >, /
    var _tagNameStart = /\<|\<\/\s*/; //match: <, or </(whitespace)    
    var _attributeComponents = /\\"|\\'|"|'|=/g //match: escaped quote, escaped double quote, quote, double quote, and equals signs
    var _eventHandlerAttributeStart = /^on/i;
    var _canMatchAll = typeof String.prototype.matchAll !== "undefined";
    var _tagCache = {};

    /**Object for containing the data about a serialization in progress.
    @class*/
    var DomTreeConversionSession = function ()
    {
        /**Object. The Document, HTMLElement, or DocumentFragment to get the DomTreeElement model from, or the DomTreeElement to turn into a Document, HTMLElement, or DocumentFragment.
        @type {Document|Element|DocumentFragment|DomTreeElement}*/
        this.source = null;

        /**Object. The options for the DomTree element conversion job.
        @type {EVUI.Modules.DomTree.DomTreeElementOptions}*/
        this.options = new EVUI.Modules.DomTree.DomTreeElementOptions();

        /**Boolean. Whether or not the output of turning a DomTreeElement into HTML should output the raw string and not try and parse it first.
        @type {Boolean}*/
        this.outputToString = false;

        /**Options for determing what content to filter out when converting a DomTreeElement into a Node.
        @type {DomTreeParseOptions}*/
        this.parseOptions = null;
    };

    /**Converts a HTMLElement, Document (XML or HTML), or DocumentFragment into a JSON structure representing the input.
    @param {HTMLElement|Document|DocumentFragment} source Any HTMLElement, Document (XML or HTML), or DocumentFragment to turn into a DomTreeElement hierarchy.
    @param {EVUI.Modules.DomTree.DomTreeElementOptions} options The options for creating the DomTreeElement hierarchy.
    @returns {EVUI.Modules.DomTree.DomTreeElement} */
    this.toDomTreeElement = function (source, options)
    {
        if (source == null) return null;

        var session = makeSession(source, options);
        return convertToDomTreeElements(session);
    };

    /**Converts a DomTree Object graph into a Document, HTMLElment, or DocumentFragment.
    @param {EVUI.Modules.DomTree.DomTreeElement} domTreeElement The Root element to convertFromString.
    @param {EVUI.Modules.DomTree.DomTreeElementOptions} options The options for reading the DomTreeElement hierarchy.
    @returns {HTMLElement|Document|DocumentFragment}*/
    this.fromDomTreeElement = function (domTreeElement, options)
    {
        if (domTreeElement == null) return null;

        var session = makeSession(domTreeElement, options);
        return convertFromDomTreeElement(session, false);
    };

    /**Converts a DomTree Object graph into a string of HTML.
    @param {EVUI.Modules.DomTree.DomTreeElement} domTreeElement The Root element to convertFromString.
    @param {EVUI.Modules.DomTree.DomTreeElementOptions} options
    @returns {String}*/
    this.fromDomTreeElementToString = function (domTreeElement, options)
    {
        if (domTreeElement == null) return null;

        var session = makeSession(domTreeElement, options);
        return convertFromDomTreeElement(session, true);
    };

    /**Converts a HTML string into a DocumentFragment containing the parsed HTML.
    @param {String} htmlString A string of HTML to turn into a DocumentFragment.
    @param {EVUI.Modules.DomTree.DomTreeElementOptions} options Options for controlling the turning of the HTML string into Nodes.
    @returns {DocumentFragment} */
    this.htmlToDocumentFragment = function (htmlString, options)
    {
        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(htmlString) === true) return null;
        var result = convertFromString(htmlString);
        return result.toNode(null, ensureParseOptions(options));
    };

    /**Converts a HTML string into a hierarchy of DomTreeElements representing a DocumentFragment containing the parsed HTML.
    @param {String} htmlString A string of HTML to turn into a hierarchy of DomTreeElements.
    @param {EVUI.Modules.DomTree.DomTreeElementOptions} options Options for controlling the turning of the HTML string into Nodes.
    @returns {EVUI.Modules.DomTree.DomTreeElement}*/
    this.htmlToDomTree = function (htmlString, options)
    {
        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(htmlString) === true) return null;
        var result = convertFromString(htmlString);
        return result.toDomTree(null, ensureParseOptions(options));
    };

    /**Makes a DomTreeConversionSession.
    @param {Any} input The Root element to convertFromString.
    @param {EVUI.Modules.DomTree.DomTreeElementOptions} options The Converter.Options passed into the main convertFromString function.*
    @returns {DomTreeConversionSession}*/
    var makeSession = function (input, options)
    {
        var session = new DomTreeConversionSession();
        session.source = input;
        if (options != null)
        {
            session.options = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.DomTree.DomTreeElementOptions(), options);
        }
        else
        {
            session.options = new EVUI.Modules.DomTree.DomTreeElementOptions();
        }

        if (EVUI.Modules.Core.Utils.isArray(session.options.omittedElements) === false)
        {
            session.options.omittedElements = [];
        }
        else
        {
            var omissions = [];
            var numOmissions = session.options.omittedElements.length;
            for (var x = 0; x < numOmissions; x++)
            {
                var curOmission = session.options.omittedElements[x];
                if (typeof curOmission !== "string") continue;

                omissions.push(curOmission.toLowerCase());
            }

            session.options.omittedElements = omissions;
        }

        session.parseOptions = buildDomTreeParseOptions(session.options);

        return session;
    };


    /**
    @param {EVUI.Modules.DomTree.DomTreeElementOptions} options The Converter.Options passed into the main convertFromString function.**/
    var buildDomTreeParseOptions = function (options)
    {
        var parseOptions = new DomTreeParseOptions();
        parseOptions.elementOptions = options;

        if (EVUI.Modules.Core.Utils.isArray(options.omittedElements) === true)
        {
            var numOmitted = options.omittedElements.length;
            for (var x = 0; x < numOmitted; x++)
            {
                parseOptions.omittedElementsDic[options.omittedElements[x]] = true;
            }
        }

        return parseOptions;
    }

    /**Translates a Document, DocumentFragment, or HTMLElment into a JSDONRXElement.
    @param {DomTreeConversionSession} session The conversion session that contains all the data relevant to the current conversion.
    @returns {EVUI.Modules.DomTree.DomTreeElement}*/
    var convertToDomTreeElements = function (session)
    {
        var isDocument = false;
        if (EVUI.Modules.Core.Utils.instanceOf(session.source, Document) === true)
        {
            isDocument = true;
            session.source = session.source.documentElement;
        }

        //do the recursive translation process
        var element = toDomTreeElement(session, session.source);
        if (element == null) return null;

        //set the mime-type of the converted top level element so we know what type of document to round-trip it into.
        if (isDocument === true)
        {
            element.type = _elementTypes.Document;
        }

        return element;
    };

    /**Converts an Element (either XML or HTML) into a DomTreeElement.
    @param {Element} element The element to convertFromString.
    @param {DomTreeConversionSession} session  The conversion session that contains all the data relevant to the current conversion.
    @param {EVUI.Modules.DomTree.DomTreeElement} parentElement The element that is the parent to this element.
    @param {Boolean} inShadowDom Whether or not the element is in the shadow DOM.*/
    var toDomTreeElement = function (session, element, parentElement, inShadowDom)
    {
        if (element == null) return null; //no element, no conversion
        
        var eleType = getDomTreeNodeType(element.nodeType);
        if (eleType === _elementTypes.Unknown) return null;  //unsupported node type, don't try and do anything

        var tagName = element.nodeName.toLowerCase(); //normalize tag name to lower case so we can check it against our list of excluded tags.

        //see if it is one of our omitted elements. If it is and we're not including the outer tag, just skip the whole element. Otherwise continue and the getContents function will skip over its contents.
        if (session.parseOptions.isOmittedTag(tagName) === true && session.options.includeOmittedElementOuterTag === false) return null;

        var domTreeEle = new EVUI.Modules.DomTree.DomTreeElement();
        domTreeEle.flags = getElementFlags(element);
        domTreeEle.type = eleType;
        domTreeEle.attrs = getAttrs(element); //make the attributes array
        domTreeEle.tagName = element.nodeName;
        domTreeEle.content = getContents(session, element, eleType); //get either a string of child content, null content (a self-closing tag), or an array of child elements.
        domTreeEle.shadowContent = (element.shadowRoot != null) ? getContents(session, element, eleType, true) : undefined;
        if (session.options.includeNodeReferences === true) domTreeEle.node = element;

        if (checkForExternalResources(session, element, domTreeEle, parentElement) == true)
        {
            domTreeEle.flags |= EVUI.Modules.DomTree.DomTreeElementFlags.HasForiegnResource;
        }

        if (inShadowDom === true || (parentElement != null && EVUI.Modules.Core.Utils.hasFlag(parentElement.flags, EVUI.Modules.DomTree.DomTreeElementFlags.IsInShadowDom)))
        {
            domTreeEle.flags |= EVUI.Modules.DomTree.DomTreeElementFlags.IsInShadowDom;
        }

        return domTreeEle;
    };

    /**Gets the flags for a given element.
    @param {Element} element The element to get flags for.
    @returns {Number}*/
    var getElementFlags = function (element)
    {
        if (element == null) return EVUI.Modules.DomTree.DomTreeElementFlags.Unknown;

        if (element instanceof HTMLElement) //its a HTML element
        {
            return EVUI.Modules.DomTree.DomTreeElementFlags.HTML;
        }
        else if (element instanceof CharacterData) //its character data, see what it's parent is
        {
            return getElementFlags(element.parentElement); //if this text node has no parent, the parse will fail.
        }
        else if (element instanceof Document) //its a document, check to see if it's a HTML or XML doc
        {
            if (element.documentElement instanceof HTMLElement) //the documentElement of a HTML doc is always a HTMLElement object
            {
                return EVUI.Modules.DomTree.DomTreeElementFlags.HTML;
            }
            else
            {
                return EVUI.Modules.DomTree.DomTreeElementFlags.XML;
            }
        }
        else if (element instanceof DocumentFragment) //the ownerdocument of a document fragment is going to be an HTMLElement if it belongs to an HTML tree, otherwise its XML
        {
            if (element.ownerDocument.body instanceof HTMLElement)
            {
                return EVUI.Modules.DomTree.DomTreeElementFlags.HTML
            }
            else
            {
                return EVUI.Modules.DomTree.DomTreeElementFlags.XML;
            }
        }
        else //not a doc, not a fragment, not explicitly an element. probably xml.
        {
            return EVUI.Modules.DomTree.DomTreeElementFlags.XML
        }
    };

    /**Checks to see if a element has an external resource that should be downloaded and stored as a dataURL.
    @param {DomTreeConversionSession} session The conversion session that contains all the data relevant to the current conversion.
    @param {Element} element The HTMLElement to check for external resources.
    @param {EVUI.Modules.DomTree.DomTreeElement} domTreeEle The converted DomTree element that is going to be injected with the result of media request (eventually).
    @param {EVUI.Modules.DomTree.DomTreeElement} parentElement The element that is the parent to this element, used to check for <source> tags's parents.*/
    var checkForExternalResources = function (session, element, domTreeEle, parentElement)
    {
        var externalResourceAttribute = getExternalResourceAttributeForTag(domTreeEle.tagName); //get the name of the attribute that contains the URL of the content to go get
        if (externalResourceAttribute == null) return false; //no attribute, no url, no content

        //set the URL of the attribute so it can be opened stand-alone and not on the host server the page is being serialized from if it was a relative link
        if (session.options.absoluteUrls === true && EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(url) === false)
        {
            //use a somewhat hacky way of getting the complete resource URL in case it's a partial URL (anchor tag manipulation)
            var url = getFullURL(getAttributeValue(domTreeEle, externalResourceAttribute));
            setAttributeValue(domTreeEle, externalResourceAttribute, url);
        }

        var parentTagName = (parentElement == null) ? null : parentElement.tagName.toLowerCase();

        if (domTreeEle.tagName === "link") //excluding link elements (CSS, Fonts, etc)
        {
            return true;
        }
        else if (domTreeEle.tagName === "video") //excluding video elements 
        {
            return true;
        }
        else if (domTreeEle.tagName === "script") //excluding script references
        {
            return true;
        }
        else if (domTreeEle.tagName === "source") //a source tag, make sure we obey the type of content we don't want to download
        {
            if (parentTagName === "video")
            {
                return true;
            }
        }

        return false;
    };

    /**Gets the attribute name for the tag that could contain external media.
    @param {String} tagName The tag name to get the usual external reference attribute for.
    @returns {String} */
    var getExternalResourceAttributeForTag = function (tagName)
    {
        if (typeof tagName !== "string") return null;
        tagName = tagName.toLowerCase();

        if (_externalResourceTags.indexOf(tagName) === -1) return null; //not one of our external media types, bail

        if (tagName === "link" || tagName === "a") //link tags use "href" for their resources
        {
            return "href";
        }
        else //all the others use "src"
        {
            return "src";
        }
    };

    /**A somewhat hacky way of getting the full URL, but it works.
    @param {any} partialURL A URL that may not be a complete URL.
    @returns {String} */
    var getFullURL = function (partialURL)
    {
        if (partialURL == null) return null;
        var aTag = document.createElement("a");
        aTag.href = partialURL;

        var fullURL = aTag.protocol + "//" + aTag.host + aTag.pathname;

        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(aTag.search) === false)
        {
            fullURL += ((EVUI.Modules.Core.Utils.stringStartsWith("?", aTag.search) === false) ? "?" + aTag.search : aTag.search);
        }

        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(aTag.hash) === false)
        {
            fullURL += ((EVUI.Modules.Core.Utils.stringStartsWith("#", aTag.hash) === false) ? "#" + aTag.hash : aTag.hash);
        }

        return fullURL;
    };

    /**Gets the value of an attribute. 
    @param {EVUI.Modules.DomTree.DomTreeElement} domTreeEle The element that contains the attribute.
    @param {String} attributeName The name of the attribute to get.
    @returns {String}*/
    var getAttributeValue = function (domTreeEle, attributeName)
    {
        if (domTreeEle.attrs == null || typeof attributeName !== "string") return null;
        attributeName = attributeName.toLowerCase();

        var numAttrs = domTreeEle.attrs.length;
        for (var x = 0; x < numAttrs; x++)
        {
            var curAttr = domTreeEle.attrs[x];
            var lowerKey = curAttr.key.toLowerCase();
            if (lowerKey === attributeName) return curAttr.val;
        }

        return null;
    };

    /**Gets the value of an attribute.
    @param {EVUI.Modules.DomTree.DomTreeElement} domTreeEle The element that contains the attribute.
    @param {String} attributeName The name of the attribute to set.
    @param {String} value The value to set the attribute to.
    @returns {String}*/
    var setAttributeValue = function (domTreeEle, attributeName, value)
    {
        if (domTreeEle.attrs == null || typeof attributeName !== "string" || value == null) return;
        attributeName = attributeName.toLowerCase();

        var numAttrs = domTreeEle.attrs.length;
        for (var x = 0; x < numAttrs; x++)
        {
            var curAttr = domTreeEle.attrs[x];
            var lowerKey = curAttr.key.toLowerCase();
            if (lowerKey === attributeName)
            {
                curAttr.val = value.toString();
                return;
            }
        }
    };

    /**Gets the DomTree node type based on the Element's nodeType property.
    @param {Number} nodeType The nodeType from an Element object.
    @returns {Number} */
    var getDomTreeNodeType = function (nodeType)
    {
        switch (nodeType)
        {
            case 1: //ELEMENT_NODE
                return _elementTypes.Element;
            case 3: //TEXT_NODE
                return _elementTypes.Text;
            case 4: //CDATA_SECTION_NODE
                return _elementTypes.CDATA;
            case 8: //COMMENT_NODE
                return _elementTypes.Comment;
            case 9: //DOCUMENT_NODE
                return _elementTypes.Document;
            case 11: //DOCUMENT_FRAGMENT_NODE
                return _elementTypes.DocumentFragment;
            default:
                return _elementTypes.Unknown;
        }
    };

    /** Gets an array of DomTreeElementAttribute objects representing all the attributes on the Element.
    @param {Element} element The Element to get the attributes of.
    @returns {EVUI.Modules.DomTree.DomTreeElementAttribute[]}*/
    var getAttrs = function (element)
    {
        var numAttrs = (element.attributes != null) ? element.attributes.length : 0;
        if (numAttrs === 0) return undefined;

        var domTreeAttrs = [];
        for (var x = 0; x < numAttrs; x++)
        {
            var curAttr = element.attributes[x];
            var domTreeAttr = new EVUI.Modules.DomTree.DomTreeElementAttribute();
            domTreeAttr.key = curAttr.name;
            domTreeAttr.val = curAttr.value;

            domTreeAttrs.push(domTreeAttr);
        }

        return domTreeAttrs;
    };

    /**Gets the inner contents of an DomTreeElement. Can be one of 4 things: null for a self-closing tag, an empty array for a tag with no children, an array of child DomTreeElements for child elements, or a string of text for a text node.
    @param {DomTreeConversionSession} session All the data relating to the
    @param {Element} element The element to get the contents of.
    @param {Number} elementType The EVUI.Modules.DomTree.DomTreeElementType enum value indicating the type of element.
    @param {Boolean} getShadowChildren Whether or not to get the shadow DOM children for the element.
    @returns {Null|[]|String|EVUI.Modules.DomTree.DomTreeElement[]}*/
    var getContents = function (session, element, elementType, getShadowChildren)
    {
        if (getShadowChildren === true && element.shadowRoot == null) return [];

        var tagName = element.nodeName.toLowerCase();
        if (tagName === "iframe") return [];
        if (session.parseOptions.isOmittedTag(tagName) === true && session.options.includeOmittedElementOuterTag === true) //its an omitted tag, but we're keeping the outer tag. Don't get its contents or leave it as a self-closing tag if it was one to start with.
        {
            var numChildren = element.children.length;
            if (numChildren === 0 && isSelfClosing(element, element.outerHTML) === true) return null;
            return [];
        }

        if (elementType === _elementTypes.Text || elementType === _elementTypes.CDATA || elementType === _elementTypes.Comment) //all text node types, just return the text
        {
            return (element.textContent == null) ? "" : element.textContent;
        }
        else if (elementType === _elementTypes.Document || elementType === _elementTypes.DocumentFragment || elementType === _elementTypes.Element) //all of the element types that can have children
        {
            var numChildren = (getShadowChildren === true) ? element.shadowRoot.childNodes.length : element.childNodes.length;
            if (numChildren === 0)
            {
                if (elementType === _elementTypes.Element)
                {
                    if (isSelfClosing(element, element.outerHTML) === true) return null; //null is our special value for self-closing tags
                    if (element.textContent != null && element.textContent.length > 0) return element.textContent; //if it is not self-closing, return the text content.
                    return []; //otherwise it has to children or no text content.
                }
                else
                {
                    return []; //otherwise it has to children or no text content.
                }
            }
            else //has children, recursively get the contents of each one
            {
                var children = [];
                var elementChildren = (getShadowChildren === true) ?  element.shadowRoot.childNodes : element.childNodes;
                for (var x = 0; x < numChildren; x++)
                {
                    var childEle = elementChildren[x];
                    var domTreeEle = toDomTreeElement(session, childEle, element, getShadowChildren);
                    if (domTreeEle != null) children.push(domTreeEle);
                }

                return children;
            }
        }
        else //don't know how to handle the node, crash.
        {
            throw new Error("Unknown node type: " + element.nodeType);
        }
    };

    /** Determines whether or not a node is self-closing.
    @param {Element} element Any Element.
    @param {String} outerHTML THe element's outerHTML.
    @returns {Boolean} */
    var isSelfClosing = function (element, outerHTML)
    {
        if (_selfClosingTags.indexOf(element.nodeName.toLowerCase()) !== -1) return true;
        return false;
    };

    /** Turns a DomTreeElement into a string, Document, HTMLElement, or DocumentFragment.
    @param {DomTreeConversionSession} session  The conversion session that contains all the data relevant to the current conversion.
    @param {EVUI.Modules.DomTree.DomTreeElement} element The DomTreeElement to turn into the output format.
    @returns {String|Document|DocumentFragment|Element[]}*/
    var convertFromDomTreeElement = function (session, toString)
    {
        var frag = domTreeToNodes(session, session.source);
        if (toString === true)
        {
            var div = document.createElement("div");
            div.appendChild(frag);

            return div.innerHTML;
        }
        else
        {
            return frag;
        }
    };

    /**Converts a DomTreeElement to a string.
    @param {DomTreeConversionSession} session The conversion session that contains all the data relevant to the current conversion.
    @param {EVUI.Modules.DomTree.DomTreeElement} element The element to turn into a string.
    @returns {String}*/
    var domTreeToElementString = function (session, element)
    {
        var outerHTML = "<" + element.tagName + "";
        var attributes = getAttributeString(session, element);

        if (element.content == null) //content is null, it's a self closing element
        {
            var closingTag = "/>";

            if (attributes != null)
            {
                return outerHTML + " " + attributes + closingTag;
            }
            else
            {
                return outerHTML + " " + closingTag;
            }
        }
        else //content is not null, regular closing tag having element
        {
            var closingTag = "</" + element.tagName + ">";
            var contents = contentsToString(session, element.content);

            if (attributes != null)
            {
                return outerHTML + " " + attributes + ">" + contents + closingTag;
            }
            else
            {
                return outerHTML + ">" + contents + closingTag;
            }
        }
    };

    /**Gets a string that contains all of an element's attributes.
    @param {DomTreeConversionSession} session  The conversion session that contains all the data relevant to the current conversion.
    @param {EVUI.Modules.DomTree.DomTreeElement} element The element to get the attribute string of. 
    @returns {String}*/
    var getAttributeString = function (session, element)
    {
        if (element.attrs == null) return null; //no attributes, no string
        var dataURLAttr = null;

        if (element.DataUrl != null && element.DataUrl.Data != null) //we have a data URL, prepare to inject it into the appropriate element
        {
            dataURLAttr = element.DataUrl.AttributeName.toLowerCase();
        }

        var attrString = "";
        var numAttrs = element.attrs.length;
        for (var x = 0; x < numAttrs; x++)
        {
            var curAttr = element.attrs[x];
            if (curAttr.key.toLowerCase() === dataURLAttr) //matches our dataRL attribute, inject the data URL string
            {
                attrString += curAttr.key + "\=\"" + element.DataUrl.Data + ((x === numAttrs - 1) ? "\"" : "\" ");
            }
            else //otherwise put the value in as normal
            {
                attrString += curAttr.key + "\=\"" + curAttr.val + ((x === numAttrs - 1) ? "\"" : "\" ");
            }
        }

        return attrString;
    };

    /**Turns the inner contents of a DomTreeElement into a string.
    @param {DomTreeConversionSession} session The conversion session that contains all the data relevant to the current conversion.
    @param {EVUI.Modules.DomTree.DomTreeElement[]} elementContents The array of child elements to turn into content.
    @returns {String}*/
    var contentsToString = function (session, elementContents)
    {
        if (typeof elementContents === "string") return elementContents;

        var contents = "";
        if (EVUI.Modules.Core.Utils.isArray(elementContents) == false) return contents;

        var numContents = elementContents.length;
        for (var x = 0; x < numContents; x++)
        {
            contents += domTreeToElementString(session, elementContents[x]);
        }

        return contents;
    }

    /**Turns a DomTreeElement into the HTML or XML content it represents.
    @param {DomTreeConversionSession} session  The conversion session that contains all the data relevant to the current conversion.
    @param {EVUI.Modules.DomTree.DomTreeElement} domTreeEle The DomTreeElement to turn into a DOM object.
    @param {Node} parentNode The parent node of the node being created.
    @returns {Document|DcumentFragment} */
    var domTreeToNodes = function (session, domTreeEle, parentNode)
    {
        if (parentNode == null) parentNode = document.createDocumentFragment();
        var node = null;

        if (domTreeEle.type === EVUI.Modules.DomTree.DomTreeElementType.CDATA)
        {
            node = document.createCDATASection(domTreeEle.content);
        }
        else if (domTreeEle.type === EVUI.Modules.DomTree.DomTreeElementType.Comment)
        {
            node = document.createComment(unescapeText(domTreeEle.content));            
        }
        else if (domTreeEle.type === EVUI.Modules.DomTree.DomTreeElementType.Document)
        {
            return domTreeToDocument(session, domTreeEle);
        }
        else if (domTreeEle.type === EVUI.Modules.DomTree.DomTreeElementType.Element)
        {
            node = domTreeToElements(session, domTreeEle, parentNode);
        }
        else if (domTreeEle.type === EVUI.Modules.DomTree.DomTreeElementType.Text)
        {
            node = document.createTextNode(unescapeText(domTreeEle.content));
        }
        else if (domTreeEle.type === EVUI.Modules.DomTree.DomTreeElementType.DocumentFragment)
        {
            return domTreeToDocumentFragment(session, domTreeEle);
        }
        else
        {
            throw Error("Invalid element type.");
        }

        parentNode.appendChild(node);
        return parentNode;
    };

    /**Removes any special escaped characters from a HTML string.
    @param {String} str The string to unescape.
    @returns {String} */
    var unescapeText = function (str)
    {
        if (typeof str !== "string") return str;
        if (_unescapeHtml.test(str) === true)
        {
            return str.replace(_unescapeHtml, function (val)
            {
                if (val === "&gt;")
                {
                    return ">";
                }
                else if (val === "&lt;")
                {
                    return "<";
                }
                else
                {
                    return val;
                }
            });
        }
        else
        {
            return str;
        }
    };

    /**Turns a DomTreeElement into a Document object.
    @param {DomTreeConversionSession} session  The conversion session that contains all the data relevant to the current conversion.
    @param {EVUI.Modules.DomTree.DomTreeElement} domTreeEle The DomTree element to turn into a Document.
    @returns {Document}*/
    var domTreeToDocument = function (session, domTreeEle)
    {
        var isXML = EVUI.Modules.Core.Utils.hasFlag(domTreeEle.flags, EVUI.Modules.DomTree.DomTreeElementFlags.XML);

        if (typeof domTreeEle.content === "string" || domTreeEle.content == null)
        {
            var content = (domTreeEle.content == null) ? domTreeToElementString(session, domTreeToElementString) : domTreeEle.content;

            var parser = new DOMParser();
            return parser.parseFromString(content, (isXML === true) ? "text/xml" : "text/html");
        }
        else if (EVUI.Modules.Core.Utils.isArray(domTreeEle.content) === true)
        {
            var frags = [];
            var numChildren = domTreeEle.content.length;

            var html = null;
            var head = null;
            var body = null;
            var rootsFound = false;

            for (var x = 0; x < numChildren; x++)
            {
                var curContent = domTreeEle.content[x];
                var curFrag = domTreeToNodes(session, curContent);

                if (isXML === false && rootsFound === false)
                {
                    var lowerTagName = curContent.tagName.toLowerCase();
                    if (lowerTagName === "html")
                    {
                        html = curFrag;
                        rootsFound = true;
                    }
                    else if (lowerTagName === "head")
                    {
                        head = curFrag;
                    }
                    else if (lowerTagName === "body")
                    {
                        body = curFrag;
                    }

                    if (body != null && head != null) rootsFound = true;
                }

                frags.push(curFrag);
            }

            var parser = new DOMParser();
            var doc = parser.parseFromString("", (isXML === true) ? "text/xml" : "text/html");

            if (isXML === true)
            {
                doc.documentElement.childNodes.forEach(function (node) { node.remove(); });
                doc.documentElement.appendChild(frags[0].childNodes[0]);
            }
            else
            {
                if (html != null)
                {
                    doc.documentElement.replaceWith(html.childNodes[0]);
                }
                else
                {
                    if (head != null || body != null)
                    {
                        if (head != null) doc.head.replaceWith(head.childNodes[0]);
                        if (body != null) doc.body.replaceWith(body.childNodes[0]);
                    }
                    else
                    {
                        var numFrags = frags.length;
                        for (var x = 0; x < numFrags; x++)
                        {
                            doc.append(frags[x].childNodes);
                        }
                    }
                }
            }

            return doc;
        }

        return null;
    };

    /**Turns a DomTreeElement into a hierarchy of Element objects.
    @param {DomTreeConversionSession} session  The conversion session that contains all the data relevant to the current conversion.
    @param {EVUI.Modules.DomTree.DomTreeElement} domTreeEle The DomTreeElement to turn into a hierarchy of elements.
    @returns {Element} */
    var domTreeToElements = function (session, domTreeEle)
    {
        var node = null;

        if (domTreeEle.content == null)
        {
            var eleStr = domTreeToElementString(session, domTreeEle);
            var temp = document.createElement("div");
            temp.innerHTML = eleStr;

            node = temp.childNodes[0];
            node.remove();
        }
        else
        {
            node = document.createElement(domTreeEle.tagName);
            if (domTreeEle.attrs != null)
            {
                var numAttrs = domTreeEle.attrs.length;
                for (var x = 0; x < numAttrs; x++)
                {
                    var curAttr = domTreeEle.attrs[x];
                    node.setAttribute(curAttr.key, curAttr.val)
                }
            }

            if (typeof domTreeEle.content === "string")
            {
                node.textContent = domTreeEle.content;
                node.textContent = domTreeEle.content;
            }
            else if (EVUI.Modules.Core.Utils.isArray(domTreeEle.content) === true)
            {
                var numChildren = domTreeEle.content.length;
                for (var x = 0; x < numChildren; x++)
                {
                    domTreeToNodes(session, domTreeEle.content[x], node);
                }
            }
        }

        if (EVUI.Modules.Core.Utils.isArray(domTreeEle.shadowContent) === true)
        {
            var shadowParent = node.attachShadow({ mode: "open" });
            var numChildren = domTreeEle.shadowContent.length;
            for (var x = 0; x < numChildren; x++)
            {
                domTreeToNodes(session, domTreeEle.shadowContent[x], shadowParent);
            }
        }

        return node;
    };

    /**Turns a DomTreeElemenmt into a document fragment.
    @param {DomTreeConversionSession} session  The conversion session that contains all the data relevant to the current conversion.
    @param {EVUI.Modules.DomTree.DomTreeElement} domTreeEle The DomTreeElement to turn into a document fragment.
    @returns {DocumentFragment} */
    var domTreeToDocumentFragment = function (session, domTreeEle)
    {
        var docFrag = document.createDocumentFragment();
        if (typeof domTreeEle.content === "string")
        {
            docFrag.appendChild(domTreeEle.content);
        }
        else if (EVUI.Modules.Core.Utils.isArray(domTreeEle.content) === true)
        {
            var numContent = domTreeEle.content.length;
            for (var x = 0; x < numContent; x++)
            {
                domTreeToNodes(session, domTreeEle.content[x], docFrag);
            }
        }

        return docFrag;
    };

    /**Ensures that there is a valid DomTreeParseOptions object.
    @param {EVUI.Modules.DomTree.DomTreeElementOptions} options The user's options object.
    @returns {DomTreeParseOptions}*/
    var ensureParseOptions = function (options)
    {
        var newOptions = (options == null || typeof options !== "object") ? new EVUI.Modules.DomTree.DomTreeElementOptions() : EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.DomTree.DomTreeElementOptions(), options);
        return buildDomTreeParseOptions(newOptions);
    };

    /**Entry point into the conversion process where a string is turned into an object model that can be converted into actual DOM Nodes or DomTreeElements.
    @param {String} htmlString A string of HTML to parse.
    @returns {HtmlParseNode} */
    var convertFromString = function (htmlString)
    {
        //make a new session to hold the details of the conversion
        var session = new HtmlParseSession();
        session.rawHtml = htmlString;
        session.rawHtmlLength = htmlString.length;

        //get all the literal text spans - text that is not escaped because it is in quotes, graves, comments, literal html tags, etc
        session.literalTextSpans = getLiteralTextSpansFromQuotesAndComments(session);
        session.literalTextSpans = session.literalTextSpans.concat(getLiteralTextSpansFromTags(session));
        session.literalTextSpans.sort(function (a, b) { return a.start - b.start });

        //make the root block representing a document fragment
        var rootBlock = new HtmlParseNode();
        rootBlock.htmlContent = session.rawHtml;
        rootBlock.index = 0;
        rootBlock.length = session.rawHtml.length;
        rootBlock.blockType = EVUI.Modules.DomTree.DomTreeElementType.DocumentFragment;

        //get all the tag opens and closes that were NOT contained in any of the literal text spans.
        getTagOpensAndCloses(session);
        session.currentTagClose = session.tagCloses[0];
        session.currentTagOpen = session.tagOpens[0];

        //set the index of where we are in the literal text span array back to zero.
        session.lastTextSpanIndex = 0;

        //parse the HTML.
        return parseBlock(session, rootBlock);
    };

    /**Gets all the text that is inside of quotes, comments, graves, script tags, etc and keeps it around in an array so that we can double-check if any text later on in the parsing process is part of some non-escaped non-html text so that we know to skip it.
    @param {HtmlParseSession} session The parse session with all the details about the conversion.
    @returns {LiteralTextSpan[]} */
    var getLiteralTextSpansFromQuotesAndComments = function (session)
    {
        var allNonHtml = [];

        matchAll(session, _quotesAndComments, allNonHtml);
        matchAll(session, _escapeCharacters, allNonHtml);

        //get a complete array of all our matches and then sort it so that they are all in order.
        //var allNonHtml = allQuotesAndComments.concat(allEscaped);
        allNonHtml.sort(function (a, b) { return a.index - b.index; });

        var numMatches = allNonHtml.length;
        var inDoubleQuotes = false;
        var inSingleQuotes = false;
        var inMultiLineComment = false;
        var inGrave = false;
        var inComment = false;
        var inCData = false;
        var inHtmlOrCode = true;
        var spans = [];
        var startIndex = 0;

        //walk through each match and make little spans for the non-interpreted text. Once one type of block opens, the others are ignored until the block finishes because they can all contain each other.
        for (var x = 0; x < numMatches; x++)
        {
            var match = allNonHtml[x];

            if (match[0] === "/*") //start of a multi-line comment
            {
                if (inHtmlOrCode === true) //we're in the code, signal the start of a multi-line comment
                {
                    inMultiLineComment = true;
                    startIndex = match.index;
                    inHtmlOrCode = false;
                }
            }
            else if (match[0] === "*/") //end of a multi-line comment
            {
                if (inMultiLineComment === true) //ONLY if we had started a multi-line comment do we complete the span
                {
                    var span = new LiteralTextSpan();
                    span.start = startIndex;
                    span.end = match.index + match[0].length;
                    span.text = session.rawHtml.substr(span.start, span.end - span.start);

                    spans.push(span);

                    inMultiLineComment = false;
                    inHtmlOrCode = true;
                    startIndex = 0;
                }
            }
            else if (match[0] === "//") //single-line comment
            {
                if (inHtmlOrCode === true)
                {
                    var span = new LiteralTextSpan();
                    span.start = match.index;

                    var endMatch = session.rawHtml.indexOf("\n", match.index); //walk to the end of the line
                    if (endMatch === -1) session.rawHtml.indexOf("\r", match.index);
                    if (endMatch !== -1) //did we find the end of the line?
                    {
                        span.end = endMatch; //yes, capture everything up to the end
                    }
                    else //no, get the rest of the string
                    {
                        span.end = session.rawHtml.length;
                    }

                    span.text = session.rawHtml.substr(span.start, span.end - span.start);
                    spans.push(span);

                    //it is possible for there to be other comment/quote characters inside the sinlge-line comment, so we skip over all of them until we are onto the next line.
                    while (allMatches[x + 1].index < span.end)
                    {
                        x++;
                    }
                }
            }
            else if (match[0] === "\"") //either a start or end double-quote
            {
                var isEscaped = (match.index > 1 && session.rawHtml[match.index - 1] === '\\' && session.rawHtml[match.index - 2] != '\\'); //MAKE SURE IT IS NOT ESCAPED, THEY RUIN EVERYTHING
                if (isEscaped === true) continue;

                if (inHtmlOrCode === true) //start the double quotes session
                {
                    inHtmlOrCode = false;
                    inDoubleQuotes = true;
                    startIndex = match.index;
                }
                else //not in code text, see if we're in a double quote span
                {
                    if (inDoubleQuotes === true) //we are in a quote span, finish it off
                    {
                        var span = new LiteralTextSpan();
                        span.start = startIndex;
                        span.end = match.index + match[0].length;
                        span.text = session.rawHtml.substr(span.start, span.end - span.start);

                        spans.push(span);

                        inDoubleQuotes = false;
                        inHtmlOrCode = true;
                    }
                }
            }
            else if (match[0] === "\'") //either start or end of a single-quote span
            {
                var isEscaped = (match.index > 1 && session.rawHtml[match.index - 1] === '\\' && session.rawHtml[match.index - 2] != '\\'); //once again, make sure it's not escaped
                if (isEscaped === true) continue;

                if (inHtmlOrCode === true) //start the single quote span
                {
                    inHtmlOrCode = false;
                    inSingleQuotes = true;
                    startIndex = match.index;
                }
                else
                {
                    if (inSingleQuotes === true) //end the single quote span
                    {
                        var span = new LiteralTextSpan();
                        span.start = startIndex;
                        span.end = match.index + match[0].length;
                        span.text = session.rawHtml.substr(span.start, span.end - span.start);

                        spans.push(span);

                        inSingleQuotes = false;
                        inHtmlOrCode = true;
                    }
                }
            }
            else if (match[0] === "`")
            {
                var isEscaped = (match.index > 1 && session.rawHtml[match.index - 1] === '\\' && session.rawHtml[match.index - 2] != '\\'); //once again, make sure it's not escaped
                if (isEscaped === true) continue;

                if (inHtmlOrCode === true) //start the single quote span
                {
                    inHtmlOrCode = false;
                    inGrave = true;
                    startIndex = match.index;
                }
                else
                {
                    if (inGrave === true) //end the single quote span
                    {
                        var span = new LiteralTextSpan();
                        span.start = startIndex;
                        span.end = match.index + match[0].length;
                        span.text = session.rawHtml.substr(span.start, span.end - span.start);

                        spans.push(span);

                        inGrave = false;
                        inHtmlOrCode = true;
                    }
                }
            }
            else if (match[0] === "<!--") //starting a HTML comment
            {
                if (inHtmlOrCode === true)
                {
                    inHtmlOrCode = false;
                    startIndex = match.index + match[0].length;
                    inComment = true;
                }
            }
            else if (match[0] === "-->") //ending a HTML content
            {
                if (inHtmlOrCode === false && inComment === true)
                {
                    var span = new LiteralTextSpan();
                    span.start = startIndex;
                    span.end = match.index;
                    span.text = session.rawHtml.substr(span.start, match.index);

                    spans.push(span);
                    inHtmlOrCode = true;
                    inComment = false;
                }
            }
            else if (match[0].toLowerCase() === "<!cdata[[") //in a CDATA section (even though those aren't in HTML, didn't know that when I wrote this)
            {
                if (inHtmlOrCode === true)
                {
                    inHtmlOrCode = false;
                    startIndex = match.index + match[0].length;
                    inCData = true;
                }
            }
            else if (match[0] === "]]>") //end of CDATA section
            {
                if (inHtmlOrCode === false && inCData === true)
                {
                    var span = new LiteralTextSpan();
                    span.start = startIndex;
                    span.end = match.index;
                    span.text = session.rawHtml.substr(span.start, match.index);

                    spans.push(span);
                    inHtmlOrCode = true;
                    inCData = true;
                }
            }
        }

        return spans;
    };

    /**Walks all the tags that can contain literal text (namely, '<' and '>') and add them to our text spans array. We do this after we get all the literal text spans in quotes and comments so that if we find a tag that's actually in a string we know to ignore it.
    @param {HtmlParseSession} session The parse session with all the details about the conversion.
    @returns {LiteralTextSpan[]}*/
    var getLiteralTextSpansFromTags = function (session)
    {
        var allFullText = matchAll(session, _literalTextTags);        

        //gets the end of the tag that contains the literal text. Not the closing tag, but the end of the opening tag.
        var getTagClosingBracket = function (index, endIndex)
        {
            var nextIndex = session.rawHtml.indexOf(">", index);
            while (nextIndex !== -1 && nextIndex < endIndex)
            {
                if (inLiteralString(session, nextIndex) === false) return nextIndex;
                nextIndex = session.rawHtml.indexof(">", nextIndex);
            }

            return -1;
        };

        var spans = [];
        var inScript = false;
        var inStyle = false;
        var inTextArea = false;
        var inPre = false;
        var inHtml = true;
        var numAll = allFullText.length;
        var startIndex = 0;

        //reset the span index so we start looking at the beginning
        session.lastTextSpanIndex = 0;

        for (var x = 0; x < numAll; x++)
        {
            var match = allFullText[x];
            var lastIndex = session.lastTextSpanIndex;

            if (inLiteralString(session, match.index) === true) continue; //our match was in a literal string, ignore it.

            var lowerMatch = match[0].toLowerCase();

            if (lowerMatch.indexOf("<script") !== -1) //start of a script tag
            {
                if (inHtml === true)
                {
                    inScript = true;
                    inHtml = false;
                    startIndex = match.index;
                }
            }
            else if (match[0].match(/\<\/\s*script/i) != null) //start of a script closing tag.
            {
                if (inScript === true)
                {
                    var span = new LiteralTextSpan();
                    var contentStartIndex = getTagClosingBracket(startIndex, match.index);
                    if (contentStartIndex === -1)
                    {
                        span.start = startIndex;
                    }
                    else
                    {
                        span.start = contentStartIndex + 1;
                    }

                    span.end = match.index;
                    span.text = session.rawHtml.substr(span.start, span.end - span.start);
                    spans.push(span);
                    session.lastTextSpanIndex = lastIndex;

                    inScript = false;
                    inHtml = true;
                }
            }
            else if (lowerMatch.indexOf("<textarea") !== -1) //start of a textarea input
            {
                if (inHtml === true)
                {
                    inTextArea = true;
                    inHtml = false;
                    startIndex = match.index;
                }
            }
            else if (match[0].match(/\<\/\s*textarea/i) != null) //end of a textarea input
            {
                if (inTextArea === true)
                {
                    var span = new LiteralTextSpan();
                    var contentStartIndex = getTagClosingBracket(startIndex, match.index);
                    if (contentStartIndex === -1)
                    {
                        span.start = startIndex;
                    }
                    else
                    {
                        span.start = contentStartIndex + 1;
                    }

                    span.end = match.index;
                    span.text = session.rawHtml.substr(span.start, span.end - span.start);
                    spans.push(span);
                    session.lastTextSpanIndex = lastIndex;

                    inTextArea = false;
                    inHtml = true;
                }
            }
            else if (lowerMatch.indexOf("<style") !== -1) //beginning of a style tag
            {
                if (inHtml === true)
                {
                    inStyle = true;
                    inHtml = false;
                    startIndex = match.index;
                }
            }
            else if (match[0].match(/\<\/\s*style/i) != null) //end of a style tag
            {
                if (inStyle === true)
                {
                    var span = new LiteralTextSpan();
                    var contentStartIndex = getTagClosingBracket(startIndex, match.index);
                    if (contentStartIndex === -1)
                    {
                        span.start = startIndex;
                    }
                    else
                    {
                        span.start = contentStartIndex + 1;
                    }

                    span.end = match.index;
                    span.text = session.rawHtml.substr(span.start, span.end - span.start);
                    spans.push(span);
                    session.lastTextSpanIndex = lastIndex;

                    inStyle = false;
                    inHtml = true;
                }
            }
            else if (lowerMatch.indexOf("<pre") !== -1) //start of a "pre" tag
            {
                if (inHtml === true)
                {
                    inPre = true;
                    inHtml = false;
                    startIndex = match.index;
                }
            }
            else if (match[0].match(/\<\/\s*pre/i) != null) //end of a "pre" tag
            {
                if (inPre === true)
                {
                    var span = new LiteralTextSpan();
                    var contentStartIndex = getTagClosingBracket(startIndex, match.index);
                    if (contentStartIndex === -1)
                    {
                        span.start = startIndex;
                    }
                    else
                    {
                        span.start = contentStartIndex + 1;
                    }

                    span.end = match.index;
                    span.text = session.rawHtml.substr(span.start, span.end - span.start);
                    spans.push(span);
                    session.lastTextSpanIndex = lastIndex;

                    inPre = false;
                    inHtml = true;
                }
            }
        }

        return spans;
    };

    /**Determines whether or not a given index is inside of a literal text span or not.
    @param {HtmlParseSession} session The parse session with all the details about the conversion.
    @param {Number} index The index to check.
    @returns {Boolean}*/
    var inLiteralString = function (session, index)
    {
        var numLiterals = session.literalTextSpans.length;
        var startIndex = (session.lastTextSpanIndex >= 0) ? session.lastTextSpanIndex : 0;

        for (var x = startIndex; x < numLiterals; x++)
        {
            var literal = session.literalTextSpans[x];
            if (index >= literal.start && index < literal.end) //in a string
            {
                session.lastTextSpanIndex = x; //set the start index so we don't start looking from zero again
                return true;
            }

            if (literal.start > index) //the text span's start is beyond the index, we are done.
            {
                session.lastTextSpanIndex = x;
                return false;
            }
        }

        return false;
    };

    /**Gets all the tag opens and closes that are not in literal strings or special tags. This gives us all the opens and closes of HTML elements in the string (and some badly formatted text content occasionally).
    @param {HtmlParseSession} session The parse session with all the details about the conversion.*/
    var getTagOpensAndCloses = function (session)
    {
        var allOpensAndCloses =  matchAll(session, _tagOpenCloses);

        session.lastTextSpanIndex = 0;
        var numOpenCloses = allOpensAndCloses.length;
        for (var x = 0; x < numOpenCloses; x++)
        {
            var curMatch = allOpensAndCloses[x];
            if (inLiteralString(session, curMatch.index) === true) continue;

            if (curMatch[0] === ">" || curMatch[0] === "/>") session.tagCloses.push(curMatch);
            if (curMatch[0] === "<" || curMatch[0] === "</") session.tagOpens.push(curMatch);
        }

        return;
    };

    /**Gets all the matches of a RegExp in a string.
    @param {HtmlParseSession|String} session The parse session with all the details about the conversion.
    @param {RegExp} regex The regular expression to iterate over again and again.
    @param {[]} matches An array to push the matches into.
    @returns {RegExpExecArray[]} */
    var matchAll = function (session, regex, matches)
    {
        if (matches == null) matches = [];
        if (typeof session === "string")
        {
            var tempSession =
            {
                rawHtml: session
            };

            session = tempSession;
        }

        if (_canMatchAll === true)
        {
            var allMatches = session.rawHtml.matchAll(regex);

            var match = allMatches.next();
            while (match != null && match.done !== true)
            {
                matches.push(match.value);
                match = allMatches.next();
            }
        }
        else
        {
            var match = regex.exec(session.rawHtml);
            while (match != null)
            {
                matches.push(match);
                match = regex.exec(session.rawHtml);
            }
        }

        return matches;
    };

    /**Parsing function for turning a HTML string into an object hierarchy that can be translated into Nodes or DomTreeElements.
    @param {HtmlParseSession} session The parse session with all the details about the conversion.
    @param {HtmlParseNode} parentNode The HTmlParseNode that is the parent of the current function context's parse.
    @returns {HtmlParseNode} */
    var parseBlock = function (session, parentNode)
    {
        var originalIndex = session.index;
        var blockEnd = parentNode.index + parentNode.length;
        var nextBlock = null;
        var previousToken = null;
        var previousTokenValue = null;
        var lastClose = null;
        var parentStack = [parentNode]; //the "stack" of parent elements are we drill deeper into a hierarchy of HTML. Parents are added when we go deeper and are popped off when we reach their closing tag.
        var parentStackLength = 0;
        var curParent = parentNode;

        while (session.index < session.rawHtmlLength && session.index < blockEnd) //while we have not gone outside the bounds of the block or the raw html string, keep looking for elements.
        {
            var curToken = getNextToken(session);
            if (curToken == null)  //no more tokens, we are done.
            {
                //make a text block out of whatever is left.
                var textBlock = getTextNode(session, session.rawHtmlLength);
                if (textBlock == null) return parentNode;

                if (parentNode.content == null) parentNode.content = [];
                parentNode.content.push(textBlock);
                return parentNode;
            }

            var tokenValue = curToken[0];

            if (tokenValue === "<" || tokenValue === "</") //token is a tag open of an opening tag or the open of a closing tag
            {
                session.currentTagOpen = curToken;
                if (lastClose == null || lastClose.index < curToken.index - 1 || previousTokenValue === ">") //if the last token was a tag close, check and see what content is between the two tags
                {
                    var textBlock = getTextNode(session, curToken.index); //the gap should always be a text block unless the gap space is zero characters long
                    if (textBlock != null)
                    {
                        if (curParent.content == null) curParent.content = [];
                        var childrenLength = curParent.content.length;
                        if (childrenLength > 0 && curParent.content[childrenLength - 1].tagName === "#text") //merge together two adjacent text nodes (which shouldn't ever happen, but dumb html with too many < or > that are outside of tags causes this sometimes)
                        {
                            curParent.content[childrenLength - 1].content += textBlock.content;
                        }
                        else
                        {
                            curParent.content.push(textBlock);
                        }
                    }
                }
                else if (previousTokenValue === "<" || previousTokenValue === "</") //bad html, keep going to the next tag
                {
                    session.tagOpenIndex++;
                    session.currentTagOpen = session.tagOpens[session.tagOpenIndex];

                    continue;
                }

                session.tagOpenIndex++;
                session.index = curToken.index;
                session.currentTagOpen = session.tagOpens[session.tagOpenIndex];

                previousToken = curToken;
                previousTokenValue = tokenValue;
            }            
            else if (tokenValue === ">" || tokenValue === "/>") //token is the close of an open tag or the close of a self-closing tag
            {
                session.currentTagClose = curToken;

                if (previousTokenValue === "<") //previous token was an open tag, we are in a tag body
                {
                    var newNode = new HtmlParseNode();
                    if (populateTagDetails(session, newNode, previousToken.index, curToken.index + 1) === true)
                    {
                        newNode.index = previousToken.index;
                        if (tokenValue === "/>") //self closing tag, no children possible
                        {
                            newNode.isSelfClosing = true;
                            if (curParent.content == null) curParent.content = [];
                            curParent.content.push(newNode);
                        }
                        else //not a self closing tag, it could have children so push it on to the bottom of the parent stack
                        {
                            if (newNode.blockType === EVUI.Modules.DomTree.DomTreeElementType.Comment)
                            {
                                if (curParent.content == null) curParent.content = [];
                                curParent.content.push(newNode);
                            }
                            else if (newNode.blockType === EVUI.Modules.DomTree.DomTreeElementType.CDATA)
                            {
                                if (curParent.content == null) curParent.content = [];
                                curParent.content.push(newNode);
                            }
                            else
                            {
                                parentStackLength = parentStack.push(curParent);
                                if (curParent.content == null) curParent.content = [];
                                curParent.content.push(newNode);
                                curParent = newNode;
                            }
                        }
                    }
                    else //failed to get tag details, usually due to malformed html. Keep going.
                    {
                        session.tagCloseIndex++;
                        session.currentTagClose = session.tagCloses[session.tagCloseIndex];

                        continue;
                    }
                }
                else if (previousTokenValue === "</" && tokenValue === ">") //we arrived at a closing tag. See if the tag name is the same as the current parent's tag name so we know we have reached a complete tag.
                {
                    var tag = session.rawHtml.substring(previousToken.index + 2, curToken.index + 1)
                    var tagName = getTagName(session, tag, tag.length, true);
                    if (curParent.tagName === tagName)
                    {
                        curParent.length = (curToken.index + tokenValue.length) - curParent.index;;
                        curParent = parentStack.pop();
                        parentStackLength--;
                    }
                }
                else if (previousTokenValue === ">" || previousTokenValue === "/>") //bad html, keep going to the next tag
                {
                    session.tagCloseIndex++;
                    session.currentTagClose = session.tagCloses[session.tagCloseIndex];

                    continue;
                }

                session.tagCloseIndex++;
                session.index = curToken.index + tokenValue.length;
                session.currentTagClose = session.tagCloses[session.tagCloseIndex];

                previousToken = curToken;
                previousTokenValue = tokenValue;
                lastClose = curToken;
            }
        }

        return parentNode;
    };

    /**Gets the next token (open or close bracket) in the HTML parse session. 
    @param {HtmlParseSession} session The parse session with all the details about the conversion.
    @returns {RegExpMatchArray}*/
    var getNextToken = function (session)
    {
        var tagCloseIndex = session.currentTagClose == null ? Number.MAX_VALUE : session.currentTagClose.index;
        var tagOpenIndex = session.currentTagOpen == null ? Number.MAX_VALUE : session.currentTagOpen.index;
        var earliestMatch = Math.min(tagOpenIndex, tagCloseIndex);

        if (earliestMatch === Number.MAX_VALUE) return null;
        if (earliestMatch === tagCloseIndex) return session.currentTagClose;
        if (earliestMatch === tagOpenIndex) return session.currentTagOpen;

        return null;
    };

    /**Makes a HtmlParseNode representing a text node.
    @param {HtmlParseSession} session  The parse session with all the details about the conversion.
    @param {Number} endIndex The ending index of the string of raw text in the rawHtml string.
    @returns {HtmlParseNode} */
    var getTextNode = function (session, endIndex)
    {
        if (session.index === endIndex) return null; //no string to return

        var rawContent = session.rawHtml.substring(session.index, endIndex);
        if (rawContent !== "")
        {
            var textBlock = new HtmlParseNode();
            textBlock.blockType = EVUI.Modules.DomTree.DomTreeElementType.Text;
            textBlock.index = session.index;
            textBlock.length = rawContent.length;
            textBlock.tagName = "#text";
            textBlock.content = rawContent;

            return textBlock;
        }

        return null;
    };

    /**Populates the tag details for a HtmlParseNode that is not a text node.
    @param {HtmlParseSession} session The parse session with all the details about the conversion.
    @param {HtmlParseNode} block The block being populated.
    @param {Number} openIndex The start index of the block's opening tag.
    @param {Number} closeIndex The end index of the block's opening tag.
    @returns {Boolean}*/
    var populateTagDetails = function (session, block, openIndex, closeIndex)
    {
        //get the full open tag for the content
        var tag = session.rawHtml.substring(openIndex, closeIndex);
        var tagLength = tag.length;

        //get the tag's name
        block.tagName = getTagName(session, tag, tagLength, false);
        if (block.tagName === "") //no tag name means invalid HTML
        {
            return false;
        }
        else if (block.tagName === "#comment")
        {
            block.blockType = EVUI.Modules.DomTree.DomTreeElementType.Comment;
            block.content = tag.substring(4, tagLength - 3);
        }
        else if (block.tagName === "#cdata")
        {
            block.blockType = EVUI.Modules.DomTree.DomTreeElementType.CDATA;
            block.content = tag.substring(9, tagLength - 3);
        }
        else //it wasn't a comment or CDATA, so it's a vanilla element. Go get it's attributes if it has any,
        {
            block.blockType = EVUI.Modules.DomTree.DomTreeElementType.Element;
            block.attributes = getTagAttributes(session, tag.substring(block.tagName.length + 1, tagLength - 1).trim());
        }

        return true;
    };

    /**Gets the name of a tag.
    @param {HtmlParseSession} session The parse session with all the details about the conversion.
    @param {String} tagContent The raw string of tag HTML.
    @param {Number} contentLength THe length of the raw string of tag HTML.
    @param {Boolean} getClosing Whether or not we are getting a closing tag.
    @returns {String}*/
    var getTagName = function (session, tagContent, contentLength, getClosing)
    {
        var hasAttributes = (getClosing === false) ? true : false;
        if (hasAttributes === true) hasAttributes = /\'|\"|\s/.test(tagContent);
            
        if (hasAttributes === false)
        {
            var existing = _tagCache[tagContent];
            if (existing != null) return existing;
        }

        var tagEnd = 0;
        var tagStart = 0;

        var startMatch = tagContent.match(_tagNameStart);
        if (startMatch != null)
        {
            tagStart = startMatch[0].length;
        }

        if (tagContent[tagStart] === "!") //special cases for comments and CDATA
        {
            if (contentLength > tagStart + 3 && tagContent.substr(tagStart + 1, 2) === "--") return "#comment";
            if (contentLength > tagStart + 9 && tagContent.substr(tagStart + 1, 7).toLowerCase() === "![cdata[") return "#cdata";
        }

        if (contentLength > 4 && getClosing === true) //special cases for getting a normalized tag name for comments and CDATA
        {
            if (tagContent[contentLength - 4] === "-" && tagContent[contentLength - 3] === "-") return "#comment";
            if (tagContent[contentLength - 4] === "]-" && tagContent[contentLength - 3] === "]") return "#cdata";
        }        

        //walk the string and stop at the first character that signals the end of the first word in the tag. This will be the tag name.
        for (var x = tagStart; x < contentLength; x++)
        {
            var curChar = tagContent[x];
            if (_tagNameEnd.test(curChar) === false)
            {
                tagEnd = x;
            }
            else
            {
                break;
            }
        }

        //return the substring from the tag content that is the tag name.
        var tagName = tagContent.substring(tagStart, tagEnd + 1).toUpperCase();

        if (hasAttributes === false)
        {
            _tagCache[tagContent] = tagName;
        }

        return tagName;
    };


    /**Walks the contents of a tag and pulls out all the attribute key-value pairs (or sometimes, just keys).
    @param {HtmlParseSession} session The parse session with all the details about the conversion.
    @param {String} tagContent The raw contents of the opening HTML tag.
    @returns {EVUI.Modules.DomTree.DomTreeElementAttribute[]}*/
    var getTagAttributes = function (session, tagContent)
    {
        if (tagContent === "") return [];
        //if (/\'|\"|\s/.test(tagContent) === false) return []; //if it has no quotes or whitespace it has no attributes

        var tempSession =
        {
            rawHtml: tagContent,
            attributes: []
        }

        //get all the characters that can mark the start or stop of an attribute in the tag
        var components = tagContent; //(_canMatchAll === true) ? Array.from(tagContent.matchAll(_attributeComponents)) : matchAll(tempSession, _attributeComponents);
        var numComponents = components.length;

        var lastIndex = 0;
        var lastEqualsIndex = 0;
        var quoteOpenIndex = 0;
        var inMarkup = true;
        var inSingleQuote = false;
        var inDoubleQuote = false;
        var inParens = false;

        for (var x = 0; x < numComponents; x++) //walk each component and figure out what is a key and what is a value.
        {
            //var curComponent = components[x];
            //var value = curComponent[0];

            var value = components[x];

            if (value === "=")
            {
                if (inMarkup === true)
                {
                    lastEqualsIndex = x; //curComponent.index;
                }
            }
            else if (value === "'")
            {
                //if (curComponent.index > 0 && tagContent[curComponent.index - 1] === "\\") continue;
                if (x > 0 && tagContent[x - 1] === "\\") continue;

                if (inDoubleQuote === true || inParens === true) continue;
                if (inSingleQuote === false)
                {
                    quoteOpenIndex = x;//curComponent.index;
                    inSingleQuote = true;
                    inMarkup = false;
                }
                else
                {
                    getAttribute(tempSession, lastIndex, lastEqualsIndex, quoteOpenIndex, x/*curComponent.index*/);
                    lastIndex = x + 1; //curComponent.index + 1;
                    inSingleQuote = false;
                    inMarkup = true;
                }
            }
            else if (value === "\"")
            {
                //if (curComponent.index > 0 && tagContent[curComponent.index - 1] === "\\") continue;
                if (x > 0 && tagContent[x - 1] === "\\") continue;

                if (inSingleQuote === true || inParens === true) continue;
                if (inDoubleQuote === false)
                {
                    quoteOpenIndex = x; //curComponent.index;
                    inDoubleQuote = true;
                    inMarkup = false;
                }
                else
                {
                    getAttribute(tempSession, lastIndex, lastEqualsIndex, quoteOpenIndex, x/*curComponent.index*/);
                    lastIndex = x + 1; //curComponent.index + 1;
                    inDoubleQuote = false;
                    inMarkup = true;
                }
            }
            else if (value === "(") //we mark parenthesis so that if we have a parameter list inside of an attribute value that has a literal string in it, we don't accidentally chop apart the attribute.
            {
                if (inSingleQuote === true || inDoubleQuote === true)
                {
                    inParens = true;
                }
            }
            else if (value === ")") //we mark parenthesis so that if we have a parameter list inside of an attribute value that has a literal string in it, we don't accidentally chop apart the attribute.
            {
                if (inSingleQuote === true || inDoubleQuote === true)
                {
                    inParens = false;
                }
            }
        }

        if (tempSession.attributes.length === 0 || lastIndex != tempSession.rawHtml.length)
        {
            var multipleAttributes = tagContent.substring(lastIndex, tempSession.rawHtml.length).trim().split(/\s+/g); //sometimes we have attributes with no "=" after them, but they are always separated by some whitespace. Grab any between the last attribute close and the next open.
            var numAttrs = multipleAttributes.length;
            if (numAttrs > 0)
            {
                for (var x = 0; x < numAttrs; x++)
                {
                    var attribute = new EVUI.Modules.DomTree.DomTreeElementAttribute();
                    attribute.key = multipleAttributes[x];
                    attribute.val = "";

                    tempSession.attributes.push(attribute);
                }
            }
        }

        return tempSession.attributes;
    };

    /**Makes an attribute based on the contents of a tag.
    @param {HtmlParseSession} tempSession A dummy session representing the contents of the html tag. Used to pass a reference to the HTML string around rather than passing the whole string for every attribute.
    @param {Number} lastIndex The index of the last attribute processed.
    @param {Number} lastEqualsIndex The index of the last equals sign processed int the string.
    @param {Number} quoteOpenIndex The index of where the quotes around the attribute value open.
    @param {Number} quoteCloseIndex The index where the quotes around the attribute value close.
    @returns {EVUI.Modules.DomTree.DomTreeElementAttribute} */
    var getAttribute = function (tempSession, lastIndex, lastEqualsIndex, quoteOpenIndex, quoteCloseIndex)
    {
        var attributeName = tempSession.rawHtml.substring(lastIndex, lastEqualsIndex).trim();
        if (attributeName.length === 0) return false;

        if (/\s+/.test(attributeName) === true)
        {
            var multipleAttributes = attributeName.split(/\s+/g); //sometimes we have attributes with no "=" after them, but they are always separated by some whitespace. Grab any between the last attribute close and the next open.
            var numAttrs = multipleAttributes.length;
            if (numAttrs > 1)
            {
                for (var x = 0; x < numAttrs - 1; x++)
                {
                    var attribute = new EVUI.Modules.DomTree.DomTreeElementAttribute();
                    attribute.key = multipleAttributes[x].toLowerCase(); //attribute names are ALWAYS lower case
                    attribute.val = "";

                    tempSession.attributes.push(attribute);
                }

                attributeName = multipleAttributes[numAttrs - 1];
            }
        }
        
        var value = tempSession.rawHtml.substring(quoteOpenIndex + 1, quoteCloseIndex);
        var attribute = new EVUI.Modules.DomTree.DomTreeElementAttribute();
        attribute.key = attributeName.toLowerCase();  //attribute names are ALWAYS lower case
        attribute.val = value;

        tempSession.attributes.push(attribute);

        return true;
    }

    /**The parse session with all the details about the conversion.
    @class*/
    var HtmlParseSession = function ()
    {
        /**String. The complete raw HTML string being parsed.
        @type {String}*/
        this.rawHtml = null;

        /**Number. The length of the raw HTML string being parsed.
        @type {String}*/
        this.rawHtmlLength = 0;

        /**Number. The current index of the parse operation in the HTML string.
        @type {Number}*/
        this.index = 0;

        /**Number. The index of the current tag open symbol in the tagOpens array.
        @type {Number}*/
        this.tagOpenIndex = 0;

        /**Number. The index of the current tag close symbol in the tagCloses array.
        @type {Number}*/
        this.tagCloseIndex = 0;

        /**Array. The sequentially ordered array of all the literal text spans in the HTML.
        @type {LiteralTextSpan[]}*/
        this.literalTextSpans = [];

        /**Number. The current index of the parse operation in the literalTextSpans array.*/
        this.lastTextSpanIndex = 0;

        /**Array. The array of every valid HTML tag open symbol in the rawHtml string.
        @type {RegExpMatchArray[]}*/
        this.tagOpens = [];

        /**Array. The array of every valid HTML close tag symbol in the rawHtml string.
        @type {RegExpMatchArray[]}*/
        this.tagCloses = [];

        /**Object. The current tag open token in the parse session.
        @type {RegExpMatchArray}*/
        this.currentTagOpen = null;

        /**Object. The current tag close token in the parse session.
        @type {RegExpMatchArray}*/
        this.currentTagClose = null;
    };

    /**An intermediary object that is created by parsing a HTML string and can be converted into DOM Nodes or DomTreeElements.
    @class*/
    var HtmlParseNode = function ()
    {
        /**Number. The starting index of the HtmlParseNode in the rawHtml string.
        @type {Number}*/
        this.index = -1;

        /**Number. The raw length of the tag's content's length in the rawHtml string.
        @type {Number}*/
        this.length = -1;

        /**Number. The type of block that was being parsed. Must be a value from the DomTreeElementType enum.
        @type {Number}*/
        this.blockType = EVUI.Modules.DomTree.DomTreeElementType.Unknown;

        /**String. The tag name of the HTML Node.
        @type {String}*/
        this.tagName = null;

        /**Array. An array of attribute key-value pairs that are associated with this Node.
        @type {EVUI.Modules.DomTree.DomTreeElementAttribute[]}*/
        this.attributes = [];

        /**String or Array. Either the child HtmlParseNodes of this node, or the raw text content of this Node.
        @type {String|HtmlParseNode[]}*/
        this.content = [];

        /**String. The rawHtml string of this Node.
        @type {String}*/
        this.htmlContent = null;

        /**Boolean. Whether or not this tag is self closing.
        @type {Boolean}*/
        this.isSelfClosing = false;
    };

    /**Recursively translates this HtmlParseNode into a DOM Node hierarchy.
    @param {Node} parent The parent Node of this Node.
    @param {DomTreeParseOptions} options Options for converting the parse node into a Node.
    @returns {Node} */
    HtmlParseNode.prototype.toNode = function (parent, options)
    {
        var node = null;
        if (this.blockType === EVUI.Modules.DomTree.DomTreeElementType.Text)
        {
            node = document.createTextNode(this.content);
        }
        else if (this.blockType === EVUI.Modules.DomTree.DomTreeElementType.DocumentFragment)
        {
            node = document.createDocumentFragment();

            var numChildren = this.content.length
            for (var x = 0; x < numChildren; x++)
            {
                var curChild = this.content[x];
                curChild.toNode(node, options);
            }
        }
        else if (this.blockType === EVUI.Modules.DomTree.DomTreeElementType.CDATA)
        {
            node = document.createCDATASection(this.content);
        }
        else if (this.blockType === EVUI.Modules.DomTree.DomTreeElementType.Comment)
        {
            node = document.createComment(this.content);
        }
        else
        {
            var noSrc = false;
            var noChildren = false;

            if (options.isOmittedTag(this.tagName) === true)
            {
                if (options.elementOptions.includeOmittedElementOuterTag === true)
                {
                    noChildren = true;
                    if (this.tagName === "script") noSrc = true;
                }
                else
                {
                    return null;
                }
            }

            node = document.createElement(this.tagName);

            var numAttrs = this.attributes.length;
            for (var x = 0; x < numAttrs; x++)
            {
                var curAttr = this.attributes[x];
                if (options.isOmittedAttribute(curAttr) === true) continue;
                if (noSrc === true && curAttr.key.toLowerCase() === "src") continue;

                node.setAttribute(curAttr.key, curAttr.val);
            }

            if (noChildren === false)
            {
                var numChildren = this.content.length
                for (var x = 0; x < numChildren; x++)
                {
                    var curChild = this.content[x];
                    curChild.toNode(node, options);
                }
            }
        }

        if (parent != null) parent.append(node);
        return node;
    };

    /**Recursively translates this HtmlParseNode into a DOM Node hierarchy.
    @param {EVUI.Modules.DomTree.DomTreeElement} parent The parent DomTreeElement of this Node.
    @param {DomTreeParseOptions} options Options for converting the parse node into a Node.
    @returns {EVUI.Modules.DomTree.DomTreeElement} */
    HtmlParseNode.prototype.toDomTree = function (parent, options)
    {

        var treeNode = new EVUI.Modules.DomTree.DomTreeElement();
        treeNode.flags = EVUI.Modules.DomTree.DomTreeElementFlags.HTML;
        treeNode.tagName = this.tagName;
        treeNode.type = this.blockType;

        if (this.blockType === EVUI.Modules.DomTree.DomTreeElementType.Text || this.blockType === EVUI.Modules.DomTree.DomTreeElementType.Comment || this.blockType === EVUI.Modules.DomTree.DomTreeElementType.CDATA)
        {
            treeNode.content = this.content;
        }
        else if (this.blockType === EVUI.Modules.DomTree.DomTreeElementType.DocumentFragment)
        {
            treeNode.content = [];
            var numChildren = this.content.length;
            for (var x = 0; x < numChildren; x++)
            {
                this.content[x].toDomTree(treeNode, options);
            }
        }
        else if (this.blockType === EVUI.Modules.DomTree.DomTreeElementType.Element)
        {
            var noSrc = false;
            var noChildren = false;

            if (options.isOmittedTag(this.tagName) === true)
            {
                if (options.elementOptions.includeOmittedElementOuterTag === true)
                {
                    noChildren = true;
                    if (this.tagName.toLowerCase() === "script") noSrc = true;
                }
                else
                {
                    return null;
                }
            }

            if (this.attributes != null)
            {
                var numAttr = this.attributes.length;
                if (numAttr > 0)
                {
                    if (noSrc === true)
                    {
                        treeNode.attrs = [];

                        for (var x = 0; x < numAttr; x++)
                        {
                            var curAttr = this.attributes[x];
                            if (curAttr.key === "src") continue;

                            treeNode.attrs.push(curAttr);
                        }
                    }
                    else
                    {
                        treeNode.attrs = this.attributes;
                    }                    
                }
            }

            if (this.isSelfClosing === true)
            {
                treeNode.content = null;
            }
            else
            {
                
                treeNode.content = [];

                if (noChildren === false)
                {
                    var numChildren = this.content.length;
                    for (var x = 0; x < numChildren; x++)
                    {
                        this.content[x].toDomTree(treeNode, options);
                    }
                }
            }
        }

        if (parent != null && parent.content != null) parent.content.push(treeNode);
        return treeNode;
    };

    /**Represents a span of text that should not be considered when looking for HTML tags.
    @class*/
    var LiteralTextSpan = function ()
    {
        /**Number. The starting index of the text span.
        @type {Number}*/
        this.start = -1;

        /**Number. The ending index of the text span.
        @type {Number}*/
        this.end = -1;

        /**String. The actual text of the span.
        @type {String}*/
        this.text = null;
    };

    /**Options for controlling how a string of HTML is parsed.
    @class*/
    var DomTreeParseOptions = function ()
    {
        /**
        @type {EVUI.Modules.DomTree.DomTreeElementOptions}*/
        this.elementOptions = null;

        /**Object. An object dictionary for all of the elements to be omitted keyed by their tag names.
        @type {{}}*/
        this.omittedElementsDic = {};

        /**Object. An object dictionary for all of the attributes to be omitted keyed by their attribute names.
        @type {{}}*/
        this.omittedAttributesDic = {};
    };

    /**Determins if a tag is an omitted tag or not.
    @param {String} tagName The name of the tag to check.*/
    DomTreeParseOptions.prototype.isOmittedTag = function (tagName)
    {
        if (typeof tagName !== "string") return true;
        if (this.omittedAttributesDic[tagName.toLowerCase()] === true) return true;

        return false;
    };

    /**Determines if an attribute is an omitted attribute or not.
    @param {EVUI.Modules.DomTree.DomTreeElementAttribute} attribute The attribute to test for inclusion.*/
    DomTreeParseOptions.prototype.isOmittedAttribute = function (attribute)
    {
        if (attribute == null || EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(attribute.key) == true) return true;
        var potentialMatch = false;

        var lowerKey = attribute.key.toLowerCase();

        if (this.omittedAttributesDic[lowerKey] === true)
        {
            potentialMatch = true;
        }
        else if (_eventHandlerAttributeStart.test(attribute.key) === true)
        {
            if (window[lowerKey] !== undefined)
            {
                this.omittedAttributesDic[lowerKey] = true;
                potentialMatch = true;
            }
        }

        if (potentialMatch === true)
        {
            if (this.elementOptions.inlineEventHandlerFilter instanceof RegExp)
            {
                if (this.elementOptions.inlineEventHandlerFilter.test(attribute.val) === true) return false;
            }
            else if (typeof this.elementOptions.inlineEventHandlerFilter === "function")
            {
                if (this.elementOptions.inlineEventHandlerFilter(attribute.key, attribute.val) === true) return false;
            }

            return true;
        }

        return false;
    };
};

/**A lightweight, JSON serializeable representation of a HTML or XML node's markup.
@class*/
EVUI.Modules.DomTree.DomTreeElement = function ()
{
    /**Number. Bit flags for describing special states or metadata that an element can have.
    @type {String}*/
    this.flags = EVUI.Modules.DomTree.DomTreeElementFlags.None;

    /**String. The tag name of the element.
    @type {String}*/
    this.tagName = undefined;

    /**Number. A value from the EVUI.Modules.DomTree.DomTreeElementType enum indicating the type of element.
    @type {Number}*/
    this.type = EVUI.Modules.DomTree.DomTreeElementType.Unknown;

    /**An array of EVUI.Modules.DomTree.DomTreeElementAttribute representing the attributes on the element.
    @type {EVUI.Modules.DomTree.DomTreeElementAttribute[]}*/
    this.attrs = undefined;

    /**String or Array. The contents of the Element.
    @type {Null|String|EVUI.Modules.DomTree.DomTreeElement[]}*/
    this.content = undefined;

    /**String or Array. The shadow contents of the Element.
    @type {Null|String|EVUI.Modules.DomTree.DomTreeElement[]}*/
    this.shadowContent = undefined;

    /**Object. The related node that the DomTreeElement was derived from.
    @type {Node}*/
    this.node = undefined;
};

/**Recursively turns this DomTreeElement into a DOM Node hierarchy. Assigns the node reference to this DomTreeElement and all of its children.
@param {EVUI.Modules.DomTree.DomTreeElementOptions} options Options to control how this DomTreeElement is turned into a Node.
@returns {Node}*/
EVUI.Modules.DomTree.DomTreeElement.prototype.toNode = function (options)
{
    if (this.node != null) return this.node;

    if (this.type === EVUI.Modules.DomTree.DomTreeElementType.DocumentFragment || this.type === EVUI.Modules.DomTree.DomTreeElementType.Document)
    {
        this.node = EVUI.Modules.DomTree.Converter.fromDomTreeElement(this, options);
    }
    else
    {
        this.node = EVUI.Modules.DomTree.Converter.fromDomTreeElement(this, options).childNodes[0];
    }

    var assignNodes = function (domTree, node)
    {
        if (typeof domTree.content === "string" || domTree.content == null) return;

        var numChildren = domTree.content.length;
        for (var x = 0; x < numChildren; x++)
        {
            var curChild = domTree.content[x];
            curChild.node = node.childNodes[x];

            assignNodes(curChild, curChild.node);
        }
    };

    assignNodes(this, this.node);
    return this.node;
};

/**Searches the DomTreeElement hierarchy looking for DomTreeElements that meet the predicate.
@param {EVUI.Modules.DomTree.Constants.Fn_Selector} selector The function used to select which DomTreeElements should be in the return set.
@param {Boolean} returnFirstMatch Whether or not to stop the search when the first match is found.
@returns {EVUI.Modules.DomTree.DomTreeElement[]}*/
EVUI.Modules.DomTree.DomTreeElement.prototype.search = function (selector, returnFirstMatch)
{
    var results = [];
    if (typeof selector !== "function") return results;

    if (selector(this) === true)
    {
        results.push(this);
        if (returnFirstMatch === true) return results;
    }

    if (this.content != null && typeof this.content !== "string")
    {
        var contentCopy = this.content.slice();
        var numChildren = contentCopy.length;
        for (var x = 0; x < numChildren; x++)
        {
            var curContent = contentCopy[x];
            var childResults = (curContent == null) ? null : curContent.search(selector);
            if (childResults != null)
            {
                var numResults = childResults.length;
                if (returnFirstMatch === true && numResults > 0) return childResults;

                for (var y = 0; y < numResults; y++)
                {
                    results.push(childResults[y]);
                }
            }
        }
    }

    return results;
};

/**Clones a DomTreeElement and optionally clones all of its children recursively.
@returns {EVUI.Modules.DomTree.DomTreeElement}*/
EVUI.Modules.DomTree.DomTreeElement.prototype.clone = function (recursive)
{
    var newEle = new EVUI.Modules.DomTree.DomTreeElement();
    if (this.attrs != null)
    {
        newEle.attrs = [];
        var numAttrs = this.attrs.length;
        for (var x = 0; x < numAttrs; x++)
        {
            var curAttr = this.attrs[x];
            var newAttr = new EVUI.Modules.DomTree.DomTreeElementAttribute();
            newAttr.key = curAttr.key;
            newAttr.val = curAttr.val;

            newEle.attrs.push(newAttr);
        }
    }

    newEle.flags = this.flags;
    newEle.tagName = this.tagName;
    newEle.type = this.type;

    if (this.content == null) return newEle;
    if (typeof this.content === "string")
    {
        newEle.content = this.content;
    }
    else if (EVUI.Modules.Core.Utils.isArray(this.content) === true)
    {
        newEle.content = [];
        if (recursive === true)
        {
            var numContent = this.content.length;
            for (var x = 0; x < numContent; x++)
            {
                newEle.content.push(this.content[x].clone(true));
            }
        }
    }

    if (EVUI.Modules.Core.Utils.isArray(this.shadowContent) === true)
    {
        newEle.shadowContent = [];
        if (recursive === true)
        {
            var numContent = this.shadowContent.length;
            for (var x = 0; x < numContent; x++)
            {
                newEle.content.push(this.shadowContent[x].clone(true));
            }
        }
    }

    return newEle;
};

/**Flags for describing special states or metadata about an Element.
@enum*/
EVUI.Modules.DomTree.DomTreeElementFlags =
{
    /**Default.*/
    None: 0,
    /**Element is a HTML node.*/
    HTML: 1,
    /**Element is a XML node.*/
    XML: 2,
    /**Element contains a reference to a foreign resource.*/
    HasForiegnResource: 4,
    /**Element exists in the shadow DOM.*/
    IsInShadowDom: 8
};

Object.freeze(EVUI.Modules.DomTree.DomTreeElementFlags);

/**Represents an Element attribute key-value pair.
@class*/
EVUI.Modules.DomTree.DomTreeElementAttribute = function ()
{
    /**String. The attribute name.
    @type {String}*/
    this.key = null;

    /**String. The attribute value.
    @type {String}*/
    this.val = null;
};

/**The type of element a DomTreeElement represents.
@enum*/
EVUI.Modules.DomTree.DomTreeElementType =
{
    /**Default.*/
    Unknown: 0,
    /**The element is a regular element.*/
    Element: 1,
    /**The element is a text node element.*/
    Text: 2,
    /**The element is a comment node element.*/
    Comment: 3,
    /**The element is an entire HTML or XML document.*/
    Document: 4,
    /**The element is a HTML document fragment.*/
    DocumentFragment: 5,
    /**THe element is a CDATA type element.*/
    CDATA: 6
};

Object.freeze(EVUI.Modules.DomTree.DomTreeElementType);

/**Options for converting A HTMLDocument, XMLDocument, Element, or DocumentFragment into an object (a EVUI.Resources.JSONXRElement) or from an object.
@class*/
EVUI.Modules.DomTree.DomTreeElementOptions = function ()
{
    /**Array. When converting an HTMLDOcument, Element, or DocumentFragment into an Object (a EVUI.Modules.DomTree.DomTreeElement), these are the tag names to not capture.
    @type {String[]}*/
    this.omittedElements = [];

    /**Boolean. When converting an HTMLDOcument, Element, or DocumentFragment into an Object (a EVUI.Modules.DomTree.DomTreeElement), and the tag name matches one of the tags in the OmittedDomTreeElements array, this controls whether or not to omit the entire element, or just omits its contents (keeping its outer tag and attributes intact). False by default.
    @type {Boolean}*/
    this.includeOmittedElementOuterTag = false;

    /**Boolean. When converting an HTMLDocument, Element, or DocumentFragment into an Object (a EVUI.Modules.DomTree.DomTreeElement), this controls whether or not to store an external resource or "a" tag's src or href links as absolute URLs or keep them as relative links if they were already relative. False by default.
     @type {Boolean}*/
    this.absoluteUrls = false;

    /**Whether or not to include a reference to the node that a DomTreeElement was derived from. Note that including the node will make the object graph unable to be converted into JSON. False by default. */
    this.includeNodeReferences = false;

    /**Boolean. Whether or not an Element is allowed to have a in-lined event handlers (i.e. "onclick") as attributes on when creating an Element from a DomTreeElement or HTML string.
    @type {Boolean}*/
    this.noInlineEventHandlers = false;

    /**Object. If noInlineEventHandlers is set to true, this is the "exception case" filter where certain inline handlers are allowed, but must satisfy a RegExp or predicate function in order to be included.
    @type {RegExp|EVUI.Modules.DomTree.Constants.Fn_AttributeFilter}*/
    this.inlineEventHandlerFilter = null;
};

/**Global instance of the DomTreeConverter.
@type {EVUI.Modules.DomTree.DomTreeConverter}*/
EVUI.Modules.DomTree.Converter = null;
(function ()
{
    var converter = null;
    Object.defineProperty(EVUI.Modules.DomTree, "Converter", {
        get: function ()
        {
            if (converter == null) converter = new EVUI.Modules.DomTree.DomTreeConverter();
            return converter;
        },
        configurable: false,
        enumerable: true
    });
})();

/**Constructor reference for the DomTreeConverter.*/
EVUI.Constructors.DomTree = EVUI.Modules.DomTree.DomTreeConverter;

delete $evui.dromTree;

/**Global instance of the DomTreeConverter.
@type {EVUI.Modules.DomTree.DomTreeConverter}*/
$evui.domTree = null;
(function ()
{
    Object.defineProperty($evui, "domTree", {
        get: function ()
        {
            return EVUI.Modules.DomTree.Converter;
        },
        enumerable: true
    });
})();

/**Converts a HTMLElement, Document (XML or HTML), or DocumentFragment into a JSON structure representing the input.
@param {HTMLElement|Document|DocumentFragment} source Any HTMLElement, Document (XML or HTML), or DocumentFragment to turn into a DomTreeElement hierarchy.
@param {EVUI.Modules.DomTree.DomTreeElementOptions} options The options for creating the DomTreeElement hierarchy.
@returns {EVUI.Modules.DomTree.DomTreeElement} */
$evui.toDomTreeElement = function (source, options)
{
    return $evui.domTree.toDomTreeElement(source, options);
};

/**Converts a DomTreeElement hierarchy into a String, Document, Element, or DocumentFragment.
@param {EVUI.Modules.DomTree.DomTreeElement} domTreeElement The Root element to convert.
@param {EVUI.Modules.DomTree.DomTreeElementOptions} options The options for reading the DomTreeElement hierarchy.
@param {Boolean} toString Whether or not to return a string of html instead of a Node object.
@returns {HTMLElement|Document|DocumentFragment}*/
$evui.fromDomTreeElement = function (domTreeElement, options, toString)
{
    if (toString === true)
    {
        return $evui.domTree.fromDomTreeElementToString(domTreeElement, options);
    }
    else
    {
        return $evui.domTree.fromDomTreeElement(domTreeElement, options);
    }
};

/**Converts a HTML string into a DocumentFragment containing the parsed HTML.
 
 NOTE: This function is significantly slower than the native DOM parser used when setting innerHTML of an element, however there are certain situations where the native DOM parser applies certain rules to the creation of new elements based on the tag name of the element whose innerHTML is being set.
 
 For example, making a <tr> inside of a div via setting the div's innerHTML doesn't work correctly (the tr element is missing in the result in most browsers). There may be other cases where similar rules are applied, and the reason for the existence of this function is to bypass those rules. 
 
 For more performant code, use innerHTML - for code that may fail based on the browser's parsing rules (i.e. having the need to parse any unknown HTML into DOM nodes), this function becomes an option instead.
@param {String} htmlString A string of HTML to turn into a DocumentFragment.
@param {EVUI.Modules.DomTree.DomTreeElementOptions} options Options to control the conversion of the string into Dom Nodes.
@returns {DocumentFragment} */
$evui.parseHtml = function (html, options)
{
    return $evui.domTree.htmlToDocumentFragment(html, options);
};

/**Converts a HTML string into a hierarchy of DomTreeElements representing a DocumentFragment containing the parsed HTML.
@param {String} htmlString A string of HTML to turn into a hierarchy of DomTreeElements.
@param {EVUI.Modules.DomTree.DomTreeElementOptions} options Options to control the conversion of the string into DomTreeElements.
@returns {EVUI.Modules.DomTree.DomTreeElement}*/
$evui.parseHtmlToDomTree = function (html, options)
{
    return $evui.domTree.htmlToDomTree(html, options);
};

Object.freeze(EVUI.Modules.DomTree);

/*#ENDWRAP(DT)#*/