function store({ init, api }) {
  const config = { init, api };

  Object.freeze(config);

  const storeApi = (callback) => {
    const result = callback(config);
    return result;
  };

  return storeApi;
}

module.exports = { store };
