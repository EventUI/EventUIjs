const PaneTest = {};

PaneTest.customPropertyValues = function* ()
{
    yield 123;
    yield { a: 1 };
    yield [1, 2, 3];
    yield { a: 1, b: { c: 2 } };
    yield function () { };
    yield Symbol("abc");
};

PaneTest.nestedCustomPropertyValues = function* ()
{
    yield ["showSettings", "custom", PaneTest.customPropertyValues];
    yield ["showSettings.absolutePosition", "custom", PaneTest.customPropertyValues];
    yield ["showSettings.relativePosition", "custom", PaneTest.customPropertyValues];
    yield ["showSettings.anchors", "custom", PaneTest.customPropertyValues];
    yield ["showSettings.documentFlow", "custom", PaneTest.customPropertyValues];
    yield ["showSettings.clipSettings", "custom", PaneTest.customPropertyValues];
    yield ["showSettings.clipSettings.clipBounds", "custom", PaneTest.customPropertyValues];
    yield ["showSettings.showTransition", "custom", PaneTest.customPropertyValues];
    yield ["showSettings.hideTransition", "custom", PaneTest.customPropertyValues];
    yield ["showSettings.backdropSettings", "custom", PaneTest.customPropertyValues];
    yield ["showSettings.backdropSettings.backdropShowTransition", "custom", PaneTest.customPropertyValues];
    yield ["showSettings.backdropSettings.backdropHideTransition", "custom", PaneTest.customPropertyValues];
    yield ["loadSettings", "custom", PaneTest.customPropertyValues];
    yield ["loadSettings.httpLoadArgs", "custom", PaneTest.customPropertyValues];
    yield ["loadSettings.placeholderLoadArgs", "custom", PaneTest.customPropertyValues];
    yield ["resizeMoveSettings", "custom", PaneTest.customPropertyValues];
    yield ["resizeMoveSettings.resizeTransition", "custom", PaneTest.customPropertyValues];
    yield ["resizeMoveSettings.moveTransition", "custom", PaneTest.customPropertyValues];
    yield ["autoHideSettings", "custom", PaneTest.customPropertyValues];
}