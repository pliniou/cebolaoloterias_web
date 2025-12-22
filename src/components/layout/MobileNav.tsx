import { NavLink, useLocation } from "react-router-dom";
import { Home, LayoutGrid, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { lotteries } from "@/lib/lotteries";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { useState } from "react";

export function MobileNav() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  // Find current lottery if on a lottery page
  const currentLottery = lotteries.find((l) => location.pathname === `/${l.slug}`);

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-card border-b border-border z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">🧅</span>
          </div>
          <span className="font-bold text-lg">Cebolão</span>
        </div>
        <ThemeSwitcher />
      </header>

      {/* Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border z-40">
        <div className="flex items-center justify-around h-full">
          {/* Home */}
          <NavLink
            to="/"
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-1 px-4 py-2 transition-colors duration-200",
                isActive ? "text-primary" : "text-muted-foreground"
              )
            }
          >
            <Home className="h-5 w-5" />
            <span className="text-xs font-medium">Início</span>
          </NavLink>

          {/* Lotteries Sheet */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <button
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-4 py-2 transition-colors duration-200",
                  currentLottery ? "text-primary" : "text-muted-foreground"
                )}
              >
                <LayoutGrid className="h-5 w-5" />
                <span className="text-xs font-medium">Loterias</span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[70vh] rounded-t-2xl">
              <SheetHeader className="pb-4">
                <SheetTitle>Escolha uma Loteria</SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-full pb-8">
                <div className="grid grid-cols-2 gap-3 pb-8">
                  {lotteries.map((lottery) => {
                    const Icon = lottery.icon;
                    const isActive = location.pathname === `/${lottery.slug}`;

                    return (
                      <NavLink
                        key={lottery.id}
                        to={`/${lottery.slug}`}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
                          isActive
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50 hover:bg-secondary"
                        )}
                      >
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{
                            backgroundColor: `hsl(var(--${lottery.color}))`,
                          }}
                        >
                          <Icon className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <span className="text-sm font-medium text-center">
                          {lottery.name}
                        </span>
                      </NavLink>
                    );
                  })}
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>

          {/* Settings placeholder */}
          <button className="flex flex-col items-center justify-center gap-1 px-4 py-2 text-muted-foreground">
            <Settings className="h-5 w-5" />
            <span className="text-xs font-medium">Ajustes</span>
          </button>
        </div>
      </nav>
    </>
  );
}
