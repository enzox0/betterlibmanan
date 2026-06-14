import { motion } from 'framer-motion';

interface ModulePlaceholderProps {
  moduleName: string;
}

export function ModulePlaceholder({ moduleName }: ModulePlaceholderProps) {
  return (
    <motion.div
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Module header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">{moduleName}</h1>
        <p className="mt-1 text-sm text-gray-400">Module Management</p>
      </div>

      {/* Coming soon state */}
      <motion.div
        className="flex flex-col items-center justify-center min-h-[280px] rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 gap-4 px-8 py-12"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      >

        <div className="text-center">
          <p className="text-base font-semibold text-gray-700">Coming Soon</p>
          <p className="mt-1 text-sm text-gray-400 max-w-xs">
            Content management for {moduleName} coming soon
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-1.5 mt-2">
          <span className="h-1.5 w-6 rounded-full bg-blue-600" />
          <span className="h-1.5 w-3 rounded-full bg-blue-200" />
          <span className="h-1.5 w-3 rounded-full bg-blue-200" />
        </div>
      </motion.div>
    </motion.div>
  );
}
