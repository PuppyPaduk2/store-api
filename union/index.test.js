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

  expect(user.depends.name().name).toBe("user-name");
  expect(user.depends.age().name).toBe("user-age");

  user.depends.name.setValue("Bob");
  user.depends.age.setValue(20);

  console.log(user.depends.name().getState());

  expect(user.getState()).toEqual({ name: "Bob", age: 20 });
});

test("listen", () => {
  const user = userApi({ name: "user" });
  const fn = jest.fn(() => {});

  user.on(fn);

  expect(user.getState()).toEqual({ name: "Bob", age: 20 });

  // expect(fn.mock.calls[0][0]).toEqual({});
});
