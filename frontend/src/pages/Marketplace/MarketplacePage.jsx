import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Search, Tag, MapPin, Phone, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';
import { useTranslation } from 'react-i18next';


const MarketplacePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemsList, setItemsList] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'Agriculture', 'Machinery', 'Electronics', 'Others'];

  const fallbackItems = [
    {
      id: 'fallback-1',
      title: 'गेहूं (Gehu) - Organic crop',
      price: '₹2,450',
      unit: '/quintal',
      location: 'Gonda Mandi, UP',
      imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
      category: 'Agriculture',
      seller: 'Ramesh Kumar (Farmer)',
      phone: '+91 98765 43210',
      description: 'शुद्ध जैविक रूप से उगाई गई गेहूं की फसल। कोई रासायनिक उर्वरक नहीं। कुल मात्रा 50 क्विंटल उपलब्ध है। मूल्य बातचीत योग्य।'
    },
    {
      id: 'fallback-2',
      title: 'Mahindra 575 DI Tractor',
      price: '₹6,25,000',
      unit: '',
      location: 'Civil Lines, Gonda, UP',
      imageUrl: 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&w=600&q=80',
      category: 'Machinery',
      seller: 'Vikas Singh (Machinery Dealer)',
      phone: '+91 87654 32109',
      description: '2022 मॉडल महिंद्रा ट्रैक्टर। बहुत अच्छी स्थिति में, केवल 800 घंटे चला है। सभी कागजात पूरे हैं। तुरंत बिक्री के लिए उपलब्ध।'
    },
    {
      id: 'fallback-3',
      title: 'Redmi 12 5G (8GB/256GB)',
      price: '₹10,999',
      unit: '',
      location: 'Gonda City, UP',
      imageUrl: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80',
      category: 'Electronics',
      seller: 'Sanjeev Verma (Individual)',
      phone: '+91 76543 21098',
      description: '6 महीने पुराना रेडमी स्मार्टफोन। बिल्कुल नई स्थिति, एक भी स्क्रैच नहीं है। बॉक्स, चार्जर और बिल के साथ उपलब्ध है।'
    }
  ];

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        let url = `/marketplace?limit=30`;
        if (selectedCategory && selectedCategory !== 'All') {
          url += `&category=${encodeURIComponent(selectedCategory)}`;
        }
        if (search) {
          url += `&search=${encodeURIComponent(search)}`;
        }
        const response = await api.get(url);
        if (response.data?.data && response.data.data.length > 0) {
          setItemsList(response.data.data.map(item => ({
            id: item._id,
            title: item.title,
            price: item.price,
            unit: item.unit || '',
            location: item.location,
            imageUrl: item.imageUrl || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
            category: item.category,
            seller: item.sellerName,
            phone: item.contactPhone,
            description: item.description
          })));
        } else {
          setItemsList(fallbackItems);
        }
      } catch (err) {
        console.error('Failed to load marketplace listings:', err);
        setItemsList(fallbackItems);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, [selectedCategory, search]);

  const handleContact = (sellerName, phone) => {
    toast.success(`{t('marketplacePage.sellerDetails')}: ${sellerName} - Call: ${phone}`, { duration: 6000 });
  };

  const filteredItems = itemsList.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) || 
                          item.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 text-left">
      {/* Back Header */}
      <button 
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
      >
        <ArrowLeft size={14} /> {t('marketplacePage.back')}
      </button>

      <header className="border-b border-border/60 pb-5">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 font-heading">
          <ShoppingBag className="w-8 h-8 text-orange-500" /> GramSathi {t('marketplacePage.title')}
        </h1>
        <p className="text-sm text-muted-foreground mt-1.5 font-medium">
          Buy and sell crop produce, machinery, electronics, and daily essentials within your local community.
        </p>
      </header>

      {/* Filter and Search Panel */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-[24px] border border-border/80">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                selectedCategory === cat 
                  ? 'bg-orange-500 text-white shadow-sm' 
                  : 'bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-350 hover:bg-slate-50 border border-border'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <input 
            type="text"
            value={search}
            placeholder="Search items for sale..."
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-white dark:bg-slate-950 text-xs sm:text-sm text-foreground border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Left Columns: Product Grid */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {filteredItems.map((item) => (
            <article 
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className={`bg-card rounded-[24px] border shadow-sm overflow-hidden hover:shadow-md hover:border-orange-400 transition-all cursor-pointer bg-white dark:bg-slate-950 flex flex-col ${
                selectedItem?.id === item.id ? 'border-orange-500 ring-1 ring-orange-500/20' : 'border-border/80'
              }`}
            >
              <img 
                src={item.imageUrl} 
                alt={item.title} 
                className="w-full aspect-[16/9] object-cover border-b border-border/40"
              />
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold text-orange-600 bg-orange-500/10 border border-orange-500/10 uppercase tracking-wider">
                    {item.category}
                  </div>
                  <h2 className="font-black text-sm text-slate-800 dark:text-slate-200 mt-2 line-clamp-1">{item.title}</h2>
                  <div className="text-base font-black text-emerald-600 mt-1">
                    {item.price} <span className="text-[10px] text-muted-foreground font-semibold">{item.unit}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold tracking-wide mt-2 pt-2 border-t border-border/40">
                  <span className="flex items-center gap-0.5"><MapPin size={10} /> {item.location}</span>
                  <span className="text-orange-650 hover:underline">Details →</span>
                </div>
              </div>
            </article>
          ))}
          {filteredItems.length === 0 && (
            <div className="col-span-full text-center p-12 text-slate-400 bg-slate-50 dark:bg-slate-900 rounded-[24px] border border-dashed border-border">
              No items for sale matching selections.
            </div>
          )}
        </div>

        {/* Right Column: Full Details Panel */}
        <div className="md:col-span-1 sticky top-6">
          {selectedItem ? (
            <div className="bg-card rounded-[24px] border border-border/80 shadow-sm p-6 space-y-4 bg-white dark:bg-slate-950">
              <img 
                src={selectedItem.imageUrl} 
                alt="marketplace item" 
                className="w-full aspect-[16/9] object-cover rounded-2xl border border-border"
              />
              
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                <span className="text-orange-600 dark:text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/10">{selectedItem.category}</span>
                <span className="flex items-center gap-0.5 text-slate-450"><MapPin size={10} /> {selectedItem.location}</span>
              </div>
              
              <h2 className="text-lg font-black text-slate-900 dark:text-white leading-snug">
                {selectedItem.title}
              </h2>

              <div className="text-xl font-black text-emerald-600 py-1.5 border-b border-border/60">
                {selectedItem.price} <span className="text-xs text-slate-400 font-bold">{selectedItem.unit}</span>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] block">Product {t('marketplacePage.description')}</span>
                <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed font-medium">
                  {selectedItem.description}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-border/60">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-400">Seller:</span>
                  <span className="text-slate-800 dark:text-slate-200">{selectedItem.seller}</span>
                </div>
              </div>

              <button 
                onClick={() => handleContact(selectedItem.seller, selectedItem.phone)}
                className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow transition-colors cursor-pointer flex items-center justify-center gap-1.5 active:scale-98"
              >
                <Phone size={14} /> {t('marketplacePage.contact')} & Deal
              </button>
            </div>
          ) : (
            <div className="bg-slate-50/50 dark:bg-slate-900/30 rounded-[24px] border border-dashed border-border p-8 text-center text-slate-400">
              <ShoppingBag size={36} className="mx-auto text-slate-350 mb-3" />
              <p className="text-sm font-bold">Select a product card to view the listing description, seller information, and obtain contact details to deal.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketplacePage;
