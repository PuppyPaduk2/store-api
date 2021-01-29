const {
  context,
  rootContext,
  attachStore,
  attachDepend,
  serializeContext,
  deserializeContext,
} = require("../context");
const { getStack } = require("../stack");
const { store } = require("../store");
const { depend } = require("../depend");

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

const dependStores = { name: stringApi, age: numberApi }

const defaultValuesBob = depend({
  stores: dependStores,
  handler: ({ name, age }) => {
    name.api.set("Bob");
    age.api.set(10);
    return name.getState();
  },
  name: "default-values-bob",
});

const incAge = depend({
  stores: { age: numberApi },
  handler: ({ age }) => {
    age.api.inc();
    age.api.inc();
  },
});

const defaultValuesAlise = depend({
  stores: dependStores,
  handler: ({ name, age }) => {
    if (name.getState() === "Alise") {
      name.api.set("Alise-next");
    } else {
      name.api.set("Alise");
    }
    age.api.set(1);
    return name.getState();
  },
  name: "default-values-alise",
});

const defaultToken = depend({
  stores: { token: stringApi },
  handler: ({ token }) => {
    token.api.set("123qwe");
  },
});

test("create", () => {
  expect(context()).toBeInstanceOf(Function);
});

test("stack length", () => {
  const { stack } = getStack();
  const app = context();
  const innerApp = context();

  expect(stack.length).toBe(1);
  app(() => {
    expect(stack.length).toBe(2);
    innerApp(() => {
      expect(stack.length).toBe(3);
      rootContext(() => {
        expect(stack.length).toBe(4);
      });
      expect(stack.length).toBe(3);
    });
    expect(stack.length).toBe(2);
  });
  expect(stack.length).toBe(1);
});

test("attachStore", () => {
  const app = context();
  const age = app(() => attachStore("age", numberApi));

  expect(age.getState).toBeInstanceOf(Function);
  expect(age.on).toBeInstanceOf(Function);
  expect(age.off).toBeInstanceOf(Function);
  expect(typeof age.api).toBe("object");
  expect(age.api.inc).toBeInstanceOf(Function);
  expect(age.api.dec).toBeInstanceOf(Function);
  expect(age.api.reset).toBeInstanceOf(Function);
  expect(typeof age.listen).toBe("object");
  expect(age.listen.inc.before.on).toBeInstanceOf(Function);
  expect(age.listen.inc.before.off).toBeInstanceOf(Function);
  expect(age.listen.inc.after.on).toBeInstanceOf(Function);
  expect(age.listen.inc.after.off).toBeInstanceOf(Function);
  expect(age.listen.dec.before.on).toBeInstanceOf(Function);
  expect(age.listen.dec.before.off).toBeInstanceOf(Function);
  expect(age.listen.dec.after.on).toBeInstanceOf(Function);
  expect(age.listen.dec.after.off).toBeInstanceOf(Function);
  expect(age.listen.reset.before.on).toBeInstanceOf(Function);
  expect(age.listen.reset.before.off).toBeInstanceOf(Function);
  expect(age.listen.reset.after.on).toBeInstanceOf(Function);
  expect(age.listen.reset.after.off).toBeInstanceOf(Function);
});

test("exec store methods", () => {
  const app = context();
  const age = app(() => attachStore("age", numberApi, 10));

  expect(age.getState()).toBe(10);
  expect(age.api.inc()).toBe(11);
  expect(age.api.inc()).toBe(12);
  expect(age.getState()).toBe(12);
  expect(age.api.dec()).toBe(11);
  expect(age.getState()).toBe(11);
  expect(age.api.reset()).toBe(0);
  expect(age.getState()).toBe(0);
});

test("listen store", () => {
  const app = context();
  const age = app(() => attachStore("age", numberApi, 10));
  const fn = jest.fn(x => x);

  expect(age.on(fn)).toBe(undefined);
  expect(age.api.inc()).toBe(11);
  expect(age.getState()).toBe(11);
  expect(fn.mock.calls.length).toBe(1);
  expect(fn.mock.calls[0][0]).toBe(11);
  expect(age.off(fn)).toBe(undefined);
  expect(age.api.inc()).toBe(12);
  expect(age.getState()).toBe(12);
  expect(fn.mock.calls.length).toBe(1);
});

