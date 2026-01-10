"use client";

import { useState, useEffect, useRef } from "react";
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
    const [imageLoaded, setImageLoaded] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    const displayChar = symbol?.[0]?.toUpperCase() || name?.[0]?.toUpperCase() || "?";

    useEffect(() => {
        setImageError(false);
        setImageLoaded(false);
    }, [iconUrl]);

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
        <div className="relative">
            {!imageLoaded && !imageError && (
                <div
                    className={cn(
                        "absolute inset-0 bg-muted/50 animate-pulse rounded",
                        className
                    )}
                />
            )}
            
            {!imageError && (
                <img
                    ref={imgRef}
                    src={iconUrl}
                    alt={symbol || name || "Token"}
                    className={cn(
                        "shadow-md object-cover transition-opacity duration-300",
                        className,
                        imageLoaded ? "opacity-100" : "opacity-0"
                    )}
                    loading="lazy"
                    decoding="async"
                    onLoad={() => setImageLoaded(true)}
                    onError={() => {
                        setImageError(true);
                        setImageLoaded(false);
                    }}
                />
            )}
        </div>
    );

    if (!iconUrl || imageError) return renderFallback();

    if (!enableHover) return renderImage();

    return (
        <HoverCard openDelay={200} closeDelay={100}>
            <HoverCardTrigger asChild>
                <div className="cursor-pointer">
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
                        src={iconUrl}
                        alt={symbol || name || "Token"}
                        className="rounded-md object-cover w-[150px] h-[150px]"
                        loading="lazy"
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