const { contextStack } = require("../core/context");

function store(config) {
  function build(payload) {
    const context = contextStack[0];

    return context.store({
      name: payload.name,
      init: payload.init ? payload.init : config.init,
      api: config.api,
    });
  }

  return build;
}

module.exports = { store };
