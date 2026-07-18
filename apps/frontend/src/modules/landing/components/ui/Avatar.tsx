import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { getProxiedUrl } from "./SafeImage";

export function Avatar({
  initials,
  avatarUrl,
  size = "md",
  dark = false,
}: {
  initials: string;
  avatarUrl?: string;
  size?: "sm" | "md" | "lg";
  dark?: boolean;
}) {
  const sizes = {
    sm: "w-7 h-7 text-[10px]",
    md: "w-8 h-8 text-xs",
    lg: "w-11 h-11 text-sm",
  };
  const [imageError, setImageError] = useState(false);

  // Reset error state if avatarUrl changes
  useEffect(() => {
    setImageError(false);
  }, [avatarUrl]);

  const hasValidAvatar =
    avatarUrl &&
    typeof avatarUrl === "string" &&
    avatarUrl.trim().length > 0 &&
    !imageError;

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-bold shrink-0 overflow-hidden",
        dark ? "bg-neutral-900 text-white" : "bg-neutral-200 text-neutral-700",
        sizes[size],
      )}
    >
      {hasValidAvatar ? (
        <img
          src={getProxiedUrl(avatarUrl)}
          alt={initials}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        initials
      )}
    </div>
  );
}
