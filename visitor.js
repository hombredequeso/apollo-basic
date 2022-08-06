
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

module.exports = {visitor};
