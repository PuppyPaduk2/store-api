const { storeApi } = require("./index");

const userApi = storeApi({
  init: { name: "", age: 0 },
  api: (use) => ({
    setName:  (name) => {
      use.change({ ...use.data(), name });
      return use.data().name;
    },
    getName: () => use.data().name,
    setAge: (age) => use.change({ ...use.data(), age }),
    getAge: () => use.data().age,
    getData: () => use.data(),
  }),
});

const userTokens = storeApi({
  init: { token: "" },
  api: {
    setToken: () => () => {},
    getToken: () => () => {},
  },
});

test("main", () => {
  const user1 = userApi({ name: "user-1" });
  const user1Clone = userApi({ name: "user-1" });

  user1.use.setName("Bob");
  expect(user1Clone.use.getData()).toEqual({ name: "Bob", age: 0 });
});

test("use init from instance", () => {
  const user2 = userApi({ name: "user-2", init: { name: "Alise", age: 1 } });

  expect(user2.use.getData()).toEqual({ name: "Alise", age: 1 });
});

test("user store by othe api", () => {
  try {
    userTokens({ name: "user-1" });
  } catch(error) {
    expect(error.message).toBe("Store use other api");
  }
});

test("on", () => {
  const user = userApi({ name: "user-1" });
  const fnBefore = jest.fn(() => {});
  const fnAfter = jest.fn(() => {});

  user.on.setName.before(fnBefore);
  user.on.setName.after(fnAfter);

  user.use.setName("Bob");

 expect(fnBefore.mock.calls[0][0]).toEqual({ params: ["Bob"] });
 expect(fnAfter.mock.calls[0][0]).toEqual({ params: ["Bob"], result: "Bob" });
});

test("off", () => {
  const user = userApi({ name: "user-1" });
  const fnBefore = jest.fn(() => {});
  const fnAfter = jest.fn(() => {});

  user.on.setName.before(fnBefore);
  user.on.setName.after(fnAfter);

  user.off.setName.before(() => {});
  user.off.setName.after(() => {});

  user.use.setName("Bob");

  expect(fnBefore.mock.calls[0][0]).toEqual({ params: ["Bob"] });
  expect(fnAfter.mock.calls[0][0]).toEqual({ params: ["Bob"], result: "Bob" });

  user.off.setName.before(fnBefore);
  user.off.setName.after(fnAfter);

  user.use.setName("Alise");

  expect(fnBefore.mock.calls.length).toBe(1);
  expect(fnAfter.mock.calls.length).toBe(1);
});