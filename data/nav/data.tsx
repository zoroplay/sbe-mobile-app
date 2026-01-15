import {
  Entypo,
  FontAwesome,
  FontAwesome5,
  FontAwesome6,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  SimpleLineIcons,
} from "@expo/vector-icons";

export const categoryIconMap = ({
  font_size = 24,
  color = "white",
  name,
}: {
  font_size: number;
  color: string;
  name?: string | null;
}) => {
  if (!name) {
    return <Entypo name="basecamp" size={font_size} color={color} />;
  }
  switch (name.toLowerCase()) {
    case "new games":
      return (
        <MaterialIcons name="new-releases" size={font_size} color={color} />
      );
    case "popular":
      return (
        <MaterialCommunityIcons name="fire" size={font_size} color={color} />
      );

    case "hot games":
      return <FontAwesome5 name="hotjar" size={font_size} color={color} />;

    case "slots":
      return (
        <MaterialCommunityIcons
          name="slot-machine"
          size={font_size}
          color={color}
        />
      );
    case "drops&wins":
      return (
        <MaterialCommunityIcons name="gift" size={font_size} color={color} />
      );
    case "table games":
      return (
        <MaterialCommunityIcons name="cards" size={font_size} color={color} />
      );
    case "instant wins":
      return (
        <MaterialCommunityIcons
          name="lightning-bolt"
          size={font_size}
          color={color}
        />
      );
    case "live casino":
      return (
        <MaterialCommunityIcons
          name="video-wireless"
          size={font_size}
          color={color}
        />
      );
    case "virtual sports":
      return (
        <MaterialCommunityIcons
          name="soccer-field"
          size={font_size}
          color={color}
        />
      );
    case "discover":
      return <FontAwesome6 name="cc-discover" size={font_size} color={color} />;
    case "bonus games":
      return <MaterialIcons name="games" size={font_size} color={color} />;
    case "qtech lobby":
      return (
        <SimpleLineIcons name="globe-alt" size={font_size} color={color} />
      );
    case "soccer":
      return (
        <FontAwesome name="soccer-ball-o" size={font_size} color={color} />
      );
    case "basketball":
      return (
        <MaterialIcons
          name="sports-basketball"
          size={font_size}
          color={color}
        />
      );
    case "ice hockey":
      return (
        <MaterialCommunityIcons
          name="hockey-puck"
          size={font_size}
          color={color}
        />
      );
    case "tennis":
      return (
        <MaterialCommunityIcons name="tennis" size={font_size} color={color} />
      );
    case "cricket":
      return (
        <MaterialCommunityIcons name="cricket" size={font_size} color={color} />
      );
    case "baseball":
      return (
        <MaterialCommunityIcons
          name="baseball"
          size={font_size}
          color={color}
        />
      );
    case "handball":
      return (
        <MaterialCommunityIcons
          name="handball"
          size={font_size}
          color={color}
        />
      );
    case "floorball":
      return <Ionicons name="football-sharp" size={font_size} color={color} />;
    case "boxing":
      return (
        <MaterialCommunityIcons
          name="boxing-glove"
          size={font_size}
          color={color}
        />
      );
    case "rugby":
      return (
        <MaterialCommunityIcons name="rugby" size={font_size} color={color} />
      );
    case "bandy":
      return (
        <MaterialCommunityIcons
          name="hockey-sticks"
          size={font_size}
          color={color}
        />
      );
    case "american football":
      return (
        <MaterialIcons name="sports-football" size={font_size} color={color} />
      );
    case "snooker":
      return (
        <MaterialCommunityIcons
          name="billiards"
          size={font_size}
          color={color}
        />
      );
    case "table tennis":
      return (
        <MaterialCommunityIcons
          name="table-tennis"
          size={font_size}
          color={color}
        />
      );
    case "darts":
      return (
        <MaterialCommunityIcons
          name="bullseye-arrow"
          size={font_size}
          color={color}
        />
      );
    case "volleyball":
      return (
        <MaterialCommunityIcons
          name="volleyball"
          size={font_size}
          color={color}
        />
      );
    case "futsal":
      return (
        <MaterialIcons name="sports-soccer" size={font_size} color={color} />
      );
    case "esports":
      return (
        <MaterialCommunityIcons
          name="gamepad-variant"
          size={font_size}
          color={color}
        />
      );
    default:
      return <Entypo name="basecamp" size={font_size} color={color} />;
  }
};

