import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  initialCashDeskFormData,
  initialCashdeskState,
} from "../constants/cashdesk.constants";
import { CashDeskFormData } from "../types/cashdesk.types";
import { add, set } from "date-fns";
import { PreMatchFixture } from "../../../../../android-retail-app-test/src/store/features/types/fixtures.types";

const CashDeskSlice = createSlice({
  name: "cashdesk",
  initialState: initialCashdeskState,
  reducers: {
    setFormData: (state, { payload }: PayloadAction<CashDeskFormData[]>) => {
      state.form_data = payload;
    },
    removeCashDeskItem: (
      state,
      { payload }: PayloadAction<{ event_id: string }>
    ) => {
      state.form_data = state.form_data.filter(
        (item) => item.eventId !== payload.event_id
      );
    },
    addCashDeskItem: (state) => {
      state.form_data.push(initialCashDeskFormData);
    },
    setCashDeskItem: (
      state,
      {
        payload,
      }: PayloadAction<{
        index: number;
        event_id?: string;
        event?: string;
        smart_code?: string;
        event_date?: string;
        fixture?: PreMatchFixture;
        odds?: string;
      }>
    ) => {
      const { index, event_id, smart_code, event_date, fixture } = payload;
      const form = state.form_data[index];
      state.form_data[index].eventId = event_id ?? form.eventId;
      state.form_data[index].smartCode = smart_code ?? form.smartCode;
      state.form_data[index].eventDate = event_date ?? form.eventDate;
      state.form_data[index].fixture = fixture ?? form.fixture;
      state.form_data[index].odds = payload.odds ?? form.odds;
      state.form_data[index].event = payload.event ?? form.event;
    },
  },
});
export const {
  setFormData,
  removeCashDeskItem,
  addCashDeskItem,
  setCashDeskItem,
} = CashDeskSlice.actions;

export default CashDeskSlice.reducer;
