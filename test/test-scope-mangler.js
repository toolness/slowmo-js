defineTests([
  "falafel",
  "slowmo/scope-mangler"
], function(falafel, ScopeMangler) {
  module("scope-mangler");

  function declTest(code, expectedDecls) {
    var decls = [];
    var scope = {
      declare: function(name, value, range) {
        var slice = code.slice.apply(code, range);
        decls.push([name, value, slice]);
      }
    };
    var Scope = function(prev, name, range) { 
      equal(typeof(name), "string", "scope name is string: " + name);
      ok(Array.isArray(range) && range.length == 2,
         "range is passed to scope constructor");
      return scope;
    };
    var mangled = falafel(code, ScopeMangler).toString();
    var retval = eval(mangled);
    deepEqual(retval, undefined, "var decls always return undefined");
    if (typeof(expectedDecls) == "function")
      return expectedDecls(decls);
    deepEqual(decls, expectedDecls,
              "var declarations are as expected for " + code);
  }

  function isUnchanged(code) {
    var mangled = falafel(code, ScopeMangler).toString();
    equal(code, mangled, "mangled code is same as original");
    eval(mangled);
    ok(true, "evals w/o throwing");
  }

  test("function decls are converted to var decls", function() {
    declTest("function foo(x) {}", function(decls) {
      equal(decls.length, 1);
      equal(decls[0][0], "foo");
      equal(typeof decls[0][1], "function");
      equal(decls[0][2], "function foo(x) {}");
    });
  });
  
  test("function args are converted to decls", function() {
    declTest("(function(x) {})(1);", [["x", 1, "x"]]);
    declTest("(function(x) {})();", [["x", undefined, "x"]]);
  });
  
  test("var decls w/ initializers work", function() {
    declTest("var i = 1;", [["i", 1, "i = 1"]]);
  });
  
  test("var decls w/o initializers work", function() {
    declTest("var i;", [["i", undefined, "i"]]);
  });
  
  test("var decls w/ commas work", function() {
    declTest("var i, j = 2;", [["i", undefined, "i"], ["j", 2, "j = 2"]]);
  });

  test("multiple var decls work", function() {
    declTest("var i; var j = 2;",
             [["i", undefined, "i"], ["j", 2, "j = 2"]]);
  });
  
  test("property names in object literals stay intact", function() {
    isUnchanged("({x: 3});");
  });
  
  test("property names in member expressions stay intact", function() {
    isUnchanged('"blarg".length;');
  });

  test("update expressions work", function() {
    var code = "a++;";
    var expectedUpdates = [["a", "++", false, "a++"]];
    var expectedRetval = 50;
    
    var updates = [];
    var scope = {
      update: function(name, operator, prefix, range) {
        var slice = code.slice.apply(code, range);
        updates.push([name, operator, prefix, slice]);
        return expectedRetval;
      }
    };
    var mangled = falafel(code, ScopeMangler).toString();
    deepEqual(eval(mangled), expectedRetval,
              "return value of " + code + " is " + expectedRetval);
    deepEqual(updates, expectedUpdates,
              "updates are as expected for " + code);
  });
  
  test("assignment expressions work", function() {
    var code = "a = 50;";
    var expectedAssignments = [["a", "=", 50, "a = 50"]];
    var expectedRetval = 50;
    
    var assignments = [];
    var scope = {
      assign: function(name, operator, value, range) {
        var slice = code.slice.apply(code, range);
        assignments.push([name, operator, value, slice]);
        return value;
      }
    };
    var mangled = falafel(code, ScopeMangler).toString();
    deepEqual(eval(mangled), expectedRetval,
              "return value of " + code + " is " + expectedRetval);
    deepEqual(assignments, expectedAssignments,
              "assignments are as expected for " + code);
  });
  
  test("scopes are chained", function() {
    var code = "(function foo() { return (function bar() {})() })()";
    var scopes = [];
    var Scope = function Scope(prev, name, range) {
      scopes.push({
        previous: prev && prev.name,
        name: name,
        code: code.slice.apply(code, range)
      });
      return {name: name};
    };
    var scope = Scope(null, "GLOBAL", [0, code.length]);
    var mangled = falafel(code, ScopeMangler).toString();
    eval(mangled);
    deepEqual(scopes, [
      {
        "name": "GLOBAL",
        "previous": null,
        "code": code
      },
      {
        "name": "foo",
        "previous": "GLOBAL",
        "code": "function foo() { return (function bar() {})() }"
      },
      {
        "name": "bar",
        "previous": "foo",
        "code": "function bar() {}"
      }
    ]);
  });
});
