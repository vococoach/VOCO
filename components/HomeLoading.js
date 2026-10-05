import { Moon } from "lucide-react";

// What a RETURNING device sees from first paint until the home screen hydrates
// (a few seconds on a slow phone — without this it was a blank dark screen).
// It is server-rendered into every page load but display:none by default; the
// inline script in lib/preHydration.js marks a device that has saved progress
// or a stored customer id with data-returning on <html> before first paint, and
// only then does globals.css show this (and hide the first-visit view). A new
// visitor never sees it.
//
// Deliberately content-free: the Voco header and grey placeholder shapes only,
// no counts, greetings, streaks, suggestions or course names — everything the
// real home screen decides from saved progress or the clock — so nothing here
// can turn out to be wrong when the real screen replaces it. The background is
// the home screen's own dark shell (#1A1C3A), not the time-of-day palette,
// because that is what the real home is at every hour (dawn only appears as a
// card inside it); using dawn here would flip colours at the swap. Padding and
// widths match the real home's so the swap doesn't jump. No JavaScript, no
// hooks: it renders and animates from CSS alone, and the pulse stops under
// prefers-reduced-motion.
function Bar({ className }) {
  return <div className={`vc-skeleton rounded-md ${className}`} />;
}

function Card({ className = "", children }) {
  return (
    <div className={`vc-skeleton-card rounded-2xl border border-[#ffffff14] bg-[#20223F] p-4 ${className}`}>{children}</div>
  );
}

export default function HomeLoading() {
  return (
    <main className="vc-loading min-h-dvh bg-[#1A1C3A] px-4 py-8" role="status" aria-busy="true" aria-label="Loading">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Moon size={22} color="#8B85FF" />
            <span className="font-display text-xl text-[#EDEBFF]">Voco</span>
          </div>
        </div>

        <div aria-hidden="true">
          <Bar className="h-3.5 w-4/5 mb-2" />
          <Bar className="h-3.5 w-1/2 mb-6" />

          <Card className="mb-6">
            <Bar className="h-4 w-2/5 mb-3" />
            <Bar className="h-3 w-full mb-2" />
            <Bar className="h-3 w-3/4 mb-4" />
            <Bar className="h-10 w-full !rounded-xl" />
          </Card>

          <Bar className="h-5 w-24 mb-3" />
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <Card key={i}>
                <Bar className="h-5 w-1/2 mb-3" />
                <Bar className="h-3 w-full mb-2" />
                <Bar className="h-3 w-2/3" />
              </Card>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
