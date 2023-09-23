$evui.init(async function ()
{
    try
    {
        //$evui.styles.addStyleSheet("test", "@media screen and (max-width: 600px) \n\t {h1,h2.caseSensitive[mOrEcaSE='AbCd']>DIV || H1 {background-color: blue;} h2{background-color: red;} H1{border: 2px;}} @media /*I am ANOTHER comment.*/ (min-width: 800px) { h3{background-color: red;}} ");
        //$evui.styles.setRules("test", "@media screen and (max-width: 600px) \n\t {h1,h2.caseSensitive[mOrEcaSE='AbCd']>DIV || H1 {background-color: null; border: 2px;} h2{background-color: green;} H1{border: 2px; background-color: green;}} @media /*I am ANOTHER fucking comment.*/ (min-width: 800px) { h3{background-color: red;}}")
        //$evui.styles.setRules("test", "h1, .case1 { background-color: black }");

        //$evui.styles.addStyleSheet("existing", $evui.dom("style").elements[0].sheet); 
        //$evui.styles.setRules("existing", { selector: "h1", rules: { backgroundColor: "black" } });

        $evui.css(
        {
            selector: "h1",
            rules: "background-color: blue; border: 10px black solid"
        });

        await $evui.waitAsync(1000);

        $evui.css(
        {
            rules:
            {
                selector: "@media (condition) h1 > h2 > div, h2",
                rules: "background-color: null"
            }
        });

        await $evui.waitAsync(1000);

        $evui.css(
        {
            selector: ["h1", "h2"],
            rules: { border: "null", borderColor: "green", borderWidth: "10px", boderStyle: "solid"}
            });

        await $evui.waitAsync(1000);

        $evui.css(
        {
            selector: "h1, h2",
            rules: { opacity: ".5" }
        });

        await $evui.waitAsync(1000);

        $evui.css({
            rules: $evui.dom("style").elements[0].sheet
        })

        $evui.css("@media screen and (max-width: 600px) \n\t {h1,h2.caseSensitive[mOrEcaSE='AbCd']>DIV || H1 {background-color: blue;} h2{background-color: red;} H1{border: 2px;}} @media /*I am ANOTHER comment.*/ (min-width: 800px) { h3{background-color: red;}}");

        await $evui.waitAsync(1000);

        $evui.css(
        {
            selector: "@media screen and(max-width: 600px)h1,h2",
            remove: true
            });

        var rules = $evui.css({ sheetName: EVUI.Modules.Styles.Constants.DefaultStyleSheetName });
        console.log(rules);

    }
    catch (ex)
    {
        console.log(ex);
    }
})

