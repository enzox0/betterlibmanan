import { motion } from 'framer-motion';
import { mockStatisticsData } from '../data/mockData';

export function StatisticsPage() {
  const data = mockStatisticsData;

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
            <p className="text-sm text-gray-400 mb-2">Municipal Data</p>
            <h1 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
              Municipal Statistics
            </h1>
            <p className="mt-3 text-sm text-gray-300 sm:text-base">
              Data and statistics about Libmanan, Camarines Sur
            </p>
          </div>
        </motion.div>
      </section>

      {/* Municipal Stats */}
      <section className="py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {data.municipal.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-lg font-semibold text-gray-800 mt-2">{stat.label}</p>
                <p className="text-sm text-gray-500">{stat.subLabel}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Finance Section */}
      <section className="py-8 sm:py-12 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl mb-2">Finance</h2>
            <p className="text-gray-600">{data.finance.title}</p>
            <p className="text-sm text-gray-500">{data.finance.subtitle}</p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-3 mb-8">
            {data.finance.stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="rounded-xl border border-gray-200 bg-gray-50 p-6"
              >
                <p className="text-sm font-medium text-gray-600 mb-2">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                {stat.subValue && <p className="text-sm text-gray-500 mt-2">{stat.subValue}</p>}
              </motion.div>
            ))}
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 mb-6">
            <p className="text-lg font-semibold text-gray-900 mb-4">Income Composition</p>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              {data.finance.composition.map((item, index) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                  <p className="text-xs sm:text-sm text-gray-700">
                    {item.label} {item.percentage}%
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 w-full h-3 bg-gray-200 rounded-full overflow-hidden flex">
              {data.finance.composition.map((item, index) => (
                <div
                  key={item.label}
                  className={`h-full ${item.color}`}
                  style={{ width: `${item.percentage}%` }}
                ></div>
              ))}
            </div>
          </div>

          <p className="text-sm text-gray-500">
            Source: {data.finance.source}
          </p>
        </div>
      </section>

      {/* Population Trends */}
      <section className="py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl mb-2">Growth</h2>
            <p className="text-gray-600">Population Trends</p>
            <p className="text-sm text-gray-500">Historical growth from 1990 to 2024</p>
          </motion.div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="grid gap-6 sm:grid-cols-3">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">1990</p>
                <p className="text-2xl font-bold text-gray-900">{data.populationTrend.population.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">2024</p>
                <p className="text-2xl font-bold text-gray-900">69,296</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Growth</p>
                <p className="text-2xl font-bold text-blue-600">+{data.populationTrend.growth}%</p>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-500 mt-4">
            Source: Philippine Statistics Authority (PSA)
          </p>
        </div>
      </section>

      {/* Population by Barangay */}
      <section className="py-8 sm:py-12 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl mb-2">Distribution</h2>
            <p className="text-gray-600">Population by Barangay</p>
            <p className="text-sm text-gray-500">2024 Census of Population</p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.barangayPopulation.slice(0, 12).map((brgy, index) => (
              <motion.div
                key={brgy.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="rounded-xl border border-gray-200 bg-white p-4"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-gray-500">#{brgy.rank}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{brgy.name}</p>
                    <p className="text-sm text-gray-600">{brgy.population.toLocaleString()}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <p className="text-sm text-gray-500 mt-6">
            Source: Philippine Statistics Authority (PSA) - 2024 Census
          </p>
        </div>
      </section>

      {/* Economy Section */}
      <section className="py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl mb-2">Economy</h2>
            <p className="text-gray-600">Economic Indicators</p>
            <p className="text-sm text-gray-500">Key economic data and business statistics</p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-3 mb-8">
            {data.economy.indicators.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="rounded-xl border border-gray-200 bg-white p-6"
              >
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm font-medium text-gray-600 mt-2">{stat.label}</p>
                {stat.subLabel && <p className="text-xs text-green-600 mt-1">{stat.subLabel}</p>}
              </motion.div>
            ))}
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 mb-6">
            <p className="text-lg font-semibold text-gray-900 mb-4">Economic Sectors</p>
            <div className="space-y-4">
              {data.economy.sectors.map((sector, index) => (
                <div key={sector.name}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-700">{sector.name}</span>
                    <span className="text-sm font-medium text-gray-900">{sector.percentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600"
                      style={{ width: `${sector.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm text-gray-500">
            Source: {data.economy.source}
          </p>
        </div>
      </section>

      {/* Poverty Section */}
      <section className="py-8 sm:py-12 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl mb-2">Poverty</h2>
            <p className="text-gray-600">Poverty Statistics</p>
            <p className="text-sm text-gray-500">2021 City and Municipal Level Poverty Estimates</p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2">
            {data.poverty.map((poverty, index) => (
              <motion.div
                key={poverty.year}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="rounded-xl border border-gray-200 bg-white p-6"
              >
                <p className="text-sm font-medium text-gray-600 mb-2">{poverty.year}</p>
                <p className="text-3xl font-bold text-gray-900">{poverty.rate}%</p>
                <p className="text-xs text-gray-500 mt-2">90% CI: {poverty.confidenceInterval}</p>
                {poverty.change !== 0 && (
                  <p className={`text-sm font-semibold mt-2 ${poverty.change < 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {poverty.change < 0 ? poverty.change : '+' + poverty.change}%
                  </p>
                )}
              </motion.div>
            ))}
          </div>

          <p className="text-sm text-gray-500 mt-4">
            Source: Philippine Statistics Authority (PSA) - 2021 Poverty Estimates
          </p>
        </div>
      </section>

      {/* Competitiveness Section */}
      <section className="py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl mb-2">Competitiveness</h2>
            <p className="text-gray-600">Libmanan Competitive Index</p>
            <p className="text-sm text-gray-500">
              Cities and Municipalities Competitiveness Index (CMCI) Performance 2016-2024
            </p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.competitiveness.overview.map((item, index) => (
              <motion.div
                key={item.category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="rounded-xl border border-gray-200 bg-white p-6"
              >
                <p className="text-sm font-medium text-gray-600 mb-2">{item.category}</p>
                <p className="text-2xl font-bold text-gray-900">{item.score.toFixed(2)}</p>
                <p className={`text-sm font-semibold mt-2 ${item.change > 0 ? 'text-green-600' : item.change < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                  {item.changeLabel}
                </p>
              </motion.div>
            ))}
          </div>

          <p className="text-sm text-gray-500 mt-6">
            Source: {data.competitiveness.source}
          </p>
        </div>
      </section>
    </div>
  );
}

StatisticsPage.displayName = 'StatisticsPage';

export default StatisticsPage;
