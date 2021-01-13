const { contextStack } = require("../context");

function union(config) {
  function unionApi(payload) {
    const dependKeys = Object.keys(config.depends);
    const depends = {};
    const storeApiDepends = {};

    for (let index = 0; index < dependKeys.length; index += 1) {
      const key = dependKeys[index];
      const store = config.depends[key];

      const storeApi = store({
        name: `${payload.name}-${key}`,
        init: config.init ? config.init[key] : undefined,
      });
      const $store = storeApi();
      const storePublicApi = {
        name: $store.name,
        use: storeApi,
        listen: { on: $store.on, off: $store.off },
        getState: $store.getState,
      };

      storeApiDepends[key] = storeApi;
      depends[key] = storePublicApi;
    }

    const context = contextStack[0];

    const unionPublicApi = context.addUnion({
      name: payload.name,
      depends,
    });

    return {
      name: unionPublicApi.name,
      depends: storeApiDepends,
      on: unionPublicApi.listen.on,
      off: unionPublicApi.listen.off,
      getState: unionPublicApi.getState,
    };
  }

  return unionApi;
}

module.exports = { union };
