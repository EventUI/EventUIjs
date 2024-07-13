/**Copyright (c) 2023 Richard H Stannard

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.*/


/**Module for data-driven TreeViews.
@module*/
EVUI.Modules.TreeView = {};

EVUI.Modules.TreeView.Dependencies =
{
    Core: Object.freeze({ required: true }),
    Binding: Object.freeze({ required: true }),
    Styles: Object.freeze({ required: true}),
    EventStream: Object.freeze({ required: true }),
    Dom: Object.freeze({ required: true })
};

(function ()
{
    var checked = false;

    Object.defineProperty(EVUI.Modules.TreeView.Dependencies, "checked",
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

Object.freeze(EVUI.Modules.TreeView.Dependencies);

EVUI.Modules.TreeView.Constants = {};

EVUI.Modules.TreeView.Constants.Attr_ExpandOn = "evui-tree-node-expand-on";
EVUI.Modules.TreeView.Constants.Attr_CollapseOn = "evui-tree-node-collapse-on";
EVUI.Modules.TreeView.Constants.Attr_ToggleOn = "evui-tree-node-toggle-on";
EVUI.Modules.TreeView.Constants.Attr_Depth = "evui-tree-node-depth";
EVUI.Modules.TreeView.Constants.Attr_NodeId = "evui-tree-node-id";
EVUI.Modules.TreeView.Constants.Attr_Ordinal = "evui-tree-node-ordinal";
EVUI.Modules.TreeView.Constants.Attr_TreeId = "evui-tree-id";

EVUI.Modules.TreeView.Constants.CSS_NodeInterior = "evui-tree-node-interior";
EVUI.Modules.TreeView.Constants.CSS_ChildNodeList = "evui-tree-node-children";
EVUI.Modules.TreeView.Constants.CSS_TreeViewNode = "evui-tree-node";
EVUI.Modules.TreeView.Constants.CSS_TreeViewRootNode = "evui-tree-root-node";
EVUI.Modules.TreeView.Constants.CSS_TreeView = "evui-tree";
EVUI.Modules.TreeView.Constants.CSS_TreeViewRoot = "evui-tree-root";
EVUI.Modules.TreeView.Constants.CSS_ChildNodeList_Hidden = "evui-tree-node-children-hidden";
EVUI.Modules.TreeView.Constants.CSS_ChildNodeList_Visible = "evui-tree-node-children-visible";
EVUI.Modules.TreeView.Constants.CSS_ChildNodeList_Expanding = "evui-tree-node-children-expanding"
EVUI.Modules.TreeView.Constants.CSS_ChildNodeList_Collapsing = "evui-tree-node-children-collapsing"

EVUI.Modules.TreeView.Constants.Event_OnBuild = "build";
EVUI.Modules.TreeView.Constants.Event_OnBuildChildren = "buildchildren";
EVUI.Modules.TreeView.Constants.Event_OnBuiltChildren = "builtchildren";
EVUI.Modules.TreeView.Constants.Event_OnBuilt = "built";

EVUI.Modules.TreeView.Constants.Event_OnExpand = "expand";
EVUI.Modules.TreeView.Constants.Event_OnExpanded = "expanded";

EVUI.Modules.TreeView.Constants.Event_OnCollapse = "collapse";
EVUI.Modules.TreeView.Constants.Event_OnCollapsed = "collapsed";

EVUI.Modules.TreeView.Constants.Job_BuildNode = "job.buildnode";
EVUI.Modules.TreeView.Constants.Job_FinishOperation = "job.finishoperation";
EVUI.Modules.TreeView.Constants.Job_BuildChildren = "job.buildchildren";
EVUI.Modules.TreeView.Constants.Job_Collapse = "job.collapse";
EVUI.Modules.TreeView.Constants.Job_Expand = "job.expand";

EVUI.Modules.TreeView.Constants.StepPrefix = "evui.tv"

/**
 * 
 * @param {EVUI.Modules.TreeView.TreeViewEventArgs} treeViewEventArgs
 */
EVUI.Modules.TreeView.Constants.Fn_TreeViewEventHandler = function (treeViewEventArgs) { };

/**Function definition for the predicate function used to select TreeViews from the TreeViewController.
@param {EVUI.Modules.TreeView.TreeView} treeView The current TreeView.
@returns {Boolean} */
EVUI.Modules.TreeView.Constants.Fn_TreeViewSelector = function (treeView) { };

/**Function definition for the predicate function used to select TreeViewNodes from the TreeView.
@param {EVUI.Modules.TreeView.TreeViewNode} node The current TreeViewNode.
@returns {Boolean} */
EVUI.Modules.TreeView.Constants.Fn_TreeViewNodeSelector = function (node) { };

/**A function called that is passed the source object for a TreeViewNode that returns an Array of children to make into child TreeViewNodes.
@param {{}} source The source object being used as the basis for the TreeViewNode.
@returns {[]}*/
EVUI.Modules.TreeView.Constants.Fn_ChildListGetter = function (source) { }

Object.freeze(EVUI.Modules.TreeView.Constants);


/**Controller for managing TreeViews and their behavior.
@class*/
EVUI.Modules.TreeView.TreeViewController = function (services)
{
    if (EVUI.Modules.Core == null) throw Error("Dependency missing: EVUI.Modules.Core is required.");
    EVUI.Modules.Core.Utils.requireAll(EVUI.Modules.TreeView.Dependencies);

    /**Array of all the TreeViews being managed by this controller.
    @type {TreeViewEntry[]}*/
    var _treeViews = [];
    var _nodeIDCounter = 0; //ID counter for TreeViewNodes
    var _operationCounter = 0; //ID counter for operation sessions
    var _nodeExclusions = ["element", "id", "parentNode", "childNodes", "depth", "index", "treeView"]; //properties to not copy from a parameter object onto a TreeViewNode (they are read only)
    var _treeViewExclusions = ["id", "nodes", "rootListElement", "rootNode", "element", ]; //properties to not copy from a parameter object onto a TreeView (they are read only)
    var _eventExclusions = ["onExpand", "onExpanded", "onCollapse", "onCollaposed", "onBuild", "onBuilt", "onBuildChildren", "onChildrenBuilt"]; //event names to not copy onto an internal data model object (TreeViewEntry/TreeViewNodeEntry) when they are attached to an incoming parameter
    var _classesSet = false; //whether or not the CSS classes that control the expansion and collapse of tree view nodes have been set.

    /**Object. The service collection containing the dependencies used by the TreeViewController.
    @type {EVUI.Modules.TreeView.TreeViewControllerServices}*/
    var _services = services;

    /**Creates and adds a TreeView to the controller's list of managed TreeViews.
    @param {String|EVUI.Modules.TreeView.AddTreeViewArgs|EVUI.Modules.TreeView.TreeView} makeTreeViewArgsOrId Either the string name of the TreeView to make, a YOLO TreeView object describing the tree, or a YOLO AddTreeViewArgs object describing the tree.
    @param {EVUI.Modules.TreeView.AddTreeViewNodeArgs|EVUI.Modules.TreeView.TreeViewNode} rootNodeArgs Optional. Arguments for making the root TreeViewNode of the TreeView. Can either be a YOLO TreeViewNode or a YOLO AddTreeViewNodeArgs object.
    @returns {EVUI.Modules.TreeView.TreeView} */
    this.addTreeView = function (makeTreeViewArgsOrId, rootNodeArgs)
    {
        var tvArgsType = typeof makeTreeViewArgsOrId;
        if (makeTreeViewArgsOrId == null || (tvArgsType !== "string" && tvArgsType !== "object")) throw Error("Invalid parameters, string or object expected.");

        var treeId = (typeof makeTreeViewArgsOrId === "string") ? makeTreeViewArgsOrId : makeTreeViewArgsOrId.id;
        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(treeId) === true) throw Error("TreeView id must be a string.");

        var existing = getTreeViewById(treeId);
        if (existing != null) throw Error("A TreeView with an id of \"" + existing + "\" already exists.");

        var tvEntry = makeTreeViewAmbiguously(makeTreeViewArgsOrId, rootNodeArgs);
        if (tvEntry != null) _treeViews.push(tvEntry);

        return tvEntry.treeView;
    };

    /**Gets a TreeView or TreeViews from the TreeViewController.
    @param {String|EVUI.Modules.TreeView.Constants.Fn_TreeViewSelector} treeViewIdOrPredicate Either the string ID of a TreeView to get, or a predicate function used to select TreeViews from the controller's collection of TreeViews.
    @param {Boolean} getAllMatches Optional. Whether or not to return all the matches that satisfied the predicate function. If omitted only the first TreeView to satisfy the predicate is returned.
    @returns {TreeView|TreeView[]} */
    this.getTreeView = function (treeViewIdOrPredicate, getAllMatches)
    {
        var result = [];
        if (typeof treeViewIdOrPredicate === "string")
        {
            var entry = getTreeViewById(treeViewIdOrPredicate);
            if (entry != null) return entry.treeView;
        }
        else if (typeof treeViewIdOrPredicate === "function")
        {
            var result = (getAllMatches === true) ? [] : null;
            var numTrees = _treeViews.length;
            for (var x = 0; x < numTrees; x++)
            {
                var curTree = _treeViews[x];
                if (treeViewIdOrPredicate(curTree.treeView) === true)
                {
                    if (getAllMatches === true)
                    {
                        result.push(curTree.treeView);
                    }
                    else
                    {
                        return curTree.treeView;
                    }
                }
            }

            return result;
        }
        else
        {
            return null;
        }
    };

    /**Removes and optionally disposes of one of the TreeViews being managed by this controller.
    @param {String} treeViewId The ID of the TreeView to remove.
    @param {Boolean} dispose LOptional. Whether or not to dispose of and destroy the TreeView once it has been removed. False by default.
    @returns {Boolean} */
    this.removeTreeView = function (treeViewId, dispose)
    {
        var existing = getTreeViewById(treeViewId);
        if (existing == null) return false;

        if (dispose === true) disposeTreeView(existing);

        var index = _treeViews.indexOf(existing);
        if (index !== -1) _treeViews.splice(index, 1);

        return true;
    };

    /**Gets a TreeViewEntry based on it's ID.
    @param {String} treeViewId The ID of the TreeViewEntry to get.
    @returns {TreeViewEntry} */
    var getTreeViewById = function (treeViewId)
    {
        if (typeof treeViewId !== "string") return null;

        var numTrees = _treeViews.length;
        var lowerId = treeViewId.toLowerCase();

        for (var x = 0; x < numTrees; x++)
        {
            var curTree = _treeViews[x];
            if (curTree.treeViewId.toLowerCase() === lowerId) return curTree;
        }

        return null;
    };

    /**Makes a TreeViewEntry based on ambiguous input that can be one of several different combinations of things.
    @param {String|EVUI.Modules.TreeView.AddTreeViewArgs|EVUI.Modules.TreeView.TreeView} makeTreeViewArgsOrId Either a string ID for the TreeViewEntry, YOLO AddTreeVuewArgs for adding a tree, or a YOLO TreeView object.
    @param {EVUI.Modules.TreeView.AddTreeViewNodeArgs|EVUI.Modules.TreeView.TreeViewNode} rootNodeArgs The arguments used to define the root node of the TreeView.
    @returns {TreeViewEntry}*/
    var makeTreeViewAmbiguously = function (makeTreeViewArgsOrId, rootNodeArgs)
    {
        if (makeTreeViewArgsOrId == null && rootNodeArgs == null) return null;

        var treeViewId = null;
        var makeTreeViewArgs = new EVUI.Modules.TreeView.AddTreeViewArgs();
        var makeRootNodeArgs = new EVUI.Modules.TreeView.AddTreeViewNodeArgs();
        var hadTreeViewArgs = false;
        var hadNodeArgs = false;

        if (typeof makeTreeViewArgsOrId === "string") //we were handed an ID
        {
            treeViewId = makeTreeViewArgsOrId;
            makeTreeViewArgs.id = treeViewId;
            makeTreeViewArgs.element = getValidRootElement(); //get a "valid" element, which in this case will be a document fragment.
        }
        else //we were handed some sort of parameter object
        {
            hadTreeViewArgs = true;
            treeViewId = makeTreeViewArgsOrId.id;

            //extend the arguments object the user gave us onto the official object we're using to build the tree view, but don't include any properties that belong on Nodes and not Trees.
            EVUI.Modules.Core.Utils.shallowExtend(makeTreeViewArgs, makeTreeViewArgsOrId, ["nodes", "rootNode"].concat(_nodeExclusions));
            makeTreeViewArgs.element = getValidRootElement(makeTreeViewArgsOrId.element);

             //we have a definition of the root node, copy its properties onto the official object we will use to make the real node
            if (makeTreeViewArgsOrId.rootNode != null && typeof makeTreeViewArgsOrId.rootNode === "object")
            {
                hadNodeArgs = true;
                EVUI.Modules.Core.Utils.shallowExtend(makeRootNodeArgs, makeTreeViewArgsOrId.rootNode, _nodeExclusions);
            }
        }

        //make sure our rootNodeArgs is an actual object, even if it has just the default values
        if (rootNodeArgs == null) rootNodeArgs = new EVUI.Modules.TreeView.AddTreeViewNodeArgs();

        if (hadTreeViewArgs === false) //if we had no tree view args, populate the official "make tree view" object with values from the root node args
        {
            EVUI.Modules.Core.Utils.shallowExtend(makeTreeViewArgs, rootNodeArgs, _eventExclusions.concat(_nodeExclusions));
            makeTreeViewArgs.element = getValidRootElement(rootNodeArgs.element);
        }
        else
        {
            //if (makeTreeViewArgsOrId.rootNode != null && typeof makeTreeViewArgsOrId.rootNode === "object")
            //{
            //    EVUI.Modules.Core.Utils.shallowExtend(makeRootNodeArgs, makeTreeViewArgsOrId.rootNode, _nodeExclusions);
            //}
            //else
            //{
            //    EVUI.Modules.Core.Utils.shallowExtend(rootNodeArgs, makeTreeViewArgs, _eventExclusions.concat(_nodeExclusions));
            //    makeTreeViewArgs.element = getValidElement(makeTreeViewArgs.element);
            //}

            if (hadNodeArgs === false) //if our main parameter object did not have any root node args, populate them with values from the TreeView arguments since there is overlap between them
            {
                EVUI.Modules.Core.Utils.shallowExtend(rootNodeArgs, makeTreeViewArgs, _eventExclusions.concat(_nodeExclusions));
                makeTreeViewArgs.element = getValidRootElement(makeTreeViewArgs.element);
            }
        }

        //finally, make the real backing object for the tree view
        var tvEntry = new TreeViewEntry();
        tvEntry.element = makeTreeViewArgs.element;
        tvEntry.treeViewId = treeViewId;
        tvEntry.treeView = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.TreeView.TreeView(tvEntry), makeTreeViewArgs, _treeViewExclusions); //make the actual tree view then pass all non read only properties provided in the parameters onto it
        tvEntry.rootNode = makeTreeViewNodeAmbiguously(rootNodeArgs, tvEntry); //use the real or synthesized rootNodeArgs to make the root node of the TreeView (which must always be not null)
        tvEntry.className = getTreeViewClassName(tvEntry.treeViewId);
        
        return tvEntry;
    };

    /**Invokes a function to build, expand, collapse, toggle, or dispose of a tree view node from a TreeView object.
    @param {String} action The NodeAction being performed.
    @param {TreeViewEntry} treeViewEntry The TreeView invoking the command.
    @param {Number|TreeViewNodeEntry} nodeOrId Either the ID of the TreeViewNodeEntry that is the target of the operation, or the TreeViewNodeEntry itself.
    @param {EVUI.Modules.TreeView.ExpandCollapseTreeViewNodeArgs|EVUI.Modules.TreeView.BuildTreeViewNodeArgs} actionArgs The expand/collapse/build args to go along with the action.
    @param {Function} callback The function to call once the action operation completes (regardless if it was successful, failed, skipped, or canceled).*/
    var invokeFromTreeView = function (action, treeViewEntry, nodeOrId, actionArgs, callback)
    {
        if (typeof nodeOrId === "function") //callback is the 3rd argument, re-assign it to the right argument and clear out the current one
        {
            callback = nodeOrId;
            nodeOrId = null;
        }
        else if (typeof actionArgs === "function") //callback is the 4th argument, again do the re-assign and clear of the current one
        {
            callback = actionArgs;
            actionArgs = null;
        }
        else if (typeof callback !== "function") //NO callback was provided, so just supply a dummy one.
        {
            callback = function (success) { };
        }

        //figure out the TreeViewNodeEntry to take the action being invoked from the tree view.
        var node = null;
        if (typeof nodeOrId === "number") //we have a node's id
        {
            node = getNodeById(treeViewEntry, nodeOrId);
            if (node == null) throw Error("No node with an id of " + nodeOrId + " exists in TreeView " + treeViewEntry.treeViewId);
        }
        else if (nodeOrId != null && typeof nodeOrId === "object") //we have an object, which could possibly be the actual node, or just an object with an ID.
        {
            if (typeof nodeOrId.nodeId === "number") //has an ID
            {
                if (EVUI.Modules.Core.Utils.instanceOf(nodeOrId, TreeViewNodeEntry) === true) //is an actual TreeViewNodeEntry, we have what we're looking for.
                {
                    node = nodeOrId;
                }
                else //not a usable object, use it's ID to go find the actual object we need to use
                {
                    node = getNodeById(treeViewEntry, nodeOrId.id);
                    if (node == null) throw Error("No node with an id of " + nodeOrId.id + " exists in TreeView " + treeViewEntry.treeViewId);
                }
            }
            else //still an object, but not with anything we can use to locate the node. Assume the "node" argument is the action args and just use the rootNode of the tree as our target node
            {
                if (actionArgs == null)
                {
                    actionArgs = nodeOrId;
                    node = treeViewEntry.rootNode;
                }
            }
        }
        else //bogus input, just use the rootNode 
        {
            node = treeViewEntry.rootNode;
        }

        //finally, trigger our action
        if (action === NodeAction.Build)
        {
            triggerBuild(node, actionArgs, callback);
        }
        else if (action === NodeAction.Collapse)
        {
            triggerCollapse(node, actionArgs, callback);
        }
        else if (action === NodeAction.Expand)
        {
            triggerExpand(node, actionArgs, callback);
        }
        else if (action === NodeAction.Toggle)
        {
            triggerToggle(node, actionArgs, callback);
        }
        else if (action === NodeAction.Dispose)
        {
            disposeTreeViewNode(node);
        }
        else
        {
            throw Error("Invalid action.");
        }
    };



    /**Issues the command to build a node (or the entire tree view) from a TreeView object.
    @param {TreeViewEntry} treeViewEntry The TreeView invoking the command.
    @param {Number|TreeViewNodeEntry} nodeOrId Either the ID of the TreeViewNodeEntry that is the target of the operation, or the TreeViewNodeEntry itself.
    @param {EVUI.Modules.TreeView.BuildTreeViewNodeArgs} buildArgs The build args to go along with the action.
    @param {Function} callback The function to call once the action operation completes (regardless if it was successful, failed, skipped, or canceled).*/
    var buildFromTreeView = function (treeViewEntry, nodeOrId, buildArgs, callback)
    {
        invokeFromTreeView(NodeAction.Build, treeViewEntry, nodeOrId, buildArgs, callback);
    };

    /**Issues the command to build a node (or the entire tree view) from a TreeView object.
    @param {TreeViewEntry} treeViewEntry The TreeView invoking the command.
    @param {Number|TreeViewNodeEntry} nodeOrId Either the ID of the TreeViewNodeEntry that is the target of the operation, or the TreeViewNodeEntry itself.
    @param {EVUI.Modules.TreeView.ExpandCollapseTreeViewNodeArgs} expandArgs The expand args to go along with the action.
    @param {Function} callback The function to call once the action operation completes (regardless if it was successful, failed, skipped, or canceled).*/
    var expandFromTreeView = function (treeViewEntry, nodeOrId, expandArgs, callback)
    {
        invokeFromTreeView(NodeAction.Expand, treeViewEntry, nodeOrId, expandArgs, callback);
    };

    /**Issues the command to build a node (or the entire tree view) from a TreeView object.
    @param {TreeViewEntry} treeViewEntry The TreeView invoking the command.
    @param {Number|TreeViewNodeEntry} nodeOrId Either the ID of the TreeViewNodeEntry that is the target of the operation, or the TreeViewNodeEntry itself.
    @param {EVUI.Modules.TreeView.ExpandCollapseTreeViewNodeArgs} collapseArgs The collapse args to go along with the action.
    @param {Function} callback The function to call once the action operation completes (regardless if it was successful, failed, skipped, or canceled).*/
    var collapseFromTreeView = function (treeViewEntry, nodeOrId, collapseArgs, callback)
    {
        invokeFromTreeView(NodeAction.Collapse, treeViewEntry, nodeOrId, collapseArgs, callback);
    };

    /**Issues a command to dispose of either an entire TreeView or just a node on the TreeView.
    @param {TreeViewEntry} treeViewEntry The TreeView that is either being disposed of or the TreeView that contains the node being disposed.
    @param {Number|TreeViewNodeEntry} nodeOrId The TreeViewNode being disposed.*/
    var disposeFromTreeView = function (treeViewEntry, nodeOrId)
    {
        if (nodeOrId == treeViewEntry)
        {
            disposeTreeView(treeViewEntry); 
        }
        else
        {
            invokeFromTreeView(NodeAction.Dispose, treeViewEntry, nodeOrId);
        }
    };

    /**Issues a command to toggle a node's expanded/collapsed state from a TreeView.
    @param {TreeViewEntry} treeViewEntry The TreeView invoking the command.
    @param {Number|TreeViewNodeEntry} nodeOrId Either the ID of the TreeViewNodeEntry that is the target of the operation, or the TreeViewNodeEntry itself.
    @param {EVUI.Modules.TreeView.ExpandCollapseTreeViewNodeArgs} buildArgs The collapse args to go along with the action.
    @param {Function} callback The function to call once the action operation completes (regardless if it was successful, failed, skipped, or canceled).*/
    var toggleFromTreeView = function(treeViewEntry, nodeOrId, expandCollapseArgs, callback)
    {
        invokeFromTreeView(NodeAction.Toggle, treeViewEntry, nodeOrId, expandCollapseArgs, callback);
    };

    /**Triggers a build operation that will re-bind the user's Binding for the TreeNode and then build the node's child list of nodes if it has one.
    @param {TreeViewNodeEntry} nodeEntry The TreeViewNodeEntry that will be built.
    @param {EVUI.Modules.TreeView.BuildTreeViewNodeArgs} buildArgs The arguments that describe the options for the build operation.
    @param {Function} callback The function to call once the action operation completes (regardless if it was successful, failed, skipped, or canceled).*/
    var triggerBuild = function (nodeEntry, buildArgs, callback)
    {
        if (typeof buildArgs === "function")
        {
            callback = buildArgs;
            buildArgs = null;
        }

        if (typeof callback !== "function") callback = function () { };
        buildArgs = getBuildArgs(nodeEntry, buildArgs);

        var opSession = new OperationSession();
        opSession.action = NodeAction.Build;
        opSession.buildArgs = buildArgs;
        opSession.callback = callback;
        opSession.nodeEntry = nodeEntry;
        opSession.context = (buildArgs.context == null) ? {} : buildArgs.context;

        var callbackItem = new CallbackEntry();
        callbackItem.callback = callback;
        callbackItem.operationSession = opSession;

        opSession.callback = callbackItem;

        queueOperationSession2(nodeEntry, opSession);
    };

    /**Triggers an expand operation that will re-build the user's Binding for the TreeNode, then build/re-build it's child list, then expand the node so that it's children are visible.
    @param {TreeViewNodeEntry} nodeEntry The TeeeViewNodeEntry that will be expanded.
    @param {EVUI.Modules.TreeView.ExpandCollapseTreeViewNodeArgs} expandCollapseArgs The arguments that contain the options for the expand operation.
    @param {Function} callback The function to call once the action operation completes (regardless if it was successful, failed, skipped, or canceled).*/
    var triggerExpand = function (nodeEntry, expandCollapseArgs, callback)
    {
        if (typeof expandCollapseArgs === "function")
        {
            callback = expandCollapseArgs;
            expandCollapseArgs = null;
        }

        if (typeof callback !== "function") callback = function () { };
        if (expandCollapseArgs == null) expandCollapseArgs = new EVUI.Modules.TreeView.ExpandCollapseTreeViewNodeArgs();
        expandCollapseArgs.buildArgs = getBuildArgs(nodeEntry, expandCollapseArgs.buildArgs);

        var opSession = new OperationSession();
        opSession.action = NodeAction.Expand;
        opSession.expandCollapseArgs = expandCollapseArgs;
        opSession.buildArgs = expandCollapseArgs.buildArgs;
        opSession.callback = callback;
        opSession.nodeEntry = nodeEntry;

        //get the context object, which can be in both the build args or the expand args. Take the one that is "most specific" to the operation (expand) and fall back to the less specific one (build)
        if (expandCollapseArgs.context != null)
        {
            opSession.context = expandCollapseArgs.context;
        }
        else if (expandCollapseArgs.buildArgs.context != null)
        {
            opSession.context = expandCollapseArgs.buildArgs.context;
        }
        else //no context found, just supply a dummy object
        {
            opSession.context = {};
        }

        var callbackItem = new CallbackEntry();
        callbackItem.callback = callback;
        callbackItem.operationSession = opSession;

        opSession.callback = callbackItem;

        queueOperationSession2(nodeEntry, opSession);
    }

    /**Triggers a collapse operation that will hide node's list of children.
    @param {TreeViewNodeEntry} nodeEntry The TreeViewNodeEntry that will have its child list collapsed.
    @param {EVUI.Modules.TreeView.ExpandCollapseTreeViewNodeArgs} expandCollapseArgs The arguments that contain the details for the collapse operation.
    @param {Function} callback The function to call once the action operation completes (regardless if it was successful, failed, skipped, or canceled).*/
    var triggerCollapse = function (nodeEntry, expandCollapseArgs, callback)
    {
        if (typeof expandCollapseArgs === "function")
        {
            callback = expandCollapseArgs;
            expandCollapseArgs = null;
        }

        if (typeof callback !== "function") callback = function () { };
        if (expandCollapseArgs == null) expandCollapseArgs = new EVUI.Modules.TreeView.ExpandCollapseTreeViewNodeArgs();



        var opSession = new OperationSession();
        opSession.action = NodeAction.Collapse;
        opSession.expandCollapseArgs = expandCollapseArgs;
        opSession.callback = callback;
        opSession.nodeEntry = nodeEntry;

        //get the context object, which should be in the expand/collapse args for a collapse operation
        if (expandCollapseArgs.context != null)
        {
            opSession.context = expandCollapseArgs.context;
        }
        else if (expandCollapseArgs.buildArgs != null && expandCollapseArgs.buildArgs.context != null) //if for some reason there are build args for a collapse operation (which won't be used) and the collapse args didn't have a context, get it from the build args
        {
            opSession.context = expandCollapseArgs.buildArgs.context;
        }
        else //otherwise just supply a dummy object.
        {
            opSession.context = {};
        }

        var callbackItem = new CallbackEntry();
        callbackItem.callback = callback;
        callbackItem.operationSession = opSession;

        opSession.callback = callbackItem;

        queueOperationSession2(nodeEntry, opSession);
    };

    /**Toggles the behavior of the TreeViewNode to do the opposite of its current operation or state.
    @param {TreeViewNodeEntry} nodeEntry The node being acted upon.
    @param {EVUI.Modules.TreeView.ExpandCollapseTreeViewNodeArgs} expandCollapseArgs The arguments for the expand/collapse operation.
    @param {Function} callback A callback function to execute once the operation completes.*/
    var triggerToggle = function (nodeEntry, expandCollapseArgs, callback)
    {
        if (nodeEntry.operation != null) //if we're in the middle of doing an expand or collapse, do the opposite
        {
            if (nodeEntry.operation.action === NodeAction.Expand)
            {
                return triggerCollapse(nodeEntry, expandCollapseArgs, callback)
            }
            else if (nodeEntry.operation.action === NodeAction.Collapse)
            {
                return triggerExpand(nodeEntry, expandCollapseArgs, callback)
            }
        }

        //if we weren't in the middle of either operation, use the visibility flag to determine which action to take
        if (nodeEntry.expanded === true)
        {
            return triggerCollapse(nodeEntry, expandCollapseArgs, callback);
        }
        else
        {
            return triggerExpand(nodeEntry, expandCollapseArgs, callback);
        }
    };

    /**Creates a BuildTreeViewNodeArgs object based on a YOLO build args object, or fills in the build args with values from the node that is being built. This ensures that the logic downstream can always just use the build args for performing build operations regardless if the user supplied them or not.
    @param {TreeViewNodeEntry} nodeEntry The node being built.
    @param {EVUI.Modules.TreeView.BuildTreeViewNodeArgs} buildArgs A YOLO build args object.
    @returns {EVUI.Modules.TreeView.BuildTreeViewNodeArgs}*/
    var getBuildArgs = function (nodeEntry, buildArgs)
    {
        if (buildArgs == null) buildArgs = new EVUI.Modules.TreeView.BuildTreeViewNodeArgs();
        if (buildArgs.bindingTemplate == null) buildArgs.bindingTemplate = nodeEntry.bindingTemplate;
        if (buildArgs.buildMode == null) buildArgs.buildMode = EVUI.Modules.TreeView.TreeViewNodeBuildMode.Update;
        if (buildArgs.childListName == null) buildArgs.childListName = nodeEntry.childListName;
        if (buildArgs.options == null) buildArgs.options = nodeEntry.options;
        if (buildArgs.optionsMode == null) buildArgs.optionsMode = nodeEntry.optionsMode;
        if (buildArgs.source == null) buildArgs.source = nodeEntry.source;

        return buildArgs;
    }

    /**Calculates the correct action to take when a TreeViewNode is told to perform an operation. This takes into consideration the current state and operation of the node and acts appropriately to eliminate race conditions by "switching gears" between the different operations available.
    @param {TreeViewNodeEntry} nodeEntry The node being asked to perform an operation.
    @param {OperationSession} opSession The new operation session to evaluate.*/
    var queueOperationSession2 = function (nodeEntry, opSession)
    {
        if (opSession == null) return;

        //figure out what the correct action is to take with the new operation session
        var actionSequence = getActionSequence(nodeEntry, opSession);
        if (actionSequence == null) return;        

        if (actionSequence.cancelCurrent === true) //was given an "opposite" command to its current action - stop current operation and begin a new one
        {
            return cancelOperation(nodeEntry, opSession);
        }
        else if (actionSequence.continueAfter === true) //was given an command that can wait for the current operation to finish before starting and still do what the user expects
        {
            return continueAfter(nodeEntry, opSession)
        }
        else if (actionSequence.skip === true) //was issued a redundant command, perform no action but call its callback at the appropriate time.
        {
            return skipOperation(nodeEntry, opSession);
        }
        else //otherwise, begin the operation
        {
            startOperation(opSession, actionSequence);
        }
    };

    /**Begins an operation for a TreeViewNode to perform by setting the state of the node and building and kicking off the appropriate event stream.
    @param {OperationSession} opSession The metadata about the operation to perform.
    @param {ActionSequence} actionSequence The metadata about the sequence of actions that will be performed.*/
    var startOperation = function (opSession, actionSequence)
    {
        //set the previously completed node state to roll back to in the event of a cancellation of the operation
        opSession.nodeEntry.previousCompletedNodeState = opSession.nodeEntry.nodeState;

        //set the "action state" of the node so the user/downstream logic knows what the node is beginning to do
        if (opSession.action === NodeAction.Build)
        {
            opSession.nodeEntry.nodeState = EVUI.Modules.TreeView.TreeViewNodeState.Building;
        }
        else if (opSession.action === NodeAction.Expand)
        {
            opSession.nodeEntry.nodeState = EVUI.Modules.TreeView.TreeViewNodeState.Expanding;
        }
        else if (opSession.action === NodeAction.Collapse)
        {
            opSession.nodeEntry.nodeState = EVUI.Modules.TreeView.TreeViewNodeState.Collapsing;
        }

        buildEventStream(opSession, actionSequence);

        opSession.nodeEntry.operation = opSession;
        opSession.eventStream.execute();
    };

    /**Cancels the current operation and queues up the next operation as a continuation to execute once the current operation's cancellation is complete.
    @param {TreeViewNodeEntry} nodeEntry The node that is having its current operation canceled.
    @param {OperationSession} nextOpSession The operation session that caused the cancellation of the current operation and will begin once the current operation's cancellation is complete.*/
    var cancelOperation = function (nodeEntry, nextOpSession)
    {
        nodeEntry.operation.canceled = true;        

        //if we already have a continuation, we need to roll up all the callbacks from the other continuations into a single callback stack to make sure that every callback from all the operations we're canceling get called when the next operation finishes.
        var curContinuation = nodeEntry.operation.continuation;
        while (curContinuation != null)
        {
            if (curContinuation.callbackStack.indexOf(curContinuation.callback) === -1) curContinuation.callbackStack.push(curContinuation.callback);
            nextOpSession.callbackStack = nextOpSession.callbackStack.concat(curContinuation.callbackStack);
            curContinuation = curContinuation.continuation;
        }

        //now that everything has been rolled up into the next operation, we can set it up as the "continuation" of the canceled operation that will get launched in finishOperation()
        nodeEntry.operation.continuation = nextOpSession;
        nextOpSession.isContinuation = true;

        if (nodeEntry.operation.eventStream == null || nodeEntry.operation.eventStream.isWorking() === false) //if the operation being canceled hasn't started yet we can just "finish" it and kick off the continuation
        {
            finishOperation(nodeEntry.operation);
        }
        else //otherwise we cancel the operation (asynchronously) and wait for the final step to call finishOperation, but reset the state first so incoming commands don't do the wrong thing
        {
            nodeEntry.operation.eventStream.cancel();
            restorePreviousNodeState(nodeEntry);
        }
    };

    /**Sets up the operation session to begin once the current operation completes.
    @param {TreeViewNodeEntry} nodeEntry The node that is having its next operation queued.
    @param {OperationSession} nextOpSession The operation session to queue.*/
    var continueAfter = function (nodeEntry, nextOpSession)
    {
        //tack the continuation onto the last continuation already attached to the node entry so it fires at after the others have finished
        var lastContinuation = getLastContinuationOpSession(nodeEntry);
        if (lastContinuation == null)
        {
            nodeEntry.operation.continuation = nextOpSession;
        }
        else
        {
            lastContinuation.continuation = nextOpSession;
        }

        nextOpSession.isContinuation = true;
    };

    /**Either queues a callback to be called or immediately calls a callback based on a redundant operation being issues (i.e. collapse when the node is already collapsed).
    @param {TreeViewNodeEntry} nodeEntry The node who is being issued a redundant command.
    @param {OperationSession} nextOpSession The redundant operation.*/
    var skipOperation = function (nodeEntry, nextOpSession)
    {
        if (nodeEntry.operation == null) //node was at a state of rest and was issued a command that would not change its state
        {
            finishOperation(nextOpSession);
        }
        else //node is in the middle of performing an operation, call the callback once it finishes
        {
            nodeEntry.operation.callbackStack.push(nextOpSession.callback);
        }
    };

    /**Walks down the chain of continuations for a given TreeViewNodeEntry and returns the last one.
    @param {TreeViewNodeEntry} nodeEntry The node to get the last continuation for.
    @returns {OperationSession}*/
    var getLastContinuationOpSession = function (nodeEntry)
    {
        if (nodeEntry.operation == null) return null;

        var next = nodeEntry.operation;
        while (next != null)
        {
            var continuation = next.continuation;
            if (continuation == null) break;

            next = continuation;
        }

        return next;
    };

    /**Completes an operation and either calls the operation's callback, or invokes the next continuation operation.
    @param {OperationSession} opSession The operation to complete.
    @param {Function} callback A callback function to call once the operation has been completed.*/
    var finishOperation = function (opSession, callback)
    {
        if (typeof callback !== "function") callback = function () { };

        opSession.nodeEntry.operation = null;
        opSession.callbackStack.push(opSession.callback); //the callback for the op session isn't in it's own stack, so we add it here

        if (opSession.continuation != null) //if we have another action we're doing after this one, add this operation's callback stack to the next one and kick off the next operation
        {
            if (opSession.canceled === true)
            {
                restorePreviousNodeState(opSession.nodeEntry);
            }

            opSession.continuation.callbackStack = opSession.continuation.callbackStack.concat(opSession.callbackStack);
            queueOperationSession2(opSession.nodeEntry, opSession.continuation);
            return callback();
        }

        //sort all the callbacks in the order in which they were added so they fire in the order the user expects them to
        opSession.callbackStack.sort(function (a, b) { return a.operationSession.operationId - b.operationSession.operationId });

        var callbacks = [];
        var numCallbacks = opSession.callbackStack.length;
        for (var x = 0; x < numCallbacks; x++)
        {
            callbacks.push(opSession.callbackStack[x].callback);
        }

        var exeArgs = new EVUI.Modules.Core.AsyncSequenceExecutionArgs();
        exeArgs.functions = callbacks;

        EVUI.Modules.Core.AsyncSequenceExecutor.execute(exeArgs, function ()
        {
            if (opSession.canceled === true)
            {
                restorePreviousNodeState(opSession.nodeEntry);
            }

            callback();
        })
    };

    /**Reverts the nodeState of a tree view back to it's current state in the event of a cancellation.
    @param {TreeViewNodeEntry} nodeEntry The node whose operation was canceled.*/
    var restorePreviousNodeState = function (nodeEntry)
    {
        if (nodeEntry.previousCompletedNodeState === EVUI.Modules.TreeView.TreeViewNodeState.None) return;

        nodeEntry.nodeState = nodeEntry.previousCompletedNodeState;
        nodeEntry.previousCompletedNodeState = EVUI.Modules.TreeView.TreeViewNodeState.None;
    };

    /**Adds all the steps and configuration settings for the EventStream that will execute the operation.
    @param {OperationSession} opSession The operation to execute.
    @param {ActionSequence} actionSequence The details of the actions that the EventStream will execute.*/
    var buildEventStream = function (opSession, actionSequence)
    {
        opSession.eventStream = new EVUI.Modules.EventStream.EventStream();
        opSession.eventStream.context = opSession.nodeEntry.node;
        opSession.eventStream.extendSteps = false;

        opSession.eventStream.onCancel = function ()
        {
            opSession.canceled = true;
            opSession.eventStream.seek(EVUI.Modules.TreeView.Constants.Job_FinishOperation);
        };

        opSession.eventStream.onError = function ()
        {
            opSession.canceled = true;
            opSession.eventStream.seek(EVUI.Modules.TreeView.Constants.Job_FinishOperation);
        };

        opSession.eventStream.processInjectedEventArgs = function (eventStreamArgs)
        {
            var treeViewArgs = new EVUI.Modules.TreeView.TreeViewEventArgs(opSession.nodeEntry);
            treeViewArgs.eventName = eventStreamArgs.name;
            treeViewArgs.eventType = eventStreamArgs.key;
            treeViewArgs.cancel = function () { return eventStreamArgs.cancel(); };
            treeViewArgs.eventType = eventStreamArgs.key;
            treeViewArgs.pause = function () { return eventStreamArgs.pause(); };
            treeViewArgs.resume = function () { return eventStreamArgs.resume(); };
            treeViewArgs.stopPropagation = function () { return eventStreamArgs.stopPropagation(); };
            treeViewArgs.context = opSession.context;      

            return treeViewArgs;
        };

        opSession.eventStream.processReturnedEventArgs = function (treeViewArgs)
        {
            opSession.context = treeViewArgs.context;
        };

        var numActions = actionSequence.actions.length;
        for (var x = 0; x < numActions; x++)
        {
            var action = actionSequence.actions[x];

            if (action === NodeAction.Build)
            {
                getBuildSteps(opSession);
            }
            else if (action === NodeAction.Collapse)
            {
                getCollapseSteps(opSession);
            }
            else if (action === NodeAction.Expand)
            {
                getExpandSteps(opSession);
            }
        }

        addFinalStep(opSession);
    };

    /**Adds the steps to the EventStream that will execute a build operation.
    @param {OperationSession} opSession The operation session being executed.*/
    var getBuildSteps = function (opSession)
    {
        opSession.eventStream.addStep({
            type: EVUI.Modules.EventStream.EventStreamStepType.Event,
            name: EVUI.Modules.TreeView.Constants.StepPrefix + "." + EVUI.Modules.TreeView.Constants.Event_OnBuild,
            key: EVUI.Modules.TreeView.Constants.Event_OnBuild,
            handler: function (eventArgs)
            {
                if (canContinue(opSession) === false) return;
                opSession.nodeEntry.nodeState = EVUI.Modules.TreeView.TreeViewNodeState.Building;

                if (typeof opSession.nodeEntry.node.onBuild === "function")
                {
                    return opSession.nodeEntry.node.onBuild.call(this, eventArgs);
                }
            }
        });

        opSession.eventStream.addStep({
            type: EVUI.Modules.EventStream.EventStreamStepType.GlobalEvent,
            name: EVUI.Modules.TreeView.Constants.StepPrefix + "." + EVUI.Modules.TreeView.Constants.Event_OnBuild,
            key: EVUI.Modules.TreeView.Constants.Event_OnBuild,
            handler: function (eventArgs)
            {
                if (canContinue(opSession) === false) return;
                if (typeof opSession.nodeEntry.treeViewEntry.treeView.onBuild === "function")
                {
                    return opSession.nodeEntry.treeViewEntry.treeView.onBuild.call(opSession.nodeEntry.treeViewEntry.treeView, eventArgs);
                }
            }
        });

        opSession.eventStream.addStep({
            type: EVUI.Modules.EventStream.EventStreamStepType.Job,
            name: EVUI.Modules.TreeView.Constants.StepPrefix + "." + EVUI.Modules.TreeView.Constants.Job_BuildNode,
            key: EVUI.Modules.TreeView.Constants.Job_BuildNode,
            handler: function (jobEventArgs)
            {              
                if (canContinue(opSession) === false) return jobEventArgs.resolve();
                if (opSession.nodeEntry === opSession.nodeEntry.treeViewEntry.rootNode)
                {
                    onBuildRootNode(opSession, function (success)
                    {
                        if (isRecursiveBuildOperation(opSession) == true)
                        {
                            setChildNodeList(opSession.nodeEntry);
                        }

                        jobEventArgs.resolve();
                    });
                }
                else
                {
                    onBuildNode(opSession, function (success)
                    {
                        if (isRecursiveBuildOperation(opSession) === true)
                        {
                            setChildNodeList(opSession.nodeEntry);
                        }

                        jobEventArgs.resolve();
                    });
                }
            }
        });

        opSession.eventStream.addStep({
            type: EVUI.Modules.EventStream.EventStreamStepType.Event,
            name: EVUI.Modules.TreeView.Constants.StepPrefix + "." + EVUI.Modules.TreeView.Constants.Event_OnBuildChildren,
            key: EVUI.Modules.TreeView.Constants.Event_OnBuildChildren,
            handler: function (eventArgs)
            {
                if (canContinue(opSession) === false) return;
                if (typeof opSession.nodeEntry.node.onBuildChildren === "function")
                {
                    return opSession.nodeEntry.node.onBuildChildren.call(this, eventArgs);
                }
            }
        });

        opSession.eventStream.addStep({
            type: EVUI.Modules.EventStream.EventStreamStepType.GlobalEvent,
            name: EVUI.Modules.TreeView.Constants.StepPrefix + "." + EVUI.Modules.TreeView.Constants.Event_OnBuildChildren,
            key: EVUI.Modules.TreeView.Constants.Event_OnBuildChildren,
            handler: function (eventArgs)
            {
                if (canContinue(opSession) === false) return;
                if (typeof opSession.nodeEntry.treeViewEntry.treeView.onBuildChildren === "function")
                {
                    return opSession.nodeEntry.treeViewEntry.treeView.onBuildChildren.call(opSession.nodeEntry.treeViewEntry.treeView, eventArgs);
                }
            }
        });

        opSession.eventStream.addStep({
            type: EVUI.Modules.EventStream.EventStreamStepType.Job,
            name: EVUI.Modules.TreeView.Constants.StepPrefix + "." + EVUI.Modules.TreeView.Constants.Job_BuildChildren,
            key: EVUI.Modules.TreeView.Constants.Job_BuildChildren,
            handler: function (jobEventArgs)
            {
                if (canContinue(opSession) === false) return jobEventArgs.resolve();

                var showAfterBuild = false;
                var canRecurse = isRecursiveBuildOperation(opSession);
                if (opSession.nodeEntry.options.noTopNode === true && opSession.nodeEntry.parentNodeEntry == null) //if there's no top node the children need to be expanded by default, otherwise the tree is invisible
                {
                    showAfterBuild = true;
                }               

                var newNodeState = EVUI.Modules.TreeView.TreeViewNodeState.Collapsed;
                if (opSession.action === NodeAction.Expand && showAfterBuild === true) newNodeState = EVUI.Modules.TreeView.TreeViewNodeState.Expanded;
                if (opSession.nodeEntry.expanded === true) newNodeState = EVUI.Modules.TreeView.TreeViewNodeState.Expanded;

                if (canRecurse === true)
                {
                    bindChildNodeList(opSession.nodeEntry, function (listBound)
                    {
                        if (showAfterBuild === true)
                        {
                            onExpandNode(opSession, function ()
                            {
                                opSession.nodeEntry.nodeState = EVUI.Modules.TreeView.TreeViewNodeState.Expanded;
                                jobEventArgs.resolve();
                            });
                        }
                        else
                        {
                            opSession.nodeEntry.nodeState = newNodeState;
                            jobEventArgs.resolve();
                        }
                    });
                }
                else
                {
                    opSession.nodeEntry.nodeState = newNodeState;
                    jobEventArgs.resolve();
                }
            }
        });

        opSession.eventStream.addStep({
            type: EVUI.Modules.EventStream.EventStreamStepType.Event,
            name: EVUI.Modules.TreeView.Constants.StepPrefix + "." + EVUI.Modules.TreeView.Constants.Event_OnBuiltChildren,
            key: EVUI.Modules.TreeView.Constants.Event_OnBuiltChildren,
            handler: function (eventArgs)
            {
                if (canContinue(opSession) === false) return;
                if (typeof opSession.nodeEntry.node.onChildrenBuilt === "function")
                {
                    return opSession.nodeEntry.node.onChildrenBuilt.call(this, eventArgs);
                }
            }
        });

        opSession.eventStream.addStep({
            type: EVUI.Modules.EventStream.EventStreamStepType.GlobalEvent,
            name: EVUI.Modules.TreeView.Constants.StepPrefix + "." + EVUI.Modules.TreeView.Constants.Event_OnBuiltChildren,
            key: EVUI.Modules.TreeView.Constants.Event_OnBuiltChildren,
            handler: function (eventArgs)
            {
                if (canContinue(opSession) === false) return;
                if (typeof opSession.nodeEntry.treeViewEntry.treeView.onChildrenBuilt === "function")
                {
                    return opSession.nodeEntry.treeViewEntry.treeView.onChildrenBuilt.call(opSession.nodeEntry.treeViewEntry.treeView, eventArgs);
                }
            }
        });

        opSession.eventStream.addStep({
            type: EVUI.Modules.EventStream.EventStreamStepType.Event,
            name: EVUI.Modules.TreeView.Constants.StepPrefix + "." + EVUI.Modules.TreeView.Constants.Event_OnBuilt,
            key: EVUI.Modules.TreeView.Constants.Event_OnBuilt,
            handler: function (eventArgs)
            {
                if (canContinue(opSession) === false) return;
                if (typeof opSession.nodeEntry.node.onBuilt === "function")
                {
                    return opSession.nodeEntry.node.onBuilt.call(this, eventArgs);
                }
            }
        });

        opSession.eventStream.addStep({
            type: EVUI.Modules.EventStream.EventStreamStepType.GlobalEvent,
            name: EVUI.Modules.TreeView.Constants.StepPrefix + "." + EVUI.Modules.TreeView.Constants.Event_OnBuilt,
            key: EVUI.Modules.TreeView.Constants.Event_OnBuilt,
            handler: function (eventArgs)
            {
                if (canContinue(opSession) === false) return;
                if (typeof opSession.nodeEntry.treeViewEntry.treeView.onBuilt === "function")
                {
                    return opSession.nodeEntry.treeViewEntry.treeView.onBuilt.call(opSession.nodeEntry.treeViewEntry.treeView, eventArgs);
                }
            }
        });
    };

    /**Adds the final step to the EventStream that will invoke the callback or start the next operation if the operation has a continuation operation.
    @param {OperationSession} opSession The operation session having the final step added to its EventStream.*/
    var addFinalStep = function (opSession)
    {
        opSession.eventStream.addStep({
            type: EVUI.Modules.EventStream.EventStreamStepType.Job,
            key: EVUI.Modules.TreeView.Constants.Job_FinishOperation,
            handler: function (jobEventArgs)
            {
                onFinishOperation(opSession, function ()
                {
                    jobEventArgs.resolve();
                });
            }
        });
    };

    /**Determines whether or not a given operation will recursively build all of the nodes underneath itself.
    @param {OperationSession} opSession The operation session in progress.
    @returns {Boolean}*/
    var isRecursiveBuildOperation = function (opSession)
    {
        var canRecurse = false;
        if (opSession.buildArgs.recursive === true)
        {
            canRecurse = true;
        }
        else if (opSession.action === NodeAction.Expand) //expanding always builds the child nodes if the expandMode has been set to one of the "build" options
        {
            if (opSession.nodeEntry.options.expandMode === EVUI.Modules.TreeView.TreeViewNodeBuildMode.Rebuild) canRecurse = true;
            if (opSession.nodeEntry.options.expandMode === EVUI.Modules.TreeView.TreeViewNodeBuildMode.Update) canRecurse = true;
        }
        else if (opSession.nodeEntry.options.noTopNode === true && opSession.nodeEntry.parentNodeEntry == null) //we need to build the child nodes in a "no root node" scenario 
        {
            canRecurse = true;
        }
        else if (opSession.nodeEntry.options.lazy !== true) //if the lazy setting is NOT true, we are immediately building nodes and not waiting for the direct parent to expand before building.
        {
            var parentNode = opSession.nodeEntry.parentNodeEntry;
            if (parentNode == null) //the only node with no parent node is the root
            {
                canRecurse = true; //build everything if we started at the top node
            }
            else //this is a child node of some other node, only build if its direct parent is expanding
            {
                var parentOpSession = parentNode.operation;
                if (parentOpSession != null && parentOpSession.action === NodeAction.Expand) //only recurse if the direct parent is expanding
                {
                    canRecurse = true;
                }
            }
        }

        return canRecurse;
    };

    /**INvokes the logic that will perform the bind step of the operation on the user's settings for their binding of the TreeViewNode's contents.
    @param {OperationSession} opSession The operation in progress.
    @param {Function} callback The callback to call once the user's bind operation is complete.*/
    var onBuildNode = function (opSession, callback)
    {     
        executeUserBinding(opSession.nodeEntry, function (bindingBound)
        {
            callback(bindingBound);
        });
    };

    /**Builds the root TreeViewNodeEntry of the TreeView.
    @param {OperationSession} opSession The operation in progress that required that a root node be built.
    @param {Function} callback A callback function to call once the build operation is complete.*/
    var onBuildRootNode = function (opSession, callback)
    {
        opSession.nodeEntry.treeViewEntry.element = getValidRootElement(opSession.nodeEntry.treeViewEntry.element);

        //see if the tree view has a list node at all - if not, make one
        if (opSession.nodeEntry.treeViewEntry.rootListNode == null)
        {
            opSession.nodeEntry.treeViewEntry.rootListNode = makeChildListNode(opSession.nodeEntry, false);

            opSession.nodeEntry.treeViewEntry.rootListNode.classList.remove(EVUI.Modules.TreeView.Constants.CSS_ChildNodeList);

            opSession.nodeEntry.treeViewEntry.rootListNode.classList.add(EVUI.Modules.TreeView.Constants.CSS_TreeView);
            opSession.nodeEntry.treeViewEntry.rootListNode.classList.add(EVUI.Modules.TreeView.Constants.CSS_TreeViewRoot);
            opSession.nodeEntry.treeViewEntry.rootListNode.classList.add(opSession.nodeEntry.treeViewEntry.className);
            opSession.nodeEntry.treeViewEntry.rootListNode.classList.add(EVUI.Modules.TreeView.Constants.CSS_ChildNodeList);

            opSession.nodeEntry.treeViewEntry.element.appendChild(opSession.nodeEntry.treeViewEntry.rootListNode);
        }

        //see if the root node has a root element - make one, but don't attach it just yet. Normally for any other node the binder would take care of this, but because we're not doing a binding for the first node we just manually make it
        if (opSession.nodeEntry.rootElement == null)
        {
            //make the root node's LI and decorate it with the appropriate attributes to mark it as the root node
            opSession.nodeEntry.rootElement = document.createElement("li");
            opSession.nodeEntry.rootElement.classList.add(EVUI.Modules.TreeView.Constants.CSS_TreeViewNode);
            opSession.nodeEntry.rootElement.classList.add(EVUI.Modules.TreeView.Constants.CSS_TreeViewRootNode);
            opSession.nodeEntry.rootElement.setAttribute(EVUI.Modules.TreeView.Constants.Attr_NodeId, opSession.nodeEntry.nodeId.toString());
            opSession.nodeEntry.rootElement.setAttribute(EVUI.Modules.TreeView.Constants.Attr_Depth, "0");
            opSession.nodeEntry.rootElement.setAttribute(EVUI.Modules.TreeView.Constants.Attr_Ordinal, "0");

            //make the div that the user's content will be injected into
            opSession.nodeEntry.bindingElement = document.createElement("div");
            opSession.nodeEntry.bindingElement.classList.add(EVUI.Modules.TreeView.Constants.CSS_NodeInterior);

            opSession.nodeEntry.rootElement.append(opSession.nodeEntry.bindingElement);
            opSession.nodeEntry.treeViewEntry.rootListNode.append(opSession.nodeEntry.rootElement);

            if (opSession.nodeEntry.options.noTopNode === true)
            {
                opSession.nodeEntry.treeViewEntry.rootListNode.prepend(opSession.nodeEntry.rootElement);
                opSession.nodeEntry.rootElement.remove();
            }
        }

        //if we have no top node, we have to do a bit of trickery - we leave the rootNode's rootElement detached from the DOM (so it's not null, which reduces the amount of special case crap we'll have to do for it)
        //then we assign the listNode of the root element to be the actual wrapping list for the whole tree. If we nest inside the rootElement's list, we'll be indented one extra level and it won't look right without special CSS handling
        //which we don't want the user to have to do
        if (opSession.nodeEntry.options.noTopNode === true)
        {
            if (opSession.nodeEntry.listElement == null) opSession.nodeEntry.listElement = opSession.nodeEntry.treeViewEntry.rootListNode;
        }

        opSession.nodeEntry.treeViewEntry.treeState = EVUI.Modules.TreeView.TreeViewState.Ready;

        //once the setup for the root node is done, build it like a normal node
        onBuildNode(opSession, function (success)
        {
            callback(success);
        });
    };

    /**Adds the event stream steps for an expand operation. Also adds the "build" steps as part of the expand operation.
    @param {OperationSession} opSession The operation in progress.*/
    var getExpandSteps = function (opSession)
    {
        opSession.eventStream.addStep({
            type: EVUI.Modules.EventStream.EventStreamStepType.Event,
            name: EVUI.Modules.TreeView.Constants.StepPrefix + "." + EVUI.Modules.TreeView.Constants.Event_OnExpand,
            key: EVUI.Modules.TreeView.Constants.Event_OnExpand,
            handler: function (eventArgs)
            {
                if (canContinue(opSession) === false) return;
                if (typeof opSession.nodeEntry.node.onExpand === "function")
                {
                    return opSession.nodeEntry.node.onExpand.call(this, eventArgs);
                }
            }
        });

        opSession.eventStream.addStep({
            type: EVUI.Modules.EventStream.EventStreamStepType.GlobalEvent,
            name: EVUI.Modules.TreeView.Constants.StepPrefix + "." + EVUI.Modules.TreeView.Constants.Event_OnExpand,
            key: EVUI.Modules.TreeView.Constants.Event_OnExpand,
            handler: function (eventArgs)
            {
                if (canContinue(opSession) === false) return;
                if (typeof opSession.nodeEntry.treeViewEntry.treeView.onExpand === "function")
                {
                    return opSession.nodeEntry.treeViewEntry.treeView.onExpand.call(opSession.nodeEntry.treeViewEntry.treeView, eventArgs);
                }
            }
        });

        //expanding always involves building, so we add the build steps in the middle of the expand sequence.
        getBuildSteps(opSession);

        opSession.eventStream.addStep({
            type: EVUI.Modules.EventStream.EventStreamStepType.Job,
            name: EVUI.Modules.TreeView.Constants.StepPrefix + "." + EVUI.Modules.TreeView.Constants.Job_Expand,
            key: EVUI.Modules.TreeView.Constants.Job_Expand,
            handler: function (jobArgs)
            {
                if (canContinue(opSession) === false) return jobArgs.resolve();
                onExpandNode(opSession, function (success)
                {
                    opSession.nodeEntry.nodeState = EVUI.Modules.TreeView.TreeViewNodeState.Expanded;
                    jobArgs.resolve();
                });
            }
        })

        opSession.eventStream.addStep({
            type: EVUI.Modules.EventStream.EventStreamStepType.Event,
            name: EVUI.Modules.TreeView.Constants.StepPrefix + "." + EVUI.Modules.TreeView.Constants.Event_OnExpanded,
            key: EVUI.Modules.TreeView.Constants.Event_OnExpanded,
            handler: function (eventArgs)
            {
                if (canContinue(opSession) === false) return;
                if (typeof opSession.nodeEntry.node.onExpanded === "function")
                {
                    return opSession.nodeEntry.node.onExpanded.call(this, eventArgs);
                }
            }
        });

        opSession.eventStream.addStep({
            type: EVUI.Modules.EventStream.EventStreamStepType.GlobalEvent,
            name: EVUI.Modules.TreeView.Constants.StepPrefix + "." + EVUI.Modules.TreeView.Constants.Event_OnExpanded,
            key: EVUI.Modules.TreeView.Constants.Event_OnExpanded,
            handler: function (eventArgs)
            {
                if (canContinue(opSession) === false) return;
                if (typeof opSession.nodeEntry.treeViewEntry.treeView.onExpanded === "function")
                {
                    return opSession.nodeEntry.treeViewEntry.treeView.onExpanded.call(opSession.nodeEntry.treeViewEntry.treeView, eventArgs);
                }
            }
        });
    };

    /**Performs the actual mechanics of showing a TreeViewNodeEntry's child list.
    @param {OperationSession} opSession The operation in progress.
    @param {Function} callback The callback to call once the expand operation has completed.*/
    var onExpandNode = function (opSession, callback)
    {
        if (opSession.nodeEntry.listElement == null) //no list element === no children, no work can be done
        {
            return callback(true);
        }

        var dh = new EVUI.Modules.Dom.DomHelper(opSession.nodeEntry.listElement);

        dh.removeClass(EVUI.Modules.TreeView.Constants.CSS_ChildNodeList_Hidden); //take off the class that creates the appearance of a collapsed list
        dh.addClass(EVUI.Modules.TreeView.Constants.CSS_ChildNodeList_Visible); //add the marker class that indicates an expanded child list
        opSession.nodeEntry.expanded = true;

        //get the transition effect to apply to the expansion of the child list. First see if the arguments has one, then fall back to the options's default transition
        var transition = (opSession.expandCollapseArgs == null) ? null : opSession.expandCollapseArgs.transition;
        if (transition == null) transition = opSession.nodeEntry.options.expandTransition;

        //apply the transition and don't continue until it is complete (if there was one).
        applyTransition(opSession.nodeEntry, transition, EVUI.Modules.TreeView.Constants.CSS_ChildNodeList_Expanding, dh, function (success)
        {
            callback(true)
        });
    };

    /**Performs the actual mechanics of hiding a TreeViewNodeEntry's child list.
    @param {OperationSession} opSession The operation in progress.
    @param {Function} callback The callback to call once the collapse operation has completed.*/
    var onCollapseNode = function (opSession, callback)
    {
        if (opSession.nodeEntry.listElement == null) //no list element === no children, no work to do
        {
            return callback(true);
        }

        var dh = new EVUI.Modules.Dom.DomHelper(opSession.nodeEntry.listElement);

        dh.removeClass(EVUI.Modules.TreeView.Constants.CSS_ChildNodeList_Visible); //remove the marker class for a visible list
        dh.addClass(EVUI.Modules.TreeView.Constants.CSS_ChildNodeList_Hidden); //add the class that actually hides the child list
        opSession.nodeEntry.expanded = false;

        //get the transition effect to apply to the expansion of the child list. First see if the arguments has one, then fall back to the options's default transition
        var transition = opSession.expandCollapseArgs.transition;
        if (transition == null) transition = opSession.nodeEntry.options.collapseTransition;

        //apply the transition and don't continue until it is complete (if there was one).
        applyTransition(opSession.nodeEntry, transition, EVUI.Modules.TreeView.Constants.CSS_ChildNodeList_Collapsing, dh, function (success)
        {
            callback(true)
        });
    };


    /**Applies a transition to the Pane.
    @param {TreeViewNodeEntry} entry The entry representing the pane having it's transition applied.
    @param {EVUI.Modules.TreeView.TreeViewNodeTransition} transition The transition to apply.
    @param {String} selector The class name that will be used to add the selector.
    @param {EVUI.Modules.Dom.DomHelper} element The element helper wrapping the element to get the transition.
    @param {Function} callback A callback to call once the operation completes or the function returns without adding a transition.*/
    var applyTransition = function (entry, transition, selector, element, callback)
    {
        if (typeof callback !== "function") callback = function (appliedTransition) { };
        if (entry == null || element == null) return callback(false);

        if (transition != null && transition.css != null) //if we have a transition, apply it instead of simple removing the display property.
        {
            if (transition.keyframes != null)
            {
                _services.stylesheetManager.setRules(EVUI.Modules.Styles.Constants.DefaultStyleSheetName, transition.keyframes);
            }

            if (typeof transition.css === "string") //if the css is a string, check to see if its a set of properties or selectors
            {
                var match = transition.css.match(/[\:\;]/g);
                if (match == null && match.length === 0) //if the RegEx didn't match, it's (probably) not a rule.
                {
                    selector = transition.css;
                    element.addClass(selector);
                }
            }
            else
            {
                var className = "." + entry.treeViewEntry.className + "." + ((entry.expanded === true) ? EVUI.Modules.TreeView.Constants.CSS_ChildNodeList_Expanding : EVUI.Modules.TreeView.Constants.CSS_ChildNodeList_Collapsing);

                //otherwise make a new style using the provided rules
                _services.stylesheetManager.setRules(EVUI.Modules.Styles.Constants.DefaultStyleSheetName, className, transition.css);
                element.addClass(selector);
            }

            if (entry.transitionTimeoutID !== -1)
            {
                element.removeClass(entry.transitionSelector);
                clearTimeout(entry.transitionTimeoutID);

                if (typeof entry.transitionCallback === "function")
                {
                    entry.transitionCallback();
                    entry.transitionCallback = null;
                }
            }

            entry.transitionCallback = function ()
            {
                entry.transitionCallback = null;
                entry.transitionTimeoutID = -1;
                entry.transitionSelector = null;

                element.removeClass(selector);
                callback(true);
            };

            entry.transitionSelector = selector;
            entry.transitionTimeoutID = setTimeout(function ()
            {
                if (typeof entry.transitionCallback === "function") entry.transitionCallback();
            }, transition.duration);
        }
        else //no transition, just show the element
        {
            if (entry.transitionTimeoutID !== -1)
            {
                element.removeClass(entry.transitionSelector);
                clearTimeout(entry.transitionTimeoutID);

                if (typeof entry.transitionCallback === "function")
                {
                    entry.transitionCallback();
                    entry.transitionCallback = null;
                }

                entry.transitionSelector = null;
                entry.transitionTimeoutID = -1;
            }

            callback(false);
        }
    };

    /**Performs the final steps that always apply when the EventStream for a given operation ends, regardless of success or failure.
    @param {OperationSession} opSession The operation in progress.
    @param {Function} callback A callback to call once all the other callbacks are called.*/
    var onFinishOperation = function (opSession, callback)
    {
        finishOperation(opSession, function ()
        {
            callback();
        });
    }

    /**Adds the CSS rules to the default style sheet required for the showing and hiding of child node lists. */
    var buildExpandCollapseCSSRules = function ()
    {
        if (_classesSet === true) return;
        _classesSet = true;

        //the hide class reduces the height to zero and hides the overflow, which allows for a transition to be applied whereas doing a display:none would not
        _services.stylesheetManager.setRules(EVUI.Modules.Styles.Constants.DefaultStyleSheetName, "." + EVUI.Modules.TreeView.Constants.CSS_ChildNodeList_Hidden, { height: "0px", overflow: "hidden" });

        //the show class simply nulls out the height from the show class so it returns to its original height
        _services.stylesheetManager.setRules(EVUI.Modules.Styles.Constants.DefaultStyleSheetName, "." + EVUI.Modules.TreeView.Constants.CSS_ChildNodeList_Visible, { height: null });
    };

    /**Adds the steps for collapsing a node's child list to the EventStream.
    @param {OperationSession} opSession The operation in progress.*/
    var getCollapseSteps = function (opSession)
    {
        opSession.eventStream.addStep({
            type: EVUI.Modules.EventStream.EventStreamStepType.Event,
            name: EVUI.Modules.TreeView.Constants.StepPrefix + "." + EVUI.Modules.TreeView.Constants.Event_OnCollapse,
            key: EVUI.Modules.TreeView.Constants.Event_OnCollapse,
            handler: function (eventArgs)
            {
                if (canContinue(opSession) === false) return;
                opSession.nodeEntry.nodeState = EVUI.Modules.TreeView.TreeViewNodeState.Collapsing;

                if (typeof opSession.nodeEntry.node.onCollapse === "function")
                {
                    return opSession.nodeEntry.node.onCollapse.call(this, eventArgs);
                }
            }
        });

        opSession.eventStream.addStep({
            type: EVUI.Modules.EventStream.EventStreamStepType.GlobalEvent,
            name: EVUI.Modules.TreeView.Constants.StepPrefix + "." + EVUI.Modules.TreeView.Constants.Event_OnCollapse,
            key: EVUI.Modules.TreeView.Constants.Event_OnCollapse,
            handler: function (eventArgs)
            {
                if (canContinue(opSession) === false) return;
                if (typeof opSession.nodeEntry.treeViewEntry.treeView.onCollapse === "function")
                {
                    return opSession.nodeEntry.treeViewEntry.treeView.onCollapse.call(opSession.nodeEntry.treeViewEntry.treeView, eventArgs);
                }
            }
        });

        opSession.eventStream.addStep({
            type: EVUI.Modules.EventStream.EventStreamStepType.Job,
            name: EVUI.Modules.TreeView.Constants.StepPrefix + "." + EVUI.Modules.TreeView.Constants.Job_Collapse,
            key: EVUI.Modules.TreeView.Constants.Job_Collapse,
            handler: function (jobArgs)
            {
                if (canContinue(opSession) === false) return jobArgs.resolve();
                onCollapseNode(opSession, function (success)
                {
                    opSession.nodeEntry.nodeState = EVUI.Modules.TreeView.TreeViewNodeState.Collapsed;
                    jobArgs.resolve();
                });
            }
        })

        opSession.eventStream.addStep({
            type: EVUI.Modules.EventStream.EventStreamStepType.Event,
            name: EVUI.Modules.TreeView.Constants.StepPrefix + "." + EVUI.Modules.TreeView.Constants.Event_OnCollapsed,
            key: EVUI.Modules.TreeView.Constants.Event_OnCollapseed,
            handler: function (eventArgs)
            {
                if (canContinue(opSession) === false) return;
                if (typeof opSession.nodeEntry.node.onCollapseed === "function")
                {
                    return opSession.nodeEntry.node.onCollapseed.call(this, eventArgs);
                }
            }
        });

        opSession.eventStream.addStep({
            type: EVUI.Modules.EventStream.EventStreamStepType.GlobalEvent,
            name: EVUI.Modules.TreeView.Constants.StepPrefix + "." + EVUI.Modules.TreeView.Constants.Event_OnCollapsed,
            key: EVUI.Modules.TreeView.Constants.Event_OnCollapseed,
            handler: function (eventArgs)
            {
                if (canContinue(opSession) === false) return;
                if (typeof opSession.nodeEntry.treeViewEntry.treeView.onCollapsed === "function")
                {
                    return opSession.nodeEntry.treeViewEntry.treeView.onCollapsed.call(opSession.nodeEntry.treeViewEntry.treeView, eventArgs);
                }
            }
        });
    };

    /**Determines whether or not an operation in progress can continue or should be skipped over and aborted.
    @param {OperationSession} opSession The operation in progress.
    @returns {Boolean} */
    var canContinue = function (opSession)
    {
        if (opSession.canceled === true) return false;
        if (opSession.nodeEntry.nodeState === EVUI.Modules.TreeView.TreeViewNodeState.Disposed) return false;

        return true;
    };

    /**Gets all the children for a given TreeViewNodeEntry's source object.
    @param {TreeViewNodeEntry} nodeEntry The TreeViewNodeEntry to get the children for.
    @returns {[]} */
    var getChildren = function (nodeEntry)
    {
        if (nodeEntry.childListName == null) return null;

        var childListNameType = typeof nodeEntry.childListName;
        if (childListNameType === "string" || childListNameType === "symbol")
        {
            return (nodeEntry.source != null) ? EVUI.Modules.Core.Utils.getValue(nodeEntry.childListName, nodeEntry.source) : null;
        }
        else if (childListNameType === "function")
        {
            try
            {
                return nodeEntry.childListName(nodeEntry.source)
            }
            catch (ex)
            {
                EVUI.Modules.Core.Utils.log("Failed to get child list: ");
                EVUI.Modules.Core.Utils.log(ex);
                return null;
            }
        }
        else
        {
            return null;
        }
    };

    /**Performs the data binding for the wrapper elements for the user's DOM nodes.
    @param {TreeViewNodeEntry} nodeEntry The node to build the child list for.
    @param {Function} callback A callback function to call once the binding operation is complete.*/
    var bindChildNodeList = function(nodeEntry, callback)
    {
        //make the internal list of TreeViewNodeEntries representing the children we will stamp out nodes for
        var newChildren = setChildNodeList(nodeEntry);
        var numChildren = newChildren.length;

        //set the dummy "stubs" that are the anchor for the child list data binding sites
        setStubList(nodeEntry);

        if (numChildren === 0) //no children, get rid of the child list element as it is not needed anymore
        {
            if (nodeEntry.listElement != null)
            {
                nodeEntry.listElement.remove();
                nodeEntry.listElement = null;
            }

            return callback(true);
        }

        //have children, but not a list element. Go make it and add it to the end of the current node's wrapper so we have a place to stick the child nodes
        if (nodeEntry.listElement == null)
        {
            nodeEntry.listElement = makeChildListNode(nodeEntry, true);
            nodeEntry.rootElement.append(nodeEntry.listElement);
        }

        //make a quick lookup table for the nodes based on their ID's so we can quickly go look them up in onStubListItemBound without looping over a potentially large list of nodes over and over
        var childNodeDic = EVUI.Modules.Core.Utils.toDictionary(nodeEntry.childNodeEntries, function (item) { return item.nodeId });

        var context = new StubBindingContext();
        context.childNodes = childNodeDic;
        context.parentNodeEntry = nodeEntry;

        //if we can safely trigger an update for the current binding (i.e. it exists and we're not in a state where the options disallows it), use the binder's update functionality
        if (nodeEntry.childListBinding != null || (nodeEntry.childListBinding != null && nodeEntry.options.expandMode !== EVUI.Modules.TreeView.TreeViewNodeBuildMode.Rebuild))
        {
            context.reBinding = true;

            nodeEntry.childListBinding.update({
                bindingContext: context,
                bindingSource: nodeEntry.childListStubs,
            },function (binding)
            {
                //once complete with the update of the node entry scaffold for the user's bindings, go through and build each user binding in the child list. This will put the user's content in the right order in the tree view that reflects the data model
                var numToBind = nodeEntry.childNodeEntries.length;
                var numBound = 0;
                var commonCallback = function ()
                {
                    numBound++;
                    if (numBound === numToBind)
                    {
                        callback(true);
                    }
                }

                for (var x = 0; x < numToBind; x++)
                {
                    triggerBuild(nodeEntry.childNodeEntries[x], null, function ()
                    {
                        commonCallback();
                    });
                }
            });
        }
        else //otherwise we have no binding or are set to force a (slower) rebuild
        {
            _services.bindingController.bind({
                element: nodeEntry.listElement,
                source: nodeEntry.childListStubs,
                htmlContent: "<li " + getNodeAttributeString() + " ><div class=\"" + EVUI.Modules.TreeView.Constants.CSS_NodeInterior + "\"></div></li>",
                insertionMode: EVUI.Modules.Binding.BindingInsertionMode.Append,
                bindingContext: context,
                onBind: function (eventArgs)
                {
                    if (EVUI.Modules.Core.Utils.isArray(eventArgs.binding.source) === true) //if the source object for the binding is an array, it's the binding that holds the slots for all the user bindings
                    {
                        nodeEntry.childListBinding = eventArgs.binding;
                    }
                },
                onBound: function (eventArgs)
                {
                    eventArgs.pause();

                    //for every part of the binding scaffold bound, go fire off the user's binding for that slot in the tree
                    onStubListItemBound(eventArgs.context, eventArgs.binding, function ()
                    {
                        eventArgs.resume();
                    });                    
                }
            }, function ()
            {
                callback(true);
            });
        }        
    };

    /**Gets a string of all the standard attributes to attach to the node exterior wrappers for the user's content. These are to allow CSS selectors to target nodes based on their hierarchy or ordinals.
    @returns {String}*/
    var getNodeAttributeString = function ()
    {
        var attributes = EVUI.Modules.TreeView.Constants.Attr_NodeId + "=\"{{nodeId}}\" ";
        attributes += EVUI.Modules.TreeView.Constants.Attr_Depth + "=\"{{depth}}\" ";
        attributes += EVUI.Modules.TreeView.Constants.Attr_Ordinal + "=\"{{ordinal}}\" ";

        return attributes;
    };

    /**Binds or updates the Binding that is binding the user's content to it's respective node.
    @param {TreeViewNodeEntry} nodeEntry The node entry having its binding built.
    @param {Function} callback A callback to call once the user's binding has completed.*/
    var executeUserBinding = function (nodeEntry, callback)
    {
        //if we're expanding and have previously bound node but are in manual mode, do not execute the binding.
        if (nodeEntry.operation != null && nodeEntry.operation.action === NodeAction.Expand && nodeEntry.binding != null && nodeEntry.options.expandMode === EVUI.Modules.TreeView.TreeViewNodeBuildMode.Manual)
        {
            return callback(true);
        }

        //remove any event handlers already added so we don't add redundant ones and cause a memory leak
        detachUserEvents(nodeEntry);

        if (nodeEntry.binding != null && nodeEntry.options.expandMode !== EVUI.Modules.TreeView.TreeViewNodeBuildMode.Rebuild) //if there's already a binding, we just update it
        {
            if (nodeEntry.bindingTemplate != null && (typeof nodeEntry.bindingTemplate === "string"
                || nodeEntry.binding.templateName !== nodeEntry.bindingTemplate.templateName
                || nodeEntry.bindingTemplateChanged === true)) //if the template has been changed, apply it to the binding
            {
                nodeEntry.binding.applyBindingTemplate(nodeEntry.bindingTemplate);
            }

            //trigger the update
            nodeEntry.binding.update(nodeEntry.source, function (binding)
            {
                if (binding.bindingCompletionState === EVUI.Modules.Binding.BindingCompletionState.Success || binding.bindingCompletionState === EVUI.Modules.Binding.BindingCompletionState.Queued)
                {
                    attachAllUserEvents(nodeEntry);
                    if (nodeEntry.childListBinding != null && EVUI.Modules.Core.Utils.isOrphanedNode(nodeEntry.childListBinding.element) === true)
                    {
                        nodeEntry.rootElement.append(nodeEntry.childListBinding.element);
                    }

                    return callback(true);
                }
                else
                {
                    return callback(false);
                }
            });
        }
        else //no binding yet, make a fresh one
        {
            nodeEntry.bindingTemplate.insertionMode = EVUI.Modules.Binding.BindingInsertionMode.Append; //we will always append, no matter what the user tells us to do

            _services.bindingController.bind(nodeEntry.bindingTemplate, { bindingSource: nodeEntry.source, bindingTarget: nodeEntry.bindingElement }, function (binding)
            {
                nodeEntry.binding = binding;
                if (binding.bindingCompletionState === EVUI.Modules.Binding.BindingCompletionState.Success || binding.bindingCompletionState === EVUI.Modules.Binding.BindingCompletionState.Queued)
                {
                    attachAllUserEvents(nodeEntry);
                    if (nodeEntry.childListBinding != null && EVUI.Modules.Core.Utils.isOrphanedNode(nodeEntry.childListBinding.element) === true)
                    {
                        nodeEntry.rootElement.append(nodeEntry.childListBinding.element);
                    }

                    return callback(true);
                }
                else
                {
                    return callback(false);
                }
            });
        }
    };

    /**Attaches all of the user events indicated by the use of the expanOn, collapseOn, and toggleOn attributes and, if those are not present, attaches an automatic expand/collapse event handler.
    @param {TreeViewNodeEntry} nodeEntry The node having its events attached.*/
    var attachAllUserEvents = function (nodeEntry)
    {
        if (nodeEntry == null || nodeEntry.binding == null) return;

        //go attach any and all events indicated by the use of the special attributes
        var numExpand = attachUserEvents(nodeEntry, EVUI.Modules.TreeView.Constants.Attr_ExpandOn);
        var numCollapse = attachUserEvents(nodeEntry, EVUI.Modules.TreeView.Constants.Attr_CollapseOn);
        var numToggle = attachUserEvents(nodeEntry, EVUI.Modules.TreeView.Constants.Attr_ToggleOn);

        //if none were attached and auto-toggle is true, rig up a handler on the root bound content's wrapping element.
        if (numExpand === 0 && numCollapse === 0 && numToggle === 0 && nodeEntry.options.autoToggle === true)
        {
            var handler = function (eventArgs)
            {
                triggerToggle(nodeEntry);
            };

            nodeEntry.binding.element.addEventListener("click", handler);

            //make a binding entry for it so we can detach it later in the event of a re-bind or disposal
            var entry = new EventHandlerBinding();
            entry.element = nodeEntry.binding.element;
            entry.eventName = "click";
            entry.handler = handler;

            nodeEntry.eventBindings.push(entry);
        }
    };

    /**Attaches the event handlers for a given action given the attribute value for the action to take. 
    @param {TreeViewNodeEntry} nodeEntry The node being processed for expand/collapse/toggle operations.
    @returns {Number}*/
    var attachUserEvents = function (nodeEntry, attributeName)
    {
        if ((attributeName !== EVUI.Modules.TreeView.Constants.Attr_CollapseOn &&
            attributeName !== EVUI.Modules.TreeView.Constants.Attr_ExpandOn &&
            attributeName !== EVUI.Modules.TreeView.Constants.Attr_ToggleOn) ||
            EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(attributeName) === true)
        {
            return 0;
        }

        var matches = new EVUI.Modules.Dom.DomHelper(nodeEntry.bindingElement, "[" + attributeName + "]");

        var numEntries = 0;
        var numMatches = matches.elements.length;
        for (var x = 0; x < numMatches; x++)
        {
            var curMatch = matches.elements[x];
            var userEvents = curMatch.getAttribute(attributeName);
            if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(userEvents) === true) continue;

            userEvents = userEvents.trim().split(/\s+/);

            var numEvents = userEvents.length;
            for (var y = 0; y < numEvents; y++)
            {
                var eventName = userEvents[x];
                var handler = null;
                if (attributeName === EVUI.Modules.TreeView.Constants.Attr_CollapseOn)
                {
                    handler = function (eventArgs)
                    {
                        triggerCollapse(nodeEntry);
                    };
                }
                else if (attributeName === EVUI.Modules.TreeView.Constants.Attr_ExpandOn)
                {
                    handler = function (eventArgs)
                    {
                        triggerExpand(nodeEntry);
                    };
                }
                else if (attributeName === EVUI.Modules.TreeView.Constants.Attr_ToggleOn)
                {
                    handler = function (eventArgs)
                    {
                        triggerToggle(nodeEntry);
                    };
                }

                curMatch.addEventListener(eventName, handler);

                //add it to our registry of attached handlers so we can detach it later if we re-bind the node or dispose it so we don't cause redundant handlers or memory leaks
                var entry = new EventHandlerBinding();
                entry.element = curMatch;
                entry.eventName = eventName;
                entry.handler = handler;

                numEntries = nodeEntry.eventBindings.push(entry)
            }
        }

        return numEntries;
    };

    /**De-registers all event handlers with a given user binding.
    @param {TreeViewNodeEntry} nodeEntry The node entry to remove the event handlers from.*/
    var detachUserEvents = function (nodeEntry)
    {
        var numBindings = nodeEntry.eventBindings.length
        for (var x = 0; x < numBindings; x++)
        {
            var curEvent = nodeEntry.eventBindings[x];
            curEvent.element.removeEventListener(curEvent.eventName, curEvent.handler);
        }

        nodeEntry.eventBindings.splice(0, numBindings);
    };

    /**When a binding stub's binding is complete, this associates the resulting DOM node's area for the user's binding and triggers the execution of the user's binding.
    @param {StubBindingContext} context The contextual information about the stub item being bound.
    @param {EVUI.Modules.Binding.Binding} binding The Binding that was just produced for the binding stub.
    @param {Function} callback A callback function to call once the user's binding has been bound or updated.*/
    var onStubListItemBound = function (context, binding, callback)
    {
        if (EVUI.Modules.Core.Utils.isArray(binding.source) === true) //if the source of the binding is the array, it means all the children are done
        {
            //its possible that a node build was canceled and should be removed from the final DOM content/model. If so we need to update the tree again so that the nodes have the correct ordinal attribute on them 
            var numToDispose = context.nodesToDispose.length;
            if (numToDispose === 0) return callback();

            for (var x = 0; x < numToDispose; x++)
            {
                var nodeToDispose = context.nodesToDispose[x];
                disposeTreeViewNode(nodeToDispose);
            }

            //detach the onBound event handler that would otherwise trigger the re-binding of the user's binding, which we don't want in this case
            var onBound = context.parentNodeEntry.binding.onBound;
            context.parentNodeEntry.binding.onBound = null;

            setStubList(context.parentNodeEntry);

            context.parentUpdateOnly = true;
            return context.parentNodeEntry.binding.update(function (binding)
            {
                context.parentNodeEntry.binding.onBound = onBound;
                callback();
            });
        }

        var childNode = context.childNodes[binding.source.nodeId];
        if (childNode == null) return callback();

        if (context.reBinding == false) //first time bind, a new node
        {
            //the 0th (and only) item in the boundContent array is the recently stamped-out container for the user's binding and thenode's child list, which we make into the root element of the node 
            childNode.rootElement = binding.getBoundContent()[0]; 
            childNode.bindingElement = childNode.rootElement.firstChild; 

            //now that the location for the user's binding exists, execute the user's binding in its new slot
            triggerBuild(childNode, null, function (disposeNode)
            {
                if (disposeNode === true) context.nodesToDispose.push(childNode);
                callback();
            });
        }
        else //re-binding an existing node because something about it's binding stub changed that necessitated re-merging the HMTL
        {
            var boundContent = binding.getBoundContent();

            //re-associate all the elements with the child node
            childNode.rootElement = boundContent[0];
            childNode.bindingElement = childNode.rootElement.firstChild;
            childNode.binding.element = childNode.bindingElement;

            //then go re-attach all the bound content to get the node back into the state it was before
            var childBoundContent = childNode.binding.getBoundContent();
            var numBoundContent = childBoundContent != null ? childBoundContent.length : 0;
            for (var x = 0; x < numBoundContent; x++)
            {
                childNode.binding.element.append(childBoundContent[x]);
            }

            callback();
        }
    };

    /**Makes the root list node for the tree view child list based on the listElementType setting. 
    @param {TreeViewNodeEntry} nodeEntry The TreeViewNodeEntry that needs a child list made for it.
    @returns {Element}*/
    var makeChildListNode = function (nodeEntry, hide)
    {
        var root = null;

        if (nodeEntry.options.listElementType === EVUI.Modules.TreeView.TreeViewListElementType.Ordered)
        {
            root = document.createElement("ol");
        }
        else if (nodeEntry.options.listElementType === EVUI.Modules.TreeView.TreeViewListElementType.Unordered)
        {
            root = document.createElement("ul");
        }
        else
        {
            root = document.createElement("ul")
        }

        root.classList.add(EVUI.Modules.TreeView.Constants.CSS_ChildNodeList);
        if (hide === true) root.classList.add(EVUI.Modules.TreeView.Constants.CSS_ChildNodeList_Hidden);

        return root;
    };

    /**Builds the internal array of childNodeEntries for the given TreeViewNodeEntry.
     *
     * @param {TreeViewNodeEntry} nodeEntry
     */
    var setChildNodeList = function (nodeEntry)
    {
        var children = getChildren(nodeEntry); //get the node's child source objects as per the user's setting
        var hadChildren = (children != null && EVUI.Modules.Core.Utils.isArray(children) === true);
        var numChildren = (hadChildren === true) ? children.length : 0;        

        if (nodeEntry.childList == null && hadChildren === true) //had no children before, but do have them now
        {
            nodeEntry.childList = children;
            nodeEntry.childListObserver = new EVUI.Modules.Observers.ArrayObserver(children);

            nodeEntry.childListChanged = true;
            nodeEntry.treeViewEntry.nodesChanged = true;
        }
        else //either has no children, or had children and now has no children
        {
            if (nodeEntry.childList != null && (hadChildren === false || numChildren === 0)) //had children, but no longer has children
            {
                //dispose of all the child nodes - disposing of a node alters the childNodeEntries list's length, so we keep getting rid of the 0th node until we run out
                while (nodeEntry.childNodeEntries.length > 0)
                {
                    disposeTreeViewNode(nodeEntry.childNodeEntries[0]);
                }

                //clear out the medadata for the children
                nodeEntry.childList = null;
                nodeEntry.childListObserver = null;
                nodeEntry.childListChanged = true;
                nodeEntry.treeViewEntry.nodesChanged = true;

                return nodeEntry.childNodeEntries;
            }
            else if (nodeEntry.childList != null)//had children before, has children now, make sure the internal array of childNodeEntries matches the bound list.
            {
                return syncChildNodeList(nodeEntry, children);
            }
        }

        //if we get here it had no children before, so we have new childNodeEntires for each new child. Make a "fake" template node that has all the properties of it's parent node to use to stamp out child nodes.
        var fakeNode = EVUI.Modules.Core.Utils.shallowExtend({}, nodeEntry.node, ["options"]);
        for (var x = 0; x < numChildren; x++)
        {
            var childNodeSource = children[x];

            //the only difference in the child nodes is their source object - beyond that they are clones of their parent.
            fakeNode.source = childNodeSource;

            var childNodeEntry = makeTreeViewNodeAmbiguously(fakeNode, nodeEntry.treeViewEntry, nodeEntry);
            nodeEntry.childNodeEntries.push(childNodeEntry);
            nodeEntry.treeViewEntry.nodes.push(childNodeEntry);
        }

        nodeEntry.childListChanged = true;
        nodeEntry.treeViewEntry.nodesChanged = true;

        return nodeEntry.childNodeEntries;
    };

    /**Makes the "stubList" of objects that the data binder uses for the tree node exteriors.
    @param {TreeViewNodeEntry} nodeEntry The TreeViewNodeEntry having its child stub list built.*/
    var setStubList = function (nodeEntry)
    {
        if (nodeEntry == null) return;

        var numChildren = nodeEntry.childNodeEntries.length;
        if (numChildren === 0) return;

        nodeEntry.childListStubs.splice(0, nodeEntry.childListStubs.length);

        var depth = getDepth(nodeEntry);
        nodeEntry.depth = depth;

        for (var x = 0; x < numChildren; x++)
        {
            var curChild = nodeEntry.childNodeEntries[x];
            curChild.depth = depth + 1;

            curChild.bindingStub.depth = curChild.depth;
            curChild.bindingStub.nodeId = curChild.nodeId;
            curChild.bindingStub.ordinal = x;

            nodeEntry.childListStubs.push(curChild.bindingStub);
        }
    };

    /**Takes an existing child node list and syncs its contents with the child node list matching the changed contents of the user's source list.
    @param {TreeViewNodeEntry} nodeEntry The TreeViewNodeEntry having its childNode's list synced.
    @param {[]} newChildren The array of child objects provided by the user.
    @returns {TreeViewNodeEntry[]} */
    var syncChildNodeList = function (nodeEntry, newChildren)
    {
        var numChildren = newChildren == null ? 0 : newChildren.length;
        var numExisting = nodeEntry.childList.length;
        var longer = numExisting > numChildren ? numExisting : numChildren;
        var changes = [];

        if (newChildren === nodeEntry.childList) //same reference, just get the change list and update the internal state
        {
            changes = nodeEntry.childListObserver.getChanges(true);
        }
        else //different list, make the current list the same as the new list so we can properly diff it
        {
            
            for (var x = 0; x < longer; x++)
            {
                nodeEntry.childList[x] = newChildren[x];
            }

            changes = nodeEntry.childListObserver.getChanges();

            //re-set the list and make a new observer
            nodeEntry.childList = newChildren;
            nodeEntry.childListObserver = new EVUI.Modules.Observers.ArrayObserver(newChildren);

            nodeEntry.childListChanged = true;
            nodeEntry.treeViewEntry.nodesChanged = true;
        }

        //placeholder for a dummy node to use to make new nodes with (we do this in the loop so we don't needlessly clone a huge object)
        var fakeNode = null; 
        var numChanges = changes.length;
        var childNodes = []; //make a dummy list of node entries to sync with the existing list
        var removals = []; //make a list to hold any indexes we need to splice out of the "official" list

        if (numChanges > 0 || numExisting != numChildren)
        {
            nodeEntry.childListChanged = true;
            nodeEntry.treeViewEntry.nodesChanged = true;
        }

        for (var x = 0; x < numChanges; x++)
        {
            var curChange = changes[x];
            if (curChange.changeType === EVUI.Modules.Observers.ArrayChangeType.Added) //node added, put it at the index where it is in the new child list
            {
                if (fakeNode == null) fakeNode = EVUI.Modules.Core.Utils.shallowExtend({}, nodeEntry.node, ["options"]); //lazily clone a fake node from the parent node to give the child node its properties
                fakeNode.source = curChange.value; //set the source so that it has the right source object when it is made.

                var newEntry = makeTreeViewNodeAmbiguously(fakeNode, nodeEntry.treeViewEntry, nodeEntry); //make the actual node entry for the array
                childNodes[curChange.newIndex] = newEntry;
            }
            else if (curChange.changeType === EVUI.Modules.Observers.ArrayChangeType.Moved || curChange.changeType === EVUI.Modules.Observers.ArrayChangeType.Shifted) //a shift or a move requires us to just set the element at the new index.
            {
                var entry = nodeEntry.childNodeEntries[curChange.oldIndex];
                childNodes[curChange.newIndex] = entry;
            }
            else if (curChange.changeType === EVUI.Modules.Observers.ArrayChangeType.Removed) //removed node, add it to the removals list to remove after the sync is done
            {
                removals.push(nodeEntry.childNodeEntries[curChange.oldIndex]);
            }
            else //otherwise just set it at the new index
            {
                if (newIndex < 0) continue;

                var entry = nodeEntry.childNodeEntries[curChange.oldIndex];
                childNodes[curChange.newIndex] = entry;
            }
        }


        //now go change the contents of the actual child node array to match the partially synced list.
        for (var x = 0; x < longer; x++)
        {
            var newChild = childNodes[x];
            if (newChild != null)
            {
                nodeEntry.childNodeEntries[x] = newChild
            }
        }

        //remove the removals last because they impact the indexes of the other child nodes.
        var numRemovals = removals.length;
        for (var x = 0; x < numRemovals; x++)
        {
            disposeTreeViewNode(removals[x])
        }        

        return nodeEntry.childNodeEntries; //now the array of node entries should be in sync with the array of new source objects.
    };

   

    /**Disposes of a TreeViewNodeEntry by removing it from the DOM, its parent, and removing all objects from memory to release all the resources that were used by the node.
    @param {TreeViewNodeEntry} treeViewNode The node to dispose.*/
    var disposeTreeViewNode = function (treeViewNode)
    {
        if (treeViewNode == null) return;

        detachUserEvents(treeViewNode);

        if (treeViewNode.binding != null) treeViewNode.binding.dispose();
        if (treeViewNode.rootElement != null) treeViewNode.rootElement.remove();

        var numChildren = treeViewNode.childNodeEntries.length;
        var hadChildren = false;
        while (numChildren > 0)
        {
            hadChildren = true;
            numChildren--;

            var curChild = treeViewNode.childNodeEntries[x];
            disposeTreeViewNode(curChild);
        }

        var parentNode = treeViewNode.parentNodeEntry;
        if (parentNode != null)
        {
            var index = parentNode.childNodeEntries.indexOf(treeViewNode);
            if (index !== -1) parentNode.childNodeEntries.splice(index, 1);

            index = parentNode.childListStubs.indexOf(treeViewNode.bindingStub);
            if (index !== -1) parentNode.childListStubs.splice(index, 1);

            parentNode.childListChanged = true;
            parentNode.treeViewEntry.nodesChanged = true;
        }
        else
        {
            //we always need to have a root node, so we clone a dummy one from the current state of the node
            treeViewNode.treeViewEntry.rootNode = makeTreeViewNodeAmbiguously(treeViewNode.node, treeViewNode.treeViewEntry, null);
        }

        var treeViewIndex = treeViewNode.treeViewEntry.nodes.indexOf(treeViewNode);
        if (treeViewIndex !== -1)
        {
            treeViewNode.treeViewEntry.nodes.splice(treeViewIndex, 1);
            treeViewNode.treeViewEntry.nodesChanged = true;
        }

        if (hadChildren === true)
        {
            if (treeViewNode.childListBinding != null) treeViewNode.childListBinding.dispose();

            treeViewNode.childList = null;
            treeViewNode.childListName = null;
            treeViewNode.childListObserver = null;
            treeViewNode.childListStubs = [];
            treeViewNode.childNodeEntries = [];
            treeViewNode.childListBinding = null;

            nodeEntry.childListChanged = true;
            nodeEntry.treeViewEntry.nodesChanged = true;
        }

        treeViewNode.binding = null;
        treeViewNode.bindingElement = null;
        treeViewNode.bindingStub = null;
        treeViewNode.bindingTemplate = null;
        treeViewNode.continuations = null;
        treeViewNode.listElement = null;
        treeViewNode.node = null;
        treeViewNode.nodeState = EVUI.Modules.TreeView.TreeViewNodeState.Disposed;
        treeViewNode.options = null;
        treeViewNode.operation = null;
        treeViewNode.source = null;
        treeViewNode.treeViewEntry = null;

        treeViewNode.childListChanged = true;
        treeViewNode.optionsChanged = true;
        treeViewNode.bindingTemplateChanged = true;
    };

    /**Disposes of an entrie TreeView.
    @param {TreeViewEntry} treeViewEntry The TreeView to dispose.*/
    var disposeTreeView = function (treeViewEntry)
    {
        //kick off the recursive disposal process by disposing of the root node
        if (treeViewEntry.rootNode != null) disposeTreeViewNode(treeViewEntry.rootNode);

        treeViewEntry.element = null;

        if (treeViewEntry.rootListNode != null)
        {
            treeViewEntry.rootListNode.remove();
            treeViewEntry.rootListNode = null;
        }

        treeViewEntry.nodes.splice(0, treeViewEntry.nodes.length);
        treeViewEntry.nodesChanged = true;

        treeViewEntry.treeState = EVUI.Modules.TreeView.TreeViewState.Disposed;
    }

    /**Gets a TreeViewNodeEntry from a TreeViewEntry based on its ID.
    @param {TreeViewEntry} treeViewEntry The TreeView that contains the node.
    @param {Number} nodeId The ID of the node to get.
    @returns {TreeViewNodeEntry} */
    var getNodeById = function (treeViewEntry, nodeId)
    {
        var numNodes = treeViewEntry.nodes.length;
        for (var x = 0; x < numNodes; x++)
        {
            var curNode = treeViewEntry.nodes[x];
            if (curNode.nodeId === nodeId) return curNode;
        }

        return null;
    };

    /**Makes a TreeViewNodeEntry based on ambiguous input.
    @param {EVUI.Modules.TreeView.AddTreeViewNodeArgs|EVUI.Modules.TreeView.TreeViewNode} addNodeArgs Either a YOLO tree view node or a YOLO AddTreeNodeArgs object that will be used as the basis for making the new node.
    @param {TreeViewEntry} treeViewEntry The parent tree view that will own the new node.
    @param {TreeViewNodeEntry} parentNodeEntry The parent node that will own the new node. All nodes but the root node will have a parent.
    @returns {TreeViewNodeEntry} */
    var makeTreeViewNodeAmbiguously = function (addNodeArgs, treeViewEntry, parentNodeEntry)
    {
        var tvNodeEntry = new TreeViewNodeEntry();
        tvNodeEntry.treeViewEntry = treeViewEntry;
        tvNodeEntry.bindingTemplate = addNodeArgs.bindingTemplate;
        tvNodeEntry.childListName = addNodeArgs.childListName
        tvNodeEntry.node = new EVUI.Modules.TreeView.TreeViewNode(tvNodeEntry);
        tvNodeEntry.nodeState = EVUI.Modules.TreeView.TreeViewNodeState.None;
        tvNodeEntry.parentNodeEntry = parentNodeEntry;
        tvNodeEntry.source = addNodeArgs.source; //this needs to be an object but we don't enforce it here because it could be changed in an event during the binding process.

        var options = addNodeArgs.options;
        var optionsMode = addNodeArgs.optionsMode;

        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(optionsMode) === true) //no options mode, go get the options mode from its parent
        {
            if (parentNodeEntry != null && EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(parentNodeEntry.node.optionsMode) === false)
            {
                optionsMode = parentNodeEntry.node.optionsMode;
            }

            if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(optionsMode) === true) //still no options mode, set the share mode to the default.
            {
                optionsMode = EVUI.Modules.TreeView.TreeViewOptionsShareMode.TreeShared;
            }
        }

        if (optionsMode === EVUI.Modules.TreeView.TreeViewOptionsShareMode.Cloned)
        {
            if (options == null)
            {
                if (parentNodeEntry != null && parentNodeEntry.options != null)
                {
                    options = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.TreeView.TreeViewOptions(), parentNodeEntry.options);
                }
                else
                {
                    options = EVUI.Modules.TreeView.TreeViewOptions();
                }
            }
            else
            {
                if (EVUI.Modules.Core.Utils.instanceOf(options, EVUI.Modules.TreeView.TreeViewOptions) === false)
                {
                    options = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.TreeView.TreeViewOptions(), options);
                }
            }
        }
        else if (optionsMode === EVUI.Modules.TreeView.TreeViewOptionsShareMode.TreeShared)
        {
            if (parentNodeEntry == null && treeViewEntry.rootNode == null)
            {
                options = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.TreeView.TreeViewOptions(), options);
            }
            else
            {
                var numNodes = treeViewEntry.nodes.length;
                for (var x = 0; x < numNodes; x++)
                {
                    var curNode = treeViewEntry.nodes[x];
                    if (curNode.optionsChanged === false)
                    {
                        options = curNode.options;
                        break;
                    }
                }
            }
        }
        else if (optionsMode === EVUI.Modules.TreeView.TreeViewOptionsShareMode.PeerNodeShared)
        {
            var peer = null;

            if (parentNodeEntry != null)
            {
                var numPeers = parentNodeEntry.childNodeEntries.length;
                for (var x = 0; x < numPeers; x++)
                {
                    var curPeer = parentNodeEntry.childNodeEntries[x];
                    if (curPeer.optionsChanged === false)
                    {
                        peer = curPeer;
                        break;
                    }
                }
            }

            if (peer != null)
            {
                options = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.TreeView.TreeViewOptions(), peer.options);
            }
            else
            {
                options = new EVUI.Modules.TreeView.TreeViewOptions();
            }
        }
        else
        {
            options = EVUI.Modules.Core.Utils.shallowExtend(new EVUI.Modules.TreeView.TreeViewOptions(), options);
        }

        if (options == null)
        {
            options = new EVUI.Modules.TreeView.TreeViewOptions();
        }


        tvNodeEntry.options = options;
        EVUI.Modules.Core.Utils.shallowExtend(tvNodeEntry.node, addNodeArgs, _nodeExclusions.concat(["source", "options"]));

        return tvNodeEntry;
    };

    /**Gets a usable element to use as the root of a TreeView.
     * @param {Element|DocumentFragment|String} ele Either an Element reference, a DocumentFragment, or a CSS selector to use to be/find the root element of the tree.
    @returns {Element|DocumentFragment}*/
    var getValidRootElement = function (ele)
    {        
        if (EVUI.Modules.Core.Utils.isElement(ele) === true) return ele;
        if (ele != null && ele.nodeType === Node.DOCUMENT_FRAGMENT_NODE) return ele;
        if (typeof ele === "string")
        {
            var domHelper = new EVUI.Modules.Dom.DomHelper(ele);
            if (domHelper.elements.length > 0)
            {
                return domHelper.elements[0];
            }
        }

        if (EVUI.Modules.Core.Utils.isDomHelper(ele) === true && ele.elements.length > 0) return ele.elements[0];
        return document.createDocumentFragment();
    };

    /**Figures out the "right" thing to do given the current state of a node, its progress in whatever it is currently doing, and what it has just been asked to do.
    @param {TreeViewNodeEntry} nodeEntry The node impacted by the incoming operation.
    @param {OperationSession} opSession The incoming operation session being evaluated.
    @returns {ActionSequence} */
    var getActionSequence = function (nodeEntry, opSession)
    {
        var actionSequence = new ActionSequence();
        actionSequence.primaryAction = opSession.action;

        var nodeState = opSession.nodeEntry.nodeState;

        if (nodeState === EVUI.Modules.TreeView.TreeViewNodeState.None) //node isn't doing anything, do whatever was requested
        {
            actionSequence.actions.push(opSession.action);            
        }
        else if (nodeState === EVUI.Modules.TreeView.TreeViewNodeState.Building) //in the process of building itself
        {
            if (opSession.action === NodeAction.Expand) //expansion can be executed after a manual build
            {
                actionSequence.continueAfter = true;
                actionSequence.actions.push(NodeAction.Expand);
            }
            else if (opSession.action == NodeAction.Build) //already building, but told to build again. Something may have changed, so do the new build and cancel the current one.
            {
                actionSequence.cancelCurrent = true;
                actionSequence.actions.push(NodeAction.Build);
            }
            else //anything else (a collapse) can be executed after build finishes, so it becomes a continuation
            {
                actionSequence.continueAfter = true;
                actionSequence.actions.push(opSession.action);
            }
        }
        else if (nodeState === EVUI.Modules.TreeView.TreeViewNodeState.Collapsed) //collapsed and at rest
        {
            if (opSession.action === NodeAction.Expand)  //can freely expand from this state
            {
                actionSequence.actions.push(NodeAction.Expand);
            }
            else if (opSession.action === NodeAction.Collapse) //redundant command - asked to collapse when collapsed. Do nothing but call callback
            {
                actionSequence.skip = true;
            }
            else //anything else (build) can  be done with a collapsed node
            {
                actionSequence.actions.push(opSession.action);
            }
        }
        else if (nodeState === EVUI.Modules.TreeView.TreeViewNodeState.Collapsing) //in the process of collapsing
        {
            if (opSession.action === NodeAction.Expand) //asked to perform the opposite action - cancel the current and begin expanding or resoring the expanded state
            {
                actionSequence.cancelCurrent = true;
                actionSequence.actions.push(NodeAction.Expand);
            }
            else if (opSession.action === NodeAction.Collapse) //redundant command - do nothing but call callback
            {
                actionSequence.skip = true;
            }
            else if (opSession.action === NodeAction.Build) //can build after collapsing, so it becomes a continuation
            {
                actionSequence.continueAfter = true;
                actionSequence.actions.push(NodeAction.Build);
            }
            else //this shouldn't ever get hit
            {
                actionSequence.actions.push(opSession.action);
            }
        }
        else if (nodeState === EVUI.Modules.TreeView.TreeViewNodeState.Expanded) //expanded and at rest
        {
            if (opSession.action === NodeAction.Expand) //already expanded, no work to do
            {
                actionSequence.skip = true;
                actionSequence.actions.push(NodeAction.Expand);
            }
            else if (opSession.action === NodeAction.Collapse)
            {
                actionSequence.actions.push(NodeAction.Collapse);
            }
            else //anything else can be executed normally
            {
                actionSequence.actions.push(opSession.action);
            }
        }
        else if (nodeState === EVUI.Modules.TreeView.TreeViewNodeState.Expanding) //in the middle of an expand operation
        {
            if (opSession.action === NodeAction.Expand || opSession.action === NodeAction.Build) //if we're expanding and we get a command to expand (or build) again we go ahead and do it as it will trigger another build even though its technicallty redundant
            {
                actionSequence.continueAfter = true;
                actionSequence.actions.push(NodeAction.Build);
            }
            else if (opSession.action === NodeAction.Collapse) //opposite action, cancel current
            {
                actionSequence.cancelCurrent = true;
                actionSequence.actions.push(NodeAction.Collapse);
            }
            else //otherwise execute like normal
            {
                actionSequence.actions.push(opSession.action);
            }
        }

        return actionSequence;
    };

    /**Gets the number of parent nodes directly above this node up to the root node.
    @param {TreeViewNodeEntry} treeNodeEntry The node to get the depth of.
    @returns {Number} */
    var getDepth = function (treeNodeEntry)
    {
        var depth = 0;
        var parentNode = treeNodeEntry.parentNodeEntry;
        while (parentNode != null)
        {
            depth++;
            parentNode = parentNode.parentNodeEntry;
        }

        return depth;
    };

    /**Generates a CSS class name for a TreeView based on its id.
    @param {String} treeViewId The ID of the tree view to turn into a snake-cased CSS class name.
    @returns {String} */
    var getTreeViewClassName = function (treeViewId)
    {
        if (EVUI.Modules.Core.Utils.stringIsNullOrWhitespace(treeViewId) === true) return null;
        var snakeCaseChars = new RegExp(/\s+/g);

        var snakeCaseName = treeViewId.trim().replace(snakeCaseChars, function (match)
        {
            if (match != "" && match.trim() === "")
            {
                return "-";
            }
            else
            {
                return "";
            }            
        });

        var name = "evui-tree-" + snakeCaseName;

        //make sure the user isn't making a tree view with a name that is one of the special decorator classes
        for (var prop in EVUI.Modules.TreeView.Constants)
        {
            if (EVUI.Modules.TreeView.Constants[prop] === name) throw Error(name + " is a reserved TreeView Constant.");
        }

        return name;
    };

    /**Ensures that all the required services for the TreeViewController are present.*/
    var ensureServices = function ()
    {
        if (_services == null || typeof _services !== "object") _services = new EVUI.Modules.TreeView.TreeViewControllerServices();

        if (_services.bindingController == null || typeof _services.bindingController !== "object")
        {
            _services.bindingController = EVUI.Modules.Binding.Binder;
        }

        if (_services.stylesheetManager == null || typeof _services.stylesheetManager !== "object")
        {
            _services.stylesheetManager = EVUI.Modules.Styles.Manager;
        }
    }

    /**Represents a grouping of instructions on what action a TreeViewNodeEntry should take when a new operation is queued.
    @class*/
    var ActionSequence = function ()
    {
        /**String. The Action being queued. Must be a value from NodeAction.
        @type {String}*/
        this.primaryAction = NodeAction.None;

        /**Boolean. Whether or not to cancel the current operation.
        @type {Boolean}*/
        this.cancelCurrent = false;

        /**Boolean. Whether or not to skip performing the current operation and just call its callback instead.
        @type {Boolean}*/
        this.skip = false;

        /**Boolean. Whether or not the current operation should be continued once the one in progress completes.
        @type {Booleab}*/
        this.continueAfter = false;

        /**Array. An array of NodeActions indicating the actions that the TreeViewNodeEntry will take. */
        this.actions = [];
    };

    /**Context object that holds contextual information about a BindingStub that was just bound by the internal Binding for holding user bindings.
    @class*/
    var StubBindingContext = function ()
    {
        /**Object. Dictionary of child nodes keyed based on their ID's.
        @type {{}}*/
        this.childNodes = {};

        /**Array. An array of TreeViewNodeEntries that are to be disposed, used during a child node list sync operation. 
        @type {TreeViewNodeEntry[]}*/
        this.nodesToDispose = [];

        /**Object. The parent TreeViewNodeEntry to the node being bound.
        @type {TreeViewNodeEntry}*/
        this.parentNodeEntry = null;

        /**Boolean. Whether or not this is not the first time that this binding bas been bound.
        @type {Boolean}*/
        this.reBinding = false;
    };

    /**The internal entry for a TreeView that contains the data and functionality exposed by the TreeView object.
    @class*/
    var TreeViewEntry = function ()
    {
        /**Object. The TreeView that this entry was injected into.
        @type {EVUI.Modules.TreeView.TreeView}*/
        this.treeView = null;

        /**String. The ID the user gave to this TreeView.
        @type {String}*/
        this.treeViewId = null;

        /**Object. The root node on the TreeView.
        @type {TreeViewNodeEntry}*/
        this.rootNode = null;

        /**Array. The array of all nodes contained by this TreeView.
        @type {TreeViewNodeEntry[]}*/
        this.nodes = [];

        /**Element. The direct parent element to this TreeView that it is inserted inside of.
        @type {Element}*/
        this.element = null;

        /**Boolean. Whether or not the nodes collection was modified and needs to be rebuilt in the public facing node array.
        @type {Boolean}*/
        this.nodesChanged = false;

        /**String. The current state of the TreeView. Must be a value from TreeViewState.
        @type {String}*/
        this.treeState = EVUI.Modules.TreeView.TreeViewState.None;

        /**String. The CSS class name for this TreeView.
        @type {String}*/
        this.className = null;

        /**Element. The wrapping UL or OL that contains the entire TreeView.
        @type {Element}*/
        this.rootListNode = null;

        /**Triggers the building of a node on the TreeView.*/
        this.build = buildFromTreeView;

        /**Triggers the expansion of a Node on the TreeView.*/
        this.expand = expandFromTreeView;

        /**Triggers the collapsing of a Node on the TreeView.*/
        this.collapse = collapseFromTreeView;

        /**Triggers the disposal of a Node on the TreeView. */
        this.dispose = disposeFromTreeView;

        /**Triggers a toggle operation of a Node on the TreeView. */
        this.toggle = toggleFromTreeView;

        /**Gets a valid element for the root node of the TreeView based on ambiguous user input.*/
        this.getValidElement = getValidRootElement;
    };

    /**Object that is injected into a TreeViewNode and is used internally to perform all operations on TreeViewNodes.
    @class*/
    var TreeViewNodeEntry = function ()
    {
        /**Object. The Options object for the node.
        @type {EVUI.Modules.TreeView.TreeViewOptions}*/
        this.options = new EVUI.Modules.TreeView.TreeViewOptions();

        /**Object. The TreeViewNode this entry was injected into and is serving as the backing source of information for.
        @type {EVUI.Modules.TreeView.TreeViewNode}*/
        this.node = null;

        /**Number. The ID of the node.
        @type {Number}*/
        this.nodeId = _nodeIDCounter++;

        /**Object. The TreeView that owns this node.
        @type {TreeViewEntry}*/
        this.treeViewEntry = null;

        /**Number. The number of nodes hierarchically above this node in the TreeView.
        @type {Number}*/
        this.depth = 0;

        /**Object. The BindingTemplate used by the user's binding. 
        @type {EVUI.Modules.Binding.BindingTemplate}*/
        this.bindingTemplate = null;

        /**String|Function. Either the property name of the child list in the user's source object, or a function that returns a list of child objects to make child nodes for.
        @type {String|Function}*/
        this.childListName = null;

        /**Object. The parent node that contains this node.
        @type {TreeViewNodeEntry}*/
        this.parentNodeEntry = null;

        /**Array. The list of child nodes under this node.
        @type {TreeViewNodeEntry[]}*/
        this.childNodeEntries = [];

        /**Object. The Binding made from the user's BindingTemplate.
        @type {EVUI.Modules.Binding.Binding}*/
        this.binding = null;

        /**Element. The root element of the node that contains the user and system generated content for the node.
        @type {Element}*/
        this.rootElement = null;

        /**Element. The slot in the rootElement that is available for use by the user's binding.
        @type {Element}*/
        this.bindingElement = null;

        /**Element. If this node has children, this is the reference to the UL or OL that the children's HTML is contained by.
        @type {Element}*/
        this.listElement = null;

        /**Array. The children from the user's source object that currently have a childNodeEntry.
        @type {Object[]}*/
        this.childList = null;

        /**Object. The ArrayObserver watching the user's childList for changes.
        @type {EVUI.Modules.Observers.ArrayObserver}*/
        this.childListObserver = null;

        /**Object. The Binding placed inside the listElement that hosts all the child bindings for the user's child list content.
        @type {EVUI.Modules.Binding.Binding}*/
        this.childListBinding = null;

        /**A dummy list of empty objects used to create the childListBinding.
        @type {BindingStub[]}*/
        this.childListStubs = [];

        /**String. The current operational state of the node. Must be a value from TreeViewNodeState.
        @type {String}*/
        this.nodeState = EVUI.Modules.TreeView.TreeViewNodeState.None;

        /**String. The previous state of the node. Must be a value from TreeViewNodeState. Used when cancelling an operation before it completes to restore the previous state of the node.
        @type {String}*/
        this.previousCompletedNodeState = EVUI.Modules.TreeView.TreeViewNodeState.None;

        /**Object. The operation that is curretly being executed by this node.
        @type {OperationSession}*/
        this.operation = null;
        
        /**Object. The user's source object that is used for the basis of their Binding.
        @type {Object}*/
        this.source = null;

        /**A dummy object to use for the child list binder.
        @type {BindingStub}*/
        this.bindingStub = new BindingStub();

        /**Actions that will be executed after the current action's callback stack is called.
        @type {OperationSession[]}*/
        this.continuations = [];

        /**Event handlers that have been bound to the DOM for opening or closing the Node.
        @type {EventHandlerBinding[]}*/
        this.eventBindings = [];

        /**Function. A callback function to call once a transition operation has been completed.
        @type {Function}*/
        this.transitionCallback = null;

        /**Number. The timeout ID given to us by the browser that we can use to cancel a transition in progress's timed callback.
        @type {Number}*/
        this.transitionTimeoutID = -1;

        /**String. A CSS selector used to apply to the node that adds the transition effect to the node.
        @type {String}*/
        this.transitionSelector = null;

        /**Boolean. Whether or not the BindingTemplate for the node has been re-set by the user since it was originally set.
        @type {Boolean}*/
        this.bindingTemplateChanged = false;

        /**Boolean. Indicates that the user's source object's list of children to make nodes for has changed. Signals to the TreeViewNode wrapper to re-populate the public array of children.
        @type {Boolean}*/
        this.childListChanged = false;

        /**Booleab. Whether or not the user has set the options object since it was originally set. Used for determining which options object to use for new nodes in certain situations.
        @type {Boolean}*/
        this.optionsChanged = false;

        /**Boolean. Whether or not the node's child list is currently visible (if it has one).
        @type {Boolean}*/
        this.expanded = false;

        /**Triggers the expansion of this node.*/
        this.expandNode = triggerExpand;

        /**Triggers the collapsing of this node.*/
        this.collapseNode = triggerCollapse;

        /**Triggers the toggling of this node from expanded to collapsed and vice-versa.*/
        this.toggleNode = triggerToggle;

        /**Triggers the building of this node and its child list.*/
        this.buildNode = triggerBuild;

        /**Triggers the disposal of this node.*/
        this.dispose = disposeTreeViewNode;
    };

    /**Represents one of the objects used by the internal Binding to stamp out a tree view child node list for each child source object in the user's source object
    @class*/
    var BindingStub = function ()
    {
        /**Number. The ID of the node being bound.
        @type {Number}*/
        this.nodeId = -1;

        /**Number. The numnber of hierarchical levels there are above this node.
        @type {Number}*/
        this.depth = -1;

        /**Number. The index of this node in its child list of nodes.
        @type {Number}*/
        this.ordinal = -1;
    }

    /**Represents a wrapper for a callback fucntion and the OperationSession it is associated with. 
    @class*/
    var CallbackEntry = function ()
    {
        /**Object. The OperationSession that was queued with the callback function.
        @type {Object}*/
        this.operationSession = null;

        /**Function. The callback function to call once the operationSession is completed.
        @type {Function}*/
        this.callback = null;
    };

    /**Action commands for nodes to perform.
    @enum*/
    var NodeAction =
    {
        /**Default.*/
        None: "none",
        /**Node has been instructed to expand.*/
        Expand: "expand",
        /**Node has been instructed to collapse.*/
        Collapse: "collapse",
        /**Node has been instructed to build itself.*/
        Build: "build",
        /**Node should do the opposite of what it is currently doing or change to the opposite visibility state as its current state.*/
        Toggle: "toggle",
        /**Node should dispose of itself and release all of its resources.*/
        Dispose: "dispose"
    };

    /**Represents all the information available about an operation in progress.
    @class*/
    var OperationSession = function ()
    {
        /**Number. The ID of the operation and its sequence number in terms of when this operation was queued relative to other concurrent operations.
        @type {Number}*/
        this.operationId = _operationCounter++;

        /**Boolean. Whether or not this Operation is a continuation of another operation and had its execution deferred until another operatoin has completed.
        @type {Boolean}*/
        this.isContinuation = false;

        /**Object. The callback entry associated with this operation.
        @type {CallbackEntry}*/
        this.callback = null;

        /**String. The action that this operation is asking the node to perform.
        @type {String}*/
        this.action = NodeAction.None;

        /**Object. The TreeViewNodeEntry that is the target of this operation.
        @type {TreeViewNodeEntry}*/
        this.nodeEntry = null;

        /**Object. The event stream driving the operation.
        @type {EVUI.Modules.EventStream.EventStream}*/
        this.eventStream = null;

        /**Object. If this operation involved a "build" step, these are the arguments for configuring the build.
        @type {EVUI.Modules.TreeView.BuildTreeViewNodeArgs}*/
        this.buildArgs = null;

        /**Object. If this operation involves an "expand" or "collapse" action, this is the configuration options for that action.
        @type {EVUI.Modules.TreeView.ExpandCollapseTreeViewNodeArgs}*/
        this.expandCollapseArgs = null;

        /**Boolean. Whether or not this operation has been canceled and should cease operating.
        @type {Boolean}*/
        this.canceled = false;

        /**Object. The continuation operation session that will execute after this operation has completed.
        @type {OperationSession}*/
        this.continuation = null;

        /**Object. In the event of continuations or skipped operations queued while an operation is in progress, this is the combined set of callbacks that should be executed once the operation finishes.
        @type {CallbackEntry[]}*/
        this.callbackStack = [];

        /**Object. Any contextual information to carry between events.
        @type {Object}*/
        this.context = {};
    };

    /**Represents an automatically bound event handler that performs an expand, collapse, or toggle operation. Used to ensure redundant handlers for expand, collapse, and toggle are not registered.
    @class*/
    var EventHandlerBinding = function ()
    {
        /**Function. The actual event handling function.
        @type {Function}*/
        this.handler = null;

        /**Element. The element that had the event handler attached to it
        @type {Element}*/
        this.element = null;

        /**String. The name of the event that was attached.
        @type {String}*/
        this.eventName = null;
    };

    //ensure we have a valid _services object.
    ensureServices();

    //make sure our CSS for expand/collapse exists
    buildExpandCollapseCSSRules();
};

