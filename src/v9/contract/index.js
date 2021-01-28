const { attachStore, attachDepend, rootContext } = require("../context");
const { depend } = require("../depend");

function contract(stores, options) {
  const instance = {
    name: {},
    store: {},
    depend: {},
  };

  const storeKeys = Object.keys(stores);

  for (let index = 0; index < storeKeys.length; index += 1) {
    const storeKey = storeKeys[index];

    instance.name[storeKey] = storeKey;
    instance.store[storeKey] = (state) => {
      return attachStore(storeKey, stores[storeKey], state);
    };
  }

  if (options && typeof options.depends === "function") {
    const depends = options.depends((payload) => {
      const dependStores = {};

      payload.stores.forEach((storeKey) => {
        dependStores[storeKey] = stores[storeKey];
      });

      return depend({
        stores: dependStores,
        handler: payload.handler,
      });
    });

    const dependKeys = Object.keys(depends);

    for (let index = 0; index < dependKeys.length; index += 1) {
      const dependKey = dependKeys[index];

      instance.depend[dependKey] = () => {
        return attachDepend(depends[dependKey]);
      };
    }
  }

  instance.stores = (contextScope, storeNames) => {
    const result = {};

    (contextScope || rootContext)(() => {
      (storeNames || Object.keys(instance.store)).forEach((name) => {
        result[name] = instance.store[name]();
      });
    });

    return result;
  };

  instance.depends = (contextScope, dependNames) => {
    const result = {};

    (contextScope || rootContext)(() => {
      (dependNames || Object.keys(instance.depend)).forEach((name) => {
        result[name] = instance.depend[name]();
      });
    });

    return result;
  };

  return instance;
}

module.exports = { contract };
