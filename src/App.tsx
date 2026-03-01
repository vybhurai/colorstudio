import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Image as ImageIcon, 
  Globe, 
  GraduationCap, 
  Plus, 
  CheckCircle2, 
  Clock, 
  IndianRupee, 
  Calendar, 
  User, 
  Edit2, 
  Trash2, 
  Search,
  Menu,
  X,
  TrendingUp,
  Wallet,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---

type Category = 'Posters' | 'Websites' | 'Educational Consultancy';
type WorkStatus = 'Completed' | 'Pending';
type PaymentStatus = 'Received' | 'Pending';

interface Project {
  id: string;
  clientName: string;
  projectTitle: string;
  deadline: string;
  amount: number;
  workStatus: WorkStatus;
  paymentStatus: PaymentStatus;
  category: Category;
  createdAt: number;
}

// --- Constants ---

const CATEGORIES: Category[] = ['Posters', 'Websites', 'Educational Consultancy'];

// --- Components ---

const StatCard = ({ title, value, icon: Icon, colorClass, subValue }: { 
  title: string; 
  value: string | number; 
  icon: any; 
  colorClass: string;
  subValue?: string;
}) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-card p-6 rounded-2xl relative overflow-hidden group"
  >
    <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full blur-3xl opacity-10 ${colorClass}`} />
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl bg-slate-50 border border-slate-200 ${colorClass.replace('bg-', 'text-')}`}>
        <Icon size={24} />
      </div>
      {subValue && <span className="text-xs font-medium text-slate-400">{subValue}</span>}
    </div>
    <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
    <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
  </motion.div>
);

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category>('Posters');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    clientName: '',
    projectTitle: '',
    deadline: '',
    amount: '',
    workStatus: 'Pending' as WorkStatus,
    paymentStatus: 'Pending' as PaymentStatus,
  });

  // Load data
  useEffect(() => {
    const saved = localStorage.getItem('colr_studio_projects');
    if (saved) {
      try {
        setProjects(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse projects", e);
      }
    }
  }, []);

  // Save data
  useEffect(() => {
    localStorage.setItem('colr_studio_projects', JSON.stringify(projects));
  }, [projects]);

  // Derived Stats
  const stats = useMemo(() => {
    const total = projects.length;
    const completed = projects.filter(p => p.workStatus === 'Completed').length;
    const pending = total - completed;
    const revenue = projects.reduce((acc, p) => acc + (p.paymentStatus === 'Received' ? p.amount : 0), 0);
    const pendingPayments = projects.reduce((acc, p) => acc + (p.paymentStatus === 'Pending' ? p.amount : 0), 0);
    
    return { total, completed, pending, revenue, pendingPayments };
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects
      .filter(p => p.category === activeCategory)
      .filter(p => 
        p.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.projectTitle.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [projects, activeCategory, searchQuery]);

  // Handlers
  const handleAddOrUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(formData.amount) || 0;

    if (editingProject) {
      setProjects(prev => prev.map(p => p.id === editingProject.id ? {
        ...p,
        clientName: formData.clientName,
        projectTitle: formData.projectTitle,
        deadline: formData.deadline,
        amount: amountNum,
        workStatus: formData.workStatus,
        paymentStatus: formData.paymentStatus,
      } : p));
    } else {
      const newProject: Project = {
        id: Math.random().toString(36).substr(2, 9),
        clientName: formData.clientName,
        projectTitle: formData.projectTitle,
        deadline: formData.deadline,
        amount: amountNum,
        workStatus: formData.workStatus,
        paymentStatus: formData.paymentStatus,
        category: activeCategory,
        createdAt: Date.now(),
      };
      setProjects(prev => [newProject, ...prev]);
    }
    closeModal();
  };

  const openModal = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        clientName: project.clientName,
        projectTitle: project.projectTitle,
        deadline: project.deadline,
        amount: project.amount.toString(),
        workStatus: project.workStatus,
        paymentStatus: project.paymentStatus,
      });
    } else {
      setEditingProject(null);
      setFormData({
        clientName: '',
        projectTitle: '',
        deadline: '',
        amount: '',
        workStatus: 'Pending',
        paymentStatus: 'Pending',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
  };

  const deleteProject = (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      setProjects(prev => prev.filter(p => p.id !== id));
    }
  };

  const toggleWorkStatus = (id: string) => {
    setProjects(prev => prev.map(p => p.id === id ? {
      ...p,
      workStatus: p.workStatus === 'Completed' ? 'Pending' : 'Completed'
    } : p));
  };

  const togglePaymentStatus = (id: string) => {
    setProjects(prev => prev.map(p => p.id === id ? {
      ...p,
      paymentStatus: p.paymentStatus === 'Received' ? 'Pending' : 'Received'
    } : p));
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f1f5f9]">
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-72 glass-card border-r border-slate-200 transition-transform duration-300 lg:relative lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <div>
                <h1 className="text-slate-900 font-bold text-lg leading-tight">Colr Studio</h1>
                <p className="text-blue-600 text-[10px] uppercase tracking-[0.2em] font-semibold">Design Agency</p>
              </div>
            </div>

            <nav className="space-y-2">
              <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold mb-4 px-4">Navigation</p>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    activeCategory === cat 
                    ? 'bg-blue-600/10 text-blue-600 border border-blue-600/10' 
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {cat === 'Posters' && <ImageIcon size={20} />}
                  {cat === 'Websites' && <Globe size={20} />}
                  {cat === 'Educational Consultancy' && <GraduationCap size={20} />}
                  <span className="font-medium text-sm">{cat}</span>
                  {activeCategory === cat && (
                    <motion.div layoutId="active-indicator" className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-auto p-8">
            <div className="glass-card p-4 rounded-2xl bg-white/50 border-slate-200">
              <p className="text-xs text-slate-500 mb-2">Storage Usage</p>
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 w-1/3 rounded-full" />
              </div>
              <p className="text-[10px] text-slate-400 mt-2">Syncing with LocalStorage</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Navbar */}
        <header className="h-20 flex items-center justify-between px-8 border-b border-slate-200 glass-card sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 text-slate-500 hover:text-slate-900"
            >
              <Menu size={24} />
            </button>
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-100 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/30 w-64 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end mr-2">
              <span className="text-sm font-medium text-slate-900">Admin User</span>
              <span className="text-[10px] text-blue-600 font-bold uppercase tracking-tighter">Creative Director</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center overflow-hidden">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Avatar" referrerPolicy="no-referrer" />
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard 
              title="Total Projects" 
              value={stats.total} 
              icon={LayoutDashboard} 
              colorClass="bg-blue-600" 
              subValue="All time"
            />
            <StatCard 
              title="Completed" 
              value={stats.completed} 
              icon={CheckCircle2} 
              colorClass="bg-emerald-600" 
              subValue={`${Math.round((stats.completed / (stats.total || 1)) * 100)}% rate`}
            />
            <StatCard 
              title="Pending" 
              value={stats.pending} 
              icon={Clock} 
              colorClass="bg-rose-600" 
              subValue="Active tasks"
            />
            <StatCard 
              title="Total Revenue" 
              value={`₹${stats.revenue.toLocaleString()}`} 
              icon={Wallet} 
              colorClass="bg-purple-600" 
              subValue="Received"
            />
            <StatCard 
              title="Pending Payments" 
              value={`₹${stats.pendingPayments.toLocaleString()}`} 
              icon={AlertCircle} 
              colorClass="bg-orange-600" 
              subValue="Outstanding"
            />
          </div>

          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                {activeCategory}
                <span className="px-2 py-0.5 rounded-md bg-blue-600/10 text-blue-600 text-xs font-bold border border-blue-600/20">
                  {filteredProjects.length}
                </span>
              </h2>
              <p className="text-slate-500 text-sm mt-1">Manage and track your {activeCategory.toLowerCase()} projects.</p>
            </div>
            <button 
              onClick={() => openModal()}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/20 active:scale-95"
            >
              <Plus size={20} />
              Add New Project
            </button>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="glass-card rounded-2xl overflow-hidden group hover:border-blue-600/20 transition-all"
                >
                  <div className="p-6 space-y-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{project.projectTitle}</h3>
                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                          <User size={14} />
                          <span>{project.clientName}</span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => openModal(project)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-600/10 rounded-lg transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => deleteProject(project.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-600/10 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Deadline</p>
                        <div className="flex items-center gap-2 text-slate-900 text-sm">
                          <Calendar size={14} className="text-blue-600" />
                          <span>{new Date(project.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Amount</p>
                        <div className="flex items-center gap-1 text-slate-900 text-sm font-bold">
                          <IndianRupee size={14} className="text-emerald-600" />
                          <span>{project.amount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 font-medium">Work Status</span>
                        <button 
                          onClick={() => toggleWorkStatus(project.id)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                            project.workStatus === 'Completed' 
                            ? 'bg-emerald-600/10 text-emerald-600 border border-emerald-600/20' 
                            : 'bg-rose-600/10 text-rose-600 border border-rose-600/20'
                          }`}
                        >
                          {project.workStatus === 'Completed' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                          {project.workStatus}
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 font-medium">Payment</span>
                        <button 
                          onClick={() => togglePaymentStatus(project.id)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                            project.paymentStatus === 'Received' 
                            ? 'bg-emerald-600/10 text-emerald-600 border border-emerald-600/20' 
                            : 'bg-orange-600/10 text-orange-600 border border-orange-600/20'
                          }`}
                        >
                          {project.paymentStatus === 'Received' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                          {project.paymentStatus === 'Received' ? 'Received' : 'Pending'}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredProjects.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-20 glass-card rounded-3xl border-dashed border-slate-200">
                <div className="p-4 rounded-full bg-slate-50 mb-4">
                  <LayoutDashboard size={40} className="text-slate-300" />
                </div>
                <h3 className="text-slate-900 font-bold">No projects found</h3>
                <p className="text-slate-500 text-sm">Start by adding a new project to this category.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg glass-card rounded-3xl overflow-hidden shadow-2xl border-white"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                    {editingProject ? 'Edit Project' : 'New Project'}
                  </h2>
                  <button onClick={closeModal} className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleAddOrUpdate} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Client Name</label>
                    <input 
                      required
                      type="text" 
                      value={formData.clientName}
                      onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                      placeholder="e.g. Acme Corp"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/30 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Project Title</label>
                    <input 
                      required
                      type="text" 
                      value={formData.projectTitle}
                      onChange={(e) => setFormData({...formData, projectTitle: e.target.value})}
                      placeholder="e.g. Brand Identity Design"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/30 transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Deadline</label>
                      <input 
                        required
                        type="date" 
                        value={formData.deadline}
                        onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/30 transition-all [color-scheme:light]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Amount (₹)</label>
                      <input 
                        required
                        type="number" 
                        value={formData.amount}
                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                        placeholder="0.00"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/30 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Work Status</label>
                      <select 
                        value={formData.workStatus}
                        onChange={(e) => setFormData({...formData, workStatus: e.target.value as WorkStatus})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/30 transition-all appearance-none"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Payment Status</label>
                      <select 
                        value={formData.paymentStatus}
                        onChange={(e) => setFormData({...formData, paymentStatus: e.target.value as PaymentStatus})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/30 transition-all appearance-none"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Received">Received</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button 
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]"
                    >
                      {editingProject ? 'Update Project' : 'Create Project'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
