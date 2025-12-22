import { NavLink, useLocation } from "react-router-dom";
import { Home, Menu, X } from "lucide-react";
import { lotteries } from "@/lib/lotteries";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-250 ease-out",
          isOpen ? "w-64" : "w-20"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          {isOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">🧅</span>
              </div>
              <span className="font-bold text-lg text-sidebar-foreground">Cebolão</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="h-8 w-8"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="px-3 space-y-1">
            {/* Home */}
            <NavLink
              to="/"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )
              }
            >
              <Home className="h-5 w-5 flex-shrink-0" />
              {isOpen && <span>Início</span>}
            </NavLink>

            {/* Divider */}
            {isOpen && (
              <div className="px-3 py-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Loterias
                </span>
              </div>
            )}

            {/* Lottery Links */}
            {lotteries.map((lottery) => {
              const Icon = lottery.icon;
              const isActive = location.pathname === `/${lottery.slug}`;
              
              return (
                <NavLink
                  key={lottery.id}
                  to={`/${lottery.slug}`}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                    isActive
                      ? "bg-sidebar-accent"
                      : "hover:bg-sidebar-accent/50"
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105",
                      `bg-${lottery.color}`
                    )}
                    style={{
                      backgroundColor: `hsl(var(--${lottery.color}))`,
                    }}
                  >
                    <Icon className="h-4 w-4 text-primary-foreground" />
                  </div>
                  {isOpen && (
                    <span className={isActive ? "text-sidebar-primary" : "text-sidebar-foreground"}>
                      {lottery.name}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center justify-between">
            {isOpen && (
              <span className="text-xs text-muted-foreground">Tema</span>
            )}
            <ThemeSwitcher />
          </div>
        </div>
      </aside>
    </>
  );
}
