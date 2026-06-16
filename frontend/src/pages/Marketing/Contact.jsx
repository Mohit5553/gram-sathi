import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Mail, Phone, MapPin, Send, HelpCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const Contact = () => {
  useEffect(() => {
    document.title = "Contact Us | GramSathi Helpline & Support";
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', 'Get in touch with GramSathi. Submit feedback, register as a provider, or reach out to our regional helpline for immediate booking assistance.');
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'general',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Simulate feedback API call
    setTimeout(() => {
      toast.success('Your message has been sent successfully. We will contact you shortly!');
      setFormData({
        name: '',
        email: '',
        phone: '',
        category: 'general',
        message: ''
      });
      setSubmitting(false);
    }, 1200);
  };

  return (
    <div className="space-y-12 max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <section className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-sky-700 bg-sky-50 border border-sky-100 dark:bg-sky-950/20 dark:text-sky-400 dark:border-sky-900/30 uppercase tracking-wider">
          Helpline Desk
        </div>
        <h1 className="text-4xl font-extrabold text-foreground tracking-tight font-heading">
          Get in Touch with Support
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Need help placing a booking or want to register your machinery? Contact our local helpline or submit an inquiry below.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 pt-4">
        
        {/* Contact info cards */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-foreground font-heading border-b border-border pb-3">Regional Support</h2>
          
          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
              <Phone size={18} />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-slate-200 text-sm">Call Center Helpline</h4>
              <p className="text-lg font-black text-slate-800 dark:text-slate-100 mt-1">+91 98765 43210</p>
              <p className="text-xs text-muted-foreground mt-0.5">Available 7 AM to 9 PM, All Days</p>
            </div>
          </div>

          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
              <Mail size={18} />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-slate-200 text-sm">Email Support</h4>
              <p className="text-base font-extrabold text-slate-800 dark:text-slate-200 mt-1">support@gramsathi.in</p>
              <p className="text-xs text-muted-foreground mt-0.5">Expected response within 24 hours</p>
            </div>
          </div>

          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
              <MapPin size={18} />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-slate-200 text-sm">Village Office Headquarters</h4>
              <p className="text-xs text-muted-foreground leading-relaxed mt-2 font-medium">
                Panchayat Building Center, Rampur Village, <br />
                Bijnor District, Uttar Pradesh - 246701
              </p>
            </div>
          </div>

        </div>

        {/* Feedback Query Form */}
        <div className="lg:col-span-3 bg-card p-6 sm:p-8 rounded-2xl border border-border shadow-sm">
          <h2 className="text-2xl font-bold text-foreground font-heading border-b border-border pb-3 mb-6">Send an Inquiry</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Input 
                  label="Your Full Name" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  placeholder="Enter name" 
                  required 
                />
              </div>
              <div>
                <Input 
                  label="Mobile Number" 
                  value={formData.phone} 
                  onChange={e => setFormData({...formData, phone: e.target.value})} 
                  placeholder="e.g. 9876543210" 
                  type="tel"
                  required 
                />
              </div>
              <div>
                <Input 
                  label="Email Address" 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                  placeholder="e.g. user@example.com" 
                  type="email"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Inquiry Category</label>
                <select 
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="general">General Query</option>
                  <option value="booking">Booking / Reservation Help</option>
                  <option value="provider">Register as a Service Provider</option>
                  <option value="scheme">Government Scheme Clarification</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Your Message</label>
                <textarea 
                  value={formData.message} 
                  onChange={e => setFormData({...formData, message: e.target.value})} 
                  placeholder="Write your questions or description details..."
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 h-32"
                  required
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" isLoading={submitting} className="flex items-center gap-2">
                <Send size={14} />
                Send Inquiry
              </Button>
            </div>
          </form>
        </div>

      </div>

    </div>
  );
};

export default Contact;
