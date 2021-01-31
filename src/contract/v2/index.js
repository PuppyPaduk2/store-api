const { attachStore, attachDepend } = require("../../context");

function contractStores(config) {
  const contract = {
    name: {},
    store: {},
    config: () => ({}),
    stores: () => () => ({}),
  };
  const configKeys = Object.keys(config);

  for (let index = 0; index < configKeys.length; index += 1) {
    const configKey = configKeys[index];
    const storeApi = config[configKey];

    contract.name[configKey] = configKey;
    contract.store[configKey] = (state) => {
      return attachStore(configKey, storeApi, state);
    };
  }

  contract.config = (_use) => {
    const use = _use instanceof Array && _use.length ? _use : configKeys;
    const result = {};

    use.forEach((configKey) => {
      result[configKey] = config[configKey];
    });

    return result;
  };

  contract.stores = (_use) => {
    const use = _use instanceof Array && _use.length ? _use : configKeys;

    return (_state) => {
      const state = _state instanceof Object ? _state : {};
      const instances = {};

      use.forEach((configKey) => {
        instances[configKey] = contract.store[configKey](state[configKey]);
      });

      return instances;
    };
  };

  return contract;
}

function contractDepends(config) {
  const contract = {
    name: {},
    depend: {},
    config: () => ({}),
    depends: () => () => ({}),
  };
  const configKeys = Object.keys(config);

  for (let index = 0; index < configKeys.length; index += 1) {
    const configKey = configKeys[index];
    const dependApi = config[configKey];

    contract.name[configKey] = configKey;
    contract.depend[configKey] = () => {
      return attachDepend(dependApi);
    };
  }

  contract.config = (_use) => {
    const use = _use instanceof Array && _use.length ? _use : configKeys;
    const result = {};

    use.forEach((configKey) => {
      result[configKey] = config[configKey];
    });

    return result;
  };

  contract.depends = (_use) => {
    const use = _use instanceof Array && _use.length ? _use : configKeys;

    return () => {
      const results = {};

      use.forEach((configKey) => {
        results[configKey] = contract.depend[configKey]();
      });

      return results;
    };
  };

  return contract;
}

module.exports = {
  contractStores,
  contractDepends,
};
