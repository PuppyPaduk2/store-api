const { contextStack } = require("../context");

function store(config) {
  function storeApi(payload) {
    const context = contextStack[0];
    const api = context.addStore({
      name: payload.name,
      init: payload.init === undefined ? config.init : payload.init,
      api: config.api,
    });

    function getStoreInstance() {
      return api();
    }

    const apiKeys = Object.keys(api.use);

    for (let index = 0; index < apiKeys.length; index += 1) {
      const apiKey = apiKeys[index];

      getStoreInstance[apiKey] = api[apiKey];
    }

    return getStoreInstance;
  }

  return storeApi;
}

module.exports = { store };
