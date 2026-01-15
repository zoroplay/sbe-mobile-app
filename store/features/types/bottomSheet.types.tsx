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

export interface BottomSheetState {
  is_open: boolean;
  component_name: string;
  title?: string;
  sections?: BottomSheetSection[];
  onItemPress?: (item: BottomSheetItem) => void;
  snap_points?: string[];
}

export enum BOTTOM_SHEET_COMPONENT_ENUM {
  MENU_BAR = "MenuBar",
  SPORT_MENU = "SportMenu",
  GAME_OPTIONS = "GameOptions",
  COUPON_DETAILS = "CouponDetails",
}
