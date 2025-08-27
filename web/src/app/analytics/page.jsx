import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import useUser from "@/utils/useUser";
import {
  TrendingUp,
  Users,
  Database,
  Activity,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  ArrowUpRight,
  ArrowDownLeft,
  BarChart3,
  Menu,
  X,
  Home,
  Megaphone,
  Target,
  LogOut,
} from "lucide-react";

// Icon mapping for API responses
const iconMap = {
  BarChart3,
  Users,
  Database,
  TrendingUp,
  Activity,
};

export default function Analytics() {
  const { data: user, loading } = useUser();
  const [dateRange, setDateRange] = useState("30d");
  const [selectedMetric, setSelectedMetric] = useState("all");
  const [menuOpen, setMenuOpen] = useState(false);

  const navigationItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Campaigns", href: "/campaigns", icon: Megaphone },
    { name: "Marketplace", href: "/marketplace", icon: BarChart3 },
    { name: "Enrichment", href: "/enrichment", icon: Database },
    { name: "ICP Builder", href: "/icp", icon: Target },
    { name: "Analytics", href: "/analytics", icon: Activity, current: true },
  ];

  const {
    data: analyticsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["analytics", dateRange, selectedMetric],
    queryFn: async () => {
      const response = await fetch(
        `/api/analytics/dashboard?range=${dateRange}&metric=${selectedMetric}`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch analytics data");
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    window.location.href = "/account/signin";
    return null;
  }

  if (isLoading || !analyticsData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  const {
    overview,
    campaignPerformance,
    enrichmentStats,
    geographicData,
    userEngagement,
    conversionFunnel,
  } = analyticsData;

  const colors = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#06B6D4",
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Lake B2B Reseller Portal
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user.name || user.email}
              </span>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Dropdown Menu */}
          {menuOpen && (
            <div className="absolute right-4 top-16 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              {navigationItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${
                    item.current ? "text-blue-600 bg-blue-50" : "text-gray-700"
                  }`}
                >
                  <item.icon size={18} />
                  {item.name}
                </a>
              ))}
              <div className="border-t border-gray-200 my-2"></div>
              <a
                href="/account/logout"
                className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={18} />
                Sign Out
              </a>
            </div>
          )}
        </div>
      </nav>

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  Analytics Dashboard
                </h2>
                <p className="text-gray-600">
                  Comprehensive insights into your B2B data platform performance
                </p>
              </div>
              <div className="flex items-center gap-4">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="1y">Last year</option>
                </select>
                <button
                  onClick={() => refetch()}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw size={16} />
                  Refresh
                </button>
                <button className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <Download size={16} />
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {overview.map((stat, index) => {
            const IconComponent = iconMap[stat.icon] || BarChart3;
            return (
              <motion.div
                key={stat.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.name}
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <div className="flex items-center mt-2">
                      {stat.change > 0 ? (
                        <ArrowUpRight size={16} className="text-green-600" />
                      ) : (
                        <ArrowDownLeft size={16} className="text-red-600" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          stat.change > 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {stat.change > 0 ? "+" : ""}
                        {stat.change}%
                      </span>
                      <span className="text-sm text-gray-500 ml-1">
                        vs last period
                      </span>
                    </div>
                  </div>
                  <div
                    className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}
                  >
                    <IconComponent size={24} className="text-white" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Main Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Campaign Performance Over Time */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Campaign Performance
                </h3>
                <p className="text-gray-600">
                  Success rates and conversions over time
                </p>
              </div>
              <Activity size={20} className="text-blue-600" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={campaignPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="conversions"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  name="Conversions"
                />
                <Line
                  type="monotone"
                  dataKey="leads"
                  stroke="#10B981"
                  strokeWidth={2}
                  name="Leads Generated"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Data Enrichment Stats */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Data Enrichment
                </h3>
                <p className="text-gray-600">
                  Processing volume and success rates
                </p>
              </div>
              <Database size={20} className="text-green-600" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={enrichmentStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="processed"
                  stackId="1"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.6}
                  name="Records Processed"
                />
                <Area
                  type="monotone"
                  dataKey="enriched"
                  stackId="1"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.6}
                  name="Successfully Enriched"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Geographic Distribution */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Geographic Activity
                </h3>
                <p className="text-gray-600">Usage by region</p>
              </div>
              <Users size={20} className="text-purple-600" />
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={geographicData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {geographicData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={colors[index % colors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* User Engagement */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  User Engagement
                </h3>
                <p className="text-gray-600">Feature usage patterns</p>
              </div>
              <TrendingUp size={20} className="text-orange-600" />
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={userEngagement} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="feature" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="usage" fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Conversion Funnel */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Conversion Funnel
                </h3>
                <p className="text-gray-600">User journey analysis</p>
              </div>
              <Calendar size={20} className="text-red-600" />
            </div>
            <div className="space-y-4">
              {conversionFunnel.map((stage, index) => (
                <div key={stage.stage} className="flex items-center">
                  <div className="w-full">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {stage.stage}
                      </span>
                      <span className="text-sm text-gray-600">
                        {stage.users.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          index === 0
                            ? "bg-blue-600"
                            : index === 1
                              ? "bg-green-600"
                              : index === 2
                                ? "bg-orange-600"
                                : "bg-red-600"
                        }`}
                        style={{ width: `${stage.percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {stage.percentage}% conversion
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
