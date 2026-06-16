import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import { 
  FileText, Plus, Edit2, Trash2, X, Eye, 
  Megaphone, Newspaper, LayoutGrid, Check, 
  MapPin, Calendar, ExternalLink, ShieldCheck, Fuel, Coins
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import ImageUpload from '../../components/common/ImageUpload';
import { AdminSchemes } from './AdminDataPages';

const AdminCMS = () => {
  const [activeTab, setActiveTab] = useState('banner');
  const [contentList, setContentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    link: '',
    expiryDate: '',
    isActive: true,
    village: '',
    author: 'Admin'
  });
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Fuel states
  const [fuelData, setFuelData] = useState({ petrol: '', diesel: '', cng: '', lpg: '' });
  const [fuelLoading, setFuelLoading] = useState(false);
  const [fuelSaving, setFuelSaving] = useState(false);

  // Metals states
  const [metalsData, setMetalsData] = useState({ gold24K: '', gold22K: '', silver: '' });
  const [metalsLoading, setMetalsLoading] = useState(false);
  const [metalsSaving, setMetalsSaving] = useState(false);

  const fetchCMSContent = async () => {
    try {
      setLoading(true);
      let res;
      if (activeTab === 'announcement') {
        res = await api.get('/dashboard/admin/announcements');
        setContentList(res.data || []);
      } else {
        res = await api.get(`/cms?type=${activeTab}`);
        setContentList(res.data.data || []);
      }
    } catch (err) {
      toast.error('Failed to load CMS content list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab !== 'schemes' && activeTab !== 'fuel' && activeTab !== 'metals') {
      fetchCMSContent();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'metals') {
      const fetchMetals = async () => {
        try {
          setMetalsLoading(true);
          const res = await api.get('/dashboard/metals');
          setMetalsData({
            gold24K: res.data.gold24K || '',
            gold22K: res.data.gold22K || '',
            silver: res.data.silver || ''
          });
        } catch (err) {
          toast.error('Failed to load metal prices');
        } finally {
          setMetalsLoading(false);
        }
      };
      fetchMetals();
    }

    if (activeTab === 'fuel') {
      const fetchFuel = async () => {
        try {
          setFuelLoading(true);
          const res = await api.get('/dashboard/fuel');
          setFuelData({
            petrol: res.data.petrol || '',
            diesel: res.data.diesel || '',
            cng: res.data.cng || '',
            lpg: res.data.lpg || ''
          });
        } catch (err) {
          toast.error('Failed to load fuel prices');
        } finally {
          setFuelLoading(false);
        }
      };
      fetchFuel();
    }
  }, [activeTab]);

  const handleOpenAdd = () => {
    setSelectedItem(null);
    setFormData({
      title: '',
      content: '',
      link: '',
      expiryDate: '',
      isActive: true,
      village: '',
      author: 'Admin'
    });
    setImages([]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      title: item.title || '',
      content: item.content || '',
      link: item.link || '',
      expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : '',
      isActive: item.isActive !== undefined ? item.isActive : true,
      village: item.village || '',
      author: item.author || 'Admin'
    });
    setImages(item.imageUrl ? [item.imageUrl] : []);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this content item?')) return;
    try {
      if (activeTab === 'announcement') {
        await api.delete(`/dashboard/admin/announcements/${id}`);
      } else {
        await api.delete(`/cms/${id}`);
      }
      toast.success('Content deleted successfully');
      fetchCMSContent();
    } catch (err) {
      toast.error('Failed to delete content');
    }
  };

  const handleToggleStatus = async (item) => {
    try {
      const updatedStatus = !item.isActive;
      if (activeTab === 'announcement') {
        await api.put(`/dashboard/admin/announcements/${item._id}`, { isActive: updatedStatus });
      } else {
        await api.put(`/cms/${item._id}`, { isActive: updatedStatus });
      }
      toast.success(`Content ${updatedStatus ? 'activated' : 'deactivated'}`);
      fetchCMSContent();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      ...formData,
      contentType: activeTab,
      imageUrl: images.length > 0 ? images[0] : ''
    };

    try {
      if (activeTab === 'announcement') {
        const annPayload = {
          title: formData.title,
          content: formData.content,
          type: 'announcement',
          village: formData.village,
          isActive: formData.isActive,
          expiryDate: formData.expiryDate || null
        };
        if (selectedItem) {
          await api.put(`/dashboard/admin/announcements/${selectedItem._id}`, annPayload);
          toast.success('Announcement updated successfully!');
        } else {
          await api.post('/dashboard/admin/announcements', annPayload);
          toast.success('Announcement published successfully!');
        }
      } else {
        if (selectedItem) {
          await api.put(`/cms/${selectedItem._id}`, payload);
          toast.success('CMS item updated successfully!');
        } else {
          await api.post('/cms', payload);
          toast.success('CMS item created successfully!');
        }
      }
      setIsModalOpen(false);
      fetchCMSContent();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving content');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveMetals = async (e) => {
    e.preventDefault();
    try {
      setMetalsSaving(true);
      await api.put('/dashboard/admin/metals', {
        gold24K: parseFloat(metalsData.gold24K),
        gold22K: parseFloat(metalsData.gold22K),
        silver: parseFloat(metalsData.silver)
      });
      toast.success('Metal rates updated successfully!');
    } catch (err) {
      toast.error('Failed to save metal rates');
    } finally {
      setMetalsSaving(false);
    }
  };

  const handleSaveFuel = async (e) => {
    e.preventDefault();
    try {
      setFuelSaving(true);
      await api.put('/dashboard/admin/fuel', {
        petrol: parseFloat(fuelData.petrol),
        diesel: parseFloat(fuelData.diesel),
        cng: parseFloat(fuelData.cng),
        lpg: parseFloat(fuelData.lpg)
      });
      toast.success('Fuel rates updated successfully!');
    } catch (err) {
      toast.error('Failed to save fuel rates');
    } finally {
      setFuelSaving(false);
    }
  };

  const tabs = [
    { id: 'banner', label: 'Homepage Banners', icon: LayoutGrid },
    { id: 'announcement', label: 'Announcements', icon: Megaphone },
    { id: 'news', label: 'Village News', icon: Newspaper },
    { id: 'notice', label: 'Panchayat Notices', icon: FileText },
    { id: 'schemes', label: 'Gov Schemes', icon: ShieldCheck },
    { id: 'fuel', label: 'Fuel Rates', icon: Fuel },
    { id: 'metals', label: 'Commodity Rates', icon: Coins }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-300">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight font-heading">Content Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Configure village announcements, notices, news sliders, and banners dynamically</p>
        </div>
        {activeTab !== 'schemes' && activeTab !== 'fuel' && activeTab !== 'metals' && (
          <Button onClick={handleOpenAdd} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Dynamic Content
          </Button>
        )}
      </header>

      {/* Tabs */}
      <div className="flex space-x-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800 w-full overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                isActive 
                  ? 'bg-white dark:bg-slate-800 text-primary shadow-sm border border-slate-200/20' 
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'metals' ? (
        <div className="bg-card rounded-2xl border border-border p-8 shadow-sm max-w-lg mx-auto bg-white dark:bg-slate-950">
          {metalsLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-primary"></div>
            </div>
          ) : (
            <form onSubmit={handleSaveMetals} className="space-y-5">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 font-heading">
                <Coins className="text-yellow-500 w-5 h-5" />
                Update Metal Rates
              </h3>
              <p className="text-xs text-muted-foreground">Adjust Gold 24K, Gold 22K, and Silver prices for the homepage widget.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Gold 24K Price (₹/gm)</label>
                  <input 
                    type="number" step="0.01" required
                    value={metalsData.gold24K}
                    onChange={e => setMetalsData({...metalsData, gold24K: e.target.value})}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Gold 22K Price (₹/gm)</label>
                  <input 
                    type="number" step="0.01" required
                    value={metalsData.gold22K}
                    onChange={e => setMetalsData({...metalsData, gold22K: e.target.value})}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Silver Price (₹/gm)</label>
                  <input 
                    type="number" step="0.01" required
                    value={metalsData.silver}
                    onChange={e => setMetalsData({...metalsData, silver: e.target.value})}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" 
                  />
                </div>
              </div>
              <Button type="submit" variant="save" isLoading={metalsSaving} className="w-full mt-4">
                Save Rates
              </Button>
            </form>
          )}
        </div>
      ) : activeTab === 'fuel' ? (
        <div className="bg-card rounded-2xl border border-border p-8 shadow-sm max-w-lg mx-auto">
          {fuelLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-primary"></div>
            </div>
          ) : (
            <form onSubmit={handleSaveFuel} className="space-y-5">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Fuel className="text-orange-500 w-5 h-5" />
                Update Local Fuel Prices
              </h3>
              <p className="text-xs text-muted-foreground">Adjust Petrol, Diesel, CNG, and LPG cylinder prices for the homepage widget.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Petrol Price (₹/Litre)</label>
                  <input 
                    type="number" step="0.01" required
                    value={fuelData.petrol}
                    onChange={e => setFuelData({...fuelData, petrol: e.target.value})}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Diesel Price (₹/Litre)</label>
                  <input 
                    type="number" step="0.01" required
                    value={fuelData.diesel}
                    onChange={e => setFuelData({...fuelData, diesel: e.target.value})}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">CNG Price (₹/kg)</label>
                  <input 
                    type="number" step="0.01" required
                    value={fuelData.cng}
                    onChange={e => setFuelData({...fuelData, cng: e.target.value})}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">LPG Cylinder Price (₹/14.2kg)</label>
                  <input 
                    type="number" step="0.01" required
                    value={fuelData.lpg}
                    onChange={e => setFuelData({...fuelData, lpg: e.target.value})}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" 
                  />
                </div>
              </div>
              <Button type="submit" variant="save" isLoading={fuelSaving} className="w-full mt-4">
                Save Rates
              </Button>
            </form>
          )}
        </div>
      ) : activeTab === 'schemes' ? (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <AdminSchemes />
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 dark:border-slate-800 border-t-emerald-600 dark:border-t-emerald-500"></div>
            </div>
          ) : contentList.length === 0 ? (
            <div className="text-center py-16 px-4">
              <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No Content Registered</h3>
              <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto flex">Create dynamic entries to display live announcements, homepage sliders, or community news alerts.</p>
              <Button onClick={handleOpenAdd} className="mt-6">
                Add First Item
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-slate-50/50 dark:bg-slate-900/50 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-3 px-6">Title / Overview</th>
                    <th className="py-3 px-6">Status</th>
                    {activeTab === 'notice' && <th className="py-3 px-6">Village target</th>}
                    {activeTab !== 'announcement' && <th className="py-3 px-6">Image</th>}
                    <th className="py-3 px-6">Expiration</th>
                    <th className="py-3 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-sm">
                  {contentList.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-semibold text-foreground">{item.title}</div>
                        {item.content && (
                          <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{item.content}</div>
                        )}
                        {item.link && (
                          <a href={item.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] text-sky-600 hover:text-sky-700 mt-1 font-semibold">
                            <ExternalLink size={10} /> Link Actions
                          </a>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <button 
                          onClick={() => handleToggleStatus(item)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-colors cursor-pointer ${
                            item.isActive 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                              : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${item.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                          {item.isActive ? 'Active' : 'Draft'}
                        </button>
                      </td>
                      {activeTab === 'notice' && (
                        <td className="py-4 px-6 font-medium text-slate-700 dark:text-slate-300">
                          {item.village ? (
                            <span className="inline-flex items-center gap-1 text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                              <MapPin size={11} />
                              {item.village}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">All India (Broadcast)</span>
                          )}
                        </td>
                      )}
                      {activeTab !== 'announcement' && (
                        <td className="py-4 px-6">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt="Thumbnail" className="w-12 h-8 object-cover rounded border border-slate-200" />
                          ) : (
                            <span className="text-xs text-slate-400">No Image</span>
                          )}
                        </td>
                      )}
                      <td className="py-4 px-6 font-medium text-slate-600 dark:text-slate-400">
                        {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="edit"
                            size="icon"
                            onClick={() => handleOpenEdit(item)}
                            title="Edit content"
                            className="p-1.5 rounded-lg text-white"
                          >
                            <Edit2 size={15} />
                          </Button>
                          <Button
                            variant="delete"
                            size="icon"
                            onClick={() => handleDelete(item._id)}
                            title="Delete content"
                            className="p-1.5 rounded-lg text-white"
                          >
                            <Trash2 size={15} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 max-w-lg w-full p-6 relative z-10 animate-in fade-in zoom-in duration-250 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
              {selectedItem ? 'Modify CMS Content' : `Create ${tabs.find(t => t.id === activeTab)?.label}`}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Title</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" 
                  required 
                />
              </div>

              {activeTab !== 'banner' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Description / Content</label>
                  <textarea 
                    value={formData.content} 
                    onChange={e => setFormData({...formData, content: e.target.value})} 
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 h-24"
                  />
                </div>
              )}

              {(activeTab === 'notice' || activeTab === 'announcement') && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Target Village (Empty for global Notice/Announcement)</label>
                  <input 
                    type="text" 
                    value={formData.village} 
                    placeholder="e.g. Gonda"
                    onChange={e => setFormData({...formData, village: e.target.value})} 
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" 
                  />
                </div>
              )}

              {(activeTab === 'banner' || activeTab === 'news') && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Upload Image</label>
                  <ImageUpload images={images} setImages={setImages} maxImages={1} />
                </div>
              )}

              {activeTab !== 'announcement' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Redirect URL / Link Action</label>
                  <input 
                    type="url" 
                    value={formData.link} 
                    placeholder="https://example.com/more-info"
                    onChange={e => setFormData({...formData, link: e.target.value})} 
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" 
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Expiration Date (Optional)</label>
                <input 
                  type="date" 
                  value={formData.expiryDate} 
                  onChange={e => setFormData({...formData, expiryDate: e.target.value})} 
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" 
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="isActive" 
                  checked={formData.isActive}
                  onChange={e => setFormData({...formData, isActive: e.target.checked})}
                  className="w-4 h-4 rounded text-primary border-slate-350 focus:ring-primary"
                />
                <label htmlFor="isActive" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Publish immediately (Active)</label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 mt-6">
                <Button type="button" variant="cancel" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="save" isLoading={submitting}>
                  Save CMS Content
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCMS;