/**Object that contains a collection of hierarchical expandable or collapseable nodes organized into a parent-child tree structure.
@class*/
EVUI.Modules.TreeView.TreeView = function (tvEntry)
{
    if (tvEntry == null) throw Error("Object expected.");

    var _self = this;
    var _treeViewEntry = tvEntry;
    var _nodes = [];

    /**String. The unique ID of the TreeView.
    @type {String}*/
    this.id = null;
    Object.defineProperty(this, "id", {
        get: function ()
        {
            return _treeViewEntry.treeViewId;
        },
        configurable: false,
        enumerable: true
    });

    /**Object. The HTMLElement under which the TreeView will be appended under.
    @type {Element}*/
    this.element = null;
    Object.defineProperty(this, "element", {
        get: function ()
        {
            return _treeViewEntry.element;
        },
        set: function (value)
        {
            if (value == null)
            {
                _treeViewEntry.element = null;
                return;
            }

            _treeViewEntry.element = _treeViewEntry.getValidElement(value);
        },
        configurable: false,
        enumerable: true
    });

    /**Object. The OL/UL Element that wraps the entire TreeView's collection of nodes.
    @type {Element}*/
    this.rootListElement = null;
    Object.defineProperty(this, "rootListElement", {
        get: function ()
        {
            return _treeViewEntry.rootListElement;
        },
        configurable: false,
        enumerable: true
    });

    /**Object. The root TreeViewNode of the TreeView.
    @type {EVUI.Modules.TreeView.TreeViewNode}*/
    this.rootNode = null;
    Object.defineProperty(this, "rootNode", {
        get: function ()
        {
            if (_treeViewEntry.rootNode != null)
            {
                return _treeViewEntry.rootNode.node;
            }
            else
            {
                return null;
            }
        },
        configurable: false,
        enumerable: true
    });

    /**Gets the collection of TreeViewNodes contained by the TreeView. */
    this.getNodes = function ()
    {
        var nodes = [];
        var numNodes = _treeViewEntry.nodes.length;

        nodes.push(_self.rootNode);

        for (var x = 0; x < numNodes; x++)
        {
            nodes.push(_treeViewEntry.nodes[x].node)
        }

        return nodes;
    };

    /**Expands a TreeViewNode in the TreeView, showing its children.
    @param {Number|EVUI.Modules.TreeView.TreeViewNode|EVUI.Modules.TreeView.ExpandCollapseTreeViewNodeArgs|Function} nodeOrId Can either be the id of the TreeViewNode to expand, or the actual TreeViewNodem to expand. If no node is specified, the rootNode is used instead. Can also be a YOLO ExpandCollapseTreeViewNodeArgs or just a callback function.
    @param {EVUI.Modules.TreeView.ExpandCollapseTreeViewNodeArgs|Function} expandArgs Either a YOLO ExpandCollapseTreeViewNodeArgs args object, or a callback function to call once the operation completes. 
    @param {Function} callback A callback function to call once the operation is complete.*/
    this.expandNode = function (nodeOrId, expandArgs, callback)
    {
        _treeViewEntry.expand(_treeViewEntry, nodeOrId, expandArgs, callback)
    };

    /**Collapses a TreeViewNode in the TreeView, hiding its children.
    @param {Number|EVUI.Modules.TreeView.TreeViewNode|EVUI.Modules.TreeView.ExpandCollapseTreeViewNodeArgs|Function} nodeOrId Can either be the id of the TreeViewNode to collapse, or the actual TreeViewNodem to expand. If no node is specified, the rootNode is used instead. Can also be a YOLO ExpandCollapseTreeViewNodeArgs or just a callback function.
    @param {EVUI.Modules.TreeView.ExpandCollapseTreeViewNodeArgs|Function} expandArgs Either a YOLO ExpandCollapseTreeViewNodeArgs args object, or a callback function to call once the operation completes. 
    @param {Function} callback A callback function to call once the operation is complete.*/
    this.collapseNode = function (nodeOrId, collapseArgs, callback)
    {
        _treeViewEntry.collapse(_treeViewEntry, nodeOrId, collapseArgs, callback);
    };

    /**Builds a TreeViewNode in the TreeView, refreshing its display and building its child list if applicable.
    @param {Number|EVUI.Modules.TreeView.TreeViewNode|EVUI.Modules.TreeView.BuildTreeViewNodeArgs|Function} nodeOrId Can either be the id of the TreeViewNode to collapse, or the actual TreeViewNodem to expand. If no node is specified, the rootNode is used instead. Can also be a YOLO BuildTreeViewNodeArgs or just a callback function.
    @param {EVUI.Modules.TreeView.BuildTreeViewNodeArgs|Function} buildArgs A YOLO BuildTreeViewNodeArgs object, or a callback function to call when the operation completes.
    @param {Function} callback A function to call once the operation is complete.*/
    this.buildNode = function (nodeOrId, buildArgs, callback)
    {
        _treeViewEntry.build(_treeViewEntry, nodeOrId, buildArgs, callback);
    };

    /**Collapses a TreeViewNode that is expanded or expands a TreeViewNode that is collapsed.
    @param {Number|EVUI.Modules.TreeView.TreeViewNode|EVUI.Modules.TreeView.ExpandCollapseTreeViewNodeArgs|Function} nodeOrId Can either be the id of the TreeViewNode to collapse, or the actual TreeViewNodem to expand. If no node is specified, the rootNode is used instead. Can also be a YOLO ExpandCollapseTreeViewNodeArgs or just a callback function.
    @param {EVUI.Modules.TreeView.ExpandCollapseTreeViewNodeArgs|Function} expandCollapseArgs Either a YOLO ExpandCollapseTreeViewNodeArgs args object, or a callback function to call once the operation completes. 
    @param {Function} callback A callback function to call once the operation is complete.*/
    this.toggleNode = function (nodeOrId, expandCollapseArgs, callback)
    {
        _treeViewEntry.toggle(_treeViewEntry, nodeOrId, expandCollapseArgs, callback);
    };

    /**Awaitable. Expands a TreeViewNode in the TreeView, showing its children.
    @param {Number|EVUI.Modules.TreeView.TreeViewNode|EVUI.Modules.TreeView.ExpandCollapseTreeViewNodeArgs} nodeOrId Can either be the id of the TreeViewNode to expand, or the actual TreeViewNodem to expand. If no node is specified, the rootNode is used instead. Can also be a YOLO ExpandCollapseTreeViewNodeArgs.
    @param {EVUI.Modules.TreeView.ExpandCollapseTreeViewNodeArgs} expandArgs A YOLO ExpandCollapseTreeViewNodeArgs args object.
    @returns {Promise}*/
    this.expandNodeAsync = function (nodeOrId, expandArgs)
    {
        return new Promise(function (resolve)
        {
            _self.expandNode(nodeOrId, expandArgs, function ()
            {
                resolve();
            });
        });
    };

    /**Awaitable. Collapses a TreeViewNode in the TreeView, hiding its children.
    @param {Number|EVUI.Modules.TreeView.TreeViewNode|EVUI.Modules.TreeView.ExpandCollapseTreeViewNodeArgs} nodeOrId Can either be the id of the TreeViewNode to collapse, or the actual TreeViewNodem to expand. If no node is specified, the rootNode is used instead. Can also be a YOLO ExpandCollapseTreeViewNodeArgs.
    @param {EVUI.Modules.TreeView.ExpandCollapseTreeViewNodeArgs} expandArgs A YOLO ExpandCollapseTreeViewNodeArgs args object.
    @returns {Promise}*/
    this.collapseNodeAsync = function (nodeOrId, collapseArgs)
    {
        return new Promise(function (resolve)
        {
            _self.collapseNode(nodeOrId, collapseArgs, function ()
            {
                resolve();
            });
        });
    };

    /**Awaitable. Builds a TreeViewNode in the TreeView, refreshing its display and building its child list if applicable.
    @param {Number|EVUI.Modules.TreeView.TreeViewNode|EVUI.Modules.TreeView.BuildTreeViewNodeArgs} nodeOrId Can either be the id of the TreeViewNode to collapse, or the actual TreeViewNodem to expand. If no node is specified, the rootNode is used instead. Can also be a YOLO BuildTreeViewNodeArgs object.
    @param {EVUI.Modules.TreeView.BuildTreeViewNodeArgs} buildArgs A YOLO BuildTreeViewNodeArgs object.*/
    this.buildNodeAsync = function (nodeOrId, buildArgs)
    {
        return new Promise(function (resolve)
        {
            _self.buildNode(nodeOrId, buildArgs, function ()
            {
                resolve();
            });
        });
    };

    /**Awaitable. Collapses a TreeViewNode that is expanded or expands a TreeViewNode that is collapsed.
    @param {Number|EVUI.Modules.TreeView.TreeViewNode|EVUI.Modules.TreeView.ExpandCollapseTreeViewNodeArgs|Function} nodeOrId Can either be the id of the TreeViewNode to collapse, or the actual TreeViewNodem to expand. If no node is specified, the rootNode is used instead. Can also be a YOLO ExpandCollapseTreeViewNodeArgs.
    @param {EVUI.Modules.TreeView.ExpandCollapseTreeViewNodeArgs|Function} expandCollapseArgs Either a YOLO ExpandCollapseTreeViewNodeArgs args object, or a callback function to call once the operation completes. 
    @returns {Promise}*/
    this.toggleNodeAsync = function (nodeOrId, expandCollapseArgs)
    {
        return new Promise(function (resolve)
        {
            _self.toggleNode(nodeOrId, expandCollapseArgs, function ()
            {
                resolve();
            });
        });
    };

    /**Disposes of a TreeViewNode in the TreeView, removing it from the TreeView permanently.
    @param {Number|EVUI.Modules.TreeView.TreeViewNode} nodeOrId Either the ID of the TreeViewNode to dispose, or the TreeViewNode to dispose.*/
    this.disposeNode = function (nodeOrId)
    {
        tvEntry.dispose(tvEntry, nodeOrId);
    };

    /**Builds the TreeView, starting with the rootNode.
    @param {EVUI.Modules.TreeView.BuildTreeViewNodeArgs|Function} buildArgs Either a YOLO BuildTreeViewNodeArgs object or a callback function.
    @param {Function} callback A callback function to call once the operation is complete.*/
    this.build = function (buildArgs, callback)
    {
        tvEntry.build(tvEntry, tvEntry.rootNode, buildArgs, callback);
    };

    /**Awaitable. Builds the TreeView, starting with the rootNode.
    @param {EVUI.Modules.TreeView.BuildTreeViewNodeArgs|Function} buildArgs A YOLO BuildTreeViewNodeArgs object.*/
    this.buildAsync = function (buildArgs)
    {
        return new Promise(function (resolve)
        {
            return _self.build(buildArgs, function ()
            {
                resolve();
            });
        });
    };

    /**Disposes of the entire TreeView, releasing all resources used by all TreeViewNodes in the TreeView.*/
    this.dispose = function ()
    {
        tvEntry.dispose(tvEntry, null);
    };

    /**Event that fires before an expand operation begins.
    @type {EVUI.Modules.TreeView.Constants.Fn_TreeViewEventHandler}*/
    this.onExpand = null;

    /**Event that fires after an expand operation has completed.
    @type {EVUI.Modules.TreeView.Constants.Fn_TreeViewEventHandler}*/
    this.onExpanded = null;

    /**Event that fires before a build operation begins.
    @type {EVUI.Modules.TreeView.Constants.Fn_TreeViewEventHandler}*/
    this.onBuild = null;

    /**Event that fires before the list of children for a TreeViewNode is bound,.
    @type {EVUI.Modules.TreeView.Constants.Fn_TreeViewEventHandler}*/
    this.onBuildChildren = null;

    /**Event that fires after the list of children for a TreeViewNode has been bound.
    @type {EVUI.Modules.TreeView.Constants.Fn_TreeViewEventHandler}*/
    this.onChildrenBuilt = null;

    /**Event that fires once a TreeViewNode and all its children have been built.
    @type {EVUI.Modules.TreeView.Constants.Fn_TreeViewEventHandler}*/
    this.onBuilt = null;

    /**Event that fires before a collapse operation begins.
    @type {EVUI.Modules.TreeView.Constants.Fn_TreeViewEventHandler}*/
    this.onCollapse = null;

    /**Event that fires after a collapse operation completes.
    @type {EVUI.Modules.TreeView.Constants.Fn_TreeViewEventHandler}*/
    this.onCollapsed = null;
};

