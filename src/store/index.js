function store({ init, api, type }) {
  const config = { init, api, type };

  Object.freeze(config);

  const storeApi = (callback) => {
    const result = callback(config);
    return result;
  };

  return storeApi;
}

module.exports = { store };
