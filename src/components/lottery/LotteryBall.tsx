import { cn } from "@/lib/utils";

interface LotteryBallProps {
  number: number;
  color?: string;
  size?: "xs" | "sm" | "md" | "lg";
  delay?: number;
  className?: string;
}

export function LotteryBall({ 
  number, 
  color = "primary", 
  size = "md",
  delay = 0,
  className 
}: LotteryBallProps) {
  const sizeClasses = {
    xs: "w-6 h-6 text-[10px]",
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-16 h-16 text-lg",
  };

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-bold text-primary-foreground animate-ball-pop shadow-md",
        sizeClasses[size],
        className
      )}
      style={{
        backgroundColor: color.startsWith("hsl") ? color : `hsl(var(--${color}))`,
        animationDelay: `${delay}ms`,
      }}
    >
      {number.toString().padStart(2, "0")}
    </div>
  );
}