/**Expands all the TreeViewNodes in the TreeView.
@param {EVUI.Modules.TreeView.ExpandCollapseTreeViewNodeArgs|Function} expandArgs Either a YOLO ExpandCollapseTreeViewNodeArgs object or a callback function to call once the operation is complete.
@param {Function} callback A callback function to call once the operation is complete.*/
EVUI.Modules.TreeView.TreeView.prototype.expandAll = function (expandArgs, callback)
{
    if (typeof expandArgs === "function")
    {
        callback = expandArgs;
        expandArgs = null;
    }

    if (typeof callback !== "function")
    {
        callback = function () { };
    }

    var nodesExecuted = 0;

    var nodes = this.getNodes();
    var numNodes = nodes.length;
    for (var x = 0; x < numNodes; x++)
    {
        var curNode = nodes[x];
        curNode.expand(expandArgs, function ()
        {
            nodesExecuted++;
            if (nodesExecuted === numNodes)
            {
                callback();
            }
        });
    }
};

/**Awaitabke. Expands all the TreeViewNodes in the TreeView.
@param {EVUI.Modules.TreeView.ExpandCollapseTreeViewNodeArgs|Function} expandArgs Either a YOLO ExpandCollapseTreeViewNodeArgs object or a callback function to call once the operation is complete.
@returns {Promise}*/
EVUI.Modules.TreeView.TreeView.prototype.expandAllAsync = function (expandArgs)
{
    return new Promise(function (resolve)
    {
        this.expandAll(expandArgs, function ()
        {
            resolve();
        })
    });
};

