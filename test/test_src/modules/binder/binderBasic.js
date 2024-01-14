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
	name: "Basic update - docFrag",
	test: async function (testArgs)
	{
		var bindObj = { a: 123 };
		var bindHtml = "<span>{{a}}</span>";

		var bindResult = await $evui.bindAsync({
			element: document.createDocumentFragment(),
			source: bindObj,
			htmlContent: bindHtml
		});

		//get the array of bound nodes
		var domContent = bindResult.getBoundContent();

		//see that the original binding worked
		$evui.assert(domContent[0].childNodes[0].textContent).is(bindObj.a.toString());

		//update the bound object and update the binding to refelct the change
		bindObj.a = "abc";
		await bindResult.updateAsync();

		//get the updated array of bound nodes
		var newDomContent = bindResult.getBoundContent();

		//see if the reference to bound content hasn't changed - the arrays are different but the span inside is the array is the same pre and post update
		$evui.assert(domContent).isEquivalentTo(newDomContent);

		//see if the update actually happened
		$evui.assert(newDomContent[0].childNodes[0].textContent).is(bindObj.a.toString());

		//make sure its still attached to the document fragment
		$evui.assert(newDomContent[0].parentNode.nodeType).is(Node.DOCUMENT_FRAGMENT_NODE);

		//finally, make sure we're attched to the element still as well
		$evui.assert(newDomContent[0].parentNode).is(bindResult.element);
	}
});

await $evui.testAsync({
	name: "Options test",
	test: async function (testArgs)
	{
	}
})