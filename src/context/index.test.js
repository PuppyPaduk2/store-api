const { context } = require("./index");
const { contextStack } = require("../core/context");

const app1 = context();
const app2 = context();

test.only("two contexts", () => {
  expect(contextStack.length).toBe(1);

  app1(() => {
    expect(contextStack.length).toBe(2);
  });

  expect(contextStack.length).toBe(1);

  app2(() => {
    expect(contextStack.length).toBe(2);
  });

  expect(contextStack.length).toBe(1);

  app1(() => {
    expect(contextStack.length).toBe(2);
  });

  app1(() => {
    expect(contextStack.length).toBe(2);

    app2(() => {
      expect(contextStack.length).toBe(3);
    });
  });

  expect(contextStack.length).toBe(1);
});
