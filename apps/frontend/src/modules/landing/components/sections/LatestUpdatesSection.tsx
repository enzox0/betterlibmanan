import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCalendarAlt, FaArrowRight } from "react-icons/fa";
import { motion } from "framer-motion";
import { Skeleton, SkeletonCard } from "@/shared/ui";
import { useLatestUpdatesStore } from "@/modules/admin/store/latestUpdatesStore";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function formatDisplayDate(isoDate: string): string {
  if (!isoDate) return "—";
  const [year, month, day] = isoDate.split("-");
  const monthName = MONTH_NAMES[parseInt(month, 10) - 1] ?? "";
  return `${monthName} ${parseInt(day, 10)}, ${year}`;
}

export function LatestUpdatesSection({
  isLoading = false,
}: {
  isLoading?: boolean;
}) {
  const navigate = useNavigate();
  const publicRecords = useLatestUpdatesStore((s) => s.publicRecords);
  const isPublicLoading = useLatestUpdatesStore((s) => s.isPublicLoading);
  const fetchPublicRecords = useLatestUpdatesStore((s) => s.fetchPublicRecords);

  useEffect(() => {
    fetchPublicRecords().catch(() => {});
  }, [fetchPublicRecords]);

  const loading = isLoading || isPublicLoading;
  const displayedRecords = publicRecords.slice(0, 3);

  return (
    <section className="py-16 bg-neutral-100">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between gap-4">
            {loading ? (
              <>
                <div className="space-y-2">
                  <Skeleton className="h-9 w-48" />
                  <Skeleton className="h-5 w-80" />
                </div>
              </>
            ) : (
              <>
                <div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-neutral-900">
                    Latest Updates
                  </h2>
                  <p className="mt-2 text-sm text-neutral-500">
                    Stay informed about what's happening in our municipality
                  </p>
                </div>
                {publicRecords.length > 3 && (
                  <button
                    onClick={() => navigate("/latest-updates")}
                    style={{ minHeight: 0 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-neutral-900 text-white hover:bg-neutral-700 active:bg-black transition-all"
                  >
                    View More
                    <FaArrowRight size={10} />
                  </button>
                )}
              </>
            )}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <SkeletonCard key={index} className="overflow-hidden p-0">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-6 space-y-4">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </SkeletonCard>
              ))
            ) : displayedRecords.length === 0 ? (
              <p className="col-span-full text-sm text-neutral-400 italic">
                No updates available yet.
              </p>
            ) : (
              displayedRecords.map((record) => (
                <div
                  key={record.id}
                  className="bg-white rounded-2xl overflow-hidden border border-neutral-200 hover:shadow-xl transition-all cursor-pointer"
                >
                  <div className="relative h-36 sm:h-48 overflow-hidden bg-neutral-200">
                    <img
                      src="/betterlibmanan.png"
                      alt={record.title}
                      className="h-full w-full object-cover grayscale"
                    />
                  </div>

                  <div className="p-4 sm:p-6">
                    {record.fields.date && (
                      <div className="flex items-center gap-2 text-sm text-neutral-500 mb-3 sm:mb-4">
                        <FaCalendarAlt aria-hidden="true" />
                        <span>{formatDisplayDate(record.fields.date)}</span>
                      </div>
                    )}
                    <h3 className="text-base sm:text-xl font-semibold text-neutral-900 mb-2 sm:mb-3">
                      {record.title}
                    </h3>
                    {record.fields.summary && (
                      <p className="text-sm text-neutral-600 line-clamp-2 sm:line-clamp-none">
                        {record.fields.summary}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

LatestUpdatesSection.displayName = "LatestUpdatesSection";

export default LatestUpdatesSection;
