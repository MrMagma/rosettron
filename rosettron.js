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
        "someStuff": ["..otherStuff.%"]
        "listOfThings": [{
            "a": "b",
            "b": "c",
            "c": ["....a.%1.%2"]
        }]
    }
    "valuemap": {
        // TODO
    }
}
*/
let parseKey = require("./parse-key.js");
let {errif} = require("./util.js");

/**
  * Flattens an array by one layer. Arrays will be nested one layer less in the output.
  * @param {Array} arr - The array to be flattened
  * @returns {Array} The flattened array
  */
function flattenOnce(arr) {
    let out = [];
    
    for (let el of arr) {
        out.push.apply(out, el);
    }
    
    return out;
}

/**
  * Gets the matches to a key from the keymap in the list of keys from the input object
  * @param {string} key - A key from the keymap
  * @param {Array} inputKeys - List of keys from the input object
  * @returns {[string, RegExp|, string]} The matched key, some utility data, and the original key
  */
function getMatches(key, inputKeys) {
    if (key[0] === "/") {
        let regex = new RegExp(
            key.slice(1, key.lastIndexOf("/")),
            key.slice(key.lastIndexOf("/") + 1, Infinity)
        );
        
        return inputKeys
            .filter(inputKey => regex.test(inputKey))
            .map(inputKey => [inputKey, regex, key]);
    } else {
        return [[inputKeys[inputKeys.indexOf(key)], null, key]]
            .filter(match => (match[0] != null));
    }
}

/*
{
    stack: [previously visited objs/arrs],
    counterStack: [self explanatory]
}
*/

/**
  * Accesses data in the stack using a parsed key
  * @param {Array} key - A parsed key
  * @param {{stack: Array}} stack - The stack
  * @returns {[Object, Object]} The level above what you want to access and the last token in the key
  */
function accessKey(key, {stack}) {
    let outKey = parseKey(key);
    
    let stackIndex = stack.length - 1;
    let out = stack[stackIndex];
    
    while (outKey.length > 1) {
        let token = outKey.shift();
        
        switch (token.type) {
            case "Elevator":
                stackIndex--;
                
                errif(stackIndex < 0, "Cannot go up any more layers");
                
                out = stack[stackIndex];
                break;
            case "Key":
            case "ArrayKey":
                if (out[token.identifier] == null) {
                    if (outKey[0].type === "Key") {
                        out[token.identifier] = {};
                    } else if (outKey[0].type === "ArrayKey") {
                        out[token.identifier] = [];
                    }
                }
                
                out = out[token.identifier];
        }
    }
    
    return [out, outKey[0]];
}

/**
  * Replaces wildcards in a key with their contextual values
  * @param {string} key - The key to specify
  * @param {Array} counterStack - The counter stack. Used for replacing counter wildcards
  * @param {string} [matchedKey=""] - The key that was matched in the input
  * @param {RegExp|function} [util] - A parameter for when we need to do something special with the key
  * @returns {string} The specified key
  */
function specifyKey(key, counterStack, matchedKey = "", util) {
    if (util != null && util instanceof RegExp) {
        key = matchedKey.replace(util, key);
    }
    
    key = key.replace(/%([0-9]*)/g, (_, i) => {
        if (i.length) {
            return counterStack[parseInt(i)];
        } else {
            return counterStack[counterStack.length - 1];
        }
    });
    
    return key;
}

/**
  * Takes in a match and modifies the output according to that match
  * @param {string} mapToKey - The key to map to
  * @param {RegExp|function} util - Stuff if we need to do anything special with the key
  * @param value - The value to set in the output
  * @param {Object} data - The stack and counter stack
  * @param {string} matchedKey - The key that was matched in the input
  */
function setMatch(mapToKey, util, value, data, matchedKey = "") {
    let key = specifyKey(mapToKey, data.counterStack, matchedKey, util);
    
    let [obj, keyToken] = accessKey(key, data);
    
    // errif(obj[keyToken.identifier] != null, "Don't assign two things to the same key");
    
    obj[keyToken.identifier] = value;
}

/**
  * Called by rosettron if the input is an object
  * @param {Object} keymap - The keymap passed to rosettron
  * @param {Object} input - The input object passed to rosettron
  * @param {Object} data - The stack and counter stack
  * @returns {Object} The mapped object
  */
function rosettronObject(keymap, input, data) {    
    let inputKeys = Object.keys(input);
    
    // [[matchedKey, util, keymapKey]]
    let matches = flattenOnce(Object.keys(keymap).map(key => getMatches(key, inputKeys)));
    
    for (let match of matches) {
        if (typeof keymap[match[2]] === "string") {
            setMatch(keymap[match[2]], match[1], input[match[0]], data, match[0]);
        } else {
            errif(data.stack[data.stack.length - 1][match[0]] != null, "Don't assign two things to the same key");
            
            let canDelete = false;
            
            if (input[match[0]] instanceof Array) {
                canDelete = true;
                data.stack[data.stack.length - 1][match[0]] = [];
            } else {
                canDelete = true;
                data.stack[data.stack.length - 1][match[0]] = {};
            }
            
            data.stack.push(data.stack[data.stack.length - 1][match[0]]);
            
            rosettron(keymap[match[2]], input[match[0]], data);
            
            // Make sure we aren't dumping something into the output that we shouldn't be
            if (!Object.keys(data.stack[data.stack.length - 1]).length && canDelete) {
                delete data.stack[data.stack.length - 2][match[0]];
            }
            
            data.stack.pop();
        }
    }
    
    return data.stack[0];
}

/**
  * Called by rosettron if the input is an array
  * @param {Object} keymap - The keymap passed to rosettron
  * @param {Object} input - The input object passed to rosettron
  * @param {Object} data - The stack and counter stack
  * @returns {Object} The mapped array
  */
function rosettronArray(keymap, input, data) {
    errif(keymap.length !== 1, "Must provide one and only one element in keymap array");
    errif(typeof keymap[0] !== "string" && typeof keymap[0] !== "object", "Array keymap must be string, object, or array");
    
    let {counterStack, stack} = data;
    
    // Don't eat the rotten spaghetti
    counterStack.push(0);
    
    let [rule] = keymap;
    let lastInd = counterStack.length - 1;
    
    for (; counterStack[lastInd] < input.length; ++counterStack[lastInd]) {
        if (typeof rule === "string") {
            setMatch(rule, null, input[counterStack[lastInd]], data);
        } else {
            let out = {};
            stack.push(out);
            rosettron(rule, input[counterStack[lastInd]], data);
            stack.pop();
            if (Object.keys(out).length) stack[stack.length - 1][counterStack[lastInd]] = out;
        }
    }
    
    counterStack.pop();
    
    return data.stack[0];
}

/**
  * Takes in an object or array and a keymap, which it uses to map the input data onto a new schema
  * @param {Object} keymap - An object containing the rules for mapping from input to output
  * @param {Object} input - The input data
  * @param {Object} [data={stack: [{}], counterStack: []}] data - Object containing the stack and counter stack. Used internally; external use not recommended
  * @returns {Object} The mapped object
  */
function rosettron(keymap, input, data = {stack: [], counterStack: []}) {
    errif(typeof input !== "object", "input must be an object or array");
    errif(typeof keymap !== "object", "keymap must be an object or array");
    errif(input.constructor !== keymap.constructor, "keymap and input must be the same type");
    
    if (input instanceof Array) {
        if (!data.stack.length) data.stack[0] = [];
        return rosettronArray(keymap, input, data);
    } else {
        if (!data.stack.length) data.stack[0] = {};
        return rosettronObject(keymap, input, data);
    }
}

module.exports = rosettron;
