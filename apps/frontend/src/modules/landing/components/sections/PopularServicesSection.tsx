import { useEffect, useMemo } from "react";
import * as LucideIcons from "react-icons/lu";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Skeleton, SkeletonCard } from "@/shared/ui";
import { usePopularServicesStore } from "@/modules/admin/store/popular-services.store";
import { resolveIcon } from "@/modules/admin/components/records/ReactIconPicker";

export function PopularServicesSection({
  isLoading = false,
}: {
  isLoading?: boolean;
}) {
  const publicRecords = usePopularServicesStore((s) => s.publicRecords);
  const fetchPublicRecords = usePopularServicesStore(
    (s) => s.fetchPublicRecords,
  );
  const isStoreLoading = usePopularServicesStore((s) => s.isPublicLoading);

  useEffect(() => {
    fetchPublicRecords().catch(() => {
      // Preserve the last known records
    });
  }, [fetchPublicRecords]);

  const popularServices = useMemo(() => {
    const services = publicRecords.map((record) => ({
      icon: resolveIcon(record.fields.icon || ""),
      title: record.fields.name || record.title,
      description: record.fields.description || "",
      featured: false,
      path: "/services",
    }));

    services.push({
      icon: LucideIcons.LuLayoutGrid,
      title: "View All Services",
      description: "Browse complete directory",
      featured: true,
      path: "/services",
    });

    return services;
  }, [publicRecords]);

  return (
    <section className="bg-neutral-100 py-16">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            {isLoading || isStoreLoading ? (
              <>
                <Skeleton className="h-9 w-52 mb-2" />
                <Skeleton className="h-5 w-72" />
              </>
            ) : (
              <>
                <h2 className="mb-2 text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-900">
                  Popular Municipal Services
                </h2>
                <p className="text-sm text-neutral-500">
                  Quick access to frequently requested municipal services
                </p>
              </>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {isLoading || isStoreLoading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <SkeletonCard key={index}>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-4 w-56" />
                      </div>
                    </div>
                  </SkeletonCard>
                ))
              : popularServices.map((service) => {
                  const Icon = service.icon;
                  return (
                    <Link
                      key={service.title}
                      to={service.path}
                      className={[
                        "group flex items-center gap-3 rounded-xl border p-5 transition-all duration-200",
                        service.featured
                          ? "border-neutral-900 bg-neutral-900 text-white shadow-lg shadow-neutral-300/40"
                          : "border-neutral-200 bg-white text-neutral-900 hover:border-neutral-300 hover:shadow-md",
                      ].join(" ")}
                    >
                      <div
                        className={[
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border",
                          service.featured
                            ? "border-white/10 bg-white/10 text-white"
                            : "border-neutral-200 bg-neutral-100 text-neutral-700",
                        ].join(" ")}
                      >
                        <Icon className="text-sm" />
                      </div>

                      <div>
                        <h3
                          className={[
                            "text-base font-semibold",
                            service.featured
                              ? "text-white"
                              : "text-neutral-900",
                          ].join(" ")}
                        >
                          {service.title}
                        </h3>
                        <p
                          className={[
                            "mt-1 text-xs sm:text-sm",
                            service.featured
                              ? "text-neutral-300"
                              : "text-neutral-500",
                          ].join(" ")}
                        >
                          {service.description}
                        </p>
                      </div>
                    </Link>
                  );
                })}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

PopularServicesSection.displayName = "PopularServicesSection";

export default PopularServicesSection;
