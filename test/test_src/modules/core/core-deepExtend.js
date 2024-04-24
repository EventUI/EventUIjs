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
	name: "Deep Extend - Extend Onto Blank - Same Object in Multiple Places",
	test: function (hostArgs)
	{
		var source =
		{
			a: 1,
			b: 2,
		};

		source.c =
		{
			f: 7,
			g: [1, 2, 3, 4]
		};

		source.d = source.c;

		var deepExtended = $evui.deepExtend({}, source);

		$evui.assert(source).isEquivalentTo(deepExtended);
		$evui.assert(deepExtended.d).is(deepExtended.c);
	}
});

$evui.testAsync({
	name: "Deep Extend - Extend Onto Blank - Circular Reference",
	test: function (hostArgs)
	{
		var source =
		{
			a: 1,
			b: 2,
		};

		source.c =
		{
			f: 7,
			g: [1, 2, 3, 4]
		};

		source.d = source;

		var deepExtended = $evui.deepExtend({}, source);

		$evui.assert(source).isEquivalentTo(deepExtended);
		$evui.assert(deepExtended.d).is(deepExtended);
	}
});

$evui.testAsync({
	name: "Deep Extend Use Cases",
	testArgs: CoreTest.makeDeepExtendArgs,
	test: function (hostArgs, name, source, target, result, shouldFail)
	{
		hostArgs.outputWriter.logDebug(name);

		if (shouldFail === true)
		{
			hostArgs.options.shouldFail = true;
		}

		var extended = $evui.deepExtend(source, target);

		$evui.assert(extended).isEquivalentTo(result);
	}
})