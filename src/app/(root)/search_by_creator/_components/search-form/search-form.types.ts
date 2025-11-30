export interface SearchFormProps {
  query: string
  loading: boolean
  onSubmit: () => void
  setQuery: (value: string) => void
}