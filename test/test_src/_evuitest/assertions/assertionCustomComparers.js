var TestObj = function (val1, val2)
{
    this.val1 = val1;
    this.val2 = val2;
};

TestObj.prototype[EVUITest.Constants.Symbol_EqualityComparer] = function (context)
{
    if (context.a == null || context.b == null) return false;
    if (context.assert(context.a.val1, { throwOnFailure: false }).is(context.b.val1).success == false) return false;
    if (context.assert(context.a.val2, { throwOnFailure: false }).is(context.b.val2).success == false) return false;

    return true;
};

$evui.testAsync({
    name: "Assertion - basic custom comparer invocation",
    testArgs: [
        [new TestObj(1, 2), new TestObj(1, 2), true],
        [new TestObj(2, 2), new TestObj(1, 2), false],
        [new TestObj(1, 2), new TestObj(1, 3), false],
    ],
    test: function (args, obj1, obj2, shouldBeEqual)
    {
        args.options.shouldFail = !shouldBeEqual;

        //check to see if eqaulity is invoked
        $evui.assert(obj1).isEquivalentTo(obj2);
    }
});

$evui.testAsync({
    name: "Assertion - Date custom comparer invocation",
    testArgs: [
        [new Date(Date.now()), new Date(Date.now()), true],
        [new Date(Date.now() + 1000), new Date(Date.now()), false],
        [new Date(Date.now()), new Date(Date.now() + 1000), false],
    ],
    test: function (args, obj1, obj2, shouldBeEqual)
    {
        args.options.shouldFail = !shouldBeEqual;

        //check to see if eqaulity is invoked
        $evui.assert(obj1).isEquivalentTo(obj2);
    }
});

$evui.testAsync({
    name: "Assertion - Node custom comparer invocation",
    testArgs: [
        ["<span>hello world</span>", "<span>hello world</span>", true],
        ["<span>goodbye world</span>", "<span>hello world</span>", false],
        ["<div class='someClass'><span>Test</span></div>", "<div class='someClass'><span>Test</span></div>", true],
        ["<div class='someClass'><span>Test</span></div>", "<div class='someClass'><span>Test2</span></div>", false],
        ["<div class='someClass'><span>Test</span></div>", "<div class='someOtherClass'><span>Test</span></div>", false],
        ["<div attr1='someValue'><span>Test</span></div>", "<div class='someOtherClass'><span>Test</span></div>", false],
    ],
    test: function (args, html1, html2, shouldBeEqual)
    {
        args.options.shouldFail = !shouldBeEqual;

        var domParser = new DOMParser();
        var tree1 = domParser.parseFromString(html1, "text/html").body.firstElementChild;
        var tree2 = domParser.parseFromString(html2, "text/html").body.firstElementChild;

        //check to see if eqaulity is invoked
        $evui.assert(tree1).isEquivalentTo(tree2);
    }
});