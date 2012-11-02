define(function() {
  function Attr(log) {
    this.log = log;
  }
  
  Attr.prototype = {
    get: function(obj, prop, range) {
      this.log("get", obj, prop, range);
      return obj[prop];
    },
    update: function(obj, prop, operator, prefix, range) {
      var oldValue = obj[prop];
      eval('obj[prop]' + operator);
      this.log("update", obj, prop, operator, prefix, oldValue, range);
      return prefix ? obj[prop] : oldValue;
    },
    assign: function(obj, prop, operator, value, range) {
      var oldValue = obj[prop];
      eval('obj[prop] ' + operator + ' value')
      this.log("assign", obj, prop, operator, oldValue, range);
      return value;
    }
  };
  
  return Attr;
});
