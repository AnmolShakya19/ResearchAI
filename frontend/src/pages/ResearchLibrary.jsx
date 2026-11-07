import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, BookOpen, FileText, Plus, Save, Trash2, Download, NotebookPen } from "lucide-react"
import api from "../services/api"

const SECTION_FIELDS = [
  ["abstract", "Abstract"], ["introduction", "Introduction"],
  ["literature_review", "Literature Review"], ["methodology", "Methodology"],
  ["results", "Results"], ["discussion", "Discussion"],
  ["conclusion", "Conclusion"], ["references", "References"],
]
const emptySections = () => Object.fromEntries(SECTION_FIELDS.map(([key]) => [key, ""]))

function downloadText(filename, text, type = "text/markdown") {
  const blob = new Blob([text], { type: `${type};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

function paperMarkdown(paper) {
  return `# ${paper.title}\n\n` + SECTION_FIELDS.map(([key, label]) =>
    `## ${label}\n\n${paper.sections?.[key] || ""}\n`
  ).join("\n")
}

export default function ResearchLibrary() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [tab, setTab] = useState("papers")
  const [papers, setPapers] = useState([])
  const [notes, setNotes] = useState([])
  const [paperId, setPaperId] = useState(null)
  const [noteId, setNoteId] = useState(null)
  const [paperTitle, setPaperTitle] = useState("")
  const [sections, setSections] = useState(emptySections)
  const [noteTitle, setNoteTitle] = useState("")
  const [noteContent, setNoteContent] = useState("")
  const [noteTags, setNoteTags] = useState("")
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const selectedPaper = useMemo(() => papers.find(p => p.id === paperId), [papers, paperId])
  const selectedNote = useMemo(() => notes.find(n => n.id === noteId), [notes, noteId])

  async function refresh() {
    const [p, n] = await Promise.all([
      api.get(`/projects/${projectId}/research-library/papers`),
      api.get(`/projects/${projectId}/research-library/notes`),
    ])
    setPapers(p.data); setNotes(n.data)
  }

  useEffect(() => { refresh().catch(e => setError(e.response?.data?.detail || "Could not load your research library.")) }, [projectId])

  function selectPaper(paper) {
    setPaperId(paper.id); setPaperTitle(paper.title); setSections({ ...emptySections(), ...(paper.sections || {}) })
    setTab("papers"); setMessage("")
  }
  function selectNote(note) {
    setNoteId(note.id); setNoteTitle(note.title); setNoteContent(note.content); setNoteTags((note.tags || []).join(", "))
    setTab("notes"); setMessage("")
  }
  function newPaper() { setPaperId(null); setPaperTitle("Untitled research paper"); setSections(emptySections()); setTab("papers"); setMessage("") }
  function newNote() { setNoteId(null); setNoteTitle("Untitled note"); setNoteContent(""); setNoteTags(""); setTab("notes"); setMessage("") }

  async function savePaper() {
    setBusy(true); setError(""); setMessage("")
    try {
      const payload = { title: paperTitle, sections }
      const res = paperId
        ? await api.put(`/projects/${projectId}/research-library/papers/${paperId}`, payload)
        : await api.post(`/projects/${projectId}/research-library/papers`, payload)
      await refresh(); selectPaper(res.data); setMessage("Paper saved to the project library.")
    } catch (e) { setError(e.response?.data?.detail || "Could not save paper.") }
    finally { setBusy(false) }
  }

  async function saveNote() {
    setBusy(true); setError(""); setMessage("")
    try {
      const payload = { title: noteTitle, content: noteContent, tags: noteTags.split(",").map(x => x.trim()).filter(Boolean) }
      const res = noteId
        ? await api.put(`/projects/${projectId}/research-library/notes/${noteId}`, payload)
        : await api.post(`/projects/${projectId}/research-library/notes`, payload)
      await refresh(); selectNote(res.data); setMessage("Note saved to the project library.")
    } catch (e) { setError(e.response?.data?.detail || "Could not save note.") }
    finally { setBusy(false) }
  }

  async function deleteCurrent() {
    if (!confirm(`Delete this ${tab === "papers" ? "paper" : "note"}?`)) return
    setBusy(true); setError("")
    try {
      if (tab === "papers" && paperId) {
        await api.delete(`/projects/${projectId}/research-library/papers/${paperId}`)
        setPapers(prev => prev.filter(x => x.id !== paperId)); newPaper()
      } else if (tab === "notes" && noteId) {
        await api.delete(`/projects/${projectId}/research-library/notes/${noteId}`)
        setNotes(prev => prev.filter(x => x.id !== noteId)); newNote()
      }
      setMessage("Deleted.")
    } catch (e) { setError(e.response?.data?.detail || "Delete failed.") }
    finally { setBusy(false) }
  }

  function addNoteToPaper() {
    if (!selectedNote || !selectedPaper) return
    const current = sections.introduction || ""
    setSections(prev => ({ ...prev, introduction: `${current}${current ? "\n\n" : ""}${selectedNote.title}\n${selectedNote.content}` }))
    setMessage("Note added to the Introduction draft. Save the paper to keep the change.")
    setTab("papers")
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 md:px-8">
      <div className="mx-auto max-w-7xl">
        <button onClick={() => navigate(`/project/${projectId}`)} className="mb-5 flex items-center gap-2 text-sm text-sky-300 hover:text-sky-200"><ArrowLeft size={16}/> Back to project chat</button>
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div><p className="text-sm uppercase tracking-widest text-sky-300">ResearchAI · Workspace</p><h1 className="mt-1 text-3xl font-bold">Research Library</h1><p className="mt-2 text-slate-400">Draft papers and keep project findings in persistent notes.</p></div>
          <div className="flex gap-2">
            <button onClick={newNote} className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 hover:bg-slate-800"><Plus size={16}/> New note</button>
            <button onClick={newPaper} className="flex items-center gap-2 rounded-lg bg-sky-400 px-3 py-2 font-semibold text-slate-950 hover:bg-sky-300"><Plus size={16}/> New paper</button>
          </div>
        </header>

        <div className="mb-5 flex gap-2">
          <button onClick={() => setTab("papers")} className={`flex items-center gap-2 rounded-lg px-4 py-2 ${tab === "papers" ? "bg-sky-400 text-slate-950" : "bg-slate-900 text-slate-300"}`}><BookOpen size={16}/> Papers ({papers.length})</button>
          <button onClick={() => setTab("notes")} className={`flex items-center gap-2 rounded-lg px-4 py-2 ${tab === "notes" ? "bg-sky-400 text-slate-950" : "bg-slate-900 text-slate-300"}`}><NotebookPen size={16}/> Notes ({notes.length})</button>
        </div>
        {error && <p role="alert" className="mb-4 rounded-lg border border-red-800 bg-red-950/40 p-3 text-red-200">{error}</p>}
        {message && <p role="status" className="mb-4 rounded-lg border border-emerald-800 bg-emerald-950/30 p-3 text-emerald-200">{message}</p>}

        <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
            <h2 className="mb-3 px-2 text-sm font-semibold text-slate-400">{tab === "papers" ? "YOUR PAPERS" : "YOUR NOTES"}</h2>
            {(tab === "papers" ? papers : notes).length === 0 && <p className="px-2 py-4 text-sm text-slate-500">Nothing saved yet.</p>}
            {(tab === "papers" ? papers : notes).map(item => (
              <button key={item.id} onClick={() => tab === "papers" ? selectPaper(item) : selectNote(item)} className={`mb-1 block w-full rounded-lg px-3 py-3 text-left text-sm ${((tab === "papers" ? paperId : noteId) === item.id) ? "bg-sky-500/15 text-sky-200" : "text-slate-300 hover:bg-slate-800"}`}>
                <span className="block truncate font-medium">{item.title}</span>
                <span className="mt-1 block text-xs text-slate-500">{new Date(item.updated_at || item.created_at).toLocaleDateString()}</span>
              </button>
            ))}
          </aside>

          <section className="min-w-0 rounded-xl border border-slate-800 bg-slate-900/50 p-4 md:p-6">
            {tab === "papers" ? <>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2 text-slate-300"><FileText size={18}/><span className="text-sm">{paperId ? "Edit paper" : "New paper draft"}</span></div><div className="flex gap-2">{paperId && <button onClick={deleteCurrent} disabled={busy} className="rounded-lg border border-red-900 px-3 py-2 text-sm text-red-300"><Trash2 size={15}/></button>}<button onClick={() => downloadText(`${(paperTitle || "research-paper").replace(/[^a-z0-9-_]+/gi, "-")}.md`, paperMarkdown({title: paperTitle, sections}))} className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm"><Download size={15}/> Export .md</button><button onClick={savePaper} disabled={busy} className="flex items-center gap-2 rounded-lg bg-sky-400 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50"><Save size={15}/>{busy ? "Saving…" : "Save paper"}</button></div></div>
              <label className="mb-2 block text-sm text-slate-400">Paper title</label><input value={paperTitle} onChange={e => setPaperTitle(e.target.value)} className="mb-5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-lg font-semibold outline-none focus:border-sky-400"/>
              <div className="space-y-5">{SECTION_FIELDS.map(([key, label]) => <div key={key}><label className="mb-2 block text-sm font-semibold text-slate-300">{label}</label><textarea value={sections[key] || ""} onChange={e => setSections(prev => ({...prev, [key]: e.target.value}))} rows={key === "abstract" ? 4 : 6} placeholder={`Draft the ${label.toLowerCase()}…`} className="w-full resize-y rounded-lg border border-slate-800 bg-slate-950 p-3 leading-6 outline-none focus:border-sky-400"/></div>)}</div>
            </> : <>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2 text-slate-300"><NotebookPen size={18}/><span className="text-sm">{noteId ? "Edit note" : "New note"}</span></div><div className="flex gap-2">{noteId && <button onClick={deleteCurrent} disabled={busy} className="rounded-lg border border-red-900 px-3 py-2 text-sm text-red-300"><Trash2 size={15}/></button>}<button onClick={() => downloadText(`${(noteTitle || "research-note").replace(/[^a-z0-9-_]+/gi, "-")}.md`, `# ${noteTitle}\n\n${noteContent}\n\nTags: ${noteTags}`)} className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm"><Download size={15}/> Export .md</button><button onClick={saveNote} disabled={busy} className="flex items-center gap-2 rounded-lg bg-sky-400 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50"><Save size={15}/>{busy ? "Saving…" : "Save note"}</button></div></div>
              <label className="mb-2 block text-sm text-slate-400">Note title</label><input value={noteTitle} onChange={e => setNoteTitle(e.target.value)} className="mb-4 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-lg font-semibold outline-none focus:border-sky-400"/>
              <label className="mb-2 block text-sm text-slate-400">Tags (comma-separated)</label><input value={noteTags} onChange={e => setNoteTags(e.target.value)} placeholder="e.g. RAG, methodology, related work" className="mb-4 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 outline-none focus:border-sky-400"/>
              <label className="mb-2 block text-sm text-slate-400">Research findings</label><textarea value={noteContent} onChange={e => setNoteContent(e.target.value)} rows={18} placeholder="Save useful findings, summaries, hypotheses, or chat answers here…" className="w-full resize-y rounded-lg border border-slate-800 bg-slate-950 p-3 leading-6 outline-none focus:border-sky-400"/>
              {selectedNote && selectedPaper && <button onClick={addNoteToPaper} className="mt-4 rounded-lg border border-sky-700 px-3 py-2 text-sm text-sky-200">Add this note to selected paper’s Introduction</button>}
              {selectedNote && papers.length > 0 && <p className="mt-3 text-xs text-slate-500">To insert this note into a paper, select the paper in the Papers tab first, then return to this note.</p>}
            </>}
          </section>
        </div>
      </div>
    </main>
  )
}
