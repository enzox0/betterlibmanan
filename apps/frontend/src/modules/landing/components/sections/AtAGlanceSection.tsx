import { useEffect } from "react";
import { motion } from "framer-motion";
import { Skeleton } from "@/shared/ui";
import { useAtAGlanceStore } from "@/modules/admin/store/atAGlanceStore";
import { resolveIcon } from "@/modules/admin/components/records/ReactIconPicker";

export function AtAGlanceSection({
  isLoading: externalLoading = false,
}: {
  isLoading?: boolean;
}) {
  const publicRecords = useAtAGlanceStore((s) => s.publicRecords);
  const isPublicLoading = useAtAGlanceStore((s) => s.isPublicLoading);
  const fetchPublicRecords = useAtAGlanceStore((s) => s.fetchPublicRecords);

  useEffect(() => {
    fetchPublicRecords().catch(() => {});
  }, [fetchPublicRecords]);

  const isLoading = externalLoading || isPublicLoading;

  return (
    <section className="bg-white py-16">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {isLoading ? (
                <>
                  <Skeleton className="h-9 w-64 mb-2" />
                  <Skeleton className="h-5 w-72" />
                </>
              ) : (
                <>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-900">
                    Libmanan at a Glance
                  </h2>
                  <p className="mt-2 text-sm text-neutral-500">
                    Key facts and figures about our municipality
                  </p>
                </>
              )}
            </div>

            {!isLoading && (
              <a
                href="#"
                className="inline-flex items-center text-sm font-medium text-neutral-700 transition-colors hover:text-neutral-900"
              >
                <span className="mr-2 text-sm">→</span>
                View Statistics
              </a>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {isLoading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-5"
                  >
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-8 w-24" />
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                  </div>
                ))
              : publicRecords.length === 0
                ? null
                : publicRecords.map((record) => {
                    const Icon = resolveIcon(record.fields.icon ?? "");
                    return (
                      <div
                        key={record.id}
                        className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-5 transition-all duration-200 hover:border-neutral-300 hover:shadow-md"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700">
                          <Icon className="text-sm" />
                        </div>

                        <div>
                          <div className="text-2xl font-bold text-neutral-900 lg:text-3xl">
                            {record.fields.value}
                          </div>
                          <div className="mt-1 text-base font-semibold text-neutral-900">
                            {record.fields.label}
                          </div>
                          {record.fields.sub && (
                            <div className="mt-1 text-xs sm:text-sm text-neutral-500">
                              {record.fields.sub}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

AtAGlanceSection.displayName = "AtAGlanceSection";

export default AtAGlanceSection;
