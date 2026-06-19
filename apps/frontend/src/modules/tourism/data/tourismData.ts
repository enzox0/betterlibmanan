import {
  FaLeaf,
  FaWater,
  FaMountain,
  FaChurch,
  FaCamera,
  FaThLarge,
  FaFish,
  FaTree,
  FaLandmark,
  FaBus,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaShieldAlt,
} from "react-icons/fa";
import type { ComponentType } from "react";

interface TouristSpot {
  id: string;
  name: string;
  location: string;
  description: string;
  category: string;
  categoryLabel: string;
  categoryIcon: ComponentType<{ className?: string }>;
  bgColor: string;
  rating?: string;
  entryFee?: string;
  tags?: string[];
}

interface FoodSpot {
  id: string;
  name: string;
  description: string;
}

interface TravelTip {
  id: string;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}

interface Category {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

export const categories: Category[] = [
  { id: "all", label: "All", icon: FaThLarge },
  { id: "nature", label: "Nature", icon: FaLeaf },
  { id: "water", label: "Rivers & Lakes", icon: FaWater },
  { id: "heritage", label: "Heritage", icon: FaChurch },
  { id: "viewpoint", label: "Viewpoints", icon: FaMountain },
  { id: "photo", label: "Photo Spots", icon: FaCamera },
];

export const touristSpots: TouristSpot[] = [
  {
    id: "libmanan-cave",
    name: "Libmanan Cave",
    location: "Barangay Palestina, Libmanan",
    description:
      "A stunning limestone cave system featuring dramatic stalactite and stalagmite formations. One of the most popular natural attractions in the Bicol region, the cave has multiple chambers worth exploring.",
    category: "nature",
    categoryLabel: "Nature",
    categoryIcon: FaLeaf,
    bgColor: "bg-gradient-to-br from-emerald-700 to-emerald-900",
    rating: "4.8",
    entryFee: "Minimal environmental fee applies",
    tags: ["Cave", "Geology", "Adventure", "Guided Tour"],
  },
  {
    id: "sipocot-river",
    name: "Sipocot River",
    location: "Along Libmanan–Sipocot boundary",
    description:
      "A pristine river offering scenic boat rides and fishing activities. The calm waters and lush riverside vegetation make it a perfect retreat for nature lovers and photographers alike.",
    category: "water",
    categoryLabel: "Rivers & Lakes",
    categoryIcon: FaWater,
    bgColor: "bg-gradient-to-br from-blue-600 to-blue-900",
    rating: "4.5",
    tags: ["River", "Fishing", "Boat Ride", "Photography"],
  },
  {
    id: "san-pedro-church",
    name: "San Pedro Apostol Parish",
    location: "Libmanan Town Proper",
    description:
      "A centuries-old stone church that stands as one of the finest examples of Spanish colonial religious architecture in Camarines Sur. The facade and bell tower are beautifully preserved.",
    category: "heritage",
    categoryLabel: "Heritage",
    categoryIcon: FaChurch,
    bgColor: "bg-gradient-to-br from-amber-700 to-amber-900",
    rating: "4.9",
    entryFee: "Free",
    tags: ["Colonial Architecture", "History", "Religion", "Heritage"],
  },
  {
    id: "pulantuna-hill",
    name: "Pulantuna Hill",
    location: "Libmanan Hills, Camarines Sur",
    description:
      "A rolling highland offering panoramic views of Libmanan valley and the distant Camarines Sur coastline. Popular among hikers and photographers seeking sunrise and sunset vistas.",
    category: "viewpoint",
    categoryLabel: "Viewpoints",
    categoryIcon: FaMountain,
    bgColor: "bg-gradient-to-br from-purple-700 to-purple-900",
    rating: "4.6",
    tags: ["Hiking", "Sunrise", "Panoramic View", "Photography"],
  },
  {
    id: "libmanan-wetlands",
    name: "Libmanan Wetlands",
    location: "Barangay Potot, Libmanan",
    description:
      "A protected wetland ecosystem rich in bird life and aquatic flora. Birdwatchers and eco-tourists visit year-round to spot migratory birds and native species in their natural habitat.",
    category: "nature",
    categoryLabel: "Nature",
    categoryIcon: FaTree,
    bgColor: "bg-gradient-to-br from-teal-700 to-teal-900",
    rating: "4.4",
    entryFee: "Free",
    tags: ["Birdwatching", "Ecology", "Wetland", "Nature Walk"],
  },
  {
    id: "old-libmanan-bridge",
    name: "Old Libmanan Bridge",
    location: "Libmanan Town Proper",
    description:
      "A historic Spanish-era stone bridge spanning a tributary of the Libmanan River. The structure is a registered cultural heritage site and a beloved landmark for locals and tourists.",
    category: "photo",
    categoryLabel: "Photo Spots",
    categoryIcon: FaCamera,
    bgColor: "bg-gradient-to-br from-rose-700 to-rose-900",
    rating: "4.7",
    entryFee: "Free",
    tags: ["Historical", "Architecture", "Photography", "Heritage"],
  },
  {
    id: "libmanan-fish-sanctuary",
    name: "Libmanan Fish Sanctuary",
    location: "Barangay San Ramon, Libmanan",
    description:
      "A community-managed freshwater fish sanctuary where visitors can observe diverse aquatic life in a crystal-clear river environment. Educational tours can be arranged with the local fisher folk.",
    category: "water",
    categoryLabel: "Rivers & Lakes",
    categoryIcon: FaFish,
    bgColor: "bg-gradient-to-br from-cyan-700 to-cyan-900",
    rating: "4.3",
    entryFee: "Small conservation fee",
    tags: ["Marine Life", "Conservation", "Educational", "Snorkeling"],
  },
  {
    id: "libmanan-plaza",
    name: "Libmanan Municipal Plaza",
    location: "Libmanan Town Center",
    description:
      "The vibrant heart of Libmanan, lined with heritage trees and framed by historic government buildings. The plaza hosts major festivals, markets, and community events throughout the year.",
    category: "heritage",
    categoryLabel: "Heritage",
    categoryIcon: FaLandmark,
    bgColor: "bg-gradient-to-br from-indigo-700 to-indigo-900",
    rating: "4.5",
    entryFee: "Free",
    tags: ["Heritage", "Culture", "Events", "Architecture"],
  },
];

export const foodSpots: FoodSpot[] = [
  {
    id: "pinangat",
    name: "Pinangat",
    description:
      "Iconic Bicolano dish of taro leaves wrapped around pork or fish, simmered in coconut cream with spicy chilies.",
  },
  {
    id: "laing",
    name: "Laing",
    description:
      "Dried taro leaves slow-cooked in rich coconut milk with shrimp paste and chili — a staple of Bicol cuisine.",
  },
  {
    id: "bicol-express",
    name: "Bicol Express",
    description:
      "Tender pork cubes cooked with coconut milk, shrimp paste, and a generous amount of green and red chilies.",
  },
  {
    id: "tinutong",
    name: "Tinutong",
    description:
      "A locally beloved coconut-based rice dessert cooked in bamboo, often sold at roadside stalls and markets.",
  },
  {
    id: "pili-nuts",
    name: "Pili Nut Products",
    description:
      "Camarines Sur's prized pili nut used in candy, brittle, and pastries — the perfect pasalubong souvenir.",
  },
  {
    id: "pansit-buko",
    name: "Buko Pie",
    description:
      "Fresh young coconut encased in a flaky, buttery crust — a classic Filipino pastry found throughout Bicol.",
  },
  {
    id: "kinuwa",
    name: "Kinuwa",
    description:
      "A traditional Bicolano porridge made from millet and coconut milk, served as a hearty breakfast or merienda.",
  },
  {
    id: "tinuktok",
    name: "Tinuktok",
    description:
      "Rolled taro leaves stuffed with ground pork and shrimp, cooked to perfection in coconut milk.",
  },
];

export const travelTips: TravelTip[] = [
  {
    id: "transport",
    title: "Getting Around",
    description:
      "Tricycles and motorcycles (habal-habal) are the primary local transport. Rent one for the day to easily reach barangay tourist spots.",
    icon: FaBus,
  },
  {
    id: "season",
    title: "Best Season",
    description:
      "Visit from November to April for dry weather. Avoid typhoon season (June–October) for outdoor activities.",
    icon: FaCalendarAlt,
  },
  {
    id: "safety",
    title: "Safety & Etiquette",
    description:
      "Respect local customs, especially at heritage churches. Ask permission before photographing locals or their property.",
    icon: FaShieldAlt,
  },
  {
    id: "guide",
    title: "Hire a Local Guide",
    description:
      "For cave tours and river trips, hire a local guide through the Municipal Tourism Office for a safer and richer experience.",
    icon: FaMapMarkerAlt,
  },
];
