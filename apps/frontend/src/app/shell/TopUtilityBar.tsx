import {
  FaShieldAlt,
  FaHospital,
  FaFire,
  FaBuilding,
  FaExclamationTriangle,
  FaBroadcastTower,
} from "react-icons/fa";
import type { IconType } from "react-icons";
import { useAdminStore } from "@/modules/admin/store/adminStore";

// Maps the icon slug stored in the admin store to the matching react-icons component.
const ICON_MAP: Record<string, IconType> = {
  shield: FaShieldAlt,
  hospital: FaHospital,
  fire: FaFire,
  building: FaBuilding,
  warning: FaExclamationTriangle,
  broadcast: FaBroadcastTower,
};

export function TopUtilityBar() {
  const allRecords = useAdminStore((s) => s.records);

  // Only published emergency contacts are shown in the marquee.
  const emergencyContacts = (allRecords["emergency-contacts"] ?? []).filter(
    (r) => r.status === "published",
  );

  // Nothing to show — render nothing rather than an empty red bar.
  if (emergencyContacts.length === 0) return null;

  return (
    <div className="bg-red-900 text-white py-2 overflow-hidden">
      <div className="flex whitespace-nowrap animate-marquee">
        {/* Duplicate the list so the marquee loops seamlessly */}
        {[...emergencyContacts, ...emergencyContacts].map((contact, index) => {
          const Icon = ICON_MAP[contact.fields.icon ?? "shield"] ?? FaShieldAlt;
          const number = contact.fields.number ?? "";
          const name = contact.fields.name ?? contact.title;
          return (
            <a
              key={`${contact.id}-${index}`}
              href={`tel:${number.replace(/\s/g, "")}`}
              className="flex items-center gap-2 mx-6 sm:mx-12 hover:text-yellow-300 transition-colors text-[11px] sm:text-xs font-medium"
            >
              <Icon size={12} className="shrink-0" />
              <span>
                {name}: {number}
              </span>
            </a>
          );
        })}
      </div>
      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-flex;
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
}
