define(function() {
  function noVariableError(name) {
    throw new Error("no variable called " + name);
  }

  var nullScope = {
    assign: noVariableError,
    update: noVariableError,
    get: noVariableError
  };

  function nullCallback() {}
  
  function Scope(prev, name, range, log) {
    this.prev = prev || nullScope;
    this.name = name;
    this.log = log || nullCallback;
    this.vars = {};
  }

  Scope.prototype = {
    assign: function(name, operator, value) {
      if (name in this.vars) {
        switch (operator) {
          case "=":
          return this.vars[name] = value;

          default:
          throw new Error("unimplemented operator: " + operator);
        }
      }
      return this.prev.assign(name, operator, value);
    },
    update: function(name, operator, prefix) {
      if (name in this.vars) {
        var oldValue = this.vars[name];
        switch (operator) {
          case "++":
          this.vars[name]++; break;

          default:
          throw new Error("unimplemented operator: " + operator);
        }
        return prefix ? this.vars[name] : oldValue;
      }
      return this.prev.update(name, operator, prefix);
    },
    declare: function(name, value) {
      this.vars[name] = value;
      return value;
    },
    get: function(name) {
      if (name in this.vars) {
        this.log("get", name, this.vars[name]);
        return this.vars[name];
      }
      return this.prev.get(name);
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