test("listen store api", () => {
  const app = context();
  const age = app(() => attachStore("age", numberApi, 10));
  const before = jest.fn(x => x);
  const after = jest.fn(x => x);

  expect(age.listen.inc.before.on(before)).toBe(undefined);
  expect(age.listen.inc.after.on(after)).toBe(undefined);
  expect(age.api.inc()).toBe(11);
  expect(age.getState()).toBe(11);
  expect(before.mock.calls.length).toBe(1);
  expect(before.mock.calls[0][0]).toEqual({ params: [] });
  expect(after.mock.calls.length).toBe(1);
  expect(after.mock.calls[0][0]).toEqual({ params: [], result: 11 });
  expect(age.listen.inc.before.off(before)).toBe(undefined);
  expect(age.listen.inc.after.off(after)).toBe(undefined);
  expect(age.api.inc()).toBe(12);
  expect(age.getState()).toBe(12);
  expect(before.mock.calls.length).toBe(1);
  expect(after.mock.calls.length).toBe(1);
});

test("get store of root context from inner", () => {
  const rootContextInstance = rootContext(() => getStack().current);
  const app = context();
  const appContextInstance = app(() => getStack().current);
  
  expect(app(() => rootContext(() => attachStore("age", numberApi, 5))).getState()).toBe(5);
  expect(rootContextInstance.stores.size).toBe(1);
  expect(appContextInstance.stores.size).toBe(0);
});

test("attachDepend", () => {
  const app = context();

  expect(app(() => attachDepend(defaultValuesBob))).toBeInstanceOf(Promise);
  try {
    app(() => attachDepend(defaultValuesAlise));
  } catch (error) {
    expect(error.message).toBe("Depend in current context uses other api");
  }
});

test("run attached depend", () => {
  const app = context();

  expect(app(() => attachDepend(defaultValuesBob))).toBeInstanceOf(Promise);
  expect(app(() => attachDepend(incAge))).toBeInstanceOf(Promise);
  expect(app(() => attachDepend(incAge))).toBeInstanceOf(Promise);
  expect(app(() => attachStore("name", stringApi)).getState()).toBe("Bob");
  expect(app(() => getStack().current.stores.get("age").publicApi.getState())).toBe(12);
  expect(app(() => attachStore("age", numberApi).getState())).toBe(12);

  const app2 = context();

  app2(() => {
    attachDepend(defaultValuesAlise);
    attachDepend(incAge);
    attachDepend(incAge);
    expect(attachStore("name", stringApi).getState()).toBe("Alise");
    expect(attachStore("age", numberApi).getState()).toBe(3);
    app(() => {
      expect(attachStore("name", stringApi).getState()).toBe("Bob");
      expect(attachStore("age", numberApi).getState()).toBe(12);
    });
  });
});

test("result attached depend", async () => {
  const app = context();

  await app(async () => {
    const settingUserBob = attachDepend(defaultValuesBob);
    const settingAge = attachDepend(incAge);

    expect(attachStore("name", stringApi).getState()).toBe("Bob");
    expect(attachStore("age", numberApi).getState()).toBe(12);
    expect(await settingUserBob).toBe("Bob");
    expect(await settingAge).toBe(undefined);
  });
});

test("serializeContext", async () => {
  const app = context();

  expect(await serializeContext(app)).toEqual({ stores: {}, depends: {} });
  expect(app(() => attachStore("name", stringApi, "Bob").getState())).toBe("Bob");
  expect(await serializeContext(app)).toEqual({ stores: { name: "Bob" }, depends: {} });
  expect(app(() => attachStore("age", numberApi, 10).getState())).toBe(10);
  expect(await serializeContext(app)).toEqual({ stores: { name: "Bob", age: 10 }, depends: {} });
});

test("serializeContext [with depends]", async () => {
  const app = context();

  app(() => {
    attachDepend(defaultValuesBob);
    attachDepend(incAge);
    attachDepend(defaultToken);

    expect(attachStore("name", stringApi).getState()).toBe("Bob");
    expect(attachStore("age", numberApi).getState()).toBe(12);
  });

  expect(await serializeContext(app)).toEqual({
    stores: { name: 'Bob', age: 12 },
    depends: { 'default-values-bob': 'Bob' },
  });
});

test("deserializeContext", async () => {
  const appServer = context();

  appServer(() => attachStore("name", stringApi, "Alise"));

  const appClient = deserializeContext({
    context: context(),
    data: await serializeContext(appServer),
  });

  expect(appClient(() => attachStore("name", stringApi, "Bob").getState())).toBe("Alise");
});

test("deserializeContext [with depends]", async () => {
  const appServer = context();

  appServer(() => {
    attachDepend(defaultValuesAlise);
    attachDepend(incAge);
    attachDepend(defaultToken);

    attachStore("name", stringApi);
  });

  const appClient = deserializeContext({
    context: context(),
    data: await serializeContext(appServer),
  });

  appClient(() => {
    attachDepend(defaultValuesAlise);
    attachDepend(incAge);
    attachDepend(defaultToken);

    expect(attachStore("name", stringApi).getState()).toBe("Alise");
  });
});
