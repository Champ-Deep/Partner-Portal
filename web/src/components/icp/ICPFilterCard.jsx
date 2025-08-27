import { motion } from "motion/react";
import {
  Edit,
  Trash2,
  Download,
  Building,
  Users,
  MapPin,
} from "lucide-react";

export default function ICPFilterCard({ filter, onEdit, onDelete, index }) {
  const renderFilterDetails = (items, key, maxVisible) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {items.slice(0, maxVisible).map((item) => (
          <span
            key={item}
            className={`inline-block text-xs px-2 py-1 rounded-full ${
              key === "industries"
                ? "bg-blue-100 text-blue-800"
                : "bg-purple-100 text-purple-800"
            }`}
          >
            {item}
          </span>
        ))}
        {items.length > maxVisible && (
          <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
            +{items.length - maxVisible} more
          </span>
        )}
      </div>
    );
  };

  return (
    <motion.div
      key={filter.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {filter.name}
            </h3>
            {filter.description && (
              <p className="text-sm text-gray-600">{filter.description}</p>
            )}
          </div>
          <div className="flex space-x-1 ml-4">
            <button
              onClick={() => onEdit(filter)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => onDelete(filter.id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          {filter.filters?.industries?.length > 0 && (
            <div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                <Building size={12} /> Industries
              </span>
              {renderFilterDetails(filter.filters.industries, "industries", 3)}
            </div>
          )}
          {filter.filters?.company_size && (
            <div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                <Users size={12} /> Company Size
              </span>
              <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mt-1">
                {filter.filters.company_size} employees
              </span>
            </div>
          )}
          {filter.filters?.regions?.length > 0 && (
            <div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                <MapPin size={12} /> Regions
              </span>
              {renderFilterDetails(filter.filters.regions, "regions", 2)}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div>
          <p className="text-lg font-semibold text-blue-600">
            {filter.estimated_count?.toLocaleString() || "0"}
          </p>
          <p className="text-xs text-gray-500">estimated contacts</p>
        </div>
        <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-lg transition-colors">
          <Download size={16} />
          <span>Export</span>
        </button>
      </div>
    </motion.div>
  );
}
