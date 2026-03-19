import { Sparkles, Star, Heart, Wand2, Zap } from "lucide-react";
const olliMascot = "/favicon.png";

export function CutePoster() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 flex items-center justify-center p-8 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Stars */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          >
            <Star
              className="text-yellow-300 fill-yellow-300"
              size={Math.random() * 20 + 10}
            />
          </div>
        ))}

        {/* Floating Hearts */}
        {[...Array(15)].map((_, i) => (
          <div
            key={`heart-${i}`}
            className="absolute animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: "3s",
            }}
          >
            <Heart
              className="text-pink-400 fill-pink-400 opacity-60"
              size={Math.random() * 15 + 8}
            />
          </div>
        ))}

        {/* Sparkles */}
        {[...Array(25)].map((_, i) => (
          <div
            key={`sparkle-${i}`}
            className="absolute animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: "2s",
            }}
          >
            <Sparkles
              className="text-purple-300 opacity-70"
              size={Math.random() * 12 + 6}
            />
          </div>
        ))}
      </div>

      {/* Main Poster Container */}
      <div className="relative max-w-4xl w-full">
        {/* Poster Card */}
        <div className="bg-white rounded-[3rem] shadow-2xl p-12 relative overflow-hidden border-8 border-white">
          {/* Rainbow Border Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-pink-400 via-purple-400 via-blue-400 via-green-400 to-yellow-400 opacity-20 rounded-[2.5rem]" />

          {/* Content */}
          <div className="relative z-10">
            {/* Top Badge */}
            <div className="flex justify-center mb-8">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-full shadow-lg transform -rotate-2">
                <div className="flex items-center gap-2">
                  <Wand2 className="w-5 h-5" />
                  <span className="font-black text-lg">AI 툰 메이커</span>
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Main Title */}
            <div className="text-center mb-8">
              <h1 className="text-7xl font-black mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-transparent bg-clip-text tracking-tight">
                OLLI
              </h1>
              <p className="text-3xl font-bold text-gray-700 mb-2">
                올리와 함께라면
              </p>
              <p className="text-4xl font-black text-purple-600">
                누구나 웹툰 작가! 🎨
              </p>
            </div>

            {/* OLLI Character Showcase */}
            <div className="flex justify-center mb-10">
              <div className="relative">
                {/* Decorative Circle Background */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-80 h-80 bg-gradient-to-br from-yellow-200 via-pink-200 to-purple-200 rounded-full blur-3xl opacity-60" />
                </div>

                {/* Main Character Grid */}
                <div className="relative grid grid-cols-2 gap-6">
                  {[
                    { label: "행복해요!", emoji: "😊", rotate: "-rotate-6", bg: "from-yellow-100 to-orange-100" },
                    { label: "깜짝!", emoji: "😲", rotate: "rotate-6", bg: "from-blue-100 to-cyan-100" },
                    { label: "달려요!", emoji: "🏃", rotate: "rotate-3", bg: "from-green-100 to-emerald-100" },
                    { label: "생각중..", emoji: "🤔", rotate: "-rotate-3", bg: "from-purple-100 to-pink-100" },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className={`relative transform ${item.rotate} transition-transform hover:scale-110 hover:rotate-0 cursor-pointer`}
                    >
                      <div className={`bg-gradient-to-br ${item.bg} rounded-3xl p-6 shadow-xl border-4 border-white`}>
                        <img
                          src={olliMascot}
                          alt={item.label}
                          className="w-32 h-32 mx-auto mb-3"
                        />
                        <div className="text-center">
                          <p className="text-2xl mb-1">{item.emoji}</p>
                          <p className="text-sm font-bold text-gray-700">
                            {item.label}
                          </p>
                        </div>
                      </div>
                      {/* Sparkle decoration */}
                      <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-2 shadow-lg">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Features Section */}
            <div className="grid grid-cols-3 gap-4 mb-10">
              {[
                { icon: Wand2, text: "AI 자동 생성", color: "purple" },
                { icon: Zap, text: "1분만에 완성", color: "yellow" },
                { icon: Star, text: "무료로 시작", color: "pink" },
              ].map((feature, idx) => (
                <div
                  key={idx}
                  className={`bg-gradient-to-br from-${feature.color}-50 to-${feature.color}-100 rounded-2xl p-4 text-center border-3 border-${feature.color}-200 shadow-lg`}
                >
                  <feature.icon className={`w-8 h-8 mx-auto mb-2 text-${feature.color}-600`} />
                  <p className="font-bold text-gray-800 text-sm">
                    {feature.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Call to Action */}
            <div className="text-center">
              <button className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white font-black text-2xl px-12 py-6 rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300 hover:shadow-3xl">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-7 h-7" />
                  <span>지금 바로 시작하기</span>
                  <Heart className="w-7 h-7 fill-white" />
                </div>
              </button>
              <p className="mt-4 text-gray-600 font-semibold">
                ✨ 그림 못 그려도 OK! 아이디어만 있으면 충분해요 ✨
              </p>
            </div>

            {/* Bottom Decorative Text */}
            <div className="mt-10 pt-8 border-t-4 border-dashed border-purple-200">
              <div className="flex justify-center gap-8 text-center">
                <div>
                  <p className="text-4xl font-black text-purple-600 mb-1">
                    10K+
                  </p>
                  <p className="text-sm text-gray-600 font-semibold">
                    활동 작가님
                  </p>
                </div>
                <div>
                  <p className="text-4xl font-black text-pink-600 mb-1">
                    50K+
                  </p>
                  <p className="text-sm text-gray-600 font-semibold">
                    생성된 툰
                  </p>
                </div>
                <div>
                  <p className="text-4xl font-black text-orange-600 mb-1">
                    4.9★
                  </p>
                  <p className="text-sm text-gray-600 font-semibold">
                    평점
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Corner Decorations */}
          <div className="absolute top-8 left-8 transform -rotate-12">
            <div className="bg-yellow-400 rounded-full p-3 shadow-lg">
              <Star className="w-8 h-8 text-white fill-white" />
            </div>
          </div>
          <div className="absolute top-8 right-8 transform rotate-12">
            <div className="bg-pink-400 rounded-full p-3 shadow-lg">
              <Heart className="w-8 h-8 text-white fill-white" />
            </div>
          </div>
          <div className="absolute bottom-8 left-8 transform rotate-45">
            <div className="bg-purple-400 rounded-full p-3 shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="absolute bottom-8 right-8 transform -rotate-12">
            <div className="bg-blue-400 rounded-full p-3 shadow-lg">
              <Zap className="w-8 h-8 text-white fill-white" />
            </div>
          </div>
        </div>

        {/* Shadow Effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-purple-900/20 rounded-[3rem] transform translate-y-2 -z-10" />
      </div>
    </div>
  );
}
