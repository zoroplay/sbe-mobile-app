import { PreMatchFixture } from "./fixtures.types";

export interface CashDeskFormData {
  eventId: string;
  eventDate: string;
  event: string;
  smartCode: string;
  fixture?: PreMatchFixture;
  odds: string;
  is_edit: boolean;
}
export interface CashDeskState {
  form_data: CashDeskFormData[];
}
