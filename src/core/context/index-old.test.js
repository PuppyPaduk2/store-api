const { createContext, contextStack } = require("./index");

const context = createContext();

const userApi = {
  init: { name: "", age: 0 },
  api: ({ getState, setState }) => ({
    setName: (name) => {
      setState({ ...getState(), name });
      return getState().name;
    },
    getName: () => getState().name,
    setAge: (age) => setState({ ...getState(), age }),
    getAge: () => getState().age,
    getData: () => getState(),
  }),
};

const usetTokensApi = {
  init: { token: "" },
  api: () => ({
    setToken: () => () => {},
    getToken: () => () => {},
  }),
};

test.only("main", () => {
  const user = context.store({ name: "user-1", ...userApi });
  const userClone = context.store({ name: "user-1", ...userApi });

  expect(user.api.setName.call("Bob")).toBe("Bob");
  expect(userClone.api.getData.call()).toEqual({ name: "Bob", age: 0 });
  expect(user === userClone).toBe(true);
});

test.only("use init from instance", () => {
  const user2 = context.store({
    name: "user-2",
    ...userApi,
    init: { name: "Alise", age: 1 },
  });
  context.store({
    name: "user-2",
    ...userApi,
    init: { name: "Alise", age: 2 },
  });

  expect(user2.api.getData.call()).toEqual({ name: "Alise", age: 1 });
});

test.only("user store by othe api", () => {
  try {
    context.store({ name: "user-1", ...usetTokensApi });
  } catch (error) {
    expect(error.message).toBe("Store use other api");
  }
});

test.only("on", () => {
  const user = context.store({ name: "user-1", ...userApi });
  const fnBefore = jest.fn(() => {});
  const fnAfter = jest.fn(() => {});

  user.api.setName.before.on(fnBefore);
  user.api.setName.after.on(fnAfter);

  user.api.setName.call("Bob");

  expect(fnBefore.mock.calls[0][0]).toEqual({ params: ["Bob"] });
  expect(fnAfter.mock.calls[0][0]).toEqual({ params: ["Bob"], result: "Bob" });
});

test.only("off", () => {
  const user = context.store({ name: "user-1", ...userApi });
  const fnBefore = jest.fn(() => {});
  const fnAfter = jest.fn(() => {});

  user.api.setName.before.on(fnBefore);
  user.api.setName.after.on(fnAfter);

  user.api.setName.before.off(() => {});
  user.api.setName.after.off(() => {});

  user.api.setName.call("Bob");

  expect(fnBefore.mock.calls[0][0]).toEqual({ params: ["Bob"] });
  expect(fnAfter.mock.calls[0][0]).toEqual({ params: ["Bob"], result: "Bob" });

  user.api.setName.before.off(fnBefore);
  user.api.setName.after.off(fnAfter);

  user.api.setName.call("Alise");

  expect(fnBefore.mock.calls.length).toBe(1);
  expect(fnAfter.mock.calls.length).toBe(1);
});

test.only("listen.on", () => {
  const user = context.store({
    name: "user-3",
    ...userApi,
  });
  const fn = jest.fn();

  user.on(fn);
  user.api.setName.call("Bob");
  user.api.setAge.call(10);

  expect(fn.mock.calls[0][0]).toEqual({ name: "Bob", age: 0 });
  expect(fn.mock.calls[1][0]).toEqual({ name: "Bob", age: 10 });
});

test.only("listen.off", () => {
  const user = context.store({
    name: "user-3",
    ...userApi,
  });
  const fn = jest.fn();

  user.on(fn);
  user.off(fn);
  user.api.setName.call("Bob");

  expect(fn.mock.calls.length).toBe(0);
});

const secondApp = createContext();

test.only("two contexts", () => {
  expect(contextStack.length).toBe(1);

  context.scope(() => {
    expect(contextStack.length).toBe(2);
    expect(contextStack[0]).toBe(context);
  });

  expect(contextStack.length).toBe(1);

  secondApp.scope(() => {
    expect(contextStack.length).toBe(2);
    expect(contextStack[0]).toBe(secondApp);
  });

  expect(contextStack.length).toBe(1);

  context.scope(() => {
    expect(contextStack.length).toBe(2);
    expect(contextStack[0]).toBe(context);
  });

  context.scope(() => {
    expect(contextStack.length).toBe(2);
    expect(contextStack[0]).toBe(context);

    secondApp.scope(() => {
      expect(contextStack.length).toBe(3);
      expect(contextStack[0]).toBe(secondApp);
    });
  });

  expect(contextStack.length).toBe(1);
});

test.only("getState", () => {
  const user = context.store({ name: "user-get-state", ...userApi });

  expect(user.getState()).toEqual({ name: "", age: 0 });

  user.api.setName.call("Bob");
  user.api.setAge.call(20);

  expect(user.getState()).toEqual({ name: "Bob", age: 20 });
});

describe.only("union", () => {
  const app = createContext();

  const userName = app.store({
    name: "user-name",
    init: "",
    api: ({ getState, setState }) => ({
      setValue: setState,
      getValue: getState,
    }),
  });

  const userAge = app.store({
    name: "user-age",
    init: 0,
    api: ({ getState, setState }) => ({
      setValue: setState,
      getValue: getState,
    }),
  });

  const user = app.union({
    name: "user",
    depends: { name: userName, age: userAge },
  });

  test("main", () => {
    expect(user.getState()).toEqual({ name: "", age: 0 });

    user.depends.name.api.setValue.call("Bob");
    user.depends.age.api.setValue.call(10);

    expect(user.getState()).toEqual({ name: "Bob", age: 10 });
  });

  test("listen", () => {
    const fn = jest.fn(() => {});

    user.on(fn);

    user.depends.name.api.setValue.call("Alise");

    expect(fn.mock.calls.length).toBe(1);

    user.off(fn);

    user.depends.name.api.setValue.call("Jack");

    expect(fn.mock.calls.length).toBe(1);
  });
});
