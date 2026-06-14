import { FaEnvelope, FaPhone, FaUserTie } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Skeleton, SkeletonCard } from '@/shared/ui';

export function LeadershipSection({ isLoading = false }: { isLoading?: boolean }) {
  const officials = [
    {
      position: 'Municipal Mayor',
      name: 'Hon. Edelson M. Marfil',
      email: 'mayor@libmanan.gov.ph',
      phone: '(054) 123-4567'
    },
    {
      position: 'Municipal Vice Mayor',
      name: 'Hon. Ariel Oriño',
      email: 'vicemayor@libmanan.gov.ph',
      phone: '(054) 123-4568'
    }
  ];

  return (
    <section className="bg-white py-16">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.7 }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              {isLoading ? (
                <>
                  <Skeleton className="h-9 w-56 mb-2" />
                  <Skeleton className="h-5 w-64" />
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-neutral-900 lg:text-3xl">Municipal Leadership</h2>
                  <p className="mt-2 text-sm text-neutral-500">Meet our dedicated public servants</p>
                </>
              )}
            </div>

            {!isLoading && (
              <button className="inline-flex items-center gap-2 text-sm font-medium text-neutral-700 transition-colors hover:text-neutral-900">
                <span>→</span>
                View All Officials
              </button>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {isLoading
              ? Array.from({ length: 2 }).map((_, index) => (
                  <SkeletonCard key={index} className="text-center p-8">
                    <div className="mb-5 flex justify-center">
                      <Skeleton className="h-7 w-40 rounded-full" />
                    </div>
                    <div className="mb-4 flex justify-center">
                      <Skeleton className="h-12 w-12 rounded-full" />
                    </div>
                    <Skeleton className="h-7 w-48 mx-auto mb-5" />
                    <div className="space-y-3">
                      <Skeleton className="h-5 w-56 mx-auto" />
                      <Skeleton className="h-5 w-52 mx-auto" />
                    </div>
                  </SkeletonCard>
                ))
              : officials.map((official) => (
                  <div
                    key={official.position}
                    className="rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm transition-all duration-200 hover:border-neutral-300 hover:shadow-md"
                  >
                    <div className="mb-5 flex justify-center">
                      <span className="inline-flex items-center rounded-full bg-neutral-900 px-4 py-2 text-xs font-semibold text-white">
                        {official.position}
                      </span>
                    </div>

                    <div className="mb-4 flex justify-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-700">
                        <FaUserTie className="text-base" />
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-neutral-900">{official.name}</h3>

                    <div className="mt-5 space-y-3">
                      <a
                        href={`mailto:${official.email}`}
                        className="flex items-center justify-center gap-2 text-sm text-neutral-500 transition-colors hover:text-neutral-900"
                      >
                        <FaEnvelope className="text-xs" />
                        <span>{official.email}</span>
                      </a>
                      <a
                        href={`tel:${official.phone}`}
                        className="flex items-center justify-center gap-2 text-sm text-neutral-500 transition-colors hover:text-neutral-900"
                      >
                        <FaPhone className="text-xs" />
                        <span>{official.phone}</span>
                      </a>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

LeadershipSection.displayName = 'LeadershipSection';

export default LeadershipSection;
