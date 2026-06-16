import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Search, HelpCircle, Users, BookOpen } from 'lucide-react';

const FAQ = () => {
  useEffect(() => {
    document.title = "FAQ | GramSathi Help Center";
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', 'Find answers to frequently asked questions about GramSathi, customer bookings, provider verification, platform commission, and payment terms.');
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedIndex, setExpandedIndex] = useState(null);

  const faqs = [
    {
      question: "What is GramSathi?",
      answer: "GramSathi is a mobile-first digital platform that connects rural citizens directly with local tractor owners, JCB operators, construction contractors, home electricians, and plumbers. We help digitize village directories and enable direct peer-to-peer bookings.",
      category: "general"
    },
    {
      question: "Are there any booking booking charges or markups?",
      answer: "No. GramSathi does not charge any service markups or booking fees to customers. You pay the exact rate listed by the service provider directly to them via UPI or Cash upon job completion.",
      category: "customers"
    },
    {
      question: "How do I register as a Service Provider?",
      answer: "To register as a provider, create an account, log in, go to the Profile Settings tab, and submit your Aadhaar and PAN Card images for administrative verification. Once verified, you can list your tractors, JCBs, or technical trades.",
      category: "providers"
    },
    {
      question: "What is the platform commission rate?",
      answer: "We charge a standard 10% commission on completed jobs to cover platform SMS notifications, mapping infrastructure, and cloud hosting. The provider receives 90% of the gross job value directly from the client.",
      category: "providers"
    },
    {
      question: "How can I block dates when I am unavailable?",
      answer: "Providers can configure vacation mode, disable specific weekly active days, or block individual dates directly inside the 'My Services' tab under availability settings. This prevents booking requests from colliding.",
      category: "providers"
    },
    {
      question: "Can I cancel a booking request?",
      answer: "Yes. Customers can cancel requests before they are accepted. Providers can also cancel active accepted bookings if there are scheduling constraints. Any cancellations update the booking timeline and notify both parties.",
      category: "general"
    },
    {
      question: "How does the rating and review system work?",
      answer: "Only customers who have completed a booking can submit star ratings and written reviews. A completed booking allows one review, which automatically updates the average ratings for the specific service and the provider's user profile.",
      category: "customers"
    }
  ];

  const categories = [
    { id: 'all', label: 'All Questions', icon: BookOpen },
    { id: 'general', label: 'General Info', icon: HelpCircle },
    { id: 'customers', label: 'For Customers', icon: Users },
    { id: 'providers', label: 'For Providers', icon: Users }
  ];

  // Filter FAQs client-side
  const filteredFaqs = faqs.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleExpand = (idx) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <div className="space-y-12 max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <section className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-sky-700 bg-sky-50 border border-sky-100 dark:bg-sky-950/20 dark:text-sky-400 dark:border-sky-900/30 uppercase tracking-wider">
          Help Desk Center
        </div>
        <h1 className="text-4xl font-extrabold text-foreground tracking-tight font-heading">
          Frequently Asked Questions
        </h1>
        <p className="text-base text-muted-foreground">
          Find fast answers to common questions about bookings, verification, and payment terms on GramSathi.
        </p>
      </section>

      {/* Real-time search filter */}
      <div className="relative max-w-xl mx-auto bg-card rounded-2xl border border-border shadow-sm">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by keywords (e.g. commission, booking, tractor)..."
          className="w-full pl-12 pr-4 py-3 border-none bg-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-foreground text-sm font-medium"
        />
      </div>

      {/* Category selector */}
      <div className="flex space-x-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800 max-w-xl mx-auto overflow-x-auto no-scrollbar">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => { setActiveCategory(cat.id); setExpandedIndex(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all duration-205 whitespace-nowrap cursor-pointer ${
                isActive 
                  ? 'bg-white dark:bg-slate-800 text-primary shadow-sm border border-slate-200/20' 
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Icon size={12} />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* FAQ Accordion List */}
      <div className="space-y-4 max-w-2xl mx-auto">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm italic">
            No questions match your search parameters.
          </div>
        ) : (
          filteredFaqs.map((faq, idx) => {
            const isExpanded = expandedIndex === idx;
            return (
              <div 
                key={idx} 
                className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleExpand(idx)}
                  className="w-full flex justify-between items-center p-5 text-left font-bold text-slate-800 dark:text-slate-200 text-sm hover:text-primary transition-colors focus:outline-none"
                >
                  <span>{faq.question}</span>
                  {isExpanded ? <ChevronUp size={16} className="text-primary" /> : <ChevronDown size={16} className="text-slate-400" />}
                </button>
                
                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100/50 dark:border-slate-800/40 animate-in fade-in slide-in-from-top-1 duration-200">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

export default FAQ;
