const { union } = require("./index");
const { store } = require("../store");
const { context, getContextState } = require("../context");

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

const richUserApi = union({
  depends: { name: strApi, surname: strApi, age: numApi },
});

test("create union with other api", () => {
  const app = context();

  app(() => {
    userApi({ name: "user" });

    try {
      richUserApi({ name: "user" });
    } catch (error) {
      expect(error.message).toBe("Union use other api");
    }
  });

  expect(Object.keys(getContextState(app).stores).length).toBe(3);
  expect(Object.keys(getContextState(app).unions).length).toBe(1);
});

test("separate contexts", () => {
  const app1 = context();
  const app2 = context();

  const appCallback = () => {
    const user = userApi({ name: "user" });

    user.depends.age.api.setValue.call(10);

    return { user };
  };

  const app1Values = app1(appCallback);
  const app2Values = app2(appCallback);
  expect(app1Values.user === app2Values.user).toBe(false);

  expect(Object.keys(getContextState(app1).stores).length).toBe(2);
  expect(Object.keys(getContextState(app1).unions).length).toBe(1);
  expect(Object.keys(getContextState(app2).stores).length).toBe(2);
  expect(Object.keys(getContextState(app2).unions).length).toBe(1);
});

test("mix contexts", () => {
  const app = context();
  const appInner = context();

  const appValues = app(() => ({
    user: userApi({ name: "user" }),
    inner: appInner(() => ({
      user: userApi({ name: "user" }),
    })),
  }));

  expect(appValues.user === appValues.inner.user).toBe(false);
  expect(Object.keys(getContextState(app).stores).length).toBe(2);
  expect(Object.keys(getContextState(app).unions).length).toBe(1);
  expect(Object.keys(getContextState(appInner).stores).length).toBe(2);
  expect(Object.keys(getContextState(appInner).unions).length).toBe(1);
});
