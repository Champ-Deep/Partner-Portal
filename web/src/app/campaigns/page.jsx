import { useState, useEffect } from "react";
import { motion } from "motion/react";
import useUser from "@/utils/useUser";
import { useQuery } from "@tanstack/react-query";
import {
  Megaphone,
  Plus,
  Play,
  Pause,
  BarChart3,
  Users,
  Calendar,
  Target,
  Upload,
  Phone,
  Settings,
  ExternalLink,
  Clock,
  CheckCircle,
  AlertCircle,
  LogOut,
  ArrowLeft,
  Menu,
  X,
  Home,
  Activity,
  Database,
} from "lucide-react";

export default function Campaigns() {
  const { data: user, loading } = useUser();
  const [activeTab, setActiveTab] = useState("overview");
  const [statusFilter, setStatusFilter] = useState("all");
  const [menuOpen, setMenuOpen] = useState(false);

  const navigationItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Campaigns", href: "/campaigns", icon: Megaphone, current: true },
    { name: "Marketplace", href: "/marketplace", icon: BarChart3 },
    { name: "Enrichment", href: "/enrichment", icon: Database },
    { name: "ICP Builder", href: "/icp", icon: Target },
    { name: "Analytics", href: "/analytics", icon: Activity },
  ];

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      // Mock data for now - will be replaced with real API
      return [
        {
          id: 1,
          name: "Enterprise SaaS Outreach",
          status: "active",
          type: "managed",
          contacts: 15420,
          sent: 8950,
          opened: 2685,
          replied: 142,
          created_at: "2024-03-15",
          start_date: "2024-03-18",
        },
        {
          id: 2,
          name: "Healthcare Decision Makers",
          status: "completed",
          type: "automated",
          contacts: 8750,
          sent: 8750,
          opened: 3150,
          replied: 95,
          created_at: "2024-02-28",
          start_date: "2024-03-01",
        },
        {
          id: 3,
          name: "Financial Services Campaign",
          status: "draft",
          type: "managed",
          contacts: 12000,
          sent: 0,
          opened: 0,
          replied: 0,
          created_at: "2024-03-20",
          start_date: null,
        },
        {
          id: 4,
          name: "Tech Startup Founders",
          status: "paused",
          type: "automated",
          contacts: 5500,
          sent: 2200,
          opened: 660,
          replied: 28,
          created_at: "2024-03-10",
          start_date: "2024-03-12",
        },
        {
          id: 5,
          name: "E-commerce Marketing",
          status: "active",
          type: "managed",
          contacts: 9800,
          sent: 4900,
          opened: 1470,
          replied: 73,
          created_at: "2024-03-22",
          start_date: "2024-03-24",
        },
      ];
    },
  });

  // Filter campaigns based on selected status
  const filteredCampaigns = campaigns.filter((campaign) =>
    statusFilter === "all" ? true : campaign.status === statusFilter,
  );

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

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <Play size={14} />;
      case "completed":
        return <CheckCircle size={14} />;
      case "draft":
        return <Clock size={14} />;
      case "paused":
        return <Pause size={14} />;
      default:
        return <AlertCircle size={14} />;
    }
  };

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Campaign Management
              </h1>
              <p className="text-gray-600 mt-2">
                Launch managed or automated campaigns using your data segments
                and Lake B2B's AI-powered platform.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                <Plus size={20} />
                <span>New Campaign</span>
              </button>
              <button className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
                <Phone size={20} />
                <span>Schedule Call</span>
              </button>
            </div>
          </div>
        </div>

        {/* Campaign Types Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Settings size={24} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Managed Campaigns
                </h3>
                <p className="text-gray-600">
                  We handle everything from strategy to execution
                </p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-gray-600 mb-4">
              <li>• Custom campaign strategy and messaging</li>
              <li>• Dedicated campaign manager</li>
              <li>• A/B testing and optimization</li>
              <li>• Weekly performance reports</li>
            </ul>
            <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Schedule Strategy Call
            </button>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Target size={24} className="text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Automated Campaigns
                </h3>
                <p className="text-gray-600">
                  AI-powered campaigns using LakeB2B.ai
                </p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-gray-600 mb-4">
              <li>• AI-generated personalized messaging</li>
              <li>• Automated follow-up sequences</li>
              <li>• Real-time performance optimization</li>
              <li>• Self-service dashboard</li>
            </ul>
            <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
              <ExternalLink size={16} />
              <span>Launch with LakeB2B.ai</span>
            </button>
          </div>
        </div>

        {/* Campaigns List */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Your Campaigns
                </h2>
                <p className="text-gray-600">
                  Track and manage all your active campaigns
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <select
                  className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Campaigns</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="draft">Draft</option>
                  <option value="paused">Paused</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCampaigns.map((campaign) => (
                  <motion.div
                    key={campaign.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {campaign.name}
                          </h3>
                          <span
                            className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              campaign.status,
                            )}`}
                          >
                            {getStatusIcon(campaign.status)}
                            <span className="capitalize">
                              {campaign.status}
                            </span>
                          </span>
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full capitalize">
                            {campaign.type}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Contacts:</span>
                            <span className="font-medium text-gray-900 ml-1">
                              {campaign.contacts.toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Sent:</span>
                            <span className="font-medium text-gray-900 ml-1">
                              {campaign.sent.toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Opened:</span>
                            <span className="font-medium text-gray-900 ml-1">
                              {campaign.opened.toLocaleString()} (
                              {campaign.sent > 0
                                ? Math.round(
                                    (campaign.opened / campaign.sent) * 100,
                                  )
                                : 0}
                              %)
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Replies:</span>
                            <span className="font-medium text-gray-900 ml-1">
                              {campaign.replied.toLocaleString()} (
                              {campaign.sent > 0
                                ? Math.round(
                                    (campaign.replied / campaign.sent) * 100,
                                  )
                                : 0}
                              %)
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                          <BarChart3 size={18} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                          <Settings size={18} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {filteredCampaigns.length === 0 && (
                  <div className="text-center py-8">
                    <Megaphone className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">
                      {statusFilter === "all"
                        ? "No campaigns found"
                        : `No ${statusFilter} campaigns found`}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Launch Your Next Campaign?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Whether you need a fully managed campaign with dedicated support or
            want to leverage our AI-powered automation, we're here to help you
            achieve your marketing goals.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
              <Phone size={20} />
              <span>Schedule Strategy Call</span>
            </button>
            <button className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors">
              Browse Data Segments
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
