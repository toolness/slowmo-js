defineTests([
  "falafel",
  "slowmo/attr-mangler"
], function(falafel, AttrMangler) {
  var log;
  var attr = {
    get: function(obj, prop) {
      log.push(["get", obj, prop]);
      return obj[prop];
    },
    update: function(obj, prop, operator, prefix) {
      log.push(["update", obj, prop, operator, prefix]);
      return obj[prop] + 1;
    },
    assign: function(obj, prop, operator, value) {
      log.push(["assign", obj, prop, operator, value]);
      return value;
    }
  };
  
  module("attr-mangler", {
    setup: function() {
      log = [];
    }
  });

  test("get works w/ computed properties", function() {
    var a = {b: "value"};
    var foo = "b";
    var code = "a[foo];";
    var mangled = falafel(code, AttrMangler).toString();
    equal(eval(mangled), "value");
    deepEqual(log, [["get", a, foo]]);
  });
  
  test("get works w/ non-computed properties", function() {
    var a = {b: "value"};
    var code = "a.b;";
    var mangled = falafel(code, AttrMangler).toString();
    equal(eval(mangled), "value");
    deepEqual(log, [["get", a, "b"]]);
  });

  test("update works w/ computed properties", function() {
    var a = {b: 5};
    var foo = "b";
    var code = "++a[foo];";
    var mangled = falafel(code, AttrMangler).toString();
    equal(eval(mangled), 6);
    deepEqual(log, [["update", a, foo, "++", true]]);
  });
  
  test("update works w/ non-computed properties", function() {
    var a = {b: 5};
    var code = "++a.b;";
    var mangled = falafel(code, AttrMangler).toString();
    equal(eval(mangled), 6);
    deepEqual(log, [["update", a, "b", "++", true]]);
  });

  test("assignment works w/ computed properties", function() {
    var a = {};
    var code = "a['b'] = 3;";
    var mangled = falafel(code, AttrMangler).toString();
    equal(eval(mangled), 3);
    deepEqual(log, [["assign", a, "b", "=", 3]]);
  });
  
  test("assignment works w/ non-computed properties", function() {
    var a = {};
    var code = "a.b = 3;";
    var mangled = falafel(code, AttrMangler).toString();
    equal(eval(mangled), 3);
    deepEqual(log, [["assign", a, "b", "=", 3]]);
  });
});
