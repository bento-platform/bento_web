import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import type { ToolkitStore } from "@reduxjs/toolkit/dist/configureStore";

import { LS_OPENID_CONFIG_KEY } from "bento-auth-js";
import type { OIDCSliceState } from "bento-auth-js";

import { readFromLocalStorage, writeToLocalStorage } from "./utils/localStorageUtils";
import rootReducer from "./reducers";

// The Immutability Middleware is only present in DEV builds.
// These options prevent delay warnings caused by large states in DEV mode by increasing the warning delay.
// See Redux Toolkit doc: https://redux-toolkit.js.org/api/getDefaultMiddleware#development
const IMMUTABILITY_OPTIONS = {
  thunk: true,
  immutableCheck: false,
  serializableCheck: false,
};

const persistedState: { openIdConfiguration?: OIDCSliceState } = {};
const persistedOpenIDConfig = readFromLocalStorage<OIDCSliceState>(LS_OPENID_CONFIG_KEY);
if (persistedOpenIDConfig) {
  console.debug("attempting to load OpenID configuration from localStorage");
  persistedState.openIdConfiguration = persistedOpenIDConfig;
}

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(IMMUTABILITY_OPTIONS),
  preloadedState: persistedState,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/**
 * Custom observeStore utility for enhanced 'store.subscribe' behaviour.
 *
 * The 'store.subscribe' method has no notion of previous/next state, so it is triggered on
 * every action, which leads to unnecessary subscriber executions.
 *
 * The onChange callback is only invoked if a change is detected on the selected state.
 *
 * See Redux store.subscribe doc: https://redux.js.org/api/store#subscribelistener
 */
const observeStore = <T>(store: ToolkitStore, select: (state: RootState) => T, onChange: (state: T) => void) => {
  let currentState: T;

  const handleChange = () => {
    const nextState = select(store.getState());
    if (nextState !== currentState) {
      currentState = nextState;
      onChange(currentState);
    }
  };

  const unsubscribe = store.subscribe(handleChange);
  handleChange();
  return unsubscribe;
};

observeStore(
  store,
  (state) => state.openIdConfiguration,
  (currentState) => {
    const { data, expiry, isFetching } = currentState;
    if (data && expiry && !isFetching) {
      writeToLocalStorage(LS_OPENID_CONFIG_KEY, { data, expiry, isFetching });
    }
  },
);
