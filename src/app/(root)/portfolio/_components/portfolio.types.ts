import { PortfolioBalanceItem, PortfolioResponse } from '@/types/portfolio';

export interface PortfolioTableHeadProps {
  handleSort: (field: SortField) => void
  sortField: SortField
  sortOrder: SortOrder
}

export interface PortfolioTableBodyProps{
  sortedBalances: PortfolioBalanceItem[]
}

export interface PortfolioTableProps {
  portfolio: PortfolioResponse
  hideSmallBalance: boolean
  onHideSmallBalanceChange: (value: boolean) => void
}

export interface PortfolioTableControlProps extends Omit<PortfolioTableProps, 'portfolio'> {
  sortedBalanceSize: number;
  portfolioSize: number;
}

export interface PortfolioHeaderProps {
  claimRewards: () => void;
}

export interface PortfolioWalletConnectProps {
  openDialog: () => void;
}

export interface PortfolioErrorProps {
  error: string;
}

export interface PortfolioStatsProps {
  portfolio: PortfolioResponse
}

export type SortField = "name" | "value" | "pnl" | "pnlPercentage"
export type SortOrder = "asc" | "desc"
