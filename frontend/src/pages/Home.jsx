import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import api from "../services/api"
import {
    FileText,
    Plus,
    Trash2,
    FolderOpen,
    Settings as SettingsIcon,
    LogOut,
    X,
    LayoutDashboard,
    ChevronRight
} from "lucide-react"

function Home() {
    const navigate = useNavigate()
    const location = useLocation()

    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(true)
    const [newName, setNewName] = useState("")
    const [newDesc, setNewDesc] = useState("")
    const [creating, setCreating] = useState(false)

    const [user, setUser] = useState({ name: "", email: "", avatar_url: "" })

    useEffect(() => {
        fetchProjects()
        fetchUser()
    }, [])

    const fetchUser = async () => {
        try {
            const res = await api.get("/users/me")
            setUser(res.data)
        } catch (error) {
            console.error(error)
        }
    }

    const fetchProjects = async () => {
        try {
            const response = await api.get("/projects/")
            setProjects(response.data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = async (e) => {
        if (e) e.preventDefault()
        if (!newName.trim()) {
            alert("Please enter a project name")
            return
        }
        try {
            const response = await api.post("/projects/", {
                project_name: newName,
                description: newDesc,
            })
            setProjects([response.data, ...projects])
            setNewName("")
            setNewDesc("")
            setCreating(false)
            navigate(`/project/${response.data.id}`)
        } catch (error) {
            console.error(error)
            alert("Failed to create project")
        }
    }

    const handleDelete = async (e, id) => {
        e.stopPropagation()
        if (!confirm("Delete this project? This will also delete all its documents and chats.")) return
        try {
            await api.delete(`/projects/${id}`)
            setProjects(projects.filter(p => p.id !== id))
        } catch (error) {
            console.error(error)
            alert("Failed to delete project")
        }
    }

    const handleLogout = () => {
        localStorage.removeItem("access_token")
        navigate("/")
    }

    const getInitials = (name) => {
        return name ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "AI"
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-slate-100 to-indigo-100 dark:from-gray-950 dark:via-slate-900 dark:to-zinc-900 flex transition-colors duration-300 relative overflow-x-hidden">

            <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-1/3 left-1/3 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <aside className="w-64 fixed h-screen top-0 left-0 hidden md:flex flex-col justify-between backdrop-blur-lg bg-white/60 dark:bg-gray-900/60 border-r border-gray-200/50 dark:border-gray-800/50 p-6 z-50">
                <div className="space-y-8">
                    <div className="flex items-center gap-3 px-2">
                        <span className="h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 ring-1 ring-white/20">
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                aria-label="ResearchAI logo"
                                role="img"
                            >
                                <path d="M3.5 5.5C6.7 4.5 9.5 5.2 12 7.2V20C9.5 18 6.7 17.3 3.5 18.3V5.5Z" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M20.5 5.5C17.3 4.5 14.5 5.2 12 7.2V20C14.5 18 17.3 17.3 20.5 18.3V5.5Z" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M17.5 2.5V6.5M15.5 4.5H19.5" stroke="#C4B5FD" strokeWidth="1.7" strokeLinecap="round"/>
                            </svg>
                        </span>
                        <h1 className="text-lg font-extrabold tracking-tight text-gray-900 dark:text-white cursor-default">
                            Research<span className="text-blue-600 dark:text-blue-400">AI</span>
                        </h1>
                    </div>

                    <div className="space-y-1.5">
                        <p className="px-2 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Main Core</p>

                        <button
                            onClick={() => navigate("/home")}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer group ${location.pathname === "/home"
                                ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white"
                                }`}
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            Workspaces
                        </button>

                        <button
                            onClick={() => navigate("/all-documents")}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer group ${location.pathname === "/all-documents"
                                ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white"
                                }`}
                        >
                            <FolderOpen className="w-4 h-4" />
                            All Documents
                        </button>
                    </div>
                </div>

                <div className="space-y-1">
                    <button
                        onClick={() => navigate("/settings")}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer group ${location.pathname === "/settings"
                            ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white"
                            }`}
                    >
                        <SettingsIcon className="w-4 h-4" />
                        Settings
                    </button>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl text-sm font-medium transition-all cursor-pointer"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </aside>

            <div className="flex-1 md:pl-64 flex flex-col min-h-screen">

                <header className="sticky top-0 z-40 backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border-b border-gray-200/50 dark:border-gray-800/50 px-6 lg:px-10 py-3.5 flex justify-between md:justify-end items-center transition-all">
                    <div className="flex items-center gap-2 md:hidden">
                        <span className="h-7 w-7 rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center">
                            <span className="text-white font-black text-xs">A</span>
                        </span>
                        <h1 className="text-base font-extrabold tracking-tight text-gray-900 dark:text-white">ResearchAI</h1>
                    </div>

                    <div
                        onClick={() => navigate("/profile")}
                        className="flex items-center gap-3 p-1.5 pr-3 hover:bg-gray-100 dark:hover:bg-gray-800/60 border border-transparent hover:border-gray-200/60 dark:hover:border-gray-700/60 rounded-xl transition-all duration-200 cursor-pointer group"
                    >
                        {user.avatar_url ? (
                            <img src={user.avatar_url} alt="Profile" className="h-8 w-8 rounded-lg object-cover ring-2 ring-blue-500/10" />
                        ) : (
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-sm shadow-blue-500/20">
                                {getInitials(user.name)}
                            </div>
                        )}
                        <div className="text-left hidden sm:block">
                            <p className="text-xs font-bold text-gray-900 dark:text-white leading-none group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {user.name}
                            </p>
                            <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 mt-0.5 leading-none">
                                {user.email}
                            </p>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform hidden sm:block" />
                    </div>
                </header>

                <main className="px-6 lg:px-10 py-10 max-w-5xl w-full mx-auto flex-1 relative z-10">

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                        <div>
                            
      {/* AXORYNAI_FEATURE_HUB */}
      <section className="mb-10 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-900 p-7 text-white shadow-xl md:p-10">
        <div className="mx-auto max-w-5xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-indigo-100">
            <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
            YOUR AI-POWERED RESEARCH WORKSPACE
          </div>
          <h2 className="max-w-3xl text-3xl font-bold tracking-tight md:text-5xl">
            Research smarter.<br className="hidden sm:block" /> Discover what matters.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
            Explore academic literature, discover research code and datasets,
            and turn your documents into useful insights — all in ResearchAI.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="/research-resources"
               className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-indigo-950 shadow-lg transition hover:-translate-y-0.5 hover:bg-indigo-50">
              Explore Research Resources <span aria-hidden="true">→</span>
            </a>
            <a href="#axorynai-workspaces"
               className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20">
              Open My Workspaces <span aria-hidden="true">↓</span>
            </a>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <a href="/research-resources"
               className="group rounded-2xl border border-white/10 bg-white/[0.07] p-4 transition hover:-translate-y-1 hover:bg-white/[0.14]">
              <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-400/20 text-xl">✦</span>
              <span className="block font-semibold">Research Papers</span>
              <span className="mt-1 block text-xs leading-5 text-slate-300">Discover scholarly literature</span>
              <span className="mt-3 block text-sm text-violet-200">Explore papers →</span>
            </a>
            <a href="/research-resources"
               className="group rounded-2xl border border-white/10 bg-white/[0.07] p-4 transition hover:-translate-y-1 hover:bg-white/[0.14]">
              <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-sky-400/20 text-xl">⌘</span>
              <span className="block font-semibold">Code Repositories</span>
              <span className="mt-1 block text-xs leading-5 text-slate-300">Find open-source projects</span>
              <span className="mt-3 block text-sm text-sky-200">Discover code →</span>
            </a>
            <a href="/research-resources"
               className="group rounded-2xl border border-white/10 bg-white/[0.07] p-4 transition hover:-translate-y-1 hover:bg-white/[0.14]">
              <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/20 text-xl">▤</span>
              <span className="block font-semibold">Datasets</span>
              <span className="mt-1 block text-xs leading-5 text-slate-300">Find data for experiments</span>
              <span className="mt-3 block text-sm text-amber-200">Explore datasets →</span>
            </a>
            <a href="#axorynai-workspaces"
               className="group rounded-2xl border border-white/10 bg-white/[0.07] p-4 transition hover:-translate-y-1 hover:bg-white/[0.14]">
              <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/20 text-xl">▣</span>
              <span className="block font-semibold">My Workspaces</span>
              <span className="mt-1 block text-xs leading-5 text-slate-300">Continue your existing projects</span>
              <span className="mt-3 block text-sm text-emerald-200">View workspaces →</span>
            </a>
          </div>
        </div>
      </section>
      <div id="axorynai-workspaces"></div>

      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                                Project Workspaces
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1.5 text-sm">
                                Build focused workspaces for your documents and deploy AI agents designed for research, analysis, and discovery.
                            </p>
                        </div>

                        <button
                            onClick={() => setCreating(!creating)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-md cursor-pointer active:scale-98 self-start sm:self-center ${creating
                                ? "bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                                : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/10"
                                }`}
                        >
                            {creating ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            {creating ? "Close Form" : "New Project"}
                        </button>
                    </div>

                    {creating && (
                        <div className="backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border border-gray-200/60 dark:border-gray-800/60 p-6 rounded-2xl shadow-xl mb-10 max-w-xl transition-all duration-300 animate-in fade-in slide-in-from-top-4">
                            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">Initialize Workspace</h2>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                        Project Designation *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g., Q3 Market Research Analytics"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        className="w-full border border-gray-300/80 dark:border-gray-700/80 bg-white dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                        Scope Context (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Provide a short description of this workspace and its objectives..."
                                        value={newDesc}
                                        onChange={(e) => setNewDesc(e.target.value)}
                                        className="w-full border border-gray-300/80 dark:border-gray-700/80 bg-white dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-sm"
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="submit"
                                        className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl font-medium text-sm shadow-sm active:scale-95 transition-all cursor-pointer"
                                    >
                                        Build Workspace
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setCreating(false)}
                                        className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-5 py-2 rounded-xl font-medium text-sm active:scale-95 transition-all cursor-pointer"
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-3">
                            <div className="w-7 h-7 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium tracking-wide">Synchronizing Workspaces...</p>
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="backdrop-blur-sm bg-white/40 dark:bg-gray-900/40 border border-dashed border-gray-300 dark:border-gray-800 text-center py-20 rounded-2xl max-w-xl mx-auto">
                            <div className="h-12 w-12 bg-gray-100 dark:bg-gray-800/50 rounded-xl flex items-center justify-center mx-auto mb-4 border border-gray-200 dark:border-gray-700">
                                <FileText className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                            </div>
                            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">No operational workspaces found</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-xs max-w-xs mx-auto mb-6">
                                Create your first project workspace to begin exploring AI-assisted research and analysis.
                            </p>
                            <button
                                onClick={() => setCreating(true)}
                                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-medium shadow-sm transition-all cursor-pointer"
                            >
                                <Plus className="w-3.5 h-3.5" /> New Project
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-in fade-in duration-300">
                            {projects.map((p) => (
                                <div
                                    key={p.id}
                                    onClick={() => navigate(`/project/${p.id}`)}
                                    className="group relative backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border border-gray-200/60 dark:border-gray-800/60 p-5 rounded-2xl shadow-sm flex flex-col justify-between cursor-pointer hover:shadow-xl dark:hover:shadow-blue-500/[0.01] hover:border-blue-500/30 dark:hover:border-blue-500/30 transition-all duration-200 hover:-translate-y-0.5"
                                    style={{ contentVisibility: 'auto' }}
                                >
                                    <div className="space-y-2">
                                        <div className="h-9 w-9 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center mb-3 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/30 group-hover:border-blue-200 dark:group-hover:border-blue-900/50 transition-colors">
                                            <FolderOpen className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                                        </div>
                                        <h2 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                                            {p.project_name}
                                        </h2>
                                        <p className="text-gray-500 dark:text-gray-400 text-xs line-clamp-3 leading-relaxed">
                                            {p.description || "No workspace description available."}
                                        </p>
                                    </div>

                                    <div className="mt-5 pt-3 border-t border-gray-100 dark:border-gray-800/80 flex justify-between items-center">
                                        <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 group-hover:underline flex items-center gap-1">
                                            Open Workspace →
                                        </span>
                                        <button
                                            onClick={(e) => handleDelete(e, p.id)}
                                            className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer"
                                            title="Delete Workspace Profile"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}

export default Home