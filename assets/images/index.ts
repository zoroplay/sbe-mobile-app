// Helper to get Firebase Storage image for a league name
export function getFirebaseImage(name: string) {
  return {
    tournament: `https://firebasestorage.googleapis.com/v0/b/iron-envelope-405217.appspot.com/o/Top%20Leagues%2F${encodeURIComponent(name)}.png?alt=media`,
    team: `https://firebasestorage.googleapis.com/v0/b/iron-envelope-405217.appspot.com/o/teams%2F${encodeURIComponent(name)}.png?alt=media`,
    casino: `https://firebasestorage.googleapis.com/v0/b/iron-envelope-405217.appspot.com/o/Casino2%2F${encodeURIComponent(
      name.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()
    )}.png?alt=media`,
  };
}
export const localImages = {
  // adaptiveIcon: require("./adaptive-icon.png"),
  // favicon: require("./favicon.png"),
  // icon: require("./icon.png"),
  // splashIcon: require("./splash-icon.png"),
  bundesliga_logo: require("./bundesliga.png"),
  efl_championship_logo: require("./efl_championship_logo.png"),
  // // Logos
  // logo: require("./b_winners_logo.png"),
} as const;

export const remoteImages = {
  placeholder: "https://via.placeholder.com/300x200",
  avatar: "https://via.placeholder.com/100x100",

  profileDefault: "https://example.com/images/default-profile.png",
  bannerImage: "https://example.com/images/banner.jpg",
} as const;

// export const isRemoteImage = (key: ImageKey): key is RemoteImageKey => {
//   return key in remoteImages;
// };

export const images = {
  ...localImages,
  ...remoteImages,
} as const;
