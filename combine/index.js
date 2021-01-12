function combine(config) {
  function combined(payload) {
    function instance() {
      return {
        on: () => {},
        off: () => {},
      };
    }

    const apiKeys = Object.keys(config.api);

    for (let index = 0; index < apiKeys.length; index += 1) {
      const apiKey = apiKeys[index];
      const storeApi = config.api[apiKeys];

      instance[apiKey] = storeApi({ name: `${payload.name}-${apiKey}` });
    }

    return instance;
  }

  return combined;
}

module.exports = { combine };
