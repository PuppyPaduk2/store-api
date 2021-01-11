const context = {
  stores: {},
};

function storeApi(payload) {
  const api = { ...payload };

  return ({ name, init }) => {
    if (context[name]) {
      if (context[name].api !== api) {
        throw new Error("Store use other api");
      } else {
        return context[name].publicApi;
      }
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
    const listeners = {
      use: {},
      listen: new Set(),
    };

    const apiWrapper = payload.api({ data, change });
    const apiKeys = Object.keys(apiWrapper);

    for (let index = 0; index < apiKeys.length; index += 1) {
      const apiKey = apiKeys[index];

      listeners.use[apiKey] = {
        before: new Set(),
        after: new Set(),
      };

      publicApi.use[apiKey] = function (...params) {
        listeners.use[apiKey].before.forEach((listener) =>
          listener({ params })
        );

        const result = apiWrapper[apiKey](...params);

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

      publicApi.listen = {
        on: (callback) => {
          listeners.listen.add(callback);
        },
        off: (callback) => {
          listeners.listen.delete(callback);
        },
      };
    }

    context[name].publicApi = publicApi;

    return publicApi;
  };
}

module.exports = { context, storeApi };
