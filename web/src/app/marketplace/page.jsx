import { useState, useEffect } from "react";
import useUser from "@/utils/useUser";
import {
  Database,
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
  Star,
  BarChart3,
  DollarSign,
  Shield,
  Zap,
  ArrowLeft,
  Award,
  Globe,
  Mail,
  Target,
  Crown,
  LogOut,
  Menu,
  X,
  Home,
  Activity,
  Megaphone,
} from "lucide-react";

// Enhanced Quality Segment Card Component (SOLID: Single Responsibility)
const QualitySegmentCard = ({ segment, onPurchase }) => (
  <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
    {/* Header with status badge */}
    <div className="p-6 border-b border-gray-100">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            {segment.name}
          </h3>
          <p className="text-gray-600 mt-1">{segment.description}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            segment.source_api === "lake_b2b"
              ? "bg-green-100 text-green-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {segment.source_api === "lake_b2b"
            ? "API Refreshed"
            : "Premium Offline"}
        </span>
      </div>
    </div>

    {/* Quality Metrics Dashboard */}
    <div className="p-6">
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Email Deliverability */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Email Deliverability</p>
              <p className="text-2xl font-bold text-green-600">
                {segment.quality_metrics?.email_deliverability?.toFixed(1) ||
                  94.2}
                %
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Data Freshness */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Data Freshness</p>
              <p className="text-2xl font-bold text-blue-600">
                {segment.quality_metrics?.freshness_days || 7} days
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Geographic Coverage Mini-Chart */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
          <Globe className="w-4 h-4 mr-2" />
          Geographic Coverage
        </h4>
        <div className="space-y-2">
          {Object.entries(segment.geographic_distribution || {})
            .slice(0, 4)
            .map(([region, count]) => {
              const maxCount = Math.max(
                ...Object.values(segment.geographic_distribution || {}),
              );
              const percentage = (count / maxCount) * 100;
              return (
                <div key={region} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{region}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-800 w-12 text-right">
                      {count.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Industry Breakdown */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
          <BarChart3 className="w-4 h-4 mr-2" />
          Industry Coverage
        </h4>
        <div className="flex flex-wrap gap-2">
          {Object.entries(segment.industry_breakdown || {})
            .slice(0, 4)
            .map(([industry, percentage]) => (
              <span
                key={industry}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
              >
                {industry}: {percentage}%
              </span>
            ))}
        </div>
      </div>

      {/* Campaign Performance */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
          <TrendingUp className="w-4 h-4 mr-2" />
          Campaign Performance
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">Avg Open Rate</p>
            <p className="text-lg font-semibold text-gray-800">
              {segment.campaign_performance?.avg_open_rate?.toFixed(1) || 24.5}%
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Avg Response Rate</p>
            <p className="text-lg font-semibold text-gray-800">
              {segment.campaign_performance?.avg_response_rate?.toFixed(1) ||
                3.2}
              %
            </p>
          </div>
        </div>
      </div>

      {/* Multi-Currency Pricing */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <div>
            <p className="text-sm text-gray-500">USD</p>
            <p className="text-xl font-bold text-gray-900">
              ${segment.price_per_record}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">EUR</p>
            <p className="text-xl font-bold text-gray-900">
              €{(segment.price_per_record * 0.85).toFixed(4)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">GBP</p>
            <p className="text-xl font-bold text-gray-900">
              £{(segment.price_per_record * 0.75).toFixed(4)}
            </p>
          </div>
        </div>
        <button
          onClick={() => onPurchase(segment)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Purchase
        </button>
      </div>
    </div>
  </div>
);

// Partner Recommendations Component (SOLID: Single Responsibility)
const PartnerRecommendations = () => {
  const partners = [
    {
      id: 1,
      name: "Apollo.io",
      logo: "🚀",
      description: "AI-powered sales intelligence platform",
      specialties: ["Tech Startups", "Enterprise"],
      rating: 4.8,
      integration: "Direct API",
    },
    {
      id: 2,
      name: "ZoomInfo",
      logo: "🔍",
      description: "Comprehensive B2B database and insights",
      specialties: ["Healthcare", "Finance"],
      rating: 4.7,
      integration: "CSV Export",
    },
    {
      id: 3,
      name: "Outreach.io",
      logo: "📧",
      description: "Sales engagement platform",
      specialties: ["Email Campaigns", "CRM Integration"],
      rating: 4.9,
      integration: "Native Integration",
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Crown className="w-5 h-5 mr-2 text-purple-600" />
        Recommended Partners
      </h3>
      <div className="space-y-4">
        {partners.map((partner) => (
          <div
            key={partner.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{partner.logo}</div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {partner.name}
                  </h4>
                  <p className="text-sm text-gray-600">{partner.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium">{partner.rating}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {partner.specialties.map((specialty) => (
                <span
                  key={specialty}
                  className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium"
                >
                  {specialty}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 flex items-center">
                <Target className="w-3 h-3 mr-1" />
                {partner.integration}
              </span>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Learn More →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function DataMarketplace() {
  const { data: user, loading } = useUser();
  const [segments, setSegments] = useState([]);
  const [loadingSegments, setLoadingSegments] = useState(true);
  const [error, setError] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const navigationItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Campaigns", href: "/campaigns", icon: Megaphone },
    {
      name: "Marketplace",
      href: "/marketplace",
      icon: BarChart3,
      current: true,
    },
    { name: "Enrichment", href: "/enrichment", icon: Database },
    { name: "ICP Builder", href: "/icp", icon: Target },
    { name: "Analytics", href: "/analytics", icon: Activity },
  ];

  useEffect(() => {
    // Marketplace listing is public; do not gate on auth state
    fetchSegments();
  }, []);

  const fetchSegments = async () => {
    try {
      setLoadingSegments(true);
      const response = await fetch("/api/marketplace/segments");
      if (!response.ok) {
        throw new Error(`Failed to fetch segments: ${response.status}`);
      }
      const data = await response.json();
      setSegments(data.segments || []);
    } catch (error) {
      console.error("Error fetching segments:", error);
      setError("Failed to load marketplace data");
    } finally {
      setLoadingSegments(false);
    }
  };

  const handlePurchase = async (segment) => {
    try {
      const response = await fetch("/api/marketplace/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ segment_id: segment.id, quantity: 1000 }),
      });

      const payload = await response.json();
      if (response.ok) {
        alert(`Successfully purchased ${segment.name}!`);
      } else {
        alert(payload.error || "Purchase failed. Please try again.");
      }
    } catch (error) {
      console.error("Purchase error:", error);
      alert("Purchase failed. Please try again.");
    }
  };

  if (loading || loadingSegments) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    // Allow browsing even without auth; remove redirect
    // window.location.href = "/account/signin";
    // return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchSegments}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
              {user && (
                <span className="text-sm text-gray-600">
                  Welcome, {user.name || user.email}
                </span>
              )}
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

      {/* Header with global metrics */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-4">
              Premium B2B Data Marketplace
            </h2>
            <p className="text-xl opacity-90">
              High-quality, verified business data segments for your campaigns
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-white bg-opacity-20 rounded-lg mx-auto mb-3">
                <Database className="w-6 h-6" />
              </div>
              <p className="text-2xl font-bold">{segments.length}</p>
              <p className="text-sm opacity-80">Data Segments</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-white bg-opacity-20 rounded-lg mx-auto mb-3">
                <Users className="w-6 h-6" />
              </div>
              <p className="text-2xl font-bold">
                {segments
                  .reduce(
                    (total, segment) => total + (segment.total_records || 0),
                    0,
                  )
                  .toLocaleString()}
              </p>
              <p className="text-sm opacity-80">Total Records</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-white bg-opacity-20 rounded-lg mx-auto mb-3">
                <Shield className="w-6 h-6" />
              </div>
              <p className="text-2xl font-bold">99.2%</p>
              <p className="text-sm opacity-80">Data Accuracy</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-white bg-opacity-20 rounded-lg mx-auto mb-3">
                <Zap className="w-6 h-6" />
              </div>
              <p className="text-2xl font-bold">24/7</p>
              <p className="text-sm opacity-80">API Access</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Available Data Segments
              </h3>
              <p className="text-gray-600">
                Choose from our premium collection of verified B2B data segments
              </p>
            </div>

            {segments.length === 0 ? (
              <div className="text-center py-12">
                <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  No data segments available at the moment.
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {segments.map((segment) => (
                  <QualitySegmentCard
                    key={segment.id}
                    segment={segment}
                    onPurchase={handlePurchase}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <PartnerRecommendations />

            {/* Quality Guarantee */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Quality Guarantee
              </h3>
              <div className="space-y-3 text-sm text-green-800">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>99.2% Email deliverability</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Real-time validation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>GDPR compliant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Money-back guarantee</span>
                </div>
              </div>
            </div>

            {/* Support */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Mail className="w-5 h-5 mr-2 text-blue-600" />
                Need Help?
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Our data experts are here to help you find the perfect segments
                for your campaigns.
              </p>
              <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
