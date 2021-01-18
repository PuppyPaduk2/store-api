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


describe("serialize / deserialize", () => {
  const numApi = ({ setState }) => ({
    inc: () => setState((prev) => prev + 1),
    dec: () => setState((prev) => prev - 1),
  });

  const strApi = ({ setState }) => ({
    set: setState,
  });

  const main = (app) => {
    const countClicks = app.store({
      name: "count-clicks",
      init: 0,
      api: numApi,
    });

    const countUsers = app.store({
      name: "count-users",
      init: -1,
      api: numApi,
    });

    const userName = app.store({
      name: "user-name",
      init: "Bob",
      api: strApi,
    });

    return {
      countClicks,
      countUsers,
      userName,
    };
  };

  let serializedContext;

  test("serialize", () => {
    const app = createContext();
    const { countClicks,  countUsers, userName } = main(app);

    countClicks.api.inc.call();
    countClicks.api.inc.call();
    countUsers.api.inc.call();
    countUsers.api.inc.call();
    userName.api.set.call("Alise");

    serializedContext = app.serialize();

    expect(serializedContext).toEqual({
      stores: {
        "count-clicks": 2,
        "count-users": 1,
        "user-name": "Alise",
      },
    });
  });

  test("deserialize", () => {
    const app = createContext();

    app.deserialize(serializedContext);

    expect(app.stores).toEqual({
      "count-clicks": { state: 2 },
      "count-users": { state: 1 },
      "user-name": { state: "Alise" },
    });

    const { countClicks, countUsers, userName } = main(app);

    countClicks.api.inc.call();
    countUsers.api.inc.call();
    userName.api.set.call("John");

    expect(app.serialize()).toEqual({
      stores: {
        "count-clicks": 3,
        "count-users": 2,
        "user-name": "John",
      },
    });
  });
});
