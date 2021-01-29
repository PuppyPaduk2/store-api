function depend({ stores, handler }) {
  const config = { stores, handler };

  Object.freeze(config);

  const dependApi = (callback) => {
    const result = callback(config);
    return result;
  };

  return dependApi;
}

module.exports = { depend };
