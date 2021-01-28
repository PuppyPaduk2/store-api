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
      stores: ["name"],
      handler: ({ name }) => {
        return name.api.set("Bob");
      },
    }),
    defaultAge: depend({
      stores: ["age"],
      handler: ({ age }) => {
        return age.api.set(10);
      },
    }),
    defaultToken: depend({
      stores: ["token"],
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

const rootStoresAll = appContract.stores();
const rootStoresChunk = appContract.stores(rootContext, ["name"]);
const appStoresAll = appContract.stores(app);
const appStoresChunk = appContract.stores(app, ["age", "token"]);

rootStoresAll.age.getState();
rootStoresAll.name.getState();
rootStoresAll.token.getState();

rootStoresChunk.name.getState();

appStoresAll.age.getState();
appStoresAll.name.getState();
appStoresAll.token.getState();

appStoresChunk.age.getState();
appStoresChunk.token.getState();

const rootDependAll = appContract.depends();
const rootDependChunk = appContract.depends(rootContext, ["defaultName", "defaultToken"]);
const appDependAll = appContract.depends(app);
const appDependChunk = appContract.depends(app, ["defaultAge"]);

rootDependAll.defaultAge.then((result) => {});
rootDependAll.defaultName.then((result) => {});
rootDependAll.defaultToken.then((result) => {});

rootDependChunk.defaultName.then((result) => {});
rootDependChunk.defaultToken.then((result) => {});

appDependAll.defaultAge.then((result) => {});
appDependAll.defaultName.then((result) => {});
appDependAll.defaultToken.then((result) => {});

appDependChunk.defaultAge.then((result) => {});
