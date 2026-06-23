import { useEffect, useState } from "react";
import { FaChurch, FaSeedling, FaSchool } from "react-icons/fa";
import { motion } from "framer-motion";
import { Skeleton, SkeletonCard } from "@/shared/ui";
import { useHistoryStore } from "@/modules/admin/store/historyStore";

export function HistorySection({ isLoading = false }: { isLoading?: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const publicRecords = useHistoryStore((s) => s.publicRecords);
  const isPublicLoading = useHistoryStore((s) => s.isPublicLoading);
  const fetchPublicRecords = useHistoryStore((s) => s.fetchPublicRecords);

  useEffect(() => {
    fetchPublicRecords().catch(() => {
      // Preserve the last known records
    });
  }, [fetchPublicRecords]);

  // Map store records to the timeline shape; fall back to empty array
  const historyTimeline = publicRecords.map((record) => ({
    year: record.fields.year || record.title,
    event: record.fields.content || "",
  }));

  const historyHighlights = [
    {
      icon: FaChurch,
      title: "Religious Heritage",
      description:
        "Early mission activity and the dedication to St. James the Apostle shaped Libmanan's colonial-era identity.",
    },
    {
      icon: FaSeedling,
      title: "Agricultural Identity",
      description:
        'Wikipedia identifies Libmanan as the "Rice Granary of Camarines Sur", reflecting its long-standing farming economy.',
    },
    {
      icon: FaSchool,
      title: "Civic Growth",
      description:
        "The establishment of public schools and local government milestones highlights steady institutional development.",
    },
  ];

  const visibleTimeline = isExpanded
    ? historyTimeline
    : historyTimeline.slice(0, 5);

  return (
    <section className="bg-white py-16">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center gap-3">
            <div>
              {isLoading || isPublicLoading ? (
                <>
                  <Skeleton className="h-9 w-72 mb-2" />
                  <Skeleton className="h-5 w-80" />
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-neutral-900 lg:text-3xl">
                    Brief History of Libmanan
                  </h2>
                  <p className="mt-1 text-sm text-neutral-500">
                    A quick look at key milestones from Libmanan's recorded past
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] xl:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
            {isLoading || isPublicLoading ? (
              <>
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <SkeletonCard key={index} className="relative pl-6">
                      <div className="absolute left-[-1.15rem] top-6 h-3 w-3 rounded-full border-2 border-neutral-300 bg-neutral-200" />
                      <Skeleton className="h-6 w-32 mb-3" />
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-5/6" />
                    </SkeletonCard>
                  ))}
                </div>
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <SkeletonCard key={index}>
                      <div className="flex items-start gap-3">
                        <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-40" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-5/6" />
                        </div>
                      </div>
                    </SkeletonCard>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="relative pl-6">
                  <div className="absolute bottom-0 left-2 top-0 w-px bg-neutral-300" />

                  <div className="space-y-4">
                    {visibleTimeline.map((item) => (
                      <div
                        key={item.year}
                        className="relative rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-neutral-900 hover:bg-neutral-50"
                      >
                        <div className="absolute left-[-1.45rem] top-6 h-3 w-3 rounded-full border-2 border-neutral-900 bg-white transition-transform duration-300 hover:scale-125" />
                        <div className="inline-flex rounded-full bg-neutral-900 px-3 py-1 text-xs font-semibold text-white">
                          {item.year}
                        </div>
                        <p className="mt-3 text-sm leading-6 text-neutral-700">
                          {item.event}
                        </p>
                      </div>
                    ))}
                  </div>

                  {historyTimeline.length > 5 ? (
                    <div className="mt-5">
                      <button
                        type="button"
                        onClick={() => setIsExpanded((current) => !current)}
                        className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-400 hover:text-neutral-900"
                      >
                        {isExpanded ? "View Less" : "View More"}
                      </button>
                    </div>
                  ) : null}
                </div>

                <div className="space-y-4 lg:sticky lg:top-[110px]">
                  {historyHighlights.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.title}
                        className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700">
                            <Icon className="text-sm" />
                          </div>
                          <div>
                            <h3 className="text-base font-semibold text-neutral-900">
                              {item.title}
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-neutral-500">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-neutral-500">
                      Source Note
                    </p>
                    <p className="mt-2 text-sm leading-6 text-neutral-500">
                      Timeline details are adapted from the history section and
                      infobox of the Libmanan article on Wikipedia.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

HistorySection.displayName = "HistorySection";

export default HistorySection;