/**Collapses all nodes in the TreeView.
@param {EVUI.Modules.TreeView.ExpandCollapseTreeViewNodeArgs|Function} collapseArgs Either a YOLO ExpandCollapseTreeViewNodeArgs object or a callback function to call once the operation is complete.
@param {Function} callback A callback function to call once the operation is complete.*/
EVUI.Modules.TreeView.TreeView.prototype.collapseAll = function (collapseArgs, callback)
{
    if (typeof collapseArgs === "function")
    {
        callback = collapseArgs;
        collapseArgs = null;
    }

    if (typeof callback !== "function")
    {
        callback = function () { };
    }

    var nodesExecuted = 0;

    var nodes = this.getNodes();
    var numNodes = nodes.length;
    for (var x = 0; x < numNodes; x++)
    {
        var curNode = nodes[x];
        curNode.collapse(collapseArgs, function ()
        {
            nodesExecuted++;
            if (nodesExecuted === numNodes)
            {
                callback();
            }
        });
    }
};

/**Awaitable. Collapses all nodes in the TreeView.
@param {EVUI.Modules.TreeView.ExpandCollapseTreeViewNodeArgs|Function} collapseArgs Either a YOLO ExpandCollapseTreeViewNodeArgs object or a callback function to call once the operation is complete.
@returns {Promise}*/
EVUI.Modules.TreeView.TreeView.prototype.collapseAllAsync = function (collapseArgs)
{
    return new Promise(function (resolve)
    {
        this.collapseAll(collapseArgs, function ()
        {
            resolve();
        })
    });
};

