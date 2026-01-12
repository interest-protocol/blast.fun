"use client";
import { useState } from "react";
import { cn } from "@/utils";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface TokenAvatarProps {
  iconUrl?: string;
  symbol?: string;
  name?: string;
  className?: string;
  fallbackClassName?: string;
  enableHover?: boolean;
}

export function TokenAvatar({
  iconUrl,
  symbol,
  name,
  className = "w-12 h-12 rounded",
  fallbackClassName = "",
  enableHover = true,
}: TokenAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const [preloadHover, setPreloadHover] = useState(false);
  
  const [retryAttempt, setRetryAttempt] = useState(0);
  const maxRetries = 5;

  const displayChar =
    symbol?.[0]?.toUpperCase() || name?.[0]?.toUpperCase() || "?";

  const getImageUrl = () => {
    if (!iconUrl) return "";
    return `${iconUrl}?retry=${retryAttempt}`;
  };

  const handleImageError = () => {
    if (retryAttempt < maxRetries) {
      const delay = Math.pow(2, retryAttempt) * 1000;
      setTimeout(() => {
        setRetryAttempt(prev => prev + 1);
      }, delay);
    } else {
      setImageError(true);
    }
  };

  const renderFallback = () => (
    <div
      className={cn(
        "flex items-center justify-center shadow-md bg-card border border-dashed text-foreground/80 font-mono font-bold",
        className,
        fallbackClassName
      )}
    >
      {displayChar}
    </div>
  );

  const renderImage = () => (
    <>
      <img
        src={getImageUrl()} 
        alt={symbol || name || "Token"}
        className={cn("shadow-md object-cover", className)}
        onError={handleImageError} 
      />
      {preloadHover && <link rel="preload" as="image" href={getImageUrl()} />} 
    </>
  );

  if (!iconUrl || imageError) return renderFallback();

  if (!enableHover) return renderImage();

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <div
          className="cursor-pointer"
          onMouseEnter={() => setPreloadHover(true)}
        >
          {renderImage()}
        </div>
      </HoverCardTrigger>
      <HoverCardContent
        className="p-1.5 bg-background/95 backdrop-blur-sm border-2 w-auto"
        side="top"
        sideOffset={5}
      >
        <div className="relative">
          <img
            src={getImageUrl()} 
            alt={symbol || name || "Token"}
            className="rounded-md object-cover w-[150px] h-[150px]"
          />
          {symbol && (
            <div className="absolute bottom-1 left-1 right-1 bg-black/60 backdrop-blur-sm rounded px-2 py-1">
              <p className="text-white text-xs font-mono font-bold text-center truncate">
                {symbol}
              </p>
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}