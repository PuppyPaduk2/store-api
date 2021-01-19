const contextStack = [];

function createContext() {
  const context = {
    scope: (callback) => {
      contextStack.unshift(context);

      const result = callback();

      contextStack.shift();

      return result;
    },

    serialize: () => {
      const result = { stores: {} };

      const storeKeys = Object.keys(context.stores);

      for (let index = 0; index < storeKeys.length; index += 1) {
        const storeKey = storeKeys[index];
        const store = context.stores[storeKey];

        result.stores[storeKey] = store.state;
      }

      return result;
    },

    deserialize: (payload) => {
      const storeKeys = Object.keys(payload.stores);

      for (let index = 0; index < storeKeys.length; index += 1) {
        const storeKey = storeKeys[index];

        context.stores[storeKey] = {
          state: payload.stores[storeKey],
        };
      }
    },

    stores: {},

    store: (payload) => {
      if (context.stores[payload.name] && context.stores[payload.name].api) {
        if (context.stores[payload.name].api !== payload.api) {
          throw new Error("Store use other api");
        } else {
          return context.stores[payload.name].public;
        }
      }

      const listeners = {
        store: new Set(),
        methods: {},
      };
      const getState = () => {
        return context.getStoreState({ name: payload.name });
      };
      const setState = (state) => {
        if (typeof state === "function") {
          context.setStoreState({
            name: payload.name,
            state: state(getState()),
          });
        } else {
          context.setStoreState({ name: payload.name, state });
        }
        return state;
      };
      const reset = () => {
        return setState(payload.init);
      };
      const publicApi = {
        api: {},
        on: (callback) => {
          listeners.store.add(callback);
        },
        off: (callback) => {
          listeners.store.delete(callback);
        },
        getState,
      };

      context.stores[payload.name] = {
        init: payload.init,
        state: context.stores[payload.name]
          ? context.stores[payload.name].state || payload.init
          : payload.init,
        api: payload.api,
        listeners,
        public: publicApi,
      };

      const methods = payload.api({ getState, setState, reset });
      const methodKeys = Object.keys(methods);

      for (let index = 0; index < methodKeys.length; index += 1) {
        const methodKey = methodKeys[index];

        listeners.methods[methodKey] = { before: new Set(), after: new Set() };

        publicApi.api[methodKey] = {
          call: (...params) => {
            listeners.methods[methodKey].before.forEach((listener) =>
              listener({ params })
            );

            const result = methods[methodKey](...params);

            listeners.methods[methodKey].after.forEach((listener) =>
              listener({ params, result })
            );

            return result;
          },
          before: {
            on: (callback) => {
              listeners.methods[methodKey].before.add(callback);
            },
            off: (callback) => {
              listeners.methods[methodKey].before.delete(callback);
            },
          },
          after: {
            on: (callback) => {
              listeners.methods[methodKey].after.add(callback);
            },
            off: (callback) => {
              listeners.methods[methodKey].after.delete(callback);
            },
          },
        };
      }

      return publicApi;
    },

    setStoreState: (payload) => {
      const store = context.stores[payload.name];

      if (store === undefined) {
        throw new Error("Store doesn't exist");
      }

      if (store.state !== payload.state) {
        store.state = payload.state;

        store.listeners.store.forEach((listener) => listener(store.state));
      }
    },

    getStoreState: (payload) => {
      const store = context.stores[payload.name];

      if (store === undefined) {
        throw new Error("Store doesn't exist");
      }

      return store.state;
    },

    unions: {},

    union: (payload) => {
      if (context.unions[payload.name]) {
        const unionDepends = context.unions[payload.name].depends;
        const unionDependKeys = Object.keys(unionDepends);

        const payloadDepends = payload.depends;
        const payloadDependKeys = Object.keys(payloadDepends);

        if (unionDependKeys.length === payloadDependKeys.length) {
          const isEqual = true;

          while (unionDependKeys.length) {
            const dependKey = unionDependKeys.pop();

            if (payloadDependKeys.includes(dependKey)) {
              payloadDependKeys.splice(payloadDependKeys.indexOf(dependKey), 1);
            }

            const unionDepend = unionDepends[dependKey];
            const payloadDepend = unionDepends[dependKey];

            if (unionDepend !== payloadDepend) {
              isEqual = false;
              break;
            }
          }

          if (
            isEqual &&
            unionDependKeys.length === 0 &&
            payloadDependKeys.length === 0
          ) {
            return context.unions[payload.name].public;
          }
        }

        throw new Error("Union use other api");
      }

      const listeners = {
        store: new Set(),
      };
      const publicApi = {
        name: payload.name,
        depends: payload.depends,
        on: (callback) => {
          listeners.store.add(callback);
        },
        off: (callback) => {
          listeners.store.delete(callback);
        },
        getState: () => {
          return context.getUnionState({ name: payload.name });
        },
      };

      context.unions[payload.name] = {
        depends: payload.depends,
        init: payload.init,
        listeners,
        public: publicApi,
      };

      const dependKeys = Object.keys(payload.depends);

      for (let index = 0; index < dependKeys.length; index += 1) {
        const dependKey = dependKeys[index];
        const depend = payload.depends[dependKey];

        depend.on(() => {
          const unionState = publicApi.getState();

          context.unions[payload.name].listeners.store.forEach((listener) =>
            listener(unionState)
          );
        });
      }

      return publicApi;
    },

    getUnionState: (payload) => {
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
    },
  };

  return context;
}

contextStack.unshift(createContext());

module.exports = { contextStack, createContext };
