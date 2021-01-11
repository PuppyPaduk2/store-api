function createContext() {
  const context = {
    stores: {},
    addStore: (payload) => {
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
          state: payload.init,
        };
      }

      const listeners = {
        subscribers: new Set(),
        use: {},
      };

      context.stores[payload.name].listeners = listeners;

      const publicApi = {
        use: {},
        on: (callback) => {
          listeners.subscribers.add(callback);
        },
        off: (callback) => {
          listeners.subscribers.delete(callback);
        },
      };

      const wrapperApi = payload.api({
        getState: () => {
          return context.getStoreState({ name: payload.name });
        },
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
    },
    setStoreState: (payload) => {
      const store = context.stores[payload.name];

      if (store === undefined) {
        throw new Error("Store doesn't exist");
      }

      store.state = payload.state;

      store.listeners.subscribers.forEach((listener) => listener(store.state));
    },
    getStoreState: (payload) => {
      const store = context.stores[payload.name];

      if (store === undefined) {
        throw new Error("Store doesn't exist");
      }

      return store.state;
    },
  };

  return context;
}

module.exports = { createContext };
