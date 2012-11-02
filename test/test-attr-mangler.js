defineTests([
  "falafel",
  "slowmo/attr-mangler"
], function(falafel, AttrMangler) {
  module("attr-mangler");

  test("get works", function() {
    var a = {};
    var code = "a.b;";
    var attr = {
      get: function(obj, prop) {
        ok(obj === a, "obj is a");
        equal(prop, "b", "prop is b");
        return "value";
      }
    };
    var mangled = falafel(code, AttrMangler).toString();
    equal(eval(mangled), "value", "return value is passed through");
  });
  
  test("update works", function() {
    var a = {};
    var code = "++a.b;";
    var attr = {
      update: function(obj, prop, operator, prefix) {
        ok(obj === a, "obj is a");
        equal(prop, "b", "prop is b");
        equal(operator, "++", "operator is ++");
        equal(prefix, true, "prefix is true");
        return "new value";
      }
    };
    var mangled = falafel(code, AttrMangler).toString();
    equal(eval(mangled), "new value", "return value is passed through");
  });
  
  test("assignment works", function() {
    var a = {};
    var code = "a.b = 3;";
    var attr = {
      assign: function(obj, prop, operator, value) {
        ok(obj === a, "obj is a");
        equal(prop, "b", "prop is b");
        equal(operator, "=", "operator is =");
        equal(value, 3, "value is 3");
        return "new value";
      }
    };
    var mangled = falafel(code, AttrMangler).toString();
    equal(eval(mangled), "new value", "return value is passed through");
  });
});