/**Gets either a TreeViewNode with the matching ID, or any nodes that satisfy the predicate function.
@param {Number|EVUI.Modules.TreeView.Constants.Fn_TreeViewNodeSelector} nodeIdOrPredicate Either the ID of a TreeViewNode to get, or a predicate fucntion used to get a selection of TreeViewNodes.
@param {Boolean} getAllMatches Whether or not to return only the first match of the predicate function, or to return all matches of the predicate function.
@returns {EVUI.Modules.TreeView.TreeViewNode|EVUI.Modules.TreeView.TreeViewNode[]} */
EVUI.Modules.TreeView.TreeView.prototype.getNode = function (nodeIdOrPredicate, getAllMatches)
{
    var results = null;

    var nodeList = this.getNodes();
    var isPredicate = typeof nodeIdOrPredicate === "function";

    var numNodes = nodeList.length;
    for (var x = 0; x < numNodes; x++)
    {
        var curNode = nodeList[x];
        if (isPredicate === true)
        {
            var shouldInclude = nodeIdOrPredicate(curNode);
            if (shouldInclude === true)
            {
                if (getAllMatches === true)
                {
                    if (results == null) results = [];
                    results.push(curNode);
                }
                else
                {
                    results = curNode;
                    break;
                }
            }
        }
        else
        {
            if (curNode.id === nodeIdOrPredicate)
            {
                if (getAllMatches === true)
                {
                    if (results == null) results = [];
                    results.push(curNode);
                }
                else
                {
                    results = curNode;
                    break;
                }
            }
        }
    }

    return results;
};

