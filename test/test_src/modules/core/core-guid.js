$evui.testAsync({
    name: "Guid Validation: 10,000 Guids vs Guid Regex",
    test: function ()
    {
        var validator = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

        for (var x = 0; x < 10000; x++)
        {
            var guid = $evui.guid();

            $evui.assert(guid).isTrue(function (val) { return validator.test(guid) });
        }
    }
})