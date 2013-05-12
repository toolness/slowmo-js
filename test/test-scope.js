defineTests([
  "falafel",
  "slowmo/scope-mangler",
  "slowmo/scope"
], function(falafel, ScopeMangler, Scope) {
  module("scope");

  function scopeTest(options) {
    return function() {
      var mangled = falafel(options.code, ScopeMangler).toString();
      var scope = new Scope(null, "GLOBAL");

      equal(eval(mangled), options.result,
            "eval of " + JSON.stringify(options.code) + " should be " +
            JSON.stringify(options.result));
    }
  }

  test("typeof should work with undeclared vars", scopeTest({
    code: "typeof foo",
    result: "undefined"
  }));
});
