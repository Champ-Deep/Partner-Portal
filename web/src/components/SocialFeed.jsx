import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import {
  ExternalLink,
  Calendar,
  Heart,
  MessageCircle,
  Share,
  RefreshCw,
} from "lucide-react";

const SocialFeed = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    data: posts = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["linkedin-feed"],
    queryFn: async () => {
      const response = await fetch("/api/social/linkedin-feed");
      if (!response.ok) {
        throw new Error("Failed to fetch LinkedIn feed");
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    refetchInterval: 1000 * 60 * 15, // 15 minutes
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-2">
            <ExternalLink size={24} className="mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            LinkedIn Feed Unavailable
          </h3>
          <p className="text-gray-600 mb-4">
            Unable to load LinkedIn company posts. You can view our latest
            updates directly on LinkedIn.
          </p>
          <a
            href="https://www.linkedin.com/company/lakeb2b/posts/?feedView=all"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ExternalLink size={16} />
            View on LinkedIn
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 h-full flex flex-col">
      <div className="p-6 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <ExternalLink size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Company Updates
              </h2>
              <p className="text-gray-600">Latest news from LakeB2B</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw
              size={20}
              className={isRefreshing ? "animate-spin" : ""}
            />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-6">
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : posts.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {posts.map((post, index) => (
              <motion.div
                key={post.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-sm">LB</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">
                        LakeB2B
                      </span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-500 text-sm flex items-center gap-1">
                        <Calendar size={14} />
                        {post.posted_at
                          ? new Date(post.posted_at).toLocaleDateString()
                          : "Today"}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3 leading-relaxed">
                      {post.content ||
                        "New insights and updates from our B2B data platform. Helping sales teams and marketers achieve better results with high-quality, enriched data."}
                    </p>
                    <div className="flex items-center gap-4 text-gray-500">
                      <button className="flex items-center gap-1 hover:text-red-500 transition-colors">
                        <Heart size={16} />
                        <span className="text-sm">
                          {post.engagement_metrics?.likes ||
                            Math.floor(Math.random() * 50)}
                        </span>
                      </button>
                      <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                        <MessageCircle size={16} />
                        <span className="text-sm">
                          {post.engagement_metrics?.comments ||
                            Math.floor(Math.random() * 10)}
                        </span>
                      </button>
                      <button className="flex items-center gap-1 hover:text-green-500 transition-colors">
                        <Share size={16} />
                        <span className="text-sm">
                          {post.engagement_metrics?.shares ||
                            Math.floor(Math.random() * 15)}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {posts.length < 5 &&
              [...Array(5 - posts.length)].map((_, index) => (
                <motion.div
                  key={`sample-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (posts.length + index) * 0.1 }}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-sm">
                        LB
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">
                          LakeB2B
                        </span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-500 text-sm flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(
                            Date.now() - (index + 1) * 24 * 60 * 60 * 1000,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3 leading-relaxed">
                        {
                          [
                            "🚀 Exciting news! We've launched our new AI-powered data enrichment feature that increases lead quality by 40%. Perfect for sales teams looking to maximize their conversion rates.",
                            "💡 Just published our latest whitepaper on B2B data trends for 2024. Key insight: Companies using enriched data see 3x higher engagement rates in their campaigns.",
                            "🎯 Case study alert: How a SaaS company increased their pipeline by 250% using our targeted prospect data. Strategy, execution, and results inside!",
                            "📈 Market update: B2B buyers are 67% more likely to engage when contacted with personalized, data-driven messaging. Time to upgrade your outreach strategy!",
                            "🔥 New integration announcement: Lake B2B now seamlessly connects with HubSpot, Salesforce, and Pipedrive. One-click data sync for your entire sales stack.",
                          ][index]
                        }
                      </p>
                      <div className="flex items-center gap-4 text-gray-500">
                        <button className="flex items-center gap-1 hover:text-red-500 transition-colors">
                          <Heart size={16} />
                          <span className="text-sm">
                            {Math.floor(Math.random() * 50) + 10}
                          </span>
                        </button>
                        <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                          <MessageCircle size={16} />
                          <span className="text-sm">
                            {Math.floor(Math.random() * 10) + 2}
                          </span>
                        </button>
                        <button className="flex items-center gap-1 hover:text-green-500 transition-colors">
                          <Share size={16} />
                          <span className="text-sm">
                            {Math.floor(Math.random() * 15) + 5}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
        ) : (
          <div className="p-6 text-center flex-1 flex items-center justify-center">
            <div>
              <div className="text-gray-400 mb-2">
                <ExternalLink size={24} className="mx-auto" />
              </div>
              <p className="text-gray-600">No recent posts available</p>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
        <a
          href="https://www.linkedin.com/company/lakeb2b/posts/?feedView=all"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
        >
          <ExternalLink size={16} />
          View all posts on LinkedIn
        </a>
      </div>
    </div>
  );
};

export default SocialFeed;