/**A node in a TreeView.
@class*/
EVUI.Modules.TreeView.TreeViewNode = function (nodeEntry)
{
    if (nodeEntry == null) throw Error("Object expected.");

    var _nodeEntry = nodeEntry;
    var _childNodes = [];
    var _self = this;

    /**Numnber. The unique identifier for this TreeViewNode.
    @type {Number}*/
    this.id = null;
    Object.defineProperty(this, "id", {
        get: function ()
        {
            return _nodeEntry.nodeId;
        },
        enumerable: true,
        configurable: false
    });

    /**Object. The root Element of the TreeViewNode that contains the user Binding and the child node list (if one exists).
    @type {Element}*/
    this.element = null;
    Object.defineProperty(this, "element", {
        get: function ()
        {
            return _nodeEntry.rootElement;
        },
        enumerable: true,
        configurable: false
    });

    /**Object. The source object used to generate the user Binding for the TreeViewNode's content. Must be an object.
    @type {{}}*/
    this.source = null;
    Object.defineProperty(this, "source", {
        get: function ()
        {
            return _nodeEntry.source;
        },
        set: function (value)
        {
            if (value != null && typeof value !== "object") throw Error("source must be an object.")
            _nodeEntry.source = value;
        },
        enumerable: true,
        configurable: false
    });

    /**String|Object. Either the name of the BindingTemplate used to generate user content for the interior of the TreeViewNode, or a YOLO BindingTemplate.
    @type {String|EVUI.Modules.Binding.BindingTemplate}*/
    this.bindingTemplate = null;
    Object.defineProperty(this, "bindingTemplate", {
        get: function ()
        {
            return _nodeEntry.bindingTemplate;
        },
        set: function (value)
        {
            _nodeEntry.bindingTemplate = value;
        },
        configurable: false,
        enumerable: true
    });

    /**String|Function. Either the property name of the souce object's list of objects to make into child TreeViewNodes, or a function that returns an array of objects to make into child TreeViewNodes.
    @type {String|EVUI.Modules.TreeView.Constants.Fn_ChildListGetter}*/
    this.childListName = null;

    /**Object. The TreeViewNode that contains this TreeViewNode.
    @type {EVUI.Modules.TreeView.TreeViewNode}*/
    this.parentNode = null;
    Object.defineProperty(this, "parentNode", {
        get: function ()
        {

            if (_nodeEntry.parentNodeEntry == null) return null;
            return _nodeEntry.parentNodeEntry.node;
        },
        configurable: false,
        enumerable: true
    });

    /**Object. The TreeView that owns this TreeViewNode.
    @type {EVUI.Modules.TreeView.TreeView}*/
    this.treeView = null;
    Object.defineProperty(this, "treeView", {
        get: function ()
        {
            return _nodeEntry.treeViewEntry.treeView;
        },
        configurable: false,
        enumerable: true
    });

    /**Number. The number of layers deep this TreeViewNode is in the TreeView hierarchy.
    @type {Number}*/
    this.depth = 0;
    Object.defineProperty(this, "depth", {
        get: function ()
        {
            return _nodeEntry.depth;
        },
        configurable: false,
        enumerable: true
    });

    /**Object. The options for how this TreeViewNode will behave when expanding, collapsing, or being built. Cannot be null.
    @type {EVUI.Modules.TreeView.TreeViewOptions}*/
    this.options = null;
    Object.defineProperty(this, "options", {
        get: function ()
        {
            return _nodeEntry.options;
        },
        set: function (value)
        {
            if (value == null || typeof value !== "object") throw Error("options must be an object.");

            if (EVUI.Modules.Core.Utils.instanceOf(value, EVUI.Modules.TreeView.TreeViewOptions) === false)
            {
                _nodeEntry.options = EVUI.Modules.Core.Utils.shallowExtend(value, new EVUI.Modules.TreeView.TreeViewOptions());
            }
            else
            {
                _nodeEntry.options = value;
            }

            _nodeEntry.optionsChanged = true;
        },
        configurable: false,
        enumerable: true
    });

    /**String. The way in which the options object is shared between child TreeViewNodes. Must be a value from TreeViewOptionsShareMode.
    @type {String}*/
    this.optionsMode = EVUI.Modules.TreeView.TreeViewOptionsShareMode.TreeShared;

    /**String. The current state of the TreeViewNode (expanded, collapsing, etc). Will always be a value from TreeViewNodeState.
    @type {String}*/
    this.nodeState = EVUI.Modules.TreeView.TreeViewNodeState.None;
    Object.defineProperty(this, "nodeState", {
        get: function ()
        {
            return _nodeEntry.nodeState;
        },
        configurable: false,
        enumerable: true
    });

    /**Boolean. Whether or not the TreeViewNode is expanded and its child list is visible.
    @type {Boolean}*/
    this.expanded = false;
    Object.defineProperty(this, "expanded", {
        get: function ()
        {
            return _nodeEntry.expanded;
        },
        configurable: false,
        enumerable: true
    });

    /**Boolean. Whether or not the TreeViewNode is visible by means of having it's parent nodes (parent, grandparent, etc) be expanded.
    @type {Boolean}*/
    this.isVisible = false;
    Object.defineProperty(this, "isVisible", {
        get: function ()
        {
            if (_nodeEntry.rootElement == null) return false;

            var parentNode = _nodeEntry.parentNodeEntry;
            if (parentNode == null) //the only node for which this is true is the top node of the hierarchy
            {
                if (_nodeEntry.options.noTopNode === true) return false;
                return true;
            }
            else
            {
                while (parentNode != null)
                {
                    if (parentNode.expanded === false) return false;
                    parentNode = parentNode.parentNodeEntry;
                }

                return true;
            }
        },
        configurable: false,
        enumerable: true
    });


    /**Gets a copy of the array of child TreeViewNodes contained by this TreeViewNode.
    @returns {EVUI.Modules.TreeView.TreeViewNode[]}*/
    this.getChildNodes = function ()
    {
        var childNodes = [];

        var numNodes = _nodeEntry.childNodeEntries.length;
        for (var x = 0; x < numNodes; x++)
        {
            childNodes.push(_nodeEntry.childNodeEntries[x].node);
        }

        return childNodes;
    };

    /**Expands and builds the TreeViewNode and its child list.
    @param {EVUI.Modules.TreeView.ExpandCollapseTreeViewNodeArgs|Function} expandArgs Either a YOLO ExpandCollapseTreeViewNodeArgs or a callback function to call once the expand operation is complete.
    @param {Function} callback A callback function to call once the operation is complete.*/
    this.expand = function (expandArgs, callback)
    {
        return _nodeEntry.expandNode(_nodeEntry, expandArgs, callback);
    };

    /**Awaitable. Expands and builds the TreeViewNode and its child list.
    @param {EVUI.Modules.TreeView.ExpandCollapseTreeViewNodeArgs} expandArgs A YOLO ExpandCollapseTreeViewNodeArgs.
    @returns {Promise}*/
    this.expandAsync = function (expandArgs)
    {
        return new Promise(function (resolve)
        {
            return _self.expand(expandArgs, function ()
            {
                resolve();
            });
        });
    };

    /**Collapses the TreeViewNode.
    @param {EVUI.Modules.TreeView.ExpandCollapseTreeViewNodeArgs|Function} expandArgs Either a YOLO ExpandCollapseTreeViewNodeArgs or a callback function to call once the collapse operation is complete.
    @param {Function} callback A callback function to call once the operation is complete.*/
    this.collapse = function (collapseArgs, callback)
    {
        return _nodeEntry.collapseNode(_nodeEntry, collapseArgs, callback);
    };

    /**Awaitable. ECollapses the TreeViewNode.
    @param {EVUI.Modules.TreeView.ExpandCollapseTreeViewNodeArgs} expandArgs A YOLO ExpandCollapseTreeViewNodeArgs.
    @returns {Promise}*/
    this.collapseAsync = function (collapseArgs)
    {
        return new Promise(function (resolve)
        {
            _self.collapse(collapseArgs, function ()
            {
                resolve();
            });
        });
    }

    /**Builds the TreeViewNode and its child list.
    @param {EVUI.Modules.TreeView.BuildTreeViewNodeArgs|Function} buildArgs A YOLO BuildTreeViewNodeArgs object or a callback function to call once the operation is complete.
    @param {Function} callback A callback to call once the operation is complete.*/
    this.build = function (buildArgs, callback)
    {
        return _nodeEntry.buildNode(_nodeEntry, buildArgs, callback)
    };

    /**Awaitable. Builds the TreeViewNode and its child list.
    @param {EVUI.Modules.TreeView.BuildTreeViewNodeArgs|Function} buildArgs A YOLO BuildTreeViewNodeArgs object.
    @returns {Promise}*/
    this.buildAsync = function (buildArgs)
    {
        return new Promise(function (resolve)
        {
            _self.build(buildArgs, function ()
            {
                resolve();
            });
        });
    }


    /**Event that fires before an expand operation begins.
    @type {EVUI.Modules.TreeView.Constants.Fn_TreeViewEventHandler}*/
    this.onExpand = null;

    /**Event that fires after an expand operation has completed.
    @type {EVUI.Modules.TreeView.Constants.Fn_TreeViewEventHandler}*/
    this.onExpanded = null;

    /**Event that fires before a build operation begins.
    @type {EVUI.Modules.TreeView.Constants.Fn_TreeViewEventHandler}*/
    this.onBuild = null;

    /**Event that fires before the list of children for a TreeViewNode is bound,.
    @type {EVUI.Modules.TreeView.Constants.Fn_TreeViewEventHandler}*/
    this.onBuildChildren = null;

    /**Event that fires after the list of children for a TreeViewNode has been bound.
    @type {EVUI.Modules.TreeView.Constants.Fn_TreeViewEventHandler}*/
    this.onChildrenBuilt = null;

    /**Event that fires once a TreeViewNode and all its children have been built.
    @type {EVUI.Modules.TreeView.Constants.Fn_TreeViewEventHandler}*/
    this.onBuilt = null;

    /**Event that fires before a collapse operation begins.
    @type {EVUI.Modules.TreeView.Constants.Fn_TreeViewEventHandler}*/
    this.onCollapse = null;

    /**Event that fires after a collapse operation completes.
    @type {EVUI.Modules.TreeView.Constants.Fn_TreeViewEventHandler}*/
    this.onCollapsed = null;
};

