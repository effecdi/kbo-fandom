import { Sparkles } from "lucide-react";
import { Button } from "./ui/button";
const olliMascot = "/favicon.png";

export function HeroSection() {
  return (
    <section className="min-h-screen bg-background flex items-center justify-center px-4 py-20">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header with Logo */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <img src={olliMascot} alt="OLLI Mascot" className="w-20 h-20" />
            <h1 className="text-5xl font-black tracking-tight">OLLI</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            AI-Powered Instagram Toon Creator
          </p>
        </div>

        {/* Main Split-Screen Hero */}
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Stick Figure Sketch */}
          <div className="relative bg-card rounded-3xl shadow-2xl p-8 lg:p-12 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-muted to-muted opacity-50" />
            <div className="relative z-10">
              <div className="bg-card rounded-2xl shadow-lg p-8 mb-6 border-4 border-dashed border-border">
                <img
                  src="https://images.unsplash.com/photo-1715528233539-5fe70a4e0d71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaW1wbGUlMjBzdGljayUyMGZpZ3VyZSUyMHNrZXRjaCUyMGRyYXdpbmd8ZW58MXx8fHwxNzcyNzc4ODA0fDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Simple sketch"
                  className="w-full h-80 object-cover rounded-lg opacity-70"
                />
              </div>
              <div className="text-center">
                <p className="text-muted-foreground text-sm uppercase tracking-wide mb-2">
                  Your Simple Sketch
                </p>
                <p className="text-2xl font-semibold text-foreground">
                  No Drawing Skills Required
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Professional Toon */}
          <div className="relative bg-gradient-to-br from-purple-600 via-pink-500 to-yellow-400 rounded-3xl shadow-2xl p-8 lg:p-12 overflow-hidden">
            <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-white" />
              <span className="text-white text-sm font-semibold">
                AI Magic
              </span>
            </div>
            <div className="relative z-10">
              <div className="bg-card rounded-2xl shadow-xl p-6 mb-6">
                {/* 4-Cut Toon Preview */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { expression: "Happy 😊", position: "top-left" },
                    { expression: "Surprised 😲", position: "top-right" },
                    { expression: "Running 🏃", position: "bottom-left" },
                    { expression: "Thinking 🤔", position: "bottom-right" },
                  ].map((panel, idx) => (
                    <div
                      key={idx}
                      className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-xl p-4 h-32 flex flex-col items-center justify-center border-2 border-purple-200 dark:border-purple-800"
                    >
                      <img
                        src={olliMascot}
                        alt={panel.expression}
                        className="w-16 h-16 mb-1"
                      />
                      <p className="text-xs font-medium text-purple-700">
                        {panel.expression}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-center text-white">
                <p className="text-sm uppercase tracking-wide mb-2 opacity-90">
                  Professional Result
                </p>
                <p className="text-2xl font-semibold">
                  Instagram-Ready Toon
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Headline and CTA */}
        <div className="text-center mt-16 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-500 text-transparent bg-clip-text">
            Zero Drawing Skills,
            <br />
            Infinite Stories
          </h2>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Transform your simple ideas into professional Instagram toons.
            <br />
            AI handles the art, you create the stories.
          </p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg px-12 py-6 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Start Your Toon Career
          </Button>
        </div>
      </div>
    </section>
  );
}
