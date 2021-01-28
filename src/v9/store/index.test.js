const { store } = require("../store");
const { context, attachStore } = require("../context");

const stringApi = store({
  init: "",
  api: () => ({
    set: () => {},
    get: () => {},
    reset: () => {},
  }),
});

const numberApi = store({
  init: 0,
  api: () => ({
    inc: () => {},
    dec: () => {},
    reset: () => {},
  }),
});

test("init", () => {
  const name = stringApi((config) => config.init);
  expect(name).toBe("");
});

test("attach to context", () => {
  const app = context();

  const name0 = attachStore("name", stringApi);
  const name1 = app(() => attachStore("name", stringApi));
  const name2 = app(() => attachStore("name", stringApi));
  const age0 = attachStore("age", numberApi);
  const age1 = attachStore("age", numberApi);

  try {
    attachStore("name", numberApi);
  } catch (error) {
    expect(error.message).toBe("Store in current context uses other api");
  }

  expect(name0 === name1).toBe(false);
  expect(name1 === name2).toBe(true);
  expect(age0 === age1).toBe(true);

  // const name2 = app(attachStore("name", stringApi));

  // console.log(name, name(), name === name2);
});
