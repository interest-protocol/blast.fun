"use client";

import { FC, memo, useState } from 'react';
import Image from 'next/image';

import { cn } from '@/utils';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';

import { TokenAvatarProps } from './token-avatar.types';

export const TokenAvatar: FC<TokenAvatarProps> = memo(function TokenAvatar({
  iconUrl,
  symbol,
  name,
  className = "w-12 h-12 rounded-full",
  fallbackClassName = "",
  enableHover = true,
  size = 48,
  priority = false,
}) {
  const [error, setError] = useState(false);

  const displayChar = (symbol?.[0] ?? name?.[0] ?? "?").toUpperCase();
  const alt = symbol || name || "Token";

  if (!iconUrl || error) {
    return (
      <div
        className={cn(
          "flex items-center justify-center shadow-sm bg-muted/30 border border-dashed text-muted-foreground font-mono font-bold select-none",
          className,
          fallbackClassName
        )}
        aria-hidden="true"
      >
        {displayChar}
      </div>
    );
  }

  const img = (
    <Image
      src={iconUrl}
      alt={alt}
      width={size}
      height={size}
      priority={priority}
      quality={75}
      placeholder="blur"
      decoding="async"
      draggable={false}
      onError={() => setError(true)}
      sizes="(max-width: 768px) 48px, 56px"
      loading={priority ? "eager" : "lazy"}
      className={cn("object-cover shadow-sm select-none", className)}
      blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3C/svg%3E"
    />
  );

  if (!enableHover) return img;

  return (
    <HoverCard openDelay={180} closeDelay={80}>
      <HoverCardTrigger asChild>
        <div className="cursor-pointer">{img}</div>
      </HoverCardTrigger>

      <HoverCardContent
        className="p-1.5 bg-background/90 backdrop-blur-sm border w-auto max-w-[180px]"
        side="top"
        sideOffset={6}
        align="center"
      >
        <div className="relative">
          <Image
            src={iconUrl}
            alt={alt}
            width={160}
            height={160}
            className="rounded-lg object-contain bg-gradient-to-br from-background to-muted/30"
            loading="eager"
            quality={80}
            decoding="async"
            draggable={false}
          />
          {symbol && (
            <div className="absolute inset-x-2 bottom-2 bg-black/65 backdrop-blur-sm rounded px-2 py-1 text-center">
              <span className="text-white text-xs font-mono font-bold tracking-wide">
                {symbol}
              </span>
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
});

TokenAvatar.displayName = "TokenAvatar";