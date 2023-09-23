$evui.init(function ()
{
    var strA = "Hades is a cat and has sharp claws.";
    var strB = "Mia is a dog and has big ears.";

    var diff = $evui.diff(strA, strB, { diffStrings: true });
    $evui.log(diff);
});