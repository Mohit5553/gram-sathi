import React, { useEffect } from 'react';
import { ShieldCheck, Info, FileLock2, UserCheck } from 'lucide-react';

const Privacy = () => {
  useEffect(() => {
    document.title = "Privacy Policy | GramSathi";
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', 'Understand how GramSathi protects your personal profile data, mobile numbers, and GPS location coordinates used in bookings.');
  }, []);

  return (
    <div className="space-y-12 max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <section className="text-center space-y-4 max-w-xl mx-auto">
        <div className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-100 dark:bg-slate-950/20 dark:text-slate-400 dark:border-sky-900/30 uppercase tracking-wider">
          Legal Terms
        </div>
        <h1 className="text-4xl font-extrabold text-foreground tracking-tight font-heading">
          Privacy Policy
        </h1>
        <p className="text-sm text-muted-foreground">
          Last Updated: June 15, 2026. This policy explains how we collect, store, and utilize your personal information.
        </p>
      </section>

      {/* Policy details */}
      <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 space-y-8 text-sm text-slate-700 dark:text-slate-350 leading-relaxed shadow-sm">
        
        <section className="space-y-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading flex items-center gap-2">
            <Info size={16} className="text-primary" />
            1. Information We Collect
          </h3>
          <p>
            GramSathi collects basic user identification details during account registration and service booking:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
            <li><strong>Personal details:</strong> Full Name, Email address, and Mobile number.</li>
            <li><strong>Location Data:</strong> Village names, blocks, and precise GPS coordinates to show nearby services and calculate provider travel distance.</li>
            <li><strong>Verification items (for Providers):</strong> Aadhaar card number, PAN Card, and listing descriptions.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading flex items-center gap-2">
            <FileLock2 size={16} className="text-primary" />
            2. How We Use Data
          </h3>
          <p>
            Your details are used strictly for facilitating the GramSathi peer-to-peer directory operations:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
            <li>Displaying active listings on the localized map to nearby users.</li>
            <li>Sending critical booking SMS/FCM notifications (using Firebase Cloud Messaging).</li>
            <li>Aggregating billing totals and commission percentages (10%) for platform reports.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading flex items-center gap-2">
            <UserCheck size={16} className="text-primary" />
            3. Data Sharing Restrictions
          </h3>
          <p>
            We respect your privacy. GramSathi **never** sells or rents your personal details to third-party advertisers. Your contact number is shared exclusively with a service provider or user *only* when a booking request is accepted, ensuring seamless communication.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading flex items-center gap-2">
            <ShieldCheck size={16} className="text-primary" />
            4. Data Retention & Security
          </h3>
          <p>
            All verification uploads (Aadhaar/PAN) are stored securely on Cloudinary and Firebase servers with strict access parameters. Users can request deletion of their account profile and service listings at any time by contacting our support helpdesk at `support@gramsathi.in`.
          </p>
        </section>

      </div>

    </div>
  );
};

export default Privacy;
