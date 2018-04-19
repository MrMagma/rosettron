let assert = require("assert");

let rosettron = require("../rosettron.js");

describe("rosettron", function() {
    it("should handle single-key mappings", function() {
        assert.deepEqual({
            b: 1
        }, rosettron({
            a: "b"
        }, {
            a: 1
        }));
    });
    
    it("should handle multi-key mappings", function() {
        assert.deepEqual({
            c: 1,
            d: 2
        }, rosettron({
            a: "c",
            b: "d"
        }, {
            a: 1,
            b: 2
        }));
    });
    
    it("should handle identity mapping of keys", function() {
        assert.deepEqual({
            a: 1
        }, rosettron({
            a: "a"
        }, {
            a: 1
        }));
    });
    
    it("should handle mapping keys to other existing keys", function() {
        assert.deepEqual({
            a: 2,
            b: 1
        }, rosettron({
            a: "b",
            b: "a"
        }, {
            a: 1,
            b: 2
        }));
    });
    
    it("should handle nested object mappings", function() {
        assert.deepEqual({
            a: {
                c: 1
            }
        }, rosettron({
            a: {
                b: "c"
            }
        }, {
            a: {
                b: 1
            }
        }));
    });
    
    it("should handle elevator mappings", function() {
        assert.deepEqual({
            b: 1
        }, rosettron({
            a: {
                b: "..b"
            }
        }, {
            a: {
                b: 1
            }
        }));
        
        assert.deepEqual({
            b: {
                c: 1
            }
        }, rosettron({
            a: {
                b: "..b.c"
            }
        }, {
            a: {
                b: 1
            }
        }));
    });
    
    it("should handle regex keys", function() {
        assert.deepEqual({
            c1a: 1
        }, rosettron({
            "/[a-z]+?(c[0-9]a)/": "$1"
        }, {
            abc1a: 1
        }));
        
        assert.deepEqual({
            c1ab: 1
        }, rosettron({
            "/[a-z]+?(c[0-9]a)/": "$1b"
        }, {
            abc1a: 1
        }));
    });
    
    it("should handle array identity maps", function() {
        assert.deepEqual([1, 2, 3], rosettron(["%"], [1, 2, 3]));
        assert.deepEqual([1, 2, 3], rosettron(["%0"], [1, 2, 3]));
    });
    
    it("should handle arrays in objects", function() {
        assert.deepEqual({
            a: [1, 2, 3]
        }, rosettron({
            a: ["%"]
        }, {
            a: [1, 2, 3]
        }));
    });
    
    it("should handle using iteration count in keys", function() {
        assert.deepEqual({
            a0: 1,
            a1: 2,
            a2: 3
        }, rosettron({
            a: ["..a%"]
        }, {
            a: [1, 2, 3]
        }))
    });
    
    it("should handle arrays in objects with elevators", function() {
        assert.deepEqual({
            someOtherStuff: [1, 2, 3]
        }, rosettron({
            someStuff: ["..someOtherStuff.%"]
        }, {
            someStuff: [1, 2, 3]
        }));
    });
    
    it("should handle objects in arrays", function() {
        assert.deepEqual([{b: 1}, {b: 2}, {b: 3}], rosettron([{a: "b"}], [{a: 1}, {a: 2}, {a: 3}]));
    });
    
    it("should handle objects in arrays in objects with elevators", function() {
        assert.deepEqual({
            someOtherStuff: [{b: 1}, {b: 2}, {b: 3}]
        }, rosettron({
            someStuff: [{a: "....someOtherStuff.%.b"}]
        }, {
            someStuff: [{a: 1}, {a: 2}, {a: 3}]
        }));
    });
    
    it("should handle nested arrays", function() {
        assert.deepEqual([[1, 2], [3, 4], [5, 6]], rosettron([["%"]], [[1, 2], [3, 4], [5, 6]]));
    });
    
    it("should handle sequential iterator wildcard characters", function() {
        assert.deepEqual({
            a00: 1,
            a10: 2,
            a01: 3,
            a11: 4,
            a21: 5
        }, rosettron({
            a: [["....a%%0"]]
        }, {
            a: [[1, 2], [3, 4, 5]]
        }))
    });
    
    it("should handle multiple iterator wildcards", function() {
        assert.deepEqual({
            a00: 1,
            a01: 2,
            a10: 3,
            a11: 4,
            a20: 5,
            a21: 6,
            a22: 7
        }, rosettron({
            a: [{
                b: ["......a%0%1"]
            }]
        }, {
            a: [{
                b: [1, 2]
            }, {
                b: [3, 4]
            }, {
                b: [5, 6, 7]
            }]
        }));
        
        assert.deepEqual({
            a0: [1, 2],
            a1: [3, 4],
            a2: [5, 6],
        }, rosettron({
            a: [{
                b: ["......a%0.%1"]
            }]
        }, {
            a: [{
                b: [1, 2]
            }, {
                b: [3, 4]
            }, {
                b: [5, 6]
            }]
        }));
    });
    
    it("should handle function key-value mappers", function() {
        assert.deepEqual({
            b: 3
        }, rosettron({
            a: "f()"
        }, {
            a: 2
        }, {
            f(key, value) {
                return {
                    key: "b",
                    value: value + 1
                };
            }
        }));
    });
    
    it("should handle key mappers", function() {
        assert.deepEqual({
            b: 2
        }, rosettron({
            a: "f()"
        }, {
            a: 2
        }, {
            f(key, value) {
                return {
                    key: "b"
                };
            }
        }));
    });
    
    it("should handle function key-value mappers that return complex keys", function() {
        assert.deepEqual({
            b: 3
        }, rosettron({
            a: {
                c: "f()"
            }
        }, {
            a: {
                c: 2
            }
        }, {
            f(key, value) {
                return {
                    key: "..b",
                    value: value + 1
                };
            }
        }));
        
        assert.deepEqual({
            a: [{a0: 0}, {a1: 1}, {a2: 2}]
        }, rosettron({
            a: [{
                a: "f()"
            }]
        }, {
            a: [{a: 1}, {a: 2}, {a: 3}]
        }, {
            f(key, value) {
                return {
                    key: "a%",
                    value: value - 1
                };
            }
        }));
    });
    
    it("should handle key-value mappers in arrays", function() {
        assert.deepEqual({
            a: [0, 1, 2]
        }, rosettron({
            a: ["f()"]
        }, {
            a: [1, 2, 3]
        }, {
            f(key, value) {
                return {
                    key: "%",
                    value: value - 1
                };
            }
        }));
        
        assert.deepEqual({
            a0: 0,
            a1: 1,
            a2: 2
        }, rosettron({
            a: ["f()"]
        }, {
            a: [1, 2, 3]
        }, {
            f(key, value) {
                return {
                    key: "..a%",
                    value: value - 1
                };
            }
        }));
    });
    
    it("should handle function matchers", function() {
        assert.deepEqual({
            ab: 0,
            a1: 2,
            ac: 5
        }, rosettron({
            "f()": "g()"
        }, {
            ab: 0,
            b: 1,
            a1: 2,
            df: 3,
            gdf: 4,
            ac: 5
        }, {
            f(key) {
                return [key[0] === "a"]
            },
            g(key) {
                return {
                    key: key
                };
            }
        }))
    });
});