/**Object for containing configuration options for a TreeView and its TreeViewNodes.
@class*/
EVUI.Modules.TreeView.TreeViewOptions = function ()
{
    /**String. The type of element that the TreeView's list hierarchy will be made from. Must be a value from TreeViewListElementType. Unordered by default.
    @type {String}*/
    this.listElementType = EVUI.Modules.TreeView.TreeViewListElementType.Unordered;

    /**String. The way in which the TreeView is manipulated. Must be a value from TreeViewListBindingType. ListBound by default.
    @type {String}*/
    this.bindingType = EVUI.Modules.TreeView.TreeViewListBindingType.ListBound;

    /**Object. A CSS transition to apply when a TreeViewNode's child list is expanded.
    @type {EVUI.Modules.TreeView.TreeViewNodeTransition}*/
    this.expandTransition = null;

    /**Object. A CSS transition to apply when a TreeViewNode's child list is collapsed.
    @type {EVUI.Modules.TreeView.TreeViewNodeTransition}*/
    this.collapseTransition = null;

    /**Boolean. Whether or not the construction of child nodes is done ad-hoc when their parent is expanded, or if the entire TreeView is built from the start. True by default. 
    @type {Boolean}*/
    this.lazy = true;

    /**String. The Binder mode used to sync the TreeViewNodes with their underlying data model when they are expanded. Update by default.
    @type {String}*/
    this.expandMode = EVUI.Modules.TreeView.TreeViewNodeBuildMode.Update;

    /**Boolean. Whether or not the TreeView has a single top node, or if the "top" of the TreeView is a list of child TreeViewNodes.
    @type {Boolean}*/
    this.noTopNode = false;

    /**Boolean. Whether or not to use the default "click" event to toggle TreeNewNodes expand/collapse functionality if no other event handlers were registered.*/
    this.autoToggle = true;
};

