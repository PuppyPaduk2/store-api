const context = {
  stores: {},
};

function storeApi(payload) {
  const api = { ...payload };

  return ({ name, init }) => {
    if (context[name] && context[name].api !== api) {
      throw new Error("Store use other api");
    } else if (context[name] === undefined) {
      context[name] = {
        api,
        state: payload.init,
      };
    }

    if (init !== undefined) {
      context[name].state = init;
    }

    const data = () => {
      return context[name].state;
    };
    const change = (state) => {
      context[name].state = state;
    };

    const publicApi = { use: {}, on: {}, off: {} };
    const listeners = {};

    const apiWrapper = payload.api({ data, change });
    const apiKeys = Object.keys(apiWrapper);

    for (let index = 0; index < apiKeys.length; index += 1) {
      const apiKey = apiKeys[index];

      listeners[apiKey] = {
        before: new Set(),
        after: new Set(),
      };

      publicApi.use[apiKey] = (...params) => {
        listeners[apiKey].before.forEach((listener) => listener({ params }));

        const result = apiWrapper[apiKey](...params);

        listeners[apiKey].after.forEach((listener) =>
          listener({ params, result })
        );

        return result;
      };

      publicApi.on[apiKey] = {
        before: (callback) => {
          listeners[apiKey].before.add(callback);
        },
        after: (callback) => {
          listeners[apiKey].after.add(callback);
        },
      };

      publicApi.off[apiKey] = {
        before: (callback) => {
          listeners[apiKey].before.delete(callback);
        },
        after: (callback) => {
          listeners[apiKey].after.delete(callback);
        },
      };
    }

    return publicApi;
  };
}

module.exports = { context, storeApi };