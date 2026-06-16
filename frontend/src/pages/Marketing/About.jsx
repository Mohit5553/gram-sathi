import React, { useEffect } from 'react';
import { Shield, Users, Heart, Award } from 'lucide-react';

const About = () => {
  useEffect(() => {
    document.title = "About Us | GramSathi - Digitizing Rural India";
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', 'Discover GramSathi, our mission to bridge the gap in rural accessibility by providing on-demand farming, labor hiring, and technical services.');
  }, []);

  const values = [
    { title: 'Local Trust', icon: Shield, desc: 'Every service provider is verified using Aadhaar/PAN, ensuring reliable assistance within your community.' },
    { title: 'Community Growth', icon: Users, desc: 'We help local tractor owners, JCB operators, and day laborers increase their booking rates and earnings.' },
    { title: 'Empowerment', icon: Heart, desc: 'Making essential technical services like plumbing and electrical repairs accessible without long travel delays.' },
    { title: 'Integrity', icon: Award, desc: 'Providing fixed rate transparency and direct UPI/Cash options, eliminating high intermediary fees.' },
  ];

  return (
    <div className="space-y-16 max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-300">
      
      {/* Hero Section */}
      <section className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-sky-700 bg-sky-50 border border-sky-100 dark:bg-sky-950/20 dark:text-sky-400 dark:border-sky-900/30 uppercase tracking-wider">
          Our Roots
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight font-heading">
          Connecting Rural India, <br /> One Village at a Time
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          GramSathi is a modern, unified platform designed to solve the accessibility challenges faced by farming and rural communities by digitizing on-demand bookings and technician search.
        </p>
      </section>

      {/* Stats counter showcase */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-slate-50 dark:bg-slate-900/20 p-8 rounded-3xl border border-slate-100 dark:border-slate-800">
        <div className="text-center space-y-1">
          <h3 className="text-3xl font-black text-primary">50+</h3>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Villages Served</p>
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-3xl font-black text-primary">10k+</h3>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Bookings Completed</p>
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-3xl font-black text-primary">500+</h3>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Verified Partners</p>
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-3xl font-black text-primary">98%</h3>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Satisfaction Rate</p>
        </div>
      </section>

      {/* Story section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">Why We Built GramSathi</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Finding reliable machinery and laborers during the sowing and harvesting seasons has historically been an unorganized process in India. Farmers had to spend hours calling multiple contacts or traveling to nearby hubs without any guarantee of availability or fair pricing.
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            GramSathi bridges this gap. We provide a single interface for farmers to reserve equipment, hire skilled contractors, locate technicians, and access local government schemes dynamically, all with local language options and offline support.
          </p>
        </div>
        <div className="relative aspect-video md:aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 to-transparent z-10 opacity-40" />
          <img 
            src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=800" 
            alt="Farming in rural India" 
            className="w-full h-full object-cover" 
          />
        </div>
      </section>

      {/* Core Values */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">Our Core Values</h2>
          <p className="text-sm text-muted-foreground">Principles that guide our daily operations and community connections</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((val, idx) => {
            const Icon = val.icon;
            return (
              <div key={idx} className="bg-card p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow space-y-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <Icon size={20} />
                </div>
                <h3 className="font-bold text-card-foreground text-base font-heading">{val.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{val.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer Team CTA */}
      <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 border border-slate-950 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-0 bottom-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        
        <h2 className="text-3xl font-black font-heading leading-tight max-w-xl mx-auto">
          Be a Part of the Digital Rural Transformation
        </h2>
        <p className="text-slate-350 max-w-lg mx-auto text-sm">
          Whether you are a provider seeking more clients or a village coordinator wanting to register your village directory, join hands with GramSathi.
        </p>
        <div className="flex justify-center pt-2">
          <button className="px-6 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary/95 transition-all shadow-md">
            Join as a Partner
          </button>
        </div>
      </section>

    </div>
  );
};

export default About;
