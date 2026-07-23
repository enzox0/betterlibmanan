import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaCalendarAlt, FaArrowLeft, FaSpinner } from "react-icons/fa";
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

export function LatestUpdatesPage() {
  const navigate = useNavigate();
  const publicRecords = useLatestUpdatesStore((s) => s.publicRecords);
  const isPublicLoading = useLatestUpdatesStore((s) => s.isPublicLoading);
  const fetchPublicRecords = useLatestUpdatesStore((s) => s.fetchPublicRecords);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    fetchPublicRecords().catch(() => {});
  }, [fetchPublicRecords]);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Page Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              style={{ minHeight: 0 }}
              className="p-2 rounded-xl hover:bg-neutral-100 active:bg-neutral-200 transition-colors text-neutral-500 shrink-0"
              aria-label="Back to Home"
            >
              <FaArrowLeft size={14} />
            </button>

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 leading-tight">
                Latest Updates
              </h1>
              <p className="text-sm text-neutral-500 mt-0.5">
                Stay informed about what's happening in our municipality
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
        {isPublicLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={index} className="overflow-hidden p-0">
                <Skeleton className="h-48 w-full" />
                <div className="p-6 space-y-4">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </SkeletonCard>
            ))}
          </div>
        ) : publicRecords.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-3 text-center">
            <FaCalendarAlt size={28} className="text-neutral-300" />
            <p className="text-sm text-neutral-400 font-medium">
              No updates available yet.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicRecords.map((record, index) => (
              <article
                key={record.id}
                itemScope
                itemType="https://schema.org/NewsArticle"
              >
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: Math.min(index * 0.04, 0.5),
                  }}
                  className="bg-white rounded-xl overflow-hidden border border-neutral-200 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="relative h-36 sm:h-48 overflow-hidden bg-neutral-200">
                    <img
                      src={
                        (record as any).fields?.image ||
                        (record as any).fields?.thumbnail ||
                        "/betterlibmanan.png"
                      }
                      alt={`${record.title} — LGU Libmanan update`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/betterlibmanan.png";
                        (e.target as HTMLImageElement).className =
                          "h-full w-full object-cover grayscale opacity-40";
                      }}
                    />
                  </div>

                  <div className="p-4 sm:p-6">
                    {record.fields.date && (
                      <div className="flex items-center gap-2 text-sm text-neutral-500 mb-3 sm:mb-4">
                        <FaCalendarAlt aria-hidden="true" />
                        <span>{formatDisplayDate(record.fields.date)}</span>
                      </div>
                    )}
                    <h3
                      className="text-base sm:text-xl font-semibold text-neutral-900 mb-2 sm:mb-3"
                      itemProp="headline"
                    >
                      {record.title}
                    </h3>
                    {record.fields.summary && (
                      <p
                        className="text-sm text-neutral-600 line-clamp-3"
                        itemProp="description"
                      >
                        {record.fields.summary}
                      </p>
                    )}
                  </div>
                </motion.div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

LatestUpdatesPage.displayName = "LatestUpdatesPage";

export default LatestUpdatesPage;
