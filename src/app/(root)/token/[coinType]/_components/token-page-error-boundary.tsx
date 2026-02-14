"use client"

import { Component, type ReactNode } from "react"

interface Props {
	children: ReactNode
}

interface State {
	hasError: boolean
}

export class TokenPageErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props)
		this.state = { hasError: false }
	}

	static getDerivedStateFromError(): State {
		return { hasError: true }
	}

	componentDidCatch(error: Error) {
		console.error("Token page error:", error)
	}

	render() {
		if (this.state.hasError) {
			return (
				<div className="flex flex-col items-center justify-center min-h-[300px] gap-4 p-8">
					<p className="font-mono text-sm text-muted-foreground">Something went wrong</p>
					<button
						onClick={() => this.setState({ hasError: false })}
						className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
					>
						Try again
					</button>
				</div>
			)
		}
		return this.props.children
	}
}
