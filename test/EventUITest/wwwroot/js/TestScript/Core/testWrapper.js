$evui.init(function ()
{
    var a = {
        prop1: 123,
        prop2: 456,
        prop3:
        [
            "def"
        ]
    };

    var B = function (param)
    {
        this.someProp = null;
        this.anotherProp = null;
        this.inASubObject = null;
        this.doesntExist = null;
        this.parameter = null;

        $evui.wrap(this, param,
            [
                { targetPath: "prop1", sourcePath: "someProp" },
                { targetPath: "prop2", sourcePath: "anotherProp", settings: { set: false } },
                { targetPath: "prop3[0]", sourcePath: "inASubObject" },
                { targetPath: "prop3[1]", sourcePath: "doesntExist" },
                { targetPath: null, sourcePath: "parameter", settings: { set: false }}
            ]);
    };

    var b = new B(a);
    b.doesntExist = 654;
    console.log(JSON.stringify(b));
});