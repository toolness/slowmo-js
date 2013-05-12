define(function(require, module, exports) {
  function range(node) {
    if (!node) return "null";
    return JSON.stringify(node.range);
  }
  
  function makeDeclareCode(name, value, node) {
    if (value === null)
      value = "undefined";
    if (value && typeof(value) == "object")
      value = value.source();
    return 'scope.declare(' + JSON.stringify(name) + ', ' + value + ', ' +
           range(node) + ')';
  }

  function convertFunctionExpression(node) {
    var preamble = [makeDeclareCode("arguments", "arguments", null)];
    for (var i = 0; i < node.params.length; i++) {
      preamble.push(makeDeclareCode(node.params[i].name,
                                    "arguments[" + i + "]",
                                    node.params[i]));
    }
    var name = node.id && node.id.name || '';
    if (name) {
      preamble.push(makeDeclareCode(name, name, node));
    } else {
      if (node.parent.type == "VariableDeclarator")
        name = node.parent.id.name;
      if (node.parent.type == "Property" &&
          node.parent.key.type == "Identifier")
        name = node.parent.key.name;
    }
    return "(function(prevScope) { return function " + 
           name + "() { " + 
           "var scope = new Scope(prevScope, " + 
           JSON.stringify(name) + ", " + range(node) + ");" +
           preamble.join(';') + '; try { ' +
           node.body.source().slice(1, -1) + "; } " +
           "finally { scope.leave(); } }})(scope)";
  }

  return function ScopeMangler(node) {
    if (node.type == 'VariableDeclaration') {
      var decls = [];
      node.declarations.forEach(function(decl) {
        decls.push(makeDeclareCode(decl.id.name, decl.init, decl));
      });

      var parentIsFor = node.parent.type === "ForStatement";
      var separator = parentIsFor ? " || " : " ; ";
      var newCode = decls.join(separator);
      if (!parentIsFor)
        newCode += ';'
      return node.update(newCode);
    }

    if (node.type == "AssignmentExpression") {
      if (node.left.type == "Identifier") {
        return node.update('scope.assign(' + JSON.stringify(node.left.name) +
                           ', ' + JSON.stringify(node.operator) + ', ' +
                           node.right.source() + ', ' + range(node) + ')');
      }
    }
  
    if (node.type == "UpdateExpression") {
      if (node.argument.type == "Identifier") {
        return node.update("scope.update(" + 
                           JSON.stringify(node.argument.name) +
                           ", " + JSON.stringify(node.operator) + ", " +
                           node.prefix + ", " + range(node) + ")");
      }
    }
  
    if (node.type == "FunctionDeclaration") {
      node.update("scope.declare(" + JSON.stringify(node.id.name) + ", " +
                  convertFunctionExpression(node) + ", " +
                  range(node) + ");");
      return;
    }
  
    if (node.type == "FunctionExpression") {
      return node.update(convertFunctionExpression(node));
    }
  
    if (node.type == "UnaryExpression" &&
        node.operator == "typeof" &&
        node.argument.type == "Identifier")
      return node.update("scope.getTypeOf(" +
                         JSON.stringify(node.argument.name) + ", " +
                         range(node) + ")");

    if (node.type == "Identifier") {
      if (node.parent.type == "UnaryExpression" &&
          node.parent.operator == "typeof")
        return;

      if (node.parent.type == "FunctionDeclaration" ||
          node.parent.type == "FunctionExpression")
        return;
      if (node.parent.type == "Property" &&
          node.parent.key === node) {
        return;
      }
      if (node.parent.type == "VariableDeclarator" &&
          node.parent.id === node) {
        return;
      }
      if (node.parent.type == "MemberExpression" &&
          node.parent.computed == false &&
          node.parent.object !== node) {
        return;
      }
      node.update('(scope.get(' + JSON.stringify(node.name) + ', ' +
                  range(node) + '))');
    }
  };
});
