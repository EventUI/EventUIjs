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
});

$evui.testAsync({
	name: "Deep Extend Options - Function Filter",
	test: function (hostArgs)
	{
		var source = {
			a: 1,
			b: "2",
			c: {
				d: 3,
				e: "4"
			}
		};

		var target = {};

		var result = {
			a: 1,
			c:
			{
				d: 3
			}
		};

		var options = new EVUI.Modules.Core.DeepExtenderOptions();
		options.filter = function (propName, sourceObj, targetObj)
		{
			if (typeof sourceObj[propName] === "string") return false;
			return true;
		};

		$evui.deepExtend(target, source, options);
		$evui.assert(target).isEquivalentTo(result);
	}
});

$evui.testAsync({
	name: "Deep Extend Options - Property Filter",
	test: function (hostArgs)
	{


		var source = {
			a: 1,
			b: "2",
			c: {
				d: 3,
				e: "4"
			}
		};

		var target = {};

		var result = {
			b: "2",
			c:
			{
				e: "4"
			}
		};

		var options = new EVUI.Modules.Core.DeepExtenderOptions();
		options.filter = ["a", "d"];

		$evui.deepExtend(target, source, options);
		$evui.assert(target).isEquivalentTo(result);
	}
});