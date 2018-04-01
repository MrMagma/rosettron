/**
  * Extracts identifier tokens from a key (used in parseKey)
  * @param {string} char - The first character of the identifier
  * @param {Array} key - The remaining characters of the key
  * @returns {Object} Either a Key or ArrayKey token
  */
function parseKeyIdentifier(char, key) {
    let id = char;
    
    while (key[0] !== "." && key.length > 0) {
        id += key.shift();
    }
    
    if (/[^0-9]/g.test(id)) {
        return {
            type: "Key",
            identifier: id
        };
    } else {
        return {
            type: "ArrayKey",
            identifier: parseInt(id)
        }
    }
}

/**
  * Parses a key into an array of tokens to be used in rosettron
  * @param {string} key - The key to be parsed
  * @returns {Array} The tokenized key
  */
function parseKey(key) {
    key = key.split("");
    
    let keyTokens = [];
    
    while (key.length > 0) {
        let char = key.shift();
        
        switch (char) {
            case ".":
                if (key[0] === ".") {
                    if (keyTokens.length > 0 && keyTokens[keyTokens.length - 1].type !== "Elevator") {
                        keyTokens.pop();
                    } else {
                        keyTokens.push({
                            type: "Elevator"
                        });
                    }
                    key.shift();
                }
                break;
            default:
                keyTokens.push(parseKeyIdentifier(char, key));
        }
    }
    
    return keyTokens;
}

module.exports = parseKey;
