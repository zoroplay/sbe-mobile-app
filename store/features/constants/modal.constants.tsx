import { ModalState } from "../types/modal.types";

export const initialState: ModalState = {
  type: "popup",
  props: {},
  component_name: null,
  dismissible: true,
  closeOnNavigate: false,
  is_open: false,
  is_fullscreen_open: false, // Separate state for fullscreen modals
  title: "",
  media_urls: [],
  index: 0,
  data_id: "",
  previewImage: false,
  modal_function: "",
  description: "",
  ref: undefined,
};
