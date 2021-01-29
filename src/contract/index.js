const { attachStore, attachDepend } = require("../context");
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
    const dependConfigs = options.depends((payload) => {
      const dependStores = {};

      payload.stores.forEach((storeKey) => {
        dependStores[storeKey] = stores[storeKey];
      });

      return {
        stores: dependStores,
        handler: payload.handler,
        useName: payload.useName,
      };
    });

    const dependConfigKeys = Object.keys(dependConfigs);

    for (let index = 0; index < dependConfigKeys.length; index += 1) {
      const dependConfigKey = dependConfigKeys[index];
      const dependConfig = dependConfigs[dependConfigKey];

      instance.depend[dependConfigKey] = () => {
        return attachDepend(depend({
          stores: dependConfig.stores,
          handler: dependConfig.handler,
          name: dependConfig.useName ? dependConfigKey : undefined,
        }));
      };
    }
  }

  instance.stores = (_payload) => () => {
    const payload = _payload || {};
    const use = payload.use || Object.keys(instance.store);
    const state = payload.state || {};
    const result = {};

    use.forEach((name) => {
      result[name] = instance.store[name](state[name]);
    });

    return result;
  };

  instance.depends = (_payload) => () => {
    const payload = _payload || {};
    const use = payload.use || Object.keys(instance.depend)
    const result = {};

    use.forEach((name) => {
      result[name] = instance.depend[name]();
    });

    return result;
  };

  return instance;
}

module.exports = { contract };
