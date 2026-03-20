import {
  TrendingUp,
  Download,
  Award,
  Users,
  Instagram,
  DollarSign,
  Star,
  CheckCircle2,
} from "lucide-react";
import { Button } from "./ui/button";
const olliMascot = "/favicon.png";

export function BusinessHub() {
  return (
    <section className="min-h-screen bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900 flex items-center justify-center px-4 py-20">
      <div className="max-w-7xl mx-auto w-full">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gold-500/20 border border-gold-400/30 rounded-full px-6 py-2 mb-6">
            <Award className="w-5 h-5 text-gold-400" />
            <span className="text-gold-300 font-semibold">
              Professional Suite
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-white">
            OLLI Business Hub
          </h2>
          <p className="text-xl text-indigo-200">
            Connect with brands and grow your toon career
          </p>
        </div>

        {/* Main Dashboard Layout */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Side - Creator Profile Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="bg-white rounded-2xl p-2">
                    <img
                      src={olliMascot}
                      alt="Creator Avatar"
                      className="w-16 h-16"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      @YourToonStudio
                    </h3>
                    <p className="text-indigo-200 text-sm">
                      Webtoon Creator
                    </p>
                  </div>
                </div>
                <div className="bg-white/20 rounded-xl px-3 py-1">
                  <p className="text-white text-xs font-semibold">
                    Pro Account
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">52.3K</p>
                  <p className="text-xs text-indigo-200">Followers</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">4.8%</p>
                  <p className="text-xs text-indigo-200">Engagement</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">127</p>
                  <p className="text-xs text-indigo-200">Posts</p>
                </div>
              </div>
            </div>

            {/* Brand Matching Score */}
            <div className="bg-gradient-to-br from-gold-400 to-amber-500 rounded-2xl p-6 mb-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-white rounded-full p-2">
                    <Star className="w-6 h-6 text-gold-500" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-foreground">
                      Brand Match Score
                    </h4>
                    <p className="text-sm text-foreground">
                      AI-Powered Analysis
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-black text-foreground">98%</p>
                </div>
              </div>

              {/* Matching Brands */}
              <div className="bg-white/30 rounded-xl p-4">
                <p className="text-sm font-semibold text-foreground mb-3">
                  Top Matching Brands:
                </p>
                <div className="space-y-2">
                  {[
                    "Fashion & Lifestyle",
                    "Tech Accessories",
                    "Food & Beverage",
                  ].map((brand, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-foreground"
                    >
                      <CheckCircle2 className="w-4 h-4 text-green-700" />
                      <span className="text-sm font-medium">{brand}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <Instagram className="w-5 h-5 text-pink-400" />
                  <p className="text-xs font-semibold text-indigo-200">
                    Instagram
                  </p>
                </div>
                <p className="text-2xl font-bold text-white">28.5K</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-gold-400" />
                  <p className="text-xs font-semibold text-indigo-200">
                    Est. Value
                  </p>
                </div>
                <p className="text-2xl font-bold text-white">$2.4K</p>
              </div>
            </div>
          </div>

          {/* Right Side - Automated Media Kit Preview */}
          <div className="bg-card rounded-3xl shadow-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-foreground">
                Automated Media Kit
              </h3>
              <div className="bg-green-100 dark:bg-green-900/30 rounded-full px-4 py-1">
                <span className="text-green-700 dark:text-green-300 text-sm font-semibold">
                  AI Generated
                </span>
              </div>
            </div>

            {/* Media Kit Preview */}
            <div className="space-y-6">
              {/* Growth Chart */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 rounded-2xl p-6 border-2 border-indigo-200 dark:border-indigo-800">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                  <h4 className="font-bold text-foreground">
                    Follower Growth
                  </h4>
                </div>
                <img
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBncm93dGglMjBjaGFydCUyMGFuYWx5dGljcyUyMGRhc2hib2FyZHxlbnwxfHx8fDE3NzI3Nzg4MDR8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Growth Chart"
                  className="w-full h-48 object-cover rounded-xl"
                />
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <p className="text-lg font-bold text-indigo-600">+127%</p>
                    <p className="text-xs text-muted-foreground">3 Months</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-indigo-600">+89%</p>
                    <p className="text-xs text-muted-foreground">6 Months</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-indigo-600">+234%</p>
                    <p className="text-xs text-muted-foreground">1 Year</p>
                  </div>
                </div>
              </div>

              {/* Previous Toon Examples */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-2xl p-6 border-2 border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-purple-600" />
                  <h4 className="font-bold text-foreground">Top Performing Toons</h4>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map((toon) => (
                    <div
                      key={toon}
                      className="bg-white dark:bg-card rounded-xl p-3 border-2 border-purple-200 dark:border-purple-800 hover:border-purple-400 transition-all cursor-pointer"
                    >
                      <img
                        src={olliMascot}
                        alt={`Toon ${toon}`}
                        className="w-full h-20 object-contain mb-2"
                      />
                      <div className="text-center">
                        <p className="text-xs font-semibold text-foreground">
                          Episode {toon}
                        </p>
                        <p className="text-xs text-purple-600 font-bold">
                          {(Math.random() * 10 + 5).toFixed(1)}K ❤️
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Audience Demographics */}
              <div className="bg-gradient-to-br from-gold-50 to-amber-50 dark:from-amber-950/20 dark:to-amber-950/20 rounded-2xl p-6 border-2 border-gold-200">
                <h4 className="font-bold text-foreground mb-4">
                  Audience Insights
                </h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-foreground">Age 18-24</span>
                      <span className="font-semibold text-foreground">42%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-gold-500 h-2 rounded-full w-[42%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-foreground">Age 25-34</span>
                      <span className="font-semibold text-foreground">38%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-gold-500 h-2 rounded-full w-[38%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-foreground">Age 35+</span>
                      <span className="font-semibold text-foreground">20%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-gold-500 h-2 rounded-full w-[20%]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Download Button */}
            <div className="mt-8 pt-6 border-t">
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Your AI-Generated Media Kit
              </Button>
              <p className="text-center text-sm text-muted-foreground mt-3">
                Professional PDF • Updated in real-time
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
