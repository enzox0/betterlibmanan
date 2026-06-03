import { useState } from 'react';
import { FaChurch, FaSeedling, FaSchool } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Skeleton, SkeletonCard } from '@/shared/ui';

export function HistorySection({ isLoading = false }: { isLoading?: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const historyTimeline = [
    {
      year: 'Original Name',
      event: 'The first name of town was "Piglabanan".'
    },
    {
      year: 'March 18, 1484',
      event: 'Invasion of the Moros; those who killed were buried beside the Present Church.'
    },
    {
      year: 'February 1572',
      event: 'Construction of the First Church.'
    },
    {
      year: 'September 15, 1574',
      event: 'Changing the town name from Piglabanan to Libmanan by fray Bartolome Cabello.'
    },
    {
      year: '1586-1589',
      event: 'Construction of the Second Church of Libmanan.'
    },
    {
      year: '1732',
      event: 'Start of the first town government of Libmanan.'
    },
    {
      year: '1838',
      event: 'Construction of Catholic Cemetery In Barangay Puro Batia.'
    },
    {
      year: '1903',
      event: 'Founding of the first public schools.'
    },
    {
      year: '1915',
      event: 'Construction of the municipal cemetery In Barangay Puro Batia.'
    },
    {
      year: '1921',
      event: 'Construction of the Rizal Monument.'
    },
    {
      year: '1927',
      event: 'Passing of the MRR Co. in Libmanan.'
    },
    {
      year: '1929',
      event: 'Construction of MRR Co. (Philippine National Railways) Bridge.'
    },
    {
      year: '1930-31',
      event: 'Installation of the water system.'
    },
    {
      year: '1933',
      event: 'Construction of first and second market pavilion.'
    },
    {
      year: '1939-40',
      event: 'Construction of a concrete municipal hall under Mayor Francisco Frondozo.'
    },
    {
      year: '1941',
      event: 'Construction of the post office under Mayor Teodoro Dilanco.'
    },
    {
      year: 'March 3, 1951',
      event: 'Naming of Barangay Bagumbayan by Municipal Council.'
    },
    {
      year: '1954-57',
      event: 'Construction of the municipal irrigation system.'
    },
    {
      year: '1955',
      event: 'Renaming the streets of the Poblacion and improvement of the Town Plaza.'
    },
    {
      year: '1956',
      event: 'Construction of the 30-Door Market.'
    },
    {
      year: 'May 1957',
      event: 'Dredging of the Libmanan River.'
    },
    {
      year: '1957',
      event: 'Construction of a two-story building for the private Central School and also a public toilet.'
    },
    {
      year: 'March 1961',
      event: 'Construction of the concrete Easter tower under Mayor Amadeo Castaneda.'
    },
    {
      year: '1978',
      event: 'Construction of the Bulaong Bridge.'
    },
    {
      year: '1993',
      event: 'Construction of the Libmanan Town Arc in Barangay Potot.'
    },
    {
      year: '2015',
      event: 'The Canonical coronation of the venerated statue of Our Lady of the Pillar who is the patroness of the Diocese of Libmanan.'
    },
    {
      year: 'September 2020',
      event: 'Redevelopment of Market in the Poblacion Area.'
    },
    {
      year: '2021 to 22',
      event: 'Developments and redevelopments of roads both in rural and urban areas.'
    }
  ];

  const historyHighlights = [
    {
      icon: FaChurch,
      title: 'Religious Heritage',
      description: 'Early mission activity and the dedication to St. James the Apostle shaped Libmanan\'s colonial-era identity.'
    },
    {
      icon: FaSeedling,
      title: 'Agricultural Identity',
      description: 'Wikipedia identifies Libmanan as the "Rice Granary of Camarines Sur", reflecting its long-standing farming economy.'
    },
    {
      icon: FaSchool,
      title: 'Civic Growth',
      description: 'The establishment of public schools and local government milestones highlights steady institutional development.'
    }
  ];

  const visibleTimeline = isExpanded ? historyTimeline : historyTimeline.slice(0, 5);

  return (
    <section className="bg-neutral-100 py-16">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center gap-3">
            <div>
              {isLoading ? (
                <>
                  <Skeleton className="h-9 w-72 mb-2" />
                  <Skeleton className="h-5 w-80" />
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-neutral-900 lg:text-3xl">Brief History of Libmanan</h2>
                  <p className="mt-1 text-sm text-neutral-500">A quick look at key milestones from Libmanan's recorded past</p>
                </>
              )}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
            {isLoading ? (
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
                  {Array.from({ length: 4 }).map((_, index) => (
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
                      <div key={item.year} className="relative rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-neutral-900 hover:bg-neutral-50">
                        <div className="absolute left-[-1.45rem] top-6 h-3 w-3 rounded-full border-2 border-neutral-900 bg-white transition-transform duration-300 hover:scale-125" />
                        <div className="inline-flex rounded-full bg-neutral-900 px-3 py-1 text-xs font-semibold text-white">
                          {item.year}
                        </div>
                        <p className="mt-3 text-sm leading-6 text-neutral-700">{item.event}</p>
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
                        {isExpanded ? 'View Less' : 'View More'}
                      </button>
                    </div>
                  ) : null}
                </div>

                <div className="space-y-4 lg:sticky lg:top-[110px]">
                  {historyHighlights.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.title} className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700">
                            <Icon className="text-sm" />
                          </div>
                          <div>
                            <h3 className="text-base font-semibold text-neutral-900">{item.title}</h3>
                            <p className="mt-2 text-sm leading-6 text-neutral-500">{item.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-neutral-500">Source Note</p>
                    <p className="mt-2 text-sm leading-6 text-neutral-500">
                      Timeline details are adapted from the history section and infobox of the Libmanan article on Wikipedia.
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

HistorySection.displayName = 'HistorySection';

export default HistorySection;
