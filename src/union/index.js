const { contextStack } = require("../core/context");

function union(config) {
  function build(payload) {
    const depends = {};
    const dependKeys = Object.keys(config.depends);

    for (let index = 0; index < dependKeys.length; index += 1) {
      const dependKey = dependKeys[index];
      const store = config.depends[dependKey];

      depends[dependKey] = store({
        name: `${payload.name}-${dependKey}`,
        init: payload.init ? payload.init[dependKey] : undefined,
      });
    }

    const context = contextStack[0];

    return context.union({
      name: payload.name,
      depends,
    });
  }

  return build;
}

module.exports = { union };
