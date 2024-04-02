$evui.testHost.runAsync({
    name: "Binder Safe Mode Test - Markup",
    test: async function ()
    {
        var bindObj = {
            content: `<strong>I should be pain text</strong>`
        }

        var html = `<div>{{content}}</div>`

        var binding = await $evui.bindAsync({
            element: document.createDocumentFragment(),
            htmlContent: html,
            source: bindObj,
            options: {
                noHtmlInjection: true
            }
        });

        $evui.assert(binding.getBoundContent()[0].childNodes[0].textContent).is(bindObj.content);
    }
});

$evui.testHost.runAsync({
    name: "Binder Safe Mode Test - Markup",
    test: async function ()
    {
        var bindObj = {
            content: `<script>alert('INJECTION ATTACK');</script>`
        }

        var html = `<div>{{content}}</div>`

        var binding = await $evui.bindAsync({
            element: document.createDocumentFragment(),
            htmlContent: html,
            source: bindObj,
            options: {
                nodeCreation: {
                    safeMode: true
                }
            }
        });

        $evui.assert(binding.getBoundContent()[0].childNodes.length).is(0);
    }
});