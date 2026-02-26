'use client'

import { useState, useEffect } from 'react'

// Types
interface Job {
  id: string
  name: string
  url: string
  status: string
  itemCount: number
  scraperType: string
  createdAt: string
  updatedAt: string
}

interface ScrapedItem {
  id: string
  jobId: string
  title: string | null
  price: string | null
  address: string | null
  area: string | null
  rooms: string | null
  createdAt: string
  job?: { name: string; url: string }
}

interface Stats {
  totalJobs: number
  completedJobs: number
  runningJobs: number
  totalScrapedItems: number
}

// Icons
const HouseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
    <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </svg>
)

const DashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
    <rect width="7" height="9" x="3" y="3" rx="1" />
    <rect width="7" height="5" x="14" y="3" rx="1" />
    <rect width="7" height="9" x="14" y="12" rx="1" />
    <rect width="7" height="5" x="3" y="16" rx="1" />
  </svg>
)

const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
    <polygon points="6 3 20 12 6 21 6 3" />
  </svg>
)

const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
    <path d="m9 18 6-6-6-6" />
  </svg>
)

const BuildingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
    <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
    <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
    <path d="M10 6h4" />
    <path d="M10 10h4" />
    <path d="M10 14h4" />
    <path d="M10 18h4" />
  </svg>
)

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" x2="9" y1="12" y2="12" />
  </svg>
)

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
)

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </svg>
)

const ExternalLinkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
    <path d="M15 3h6v6" />
    <path d="M10 14 21 3" />
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
  </svg>
)

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <line x1="18" x2="6" y1="6" y2="18" />
    <line x1="6" x2="18" y1="6" y2="18" />
  </svg>
)

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
)

const LayersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z" />
    <path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12" />
    <path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17" />
  </svg>
)

const ActivityIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
  </svg>
)

const DatabaseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M3 5V19A9 3 0 0 0 21 19V5" />
    <path d="M3 12A9 3 0 0 0 21 12" />
  </svg>
)

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const statusStyles: Record<string, string> = {
    completed: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    running: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    pending: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    failed: 'bg-red-500/20 text-red-300 border-red-500/30'
  }
  
  return (
    <div className={`inline-flex items-center rounded-md border px-2.5 py-0.5 font-semibold transition-colors text-[10px] ${statusStyles[status] || statusStyles.pending}`}>
      {status}
    </div>
  )
}

// Status Dot Component
const StatusDot = ({ status }: { status: string }) => {
  const dotStyles: Record<string, string> = {
    completed: 'bg-emerald-400',
    running: 'bg-blue-400 animate-pulse',
    pending: 'bg-slate-500',
    failed: 'bg-red-400'
  }
  
  return (
    <div className={`w-2 h-2 rounded-full ${dotStyles[status] || dotStyles.pending}`} />
  )
}

// Stats Card Component
const StatsCard = ({ title, value, subtitle, color, Icon }: {
  title: string
  value: number
  subtitle?: string
  color: 'amber' | 'emerald' | 'blue' | 'violet'
  Icon: React.ReactNode
}) => {
  const colorStyles = {
    amber: 'bg-amber-500/10 ring-amber-500/20 text-amber-400',
    emerald: 'bg-emerald-500/10 ring-emerald-500/20 text-emerald-400',
    blue: 'bg-blue-500/10 ring-blue-500/20 text-blue-400',
    violet: 'bg-violet-500/10 ring-violet-500/20 text-violet-400'
  }
  
  return (
    <div className={`relative overflow-hidden rounded-2xl ring-1 p-6 ${colorStyles[color].split(' ').slice(0, 2).join(' ')}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-slate-500">{title}</p>
          <p className={`mt-2 text-3xl font-bold ${colorStyles[color].split(' ').pop()}`}>{value}</p>
          {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${colorStyles[color].split(' ')[0]}`}>
          {Icon}
        </div>
      </div>
    </div>
  )
}