export const sportIconMap = {
  Soccer: <FontAwesome name="soccer-ball-o" size={24} color="white" />,
  Basketball: (
    <MaterialIcons name="sports-basketball" size={24} color="white" />
  ),
  "Ice Hockey": (
    <MaterialCommunityIcons name="hockey-puck" size={24} color="white" />
  ),
  Handball: <MaterialCommunityIcons name="handball" size={24} color="white" />,
  Boxing: (
    <MaterialCommunityIcons name="boxing-glove" size={24} color="white" />
  ),
  Rugby: <MaterialCommunityIcons name="rugby" size={24} color="white" />,
  Bandy: (
    <MaterialCommunityIcons name="hockey-sticks" size={24} color="white" />
  ),
  "American Football": (
    <MaterialIcons name="sports-football" size={24} color="white" />
  ),
  Snooker: <MaterialCommunityIcons name="billiards" size={24} color="white" />,
  "Table Tennis": (
    <MaterialCommunityIcons name="table-tennis" size={24} color="white" />
  ),
  Cricket: <MaterialCommunityIcons name="cricket" size={24} color="white" />,
  Darts: (
    <MaterialCommunityIcons name="bullseye-arrow" size={24} color="white" />
  ),
  Volleyball: (
    <MaterialCommunityIcons name="volleyball" size={24} color="white" />
  ),
  "Field hockey": (
    <MaterialCommunityIcons name="hockey-sticks" size={24} color="white" />
  ),
  Waterpolo: (
    <MaterialCommunityIcons name="water-polo" size={24} color="white" />
  ),
  Futsal: <MaterialIcons name="sports-soccer" size={24} color="white" />,
  Badminton: (
    <MaterialCommunityIcons name="badminton" size={24} color="white" />
  ),
  "ESport Counter-Strike": (
    <MaterialCommunityIcons name="gamepad-variant" size={24} color="white" />
  ),
  "ESport Dota": (
    <MaterialCommunityIcons name="gamepad-variant" size={24} color="white" />
  ),
  MMA: <MaterialCommunityIcons name="karate" size={24} color="white" />,
} as const;

export type SportName = keyof typeof sportIconMap;

export const staticNav = [
  {
    name: "sports",
    link: "/(tabs)/az-menu",
    icon: <FontAwesome name="soccer-ball-o" size={24} color="white" />,
  },
  {
    name: "live",
    link: "/live",
    icon: <MaterialIcons name="live-tv" size={24} color="white" />,
  },
  {
    name: "casino",
    link: "/(casino)",
    icon: <MaterialIcons name="casino" size={24} color="white" />,
  },
  {
    name: "virtuals",
    // link: "/virtuals",
    icon: <MaterialIcons name="sports-esports" size={24} color="white" />,
  },
  {
    name: "Aviator",
    // link: "/aviator",
    icon: <FontAwesome name="paper-plane" size={24} color="white" />,
  },
  {
    name: "livescore",
    // link: "/livescore",
    icon: <MaterialIcons name="score" size={24} color="white" />,
  },
  {
    name: "Statistics",
    // link: "/statistics",
    icon: <FontAwesome name="bar-chart" size={24} color="white" />,
  },
  {
    name: "promotions",
    // link: "/promotions",
    icon: <MaterialIcons name="local-offer" size={24} color="white" />,
  },
];
export const casinoNav = [
  {
    name: "Discover",
    link: "/discover",
    icon: <FontAwesome6 name="cc-discover" size={24} color="white" />,
  },
  {
    name: "Bonus Games",
    link: "/bonus-games",
    icon: <MaterialIcons name="games" size={24} color="white" />,
  },
  {
    name: "QTech Lobby",
    link: "/qtech-lobby",
    icon: <SimpleLineIcons name="globe-alt" size={24} color="white" />,
  },
];
