import { ReactNode } from "react";
import { BottomNav } from "./bottom-nav";

interface AppLayoutProps {
  children: ReactNode;
  showNav?: boolean;
}

export function AppLayout({ children, showNav = true }: AppLayoutProps) {
  return (
    <div className="min-h-[100dvh] bg-slate-100 flex justify-center">
      <div className="w-full max-w-md bg-background min-h-full flex flex-col relative shadow-2xl shadow-slate-200">
        <main className="flex-1 flex flex-col overflow-x-hidden pb-safe-offset-16">
          {children}
        </main>
        {showNav && <BottomNav />}
      </div>
    </div>
  );
}
