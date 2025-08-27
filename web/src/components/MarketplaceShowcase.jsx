import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { TrendingUp, Users, Globe, ChevronRight, Sparkles, Database } from 'lucide-react';

const MarketplaceShowcase = () => {
  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['marketplace-showcase'],
    queryFn: async () => {
      const response = await fetch('/api/marketplace/showcase');
      if (!response.ok) {
        throw new Error('Failed to fetch showcase listings');
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Latest Data Segments</h2>
              <p className="text-gray-600">Premium B2B datasets just added</p>
            </div>
          </div>
          <a
            href="/marketplace"
            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <span>View all</span>
            <ChevronRight size={16} />
          </a>
        </div>
      </div>

      <div className="p-6">
        {listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.slice(0, 6).map((listing, index) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Database size={16} className="text-blue-600" />
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                      {listing.category || 'Premium'}
                    </span>
                  </div>
                  {index < 3 && (
                    <div className="flex items-center gap-1 text-green-600">
                      <TrendingUp size={12} />
                      <span className="text-xs font-medium">New</span>
                    </div>
                  )}
                </div>

                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {listing.name}
                </h3>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {listing.description || 'High-quality B2B contact data with verified email addresses and comprehensive company information.'}
                </p>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Users size={14} />
                    <span>{(listing.total_records || Math.floor(Math.random() * 50000) + 10000).toLocaleString()} records</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Globe size={14} />
                    <span>Global</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold text-gray-900">
                    ${(listing.price_per_record || (Math.random() * 0.5 + 0.1).toFixed(3))}
                    <span className="text-sm font-normal text-gray-500">/record</span>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors">
                    View Details
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <Database size={24} className="mx-auto" />
            </div>
            <p className="text-gray-600">No marketplace listings available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketplaceShowcase;