const { createContext, contextStack } = require("../core/context");

function context() {
  const context = createContext();

  function contextScope(callback) {
    return context.scope(callback);
  }

  return contextScope;
}

function getContextState(contextScope) {
  const scope = contextScope || contextStack[0].scope;
  let state = {
    stores: {},
    unions: {},
  };

  scope(() => {
    const currentContext = contextStack[0];

    const storeKeys = Object.keys(currentContext.stores);

    for (let index = 0; index < storeKeys.length; index += 1) {
      const storeKey = storeKeys[index];
      const store = currentContext.stores[storeKey];

      state.stores[storeKey] = store.public;
    }

    const unionKeys = Object.keys(currentContext.unions);

    for (let index = 0; index < unionKeys.length; index += 1) {
      const unionKey = unionKeys[index];
      const union = currentContext.unions[unionKey];

      state.unions[unionKey] = union.public;
    }
  });

  return state;
}

module.exports = { context, getContextState };
