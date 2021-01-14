import React, {
  FC,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { Button, Input, Space } from "antd";
import {
  Store,
  StoreApi,
  StoreCreator,
  context,
  getContextState,
  store,
} from "store-api";
import { signIn } from "api/v2/auth";

const pendingApi = store({
  init: false,
  api: ({ setState }) => ({
    on: () => setState(true),
    off: () => setState(false),
  }),
});

const authFormApi = store({
  init: { username: "", password: "", pin: "" },
  api: ({ setState, getState, reset }) => ({
    setUsername: (username: string) => setState({ ...getState(), username }),
    setPassword: (password: string) => setState({ ...getState(), password }),
    setPin: (pin: string) => setState({ ...getState(), pin }),
    submit: async () => {
      try {
        await signIn(getState());
        reset();
      } catch (error) {
        await new Promise((res) => setTimeout(res, 3000));
        // console.log(error.message);
      }
    },
    validate: () => {
      const state = getState();
      return (
        Boolean(state.username.trim()) &&
        Boolean(state.password.trim()) &&
        Boolean(state.pin.trim())
      );
    },
  }),
});

// Form for root-context
const pending = pendingApi({ name: "pending" });
const authForm = authFormApi({ name: "auth-form" });

authForm.api.submit.before.on(pending.api.on.call);
authForm.api.submit.after.on(({ result }) =>
  result.finally(pending.api.off.call)
);

const Context = createContext<any>(null);

function useStoreState<State, Api extends StoreApi<State>>(
  store: Store<State, Api>
) {
  const [state, setState] = useState<State>(store.getState());

  useEffect(() => {
    store.on(setState);

    return () => {
      store.off(setState);
    };
  }, [store]);

  return state;
}

function useContextStore<State, Api extends StoreApi<State>>(
  storeCreator: StoreCreator<State, Api>,
  payload: { name: string; init?: State }
): Store<State, Api> {
  const scope = useContext(Context);
  return scope(() => storeCreator(payload));
}

// PAGE

const form1 = context();
const form2 = context();

const names = {
  authForm: "auth-form",
  pending: "pending",
};

const dependPending = () => {
  const authForm = authFormApi({ name: names.authForm });
  const pending = pendingApi({ name: names.pending });

  authForm.api.submit.before.on(pending.api.on.call);
  authForm.api.submit.after.on(({ result }) =>
    result.finally(pending.api.off.call)
  );
};

form1(dependPending);
form2(dependPending);

const send = async () => {
  type AuthForm = ReturnType<typeof authFormApi>;

  const form1State = getContextState(form1);
  const form2State = getContextState(form2);

  const auth1: AuthForm = form1State.stores["auth-form"];
  const auth2: AuthForm = form2State.stores["auth-form"];

  if (auth1 && auth1.api.validate.call()) {
    await auth1.api.submit.call();
  } else if (auth2 && auth2.api.validate.call()) {
    await auth2.api.submit.call();
  }
};

export const PageAuth: FC = () => {
  return (
    <Space direction="vertical">
      <Context.Provider value={form1}>
        <PageAuthFormByContext />
      </Context.Provider>
      <Context.Provider value={form2}>
        <PageAuthFormByContext />
      </Context.Provider>
      <Button block onClick={send}>
        Send by
      </Button>
    </Space>
  );
};

export const PageAuthFormByContext: FC = () => {
  const authForm = useContextStore(authFormApi, { name: names.authForm });
  const pending = useContextStore(pendingApi, { name: names.pending });

  const form = useStoreState(authForm);
  const pendingValue = useStoreState(pending);

  return (
    <Space>
      <Input
        placeholder="Username"
        value={form.username}
        onChange={(event) =>
          authForm.api.setUsername.call(event.currentTarget.value)
        }
      />
      <Input
        placeholder="Password"
        type="password"
        value={form.password}
        onChange={(event) =>
          authForm.api.setPassword.call(event.currentTarget.value)
        }
      />
      <Input
        placeholder="Pin"
        value={form.pin}
        onChange={(event) =>
          authForm.api.setPin.call(event.currentTarget.value)
        }
      />
      <Button loading={pendingValue} onClick={authForm.api.submit.call}>
        Send
      </Button>
    </Space>
  );
};

export const PageAuthForm: FC = () => {
  const form = useStoreState(authForm);
  const pendingValue = useStoreState(pending);

  return (
    <Space>
      <Input
        placeholder="Username"
        value={form.username}
        onChange={(event) =>
          authForm.api.setUsername.call(event.currentTarget.value)
        }
      />
      <Input
        placeholder="Password"
        type="password"
        value={form.password}
        onChange={(event) =>
          authForm.api.setPassword.call(event.currentTarget.value)
        }
      />
      <Input
        placeholder="Pin"
        value={form.pin}
        onChange={(event) =>
          authForm.api.setPin.call(event.currentTarget.value)
        }
      />
      <Button loading={pendingValue} onClick={authForm.api.submit.call}>
        Send
      </Button>
    </Space>
  );
};
