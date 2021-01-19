const { createContext, contextStack } = require("../core/context");

function context() {
  const context = createContext();

  function contextScope(callback) {
    return context.scope(callback);
  }

  return contextScope;
}

function getRootContextScope() {
  return contextStack[0].scope;
}

function getCurrectContext(contextScope) {
  const scope = contextScope || contextStack[0].scope;
  let currentContext;

  scope(() => {
    currentContext = contextStack[0];
  });

  if (Boolean(currentContext) === false) {
    throw new Error("Error getting current context.");
  }

  return currentContext;
}

function getContextState(contextScope) {
  const currentContext = getCurrectContext(contextScope);
  let state = {
    stores: {},
    unions: {},
  };

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

  return state;
}

function serializeContext(contextScope) {
  return getCurrectContext(contextScope).serialize();
}

function deserializeContext(serializedContext, constexScope) {
  getCurrectContext(constexScope).deserialize(serializedContext);
}

module.exports = {
  context,
  getRootContextScope,
  getContextState,
  serializeContext,
  deserializeContext,
};
