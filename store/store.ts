import { configureStore, combineReducers } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import { loggerMiddleware } from "./middleware/loggerMiddleware";
import {
  notification,
  user,
  modal,
  betting,
  bottomSheet,
  fixtures,
  live_games,
  cashdesk,
  app,
  withdrawal,
} from "./features/slice";
import { apiSlice } from "./services/constants/api.service";

const persistConfig = {
  key: "bet24-root:v1:2.5",
  storage: AsyncStorage,
  whitelist: [
    "app",
    "user",
    "modal",
    "notification",
    "betting",
    "bottomSheet",
    "fixtures",
    "live_games",
    "cashdesk",
    "withdrawal",
  ],
  blacklist: ["app.tournament_details", "fixtures.cashdesk_fixtures"],
};

const rootReducer = combineReducers({
  app,
  user,
  modal,
  notification,
  betting,
  bottomSheet,
  fixtures,
  live_games,
  cashdesk,
  withdrawal,
  [apiSlice.reducerPath]: apiSlice.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          FLUSH,
          REHYDRATE,
          PAUSE,
          PERSIST,
          PURGE,
          REGISTER,
          "modal/showModal",
          "api/executeMutation/fulfilled",
          "user/setUser",
          "modal.props.handleMonthSelect",
          "modal.props.currentDate",
        ],
        ignoredPaths: [
          "modal.props.handleMonthSelect",
          "modal.props.currentDate",
          "modal/showModal",
          "api/executeMutation/fulfilled",
          "user/setUser",
        ],
      },
    }).concat([apiSlice.middleware, loggerMiddleware] as any),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
