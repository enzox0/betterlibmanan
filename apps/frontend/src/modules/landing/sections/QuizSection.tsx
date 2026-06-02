import { FaPlay } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Skeleton, SkeletonCard } from '../../../shared/ui';

export function QuizSection({ isLoading = false }: { isLoading?: boolean }) {
  return (
    <section className="bg-neutral-100 py-16">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.9 }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <SkeletonCard className="px-6 py-10 sm:px-8 lg:px-10">
              <div className="flex justify-center">
                <div className="w-full max-w-2xl space-y-4">
                  <Skeleton className="h-9 w-48" />
                  <Skeleton className="h-6 w-72" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-11/12" />
                  <Skeleton className="h-11 w-36 rounded-xl mt-2" />
                </div>
              </div>
            </SkeletonCard>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white px-6 py-10 sm:px-8 lg:px-10">
              <div className="flex justify-center">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900 lg:text-3xl">Libmanan Quiz</h2>
                  <p className="mt-2 text-base font-semibold text-neutral-800">
                    How well do you know Libmanan, Camarines Sur?
                  </p>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-500">
                    Explore your knowledge of Libmanan's heritage, cultural identity, and local landmarks
                    through a short interactive quiz designed to highlight the municipality's history and
                    significance.
                  </p>
                  <button className="mt-6 inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-800">
                    <FaPlay className="text-xs" />
                    Take the Quiz
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </section>
  );
}

QuizSection.displayName = 'QuizSection';

export default QuizSection;
