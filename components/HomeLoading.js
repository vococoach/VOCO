import VocoMark from "@/components/VocoMark";

// What a RETURNING device sees from first paint until the home screen hydrates
// (a few seconds on a slow phone — without this it was a blank screen).
// It is server-rendered into every page load but display:none by default; the
// inline script in lib/preHydration.js marks a device that has saved progress
// or a stored customer id with data-returning on <html> before first paint, and
// only then does globals.css show this (and hide the first-visit view). A new
// visitor never sees it.
//
// Deliberately content-free: the Voco header and grey placeholder shapes only,
// no counts, greetings, streaks, suggestions or course names — everything the
// real home screen decides from saved progress or the clock — so nothing here
// can turn out to be wrong when the real screen replaces it. Its colors are the
// theme variables (the same night/dawn palette the real home uses, set before
// first paint by lib/preHydration.js), so the swap never changes color. (Until
// 2026-10-22 the home was dark at every hour and this shell was too; now it
// follows the palette, so this must too.) The page shell, padding and card
// shapes match the real home's so the swap doesn't jump. No JavaScript, no
// hooks: it renders and animates from CSS alone, and the pulse stops under
// prefers-reduced-motion.
function Bar({ className }) {
  return <div className={`vc-skeleton rounded-md ${className}`} />;
}

function Card({ className = "", children }) {
  return <div className={`vc-surface p-4 ${className}`}>{children}</div>;
}

export default function HomeLoading() {
  return (
    <main className="vc-loading vc-page" role="status" aria-busy="true" aria-label="Loading">
      <div className="mx-auto max-w-md">
        <div className="flex min-h-[44px] items-center gap-2">
          <VocoMark size={26} />
          <span className="font-display text-xl">Voco</span>
        </div>

        <div aria-hidden="true">
          <Card className="mt-4">
            <Bar className="mb-4 h-6 w-2/5" />
            <Bar className="h-11 w-full !rounded-xl" />
          </Card>

          <Bar className="mb-3 mt-8 h-4 w-20" />
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <Card key={i}>
                <Bar className="mb-3 h-5 w-1/2" />
                <Bar className="mb-4 h-3 w-4/5" />
                <Bar className="h-1 w-full" />
              </Card>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
