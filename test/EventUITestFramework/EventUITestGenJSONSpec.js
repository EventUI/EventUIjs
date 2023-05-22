/**Object that defines the start of a new hierarchy of tests that is not impacted by parent TestRoots or TestSet inheritance.
@class*/
TestRoot = function ()
{
    /**String. The version of the testing JSON definitions.
    @type {String}*/
    this.version = "1.0";

    /**String. The type of the object being described.
    @type {String}*/
    this.type = "root";

    /**String. The name of the test root. Used for logging purposes.
    @type {String}*/
    this.name = null;

    /**String. The description of the tests run under this test root
    @type {String}*/
    this.description = null;

    /**Object. A DeclarationSet where resources can be mapped to human-readable names or identifiers that can be used as references.
    @type {DeclarationSet}*/
    this.declarations = null;

    /**Array. An array of names of dependency definitions, or the dependency definitions themselves.
    @type {String[]|Dependency[]}*/
    this.dependencies = null;

    /**Array. An array of Runnable objects describing which test sets or files to run.
    @type {Runnable[]}*/
    this.run = [];

    /**Array. An array of Runnable objects describing which test sets or files to run.
    @type {Runnable[]}*/
    this.skip = [];
};

/**Object definition for the start of a sub-hierarchy under a TestRoot.
@class*/
TestSet = function ()
{
    /**String. The version of the testing JSON definitions.
    @type {String}*/
    this.version = "1.0";

    /**String. The type of the object being described.
    @type {String}*/
    this.type = "set";

    /**String. The name of the test set. Used for both selection and logging purposes.
    @type {String}*/
    this.name = null;

    /**String. The description of the tests run under this test set.
    @type {String}*/
    this.description = null;

    /**Array. An array of names of dependency definitions, or the dependency definitions themselves.
    @type {String[]|Dependency[]}*/
    this.dependencies = null;

    /**Boolean. Whether or not the set includes all .js files beneath it in the file hierarchy. Only applies if "run" is omitted.*/
    this.recursive = false;

    /**Array. An array of Runnable objects describing which test sets or files to run.
    @type {Runnable[]}*/
    this.run = [];

    /**Array. An array of Runnable objects describing which test sets or files to skip if they would otherwise be included in the run list or implicit hierarchy.
    @type {Runnable[]}*/
    this.skip = [];
};

/**Represents a runnable item or set of items (test sets or test files)
@class*/
Runnable = function ()
{
    /**String. The type of item being run. Must be a value from RunnableType.
    @type {String}*/
    this.type = RunnableType.Set;
    /**String. The name of the item to run if it has a unique name.
    @type {String}*/
    this.name = null;
    /**Object. A FileSelecgtor to use if the item being run does NOT have a name, this is the metadata that selects a file based on a glob pattern, a regex, a name, or a path.
    @type {FileSelector}*/
    this.selector = null;
    /**String. Should the runnable item fail, this communicates whether or not the tests should continue (default), stop the set that the test was run from, or stop all subsequent tests. Must be a value from FailureMode.
    @type {String}*/
    this.failureMode = FailureMode.Continue;
};

/**A definition that instructs the test running to include a file as a dependency for a test.
 @class*/
Dependency = function ()
{
    /**String. The human-readable alias or name of the dependency. Used to reference it from declarations or dependencies.
    @type {String}*/
    this.name = null;
    /**String. The relative or full path of the dependency code file.
    @type {String}*/
    this.path = null;
    /**Object. A FileSelector to use for the dependency (or set of dependency files).
    @type {FileSelector}*/
    this.selector = null;
    /**Boolean. Whether or not the dependencies with the matching name or that meet the FileSelector should be excluded from the dependencies if they would otherwise be included.
    @type {Boolean}*/
    this.exclude = false;
    /**Number. Dependencies are normally added in order of addition in TestSets or TestRoots - this field can be used to change the order of dependency injection into the test. All members with the same ordinal are added as a set in order of addition.
    @type {Number}*/
    this.priority = 0;
};

/**Metadata object used */
FileSelector = function ()
{
    this.path = null;
    this.glob = null;
    this.regex = null;
    this.name = null;
    this.recursive = false;
};

DeclarationSet = function ()
{
    this.dependencies = [];
};

FailureMode =
{
    Continue: "continue",
    Abandon: "abandon",
    Terminate: "terminate"
};

RunnableType =
{
    Set: "set",
    File: "file"
};
