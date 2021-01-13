const { contextStack } = require("../context");

function store(config) {
  function storeApi(payload) {
    const context = contextStack[0];
    const publicApi = context.addStore({
      name: payload.name,
      init: payload.init === undefined ? config.init : payload.init,
      api: config.api,
    });

    function getStoreInstance() {
      return {
        name: publicApi.name,
        on: publicApi.listen.on,
        off: publicApi.listen.off,
        getState: publicApi.getState,
      };
    }

    const apiKeys = Object.keys(publicApi.use);

    for (let index = 0; index < apiKeys.length; index += 1) {
      const apiKey = apiKeys[index];

      getStoreInstance[apiKey] = publicApi.use[apiKey];
    }

    return getStoreInstance;
  }

  return storeApi;
}

module.exports = { store };
