let assert = require("assert");

let makeMatcher = require("../make-matcher.js");

describe("makeMatcher", function() {
    it("should produce a functioning matcher for simple keys", function() {
        assert.deepEqual(makeMatcher("a", {})("a"), [true, "a", null]);
        assert.deepEqual(makeMatcher("a", {})("b"), [false, "b", null]);
    });
    
    it("should produce a functioning matcher for regular expressions", function() {
        assert.deepEqual(makeMatcher("/a+bc/", {})("aaabc"), [true, "aaabc", new RegExp(/a+bc/)]);
        assert.deepEqual(makeMatcher("/a+bc/", {})("aaadc"), [false, "aaadc", new RegExp(/a+bc/)]);
    });
    
    it("should produce a functioning matcher for functions", function() {
        assert.deepEqual(makeMatcher("f()", {f(key) {
            return [key === "a", [1, 2, 3]];
        }})("a"), [true, "a", [1, 2, 3]]);
        assert.deepEqual(makeMatcher("f()", {f(key) {
            return [key === "a", [1, 2, 3]];
        }})("b"), [false, "b", [1, 2, 3]]);
    });
});
