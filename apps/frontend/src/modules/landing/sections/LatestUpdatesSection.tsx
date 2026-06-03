import { FaCalendarAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Skeleton, SkeletonCard } from '@/shared/ui';

export function LatestUpdatesSection({ isLoading = false }: { isLoading?: boolean }) {
  const placeholderUpdates = [
    {
      title: 'Municipal Council Meeting',
      excerpt: 'Join us for the upcoming municipal council meeting to discuss important matters.',
      date: 'June 15, 2024'
    },
    {
      title: 'New Health Program Launch',
      excerpt: 'Introducing a new community health initiative for residents of Libmanan.',
      date: 'June 10, 2024'
    },
    {
      title: 'Road Infrastructure Project',
      excerpt: 'Major road improvement projects underway in key barangays.',
      date: 'June 5, 2024'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            {isLoading ? (
              <>
                <Skeleton className="h-9 w-48 mb-2" />
                <Skeleton className="h-5 w-80" />
              </>
            ) : (
              <>
                <h2 className="text-2xl lg:text-3xl font-bold text-neutral-900">Latest Updates</h2>
                <p className="mt-2 text-sm text-neutral-500">Stay informed about what's happening in our municipality</p>
              </>
            )}
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {isLoading
              ? Array.from({ length: 3 }).map((_, index) => (
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
              : placeholderUpdates.map((update, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-2xl overflow-hidden border border-neutral-200 hover:shadow-xl transition-all cursor-pointer"
                  >
                    <div className="h-48 bg-gradient-to-br from-neutral-200 to-neutral-300"></div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 text-sm text-neutral-500 mb-4">
                        <FaCalendarAlt />
                        <span>{update.date}</span>
                      </div>
                      <h3 className="text-xl font-semibold text-neutral-900 mb-3">{update.title}</h3>
                      <p className="text-neutral-600">{update.excerpt}</p>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

LatestUpdatesSection.displayName = 'LatestUpdatesSection';

export default LatestUpdatesSection;
