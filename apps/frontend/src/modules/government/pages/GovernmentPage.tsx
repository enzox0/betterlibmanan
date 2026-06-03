
import { motion } from 'framer-motion';
import { FaEnvelope, FaPhone, FaClock, FaExternalLinkAlt, FaBuilding, FaUsers, FaMapMarkerAlt } from 'react-icons/fa';
import { mockGovernmentData } from '../data/mockData';
import { Link } from 'react-router-dom';

export function GovernmentPage() {
  const data = mockGovernmentData;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gray-900 py-12 sm:py-16">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent"></div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        >
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
              Government Structure & Officials
            </h1>
            <p className="mt-3 text-sm text-gray-300 sm:text-base">
              Meet the leadership and offices serving Libmanan
            </p>
          </div>
        </motion.div>
      </section>

      {/* Executive Branch */}
      <section className="py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8"
          >
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl mb-2">Executive Branch</h2>
            <p className="text-gray-600">The executive officials leading Libmanan's governance</p>
          </motion.div>
          
          <div className="grid gap-6 sm:grid-cols-2">
            {data.executive.map((official, index) => (
              <motion.div
                key={official.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-blue-300 hover:shadow-lg hover:scale-[1.01]"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-700">
                    <FaBuilding className="text-2xl" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 mb-1">{official.title}</p>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">{official.name}</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <FaEnvelope className="text-gray-400 text-xs" />
                        <a href={`mailto:${official.email}`} className="hover:text-blue-600 hover:underline">{official.email}</a>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaPhone className="text-gray-400 text-xs" />
                        <a href={`tel:${official.phone}`} className="hover:text-blue-600 hover:underline">{official.phone}</a>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaClock className="text-gray-400 text-xs" />
                        <span>{official.hours}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Legislative Branch */}
      <section className="py-8 sm:py-12 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8"
          >
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl mb-2">Legislative Branch</h2>
            <p className="text-gray-600">Sangguniang Bayan Members</p>
          </motion.div>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.legislative.map((official, index) => (
              <motion.div
                key={official.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:border-blue-300 hover:shadow-lg"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-700">
                    <FaUsers className="text-lg" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 mb-1">{official.position}</p>
                    <h3 className="text-sm font-bold text-gray-900">{official.name}</h3>
                    <p className="mt-2 text-xs text-gray-600">{official.committees.join(', ')}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Municipal Offices */}
      <section className="py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8"
          >
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl mb-2">Municipal Offices</h2>
            <p className="text-gray-600">Department Heads & Key Offices</p>
          </motion.div>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.offices.map((office, index) => (
              <motion.div
                key={office.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.03 }}
                className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:border-blue-300 hover:shadow-lg"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
                    <FaBuilding className="text-lg" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-gray-900">{office.name}</h3>
                    <p className="mt-1 text-xs text-gray-600 mb-3">{office.description}</p>
                    <div className="space-y-1 text-xs text-gray-600">
                      {office.phone && (
                        <div className="flex items-center gap-2">
                          <FaPhone className="text-gray-400" />
                          <a href={`tel:${office.phone}`} className="hover:text-blue-600 hover:underline">{office.phone}</a>
                        </div>
                      )}
                      {office.email && (
                        <div className="flex items-center gap-2">
                          <FaEnvelope className="text-gray-400" />
                          <a href={`mailto:${office.email}`} className="hover:text-blue-600 hover:underline">{office.email}</a>
                        </div>
                      )}
                    </div>
                    {office.link && (
                      <Link
                        to={office.link}
                        className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        <span>View Services</span>
                        <FaExternalLinkAlt className="text-[10px]" />
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Barangays */}
      <section className="py-8 sm:py-12 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8"
          >
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl mb-2">Barangay Units</h2>
            <p className="text-gray-600">Barangays of Libmanan</p>
          </motion.div>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {data.barangays.map((barangay, index) => (
              <motion.div
                key={barangay.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.02 }}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 hover:border-blue-300 hover:shadow-lg"
              >
                <h3 className="text-sm font-bold text-gray-900 mb-2">{barangay.name}</h3>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>{barangay.captain}</p>
                  <div className="flex items-center gap-2">
                    <FaPhone className="text-gray-400" />
                    <a href={`tel:${barangay.phone}`} className="hover:text-blue-600 hover:underline">{barangay.phone}</a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

GovernmentPage.displayName = 'GovernmentPage';

export default GovernmentPage;

