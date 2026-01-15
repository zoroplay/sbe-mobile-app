import { CashDeskState, CashDeskFormData } from "../types/cashdesk.types";

export const initialCashDeskFormData: CashDeskFormData = {
  eventId: "",
  eventDate: "",
  event: "",
  smartCode: "",
  fixture: undefined,
  odds: "",
  is_edit: false,
};

export const initialCashdeskState: CashDeskState = {
  form_data: [initialCashDeskFormData],
};
