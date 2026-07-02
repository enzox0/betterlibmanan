import type { IconType } from "react-icons";
import {
  FaFileAlt,
  FaBriefcase,
  FaMoneyBill,
  FaUsers,
  FaHeartbeat,
  FaSeedling,
  FaRoad,
  FaGraduationCap,
  FaShieldAlt,
  FaLeaf,
  FaStore,
  FaHeart,
  FaSmile,
  FaWallet,
  FaIdCard,
  FaAccessibleIcon,
  FaHammer,
  FaQuestionCircle,
  FaBuilding,
  FaTree,
  FaWater,
  FaFire,
  FaAmbulance,
  FaChild,
  FaHandHoldingHeart,
  FaRecycle,
} from "react-icons/fa";

/**
 * Maps icon key strings (stored in the backend) to React icon components.
 * Add new entries here as you introduce more icons to the system.
 */
export const SERVICE_ICON_MAP: Record<string, IconType> = {
  FaFileAlt,
  FaBriefcase,
  FaMoneyBill,
  FaUsers,
  FaHeartbeat,
  FaSeedling,
  FaRoad,
  FaGraduationCap,
  FaShieldAlt,
  FaLeaf,
  FaStore,
  FaHeart,
  FaSmile,
  FaWallet,
  FaIdCard,
  FaAccessibleIcon,
  FaHammer,
  FaQuestionCircle,
  FaBuilding,
  FaTree,
  FaWater,
  FaFire,
  FaAmbulance,
  FaChild,
  FaHandHoldingHeart,
  FaRecycle,
};

/** Resolve a string key to an icon component, falling back to FaFileAlt. */
export function resolveIcon(key: string | undefined): IconType {
  if (!key) return FaFileAlt;
  return SERVICE_ICON_MAP[key] ?? FaFileAlt;
}

/** All available icon keys for the picker in the admin form. */
export const ICON_KEYS = Object.keys(SERVICE_ICON_MAP);
