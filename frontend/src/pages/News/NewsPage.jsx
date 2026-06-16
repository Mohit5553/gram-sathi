import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Newspaper, Heart, Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';

const NewsPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [selectedNews, setSelectedNews] = useState(null);
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fallbackNews = [
    {
      id: 'fallback-1',
      title: i18n.language?.startsWith('hi') 
        ? 'गोंडा में बिजली विभाग की बड़ी कार्रवाई, 35 अवैध कनेक्शन काटे गए' 
        : 'Major action by Electricity Department in Gonda, 35 illegal connections cut',
      source: 'Dainik Jagran',
      time: '2h ago',
      imageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=600&q=80',
      category: 'Local Action',
      content: i18n.language?.startsWith('hi')
        ? 'गोंडा शहर के विभिन्न मुहल्लों में बिजली विभाग की विशेष जांच टीमों द्वारा सघन चेकिंग अभियान चलाया गया। इस अभियान के दौरान बिजली चोरी करते हुए पाए गए 35 अवैध कनेक्शनों को तत्काल प्रभाव से काट दिया गया।'
        : 'A major inspection campaign was carried out by special teams of the electricity department in various areas of Gonda city, cutting 35 illegal connections immediately.'
    },
    {
      id: 'fallback-2',
      title: i18n.language?.startsWith('hi')
        ? 'गोंडा में किसानों के लिए मुफ्त कृषि प्रशिक्षण शिविर का आयोजन'
        : 'Free agricultural training camp organized for Gonda farmers',
      source: 'Amar Ujala',
      time: '4h ago',
      imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=600&q=80',
      category: 'Agriculture',
      content: i18n.language?.startsWith('hi')
        ? 'जिला कृषि विज्ञान केंद्र, गोंडा में क्षेत्रीय किसानों के लिए तीन दिवसीय कृषि प्रशिक्षण शिविर का उद्घाटन किया गया। इस शिविर में कृषि वैज्ञानिकों द्वारा किसानों को जैविक खेती पर प्रशिक्षण दिया जा रहा है।'
        : 'A three-day agricultural training camp was inaugurated at the District Agricultural Science Center, Gonda, where scientists are training regional farmers on organic farming.'
    },
    {
      id: 'fallback-3',
      title: i18n.language?.startsWith('hi')
        ? 'जिला अस्पताल में नई सुविधाओं का हुआ शुभारंभ'
        : 'New healthcare facilities launched in District Hospital',
      source: 'Hindustan',
      time: '6h ago',
      imageUrl: 'https://images.unsplash.com/photo-1586773860418-d3b3da96739f?auto=format&fit=crop&w=600&q=80',
      category: 'Healthcare',
      content: i18n.language?.startsWith('hi')
        ? 'गोंडा जिला अस्पताल में स्वास्थ्य सेवाओं को सुदृढ़ करने के उद्देश्य से एक नए आधुनिक पैथोलॉजी विंग और आईसीयू वार्ड का शुभारंभ किया गया।'
        : 'To strengthen healthcare services, a new modern pathology wing and ICU ward were launched at the Gonda District Hospital.'
    }
  ];

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await api.get('/cms?type=news&limit=20');
        if (response.data?.data && response.data.data.length > 0) {
          setNewsItems(response.data.data.map(item => ({
            id: item._id,
            title: item.title,
            source: item.author || 'Admin',
            time: new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
            imageUrl: item.imageUrl || 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=600&q=80',
            category: item.village && item.village !== 'All' ? `Local (${item.village})` : 'News',
            content: item.content
          })));
        } else {
          setNewsItems(fallbackNews);
        }
      } catch (err) {
        console.error('Failed to load news feed:', err);
        setNewsItems(fallbackNews);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [i18n.language]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 text-left">
      {/* Back Header */}
      <button 
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
      >
        <ArrowLeft size={14} /> {t('newsPage.back')}
      </button>

      <header className="border-b border-border/60 pb-5">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 font-heading">
          <Newspaper className="w-8 h-8 text-indigo-500" /> {t('newsPage.title')}
        </h1>
        <p className="text-sm text-muted-foreground mt-1.5 font-medium">
          {t('newsPage.subtitle')}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Left Columns: News Cards */}
        <div className="md:col-span-2 space-y-6">
          {newsItems.map((item) => (
            <article 
              key={item.id}
              onClick={() => setSelectedNews(item)}
              className={`bg-card rounded-[24px] border shadow-sm overflow-hidden hover:shadow-md hover:border-indigo-400 transition-all cursor-pointer bg-white dark:bg-slate-950 flex flex-col sm:flex-row ${
                selectedNews?.id === item.id ? 'border-indigo-500 ring-1 ring-indigo-500/20' : 'border-border/80'
              }`}
            >
              <img 
                src={item.imageUrl} 
                alt="news illustration"
                className="w-full sm:w-48 aspect-[16/9] sm:aspect-square object-cover shrink-0"
              />
              <div className="p-5 flex flex-col justify-between flex-1">
                <div className="space-y-2">
                  <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold text-indigo-600 bg-indigo-500/10 border border-indigo-500/15 uppercase tracking-wider">
                    {item.category}
                  </div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug line-clamp-2">
                    {item.title}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {item.content}
                  </p>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-4">
                  <span>{item.source} • {item.time}</span>
                  <span className="text-indigo-650 hover:underline">{t('newsPage.readFull')} →</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Right Column: Full Details Panel */}
        <div className="md:col-span-1 sticky top-6">
          {selectedNews ? (
            <div className="bg-card rounded-[24px] border border-border/80 shadow-sm p-6 space-y-4 bg-white dark:bg-slate-950">
              <img 
                src={selectedNews.imageUrl} 
                alt="article banner" 
                className="w-full aspect-[16/9] object-cover rounded-2xl border border-border"
              />
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <span className="text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/10">{selectedNews.category}</span>
                <span>{selectedNews.time}</span>
              </div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white leading-snug">
                {selectedNews.title}
              </h2>
              <div className="text-[10px] text-slate-500 font-bold border-b border-border/60 pb-3 flex items-center justify-between">
                <span>{t('newsPage.reporter')}: {selectedNews.source}</span>
                <div className="flex gap-2 text-slate-400">
                  <button className="hover:text-rose-500 transition-colors"><Heart size={14} /></button>
                  <button className="hover:text-blue-500 transition-colors"><Share2 size={14} /></button>
                </div>
              </div>
              <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed font-medium">
                {selectedNews.content}
              </p>
            </div>
          ) : (
            <div className="bg-slate-50/50 dark:bg-slate-900/30 rounded-[24px] border border-dashed border-border p-8 text-center text-slate-400">
              <Newspaper size={36} className="mx-auto text-slate-350 mb-3" />
              <p className="text-sm font-bold">{t('newsPage.selectArticle')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsPage;
