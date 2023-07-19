var getNextCharacter = function(str, depth, chars)
{
    if (depth <= 0) return;
    if (chars == null) chars = [];

    for (var x = 0; x < 255; x++)
    {
        var curStr = str + String.fromCharCode(x);
        chars.push(curStr);

        getNextCharacter(curStr, depth - 1, chars);  
    }

    return chars;
};

var result = getNextCharacter("", 2);

var numResult = result.length;

var numDictionaries = 0;
var hashDictionaries = [];
var keyCounter = 0;
var maxKeys = 100000;

var hashes = {};
var collisions = {};

for (var x = 0; x < numResult; x++)
{
    var curStr = result[x];
    var curHash = $evui.getHashCode(curStr);

    var existing = null;
    for (var y = 0; y < numDictionaries; y++)
    {
        existing = hashDictionaries[y][curHash];
        if (existing != null) break;
    }

    if (existing != null)
    {
        collisions[curHash] = existing;
        existing.push(curStr);
        console.log("Collision! " + curStr + " = " + curHash);
    }
    else
    {
        if (keyCounter === maxKeys)
        {
            numDictionaries = hashDictionaries.push(hashes);
            hashes = {};
            keyCounter = 0;
        }

        keyCounter++;
        hashes[curHash] = [curStr];
    }
}

console.log(collisions);