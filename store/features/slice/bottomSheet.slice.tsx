import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  BOTTOM_SHEET_COMPONENT_ENUM,
  type BottomSheetState,
} from "../types/bottomSheet.types";
import { initialBottomSheetState } from "../constants/bottomsheet";

export interface BottomSheetItem {
  id: string;
  number: string;
  code: string;
  label: string;
}

export interface BottomSheetSection {
  title: string;
  items: BottomSheetItem[];
}

const bottomSheetSlice = createSlice({
  name: "bottomSheet",
  initialState: initialBottomSheetState,
  reducers: {
    showBottomSheet: (
      state: BottomSheetState,
      action: PayloadAction<{
        component_name: BOTTOM_SHEET_COMPONENT_ENUM;
        title?: string;
        snap_points?: string[];
      }>
    ) => {
      state.is_open = true;
      state.component_name = action.payload.component_name || "Menu";
      state.title = action.payload.title || "Menu";
      state.snap_points = action.payload.snap_points || ["90%"];
    },
    hideBottomSheet: (state) => {
      state.is_open = false;
      // state.component_name = undefined;
      state.sections = undefined;
      state.onItemPress = undefined;
      state.snap_points = undefined;
    },
  },
});

export const { showBottomSheet, hideBottomSheet } = bottomSheetSlice.actions;
export default bottomSheetSlice.reducer;
