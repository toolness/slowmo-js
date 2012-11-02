defineTests([
  "falafel",
  "slowmo/attr-mangler"
], function(falafel, AttrMangler) {
  var code, log, rangeLog;
  var attr = {
    get: function(obj, prop, range) {
      log.push(["get", obj, prop]);
      rangeLog.push(code.slice.apply(code, range));
      return obj[prop];
    },
    update: function(obj, prop, operator, prefix, range) {
      log.push(["update", obj, prop, operator, prefix]);
      rangeLog.push(code.slice.apply(code, range));
      return obj[prop] + 1;
    },
    assign: function(obj, prop, operator, value, range) {
      log.push(["assign", obj, prop, operator, value]);
      rangeLog.push(code.slice.apply(code, range));
      return value;
    }
  };
  
  module("attr-mangler", {
    setup: function() {
      log = [];
      rangeLog = [];
    }
  });

  test("get works w/ computed properties", function() {
    var a = {b: "value"};
    var foo = "b";
    code = "a[foo];";
    var mangled = falafel(code, AttrMangler).toString();
    equal(eval(mangled), "value");
    deepEqual(log, [["get", a, foo]]);
    deepEqual(rangeLog, ['a[foo]']);
  });
  
  test("get works w/ non-computed properties", function() {
    var a = {b: "value"};
    code = "a.b;";
    var mangled = falafel(code, AttrMangler).toString();
    equal(eval(mangled), "value");
    deepEqual(log, [["get", a, "b"]]);
    deepEqual(rangeLog, ['a.b']);
  });

  test("update works w/ computed properties", function() {
    var a = {b: 5};
    var foo = "b";
    code = "++a[foo];";
    var mangled = falafel(code, AttrMangler).toString();
    equal(eval(mangled), 6);
    deepEqual(log, [["update", a, foo, "++", true]]);
    deepEqual(rangeLog, ['++a[foo]']);
  });
  
  test("update works w/ non-computed properties", function() {
    var a = {b: 5};
    code = "++a.b;";
    var mangled = falafel(code, AttrMangler).toString();
    equal(eval(mangled), 6);
    deepEqual(log, [["update", a, "b", "++", true]]);
    deepEqual(rangeLog, ['++a.b']);
  });

  test("assignment works w/ computed properties", function() {
    var a = {};
    code = "a['b'] = 3;";
    var mangled = falafel(code, AttrMangler).toString();
    equal(eval(mangled), 3);
    deepEqual(log, [["assign", a, "b", "=", 3]]);
    deepEqual(rangeLog, ["a['b'] = 3"]);
  });
  
  test("assignment works w/ non-computed properties", function() {
    var a = {};
    code = "a.b = 3;";
    var mangled = falafel(code, AttrMangler).toString();
    equal(eval(mangled), 3);
    deepEqual(log, [["assign", a, "b", "=", 3]]);
    deepEqual(rangeLog, ["a.b = 3"]);
  });
});
