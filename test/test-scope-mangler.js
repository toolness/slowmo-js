defineTests([
  "falafel",
  "slowmo/scope-mangler"
], function(falafel, ScopeMangler) {
  module("scope-mangler");

  function declTest(code, expectedDecls) {
    var decls = [];
    var scope = {
      declare: function(name, value, range) {
        var slice = range ? code.slice.apply(code, range) : null;
        decls.push([name, value, slice]);
      },
      leave: function() {}
    };
    var Scope = function(prev, name, range) { 
      equal(typeof(name), "string", "scope name is string: " + name);
      ok(Array.isArray(range) && range.length == 2,
         "range is passed to scope constructor");
      return scope;
    };
    var mangled = falafel(code, ScopeMangler).toString();
    var retval = eval(mangled);
    if (typeof(expectedDecls) == "function") {
      expectedDecls(decls);
      return retval;
    }
    deepEqual(decls, expectedDecls,
              "var declarations are as expected for " + code);
    return retval;
  }

  function isUnchanged(code) {
    var mangled = falafel(code, ScopeMangler).toString();
    equal(code, mangled, "mangled code is same as original");
    eval(mangled);
    ok(true, "evals w/o throwing");
  }

  test("constructors still work", function() {
    function Thing(x) { this.x = x; }
    Thing.prototype = {
      bleh: 20
    };
    var code = "new Foo(5)";
    var scope = {
      get: function(name, range) {
        return Thing;
      }
    };
    var mangled = falafel(code, ScopeMangler).toString();
    var retval = eval(mangled);
    ok(retval instanceof Thing);
    equal(retval.x, 5);
    equal(retval.bleh, 20);
  });
  
  test("var decls return undefined", function() {
    var retval = declTest("var i = 1;", [["i", 1, "i = 1"]]);
    deepEqual(retval, undefined, "var decls always return undefined");
  });
  
  test("function decls are converted to var decls", function() {
    var retval = declTest("function foo(x) {}\n(1);", function(decls) {
      equal(decls.length, 1);
      equal(decls[0][0], "foo");
      equal(typeof decls[0][1], "function");
      equal(decls[0][2], "function foo(x) {}");
    });
    equal(retval, 1);
  });
  
  test("function args are converted to decls", function() {
    declTest("(function(x) {})(1);", [["arguments", {"0": 1}, null],
                                      ["x", 1, "x"]]);
    declTest("(function(x) {})();", [["arguments", {}, null],
                                     ["x", undefined, "x"]]);
  });
  
  test("function names are part of their scopes", function() {
    declTest("(function foo() {})();", function(expectedDecls) {
      equal(expectedDecls[1][0], "foo", "decl exists");
      equal(expectedDecls[1][2], "foo",
            "decl origin in code should be the function name");
    });
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

  test("var decls w/ commas work with value first", function() {
    declTest("var i = 3, j = 2;", [["i", 3, "i = 3"], ["j", 2, "j = 2"]]);
  });

  test("multiple var decls work", function() {
    declTest("var i; var j = 2;",
             [["i", undefined, "i"], ["j", 2, "j = 2"]]);
  });

  test("var decls w/o semicolons afterwards work", function() {
    declTest("var a = 1\n1+2;", [["a", 1, "a = 1"]]);
  });
  
  test("var decls in for loops work", function() {
    declTest("for (var i = 0; false; i++) {}", [["i", 0, "i = 0"]]);
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
  
  test("typeof works", function() {
    var code = "    typeof foo;";
    var scope = {
      getTypeOf: function(name, range) {
        equal(name, "foo");
        deepEqual(code.slice.apply(code, range), "typeof foo");
        return "superthingy";
      }
    };
    var mangled = falafel(code, ScopeMangler).toString();
    var result = eval(mangled);
    deepEqual(result, "superthingy");
  });

  test("scopes are chained", function() {
    var code = "(function foo() { return (function bar() {})() })()";
    var scopes = [];
    var scopeLeaves = [];
    var Scope = function Scope(prev, name, range) {
      scopes.push({
        previous: prev && prev.name,
        name: name,
        code: code.slice.apply(code, range)
      });
      return {
        name: name,
        declare: function() {},
        leave: function() {
          scopeLeaves.push(name);
        }
      };
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
    deepEqual(scopeLeaves, ["bar", "foo"],
              "scope.leave() is called in expected order");
  });
});
