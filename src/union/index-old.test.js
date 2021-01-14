const { union } = require("./index");
const { store } = require("../store");

const strApi = store({
  init: "",
  api: ({ getState, setState }) => ({
    getValue: getState,
    setValue: setState,
  }),
});

const numApi = store({
  init: 10,
  api: ({ getState, setState }) => ({
    getValue: getState,
    setValue: setState,
  }),
});

const userApi = union({
  depends: { name: strApi, age: numApi },
});

test("main", () => {
  const user = userApi({ name: "user" });

  expect(user.getState()).toEqual({ name: "", age: 10 });

  user.depends.name.api.setValue.call("Bob");
  user.depends.age.api.setValue.call(20);

  expect(user.getState()).toEqual({ name: "Bob", age: 20 });
});

test("on", () => {
  const user = userApi({ name: "user" });
  const fn = jest.fn(() => {});

  user.on(fn);

  expect(user.getState()).toEqual({ name: "Bob", age: 20 });

  user.depends.name.api.setValue.call("Alise");

  expect(fn.mock.calls[0][0]).toEqual({ name: "Alise", age: 20 });
});

test("off", () => {
  const user = userApi({ name: "user" });
  const fn = jest.fn(() => {});

  user.on(fn);
  expect(user.getState()).toEqual({ name: "Alise", age: 20 });
  user.depends.age.api.setValue.call(30);
  expect(fn.mock.calls[0][0]).toEqual({ name: "Alise", age: 30 });

  user.off(fn);
  user.depends.age.api.setValue.call(40);
  expect(fn.mock.calls.length).toBe(1);
});
