$evui.testAsync({
    name: "Case-Insensitive Object",
    test: function (hostArgs)
    {
        var sourceObj = {
            a: 1,
            1: 2,
            A: "one",
            bb: "bee",
            bB: "bee2"
        };

        var cio = $evui.cio(sourceObj);

        $evui.assert(Object.keys(cio).length).is(Object.keys(sourceObj).length);
        $evui.assert(cio.getValue("A")).is(sourceObj.a);
        $evui.assert(cio.getValue("bB")).isNot(sourceObj.bB);
        $evui.assert(cio.getValue("1")).isNot(sourceObj[1]);
    }
})