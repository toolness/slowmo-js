defineTests([
  "falafel",
  "slowmo/scope-mangler",
  "slowmo/scope"
], function(falafel, ScopeMangler, Scope) {
  module("scope");

  function scopeTest(options) {
    var code = options.code;
    var result = options.result;

    if (Array.isArray(code))
      code = code.join('\n');

    return function() {
      var mangled = falafel(code, ScopeMangler).toString();
      var scope = new Scope(null, "GLOBAL");

      equal(eval(mangled), options.result,
            "eval of " + JSON.stringify(code) + " should be " +
            JSON.stringify(result));
    }
  }

  test("for loops should work", scopeTest({
    code: 'var a = ""; for (var v = 0; v < 3; v++) { a += v; } a',
    result: "012"
  }));

  test("'this' should work in for-each loops", scopeTest({
    code: [
      'var obj = {a: ""};',
      '(function() { for (var v in [1,2,3]) { this.a += v; } }).call(obj);',
      'obj.a'
    ],
    result: "012"
  }));
  
  test("for-each loops w/ var decls in left should work", scopeTest({
    code: 'var a = ""; for (var v in [1,2,3]) { a+= v; } a',
    result: "012"
  }));

  test("for-each loops should work", scopeTest({
    code: 'var v, a = ""; for (v in [1,2,3]) { a+= v; } a',
    result: "012"
  }));

  test("typeof should work with undeclared vars", scopeTest({
    code: "typeof foo",
    result: "undefined"
  }));

  test("arguments.callee should work", scopeTest({
    code: ["(function(i) {",
           "  return i < 3 ? i : i * arguments.callee(i - 1)",
           "})(4)"],
    result: 24
  }));

  test("recursive function expressions should work", scopeTest({
    code: ["(function fac(i) {",
           "  return i < 3 ? i : i * fac(i - 1)",
           "})(4)"],
    result: 24
  }));
});