/**Object containing the configuration options for making a new TreeView.
@class*/
EVUI.Modules.TreeView.AddTreeViewArgs = function ()
{
    /**String. The human-readable name of the TreeView.
    @type {String}*/
    this.id = null;

    /**Object. The element under which the root element of the TreeView will be appended under.
    @type {Element}*/
    this.element = null;

    /**Object. A BindingTemplate used to tell the TreeView how to use the Binder to generate the HTML content for the TreeViewNodes.
    @type {EVUI.Modules.Binding.BindingTemplate}*/
    this.bindingTemplate = null;

    /**Object. The object to use as the data source for the root TreeViewNode in the TreeView.
    @type {Object}*/
    this.source = null;

    /**String. The name of the property on the source that is an array of objects to be bound as children to the TreeViewNodes recursively.
    @type {String}*/
    this.childListName = null;

    /**Object. The TreeViewOptions object that will be used to determine the default behavior of the TreeView.
    @type {EVUI.Modules.TreeView.TreeViewOptions}*/
    this.options = null;

    /**String. The way in which the options object is shared amongst the TreeViewNodes. Must be a value from TreeViewOptionsMode.
    @type {String}*/
    this.optionsMode = EVUI.Modules.TreeView.TreeViewOptionsShareMode.TreeShared;

    /**Event that fires before an expand operation begins.
    @type {EVUI.Modules.TreeView.Constants.Fn_TreeViewEventHandler}*/
    this.onExpand = null;

    /**Event that fires after an expand operation has completed.
    @type {EVUI.Modules.TreeView.Constants.Fn_TreeViewEventHandler}*/
    this.onExpanded = null;

    /**Event that fires before a build operation begins.
    @type {EVUI.Modules.TreeView.Constants.Fn_TreeViewEventHandler}*/
    this.onBuild = null;

    /**Event that fires before the list of children for a TreeViewNode is bound,.
    @type {EVUI.Modules.TreeView.Constants.Fn_TreeViewEventHandler}*/
    this.onBuildChildren = null;

    /**Event that fires after the list of children for a TreeViewNode has been bound.
    @type {EVUI.Modules.TreeView.Constants.Fn_TreeViewEventHandler}*/
    this.onChildrenBuilt = null;

    /**Event that fires once a TreeViewNode and all its children have been built.
    @type {EVUI.Modules.TreeView.Constants.Fn_TreeViewEventHandler}*/
    this.onBuilt = null;

    /**Event that fires before a collapse operation begins.
    @type {EVUI.Modules.TreeView.Constants.Fn_TreeViewEventHandler}*/
    this.onCollapse = null;

    /**Event that fires after a collapse operation completes.
    @type {EVUI.Modules.TreeView.Constants.Fn_TreeViewEventHandler}*/
    this.onCollapsed = null;
};

/**Object containing the configuration options for adding a new TreeViewNode.
@class*/
EVUI.Modules.TreeView.AddTreeViewNodeArgs = function ()
{
    /**Object. A BindingTemplate used to tell the TreeView how to use the Binder to generate the HTML content for the TreeViewNodes.
    @type {EVUI.Modules.Binding.BindingTemplate}*/
    this.bindingTemplate = null;

    /**Object. The object to use as the data source for the root TreeViewNode in the TreeView.
    @type {Object}*/
    this.source = null;

    /**String. The name of the property on the source that is an array of objects to be bound as children to the TreeViewNodes recursively.
    @type {String}*/
    this.childListName = null;

    /**Object. The TreeViewOptions object that will be used to determine the default behavior of the TreeView.
    @type {EVUI.Modules.TreeView.TreeViewOptions}*/
    this.options = null;

    /**String. The way in which the options object is shared amongst the TreeViewNodes. Must be a value from TreeViewOptionsMode.
    @type {String}*/
    this.optionsMode = EVUI.Modules.TreeView.TreeViewOptionsShareMode.TreeShared;

    /**Event that fires before an expand operation begins.
    @type {EVUI.Modules.TreeView.Constants.Fn_TreeViewEventHandler}*/
    this.onExpand = null;

    /**Event that fires after an expand operation has completed.
    @type {EVUI.Modules.TreeView.Constants.Fn_TreeViewEventHandler}*/
    this.onExpanded = null;

    /**Event that fires before a build operation begins.
    @type {EVUI.Modules.TreeView.Constants.Fn_TreeViewEventHandler}*/
    this.onBuild = null;

    /**Event that fires before the list of children for a TreeViewNode is bound,.
    @type {EVUI.Modules.TreeView.Constants.Fn_TreeViewEventHandler}*/
    this.onBuildChildren = null;

    /**Event that fires after the list of children for a TreeViewNode has been bound.
    @type {EVUI.Modules.TreeView.Constants.Fn_TreeViewEventHandler}*/
    this.onChildrenBuilt = null;

    /**Event that fires once a TreeViewNode and all its children have been built.
    @type {EVUI.Modules.TreeView.Constants.Fn_TreeViewEventHandler}*/
    this.onBuilt = null;

    /**Event that fires before a collapse operation begins.
    @type {EVUI.Modules.TreeView.Constants.Fn_TreeViewEventHandler}*/
    this.onCollapse = null;

    /**Event that fires after a collapse operation completes.
    @type {EVUI.Modules.TreeView.Constants.Fn_TreeViewEventHandler}*/
    this.onCollapsed = null;
};

/**Object for containing the options to build a TreeViewNode.
@class*/
EVUI.Modules.TreeView.BuildTreeViewNodeArgs = function ()
{
    /**Object. A BindingTemplate used to tell the TreeView how to use the Binder to generate the HTML content for the TreeViewNodes.
    @type {EVUI.Modules.Binding.BindingTemplate}*/
    this.bindingTemplate = null;

    /**Object. The object to use as the data source for the root TreeViewNode in the TreeView.
    @type {Object}*/
    this.source = null;

    /**String. The name of the property on the source that is an array of objects to be bound as children to the TreeViewNodes recursively.
    @type {String}*/
    this.childListName = null;

    /**String. The mode in which to tell the inner Binding of the TreeView node to build itself. Update by default.
    @type {String}*/
    this.buildMode = EVUI.Modules.TreeView.TreeViewNodeBuildMode.Update;

    /**Object. The TreeViewOptions object that will be used to determine the default behavior of the TreeView.
    @type {EVUI.Modules.TreeView.TreeViewOptions}*/
    this.options = null;

    /**String. The way in which the options object is shared amongst the TreeViewNodes. Must be a value from TreeViewOptionsMode.
    @type {String}*/
    this.optionsMode = EVUI.Modules.TreeView.TreeViewOptionsShareMode.TreeShared;

    /**Boolean. Whether or not to recursively build all child TreeViewNodes under the TreeViewNode being built. False by default.
    @type {Boolean}*/
    this.recursive = false;

    /**Object. Any contextual information to carry between events.
    @type {Object}*/
    this.context = {};
};

/**Arguments for expanding or collapsing a TreeViewNode.
@class*/
EVUI.Modules.TreeView.ExpandCollapseTreeViewNodeArgs = function ()
{
    /**Boolean. Whether or not to recursively expand or collapse all TreeViewNodes under the target TreeViewNode.
    @type {Boolean}*/
    this.recursive = false;

    /**Object. A transition effect to apply to the TreeViewNode while it is expanding or collapsing.
    @type {EVUI.Modules.TreeView.TreeViewNodeTransition}*/
    this.transition = null;

    /**Object. In the event that the TreeViewNode is being expanded, these are the arguments that control how the TreeViewNode or its children will be built.
    @type {EVUI.Modules.TreeView.BuildTreeViewNodeArgs}*/
    this.buildArgs = null;

    /**Object. Any contextual information to carry between events.
    @type {Object}*/
    this.context = {};
};

/**Object for containing the CSS details of the transition to apply to a TreeViewNode as it expands or collapses.
@class*/
EVUI.Modules.TreeView.TreeViewNodeTransition = function ()
{
    /**Object or String. Either class names, a string of CSS rules (without a selector), or an object of key-value pairs of CSS properties to generate a runtime CSS class for.
    @type {Object|String}*/
    this.css = null;

    /**String. CSS definition for a keyframe animation to apply. Note that the keyframe animation's name must appear in the css property in order to be applied.
    @type {String}*/
    this.keyframes = null;

    /**The duration (in milliseconds) of the transition so that the appropriate events are only fired once the transition is complete.
    @type {Number}*/
    this.duration = 0;
};

/**Event arguments object for all TreeView and TreeViewNode events.
@class*/
EVUI.Modules.TreeView.TreeViewEventArgs = function (nodeEntry)
{
    var _nodeEntry = nodeEntry;

    /**Object. The TreeView that is the subject of the event.
    @type {EVUI.Modules.TreeView.TreeView}*/
    this.treeView = null;
    Object.defineProperty(this, "treeView", {
        get: function ()
        {
            return _nodeEntry.treeViewEntry.treeView;
        },
        configurable: false,
        enumerable: true
    });

    /**Object. The TreeViewNode that is the subject of the event.
    @type {EVUI.Modules.TreeView.TreeViewNode}*/
    this.node = null;
    Object.defineProperty(this, "node", {
        get: function ()
        {
            return _nodeEntry.node;
        },
        configurable: false,
        enumerable: true
    });

    /**String. The full name of the event.
    @type {String}*/
    this.eventName = null;

    /**String. The type of event being raised.
    @type {String}*/
    this.eventType = null;

    /**Pauses the TreeViewNode's action, preventing the next step from executing until resume is called.*/
    this.pause = function () { };

    /**Resumes the TreeViewNode's action, allowing it to continue to the next step.*/
    this.resume = function () { };

    /**Cancels theTreeViewNode's action and aborts the execution of the operation.*/
    this.cancel = function () { }

    /**Stops the TreeViewNode from calling any other event handlers with the same eventType.*/
    this.stopPropagation = function () { };

    /**Object. Any state value to carry between events.
    @type {Object}*/
    this.context = {};
};

/**Object to inject the standard dependencies used by the DialogController into it via its constructor.
@class*/
EVUI.Modules.TreeView.TreeViewControllerServices = function ()
{
    /**Object. An instance of the Binding module's BindingController object.
    @type {EVUI.Modules.Binding.BindingController*/
    this.bindingController = null;

    /**Object. An instance of the Styles module's StylesheetManager object.
    @type {EVUI.Modules.Styles.StyleSheetManager}*/
    this.stylesheetManager = null;
};

/**Enum for switching between the different types of HTML list elements (UL or OL).
@enum*/
EVUI.Modules.TreeView.TreeViewListElementType =
{
    Unordered: "ul",
    Ordered: "ol"
};
Object.freeze(EVUI.Modules.TreeView.TreeViewListElementType);

/**Enum for describing the way in which child TreeViewNodes are generated for the TreeView.
@enum*/
EVUI.Modules.TreeView.TreeViewListBindingType =
{
    /**TreeViewNodes are entirely sourced from the property whose name is the childListName in the source object. Building causes the list of TreeViewNodes to be synced with the array of objects pointed at by the childListName on the source object.*/
    ListBound: "bound",
    ///**TreeViewNodes are added/removed manually and not derived from a property on the source object. Building causes the manually added TreeViwNodes's Bindings to be recalculated.*/
    //Manual: "manual",
    ///**TreeViewNodes can be either sourced from the source object or added/removed manually. Building causes anything that was ListBound to be synced and everything that was Manually added to be recalculated and kept at its same index it was manually added at relative to the changes in the ListBound array.*/
    //Hybrid: "hybrid"
};
Object.freeze(EVUI.Modules.TreeView.TreeViewListBindingType);

/**Enum for describing the way in which a TreeViewNode will rebuilt itself when instructed to do so.
@enum*/
EVUI.Modules.TreeView.TreeViewNodeBuildMode =
{
    /**Only rebuids when build/buildAsync is called.*/
    Manual: "manual",
    /**Utilizes the Bindder's rebind mode to rebuild the entire TreeViewNode during build or expand operation.*/
    Rebuild: "rebuild",
    /**Utilizes the Binder's update mode to selectively update the TreeViewNode during a build or expand operation.*/
    Update: "update"
};
Object.freeze(EVUI.Modules.TreeView.TreeViewNodeBuildMode);

/**Enum for describing the mode in which the options object is shared between child TreeViewNodes of a TreeViewNode.
@enum*/
EVUI.Modules.TreeView.TreeViewOptionsShareMode =
{
    /**Every TreeViewNode in the tree shares the same instance of the TreeViewOptions object.*/
    TreeShared: "tree",
    /**Every peer node under a given node shares a single cloned copy of their parent's TreeViewOption object.*/
    PeerNodeShared: "peers",
    /**Every node has its own clone of its parent node's TreeViewOptions object.*/
    Cloned: "cloned"
};
Object.freeze(EVUI.Modules.TreeView.TreeViewOptionsShareMode);

/**Enum for describing the current state of a TreeViewNode.
@enum*/
EVUI.Modules.TreeView.TreeViewNodeState =
{
    None: "none",
    Collapsed: "collapsed",
    Collapsing: "collapsing",
    Expanded: "expanded",
    Expanding: "expanding",
    Building: "building",
    Disposed: "disposed"
};
Object.freeze(EVUI.Modules.TreeView.TreeViewNodeState);

/**Enum for describing the current state of an entire TreeView. 
@enum*/
EVUI.Modules.TreeView.TreeViewState =
{
    None: "none",
    Ready: "ready",
    Disposed: "disposed"
};
Object.freeze(EVUI.Modules.TreeView.TreeViewState);

/**Global instance of the TreeViewController.
@type {EVUI.Modules.TreeView.TreeViewController}*/
EVUI.Modules.TreeView.Manager = null;
(function ()
{
    var manager = null;
    var ctor = EVUI.Modules.TreeView.TreeViewController;

    Object.defineProperty(EVUI.Modules.TreeView, "Manager", {
        get: function ()
        {
            if (manager == null)
            {
                manager = new ctor();
            }

            return manager;
        },
        configurable: false,
        enumerable: true
    });
})();

delete $evui.treeViews;

/**Controller for creating and managing TreeViews.
@type {EVUI.Modules.TreeView.TreeViewController}*/
$evui.treeViews = null;
Object.defineProperty($evui, "treeViews", {
    get: function ()
    {
        return EVUI.Modules.TreeView.Manager;
    }
});

/**Constructor reference for the TreeViewController.*/
EVUI.Constructors.TreeView = EVUI.Modules.TreeView.TreeViewController;

Object.freeze(EVUI.Modules.TreeView);

/**Creates and adds a TreeView to the controller's list of managed TreeViews.
@param {String|EVUI.Modules.TreeView.AddTreeViewArgs|EVUI.Modules.TreeView.TreeView} makeTreeViewArgsOrId Either the string name of the TreeView to make, a YOLO TreeView object describing the tree, or a YOLO AddTreeViewArgs object describing the tree.
@param {EVUI.Modules.TreeView.AddTreeViewNodeArgs|EVUI.Modules.TreeView.TreeViewNode} rootNodeArgs Optional. Arguments for making the root TreeViewNode of the TreeView. Can either be a YOLO TreeViewNode or a YOLO AddTreeViewNodeArgs object.
@returns {EVUI.Modules.TreeView.TreeView} */
$evui.addTreeView = function (makeTreeViewArgsOrId, rootNodeArgs)
{
    return $evui.treeViews.addTreeView(makeTreeViewArgsOrId, rootNodeArgs);
};

/**Gets a TreeView or TreeViews from the TreeViewController.
@param {String|EVUI.Modules.TreeView.Constants.Fn_TreeViewSelector} treeViewIdOrPredicate Either the string ID of a TreeView to get, or a predicate function used to select TreeViews from the controller's collection of TreeViews.
@param {Boolean} getAllMatches Optional. Whether or not to return all the matches that satisfied the predicate function. If omitted only the first TreeView to satisfy the predicate is returned.
@returns {TreeView|TreeView[]} */
$evui.getTreeView = function (treeViewIdOrPredicate, getAllMatches)
{
    return $evui.treeViews.getTreeView(treeViewIdOrPredicate, getAllMatches)
};

/**Removes and optionally disposes of one of the TreeViews being managed by this controller.
@param {String} treeViewId The ID of the TreeView to remove.
@param {Boolean} dispose LOptional. Whether or not to dispose of and destroy the TreeView once it has been removed. False by default.
@returns {Boolean} */
$evui.removeTreeView = function (treeViewId, dispose)
{
    return $evui.treeViews.removeTreeView(treeViewId, dispose)
};

Object.freeze(EVUI.Modules.TreeView);