const { getStack } = require("../stack");
const { store } = require("../store");

function contextScope(instance) {
  const stack = getStack();

  const scope = (callback) => {
    let result;
    getStack().add(instance);
    result = callback();
    stack.remove(instance);
    return result;
  };

  return scope;
}

const rootContextInstance = createContext();

getStack().add(rootContextInstance);

function createContext() {
  const instance = {
    storeStates: new Map(),
    stores: new Map(),
    dependStates: new Map(),
    depends: new Map(),
    storeStack: [],
    queueDependHandlers: [],
  };

  return instance;
}

function context() {
  return contextScope(createContext());
}

function rootContext(callback) {
  return contextScope(rootContextInstance)(callback);
}

function createStore({ init, state, api }) {
  const instance = {
    init,
    api,
    state: state === undefined ? init : state,
    listeners: { store: new Set(), api: {} },
    getState: () => {
      return instance.state;
    },
    setState: (state) => {
      const prevState = instance.getState();
      let nextState = prevState;

      if (typeof state === "function") {
        nextState = state(prevState);
      } else {
        nextState = state;
      }

      if (prevState !== nextState) {
        instance.state = nextState;
        instance.listeners.store.forEach((listener) => {
          listener(nextState);
        });
      }

      return nextState;
    },
    reset: () => {
      return instance.setState(instance.init);
    },
    on: (callback) => {
      instance.listeners.store.add(callback);
    },
    off: (callback) => {
      instance.listeners.store.delete(callback);
    },
    wrapperApi: { api: {}, listen: {} },
    originApi: null,
    publicApi: null,
  };

  const apiMehtods = api({
    getState: instance.getState,
    setState: instance.setState,
    reset: instance.reset,
  });
  const apiKeys = Object.keys(apiMehtods);

  for (let index = 0; index < apiKeys.length; index += 1) {
    const apiKey = apiKeys[index];

    instance.listeners.api[apiKey] = { before: new Set(), after: new Set() };
    instance.wrapperApi.api[apiKey] = (...params) => {
      let result;

      instance.listeners.api[apiKey].before.forEach((listener) => {
        listener({ params });
      });
      result = apiMehtods[apiKey](...params);
      instance.listeners.api[apiKey].after.forEach((listener) => {
        listener({ params, result });
      });

      return result;
    }
    instance.wrapperApi.listen[apiKey] = {
      before: {
        on: (callback) => {
          instance.listeners.api[apiKey].before.add(callback);
        },
        off: (callback) => {
          instance.listeners.api[apiKey].before.delete(callback);
        },
      },
      after: {
        on: (callback) => {
          instance.listeners.api[apiKey].after.add(callback);
        },
        off: (callback) => {
          instance.listeners.api[apiKey].after.delete(callback);
        },
      },
    };
  }

  instance.publicApi = {
    getState: instance.getState,
    on: instance.on,
    off: instance.off,
    api: instance.wrapperApi.api,
    listen: instance.wrapperApi.listen,
  };

  return instance;
}

function attachStore(name, storeApi, state) {
  const currentContext = getStack().current;
  let store = currentContext.stores.get(name);

  if (store === undefined) {
    const storeState = currentContext.storeStates.get(name);

    store = storeApi((config) => createStore({
      init: config.init,
      api: config.api,
      state: storeState === undefined ? state : storeState,
    }));
    store.originApi = storeApi;
    currentContext.stores.set(name, store);
    currentContext.storeStack.unshift(store);
    currentContext.depends.forEach((depend, stores) => {
      const currentStoreApi = stores[name];

      if (
        depend.used === false
        && Boolean(currentStoreApi) === true
        && currentStoreApi === storeApi
      ) {
        const storeKeys = Object.keys(stores);
        const dependStores = {};

        depend.used = true;

        for (let index = 0; index < storeKeys.length; index += 1) {
          const storeKey = storeKeys[index];

          dependStores[storeKey] = attachStore(storeKey, stores[storeKey]);
        }

        currentContext.queueDependHandlers.unshift({
          stores: dependStores,
          handler: depend.handler,
        });
      }
    });
    if (currentContext.storeStack.length === 1) {
      currentContext.queueDependHandlers.forEach(({ stores, handler }) => handler(stores));
    }
    currentContext.storeStack.shift();
  }

  if (store.originApi === storeApi) {
    return store.publicApi;
  }

  throw new Error("Store in current context uses other api");
}

function createDepend({ handler, name, state }) {
  let handlerResolve, handlerReject;
  const handlerResult = new Promise((resolve, reject) => {
    handlerResolve = resolve;
    handlerReject = reject;
  });
  const handlerWrapper = async (...args) => {
    try {
      const result = handler(...args);
      handlerResolve(result);
      return result;
    } catch (error) {
      handlerReject(error);
    }
  };
  const instance = {
    used: state === undefined ? false : true,
    handler: handlerWrapper,
    handlerResult: state === undefined ? handlerResult : Promise.resolve(state),
    originApi: null,
    name: name || null,
  };

  return instance;
}

function attachDepend(dependApi) {
  const currentContext = getStack().current;
  const { stores, name } = dependApi((config) => config);
  let depend = currentContext.depends.get(stores);

  if (depend === undefined) {
    const dependState = currentContext.dependStates.get(name);

    depend = dependApi((config) => createDepend({
      handler: config.handler,
      name: config.name,
      state: dependState,
    }));
    depend.originApi = dependApi;
    currentContext.depends.set(stores, depend);
  }

  if (depend.originApi === dependApi) {
    return depend.handlerResult;
  }

  throw new Error("Depend in current context uses other api");
}

async function serializeContext(contextScope) {
  const data = {
    stores: {},
    depends: {},
  };

  await contextScope(async () => {
    const currentContext = getStack().current;

    currentContext.stores.forEach((store, key) => {
      data.stores[key] = store.state;
    });

    const filteredDepends = Array.from(currentContext.depends.values())
      .filter(({ name, used }) => Boolean(name) && used);

    for (let index = 0; index < filteredDepends.length; index += 1) {
      const depend = filteredDepends[index];

      data.depends[depend.name] = await depend.handlerResult;
    }
  });

  return data;
}

function deserializeContext({ context, data }) {
  context(() => {
    const currentContext = getStack().current;
    const dataStoreKeys = Object.keys(data.stores);

    for (let index = 0; index < dataStoreKeys.length; index += 1) {
      const dataStoreKey = dataStoreKeys[index];

      currentContext.storeStates.set(dataStoreKey, data.stores[dataStoreKey]);
    }

    const dataDependKeys = Object.keys(data.depends);

    for (let index = 0; index < dataDependKeys.length; index += 1) {
      const dataDependKey = dataDependKeys[index];

      currentContext.dependStates.set(dataDependKey, data.depends[dataDependKey]);
    }
  });

  return context;
}

module.exports = {
  rootContext,
  context,
  attachStore,
  attachDepend,
  serializeContext,
  deserializeContext,
};
