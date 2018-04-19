let {errif} = require("./util.js");

/**
  * Maps a matched key in the input to a key-value pair in the output
  * @param {Array} match - The data on the matched key from the input
  * @param {string} mapToKey - The key we think we should map to
  * @param {Object} fns - A list of named functions for use in mapping
  * @param {Object} input - The input object
  * @returns {Object} The key and value to put into the output
  */
function mapMatch([matchedKey, util, keymapKey], mapToKey, fns, input) {
    let params = [matchedKey, input[matchedKey]];
    let out = {
        key: null,
        value: input[matchedKey]
    };
    
    params.push.apply(params, (util != null && util.constructor !== RegExp) ? util : []);
    
    if (/^[a-z]+\(\)$/ig.test(mapToKey)) {
        let fnKey = mapToKey.replace("()", "");

        errif(typeof fns[fnKey] !== "function", `Function ${fnKey} could not be found in the function list`);

        let nOut = fns[fnKey].apply(fns[fnKey], params);

        errif(typeof nOut !== "object", "Output of function must be an object");
        errif(typeof nOut.key !== "string", "Output key must be a string");

        out.key = nOut.key;
        out.value = (nOut.value != null) ? nOut.value : out.value;
    } else {
        out.key = mapToKey;
    }
    
    if (util != null && util.constructor === RegExp) {
        out.key = matchedKey.replace(util, out.key);
    }
    
    return out;
}

module.exports = mapMatch;
