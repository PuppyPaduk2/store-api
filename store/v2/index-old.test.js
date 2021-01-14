const { store } = require("./index");
const { context } = require("../../context/v2");

const user = store({
  init: { name: "", age: 0 },
  api: ({ getState, setState }) => ({
    setName: (name) => setState({ ...getState(), name }),
    getName: () => getState().name,
    setAge: (age) => setState({ ...getState(), age }),
    getAge: () => getState().age,
    getData: () => getState(),
  }),
});

test.only("main", () => {
  const currentUser = user({ name: "user-1" });
  const currentUserClone = user({ name: "user-1" });

  expect(currentUser.getState() === currentUserClone.getState()).toBe(true);
  expect(currentUser.getState()).toEqual({ name: "", age: 0 });

  currentUser.api.setName.call("Bob");
  currentUser.api.setAge.call(10);

  expect(currentUser.api.getName.call()).toBe("Bob");
  expect(currentUser.api.getAge.call()).toBe(10);
});

test.only("listen store", () => {
  const currentUser = user({ name: "user-2" });
  const fn = jest.fn(() => {});

  currentUser.on(fn);

  expect(currentUser.getState()).toEqual({ name: "", age: 0 });

  currentUser.api.setName.call("Bob");

  expect(currentUser.getState()).toEqual({ name: "Bob", age: 0 });
  expect(fn.mock.calls.length).toBe(1);

  currentUser.off(fn);

  currentUser.api.setName.call("Alise");

  expect(currentUser.getState()).toEqual({ name: "Alise", age: 0 });
  expect(fn.mock.calls.length).toBe(1);
});

const app1 = context();
const app2 = context();

test.only("two context", () => {
  const createApp = (init) => () => {
    return { user: user({ name: "user", init }) };
  };

  const app1Cache = app1(createApp({ name: "Bob", age: 10 }));
  const app2Cache = app2(createApp({ name: "Alise", age: 1 }));

  app1Cache.user.api.setName.call("Alise");
  app2Cache.user.api.setName.call("Bob");

  expect(app1Cache.user.getState()).toEqual({ name: "Alise", age: 10 });
  expect(app2Cache.user.getState()).toEqual({ name: "Bob", age: 1 });
});
