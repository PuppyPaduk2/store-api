const { createContext } = require("./index");

const context = createContext();

const userApi = {
  init: { name: "", age: 0 },
  api: (use) => ({
    setName: (name) => {
      use.setState({ ...use.getState(), name });
      return use.getState().name;
    },
    getName: () => use.getState().name,
    setAge: (age) => use.setState({ ...use.getState(), age }),
    getAge: () => use.getState().age,
    getData: () => use.getState(),
  }),
};

const usetTokensApi = {
  init: { token: "" },
  api: () => ({
    setToken: () => () => {},
    getToken: () => () => {},
  }),
};

test("main", () => {
  const user1 = context.addStore({ name: "user-1", ...userApi });
  const user1Clone = context.addStore({ name: "user-1", ...userApi });

  user1.use.setName("Bob");
  expect(user1Clone.use.getData()).toEqual({ name: "Bob", age: 0 });
  expect(user1 === user1Clone).toBe(true);
});

test("use init from instance", () => {
  const user2 = context.addStore({
    name: "user-2",
    ...userApi,
    init: { name: "Alise", age: 1 },
  });
  context.addStore({
    name: "user-2",
    ...userApi,
    init: { name: "Alise", age: 2 },
  });

  expect(user2.use.getData()).toEqual({ name: "Alise", age: 1 });
});

test("user store by othe api", () => {
  try {
    context.addStore({ name: "user-1", ...usetTokensApi });
  } catch (error) {
    expect(error.message).toBe("Store use other api");
  }
});

test("on", () => {
  const user = context.addStore({ name: "user-1", ...userApi });
  const fnBefore = jest.fn(() => {});
  const fnAfter = jest.fn(() => {});

  user.use.setName.on.before(fnBefore);
  user.use.setName.on.after(fnAfter);

  user.use.setName("Bob");

  expect(fnBefore.mock.calls[0][0]).toEqual({ params: ["Bob"] });
  expect(fnAfter.mock.calls[0][0]).toEqual({ params: ["Bob"], result: "Bob" });
});

test("off", () => {
  const user = context.addStore({ name: "user-1", ...userApi });
  const fnBefore = jest.fn(() => {});
  const fnAfter = jest.fn(() => {});

  user.use.setName.on.before(fnBefore);
  user.use.setName.on.after(fnAfter);

  user.use.setName.off.before(() => {});
  user.use.setName.off.after(() => {});

  user.use.setName("Bob");

  expect(fnBefore.mock.calls[0][0]).toEqual({ params: ["Bob"] });
  expect(fnAfter.mock.calls[0][0]).toEqual({ params: ["Bob"], result: "Bob" });

  user.use.setName.off.before(fnBefore);
  user.use.setName.off.after(fnAfter);

  user.use.setName("Alise");

  expect(fnBefore.mock.calls.length).toBe(1);
  expect(fnAfter.mock.calls.length).toBe(1);
});

test("listen.on", () => {
  const { use: user, ...$user } = context.addStore({
    name: "user-3",
    ...userApi,
  });
  const fn = jest.fn();

  $user.on(fn);
  user.setName("Bob");
  user.setAge(10);

  expect(fn.mock.calls[0][0]).toEqual({ name: "Bob", age: 0 });
  expect(fn.mock.calls[1][0]).toEqual({ name: "Bob", age: 10 });
});

test("listen.off", () => {
  const { use: user, ...$user } = context.addStore({
    name: "user-3",
    ...userApi,
  });
  const fn = jest.fn();

  $user.on(fn);
  $user.off(fn);
  user.setName("Bob");

  expect(fn.mock.calls.length).toBe(0);
});
