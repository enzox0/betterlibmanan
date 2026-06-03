import { FaUsers, FaBuilding, FaAward, FaMapMarkedAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Skeleton } from '@/shared/ui';

export function AtAGlanceSection({ isLoading = false }: { isLoading?: boolean }) {
  const statistics = [
    { 
      label: 'Population', 
      value: '110,000+', 
      sub: '2024 Census',
      icon: FaUsers
    },
    { 
      label: 'Barangays', 
      value: '75', 
      sub: 'Administrative Units',
      icon: FaBuilding
    },
    { 
      label: 'Income Class', 
      value: '1st Class', 
      sub: 'Municipality',
      icon: FaAward
    },
    { 
      label: 'Land Area', 
      value: '348.54 km²', 
      sub: 'Total Municipal Area',
      icon: FaMapMarkedAlt
    }
  ];

  return (
    <section className="bg-neutral-100 py-16">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
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
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-900">Libmanan at a Glance</h2>
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
              : statistics.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={stat.label}
                      className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-5 transition-all duration-200 hover:border-neutral-300 hover:shadow-md"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700">
                        <Icon className="text-sm" />
                      </div>

                      <div>
                        <div className="text-2xl font-bold text-neutral-900 lg:text-3xl">{stat.value}</div>
                        <div className="mt-1 text-base font-semibold text-neutral-900">{stat.label}</div>
                        <div className="mt-1 text-xs sm:text-sm text-neutral-500">{stat.sub}</div>
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

AtAGlanceSection.displayName = 'AtAGlanceSection';

export default AtAGlanceSection;
