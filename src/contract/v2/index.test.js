const { store } = require("../../store");
const { context, attachStore, attachDepend } = require("../../context");
const { contractStores, contractDepends } = require("./index");
const { depend } = require("../../depend");

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


test("create contractStores", () => {
  const app = context();
  const appStores = contractStores({ name: stringApi, age: numberApi });

  expect(appStores.name).toEqual({ name: "name", age: "age" });
  expect(Object.keys(appStores.store)).toEqual(["name", "age"]);
  expect(appStores.store.name).toBeInstanceOf(Function);
  expect(appStores.store.age).toBeInstanceOf(Function);
  expect(app(appStores.store.name) === app(appStores.store.name)).toBe(true);
  expect(appStores.stores).toBeInstanceOf(Function);
  expect(appStores.stores()).toBeInstanceOf(Function);
  expect(Object.keys(appStores.stores()())).toEqual(["name", "age"]);
  expect(Object.keys(appStores.stores(["age"])())).toEqual(["age"]);
  expect(app(appStores.store.name) === app(appStores.stores()).name).toBe(true);
  expect(appStores.config).toBeInstanceOf(Function);
  expect(Object.keys(appStores.config())).toEqual(["name", "age"]);
  expect(Object.keys(appStores.config(["name"]))).toEqual(["name"]);
  expect(app(appStores.store.name) === app(() => attachStore(appStores.name.name, appStores.config().name))).toBe(true);
});

test("create contractDepends", () => {
  const app = context();
  const appStores = contractStores({ name: stringApi, age: numberApi });
  const appDepends = contractDepends({
    initName: depend({
      stores: appStores.config(["name"]),
      handler: ({ name }) => name.api.set("Bob"),
    }),
    initAge: depend({
      stores: appStores.config(["age"]),
      handler: ({ age }) => age.api.set(10),
    }),
    initAlise: depend({
      stores: appStores.config(),
      handler: ({ name, age }) => ({
        name: name.api.set("Alise"),
        age: age.api.set(20),
      }),
    }),
  });

  expect(appDepends.name).toEqual({ initName: "initName", initAge: "initAge", initAlise: "initAlise" });
  expect(Object.keys(appDepends.depend)).toEqual(["initName", "initAge", "initAlise"]);
  expect(appDepends.depend.initName).toBeInstanceOf(Function);
  expect(appDepends.depend.initAge).toBeInstanceOf(Function);
  expect(appDepends.depend.initAlise).toBeInstanceOf(Function);
  expect(app(appDepends.depend.initName) === app(appDepends.depend.initName)).toBe(true);
  expect(appDepends.depends).toBeInstanceOf(Function);
  expect(appDepends.depends()).toBeInstanceOf(Function);
  expect(Object.keys(appDepends.depends()())).toEqual(["initName", "initAge", "initAlise"]);
  expect(Object.keys(appDepends.depends(["initName"])())).toEqual(["initName"]);
  expect(app(appDepends.depend.initName) === app(appDepends.depends()).initName).toBe(true);
  expect(appDepends.config).toBeInstanceOf(Function);
  expect(Object.keys(appDepends.config())).toEqual(["initName", "initAge", "initAlise"]);
  expect(Object.keys(appDepends.config(["initAge", "initAlise"]))).toEqual(["initAge", "initAlise"]);
  expect(app(appDepends.depend.initName) === app(() => attachDepend(appDepends.config().initName))).toBe(true);
});

test("exec depends", async () => {
  const app = context();
  const appStores = contractStores({ name: stringApi, age: numberApi });
  const appDepends = contractDepends({
    initName: depend({
      stores: appStores.config(["name"]),
      handler: ({ name }) => {
        return name.api.set("Bob");
      },
    }),
    initAge: depend({
      stores: appStores.config(["age"]),
      handler: ({ age }) => {
        return age.api.set(10);
      },
    }),
    initAlise: depend({
      stores: appStores.config(),
      handler: ({ name, age }) => {
        return {
          name: name.api.set("Alise"),
          age: age.api.set(20),
        };
      },
    }),
  });

  app(appDepends.depends());
  const initAlise = app(appDepends.depend.initAlise);

  expect(app(appStores.store.name).getState()).toBe("Alise");
  expect(await initAlise).toEqual({ name: "Alise", age: 20 });
});
