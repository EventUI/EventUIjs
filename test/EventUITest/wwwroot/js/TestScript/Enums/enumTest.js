$evui.init(function ()
{
    var modules = Object.keys(EVUI.Modules);
    var numModules = modules.length;
    var dupes = [];
    var unfrozen = [];
    var existing = {};

    for (var x = 0; x < numModules; x++)
    {
        var moduleName = modules[x];
        var mod = EVUI.Modules[moduleName];

        for (var prop in mod)
        {
            var val = mod[prop];
            if (typeof val === "function") continue;
            if (typeof val !== "object") continue;
            if (val.constructor !== Object.prototype.constructor) continue;

            var fullName = moduleName + "." + prop;

            var objRecord = existing[prop];
            if (objRecord != null)
            {
                objRecord.count++;
                objRecord.instances.push(fullName);
                if (dupes.indexOf(objRecord) < 0) dupes.push(objRecord);
            }
            else
            {
                objRecord = {};
                objRecord.count = 1;
                objRecord.instances = [fullName];
                objRecord.frozen = Object.isFrozen(val);

                if (objRecord.frozen === false) unfrozen.push(objRecord);

                existing[prop] = objRecord;
            }
        }
    }

    $evui.log(dupes);
    $evui.log(unfrozen);

    //EVUI.Modules.Binding.BindingCompletionState.

    var write = function (val)
    {
        document.body.append(JSON.stringify(val));
    }


    $evui.log($evui.enum("BindingCompletionState"));
    $evui.log($evui.enum("BindingCompletionState.Canceled"));
    $evui.log($evui.enum("BindingCompletionState", "Canceled"));
    $evui.log($evui.enum("Binding", "BindingCompletionState.Canceled"));
    $evui.log($evui.enum(EVUI.Modules.Binding, "BindingCompletionState"));
    $evui.log($evui.enum(EVUI.Modules.Binding, "BindingCompletionState", "Canceled"));
    $evui.log($evui.enum(EVUI.Modules.Binding, "BindingCompletionState.Canceled"));


});