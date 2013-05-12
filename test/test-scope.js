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
