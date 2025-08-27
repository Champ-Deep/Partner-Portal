import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { Plus, Search } from "lucide-react";
import ICPFilterCard from "./ICPFilterCard";
import EmptyState from "./EmptyState";

export default function ICPFilterList({
  filters,
  onNew,
  onEdit,
  onDelete,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredItems = filters.filter((filter) => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    const matchesSearch =
      filter.name.toLowerCase().includes(lowerSearchTerm) ||
      filter.description?.toLowerCase().includes(lowerSearchTerm);

    // Placeholder for category filtering
    if (selectedCategory !== "all") {
      // return matchesSearch && filter.category === selectedCategory;
    }
    return matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            ICP Builder
          </h2>
          <p className="text-gray-600">
            Define your Ideal Customer Profile (ICP) to target the right
            prospects for your campaigns.
          </p>
        </div>
        <button
          onClick={onNew}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          <span>New ICP Filter</span>
        </button>
      </div>

      {filters.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search ICP filters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="technology">Technology</option>
            <option value="healthcare">Healthcare</option>
            <option value="finance">Finance</option>
          </select>
        </div>
      )}

      {filters.length === 0 ? (
        <EmptyState type="no-filters" onAction={onNew} />
      ) : filteredItems.length === 0 ? (
        <EmptyState type="no-results" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredItems.map((filter, index) => (
              <ICPFilterCard
                key={filter.id}
                filter={filter}
                onEdit={onEdit}
                onDelete={onDelete}
                index={index}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
