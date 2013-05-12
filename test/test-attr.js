defineTests([
  "falafel",
  "slowmo/attr-mangler",
  "slowmo/attr"
], function(falafel, AttrMangler, Attr) {
  module("attr");

  function attrTest(options) {
    var code = options.code;
    var result = options.result;

    if (Array.isArray(code))
      code = code.join('\n');

    return function() {
      var mangled = falafel(code, AttrMangler).toString();
      var attr = new Attr(function log() {});

      deepEqual(eval(mangled), options.result,
                "eval of " + JSON.stringify(code) + " should be " +
                JSON.stringify(result));
    }
  }

  test("array prototype methods should work", attrTest({
    code: "[1,2,3].map(function(n) { return 'hi' + n; });",
    result: ['hi1', 'hi2', 'hi3']
  }));
});
