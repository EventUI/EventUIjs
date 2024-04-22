$evui.testAsync({
	name: "Deep Extend - Extend Onto Blank",
	test: function (hostArgs)
	{
		var source =
		{
			a: 1,
			b: 2,
			c: {
				f: 7,
				g: [1, 2, 3, 4]
			}
		};

		var deepExtended = $evui.deepExtend({}, source);

		$evui.assert(source).isEquivalentTo(deepExtended);
	}
});

$evui.testAsync({
	name: "Deep Extend - Extend Onto Blank",
	test: function (hostArgs)
	{
		var source =
		{
			a: 1,
			b: 2,
			c: {
				f: 7,
				g: [1, 2, 3, 4]
			}
		};

		var deepExtended = $evui.deepExtend({}, source);

		$evui.assert(source).isEquivalentTo(deepExtended);
	}
});