"use client"

import SearchForm from "./_components/search-form"
import { SearchResults } from "./_components/search-results"
import { useSearchCreator } from "./_hooks/use-search-creator"

const  SearchByCreatorPage = () => {
  const {
    query,
    setQuery,
    loading,
    tokens,
    searched,
    error,
    search,
  } = useSearchCreator()

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-mono font-bold uppercase mb-2">
        Search by Creator
      </h1>

      <SearchForm
        query={query}
        setQuery={setQuery}
        loading={loading}
        onSubmit={() => search(query)}
      />

      <div className="bg-card/50 border rounded-lg overflow-hidden">
        <SearchResults
          loading={loading}
          error={error}
          searched={searched}
          tokens={tokens}
        />
      </div>
    </div>
  )
}

export default SearchByCreatorPage;
