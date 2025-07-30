"use client"

import { useEffect, useMemo, useRef } from "react"
import { createChart, ColorType, IChartApi, ISeriesApi, Time, CandlestickSeries } from "lightweight-charts"
import type { PoolWithMetadata } from "@/types/pool"
import { useCoinOHLCV } from "@/hooks/datafeed/use-coin-ohlcv"
import { Logo } from "@/components/ui/logo"

interface EmbedChartProps {
	pool: PoolWithMetadata
}

export function EmbedChart({ pool }: EmbedChartProps) {
	const chartContainerRef = useRef<HTMLDivElement>(null)
	const chartRef = useRef<IChartApi | null>(null)
	const seriesRef = useRef<ISeriesApi<"Candlestick", Time> | null>(null)

	const { data: rawData, isLoading, error } = useCoinOHLCV({
		symbol: pool.coinType,
		resolution: "1",
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
	}, [rawData])

	useEffect(() => {
		if (!chartContainerRef.current) return

		const chart = createChart(chartContainerRef.current, {
			width: chartContainerRef.current.clientWidth,
			height: chartContainerRef.current.clientHeight,
			layout: {
				background: { type: ColorType.Solid, color: "transparent" },
				textColor: "#888888",
				fontSize: 10,
				fontFamily: "monospace",
			},
			grid: {
				vertLines: { color: "#333333" },
				horzLines: { color: "#333333" },
			},
			crosshair: {
				mode: 0,
				vertLine: {
					color: "#666666",
					width: 1,
					style: 3,
				},
				horzLine: {
					color: "#666666",
					width: 1,
					style: 3,
				},
			},
			rightPriceScale: {
				borderColor: "#333333",
				autoScale: true,
			},
			timeScale: {
				borderColor: "#333333",
				timeVisible: true,
				secondsVisible: false,
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

		const handleResize = () => {
			if (chartContainerRef.current) {
				chart.applyOptions({
					width: chartContainerRef.current.clientWidth,
				})
			}
		}

		const resizeObserver = new ResizeObserver(handleResize)
		resizeObserver.observe(chartContainerRef.current)

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
		<div className="relative h-full w-full">
			<div ref={chartContainerRef} className="w-full h-full" />

			{isLoading && (
				<div className="absolute inset-0 bg-background/90 flex items-center justify-center">
					<p className="font-mono text-xs uppercase text-muted-foreground">LOADING::DATA</p>
				</div>
			)}

			{!isLoading && (error || !hasData) && (
				<div className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center">
					<Logo className="w-8 h-8 mx-auto mb-2 text-foreground/20" />
					<p className="font-mono text-xs uppercase text-muted-foreground">
						{error ? "ERROR::LOADING::DATA" : "NO::DATA::AVAILABLE"}
					</p>
					<p className="font-mono text-[10px] uppercase text-muted-foreground/60 mt-1">
						{error ? "[CONNECTION_FAILED]" : "[CHECK_BACK_LATER]"}
					</p>
				</div>
			)}
		</div>
	)
}