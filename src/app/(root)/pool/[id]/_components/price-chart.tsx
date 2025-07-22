"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { createChart, ColorType, IChartApi, ISeriesApi, Time, CandlestickSeries } from "lightweight-charts"
import { PoolWithMetadata } from "@/types/pool"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Activity, Skull } from "lucide-react"
import { useCoinOHLCV } from "@/hooks/datafeed/use-coin-ohlcv"

interface PriceChartProps {
	pool: PoolWithMetadata
}

const RESOLUTIONS = [
	{ value: "1", label: "1M" },
	{ value: "2", label: "2M" },
	{ value: "60", label: "1H" },
	{ value: "120", label: "2H" },
	{ value: "240", label: "4H" },
	{ value: "1D", label: "1D" },
	{ value: "1W", label: "1W" },
	{ value: "1M", label: "1M" },
] as const

export function PriceChart({ pool }: PriceChartProps) {
	const [resolution, setResolution] = useState("2")
	const containerRef = useRef<HTMLDivElement>(null)
	const chartRef = useRef<IChartApi | null>(null)
	const seriesRef = useRef<ISeriesApi<"Candlestick", Time> | null>(null)

	const { data: rawData, isLoading, error, isRefetching } = useCoinOHLCV({
		symbol: pool.coinType,
		resolution,
	})

	const chartData = useMemo(() => {
		if (!rawData) return []

		const transformed = rawData
			.map(item => ({
				time: item.time as Time,
				open: parseFloat(item.open),
				high: parseFloat(item.high),
				low: parseFloat(item.low),
				close: parseFloat(item.close),
			}))
			.filter(item => item.open > 0 || item.high > 0 || item.low > 0 || item.close > 0)
			.sort((a, b) => (a.time as number) - (b.time as number))

		return transformed
	}, [rawData, resolution])

	useEffect(() => {
		if (!containerRef.current) return

		const chart = createChart(containerRef.current, {
			width: containerRef.current.clientWidth,
			height: 400,
			layout: {
				background: { type: ColorType.Solid, color: "#0d0d0d" },
				textColor: "#c3c3c3",
			},
			grid: {
				vertLines: { color: "#2d2d2d" },
				horzLines: { color: "#2d2d2d" },
			},
			crosshair: {
				mode: 0,
			},
			rightPriceScale: {
				borderColor: "#2d2d2d",
				autoScale: true,
			},
			timeScale: {
				borderColor: "#2d2d2d",
			},
		})

		const candlestickSeries = chart.addSeries(CandlestickSeries, {
			upColor: "#089981",
			downColor: "#f23645",
			borderVisible: false,
			wickUpColor: "#089981",
			wickDownColor: "#f23645",
			priceFormat: {
				type: "price",
				precision: 10,
				minMove: 0.0000000001,
			},
		})

		chartRef.current = chart
		seriesRef.current = candlestickSeries

		// handle resize
		const handleResize = () => {
			if (containerRef.current) {
				chart.applyOptions({
					width: containerRef.current.clientWidth,
				})
			}
		}

		const resizeObserver = new ResizeObserver(handleResize)
		resizeObserver.observe(containerRef.current)

		return () => {
			resizeObserver.disconnect()
			chart.remove()
			chartRef.current = null
			seriesRef.current = null
		}
	}, [])

	// update chart data
	useEffect(() => {
		if (!seriesRef.current || chartData.length === 0) return

		seriesRef.current.setData(chartData)
		chartRef.current?.timeScale().fitContent()
	}, [chartData])

	const hasData = chartData.length > 0

	return (
		<div className="border-2 bg-background/50 backdrop-blur-sm shadow-2xl rounded-xl overflow-hidden">
			<div className="p-4 border-b flex items-center justify-between">
				<h3 className="text-lg font-mono uppercase tracking-wider flex items-center gap-2">
					<Activity className={`w-4 h-4 ${isRefetching ? "text-primary animate-pulse" : "text-primary/60"}`} />
					PRICE::CHART
				</h3>
				<Select value={resolution} onValueChange={setResolution}>
					<SelectTrigger className="w-[80px] h-8 font-mono text-xs uppercase bg-background/50 border-border/50">
						<SelectValue />
					</SelectTrigger>
					<SelectContent className="bg-background/95 backdrop-blur-sm border-2">
						{RESOLUTIONS.map(res => (
							<SelectItem key={res.value} value={res.value} className="font-mono text-xs uppercase">
								{res.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
			<div className="p-4">
				<div className="relative w-full h-[400px]">
					{/* always render the chart container */}
					<div ref={containerRef} className="w-full h-full rounded-lg" />

					{isLoading && (
						<div className="absolute inset-0 bg-background/90 rounded-lg flex items-center justify-center">
							<p className="font-mono text-xs uppercase text-muted-foreground">LOADING::DATA</p>
						</div>
					)}

					{!isLoading && (error || !hasData) && (
						<div className="absolute inset-0 bg-background/90 rounded-lg flex flex-col items-center justify-center">
							<Skull className="w-12 h-12 text-foreground/20 mb-4" />
							<p className="font-mono text-sm uppercase text-muted-foreground">
								{error ? "ERROR::LOADING::DATA" : "NO::DATA::AVAILABLE"}
							</p>
							<p className="font-mono text-xs uppercase text-muted-foreground/60 mt-2">
								{error ? "CONNECTION_FAILED" : "CHECK_BACK_LATER"}
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}