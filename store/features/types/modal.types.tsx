/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ModalState {
  type: ModalType;
  props?: Record<string, any>;
  component_name: string | null; // Component name as string
  dismissible?: boolean;
  closeOnNavigate?: boolean;
  is_open: boolean;
  is_fullscreen_open: boolean; // Separate state for fullscreen modals
  previewImage: boolean;
  title?: string;
  description: string;
  media_urls: string[];
  index: number;
  data_id: string;
  modal_function: string;
  ref?: string;
}
export const popup = "popup";
export const drawer = "drawer";
export const bottom = "bottom";
export const fullscreen = "fullscreen";

export type ModalType = "popup" | "drawer" | "bottom" | "fullscreen";

export enum MODAL_FUNCTION_ENUM {
  CANCEL_TICKET = "CANCEL_TICKET",
}
export enum MODAL_COMPONENTS {
  LOGIN_MODAL = "login-modal",
  REGISTER_MODAL = "register-modal",
  BETSLIP_MODAL = "betslip-modal",
  GAME_OPTIONS_MODAL = "game-options-modal",
  SUCCESS_MODAL = "success-modal",
  CHANGE_PASSWORD_MODAL = "change-password-modal",
}
