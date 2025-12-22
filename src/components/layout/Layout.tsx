import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Navigation */}
      <MobileNav />

      {/* Main Content */}
      <main className="flex-1 lg:overflow-y-auto">
        {/* Mobile padding for header and bottom nav */}
        <div className="pt-14 pb-16 lg:pt-0 lg:pb-0">
          {children}
        </div>
      </main>
    </div>
  );
}
