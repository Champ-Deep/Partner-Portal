import { motion } from "motion/react";

export default function EstimatedResults({ estimatedCount, watchedFields }) {
  const qualityScore = Math.min(
    Math.floor(
      (Object.values(watchedFields).filter(
        (v) => v && (Array.isArray(v) ? v.length > 0 : true)
      ).length /
        5) *
        100
    ),
    100
  );

  return (
    <motion.div
      className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6"
      animate={{ scale: [1, 1.02, 1] }}
      transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Estimated Results
          </h3>
          <p className="text-3xl font-bold text-blue-600">
            {estimatedCount.toLocaleString()}
          </p>
          <p className="text-sm text-blue-700">
            potential contacts matching your criteria
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-blue-700 mb-1">Quality Score</div>
          <div className="text-2xl font-bold text-green-600">
            {qualityScore}%
          </div>
        </div>
      </div>
    </motion.div>
  );
}
