let {errif} = require("./util.js");

/**
  * Takes in a regex as a string and turns it into a function that checks whether a test key matches it
  * @param {string} key - The regex as a string
  * @returns {function} The function to check whether a key matches
  */
function regexMatcher(key) {
    let regex = new RegExp(
        key.slice(1, key.lastIndexOf("/")),
        key.slice(key.lastIndexOf("/") + 1, Infinity)
    );
    
    return function(testKey) {
        return [regex.test(testKey), testKey, regex];
    };
}

/**
  * Takes in a key and outputs a function that checks whether a test key matches it
  * @param {string} key - The key
  * @returns {function} The test function
  */
function keyMatcher(key) {
    return function(testKey) {
        return [key === testKey, testKey, null];
    }
}

/**
  * Takes in a function and wraps in some safety stuff so users can't mess anything up
  * @param {function} fn - The function
  * @returns {function} A wrapped version of the function that's safe for internal use
  */
function fnMatcher(fn) {
    return function(testKey) {
        let out = fn(testKey);
        return [out[0], testKey, out[1]];
    }
}

/**
  * Takes in a key match string and outputs a function to tell wheter a given key matches it
  * @param {string} key - The key match string
  * @param {Object} fns - A list of named functions
  * @returns {function} The matcher function
  */
function makeMatcher(key, fns) {
    if (key[0] === "/") {
        return regexMatcher(key);
    } else if (/^[a-z]+\(\)$/ig.test(key)) {
        let fnKey = key.replace("()", "");
        
        errif(typeof fns[fnKey] !== "function", `Function ${fnKey} could not be found in the function list`);
        
        return fnMatcher(fns[fnKey]);
    } else {
        return keyMatcher(key);
    }
}

module.exports = makeMatcher;
