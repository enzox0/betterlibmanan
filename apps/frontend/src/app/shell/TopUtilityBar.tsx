import { useEffect } from "react";
import { useEmergencyContactsStore } from "@/modules/admin/store/emergencyContactsStore";
import { resolveIcon } from "@/modules/admin/components/records/ReactIconPicker";

export function TopUtilityBar() {
  const publicRecords = useEmergencyContactsStore((s) => s.publicRecords);
  const isPublicLoading = useEmergencyContactsStore((s) => s.isPublicLoading);
  const fetchPublicRecords = useEmergencyContactsStore(
    (s) => s.fetchPublicRecords,
  );

  useEffect(() => {
    fetchPublicRecords().catch(() => {
      // Fall back silently — cached records remain visible.
    });
  }, [fetchPublicRecords]);

  // Show a subtle placeholder while the first fetch is in flight.
  if (isPublicLoading && publicRecords.length === 0) {
    return (
      <div className="bg-red-900 text-white py-0.5 sm:py-2 overflow-hidden">
        <div className="flex items-center justify-center gap-2 text-[10px] sm:text-xs font-medium opacity-60 leading-tight">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
          <span>Loading emergency contacts…</span>
        </div>
      </div>
    );
  }

  // Nothing to show — render nothing rather than an empty red bar.
  if (publicRecords.length === 0) return null;

  return (
    <div className="bg-red-900 text-white py-0.5 sm:py-2 overflow-hidden">
      {/*
       * Seamless infinite marquee:
       * Three copies are rendered so that as copy-1 exits the viewport,
       * copy-2 is already mid-screen and copy-3 is queued behind it.
       * The animation translates by exactly -33.333…% (one copy width),
       * then snaps back to 0% — the jump is invisible because the next
       * copy is identical, giving a gapless loop at any scroll speed.
       */}
      <div className="marquee-track">
        {[0, 1, 2].map((setIndex) => (
          <div
            key={setIndex}
            className="marquee-set"
            aria-hidden={setIndex > 0}
          >
            {publicRecords.map((contact) => {
              const Icon = resolveIcon(contact.fields.icon ?? "");
              const number = contact.fields.number ?? "";
              const name = contact.fields.name ?? contact.title;
              return (
                <a
                  key={contact.id}
                  href={`tel:${number.replace(/\s/g, "")}`}
                  className="flex items-center gap-2 mx-6 sm:mx-12 hover:text-yellow-300 transition-colors text-[10px] sm:text-xs font-medium leading-tight"
                >
                  <Icon className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0" />
                  <span>
                    {name}: {number}
                  </span>
                </a>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
