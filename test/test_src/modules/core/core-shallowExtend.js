$evui.testAsync({
	name: "Shallow Extend - Extend Onto Blank",
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

		var shallowExtended = $evui.extend({}, source);

		$evui.assert(source).isEquivalentTo(shallowExtended);
	}
});

$evui.testAsync({
	name: "Shallow Extend - Extend Onto Blank - Same Object in Multiple Places",
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

		var shallowExtended = $evui.extend({}, source);

		$evui.assert(source).isEquivalentTo(shallowExtended);
		$evui.assert(shallowExtended.d).is(shallowExtended.c);
	}
});

$evui.testAsync({
	name: "Shallow Extend - Extend Onto Blank - Circular Reference",
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

		var shallowExtended = $evui.extend({}, source);

		$evui.assert(source).isEquivalentTo(shallowExtended);
	}
});

$evui.testAsync({
	name: "Shallow Extend Use Cases",
	testArgs: CoreTest.makeShallowExtendArgs,
	test: function (hostArgs, name, source, target, result, shouldFail)
	{
		hostArgs.outputWriter.logDebug(name);

		if (shouldFail === true)
		{
			hostArgs.options.shouldFail = true;
		}

		var extended = $evui.extend(source, target);

		$evui.assert(extended).isEquivalentTo(result);
	}
});

$evui.testAsync({
	name: "Shallow Extend Options - Function Filter",
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
				d: 3,
				e: "4"
			}
		};

		var filter = function (propName, sourceObj, targetObj)
		{
			if (typeof sourceObj[propName] === "string") return false;
			return true;
		};

		$evui.extend(target, source, filter);
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
				d: 3,
				e: "4"
			}
		};

		var filter = ["a", "d"];

		$evui.extend(target, source, filter);
		$evui.assert(target).isEquivalentTo(result);
	}
});