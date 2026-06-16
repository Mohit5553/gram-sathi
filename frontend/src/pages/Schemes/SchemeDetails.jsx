import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Building, Share2, Bookmark, BookmarkCheck, ExternalLink } from 'lucide-react';
import api from '../../api/axios';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import Button from '../../components/ui/Button';

const SchemeDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  const [scheme, setScheme] = useState(location.state?.scheme || null);
  const [loading, setLoading] = useState(!scheme);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  useEffect(() => {
    const fetchSchemeAndBookmarkStatus = async () => {
      try {
        if (!scheme) {
          const res = await api.get(`/schemes/${id}`);
          setScheme(res.data);
        }
        
        if (isAuthenticated) {
          const bookmarkRes = await api.get('/schemes/saved');
          const savedIds = bookmarkRes.data.map(s => typeof s === 'string' ? s : s._id);
          setIsBookmarked(savedIds.includes(id));
        }
      } catch (error) {
        toast.error('Failed to load scheme details');
      } finally {
        setLoading(false);
      }
    };

    fetchSchemeAndBookmarkStatus();
  }, [id, scheme, isAuthenticated]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: scheme?.title,
          text: `Check out this government scheme: ${scheme?.title}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const toggleBookmark = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to bookmark schemes');
      navigate('/login');
      return;
    }

    try {
      setBookmarkLoading(true);
      await api.post(`/schemes/${id}/bookmark`);
      setIsBookmarked(!isBookmarked);
      toast.success(isBookmarked ? 'Scheme removed from saved' : 'Scheme saved to bookmarks');
    } catch (error) {
      toast.error('Failed to update bookmark');
    } finally {
      setBookmarkLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-sky-600"></div>
      </div>
    );
  }

  if (!scheme) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-800">Scheme not found</h2>
        <Button onClick={() => navigate('/schemes')} className="mt-4">Back to Schemes</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </button>

      <article className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Header Section */}
        <div className="p-8 sm:p-10 border-b border-slate-100 bg-slate-50/50">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div className="flex-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-sm font-bold uppercase tracking-wider mb-4">
                <Building className="w-4 h-4" />
                {scheme.department || 'General Department'}
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
                {scheme.title}
              </h1>
              <div className="flex items-center text-sm font-medium text-rose-600">
                <Calendar className="w-4 h-4 mr-1.5" />
                Deadline: {scheme.deadline ? new Date(scheme.deadline).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'No specific deadline'}
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-3">
              <button 
                onClick={handleShare}
                className="p-3 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors tooltip"
                title="Share Scheme"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button 
                onClick={toggleBookmark}
                disabled={bookmarkLoading}
                className={`p-3 rounded-full border transition-colors ${
                  isBookmarked 
                    ? 'border-sky-200 bg-sky-50 text-sky-600' 
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
                title={isBookmarked ? "Remove Bookmark" : "Bookmark Scheme"}
              >
                {isBookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8 sm:p-10 space-y-10">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
              <span className="w-1.5 h-6 bg-sky-500 rounded-full mr-3"></span>
              About the Scheme
            </h2>
            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap text-lg">
              {scheme.description}
            </p>
          </section>

          <section className="bg-amber-50 rounded-2xl p-6 sm:p-8 border border-amber-100">
            <h2 className="text-xl font-bold text-amber-900 mb-4 flex items-center">
              Eligibility Criteria
            </h2>
            <div className="text-amber-800 leading-relaxed whitespace-pre-wrap">
              {scheme.eligibility}
            </div>
          </section>

          {scheme.benefits && (
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                <span className="w-1.5 h-6 bg-emerald-500 rounded-full mr-3"></span>
                Key Benefits
              </h2>
              <div className="text-slate-600 leading-relaxed whitespace-pre-wrap text-lg">
                {scheme.benefits}
              </div>
            </section>
          )}

          {scheme.applicationLink && (
            <section className="pt-6 border-t border-slate-100 text-center sm:text-left">
              <a 
                href={scheme.applicationLink.startsWith('http') ? scheme.applicationLink : `https://${scheme.applicationLink}`} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button className="w-full sm:w-auto text-lg py-6 px-8">
                  Apply Online <ExternalLink className="w-5 h-5 ml-2" />
                </Button>
              </a>
            </section>
          )}
        </div>
      </article>
    </div>
  );
};

export default SchemeDetails;
