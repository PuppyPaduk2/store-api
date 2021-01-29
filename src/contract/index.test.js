const { context } = require("../context");
const { store } = require("../store");
const { contract } = require("../contract");

const numberApi = store({
  init: 0,
  api: ({ getState, setState, reset }) => ({
    set: (value) => setState(value),
    inc: () => setState(getState() + 1),
    dec: () => setState(prev => prev - 1),
    reset: () => reset(),
  }),
});

const stringApi = store({
  init: "",
  api: ({ getState, setState, reset }) => ({
    set: (value) => setState(value),
    get: () => getState(),
    reset: () => reset(),
  }),
});

test("create", () => {
  const capp = contract({ name: stringApi });

  expect(capp.name).toEqual({ name: "name" });
  expect(capp.store.name).toBeInstanceOf(Function);
});

test("create with depends", () => {
  const capp = contract({ name: stringApi, age: numberApi }, {
    depends: (depend) => ({
      defaultName: depend({ stores: ["name"], handler: ({ name }) => name.api.set("Bob") }),
      defaultAge: depend({ stores: ["age"], handler: ({ age }) => age.api.set(10) }),
    }),
  });

  expect(capp.depend.defaultName).toBeInstanceOf(Function);
  expect(capp.depend.defaultAge).toBeInstanceOf(Function);
});


test("attach store", () => {
  const capp = contract({
    name: stringApi,
    surname: stringApi,
    age: numberApi,
    persent: numberApi,
  });

  const app = context();
  const name = app(capp.store.name);

  expect(name.getState()).toBe("");
  expect(name.api.set("Bob")).toBe("Bob");
  expect(capp.store.name().getState()).toBe("");
  expect(capp.store.name().api.set("Alise")).toBe("Alise");
  expect(capp.store.name().getState()).toBe("Alise");
  expect(name.getState()).toBe("Bob");
});

test("attach depend", async () => {
  const capp = contract({
    name: stringApi,
    surname: stringApi,
    age: numberApi,
    persent: numberApi,
  }, {
    depends: (depend) => ({
      defaultName: depend({
        stores: ["name"],
        handler: ({ name }) => name.api.set("Bob"),
      }),
      defaultAge: depend({
        stores: ["age"],
        handler: ({ age }) => age.api.set(10),
      }),
    }),
  });

  const app = context();

  const setName = app(capp.depend.defaultName);
  const setAge = app(capp.depend.defaultAge);

  const name = app(capp.store.name);
  const age = app(capp.store.age);

  expect(name.getState()).toBe("Bob");
  expect(age.getState()).toBe(10);
  expect(await setName).toBe("Bob");
  expect(await setAge).toBe(10);
});

test("stores [all]", () => {
  const capp = contract({
    name: stringApi,
    age: numberApi,
  }, {
    depends: (depend) => ({
      defaultName: depend({
        stores: ["name"],
        handler: ({ name }) => name.api.set("Bob"),
      }),
      defaultAge: depend({
        stores: ["age"],
        handler: ({ age }) => age.api.set(10),
      }),
    }),
  });

  const app = context();
  const innerApp = context();

  const appStores = capp.stores(app);
  const innerAppStores = capp.stores(innerApp);

  expect(appStores.name.getState()).toBe("");
  expect(innerAppStores.name.getState()).toBe("");
  expect(appStores.name.api.set("Bob")).toBe("Bob");
  expect(innerAppStores.name.api.set("Alise")).toBe("Alise");
  expect(appStores.name.getState()).toBe("Bob");
  expect(innerAppStores.name.getState()).toBe("Alise");
});

test("stores [chunk]", () => {
  const capp = contract({
    name: stringApi,
    age: numberApi,
  });

  const app = context();

  expect(Object.keys(capp.stores(app, ["name"]))).toEqual(["name"]);
});

test("depends [all]", async () => {
  const capp = contract({
    name: stringApi,
    age: numberApi,
  }, {
    depends: (depend) => ({
      defaultName: depend({
        stores: ["name"],
        handler: ({ name }) => name.api.set("Bob"),
      }),
      defaultAge: depend({
        stores: ["age"],
        handler: ({ age }) => age.api.set(10),
      }),
    }),
  });

  const app = context();
  const { defaultName, defaultAge } = capp.depends(app);
  const stores = capp.stores(app);

  expect(stores.name.getState()).toBe("Bob");
  expect(stores.age.getState()).toBe(10);
  expect(await defaultName).toBe("Bob");
  expect(await defaultAge).toBe(10);
});

test("depends [chunk]", async () => {
  const capp = contract({
    name: stringApi,
    age: numberApi,
  }, {
    depends: (depend) => ({
      defaultName: depend({
        stores: ["name"],
        handler: ({ name }) => name.api.set("Bob"),
      }),
      defaultAge: depend({
        stores: ["age"],
        handler: ({ age }) => age.api.set(10),
      }),
    }),
  });

  const app = context();
  const { defaultName } = capp.depends(app, ["defaultName"]);
  const stores = capp.stores(app);

  expect(stores.name.getState()).toBe("Bob");
  expect(stores.age.getState()).toBe(0);
  expect(await defaultName).toBe("Bob");
});
