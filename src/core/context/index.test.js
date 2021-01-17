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

test("change by prev", () => {
  const app = createContext();
  const num = app.store({
    name: "num",
    init: 0,
    api: ({ setState }) => ({
      inc: () => setState((prev) => prev + 1),
      dec: () => setState((prev) => prev - 1),
    }),
  });

  expect(num.getState()).toBe(0);
  num.api.inc.call();
  expect(num.getState()).toBe(1);
  num.api.dec.call();
  num.api.dec.call();
  expect(num.getState()).toBe(-1);
});
