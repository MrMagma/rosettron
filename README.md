# Rosettron

## About

Rosettron is a small utility that lets you use data to translate other data from one schema to another. Sound boring? Great! It is, but it can be useful.

## Examples

### Basic

```
let rosettron = require("rosettron");

let data = {
    something: "Woot",
    somethingElse: "Yay"
};

let rules = {
    something: "exclamation1",
    somethingElse: "exclamation2"
};

let translatedData = rosettron(rules, data);

console.log(translatedData);
```

Output

```
{
   exclamation1: "Woot",
   exclamation2: "Yay" 
}
```

### Arrays

```
let rosettron = require("rosettron");

let data = {
    people: [{name: "Jim", employer: "Dunder Mifflin"}, {name: "Leslie Knope", employer: "City of Pawnee"}, {name: "Pam", employer: "Dunder Mifflin"}, {name: "Iron Man", employer: "Avengers"}]
};

let rules = {people: [{employer: "....employers.%"}]};

let translatedData = rosettron(rules, data);

console.log(translatedData);
```

Output

```
{
    employers: ["Dunder Mifflin", "City of Pawnee", "Dunder Mifflin", "Avengers"]
}
```

### Regular Expressions

```
let rosettron = require("rosettron");

let data = {
    acb: 1,
    alkjsdakjb: 2,
    bldjk: 3
};

let rules = {
    "/a(.+)b/": "$1"
};

let translatedData = rosettron(rules, data);

console.log(translatedData);
```

Output

```
{
   c: 1,
   lkjsdakj: 2
}
```

## Using

To use rosettron, run `npm install rosettron` and then use `require("rosettron")` to import it where needed.

## Contributing

Contributions are encouraged and appreciated, whether they be suggesting a feature, fixing an issue, or--heaven forbid--reporting one. 

If you're reporting a bug, please be specific. what code did you run to produce the bug? What behavior did you expect and what did you get? If there was an error message, what did it say?

If you're submitting a pull request, please include tests. If you're fixing a bug, add tests to make sure no one else accidentally resurrects the bug. If you're adding a feature, test for everything you can think of, even if you think no one would ever abuse your code like that.
