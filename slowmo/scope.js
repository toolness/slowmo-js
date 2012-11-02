define(function() {
  function noVariableError(name) {
    var err = new Error("no variable called " + name);
    err.range = arguments[arguments.length - 1];
    throw err;
  }

  var nullScope = {
    assign: noVariableError,
    update: noVariableError,
    get: noVariableError,
    log: function() {}
  };
  
  function Scope(prev, name, range, log) {
    this.prev = prev || nullScope;
    this.name = name;
    this.log = log || this.prev.log;
    this.vars = {};
    this.range = range;
    this.declRanges = {};
    this.log("enter");
  }

  Scope.prototype = {
    assign: function(name, operator, value, range) {
      if (name in this.vars) {
        var oldValue = this.vars[name];
        eval("this.vars[name] " + operator + " value");
        this.log("assign", name, operator, value, oldValue, range);
        return this.vars[name];
      }
      return this.prev.assign(name, operator, value, range);
    },
    update: function(name, operator, prefix, range) {
      if (name in this.vars) {
        var oldValue = this.vars[name];
        eval("this.vars[name]" + operator);
        this.log("update", name, operator, prefix, oldValue, range);
        return prefix ? this.vars[name] : oldValue;
      }
      return this.prev.update(name, operator, prefix, range);
    },
    declare: function(name, value, range) {
      this.vars[name] = value;
      this.declRanges[name] = range;
      this.log("declare", name, value, range);
      return value;
    },
    get: function(name, range) {
      if (name in this.vars) {
        this.log("get", name, this.vars[name], range);
        return this.vars[name];
      }
      return this.prev.get(name, range);
    },
    leave: function() {
      this.log("leave");
    }
  };

  Scope.logToConsole = function() {
    var args = ["SCOPE:" + this.name];
    args = args.concat(Array.prototype.slice.call(arguments));
    if (window.console)
      console.log.apply(console, args);
  };
  
  return Scope;
});
