import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { MapPin, Users, TrendingUp, Activity, Globe } from "lucide-react";

const DashboardMap = () => {
  const [selectedMarker, setSelectedMarker] = useState(null);

  const { data: geoData = [], isLoading } = useQuery({
    queryKey: ["geo-activity"],
    queryFn: async () => {
      const response = await fetch("/api/geo/activity");
      if (!response.ok) {
        throw new Error("Failed to fetch geo activity data");
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Get dot size and color based on activity level
  const getDotStyle = (activityCount) => {
    let size = 4;
    let color = "#16a34a"; // Green for low activity
    let intensity = 0.6;

    if (activityCount > 1000) {
      size = 12;
      color = "#dc2626"; // Red for high activity
      intensity = 1;
    } else if (activityCount > 500) {
      size = 10;
      color = "#ea580c"; // Orange for medium-high
      intensity = 0.9;
    } else if (activityCount > 100) {
      size = 8;
      color = "#f59e0b"; // Yellow for medium
      intensity = 0.8;
    }

    return {
      width: size,
      height: size,
      backgroundColor: color,
      opacity: intensity,
      boxShadow: `0 0 ${size * 2}px ${color}40`,
    };
  };

  // Convert lat/lng to SVG coordinates (simplified world map projection)
  const projectToSVG = (lat, lng) => {
    const x = ((lng + 180) / 360) * 800;
    const y = ((90 - lat) / 180) * 400;
    return { x, y };
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Globe size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Global Activity Matrix
              </h2>
              <p className="text-gray-600">
                Geographic distribution of platform usage
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-8">
          {/* World Map SVG Background */}
          <svg
            viewBox="0 0 800 400"
            className="w-full h-64 mb-4"
            style={{ maxHeight: "400px" }}
          >
            {/* Simplified world map outline */}
            <defs>
              <pattern
                id="grid"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 20 0 L 0 0 0 20"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="800" height="400" fill="url(#grid)" />

            {/* Continental outlines (simplified) */}
            <g stroke="#cbd5e1" strokeWidth="1" fill="none" opacity="0.3">
              {/* North America */}
              <path d="M 100 80 Q 160 60 220 100 Q 180 140 140 120 Q 120 100 100 80 Z" />
              {/* South America */}
              <path d="M 180 180 Q 200 160 220 200 Q 210 260 190 240 Q 170 220 180 180 Z" />
              {/* Europe */}
              <path d="M 360 100 Q 380 90 400 110 Q 390 130 370 120 Q 350 110 360 100 Z" />
              {/* Africa */}
              <path d="M 380 140 Q 420 130 440 180 Q 430 220 400 200 Q 370 170 380 140 Z" />
              {/* Asia */}
              <path d="M 450 80 Q 520 70 580 120 Q 560 160 500 140 Q 460 110 450 80 Z" />
              {/* Australia */}
              <path d="M 580 220 Q 620 210 640 240 Q 630 250 600 245 Q 570 235 580 220 Z" />
            </g>

            {/* Activity dots */}
            {geoData.map((point) => {
              const { x, y } = projectToSVG(point.lat, point.lng);
              const dotStyle = getDotStyle(point.activity_count);

              return (
                <motion.circle
                  key={point.id}
                  cx={x}
                  cy={y}
                  r={dotStyle.width / 2}
                  fill={dotStyle.backgroundColor}
                  opacity={dotStyle.opacity}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: dotStyle.opacity }}
                  transition={{ delay: point.id * 0.1, duration: 0.5 }}
                  style={{
                    filter: `drop-shadow(0 0 ${dotStyle.width}px ${dotStyle.backgroundColor}40)`,
                  }}
                  className="cursor-pointer hover:opacity-100 transition-opacity"
                  onClick={() =>
                    setSelectedMarker(
                      selectedMarker?.id === point.id ? null : point,
                    )
                  }
                />
              );
            })}
          </svg>

          {/* Selected marker info overlay */}
          {selectedMarker && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[250px]"
            >
              <button
                onClick={() => setSelectedMarker(null)}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
              <h3 className="font-semibold text-gray-900 mb-2">
                {selectedMarker.region || selectedMarker.country_code}
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Activity size={14} className="text-blue-600" />
                  <span className="text-gray-600">Activity Count:</span>
                  <span className="font-medium text-gray-900">
                    {selectedMarker.activity_count.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users size={14} className="text-green-600" />
                  <span className="text-gray-600">Est. Users:</span>
                  <span className="font-medium text-gray-900">
                    {Math.floor(
                      selectedMarker.activity_count * 0.3,
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp size={14} className="text-purple-600" />
                  <span className="text-gray-600">Growth:</span>
                  <span className="font-medium text-green-600">
                    +{Math.floor(Math.random() * 20 + 5)}%
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Enhanced Legend */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Activity Matrix Legend
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-green-500 shadow-lg"></div>
              <div>
                <div className="font-medium text-gray-700">Low</div>
                <div className="text-gray-500">0-100</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-yellow-500 shadow-lg"></div>
              <div>
                <div className="font-medium text-gray-700">Medium</div>
                <div className="text-gray-500">100-500</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-500 shadow-lg"></div>
              <div>
                <div className="font-medium text-gray-700">High</div>
                <div className="text-gray-500">500-1000</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500 shadow-lg"></div>
              <div>
                <div className="font-medium text-gray-700">Very High</div>
                <div className="text-gray-500">1000+</div>
              </div>
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-500">
            Click on any location dot to view detailed activity metrics
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardMap;
