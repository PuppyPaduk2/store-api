const { union } = require("./index");
const { store } = require("../../store/v2");
const { context, getContextState } = require("../../context/v2");

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
  expect(app1Values.user !== app2Values.user).toBe(true);

  expect(Object.keys(getContextState().stores).length).toBe(0);
  expect(Object.keys(getContextState().unions).length).toBe(0);
  expect(Object.keys(getContextState(app1).stores).length).toBe(2);
  expect(Object.keys(getContextState(app1).unions).length).toBe(1);
  expect(Object.keys(getContextState(app2).stores).length).toBe(2);
  expect(Object.keys(getContextState(app2).unions).length).toBe(1);
});
