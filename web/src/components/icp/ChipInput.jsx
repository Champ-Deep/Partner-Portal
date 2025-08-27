import { Controller } from "react-hook-form";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

export default function ChipInput({
  control,
  options,
  fieldName,
  removeChip,
  addToArray,
}) {
  return (
    <Controller
      name={fieldName}
      control={control}
      render={({ field }) => (
        <div className="space-y-3">
          {field.value?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {field.value.map((item) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => removeChip(fieldName, item)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {options
              .filter((option) => !field.value?.includes(option))
              .map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => addToArray(fieldName, option)}
                  className="text-left p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                >
                  <span className="text-sm text-gray-700 group-hover:text-blue-700">
                    {option}
                  </span>
                </button>
              ))}
          </div>
        </div>
      )}
    />
  );
}
