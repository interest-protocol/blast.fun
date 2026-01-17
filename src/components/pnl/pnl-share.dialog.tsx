"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
    Loader2,
    Copy,
    Download,
    Upload,
    Trash2,
    ArrowUpDown,
} from "lucide-react";
import toast from "react-hot-toast";
import * as htmlToImage from "html-to-image";
import type { Token } from "@/types/token";
import { useUserHoldings } from "@/hooks/use-user-holdings";
import { usePrice } from "@/hooks/sui/use-price";
import { formatNumberWithSuffix, formatSmallPrice } from "@/utils/format";
import { cn } from "@/utils";
import {
    resizeImage,
    saveBackgroundToStorage,
    getBackgroundsFromStorage,
    deleteBackgroundFromStorage,
    DEFAULT_BACKGROUNDS,
    type BackgroundImage,
} from "./pnl.utils";
import { SUI_TYPE_ARG } from "@mysten/sui/utils";
interface PnlDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    pool: Token;
    address?: string | null;
}

export function PnlDialog({
    isOpen,
    onOpenChange,
    pool,
    address,
}: PnlDialogProps) {
    const { data: pnlData, isLoading, error } = useUserHoldings(pool, address);
    const suiPrice = usePrice({ coinType: SUI_TYPE_ARG });
    const cardRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [selectedBackground, setSelectedBackground] = useState<string>(
        DEFAULT_BACKGROUNDS[0]
    );
    const [customBackgrounds, setCustomBackgrounds] = useState<
        BackgroundImage[]
    >([]);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [showInSui, setShowInSui] = useState<boolean>(false);

    useEffect(() => {
        setCustomBackgrounds(getBackgroundsFromStorage());
    }, []);

    const symbol = pool.metadata?.symbol || "?";
    const name = pool.metadata?.name || "Unknown";
    const iconUrl = pool.metadata?.icon_url;

    const isProfit = (pnlData?.pnl ?? 0) >= 0;
    const pnlAmount = Math.abs(pnlData?.pnl ?? 0);
    const pnlPercentage = Math.abs(pnlData?.pnlPercentage ?? 0);

    const formatValue = (
        usdValue: number | undefined,
        isPrice: boolean = false
    ) => {
        if (!usdValue) return isPrice ? "0.00" : "0";

        if (showInSui && suiPrice?.price && suiPrice.price > 0) {
            const suiValue = usdValue / suiPrice.price;
            if (isPrice) {
                return formatSmallPrice(suiValue) + " SUI";
            }
            return formatNumberWithSuffix(suiValue) + " SUI";
        }

        if (isPrice) {
            return "$" + formatSmallPrice(usdValue);
        }
        return "$" + formatNumberWithSuffix(usdValue);
    };

    const getCurrencySymbol = () => (showInSui ? "" : "$");
    const getCurrencySuffix = () => (showInSui ? " SUI" : "");

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const resizedImage = await resizeImage(file);
            const newBackground = saveBackgroundToStorage(resizedImage);
            setCustomBackgrounds([...customBackgrounds, newBackground]);
            setSelectedBackground(newBackground.dataUrl);
        } catch (err: any) {
            toast.error(err?.message || "Failed to upload image");
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleDeleteBackground = (id: string) => {
        const bgToDelete = customBackgrounds.find((bg) => bg.id === id);
        if (bgToDelete?.dataUrl === selectedBackground) {
            setSelectedBackground(DEFAULT_BACKGROUNDS[0]);
        }

        deleteBackgroundFromStorage(id);
        setCustomBackgrounds(customBackgrounds.filter((bg) => bg.id !== id));
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;
        if (
            x < rect.left ||
            x >= rect.right ||
            y < rect.top ||
            y >= rect.bottom
        ) {
            setIsDragging(false);
        }
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        const imageFile = files.find((file) => file.type.startsWith("image/"));

        if (!imageFile) {
            toast.error("Please drop an image file");
            return;
        }

        try {
            const resizedImage = await resizeImage(imageFile);
            const newBackground = saveBackgroundToStorage(resizedImage);
            setCustomBackgrounds([...customBackgrounds, newBackground]);
            setSelectedBackground(newBackground.dataUrl);
        } catch (err: any) {
            toast.error(err?.message || "Failed to upload image");
        }
    };

    const handleCopy = async () => {
        if (!cardRef.current) {
            toast.error("Unable to capture the image");
            return;
        }

        try {
            const blob = await htmlToImage.toBlob(cardRef.current, {
                quality: 1,
                pixelRatio: 2,
                cacheBust: true,
            });

            if (!blob) {
                toast.error("Failed to generate image");
                return;
            }

            const item = new ClipboardItem({ "image/png": blob });
            await navigator.clipboard.write([item]);

            toast.success("Successfully copied the image");
        } catch (err: any) {
            console.error("Failed to copy:", err);
            if (err?.message?.includes("trim")) {
                toast.error("Image generation failed. Please try again.");
            } else {
                toast.error(err?.message || "Failed to copy the image");
            }
        }
    };

    const handleDownload = async () => {
        if (!cardRef.current) {
            toast.error("Unable to capture the image");
            return;
        }

        try {
            const dataUrl = await htmlToImage.toPng(cardRef.current, {
                quality: 1,
                pixelRatio: 2,
                cacheBust: true,
            });

            if (!dataUrl) {
                toast.error("Failed to generate image");
                return;
            }

            const link = document.createElement("a");
            link.download = `pnl-${symbol || "token"}.png`;
            link.href = dataUrl;
            link.click();

            toast.success("Successfully downloaded the image");
        } catch (err: any) {
            console.error("Failed to download:", err);
            if (err?.message?.includes("trim")) {
                toast.error("Image generation failed. Please try again.");
            } else {
                toast.error(err?.message || "Failed to download the image");
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
            onClick={() => onOpenChange(false)}
        >
            <div className="relative" onClick={(e) => e.stopPropagation()}>
                {isLoading ? (
                    <div className="flex items-center justify-center h-[200px] w-[400px] bg-background rounded-lg">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : error ? (
                    <div className="text-center text-muted-foreground h-[200px] w-[400px] bg-background rounded-lg flex items-center justify-center">
                        <div className="text-sm">
                            {error.message || "Failed to load PNL data"}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2">
                        <div
                            ref={cardRef}
                            className="relative overflow-hidden rounded-xl shadow-2xl select-none"
                            style={{
                                width: "600px",
                                height: "340px",
                                backgroundColor: "#000000",
                            }}
                        >
                            <img
                                src={selectedBackground}
                                alt=""
                                className="absolute inset-0"
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    objectPosition: "center center",
                                    pointerEvents: "none",
                                }}
                            />

                            <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/70" />

                            <div className="relative z-10 flex h-full w-full flex-col p-6">
                                {/* Blast Branding */}
                                <img
                                    src="/logo/blast.svg"
                                    alt="Blast"
                                    className="absolute top-4 right-4 h-16 w-auto opacity-60"
                                    style={{
                                        filter: "brightness(0) invert(1)",
                                    }}
                                />

                                {/* Token Info */}
                                <div className="flex items-center gap-3">
                                    <div className="relative h-10 w-10 flex-shrink-0">
                                        {iconUrl ? (
                                            <img
                                                src={iconUrl}
                                                alt={symbol}
                                                className="h-10 w-10 rounded-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-sm font-bold text-white">
                                                {symbol?.[0]?.toUpperCase() ||
                                                    "?"}
                                            </span>
                                        )}
                                    </div>

                                    <div className="text-lg font-semibold text-white">
                                        {name || "Unknown"}
                                    </div>
                                </div>

                                <div className="flex-1 flex flex-col justify-center">
                                    {/* Profit Block */}
                                    <div
                                        className={cn(
                                            "inline-flex px-6 py-3 rounded-md shadow-lg self-start mb-6",
                                            isProfit
                                                ? "bg-green-400"
                                                : "bg-red-400"
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "text-5xl font-bold",
                                                isProfit
                                                    ? "text-green-900"
                                                    : "text-red-900"
                                            )}
                                        >
                                            {isProfit ? "+" : "-"}
                                            {getCurrencySymbol()}
                                            {showInSui &&
                                            suiPrice.price &&
                                            suiPrice.price > 0
                                                ? formatNumberWithSuffix(
                                                      pnlAmount / suiPrice.price
                                                  )
                                                : formatNumberWithSuffix(
                                                      pnlAmount || 0
                                                  )}
                                            {getCurrencySuffix()}
                                        </div>
                                    </div>

                                    {/* PnL Stats */}
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex items-baseline">
                                            <span
                                                className="text-muted-foreground text-base font-medium w-20"
                                                style={{
                                                    textShadow:
                                                        "0 2px 4px rgba(0,0,0,0.5)",
                                                }}
                                            >
                                                PNL
                                            </span>
                                            <span
                                                className={`text-base font-semibold ${
                                                    isProfit
                                                        ? "text-green-400"
                                                        : "text-red-400"
                                                }`}
                                                style={{
                                                    textShadow:
                                                        "0 2px 4px rgba(0,0,0,0.5)",
                                                }}
                                            >
                                                {isProfit ? "+" : "-"}
                                                {(pnlPercentage || 0).toFixed(
                                                    2
                                                )}
                                                %
                                            </span>
                                        </div>
                                        <div className="flex items-baseline">
                                            <span
                                                className="text-muted-foreground text-base font-medium w-20"
                                                style={{
                                                    textShadow:
                                                        "0 2px 4px rgba(0,0,0,0.5)",
                                                }}
                                            >
                                                Sold
                                            </span>
                                            <span
                                                className="text-base font-semibold text-white"
                                                style={{
                                                    textShadow:
                                                        "0 2px 4px rgba(0,0,0,0.5)",
                                                }}
                                            >
                                                {formatValue(
                                                    pnlData?.sold,
                                                    false
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex items-baseline">
                                            <span
                                                className="text-muted-foreground text-base font-medium w-20"
                                                style={{
                                                    textShadow:
                                                        "0 2px 4px rgba(0,0,0,0.5)",
                                                }}
                                            >
                                                Holding
                                            </span>
                                            <span
                                                className="text-base font-semibold text-white"
                                                style={{
                                                    textShadow:
                                                        "0 2px 4px rgba(0,0,0,0.5)",
                                                }}
                                            >
                                                {formatValue(
                                                    pnlData?.holding,
                                                    false
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 w-[600px]">
                            <div className="flex items-start gap-2">
                                <div
                                    className="flex-1 overflow-x-auto [&::-webkit-scrollbar]:hidden scroll-smooth"
                                    style={{
                                        scrollbarWidth: "none",
                                        msOverflowStyle: "none",
                                    }}
                                    onWheel={(e) => {
                                        const container = e.currentTarget;
                                        if (
                                            container.scrollWidth >
                                            container.clientWidth
                                        ) {
                                            e.preventDefault();
                                            container.scrollBy({
                                                left: e.deltaY,
                                                behavior: "smooth",
                                            });
                                        }
                                    }}
                                >
                                    <div className="flex gap-2 items-center">
                                        {DEFAULT_BACKGROUNDS.map((bg, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() =>
                                                    setSelectedBackground(bg)
                                                }
                                                className={`relative h-16 w-16 rounded-lg overflow-visible border-2 transition-all flex-shrink-0 ${
                                                    selectedBackground === bg
                                                        ? "border-primary"
                                                        : "border-border"
                                                }`}
                                            >
                                                <img
                                                    src={bg}
                                                    alt=""
                                                    className="h-full w-full object-cover rounded-md"
                                                />
                                            </button>
                                        ))}

                                        {customBackgrounds.map((bg) => (
                                            <ContextMenu key={bg.id}>
                                                <ContextMenuTrigger asChild>
                                                    <button
                                                        onClick={() =>
                                                            setSelectedBackground(
                                                                bg.dataUrl
                                                            )
                                                        }
                                                        className={`relative h-16 w-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                                                            selectedBackground ===
                                                            bg.dataUrl
                                                                ? "border-primary"
                                                                : "border-border"
                                                        }`}
                                                    >
                                                        <img
                                                            src={bg.dataUrl}
                                                            alt=""
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </button>
                                                </ContextMenuTrigger>
                                                <ContextMenuContent>
                                                    <ContextMenuItem
                                                        variant="destructive"
                                                        onClick={() =>
                                                            handleDeleteBackground(
                                                                bg.id
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Remove Background
                                                    </ContextMenuItem>
                                                </ContextMenuContent>
                                            </ContextMenu>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    className={cn(
                                        "h-16 w-16 rounded-lg border-2 border-dashed flex flex-col items-center justify-center transition-all gap-1 flex-shrink-0",
                                        isDragging
                                            ? "border-primary bg-primary/10 scale-105"
                                            : "border-border hover:border-muted-foreground"
                                    )}
                                >
                                    {isDragging ? (
                                        <>
                                            <Upload className="size-5 text-primary animate-pulse" />
                                            <span className="text-[9px] text-primary uppercase tracking-wide font-semibold">
                                                DROP
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="size-5 text-muted-foreground" />
                                            <span className="text-[9px] text-muted-foreground uppercase tracking-wide">
                                                MAX 1MB
                                            </span>
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="flex justify-between items-center">
                                <Button
                                    onClick={() => setShowInSui(!showInSui)}
                                    variant="outline"
                                    size="sm"
                                    className="text-xs"
                                    disabled={
                                        suiPrice.isLoading || !suiPrice.price
                                    }
                                >
                                    <ArrowUpDown className="size-4 mr-1" />
                                    {showInSui ? "USD" : "SUI"}
                                </Button>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={handleDownload}
                                        variant="outline"
                                        size="sm"
                                        className="text-xs"
                                    >
                                        <Download className="size-4 mr-1" />
                                        Download
                                    </Button>
                                    <Button
                                        onClick={handleCopy}
                                        variant="outline"
                                        size="sm"
                                        className="text-xs"
                                    >
                                        <Copy className="size-4 mr-1" />
                                        Copy
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                />
            </div>
        </div>
    );
}
