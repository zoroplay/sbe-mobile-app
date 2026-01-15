import { BottomSheetState } from "../types/bottomSheet.types";

export const initialBottomSheetState: BottomSheetState = {
  is_open: false,
  component_name: "",
  title: "",
  sections: [],
  onItemPress: undefined,
  snap_points: ["90%"],
};
