await $evui.testAsync({
	name: "Basic mail merge - docFrag",
	test: async function (testArgs)
	{
		var bindObj = { a: 123 };
		var bindHtml = "<span>{{a}}</span>";

		var bindResult = await $evui.bindAsync({
			element: document.createDocumentFragment(),
			source: bindObj,
			htmlContent: bindHtml
		});

		$evui.assert(bindResult).isTrue((value) => { return value instanceof EVUI.Modules.Binding.Binding });
		$evui.assert(bindResult.element?.nodeType).is(Node.DOCUMENT_FRAGMENT_NODE);
		$evui.assert(bindResult.element.firstElementChild?.tagName).isRoughly("span");
		$evui.assert(bindResult.element.firstElementChild.childNodes[0].textContent).is(bindObj.a.toString());
	}
});

await $evui.testAsync({
	name: "Basic update",
	test: async function (testArgs)
	{
		var bindObj = { a: 123 };
		var bindHtml = "<span>{{a}}</span>";

		var bindResult = await $evui.bindAsync({
			element: document.createDocumentFragment(),
			source: bindObj,
			htmlContent: bindHtml
		});

		var domContent = bindResult.getBoundContent();

		bindObj.a = "abc";
		await bindResult.updateAsync();

		var newDomContent = bindResult.getBoundContent();
		$evui.assert(domContent[0]).is(newDomContent[0]);
	}
});