// Sidebar Component
const Sidebar = ({ isOpen, onClose, activeView, setActiveView }: {
  isOpen: boolean
  onClose: () => void
  activeView: string
  setActiveView: (view: string) => void
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { id: 'newjob', label: 'New Scraper', icon: <PlayIcon /> },
    { id: 'jobs', label: 'Jobs', icon: <ChevronRightIcon /> },
    { id: 'data', label: 'Scraped Data', icon: <BuildingIcon /> }
  ]
  
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <aside className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-slate-900/95 backdrop-blur-xl border-r border-slate-800 flex flex-col transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
              <HouseIcon />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">Web Scraper</h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-medium">Dashboard</p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveView(item.id)
                onClose()
              }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 w-full text-left group ${
                activeView === item.id
                  ? 'bg-amber-500/15 text-amber-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span className={activeView === item.id ? 'text-amber-400' : 'text-slate-500 group-hover:text-slate-300'}>
                {item.icon}
              </span>
              {item.label}
              {activeView === item.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400" />}
            </button>
          ))}
        </nav>
        
        {/* Footer */}
        <div className="p-4 border-t border-slate-800">
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all w-full">
            <LogoutIcon />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}

// New Scraper Modal
const NewScraperModal = ({ isOpen, onClose, onSubmit }: {
  isOpen: boolean
  onClose: () => void
  onSubmit: (name: string, url: string, scraperType: string) => Promise<void>
}) => {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [scraperType, setScraperType] = useState('shallow')
  const [loading, setLoading] = useState(false)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !url) return
    
    setLoading(true)
    try {
      await onSubmit(name, url, scraperType)
      setName('')
      setUrl('')
      setScraperType('shallow')
      onClose()
    } catch (error) {
      console.error('Error creating job:', error)
    } finally {
      setLoading(false)
    }
  }
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">New Scraper Job</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <XIcon />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Job Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Amsterdam Apartments"
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">URL to Scrape</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/real-estate"
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Scraper Type</label>
            <select
              value={scraperType}
              onChange={(e) => setScraperType(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
            >
              <option value="shallow">Shallow (Fast)</option>
              <option value="deep">Deep (Detailed)</option>
            </select>
          </div>
          
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 rounded-lg text-slate-900 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Job Detail Modal
const JobDetailModal = ({ job, onClose, onDelete }: {
  job: Job | null
  onClose: () => void
  onDelete: (id: string) => Promise<void>
}) => {
  const [loading, setLoading] = useState(false)
  
  if (!job) return null
  
  const handleDelete = async () => {
    setLoading(true)
    try {
      await onDelete(job.id)
      onClose()
    } catch (error) {
      console.error('Error deleting job:', error)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">{job.name}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <XIcon />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <p className="text-xs text-slate-500 mb-1">URL</p>
            <p className="text-sm text-white truncate">{job.url}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <p className="text-xs text-slate-500 mb-1">Status</p>
              <StatusBadge status={job.status} />
            </div>
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <p className="text-xs text-slate-500 mb-1">Items Scraped</p>
              <p className="text-lg font-bold text-white">{job.itemCount}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <p className="text-xs text-slate-500 mb-1">Type</p>
              <p className="text-sm text-white capitalize">{job.scraperType}</p>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <p className="text-xs text-slate-500 mb-1">Created</p>
              <p className="text-sm text-white">{new Date(job.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-400 font-medium transition-colors disabled:opacity-50"
            >
              <TrashIcon />
              {loading ? 'Deleting...' : 'Delete Job'}
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main Page Component
export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeView, setActiveView] = useState('dashboard')
  const [showNewScraperModal, setShowNewScraperModal] = useState(false)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [stats, setStats] = useState<Stats>({
    totalJobs: 0,
    completedJobs: 0,
    runningJobs: 0,
    totalScrapedItems: 0
  })
  const [jobs, setJobs] = useState<Job[]>([])
  const [scrapedData, setScrapedData] = useState<ScrapedItem[]>([])
  const [loading, setLoading] = useState(true)
  
  // Fetch data
  const fetchData = async () => {
    try {
      const [statsRes, jobsRes, dataRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/jobs'),
        fetch('/api/data?limit=10')
      ])
      
      const statsData = await statsRes.json()
      const jobsData = await jobsRes.json()
      const dataData = await dataRes.json()
      
      setStats(statsData)
      setJobs(jobsData)
      setScrapedData(dataData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchData()
    
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])
  
  // Create new job and start scraping
  const handleCreateJob = async (name: string, url: string, scraperType: string) => {
    const res = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, url, scraperType })
    })
    
    const job = await res.json()
    
    // Start scraping
    await fetch('/api/scrape', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId: job.id })
    })
    
    fetchData()
  }
  
  // Delete job
  const handleDeleteJob = async (id: string) => {
    await fetch(`/api/jobs?id=${id}`, { method: 'DELETE' })
    fetchData()
  }
  
  // Run existing job
  const handleRunJob = async (job: Job) => {
    await fetch('/api/jobs', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: job.id, status: 'pending' })
    })
    
    await fetch('/api/scrape', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId: job.id })
    })
    
    fetchData()
  }
  
  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeView={activeView}
        setActiveView={setActiveView}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50 px-4 lg:px-8 h-14 flex items-center">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <MenuIcon />
          </button>
          
          <div className="ml-auto flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xs font-bold text-slate-900">
              RE
            </div>
          </div>
        </header>
        
        {/* Main Area */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <div className="space-y-8 max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight capitalize">{activeView === 'newjob' ? 'New Scraper' : activeView}</h1>
                <p className="text-sm text-slate-500 mt-1">Real estate web scraper dashboard</p>
              </div>
              {activeView === 'dashboard' && (
                <button
                  onClick={() => setShowNewScraperModal(true)}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm shadow h-9 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold gap-2"
                >
                  <PlusIcon />
                  New Scraper
                </button>
              )}
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
              </div>
            ) : (
              <>
                {activeView === 'dashboard' && (
                  <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <StatsCard
                        title="Total Jobs"
                        value={stats.totalJobs}
                        subtitle={`${stats.runningJobs} running`}
                        color="amber"
                        Icon={<LayersIcon />}
                      />
                      <StatsCard
                        title="Completed"
                        value={stats.completedJobs}
                        color="emerald"
                        Icon={<ActivityIcon />}
                      />
                      <StatsCard
                        title="Scraped Items"
                        value={stats.totalScrapedItems}
                        color="blue"
                        Icon={<DatabaseIcon />}
                      />
                      <StatsCard
                        title="Running"
                        value={stats.runningJobs}
                        color="violet"
                        Icon={<DashboardIcon />}
                      />
                    </div>
                    
                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Recent Jobs */}
                      <div className="lg:col-span-2 bg-slate-900/60 rounded-2xl border border-slate-800/50 p-6">
                        <div className="flex items-center justify-between mb-5">
                          <h2 className="text-base font-semibold text-white">Recent Jobs</h2>
                          <button
                            onClick={() => setActiveView('jobs')}
                            className="text-xs text-amber-400 hover:text-amber-300 font-medium"
                          >
                            View all →
                          </button>
                        </div>
                        
                        <div className="space-y-2">
                          {jobs.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">
                              No jobs yet. Create your first scraper!
                            </div>
                          ) : (
                            jobs.slice(0, 8).map((job) => (
                              <div
                                key={job.id}
                                onClick={() => setSelectedJob(job)}
                                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/30 hover:bg-slate-800/60 border border-slate-800/50 hover:border-slate-700 transition-all cursor-pointer group"
                              >
                                <div className="flex items-center gap-4 min-w-0">
                                  <div className="flex-shrink-0">
                                    <StatusDot status={job.status} />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{job.name}</p>
                                    <p className="text-xs text-slate-500 mt-0.5 truncate">{job.url}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                  <StatusBadge status={job.status} />
                                  <span className="text-xs text-slate-500 hidden sm:inline">{job.itemCount} items</span>
                                  <ExternalLinkIcon />
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                      
                      {/* Recent Data & Features */}
                      <div className="bg-slate-900/60 rounded-2xl border border-slate-800/50 p-6">
                        <h2 className="text-base font-semibold text-white mb-4">Recent Data</h2>
                        
                        <div className="space-y-2">
                          {scrapedData.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">
                              No data scraped yet
                            </div>
                          ) : (
                            scrapedData.slice(0, 6).map((item, index) => (
                              <div key={item.id} className="p-3 rounded-lg bg-slate-800/30 border border-slate-800/50">
                                <p className="text-xs text-slate-500 mb-1">Item #{index + 1}</p>
                                <p className="text-sm text-white font-medium truncate">
                                  {item.title || item.address || 'Untitled'}
                                </p>
                                {item.price && (
                                  <p className="text-xs text-amber-400 mt-1">{item.price}</p>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                        
                        <div className="mt-6 pt-6 border-t border-slate-800">
                          <h3 className="text-xs font-medium uppercase tracking-widest text-slate-500 mb-3">Features</h3>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/30">
                              <span className="text-sm font-medium text-white">AI-Powered</span>
                              <span className="text-xs text-slate-400">Smart extraction</span>
                            </div>
                            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/30">
                              <span className="text-sm font-medium text-white">Any Website</span>
                              <span className="text-xs text-slate-400">No limits</span>
                            </div>
                            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/30">
                              <span className="text-sm font-medium text-white">Custom Fields</span>
                              <span className="text-xs text-slate-400">Your data structure</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                
                {activeView === 'newjob' && (
                  <div className="max-w-lg mx-auto">
                    <div className="bg-slate-900/60 rounded-2xl border border-slate-800/50 p-6">
                      <h2 className="text-lg font-semibold text-white mb-6">Create New Scraper Job</h2>
                      <form onSubmit={(e) => {
                        e.preventDefault()
                        const form = e.target as HTMLFormElement
                        const formData = new FormData(form)
                        handleCreateJob(
                          formData.get('name') as string,
                          formData.get('url') as string,
                          formData.get('scraperType') as string
                        ).then(() => {
                          form.reset()
                          setActiveView('dashboard')
                        })
                      }} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Job Name</label>
                          <input
                            name="name"
                            type="text"
                            placeholder="e.g., Amsterdam Apartments"
                            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">URL to Scrape</label>
                          <input
                            name="url"
                            type="url"
                            placeholder="https://example.com/real-estate"
                            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Scraper Type</label>
                          <select
                            name="scraperType"
                            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                          >
                            <option value="shallow">Shallow (Fast)</option>
                            <option value="deep">Deep (Detailed)</option>
                          </select>
                        </div>
                        
                        <button
                          type="submit"
                          className="w-full px-4 py-2.5 bg-amber-500 hover:bg-amber-600 rounded-lg text-slate-900 font-semibold transition-colors"
                        >
                          Create & Start Scraping
                        </button>
                      </form>
                    </div>
                  </div>
                )}
                
                {activeView === 'jobs' && (
                  <div className="bg-slate-900/60 rounded-2xl border border-slate-800/50 p-6">
                    <h2 className="text-lg font-semibold text-white mb-6">All Jobs</h2>
                    <div className="space-y-2">
                      {jobs.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                          No jobs yet. Create your first scraper!
                        </div>
                      ) : (
                        jobs.map((job) => (
                          <div
                            key={job.id}
                            className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-800/50"
                          >
                            <div className="flex items-center gap-4 min-w-0 flex-1">
                              <StatusDot status={job.status} />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-white">{job.name}</p>
                                <p className="text-xs text-slate-500 truncate">{job.url}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <StatusBadge status={job.status} />
                              <span className="text-sm text-slate-400">{job.itemCount} items</span>
                              <button
                                onClick={() => handleRunJob(job)}
                                className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 rounded-lg text-amber-400 text-xs font-medium transition-colors"
                              >
                                Run
                              </button>
                              <button
                                onClick={() => setSelectedJob(job)}
                                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 text-xs font-medium transition-colors"
                              >
                                Details
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
                
                {activeView === 'data' && (
                  <div className="bg-slate-900/60 rounded-2xl border border-slate-800/50 p-6">
                    <h2 className="text-lg font-semibold text-white mb-6">Scraped Data</h2>
                    <div className="overflow-x-auto">
                      {scrapedData.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                          No data scraped yet. Run a scraper to collect data!
                        </div>
                      ) : (
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-slate-800">
                              <th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-wider text-slate-500">Title</th>
                              <th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-wider text-slate-500">Price</th>
                              <th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-wider text-slate-500">Area</th>
                              <th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-wider text-slate-500">Rooms</th>
                              <th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-wider text-slate-500">Job</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800">
                            {scrapedData.map((item) => (
                              <tr key={item.id} className="hover:bg-slate-800/30">
                                <td className="py-3 px-4 text-sm text-white">{item.title || '-'}</td>
                                <td className="py-3 px-4 text-sm text-amber-400">{item.price || '-'}</td>
                                <td className="py-3 px-4 text-sm text-slate-300">{item.area || '-'}</td>
                                <td className="py-3 px-4 text-sm text-slate-300">{item.rooms || '-'}</td>
                                <td className="py-3 px-4 text-sm text-slate-400">{item.job?.name || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
      
      {/* Modals */}
      <NewScraperModal
        isOpen={showNewScraperModal}
        onClose={() => setShowNewScraperModal(false)}
        onSubmit={handleCreateJob}
      />
      
      <JobDetailModal
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
        onDelete={handleDeleteJob}
      />
    </div>
  )
}
