import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Tractor, LoaderPinwheel, HardHat, Zap, Wrench, ShieldCheck, 
  MapPin, CheckCircle, ShieldAlert, BadgeInfo
} from 'lucide-react';
import Button from '../../components/ui/Button';

const Services = () => {
  useEffect(() => {
    document.title = "Our Services | GramSathi - On-Demand Rural Marketplace";
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', 'Explore services on GramSathi including Tractor rental, JCB booking, local farm labor recruitment, home electricians, plumbers, and emergency contacts.');
  }, []);

  const serviceCategories = [
    {
      title: 'Tractor Booking',
      icon: Tractor,
      desc: 'Connect with local tractor owners for plowing, sowing, cultivating, and transport. Select hourly rates and specialized equipment attachments.',
      rate: '₹600 - ₹900 / Hour',
      path: '/tractors'
    },
    {
      title: 'JCB & Heavy Machinery',
      icon: LoaderPinwheel,
      desc: 'Rent excavation machinery and loaders for land leveling, pond construction, trenching, or construction work with skilled operators.',
      rate: '₹900 - ₹1200 / Hour',
      path: '/jcb'
    },
    {
      title: 'Labour Hiring',
      icon: HardHat,
      desc: 'Find skilled farm laborers, harvest hands, masons, and day contractors. Post work location, daily wages, and contract duration.',
      rate: '₹350 - ₹500 / Day',
      path: '/labour'
    },
    {
      title: 'Electrician Services',
      icon: Zap,
      desc: 'Resolve motor starter faults, house wiring issues, or power line interruptions. Immediate bookings with certified village technicians.',
      rate: '₹150 Visit Charge',
      path: '/electricians'
    },
    {
      title: 'Plumbing Services',
      icon: Wrench,
      desc: 'Fix pipe leaks, install water pumps, borewell plumbing maintenance, and sanitary pipe fitting repairs.',
      rate: '₹150 Visit Charge',
      path: '/plumbers'
    }
  ];

  const benefits = [
    { title: 'Verified Providers Only', desc: 'All technicians, operators, and contractors undergo mandatory government-document verification and approval.' },
    { title: 'Local Village Directory', desc: 'Book from your own village or surrounding panchayat to avoid delays and minimize transportation charges.' },
    { title: 'Zero Service Markups', desc: 'No hidden commission additions. Customers pay exact provider rates directly via cash or direct UPI.' },
    { title: 'Real-time GPS Tracking', desc: 'Locate providers instantly on our live interactive village map view for emergency breakdowns.' }
  ];

  return (
    <div className="space-y-16 max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-300">
      
      {/* Header Section */}
      <section className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30 uppercase tracking-wider">
          What We Offer
        </div>
        <h1 className="text-4xl font-extrabold text-foreground tracking-tight font-heading">
          Dynamic On-Demand Village Services
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          GramSathi digitizes on-demand requirements for machinery booking, farm labor, and home maintenance. Say goodbye to middleman markups.
        </p>
      </section>

      {/* Service Grid Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {serviceCategories.map((srv, idx) => {
          const Icon = srv.icon;
          return (
            <article key={idx} className="bg-card rounded-2xl border border-border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col justify-between h-full group">
              <div>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  <Icon size={22} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-heading mb-2">{srv.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-6">{srv.desc}</p>
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Est. Pricing</span>
                  <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200">{srv.rate}</p>
                </div>
                <Button size="sm" asChild>
                  <Link to={srv.path}>Book Now</Link>
                </Button>
              </div>
            </article>
          );
        })}
      </section>

      {/* How it works details */}
      <section className="bg-slate-50 dark:bg-slate-900/20 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 sm:p-12 space-y-10">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">How Booking Works</h2>
          <p className="text-sm text-muted-foreground">Three simple steps to book services from your mobile phone</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="space-y-3 relative z-10">
            <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold shadow-md">1</div>
            <h3 className="font-bold text-foreground text-sm font-heading">Choose Service & Details</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">Select tractor, worker hiring, or home maintenance, and define duration, dates, and village coordinates.</p>
          </div>
          <div className="space-y-3 relative z-10">
            <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold shadow-md">2</div>
            <h3 className="font-bold text-foreground text-sm font-heading">Match & Accept</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">Find local active providers on the directory map. Submit reservation; the provider receives instant SMS alerts to accept.</p>
          </div>
          <div className="space-y-3 relative z-10">
            <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold shadow-md">3</div>
            <h3 className="font-bold text-foreground text-sm font-heading">Complete Job & Pay</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">The provider completes job on-site. Pay directly to the provider via UPI/Cash upon verification with zero booking markups.</p>
          </div>
        </div>
      </section>

      {/* Service Assurance */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-150 border border-slate-200">
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 to-transparent z-10 opacity-30" />
          <img 
            src="https://images.unsplash.com/photo-1590682680398-1419746d56d0?auto=format&fit=crop&q=80&w=800" 
            alt="Verified electrician worker" 
            className="w-full h-full object-cover" 
          />
        </div>
        <div className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">Our Service Guarantee</h2>
          <div className="space-y-4">
            {benefits.map((bn, idx) => (
              <div key={idx} className="flex gap-3">
                <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={16} />
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-none">{bn.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{bn.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Services;
