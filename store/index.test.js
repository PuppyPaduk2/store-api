const { store } = require("./index");
const { createContext } = require("../context");

const userApi = store({
  init: { name: "", age: 0 },
  api: ({ getState, setState }) => ({
    setName: (name) => setState({ ...getState(), name }),
    getName: () => getState().name,
    setAge: (age) => setState({ ...getState(), age }),
    getAge: () => getState().age,
    getData: () => getState(),
  }),
});

test("main", () => {
  const user = userApi({ name: "user-1" });
  const userclone = userApi({ name: "user-1" });

  expect(user.getData() === userclone.getData()).toBe(true);
  expect(user.getData()).toEqual({ name: "", age: 0 });

  user.setName("Bob");
  user.setAge(10);

  expect(user.getName()).toBe("Bob");
  expect(user.getAge()).toBe(10);
});

test("listen store", () => {
  const user = userApi({ name: "user-2" });
  const fn = jest.fn(() => {});

  user().on(fn);

  expect(user.getData()).toEqual({ name: "", age: 0 });

  user.setName("Bob");

  expect(user.getData()).toEqual({ name: "Bob", age: 0 });
  expect(fn.mock.calls.length).toBe(1);

  user().off(fn);

  user.setName("Alise");

  expect(user.getData()).toEqual({ name: "Alise", age: 0 });
  expect(fn.mock.calls.length).toBe(1);
});

const app1 = createContext();
const app2 = createContext();

test("two context", () => {
  const createApp = (init) => () => {
    const user = userApi({ name: "user", init });

    return { user };
  };

  const app1Cache = app1(createApp({ name: "Bob", age: 10 }));
  const app2Cache = app2(createApp({ name: "Alise", age: 1 }));

  app1Cache.user.setName("Alise");
  app2Cache.user.setName("Bob");

  expect(app1Cache.user.getData()).toEqual({ name: "Alise", age: 10 });
  expect(app2Cache.user.getData()).toEqual({ name: "Bob", age: 1 });
});

const userName = store({
  init: "",
  api: ({ setState, getState }) => ({
    change: (value) => setState(value),
    getValue: () => getState(),
  }),
});

const userAge = store({
  init: 0,
  api: ({ setState, getState }) => ({
    change: (value) => setState(value),
    getValue: () => getState(),
  }),
});

test("combine stores", () => {});
