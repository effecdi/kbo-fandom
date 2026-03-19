import { DashboardLayout } from "@/components/DashboardLayout";
import { useState } from "react";
import { Heart, Clock, TrendingUp, Users } from "lucide-react";

export function Feed() {
  const [activeTab, setActiveTab] = useState("recent");

  const posts = [
    {
      id: 1,
      author: "그림쟁이",
      authorImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      title: "너가 깨치랬나 냥",
      image: "https://images.unsplash.com/photo-1761635263143-96f24ee9ac1d?w=400&h=500&fit=crop",
      likes: 9,
      badge: "Daily",
    },
    {
      id: 2,
      author: "캐릭터공방",
      authorImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      title: "행복한 하루 되세요 🌸",
      image: "https://images.unsplash.com/photo-1708019372074-4da65491c4b6?w=400&h=600&fit=crop",
      likes: 24,
      badge: "Daily",
    },
    {
      id: 3,
      author: "툰작가",
      authorImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
      title: "월요일 아침 출근길",
      image: "https://images.unsplash.com/photo-1515222410484-613a51c43721?w=400&h=450&fit=crop",
      likes: 156,
    },
    {
      id: 4,
      author: "일상툰",
      authorImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
      title: "커피 한잔의 여유",
      image: "https://images.unsplash.com/photo-1698369234069-4966ab00f760?w=400&h=550&fit=crop",
      likes: 87,
    },
    {
      id: 5,
      author: "감성작가",
      authorImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
      title: "봄날의 산책",
      image: "https://images.unsplash.com/photo-1591788806059-cb6e2f6a2498?w=400&h=500&fit=crop",
      likes: 203,
      badge: "Daily",
    },
    {
      id: 6,
      author: "디지털아트",
      authorImage: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop",
      title: "밤하늘의 별",
      image: "https://images.unsplash.com/photo-1772371272208-412168748f2a?w=400&h=600&fit=crop",
      likes: 45,
    },
  ];

  return (
    <DashboardLayout userType="creator">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black text-white mb-2">Feed</h1>
            <p className="text-gray-400">Explore works from creators</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-[#00e5cc] text-black font-bold rounded-lg hover:bg-[#00f0ff] transition-all">
            + Publish
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-8 bg-[#1a1a1a] rounded-xl p-1 w-fit">
          <button
            onClick={() => setActiveTab("recent")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
              activeTab === "recent"
                ? "bg-[#252525] text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Clock className="w-4 h-4" />
            Recent
          </button>
          <button
            onClick={() => setActiveTab("popular")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
              activeTab === "popular"
                ? "bg-[#252525] text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Popular
          </button>
          <button
            onClick={() => setActiveTab("following")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
              activeTab === "following"
                ? "bg-[#252525] text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Users className="w-4 h-4" />
            Following
          </button>
        </div>

        {/* Masonry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-[#1a1a1a] rounded-2xl overflow-hidden border border-gray-800 hover:border-gray-700 transition-all cursor-pointer group"
            >
              {/* Image */}
              <div className="relative overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Card Footer */}
              <div className="p-4">
                {/* Author Info */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <img
                      src={post.authorImage}
                      alt={post.author}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="text-sm font-semibold text-white">
                      {post.author}
                    </span>
                  </div>
                  {post.badge && (
                    <span className="px-2 py-1 bg-[#252525] text-[#00e5cc] text-xs font-bold rounded">
                      {post.badge}
                    </span>
                  )}
                </div>

                {/* Title */}
                <p className="text-white font-medium mb-3">{post.title}</p>

                {/* Likes */}
                <div className="flex items-center gap-1 text-gray-400">
                  <Heart className="w-4 h-4" />
                  <span className="text-sm font-semibold">{post.likes}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
