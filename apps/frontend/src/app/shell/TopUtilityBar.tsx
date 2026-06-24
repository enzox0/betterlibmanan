import { useEffect } from "react";
import { useEmergencyContactsStore } from "@/modules/admin/store/emergencyContactsStore";
import { resolveIcon } from "@/modules/admin/components/records/ReactIconPicker";

export function TopUtilityBar() {
  const publicRecords = useEmergencyContactsStore((s) => s.publicRecords);
  const fetchPublicRecords = useEmergencyContactsStore(
    (s) => s.fetchPublicRecords,
  );

  useEffect(() => {
    fetchPublicRecords().catch(() => {
      // Fall back silently — cached records remain visible.
    });
  }, [fetchPublicRecords]);

  // Nothing to show — render nothing rather than an empty red bar.
  if (publicRecords.length === 0) return null;

  return (
    <div className="bg-red-900 text-white py-2 overflow-hidden">
      <div className="flex whitespace-nowrap animate-marquee">
        {/* Duplicate the list so the marquee loops seamlessly */}
        {[...publicRecords, ...publicRecords].map((contact, index) => {
          const Icon = resolveIcon(contact.fields.icon ?? "");
          const number = contact.fields.number ?? "";
          const name = contact.fields.name ?? contact.title;
          return (
            <a
              key={`${contact.id}-${index}`}
              href={`tel:${number.replace(/\s/g, "")}`}
              className="flex items-center gap-2 mx-6 sm:mx-12 hover:text-yellow-300 transition-colors text-[11px] sm:text-xs font-medium"
            >
              <Icon className="h-3 w-3 shrink-0" />
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
