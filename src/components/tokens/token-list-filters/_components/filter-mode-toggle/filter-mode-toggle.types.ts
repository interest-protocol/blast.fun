type FilterMode = 'audit' | 'metrics'

export interface FilterModeToggleProps {
  value: FilterMode;
  onChange: (v: FilterMode) => void;
}
