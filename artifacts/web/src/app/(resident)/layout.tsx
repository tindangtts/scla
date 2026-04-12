import { requireAuth } from "@/lib/auth";
import PushPrompt from "@/components/push-prompt";
import { BottomNav } from "@/components/layout/bottom-nav";
import { OfflineBanner } from "@/components/layout/offline-banner";

export default async function ResidentLayout({ children }: { children: React.ReactNode }) {
  await requireAuth();

  return (
    <div className="min-h-[100dvh] bg-muted flex justify-center selection:bg-primary/20">
      <div className="w-full max-w-md bg-background min-h-[100dvh] flex flex-col relative shadow-2xl shadow-primary/5 lg:max-w-xl xl:max-w-2xl">
        <OfflineBanner />
        <PushPrompt />
        <main className="flex-1 flex flex-col overflow-x-hidden pb-safe-offset-16 page-enter">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
