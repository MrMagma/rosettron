/*
Input->translation rules->output
Input-JSON,XML
Output-JSON,XML
Translation rules
-Input key
-Output key
-Mapping (default=identity)
Start with only JSON for simplicity
Translator example
{
    "keymap": {
        // a in input will become b in output
        "a": "b"
        // Maps keys by regex
        "/a-z+(0-9)/": "a$1"
        // c.a -> c
        "c": {
            "a": "..c"
        }
        // Use functions to match and map keys
        "f()": "g()"
        // Array mappings
        // %n is the index for the nth layer array
        // % with no n defaults to the last layer
        "someStuff": ["otherStuff.%"]
        "listOfThings": [{
            "a": "b",
            "b": "c",
            "c": ["....a%1%2"]
        }]
    }
    "valuemap": {
        // TODO
    }
}
*/

function rosettronObject(keymap, input) {
    
}

function rosettronArray(keymap, input) {
    
}

function rosettron(keymap, input) {
    if (typeof translator !== "object") throw "translator must be an object or array";
    if (typeof input !== "object") throw "input must be an object or array";
    if (typeof keymap !== "object") throw "keymap must be an object or array";
    if (input.constructor !== keymap.constructor) throw "keymap and input must be the same type";
    
    if (input instanceof Array) {
        return rosettronArray(keymap, input);
    } else {
        return rosettronObject(keymap, input);
    }
}

console.log(rosettron({
    a: "b"
}, {
    a: 2
}));
