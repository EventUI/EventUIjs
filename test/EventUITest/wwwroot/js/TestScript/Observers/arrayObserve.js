$evui.init(function ()
{
    var arr = [1, 2, 3];

    var observer = new EVUI.Modules.Observers.ArrayObserver(arr);
    arr.unshift(1);
    $evui.log("Value Tests");
    $evui.log(observer.getChanges(true));

    var obj1 = {};
    var obj2 = {};

    var arr = [obj1, obj2];
    observer = $evui.observeArray(arr);
    arr[0] = obj2;
    arr[1] = obj1;
    arr.push(obj2);

    $evui.log("Object Tests");
    $evui.log(observer.getChanges(true))
});