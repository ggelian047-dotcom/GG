import { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Plus, 
  Star, 
  MapPin, 
  DollarSign, 
  ArrowUpDown, 
  MessageSquare, 
  X,
  ChevronRight,
  Building2,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Job {
  id: number;
  title: string;
  company: string;
  description: string;
  salary: number;
  location: string;
  rating: number;
  created_at: string;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  author: string;
  created_at: string;
}

export default function App() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Form states
  const [newJob, setNewJob] = useState({ title: '', company: '', description: '', salary: '', location: '' });
  const [newReview, setNewReview] = useState({ rating: 5, comment: '', author: '' });

  const fetchJobs = async () => {
    const res = await fetch(`/api/jobs?sort=${sortOrder}`);
    const data = await res.json();
    setJobs(data);
  };

  const fetchReviews = async (jobId: number) => {
    const res = await fetch(`/api/jobs/${jobId}/reviews`);
    const data = await res.json();
    setReviews(data);
  };

  useEffect(() => {
    fetchJobs();
  }, [sortOrder]);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newJob, salary: parseInt(newJob.salary) })
    });
    setIsModalOpen(false);
    setNewJob({ title: '', company: '', description: '', salary: '', location: '' });
    fetchJobs();
  };

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    await fetch(`/api/jobs/${selectedJob.id}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReview)
    });
    setIsReviewModalOpen(false);
    setNewReview({ rating: 5, comment: '', author: '' });
    fetchReviews(selectedJob.id);
    fetchJobs(); // Update rating on main list
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <Briefcase size={18} />
            </div>
            <span className="text-xl font-bold tracking-tight">JobHub</span>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-sm active:scale-95"
          >
            <Plus size={18} />
            <span className="hidden sm:inline font-medium">Разместить вакансию</span>
          </button>
        </div>
      </nav>

      {/* Hero */}
      <header className="bg-white border-b border-zinc-200 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900">Найдите лучших специалистов</h1>
              <p className="text-zinc-500 text-lg max-w-xl">
                Размещайте вакансии, читайте отзывы и управляйте предложениями на самой современной платформе для работодателей.
              </p>
            </div>
            
            <div className="flex items-center gap-3 bg-zinc-100 p-1 rounded-xl">
              <button 
                onClick={() => setSortOrder('desc')}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                  sortOrder === 'desc' ? "bg-white text-indigo-600 shadow-sm" : "text-zinc-500 hover:text-zinc-800"
                )}
              >
                <ArrowUpDown size={14} />
                Сначала дорогие
              </button>
              <button 
                onClick={() => setSortOrder('asc')}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                  sortOrder === 'asc' ? "bg-white text-indigo-600 shadow-sm" : "text-zinc-500 hover:text-zinc-800"
                )}
              >
                <ArrowUpDown size={14} />
                Сначала бюджетные
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-6">
          {jobs.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-zinc-300">
              <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto text-zinc-400 mb-4">
                <Briefcase size={32} />
              </div>
              <h3 className="text-xl font-semibold text-zinc-900">Пока нет вакансий</h3>
              <p className="text-zinc-500 mt-2">Будьте первым, кто разместит предложение о работе!</p>
            </div>
          ) : (
            jobs.map((job) => (
              <motion.div 
                layout
                key={job.id}
                className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm hover:shadow-md transition-all group cursor-pointer"
                onClick={() => {
                  setSelectedJob(job);
                  fetchReviews(job.id);
                }}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-400 border border-zinc-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <Building2 size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors">{job.title}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-zinc-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Building2 size={14} />
                          {job.company}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1 text-amber-500">
                          <Star size={14} fill="currentColor" />
                          {job.rating > 0 ? job.rating.toFixed(1) : 'Нет отзывов'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between md:flex-col md:items-end gap-2">
                    <div className="text-2xl font-black text-zinc-900 flex items-center gap-1">
                      <DollarSign size={20} className="text-emerald-500" />
                      {job.salary.toLocaleString()}
                    </div>
                    <div className="text-xs text-zinc-400 flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(job.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </main>

      {/* Create Job Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Новая вакансия</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleCreateJob} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-zinc-700">Название должности</label>
                  <input 
                    required
                    value={newJob.title}
                    onChange={e => setNewJob({...newJob, title: e.target.value})}
                    placeholder="Напр. Senior Frontend Developer"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-zinc-700">Компания</label>
                    <input 
                      required
                      value={newJob.company}
                      onChange={e => setNewJob({...newJob, company: e.target.value})}
                      placeholder="Название"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-zinc-700">Локация</label>
                    <input 
                      required
                      value={newJob.location}
                      onChange={e => setNewJob({...newJob, location: e.target.value})}
                      placeholder="Город или Удаленно"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-zinc-700">Зарплата (в месяц)</label>
                  <div className="relative">
                    <DollarSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input 
                      required
                      type="number"
                      value={newJob.salary}
                      onChange={e => setNewJob({...newJob, salary: e.target.value})}
                      placeholder="0"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-zinc-700">Описание</label>
                  <textarea 
                    required
                    value={newJob.description}
                    onChange={e => setNewJob({...newJob, description: e.target.value})}
                    placeholder="Расскажите о вакансии..."
                    rows={4}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none"
                  />
                </div>
                
                <button 
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] mt-4"
                >
                  Опубликовать
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Job Details & Reviews Modal */}
      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedJob(null)}
              className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{selectedJob.title}</h2>
                    <p className="text-sm text-zinc-500 font-medium">{selectedJob.company}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedJob(null)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <section className="space-y-3">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Briefcase size={18} className="text-indigo-600" />
                    Описание вакансии
                  </h3>
                  <p className="text-zinc-600 leading-relaxed whitespace-pre-wrap">
                    {selectedJob.description}
                  </p>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                      <DollarSign size={14} />
                      {selectedJob.salary.toLocaleString()} / мес
                    </div>
                    <div className="bg-zinc-100 text-zinc-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                      <MapPin size={14} />
                      {selectedJob.location}
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <MessageSquare size={18} className="text-indigo-600" />
                      Отзывы
                    </h3>
                    <button 
                      onClick={() => setIsReviewModalOpen(true)}
                      className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                    >
                      <Plus size={14} />
                      Оставить отзыв
                    </button>
                  </div>

                  <div className="space-y-4">
                    {reviews.length === 0 ? (
                      <div className="text-center py-8 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                        <p className="text-zinc-400 text-sm">Отзывов пока нет. Будьте первым!</p>
                      </div>
                    ) : (
                      reviews.map((review) => (
                        <div key={review.id} className="bg-zinc-50 p-4 rounded-2xl space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-amber-500">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  size={12} 
                                  fill={i < review.rating ? "currentColor" : "none"} 
                                  className={i < review.rating ? "" : "text-zinc-300"}
                                />
                              ))}
                            </div>
                            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-zinc-700 text-sm italic">"{review.comment}"</p>
                          <p className="text-xs text-zinc-500 font-bold">— {review.author || 'Аноним'}</p>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Review Modal */}
      <AnimatePresence>
        {isReviewModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReviewModalOpen(false)}
              className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                <h2 className="text-xl font-bold">Оставить отзыв</h2>
                <button onClick={() => setIsReviewModalOpen(false)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleCreateReview} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-700">Оценка</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReview({...newReview, rating: star})}
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                          newReview.rating >= star ? "bg-amber-100 text-amber-500" : "bg-zinc-100 text-zinc-400"
                        )}
                      >
                        <Star size={20} fill={newReview.rating >= star ? "currentColor" : "none"} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-zinc-700">Ваше имя</label>
                  <input 
                    required
                    value={newReview.author}
                    onChange={e => setNewReview({...newReview, author: e.target.value})}
                    placeholder="Имя или никнейм"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-zinc-700">Комментарий</label>
                  <textarea 
                    required
                    value={newReview.comment}
                    onChange={e => setNewReview({...newReview, comment: e.target.value})}
                    placeholder="Поделитесь вашим мнением..."
                    rows={3}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none"
                  />
                </div>
                
                <button 
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] mt-4"
                >
                  Отправить отзыв
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
