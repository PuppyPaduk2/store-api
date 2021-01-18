const { deserializeContext } = require("../context");
const { context, serializeContext, desrializeContext } = require("../context");
const { store } = require("./index");

describe("serialize / deserialize", () => {
  const numApi = store({
    init: 0,
    api: ({ setState }) => ({
      inc: () => setState(prev => prev + 1),
      dec: () => setState(prev => prev - 1),
    }),
  });

  const strApi = store({
    init: "",
    api: ({ setState }) => ({
      set: setState,
    }),
  });

  let serializedContext;

  test("serialize", () => {
    const app = context();

    app(() => {
      const userAge = numApi({ name: "user-age" });
      const userName = strApi({ name: "user-name" });
      const countClick = numApi({ name: "count-click" });

      userAge.api.inc.call();
      userName.api.set.call("Bob");
      countClick.api.dec.call();
    });

    serializedContext = serializeContext(app);

    expect(serializedContext).toEqual({
      stores: {
        "user-age": 1,
        "user-name": "Bob",
        "count-click": -1,
      },
    });
  });

  test("deserialize", () => {
    const app = context();

    expect(serializeContext(app)).toEqual({
      stores: {},
    });

    deserializeContext(serializedContext, app);

    app(() => {
      const userAge = numApi({ name: "user-age" });
      const userName = strApi({ name: "user-name" });
      const countClick = numApi({ name: "count-click" });

      expect(userAge.getState()).toBe(1);
      expect(userName.getState()).toBe("Bob");
      expect(countClick.getState()).toBe(-1);

      userAge.api.inc.call();
      userName.api.set.call("Alise");
      countClick.api.dec.call();
    });

    expect(serializeContext(app)).toEqual({
      stores: {
        "user-age": 2,
        "user-name": "Alise",
        "count-click": -2,
      },
    });
  });
});
