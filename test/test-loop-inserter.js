defineTests([
  "falafel",
  "slowmo/loop-inserter"
], function(falafel, LoopInserter) {
  module("loop-inserter");

  function testLoop(code) {
    var checkCalled = 0;
    var check = function() {
      checkCalled++;
    };
    var mangled = falafel(code, LoopInserter("check")).toString();

    eval(mangled);
    equal(checkCalled, 3, "check() is called 3 times");
    equal(i, 3, "i is 3");
  }
  
  test("works with for loops", function() {
    testLoop("for (var i = 0; i < 3; i++) {}");
  });

  test("works w/ for loops w/ empty conditions", function() {
    testLoop("for (var i = 0;; i++) { if (i >= 2) { i++; break;} }");
  });
  
  test("works with while loops", function() {
    testLoop("var i = 0; while (i < 3) { i++; }");
  });

  test("works with do..while loops", function() {
    testLoop("var i = 0; do { i++; } while (i < 3)");
  });
  
  test("can take a function w/ node as arg", function() {
    var log = [];
    var logLoop = function(range) {
      log.push(range);
    };
    var code = "/* */ for (var i = 0; i < 1; i++) {}";
    var mangled = falafel(code, LoopInserter(function(node) {
      return "logLoop(" + JSON.stringify(node.range) + ");";
    })).toString();

    eval(mangled);
    deepEqual(log, [[6, 36]]);
  });
});
