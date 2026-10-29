import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { userApi } from "./api/Userapi";
import Userreducer from "./slices/Userslice";

import {
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import createWebStorageImport from "redux-persist/lib/storage/createWebStorage";

const createWebStorage =
  (createWebStorageImport as unknown as { default?: typeof createWebStorageImport })
    .default ?? createWebStorageImport;

const storage = createWebStorage("local");

const userPersistConfig = {
  key: "user",
  version: 1,
  storage,
};

const persistedUserReducer = persistReducer(userPersistConfig, Userreducer);

const rootReducer = combineReducers({
  [userApi.reducerPath]: userApi.reducer,
  user: persistedUserReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(userApi.middleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
