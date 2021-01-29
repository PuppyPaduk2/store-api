const _stack = {
  stack: [],
  current: null,
  add: (context) => {
    _stack.stack.unshift(context);
    _stack.current = _stack.stack[0];
  },
  remove: (context) => {
    if (context === _stack.current) {
      _stack.stack.shift();
      _stack.current = _stack.stack[0];
      return;
    }

    throw new Error("Remove context from stack resolve with error. Selected context isn't current.");
  },
};

function getStack() {
  return _stack;
}

module.exports = { getStack };
