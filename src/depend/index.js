function depend({ stores, handler, name }) {
  const config = { stores, handler, name };

  Object.freeze(config);

  const dependApi = (callback) => {
    const result = callback(config);
    return result;
  };

  return dependApi;
}

module.exports = { depend };
