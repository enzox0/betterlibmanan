import type { StatsCardProps } from "../../types/admin.types";
import type React from "react";
import { motion } from "framer-motion";

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
  if (trend === "up") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="w-3.5 h-3.5"
        aria-label="Trending up"
      >
        <path
          fillRule="evenodd"
          d="M10 17a.75.75 0 0 1-.75-.75V5.612L5.29 9.77a.75.75 0 0 1-1.08-1.04l5.25-5.5a.75.75 0 0 1 1.08 0l5.25 5.5a.75.75 0 1 1-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0 1 10 17Z"
          clipRule="evenodd"
        />
      </svg>
    );
  }
  if (trend === "down") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="w-3.5 h-3.5"
        aria-label="Trending down"
      >
        <path
          fillRule="evenodd"
          d="M10 3a.75.75 0 0 1 .75.75v10.638l3.96-4.158a.75.75 0 1 1 1.08 1.04l-5.25 5.5a.75.75 0 0 1-1.08 0l-5.25-5.5a.75.75 0 1 1 1.08-1.04l3.96 4.158V3.75A.75.75 0 0 1 10 3Z"
          clipRule="evenodd"
        />
      </svg>
    );
  }
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="w-3.5 h-3.5"
      aria-label="Neutral trend"
    >
      <path
        fillRule="evenodd"
        d="M4 10a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H4.75A.75.75 0 0 1 4 10Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function BlueIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <rect width="7" height="7" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
      <rect width="7" height="7" x="3" y="14" rx="1" />
    </svg>
  );
}

function GreenIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function YellowIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function BlueClockIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

const accentIcons: Record<StatsCardProps["accentColor"], React.ReactNode> = {
  blue: <BlueIcon />,
  green: <GreenIcon />,
  yellow: <YellowIcon />,
  red: <BlueClockIcon />,
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
