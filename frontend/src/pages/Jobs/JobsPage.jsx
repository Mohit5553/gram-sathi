import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Briefcase, MapPin, Search, Calendar, ChevronRight, Award, DollarSign } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';
import { useTranslation } from 'react-i18next';


const JobsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [jobsList, setJobsList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fallbackJobs = [
    {
      id: 'fallback-1',
      role: 'Computer Operator',
      company: 'R.S. Digital Seva Center',
      location: 'Gonda Mandi Road, UP',
      salary: '₹12,000 - ₹15,000',
      time: '2h ago',
      initial: '💻',
      type: 'Full Time',
      qualification: '12th Pass + Basic computer usage (Word, Excel) & Hindi/English typing',
      desc: 'हम अपने सीएससी डिजिटल सेवा केंद्र के लिए एक कंप्यूटर ऑपरेटर की तलाश कर रहे हैं। उम्मीदवार को ऑनलाइन फॉर्म भरने, आधार कार्ड सेवाएं, पैन कार्ड आवेदन, बिजली बिल भुगतान और अन्य सरकारी योजनाओं के ऑनलाइन पंजीकरण का कार्य संभालना होगा। अच्छा व्यवहार और तेज गति से काम करने की क्षमता आवश्यक है।'
    },
    {
      id: 'fallback-2',
      role: 'Sales Executive',
      company: 'Tata Motors dealership',
      location: 'Civil Lines, Gonda, UP',
      salary: '₹15,000 - ₹20,000',
      time: '4h ago',
      initial: '🚗',
      type: 'Full Time',
      qualification: 'Graduate or equivalent, fluent communication skills in Hindi, driving license',
      desc: 'टाटा मोटर्स डीलरशिप के लिए ऊर्जावान सेल्स एक्जीक्यूटिव की आवश्यकता है। मुख्य कार्यों में आने वाले ग्राहकों का स्वागत करना, वाहनों की विशेषताएं बताना, टेस्ट ड्राइव का प्रबंध करना और बिक्री क्लोज करना शामिल है। ऑटोमोबाइल सेल्स में 1 वर्ष का अनुभव रखने वाले उम्मीदवारों को प्राथमिकता दी जाएगी।'
    },
    {
      id: 'fallback-3',
      role: 'Delivery Boy',
      company: 'Flipkart Logistics Hub',
      location: 'Industrial Area, Gonda, UP',
      salary: '₹10,000 - ₹12,000',
      time: '6h ago',
      initial: '📦',
      type: 'Contract Basis',
      qualification: '10th Pass, possess own two-wheeler with valid license & smartphone',
      desc: 'गोंडा शहर और आस-पास के ग्रामीण क्षेत्रों में पार्सल वितरण के लिए डिलीवरी पार्टनर्स की तत्काल आवश्यकता है। वेतन के साथ-साथ ईंधन खर्च (फ्यूल एलाउंस) भी दिया जाएगा। समय के पाबंद और क्षेत्र के रास्तों की जानकारी रखने वाले युवाओं के लिए बेहतरीन अवसर।'
    }
  ];

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const url = search ? `/jobs?search=${encodeURIComponent(search)}` : '/jobs';
        const response = await api.get(url);
        if (response.data?.data && response.data.data.length > 0) {
          setJobsList(response.data.data.map(item => ({
            id: item._id,
            role: item.role,
            company: item.company,
            location: item.location,
            salary: item.salary,
            time: new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
            initial: item.initial || '💼',
            type: item.type,
            qualification: item.qualification,
            desc: item.desc
          })));
        } else {
          setJobsList(fallbackJobs);
        }
      } catch (err) {
        console.error('Failed to load jobs list:', err);
        setJobsList(fallbackJobs);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [search]);

  const handleApply = (jobId, jobTitle) => {
    if (appliedJobs.includes(jobId)) return;
    setAppliedJobs(prev => [...prev, jobId]);
    toast.success(`Applied successfully for ${jobTitle}! The recruiter will contact you shortly.`);
  };

  const filteredJobs = jobsList.filter(job => 
    job.role.toLowerCase().includes(search.toLowerCase()) ||
    job.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 text-left">
      {/* Back Header */}
      <button 
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
      >
        <ArrowLeft size={14} /> {t('jobsPage.back')}
      </button>

      <header className="border-b border-border/60 pb-5">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 font-heading">
          <Briefcase className="w-8 h-8 text-purple-500" /> Local Job Portal
        </h1>
        <p className="text-sm text-muted-foreground mt-1.5 font-medium">
          Verified employment and skill-based hiring opportunities in Gonda district.
        </p>
      </header>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <input 
          type="text"
          value={search}
          placeholder="Search roles, companies, or keywords..."
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-3 py-2 bg-white dark:bg-slate-950 text-xs sm:text-sm text-foreground border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Left Columns: Job Listings */}
        <div className="md:col-span-2 space-y-4">
          {filteredJobs.map((job) => (
            <article 
              key={job.id}
              onClick={() => setSelectedJob(job)}
              className={`bg-card rounded-[24px] border shadow-sm p-5 hover:shadow-md hover:border-purple-400 transition-all cursor-pointer bg-white dark:bg-slate-950 flex justify-between items-center ${
                selectedJob?.id === job.id ? 'border-purple-500 ring-1 ring-purple-500/20' : 'border-border/80'
              }`}
            >
              <div className="flex gap-4 items-center min-w-0">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-xl shrink-0">
                  {job.initial}
                </div>
                <div className="min-w-0 space-y-1">
                  <h2 className="font-black text-base text-slate-800 dark:text-slate-200 truncate">{job.role}</h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{job.company}</p>
                  <div className="flex items-center gap-3 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-0.5"><MapPin size={10} /> {job.location}</span>
                    <span>•</span>
                    <span className="text-purple-600 dark:text-purple-450">{job.type}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right shrink-0 ml-4 space-y-1">
                <div className="text-xs sm:text-sm font-black text-purple-600 dark:text-purple-400">{job.salary}</div>
                <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{job.time}</div>
                <span className="inline-flex items-center text-[10px] text-purple-650 hover:underline">View details <ChevronRight size={10} /></span>
              </div>
            </article>
          ))}
          {filteredJobs.length === 0 && (
            <div className="text-center p-12 text-slate-400 bg-slate-50 dark:bg-slate-900 rounded-[24px] border border-dashed border-border">
              No jobs match the current search filters.
            </div>
          )}
        </div>

        {/* Right Column: Full Details Panel */}
        <div className="md:col-span-1 sticky top-6">
          {selectedJob ? (
            <div className="bg-card rounded-[24px] border border-border/80 shadow-sm p-6 space-y-4 bg-white dark:bg-slate-950">
              <div className="flex gap-4 items-center">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-2xl shrink-0">
                  {selectedJob.initial}
                </div>
                <div className="min-w-0">
                  <h2 className="font-black text-lg text-slate-900 dark:text-white truncate leading-snug">{selectedJob.role}</h2>
                  <p className="text-xs text-slate-400 truncate">{selectedJob.company}</p>
                </div>
              </div>
              
              <div className="space-y-3 pt-3 border-t border-border/60">
                <div className="flex items-start gap-2.5 text-xs">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] block">Location</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedJob.location}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 text-xs">
                  <DollarSign className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] block">Salary Package</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-extrabold">{selectedJob.salary} <span className="text-[10px] text-muted-foreground font-medium">/month</span></span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 text-xs">
                  <Award className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] block">{t('jobsPage.qualification')}s</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedJob.qualification}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 pt-3 border-t border-border/60">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] block">Job {t('jobsPage.description')}</span>
                <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed font-medium">
                  {selectedJob.desc}
                </p>
              </div>

              <button 
                onClick={() => handleApply(selectedJob.id, selectedJob.role)}
                disabled={appliedJobs.includes(selectedJob.id)}
                className={`w-full py-2.5 text-xs font-bold text-white rounded-xl shadow transition-colors cursor-pointer active:scale-98 ${
                  appliedJobs.includes(selectedJob.id) 
                    ? 'bg-emerald-600 hover:bg-emerald-700 cursor-default' 
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                {appliedJobs.includes(selectedJob.id) ? 'Application Submitted ✓' : 'Apply For This Position'}
              </button>
            </div>
          ) : (
            <div className="bg-slate-50/50 dark:bg-slate-900/30 rounded-[24px] border border-dashed border-border p-8 text-center text-slate-400">
              <Briefcase size={36} className="mx-auto text-slate-350 mb-3" />
              <p className="text-sm font-bold">Select a job listing to view the qualification criteria, job description, and submit your application.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobsPage;
