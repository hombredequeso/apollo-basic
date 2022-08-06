
const logger = console;

const visitor = {
  enter(node) {
    const logData = {
      ...node,
      loc: undefined
    };
    logger.log('enter', logData);
  },
  leave(node) {
    const logData = {
      ...node,
      loc: undefined
    };
    logger.log('exit', logData);
  }
};


const getFieldListingVisitor = (currentFieldPath, allFieldPaths) => {
  return {
    Field: {
      enter(node) {
        if (node?.name?.kind === 'Name') {
          currentFieldPath.push(node.name.value)
        }
      },
      leave(node) {
        if (node?.name?.kind === 'Name') {
          allFieldPaths.push([...currentFieldPath])
          currentFieldPath.pop();
        }
      }
    }
  }
}

module.exports = {visitor, getFieldListingVisitor};

