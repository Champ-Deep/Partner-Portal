import { useState, useEffect } from "react";
import { motion } from "motion/react";
import useUser from "@/utils/useUser";
import {
  Users,
  Database,
  TrendingUp,
  FileText,
  Settings,
  BarChart3,
  Upload,
  Target,
  Globe,
  Share2,
  LogOut,
  Clock,
  CheckCircle,
  MapPin,
  Megaphone,
  Menu,
  X,
  Home,
  Activity,
} from "lucide-react";
import SocialFeed from "@/components/SocialFeed";
import MarketplaceShowcase from "@/components/MarketplaceShowcase";
import DashboardMap from "@/components/DashboardMap";

export default function Dashboard() {
  const { data: user, loading } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    window.location.href = "/account/signin";
    return null;
  }

  const navigationItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home, current: true },
    { name: "Campaigns", href: "/campaigns", icon: Megaphone },
    { name: "Marketplace", href: "/marketplace", icon: BarChart3 },
    { name: "Enrichment", href: "/enrichment", icon: Database },
    { name: "ICP Builder", href: "/icp", icon: Target },
    { name: "Analytics", href: "/analytics", icon: Activity },
  ];

  const recentActivity = [
    {
      id: 1,
      action: "Campaign launched",
      target: "Enterprise SaaS Prospects",
      time: "2 hours ago",
      status: "success",
    },
    {
      id: 2,
      action: "Data segment purchased",
      target: "Healthcare Decision Makers - 50K contacts",
      time: "4 hours ago",
      status: "info",
    },
    {
      id: 3,
      action: "Managed campaign setup call scheduled",
      target: "Financial Services Campaign",
      time: "1 day ago",
      status: "success",
    },
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
          <p className="text-gray-600">
            Manage your B2B data segments and marketing campaigns through Lake
            B2B's platform.
          </p>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column - Social Feed */}
          <div className="lg:col-span-1">
            <div className="h-[780px]">
              <SocialFeed />
            </div>
          </div>

          {/* Right Column - Activity & Quick Actions */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Clock size={20} className="text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Recent Activity
                    </h3>
                    <p className="text-gray-600">
                      Your latest platform actions
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          activity.status === "success"
                            ? "bg-green-100"
                            : "bg-blue-100"
                        }`}
                      >
                        <CheckCircle
                          size={16}
                          className={
                            activity.status === "success"
                              ? "text-green-600"
                              : "text-blue-600"
                          }
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {activity.action}
                        </p>
                        <p className="text-sm text-gray-600">
                          {activity.target}
                        </p>
                      </div>
                      <span className="text-sm text-gray-500">
                        {activity.time}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MapPin size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Quick Actions
                    </h3>
                    <p className="text-gray-600">Common tasks and tools</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <a
                    href="/enrichment"
                    className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group"
                  >
                    <Database
                      size={24}
                      className="text-gray-400 group-hover:text-blue-600 mb-2"
                    />
                    <span className="font-medium text-gray-700 group-hover:text-blue-700">
                      Enrich Data
                    </span>
                  </a>
                  <a
                    href="/icp"
                    className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 group"
                  >
                    <Target
                      size={24}
                      className="text-gray-400 group-hover:text-purple-600 mb-2"
                    />
                    <span className="font-medium text-gray-700 group-hover:text-purple-700">
                      Build ICP
                    </span>
                  </a>
                  <a
                    href="/marketplace"
                    className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all duration-200 group"
                  >
                    <BarChart3
                      size={24}
                      className="text-gray-400 group-hover:text-green-600 mb-2"
                    />
                    <span className="font-medium text-gray-700 group-hover:text-green-700">
                      Marketplace
                    </span>
                  </a>
                  <a
                    href="/campaigns"
                    className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-all duration-200 group"
                  >
                    <Megaphone
                      size={24}
                      className="text-gray-400 group-hover:text-orange-600 mb-2"
                    />
                    <span className="font-medium text-gray-700 group-hover:text-orange-700">
                      Campaigns
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Marketplace Showcase - Full Width */}
        <MarketplaceShowcase />

        {/* Dashboard Map - Full Width */}
        <div className="mt-8">
          <DashboardMap />
        </div>
      </div>
    </div>
  );
}
