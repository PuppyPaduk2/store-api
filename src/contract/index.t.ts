import { store } from "../store";
import { contract } from "../contract";
import { context, rootContext } from "../context";

const stringApi = store({
  init: "",
  api: ({ setState, reset }) => ({
    set: (value: string) => setState(value),
    reset,
  }),
});

const numberApi = store({
  init: 0,
  api: ({ getState, setState, reset }) => ({
    set: (value: number) => setState(value),
    inc: () => setState(getState() + 1),
    dec: () => setState(prev => prev - 1),
    reset,
  }),
});

const appContract = contract({
  name: stringApi,
  age: numberApi,
  token: stringApi,
}, {
  depends: (depend) => ({
    defaultName: depend({
      use: ["name"],
      handler: ({ name }) => {
        return name.api.set("Bob");
      },
    }),
    defaultAge: depend({
      use: ["age"],
      handler: ({ age }) => {
        return age.api.set(10);
      },
      useName: true,
    }),
    defaultToken: depend({
      use: ["token"],
      handler: ({ token }) => {
        return token.api.set("as23qzjaA2");
      },
    }),
  }),
});

appContract.store.name();
appContract.store.age(10);
appContract.store.token();

appContract.depend.defaultAge();
appContract.depend.defaultName();
appContract.depend.defaultToken();

const app = context();

const rootStoresAll = appContract.stores({
  state: { name: "", age: 123, token: "" },
})();
const rootStoresChunk = rootContext(appContract.stores({
  use: ["name"],
}));
const appStoresAll = app(appContract.stores());
const appStoresChunk = app(appContract.stores({
  use: ["age", "token"]
}));

rootStoresAll.age.getState();
rootStoresAll.name.getState();
rootStoresAll.token.getState();

rootStoresChunk.name.getState();

appStoresAll.age.getState();
appStoresAll.name.getState();
appStoresAll.token.getState();

appStoresChunk.age.getState();
appStoresChunk.token.getState();

const rootDependAll = appContract.depends()();
const rootDependChunk = rootContext(appContract.depends({
  use: ["defaultName", "defaultToken"]
}));
const appDependAll = app(appContract.depends());
const appDependChunk = app(appContract.depends({
  use: ["defaultAge"],
}));

rootDependAll.defaultAge.then((result) => {});
rootDependAll.defaultName.then((result) => {});
rootDependAll.defaultToken.then((result) => {});

rootDependChunk.defaultName.then((result) => {});
rootDependChunk.defaultToken.then((result) => {});

appDependAll.defaultAge.then((result) => {});
appDependAll.defaultName.then((result) => {});
appDependAll.defaultToken.then((result) => {});

appDependChunk.defaultAge.then((result) => {});
