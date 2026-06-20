import type { StatsCardProps } from "../../types/admin.types";
import { motion } from "framer-motion";
import {
  LuArrowUp,
  LuArrowDown,
  LuMinus,
  LuLayoutDashboard,
  LuCircleCheck,
  LuFileText,
  LuClock,
} from "react-icons/lu";

const colorMap: Record<
  StatsCardProps["accentColor"],
  { bg: string; iconBg: string; iconColor: string; badge: string }
> = {
  blue: {
    bg: "bg-white",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    badge: "bg-blue-50 text-blue-700",
  },
  green: {
    bg: "bg-white",
    iconBg: "bg-green-50",
    iconColor: "text-green-600",
    badge: "bg-green-50 text-green-700",
  },
  yellow: {
    bg: "bg-white",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    badge: "bg-amber-50 text-amber-700",
  },
  red: {
    bg: "bg-white",
    iconBg: "bg-red-50",
    iconColor: "text-red-600",
    badge: "bg-red-50 text-red-700",
  },
};

function TrendIcon({ trend }: { trend: StatsCardProps["trend"] }) {
  if (trend === "up")
    return <LuArrowUp className="w-3.5 h-3.5" aria-label="Trending up" />;
  if (trend === "down")
    return <LuArrowDown className="w-3.5 h-3.5" aria-label="Trending down" />;
  return <LuMinus className="w-3.5 h-3.5" aria-label="Neutral trend" />;
}

const accentIcons: Record<StatsCardProps["accentColor"], React.ReactNode> = {
  blue: <LuLayoutDashboard className="h-5 w-5" aria-hidden="true" />,
  green: <LuCircleCheck className="h-5 w-5" aria-hidden="true" />,
  yellow: <LuFileText className="h-5 w-5" aria-hidden="true" />,
  red: <LuClock className="h-5 w-5" aria-hidden="true" />,
};

export function StatsCard({
  label,
  value,
  trend,
  accentColor,
}: StatsCardProps) {
  const { bg, iconBg, iconColor, badge } = colorMap[accentColor];

  return (
    <motion.div
      className={`${bg} rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
    >
      <div className="flex items-start justify-between">
        {/* Icon */}
        <div className={`${iconBg} ${iconColor} p-2.5 rounded-lg`}>
          {accentIcons[accentColor]}
        </div>
        {/* Trend badge */}
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${badge}`}
        >
          <TrendIcon trend={trend} />
        </span>
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-gray-900 leading-tight">
          {value}
        </p>
        <p className="mt-0.5 text-sm text-gray-500">{label}</p>
      </div>
    </motion.div>
  );
}

export default StatsCard;
