const { store } = require("../store");
const { depend } = require("../depend");

const stringApi = store({
  init: "",
  api: () => ({
    set: () => {},
    get: () => {},
    reset: () => {},
  }),
});

const numberApi = store({
  init: 0,
  api: () => ({
    inc: () => {},
    dec: () => {},
    reset: () => {},
  }),
});

test("create", () => {
  const defaultValues = depend({
    stores: { name: stringApi, age: numberApi },
    handler: ({ name, age }) => {
      name.api.set("Bob");
      age.api.inc();
    },
  });

  expect(defaultValues(config => config.stores.name)).toBeInstanceOf(Function);
  expect(defaultValues(config => config.stores.age)).toBeInstanceOf(Function);
  expect(defaultValues(config => config.handler)).toBeInstanceOf(Function);
});

test("use name in depend config", () => {
  const defaultValues = depend({
    name: "default-values",
    stores: { name: stringApi, age: numberApi },
    handler: ({ name, age }) => {
      name.api.set("Bob");
      age.api.inc();
    },
  });
  
  expect(defaultValues(({ name }) => name)).toBe("default-values");
});
