import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { initialState } from "../constants/modal.constants";
import type { ModalState, ModalType } from "../types";

export type ModalData<T extends boolean> = T extends true
  ? {
      description?: string;
      title?: string;
      modalFunction?: string;
      dataId?: string;
    }
  : string;

const ModalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    showModal: (
      state: ModalState,
      {
        payload,
      }: PayloadAction<{
        props?: Record<string, string | number>;
        component_name: string;
        dismissible?: boolean;
        closeOnNavigate?: boolean;
        title?: string;
        description?: string;
        media_urls?: string[];
        index?: number;
        data_id?: string;
        modal_function?: string;
        ref?: string;
      }>
    ) => {
      console.log("Showing modal:", payload.component_name);
      state.component_name = "";
      state.component_name = payload.component_name;
      state.props = payload.props;
      state.dismissible = true;
      state.closeOnNavigate = payload.closeOnNavigate;
      state.modal_function = payload.modal_function || "";
      state.ref = payload.ref || undefined;

      // Set the appropriate open state based on modal type
      // if (payload.type === "fullscreen") {
      //   state.is_fullscreen_open = true;
      //   state.is_open = false;
      // } else {
      state.is_open = true;
      state.is_fullscreen_open = false; // Keep fullscreen modals closed
      // }

      state.title = payload.title || state.title;
      state.description = payload.description || state.description;
      state.media_urls = payload.media_urls || [];
      state.index = payload.index || 0;
      state.data_id = payload.data_id || "";
    },
    openFullscreenModal: (
      state: ModalState,
      {
        payload,
      }: PayloadAction<{
        component_name: string;
        title: string;
        dismissible: boolean;
      }>
    ) => {
      state.component_name = payload.component_name;
      state.title = payload.title;
      state.dismissible = payload.dismissible;
      state.is_fullscreen_open = true;
      state.is_open = false;
    },
    closeModal: (state: ModalState) => {
      state.is_open = false;
      state.is_fullscreen_open = false;
      // state.type = null;
      state.component_name = null;
      // state.props = undefined;
      // state.title = undefined;
      state.media_urls = [];
      state.index = 0;
      state.data_id = "";
      state.previewImage = false;
    },
    closeFullscreenModal: (state: ModalState) => {
      state.props = undefined;
      state.component_name = null;
      state.is_fullscreen_open = false;
      // state.type = null;
    },

    // setRerender: (state: ModalState) => {
    //   if (state.rerender >= 10) {
    //     state.rerender = 0;
    //   }
    //   state.rerender += 1;
    // },
  },
});
export const {
  showModal,
  closeModal,
  closeFullscreenModal,
  openFullscreenModal,
} = ModalSlice.actions;
export default ModalSlice.reducer;
