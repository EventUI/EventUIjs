$evui.testAsync({
    name: "Case-Insensitive Object - Get Value",
    testArgs: CoreTest.makeCIOGetValueArgs,
    test: function (hostArgs, name, sourceObj, valuesToGet)
    {
        hostArgs.outputWriter.logDebug(name);
        hostArgs.outputWriter.logInfo("Source object: " + JSON.stringify(sourceObj));
        hostArgs.outputWriter.logInfo("Values to get: " + JSON.stringify(valuesToGet));

        var cio = $evui.cio(sourceObj);

        for (var key in valuesToGet)
        {
            var value = valuesToGet[key];
            var matchingKey = null;
            var cioValue = cio.getValue(key);

            for (var prop in sourceObj)
            {
                if (sourceObj[prop] === value)
                {
                    matchingKey = prop;
                    break;
                }
            }

            hostArgs.outputWriter.logInfo(`Getting ${matchingKey} as ${key} from sourceObject.`);
            $evui.assert(value).is(cioValue);
        }
    }
});

$evui.testAsync({
    name: "Case-Insensitive Object - SetValue",
    testArgs: CoreTest.makeCIOGetValueArgs,
    test: function (hostArgs, name, sourceObj, valuesToSet)
    {
        hostArgs.outputWriter.logDebug(name);
        hostArgs.outputWriter.logInfo("Source object: " + JSON.stringify(sourceObj));
        hostArgs.outputWriter.logInfo("Values to get: " + JSON.stringify(valuesToSet));

        var cio = $evui.cio(sourceObj);

        for (var key in valuesToSet)
        {
            var value = valuesToSet[key];
            var matchingKeys = [];

            for (var prop in sourceObj)
            {
                if (prop.toLowerCase() === key.toLowerCase())
                {
                    matchingKeys.push(prop);
                }
            }

            hostArgs.outputWriter.logInfo(`Assigning ${key} to ${JSON.stringify(matchingKeys)} as ${value}}.`);

            cio.setValue(key, value);

            var numMatchingKeys = matchingKeys.length;
            for (var x = 0; x < numMatchingKeys; x++)
            {
                var curKey = matchingKeys[x];
                if (curKey === key) continue;

                hostArgs.outputWriter.logInfo(`Ensuring old key '${curKey}' has been removed from the object.`);
                $evui.assert(cio[curKey]).is(undefined);
            }

            $evui.assert(cio.getValue(key)).is(value);
        }
    }
});