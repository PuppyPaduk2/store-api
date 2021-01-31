import { store } from "../../store";
import { depend } from "../../depend";
import { context } from "../../context";
import { contractStores, contractDepends } from "./index";

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

const appContractStores = contractStores({
  userName: stringApi,
  userAge: numberApi,
  persent: numberApi,
  token: stringApi,
});

appContractStores.name.userName;
appContractStores.name.userAge;
appContractStores.name.persent;
appContractStores.name.token;

appContractStores.store.userName();
appContractStores.store.userAge(10);
appContractStores.store.persent();
appContractStores.store.token("123qwe");

const appStoresAll = appContractStores.stores()();

appStoresAll.userName.getState();
appStoresAll.userAge.getState();
appStoresAll.persent.getState();
appStoresAll.token.getState();

appContractStores.stores(["persent", "token"])({
  persent: 77,
  token: "zxcasd123",
}).token.getState();

const initName = depend({
  stores: appContractStores.config(["userName"]),
  handler: ({ userName }) => {
    return userName.api.set("Bob");
  },
});

const initAge = depend({
  stores: appContractStores.config(["userAge"]),
  handler: ({ userAge }) => {
    return userAge.api.set(10);
  },
});

const initAlise = depend({
  stores: appContractStores.config(),
  handler: (stores) => ({
    userName: stores.userName.api.set("Alise"),
    userAge: stores.userAge.api.set(5),
    persent: stores.persent.api.set(47),
    token: stores.token.api.set("qwe123"),
  }),
});

const appContractDepends = contractDepends({
  initName,
  initAge,
  initAlise,
});

appContractDepends.name.initName;
appContractDepends.name.initAge;
appContractDepends.name.initAlise;

appContractDepends.depend.initName().then((res) => {});
appContractDepends.depend.initAge().then((res) => {});
appContractDepends.depend.initAlise().then((res) => {});

contractDepends(appContractDepends.config());
const dependChunk = contractDepends(appContractDepends.config(["initAge"]));

dependChunk.depend.initAge().then((res) => {});

const appDependsAll = appContractDepends.depends()();

appDependsAll.initName.then((res) => {});
appDependsAll.initAge.then((res) => {});
appDependsAll.initAlise.then((res) => {});

const appDependsChunk = appContractDepends.depends([
 "initAlise"
])();

appDependsChunk.initAlise.then((res) => {});

context()(appContractStores.store.userName).getState();
context()(appContractStores.stores()).userAge.getState();
context()(appContractStores.stores(["userName", "token"])).token.getState();

context()(appContractDepends.depend.initName).then((res) => {});
context()(appContractDepends.depend.initAge).then((res) => {});
context()(appContractDepends.depend.initAlise).then((res) => {});
context()(appContractDepends.depends()).initAlise.then((res) => {});
context()(appContractDepends.depends(["initAge"])).initAge.then((res) => {});
