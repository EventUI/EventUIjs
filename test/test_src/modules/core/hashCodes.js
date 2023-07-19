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
var hashes = {};
var collisions = {};

for (var x = 0; x < numResult; x++)
{
    var curStr = result[x];
    var curHash = $evui.getHashCode(curStr);

    var existing = hashes[curHash];
    if (existing != null)
    {
        collisions[curHash] = existing;
        existing.push(curStr);
    }
    else
    {
        hashes[curHash] = [curStr];
    }
}

console.log(collisions);