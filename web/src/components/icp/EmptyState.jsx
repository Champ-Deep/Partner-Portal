import { Target, Filter } from "lucide-react";

export default function EmptyState({ type, onAction }) {
  if (type === "no-filters") {
    return (
      <div className="text-center py-12">
        <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No ICP filters yet
        </h3>
        <p className="text-gray-600 mb-6">
          Create your first ICP filter to start targeting your ideal customers.
        </p>
        <button
          onClick={onAction}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Your First ICP Filter
        </button>
      </div>
    );
  }

  if (type === "no-results") {
    return (
      <div className="text-center py-12">
        <Filter className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No filters match your search
        </h3>
        <p className="text-gray-600">
          Try adjusting your search terms or create a new filter.
        </p>
      </div>
    );
  }

  return null;
}
