import { MapPin, Train, UtensilsCrossed, Lightbulb, ParkingCircle, Users } from "lucide-react";
import type { StadiumGuide } from "@/lib/local-store";

interface StadiumInfoCardProps {
  guide: StadiumGuide;
  teamColor: string;
}

export function StadiumInfoCard({ guide, teamColor }: StadiumInfoCardProps) {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      {/* Gradient Header */}
      <div
        className="relative p-6"
        style={{
          background: `linear-gradient(135deg, ${teamColor}, ${teamColor}88)`,
        }}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 space-y-2">
          <h2 className="text-xl font-black text-white">{guide.stadiumName}</h2>
          <div className="flex items-center gap-1.5 text-white/80 text-sm">
            <MapPin className="w-4 h-4" />
            <span>{guide.address}</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/80 text-sm">
            <Users className="w-4 h-4" />
            <span>수용 인원: {guide.capacity.toLocaleString()}명</span>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="p-5 space-y-6">
        {/* 1. 교통편 */}
        {guide.transportation.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Train className="w-4 h-4" style={{ color: teamColor }} />
              <h3 className="text-sm font-bold text-foreground">교통편</h3>
            </div>
            <ul className="space-y-2">
              {guide.transportation.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-xs text-muted-foreground"
                >
                  <span
                    className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: teamColor }}
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 2. 좌석 안내 */}
        {guide.sections.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" style={{ color: teamColor }} />
              <h3 className="text-sm font-bold text-foreground">좌석 안내</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {guide.sections.map((sec, idx) => (
                <div
                  key={idx}
                  className="bg-muted/30 border border-border rounded-xl p-3 space-y-1"
                >
                  <p className="text-xs font-bold text-foreground">{sec.name}</p>
                  <p className="text-[11px] text-muted-foreground">{sec.desc}</p>
                  <p
                    className="text-[11px] font-semibold"
                    style={{ color: teamColor }}
                  >
                    {sec.priceRange}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 3. 주변 맛집 */}
        {guide.nearbyFood.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4" style={{ color: teamColor }} />
              <h3 className="text-sm font-bold text-foreground">주변 맛집</h3>
            </div>
            <div className="space-y-2">
              {guide.nearbyFood.map((food, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 text-xs"
                >
                  <span
                    className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: teamColor }}
                  />
                  <div>
                    <span className="font-bold text-foreground">{food.name}</span>
                    <span className="text-muted-foreground ml-1.5">{food.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. 직관 꿀팁 */}
        {guide.tips.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" style={{ color: teamColor }} />
              <h3 className="text-sm font-bold text-foreground">직관 꿀팁</h3>
            </div>
            <ul className="space-y-2">
              {guide.tips.map((tip, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-xs text-muted-foreground"
                >
                  <span
                    className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: teamColor }}
                  />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 5. 주차 정보 */}
        {guide.parkingInfo && (
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <ParkingCircle className="w-4 h-4" style={{ color: teamColor }} />
              <h3 className="text-sm font-bold text-foreground">주차 정보</h3>
            </div>
            <p className="text-xs text-muted-foreground bg-muted/30 rounded-xl p-3">
              {guide.parkingInfo}
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
