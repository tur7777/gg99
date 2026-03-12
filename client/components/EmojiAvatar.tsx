import { cn } from "@/lib/utils";

interface EmojiAvatarProps {
  emoji?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function EmojiAvatar({
  emoji = "👤",
  size = "md",
  className,
}: EmojiAvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-lg",
    md: "w-20 h-20 text-5xl",
    lg: "w-32 h-32 text-7xl",
  };

  return (
    <div
      className={cn(
        "rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex-shrink-0 flex items-center justify-center select-none",
        sizeClasses[size],
        className
      )}
    >
      <span
        className="emoji-avatar"
        style={{
          fontFamily: "'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif",
          lineHeight: "1",
        }}
      >
        {emoji}
      </span>
    </div>
  );
}
