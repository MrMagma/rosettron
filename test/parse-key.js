let assert = require("assert");

let parseKey = require("../parse-key.js");

describe("parseKey", function() {
    it("should return an empty array when input is empty", function() {
        assert.deepEqual([], parseKey(""));
    });
    
    it("should parse single keys properly", function() {
        assert.deepEqual([{
            type: "Key",
            identifier: "a"
        }], parseKey("a"));
    });
    
    it("should parse single array keys properly", function() {
        assert.deepEqual([{
            type: "ArrayKey",
            identifier: 0
        }], parseKey("0"));
    });
    
    it("should parse array keys properly", function() {
        assert.deepEqual([{
            type: "ArrayKey",
            identifier: 0
        }, {
            type: "ArrayKey",
            identifier: 0
        }], parseKey("0.0"));
        
        assert.deepEqual([{
            type: "ArrayKey",
            identifier: 0
        }, {
            type: "ArrayKey",
            identifier: 0
        }, {
            type: "ArrayKey",
            identifier: 0
        }], parseKey("0.0.0"));
    });
    
    it("should handle keys that look like array keys", function() {
        assert.deepEqual([{
            type: "Key",
            identifier: "0a"
        }], parseKey("0a"));
    });
    
    it("should parse combinations of keys and array keys properly", function() {
        assert.deepEqual([{
            type: "ArrayKey",
            identifier: 0
        }, {
            type: "Key",
            identifier: "a"
        }], parseKey("0.a"));
        
        assert.deepEqual([{
            type: "Key",
            identifier: "a"
        }, {
            type: "ArrayKey",
            identifier: 0
        }], parseKey("a.0"));
        
        assert.deepEqual([{
            type: "Key",
            identifier: "a"
        }, {
            type: "ArrayKey",
            identifier: 0
        }, {
            type: "Key",
            identifier: "a"
        }], parseKey("a.0.a"));
        
        assert.deepEqual([{
            type: "ArrayKey",
            identifier: 0
        }, {
            type: "Key",
            identifier: "a"
        }, {
            type: "ArrayKey",
            identifier: 0
        }], parseKey("0.a.0"));
    });
    
    it("should parse simple paths properly", function() {
        assert.deepEqual([{
            type: "Key",
            identifier: "a"
        }, {
            type: "Key",
            identifier: "b"
        }], parseKey("a.b"));
        
        assert.deepEqual([{
            type: "Key",
            identifier: "a"
        }, {
            type: "Key",
            identifier: "b"
        }, {
            type: "Key",
            identifier: "c"
        }], parseKey("a.b.c"));
    });
    
    it("should parse elevator tokens properly", function() {
        assert.deepEqual([{
            type: "Elevator"
        }], parseKey(".."));
        
        assert.deepEqual([{
            type: "Elevator"
        }, {
            type: "Key",
            identifier: "a"
        }], parseKey("..a"));
    });
    
    it("should annihilate non-elevator tokens followed by elevator tokens", function() {
        assert.deepEqual([], parseKey("a.."));
        
        assert.deepEqual([{
            type: "Key",
            identifier: "a"
        }, {
            type: "Key",
            identifier: "c"
        }], parseKey("a.b..c"));
    });
});
