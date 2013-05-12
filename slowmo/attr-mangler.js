define(function() {
  function propertyAsString(node) {
    if ((!node.computed && node.property.type == 'Identifier'))
      return JSON.stringify(node.property.source());
    return node.property.source();
  }
  
  return function AttrMangler(node) {
    if (node.type == 'CallExpression' &&
        node.callee.type == 'MemberExpression') {
      var callArgs = node.arguments.map(function(arg) {
        return arg.source();
      }).join(', ');
      node.update('attr.call(' + node.callee.object.source() + ', ' +
                  propertyAsString(node.callee) + ', ' +
                  '[' + callArgs + '], ' + 
                  JSON.stringify(node.range) + ')');
    }
    if (node.type == 'AssignmentExpression' &&
        node.left.type == 'MemberExpression')
      node.update('attr.assign(' + node.left.object.source() + ', ' +
                  propertyAsString(node.left) + ', ' +
                  JSON.stringify(node.operator) + ', ' +
                  node.right.source() + ', ' +
                  JSON.stringify(node.range) + ')');
    if (node.type == 'UpdateExpression' &&
        node.argument.type == 'MemberExpression')
      node.update('attr.update(' + node.argument.object.source() + ', ' +
                  propertyAsString(node.argument) + ', ' +
                  JSON.stringify(node.operator) + ', ' +
                  node.prefix + ', ' +
                  JSON.stringify(node.range) + ')');
    if (node.type == 'MemberExpression') {
      if (node.parent.type == 'CallExpression' &&
          node.parent.callee === node)
        return;
      if (node.parent.type == 'AssignmentExpression' &&
          node.parent.left ===  node)
        return;
      if (node.parent.type == 'UpdateExpression' &&
          node.parent.argument ===  node)
        return;
      node.update('attr.get(' + node.object.source() + ', ' +
                  propertyAsString(node) + ', ' + 
                  JSON.stringify(node.range) + ')');
    }
  };
});
