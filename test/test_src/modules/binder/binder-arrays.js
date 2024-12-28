await $evui.testAsync({
	name: "Basic array bind",
	test: async function (testArgs)
	{
		var bindObj = [{ a: 123 }, { a: 456 }, {a: 789}];
		var bindHtml = "<span>{{a}}</span>";

		var bindResult = await $evui.bindAsync({
			element: document.createDocumentFragment(),
			source: bindObj,
			htmlContent: bindHtml
		});

		$evui.assert(bindResult).isTrue((value) => { return value instanceof EVUI.Modules.Binding.Binding });
		$evui.assert(bindResult.element?.nodeType).is(Node.DOCUMENT_FRAGMENT_NODE);
		$evui.assert(bindResult.element.childElementCount).is(3);

		var childBindings = bindResult.getChildBindings()
		$evui.assert(childBindings?.length).is(3);

		for (var x = 0; x < childBindings.length; x++)
		{
			var curChild = childBindings[x];
			var compareValue = null;

			if (x === 0)
			{
				compareValue = 123;
			}
			else if (x === 1)
			{
				compareValue = 456;
			}
			else if (x === 2)
			{
				compareValue = 789
			}

			var boundContent = curChild.getBoundContent();

			$evui.assert(curChild.source.a).is(compareValue);
			$evui.assert(boundContent.length).is(1);
			$evui.assert(boundContent[0].childElementCount).is(0);
			$evui.assert(boundContent[0].textContent).is(compareValue.toString());
			$evui.assert(curChild.parentBinding).is(bindResult);
			$evui.assert(curChild.parentBindingKey).is(x.toString());
		}
	}
});

await $evui.testAsync({
	name: "Array bind - array element template",
	test: async function (testArgs)
	{
		var bindObj = {
			content: [{ a: 123 }, { a: 456 }, { a: 789 }]
		};

		var parentBindHtml = "<div evui-binder-source='content' evui-binder-element-template='elementTemplate'></div>";

		$evui.addBindingTemplate({
			templateName: "elementTemplate",
			htmlContent: "<strong>{{a}}</strong>"
		});

		var bindResult = await $evui.bindAsync({
			element: document.createDocumentFragment(),
			source: bindObj,
			htmlContent: parentBindHtml
		});

		$evui.assert(bindResult).isTrue((value) => { return value instanceof EVUI.Modules.Binding.Binding });
		$evui.assert(bindResult.element?.nodeType).is(Node.DOCUMENT_FRAGMENT_NODE);
		$evui.assert(bindResult.element.childElementCount).is(1);
		$evui.assert(bindResult.templateName).isTrue((val) => { return (val == null || val.trim().length === 0) });


		var arrayWrapperBinding = bindResult.getChildBindings()
		$evui.assert(arrayWrapperBinding?.length).is(1);

		arrayWrapperBinding = arrayWrapperBinding[0];

		var childBindings = arrayWrapperBinding.getChildBindings();

		for (var x = 0; x < childBindings.length; x++)
		{
			var curChild = childBindings[x];
			var compareValue = null;

			if (x === 0)
			{
				compareValue = 123;
			}
			else if (x === 1)
			{
				compareValue = 456;
			}
			else if (x === 2)
			{
				compareValue = 789
			}

			var boundContent = curChild.getBoundContent();

			debugger;
			$evui.assert(curChild.templateName).is("elementTemplate");
			$evui.assert(curChild.source.a).is(compareValue);
			$evui.assert(boundContent.length).is(1);
			$evui.assert(boundContent[0].childElementCount).is(0);
			$evui.assert(boundContent[0].textContent).is(compareValue.toString());
			$evui.assert(curChild.parentBinding).is(arrayWrapperBinding);
			$evui.assert(curChild.parentBindingKey).is(x.toString());
		}
	}
});