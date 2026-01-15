import environmentConfig from "@/store/services/configs/environment.config";

export const brandName = () => {
  switch (Number(environmentConfig.CLIENT_ID)) {
    case 3:
      return "maxbet";
    case 10:
      return "betcruz";
    case 9:
      return "bet24";
    default:
      return "SportsBook Engine";
  }
};
