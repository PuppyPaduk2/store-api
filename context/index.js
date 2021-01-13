const contextStack = [];

function createContext() {
  const context = function (callback) {
    contextStack.unshift(context);

    const result = callback();

    contextStack.shift();

    return result;
  };

  context.stores = {};

  context.unions = {};

  context.addStore = (payload) => {
    if (context.stores[payload.name]) {
      if (context.stores[payload.name].api !== payload.api) {
        throw new Error("Store use other api");
      } else {
        return context.stores[payload.name].publicApi;
      }
    }

    if (context.stores[payload.name] === undefined) {
      context.stores[payload.name] = {
        api: payload.api,
        init: payload.init,
        state: payload.init,
      };
    }

    const listeners = {
      subscribers: new Set(),
      use: {},
    };

    context.stores[payload.name].listeners = listeners;

    const getState = () => {
      return context.getStoreState({ name: payload.name });
    };

    const publicApi = {
      name: payload.name,
      use: {},
      listen: {
        on: (callback) => {
          listeners.subscribers.add(callback);
        },
        off: (callback) => {
          listeners.subscribers.delete(callback);
        },
      },
      getState,
    };

    const wrapperApi = payload.api({
      getState,
      setState: (state) => {
        context.setStoreState({ name: payload.name, state });
      },
    });
    const wrapperApiKeys = Object.keys(wrapperApi);

    for (let index = 0; index < wrapperApiKeys.length; index += 1) {
      const apiKey = wrapperApiKeys[index];

      listeners.use[apiKey] = {
        before: new Set(),
        after: new Set(),
      };

      publicApi.use[apiKey] = function (...params) {
        listeners.use[apiKey].before.forEach((listener) =>
          listener({ params })
        );

        const result = wrapperApi[apiKey](...params);

        listeners.use[apiKey].after.forEach((listener) =>
          listener({ params, result })
        );

        return result;
      };

      publicApi.use[apiKey].on = {
        before: (callback) => {
          listeners.use[apiKey].before.add(callback);
        },
        after: (callback) => {
          listeners.use[apiKey].after.add(callback);
        },
      };

      publicApi.use[apiKey].off = {
        before: (callback) => {
          listeners.use[apiKey].before.delete(callback);
        },
        after: (callback) => {
          listeners.use[apiKey].after.delete(callback);
        },
      };
    }

    context.stores[payload.name].publicApi = publicApi;

    return context.stores[payload.name].publicApi;
  };

  context.setStoreState = (payload) => {
    const store = context.stores[payload.name];

    if (store === undefined) {
      throw new Error("Store doesn't exist");
    }

    store.state = payload.state;

    store.listeners.subscribers.forEach((listener) => listener(store.state));
  };

  context.getStoreState = (payload) => {
    const store = context.stores[payload.name];

    if (store === undefined) {
      throw new Error("Store doesn't exist");
    }

    return store.state;
  };

  context.addUnion = (payload) => {
    if (context.unions[payload.name]) {
      if (context.unions[payload.name].api !== payload.api) {
        throw new Error("Union use other api");
      } else {
        return context.unions[payload.name].publicApi;
      }
    }

    const listeners = {
      subscribers: new Set(),
    };

    context.unions[payload.name] = {
      depends: payload.depends,
      init: payload.init,
      listeners,
    };

    const publicApi = {
      name: payload.name,
      depends: payload.depends,
      listen: {
        on: (callback) => {
          listeners.subscribers.add(callback);
        },
        off: (callback) => {
          listeners.subscribers.delete(callback);
        },
      },
      getState: () => {
        return context.getUnionState({ name: payload.name });
      },
    };

    const dependKeys = Object.keys(payload.depends);

    for (let index = 0; index < dependKeys.length; index += 1) {
      const dependKey = dependKeys[index];
      const depend = payload.depends[dependKey];

      depend.listen.on(() => {
        const unionState = publicApi.getState();

        context.unions[payload.name].listeners.subscribers.forEach((listener) =>
          listener(unionState)
        );
      });
    }

    context.unions[payload.name].publicApi = publicApi;

    return publicApi;
  };

  context.getUnionState = (payload) => {
    const union = context.unions[payload.name];

    if (union === undefined) {
      throw new Error("Union doesn't exist");
    }

    const keys = Object.keys(union.depends);
    const result = {};

    for (let index = 0; index < keys.length; index += 1) {
      const key = keys[index];

      result[key] = union.depends[key].getState();
    }

    return result;
  };

  return context;
}

contextStack.unshift(createContext());

module.exports = { contextStack, createContext };
