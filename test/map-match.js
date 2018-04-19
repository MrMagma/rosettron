let assert = require("assert");

let mapMatch = require("../map-match.js");

describe("mapMatch", function() {
    it("should handle simple keys", function() {
        assert.deepEqual(mapMatch(["a", null, "a"], "b", {}, {a: 2}), {
            key: "b",
            value: 2
        });
    });
    
    it("should handle only regex keys", function() {
        assert.deepEqual(mapMatch(["aab2c3", /aa(b2)c3/, "/aa(b2)c3/"], "a$1", {}, {aab2c3: 2}), {
            key: "ab2",
            value: 2
        });
    });
    
    
    it("should handle only function keys (no arguments)", function() {
        assert.deepEqual(mapMatch(["a", null, "a"], "f()", {
            f() {
                return {
                    key: "b",
                    value: 2
                }
            }
        }, {aab2c3: 2}), {
            key: "b",
            value: 2
        });
    });
    
    it("should handle only function keys (with arguments)", function() {
        assert.deepEqual(mapMatch(["a", [5], "a"], "f()", {
            f(k, v, a) {
                return {
                    key: "b",
                    value: a
                }
            }
        }, {aab2c3: 2}), {
            key: "b",
            value: 5
        });
    });
    
    it("should use input value as default output value", function() {
        assert.deepEqual(mapMatch(["a", null, "a"], "f()", {
            f(k, v, a) {
                return {
                    key: "b"
                }
            }
        }, {a: 2}), {
            key: "b",
            value: 2
        });
    });
    
    it("should handle identity maps", function() {
        assert.deepEqual(mapMatch(["a", null, "a"], "*", {}, {a: 2}), {
            key: "a",
            value: 2
        })
    })
});
