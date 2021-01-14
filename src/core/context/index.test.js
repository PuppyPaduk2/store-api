const { createContext } = require("./index");

test("reset store", () => {
  const app = createContext();
  const user = app.store({
    name: "user",
    init: { name: "", age: 0 },
    api: ({ getState, setState, reset }) => ({
      set: setState,
      reset,
    }),
  });

  expect(user.getState()).toEqual({ name: "", age: 0 });
  user.api.set.call({ name: "Bob", age: 10 });
  expect(user.getState()).toEqual({ name: "Bob", age: 10 });
  user.api.reset.call();
  expect(user.getState()).toEqual({ name: "", age: 0 });
});
