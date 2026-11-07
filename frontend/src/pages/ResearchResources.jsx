import { useState } from "react"
import {
  Search, ExternalLink, BookOpen, Code2, Database,
  LoaderCircle, ShieldCheck, AlertCircle
} from "lucide-react"
import api from "../services/api"

const TYPES = ["All", "paper", "code", "dataset", "research resource"]

const TYPE_LABELS = {
  paper: "Research paper",
  code: "Code repository",
  dataset: "Dataset",
  "research resource": "Research resource",
}

function ResourceIcon({ type }) {
  const common = { size: 20 }
  if (type === "paper") return <BookOpen {...common} />
  if (type === "code") return <Code2 {...common} />
  if (type === "dataset") return <Database {...common} />
  return <Search {...common} />
}

export default function ResearchResources() {
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState("All")
  const [results, setResults] = useState([])
  const [providers, setProviders] = useState([])
  const [notice, setNotice] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  async function handleSearch(event) {
    event.preventDefault()
    if (query.trim().length < 2) {
      setError("Enter at least two characters.")
      return
    }

    setLoading(true)
    setError("")
    setNotice("")
    setSearched(true)

    try {
      const response = await api.get("/research-resources/search", {
        params: { q: query.trim(), limit: 100 },
      })
      setResults(response.data.results || [])
      setProviders(response.data.providers || [])
      setNotice(response.data.notice || "")
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "The search request failed. Check that the backend is running."
      )
      setResults([])
      setProviders([])
    } finally {
      setLoading(false)
    }
  }

  const visibleResults = filter === "All"
    ? results
    : results.filter(item => item.type === filter)

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-8 text-slate-100 md:px-10">
      <div className="mx-auto max-w-6xl">
        <a href="/home" className="text-sm text-sky-400 hover:text-sky-300">
          ← Back to Home
        </a>

        <header className="mb-8 mt-6">
          <div className="mb-3 flex items-center gap-3">
            <div className="rounded-xl bg-sky-500/15 p-3 text-sky-300">
              <Search size={25} />
            </div>
            <span className="text-sm font-medium uppercase tracking-widest text-sky-300">
              Research Intelligence
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Research Resource Discovery
          </h1>
          <p className="mt-3 max-w-3xl leading-7 text-slate-400">
            Discover research papers, code repositories, and datasets across
            multiple scholarly and developer platforms.
          </p>
        </header>

        <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
          <div className="flex flex-1 items-center gap-3 rounded-xl border border-slate-700 bg-slate-900 px-4">
            <Search size={20} className="shrink-0 text-slate-400" />
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Try: retrieval augmented generation"
              aria-label="Research topic"
              className="min-w-0 flex-1 bg-transparent py-4 text-slate-100 outline-none placeholder:text-slate-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-6 py-4 font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-wait disabled:opacity-60"
          >
            {loading
              ? <><LoaderCircle size={18} className="animate-spin" /> Searching…</>
              : <><Search size={18} /> Search resources</>}
          </button>
        </form>

        {error && (
          <div role="alert" className="mt-5 flex gap-3 rounded-xl border border-red-800 bg-red-950/40 p-4 text-red-200">
            <AlertCircle size={20} className="shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {searched && !loading && !error && (
          <section className="mt-8">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">Search results</h2>
                <p className="mt-1 text-sm text-slate-400">
                  {results.length} resources returned for “{query.trim()}”
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => setFilter(type)}
                    className={`rounded-full border px-3 py-2 text-sm capitalize ${
                      filter === type
                        ? "border-sky-400 bg-sky-400/15 text-sky-200"
                        : "border-slate-700 text-slate-400 hover:border-slate-500"
                    }`}
                  >
                    {type === "All" ? type : TYPE_LABELS[type] || type}
                  </button>
                ))}
              </div>
            </div>

            {visibleResults.length === 0 ? (
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
                No resources match this filter. Try another category or query.
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {visibleResults.map((item, index) => (
                  <article
                    key={`${item.provider}-${item.identifier}-${index}`}
                    className="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-slate-600"
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="rounded-lg bg-slate-800 p-2 text-sky-300">
                          <ResourceIcon type={item.type} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-slate-500">{item.provider}</p>
                          <p className="text-sm text-slate-300">
                            {TYPE_LABELS[item.type] || item.type}
                          </p>
                        </div>
                      </div>
                      <span className="shrink-0 rounded-lg border border-slate-700 px-2 py-1 text-sm">
                        {item.quality?.score ?? "—"}/100
                      </span>
                    </div>

                    <h3 className="break-words text-lg font-semibold leading-6">
                      {item.title}
                    </h3>
                    <p className="mt-3 line-clamp-4 whitespace-pre-line break-words text-sm leading-6 text-slate-400">
                      {item.description || "No description was supplied by the provider."}
                    </p>

                    <div className="mt-4 space-y-2 text-sm">
                      <p className="text-slate-300">
                        <span className="text-slate-500">Access: </span>
                        {item.access_status || "Unknown"}
                      </p>
                      <p className="break-words text-slate-300">
                        <span className="text-slate-500">License: </span>
                        {item.license || "Not verified"}
                      </p>
                      {item.authors && (
                        <p className="break-words text-slate-300">
                          <span className="text-slate-500">Authors/owner: </span>
                          {item.authors}
                        </p>
                      )}
                      {item.published_date && (
                        <p className="text-slate-300">
                          <span className="text-slate-500">Date: </span>
                          {item.published_date}
                        </p>
                      )}
                    </div>

                    <details className="mt-4 border-t border-slate-800 pt-4">
                      <summary className="flex cursor-pointer items-center gap-2 text-sm text-sky-300">
                        <ShieldCheck size={16} /> Explain metadata score
                      </summary>
                      <p className="mt-3 text-sm text-slate-400">
                        {item.quality?.label || "No assessment available"}
                      </p>
                      <ul className="mt-3 space-y-2 text-sm">
                        {(item.quality?.checks || []).map(check => (
                          <li key={check.criterion} className="flex items-start justify-between gap-3">
                            <span className="text-slate-400">{check.criterion}</span>
                            <span className={check.passed ? "text-emerald-300" : "text-slate-600"}>
                              {check.passed ? `+${check.weight}` : "Missing"}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-3 text-xs leading-5 text-amber-200/80">
                        {item.quality?.limitation}
                      </p>
                    </details>

                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-sky-300 hover:text-sky-200"
                      >
                        Open source <ExternalLink size={15} />
                      </a>
                    )}
                  </article>
                ))}
              </div>
            )}

            <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <h3 className="font-semibold">Provider availability</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {providers.map(provider => (
                  <span
                    key={provider.provider}
                    className={`rounded-full border px-3 py-1 text-xs ${
                      provider.status === "responded"
                        ? "border-emerald-800 text-emerald-300"
                        : "border-amber-800 text-amber-300"
                    }`}
                    title={provider.detail || ""}
                  >
                    {provider.provider}: {provider.status}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-500">{notice}</p>
            </div>
          </section>
        )}

        {!searched && (
          <section className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              ["Research papers", "Search scholarly metadata across OpenAlex and Crossref."],
              ["Code repositories", "Discover related GitHub repositories and their declared licenses."],
              ["Datasets", "Find dataset records from Zenodo and Hugging Face."],
            ].map(([title, description]) => (
              <div key={title} className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <h2 className="font-semibold">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
              </div>
            ))}
          </section>
        )}
      </div>
    </main>
  )
}
