import {
  Wand2,
  Smile,
  Users,
  Palette,
  ImagePlus,
  Settings,
} from "lucide-react";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
const olliMascot = "/favicon.png";

export function EditorUI() {
  return (
    <section className="min-h-screen bg-gradient-to-br from-violet-50 via-mint-50 to-cyan-50 dark:from-violet-950/20 dark:via-transparent dark:to-cyan-950/20 flex items-center justify-center px-4 py-20">
      <div className="max-w-7xl mx-auto w-full">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-foreground">
            OLLI Story Editor
          </h2>
          <p className="text-xl text-muted-foreground">
            Create, customize, and perfect your Instagram toons
          </p>
        </div>

        {/* Dashboard Layout */}
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-3 space-y-4">
            {/* Character Library */}
            <div className="bg-card rounded-2xl shadow-lg p-6 border-2 border-violet-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-violet-100 rounded-xl p-2">
                  <Users className="w-5 h-5 text-violet-600" />
                </div>
                <h3 className="font-bold text-foreground">Character Library</h3>
              </div>
              <div className="space-y-3">
                {[1, 2, 3].map((char) => (
                  <div
                    key={char}
                    className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-4 border-2 border-violet-200 hover:border-violet-400 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={olliMascot}
                        alt={`Character ${char}`}
                        className="w-12 h-12"
                      />
                      <div>
                        <p className="font-semibold text-sm text-foreground">
                          Character {char}
                        </p>
                        <p className="text-xs text-muted-foreground">AI Generated</p>
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  className="w-full border-violet-300 text-violet-600 hover:bg-violet-50"
                >
                  <ImagePlus className="w-4 h-4 mr-2" />
                  Add New
                </Button>
              </div>
            </div>

            {/* Pose/Expression Slider */}
            <div className="bg-card rounded-2xl shadow-lg p-6 border-2 border-mint-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-mint-100 rounded-xl p-2">
                  <Smile className="w-5 h-5 text-mint-600" />
                </div>
                <h3 className="font-bold text-foreground">
                  Pose & Expression
                </h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Happiness
                  </label>
                  <Slider
                    defaultValue={[70]}
                    max={100}
                    step={1}
                    className="mb-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Energy
                  </label>
                  <Slider
                    defaultValue={[50]}
                    max={100}
                    step={1}
                    className="mb-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Surprise
                  </label>
                  <Slider
                    defaultValue={[30]}
                    max={100}
                    step={1}
                    className="mb-2"
                  />
                </div>
              </div>
            </div>

            {/* Auto-Toon Generator */}
            <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <Wand2 className="w-6 h-6" />
                <h3 className="font-bold">Auto-Toon</h3>
              </div>
              <p className="text-sm mb-4 text-violet-100">
                Let AI handle everything automatically
              </p>
              <Button
                className="w-full bg-white text-violet-600 hover:bg-violet-50"
                size="lg"
              >
                <Wand2 className="w-4 h-4 mr-2" />
                Full AI Automation
              </Button>
            </div>
          </div>

          {/* Center Canvas Area */}
          <div className="lg:col-span-9">
            <div className="bg-card rounded-2xl shadow-xl p-8 border-2 border-violet-200">
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b">
                <h3 className="text-xl font-bold text-foreground">
                  4-Panel Canvas
                </h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Palette className="w-4 h-4 mr-2" />
                    Style
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </div>
              </div>

              {/* 4-Panel Canvas */}
              <div className="grid grid-cols-2 gap-6">
                {[
                  {
                    title: "Panel 1: Happy",
                    emotion: "😊",
                    bg: "from-yellow-50 to-amber-50",
                  },
                  {
                    title: "Panel 2: Surprised",
                    emotion: "😲",
                    bg: "from-blue-50 to-cyan-50",
                  },
                  {
                    title: "Panel 3: Running",
                    emotion: "🏃",
                    bg: "from-green-50 to-emerald-50",
                  },
                  {
                    title: "Panel 4: Thinking",
                    emotion: "🤔",
                    bg: "from-purple-50 to-violet-50",
                  },
                ].map((panel, idx) => (
                  <div
                    key={idx}
                    className="relative group cursor-pointer transition-all"
                  >
                    <div
                      className={`bg-gradient-to-br ${panel.bg} rounded-2xl p-8 h-80 flex flex-col items-center justify-center border-4 border-violet-200 hover:border-violet-400 transition-all shadow-lg hover:shadow-xl`}
                    >
                      {/* Panel Number */}
                      <div className="absolute top-3 left-3 bg-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold text-violet-600 shadow">
                        {idx + 1}
                      </div>

                      {/* Magic Wand Icon (appears on hover) */}
                      <div className="absolute top-3 right-3 bg-violet-600 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                        <Wand2 className="w-4 h-4 text-white" />
                      </div>

                      {/* Character */}
                      <img
                        src={olliMascot}
                        alt={panel.title}
                        className="w-32 h-32 mb-4 transform group-hover:scale-110 transition-transform"
                      />

                      {/* Title */}
                      <div className="text-center">
                        <p className="text-lg font-bold text-foreground mb-1">
                          {panel.title}
                        </p>
                        <p className="text-3xl">{panel.emotion}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-4 mt-8 pt-6 border-t">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-violet-300 text-violet-600 hover:bg-violet-50"
                >
                  Preview
                </Button>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700 shadow-lg"
                >
                  Export to Instagram
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
