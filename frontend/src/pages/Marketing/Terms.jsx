import React, { useEffect } from 'react';
import { Info, Gavel, Scale, AlertTriangle } from 'lucide-react';

const Terms = () => {
  useEffect(() => {
    document.title = "Terms & Conditions | GramSathi";
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', 'Read the terms of service of GramSathi, including booking rules, billing obligations, and platform liability parameters.');
  }, []);

  return (
    <div className="space-y-12 max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <section className="text-center space-y-4 max-w-xl mx-auto">
        <div className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-100 dark:bg-slate-950/20 dark:text-slate-400 dark:border-sky-900/30 uppercase tracking-wider">
          Legal Terms
        </div>
        <h1 className="text-4xl font-extrabold text-foreground tracking-tight font-heading">
          Terms & Conditions
        </h1>
        <p className="text-sm text-muted-foreground">
          Last Updated: June 15, 2026. Please read these terms carefully before utilizing our booking services.
        </p>
      </section>

      {/* Terms details */}
      <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 space-y-8 text-sm text-slate-700 dark:text-slate-350 leading-relaxed shadow-sm">
        
        <section className="space-y-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading flex items-center gap-2">
            <Gavel size={16} className="text-primary" />
            1. Acceptance of Terms
          </h3>
          <p>
            By creating an account, registering machinery, or booking a provider on GramSathi, you agree to comply with these terms, our Privacy Policy, and any regional administrative guidelines. If you disagree with any clause, please terminate usage of the application.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading flex items-center gap-2">
            <Scale size={16} className="text-primary" />
            2. Platform & Commission Rules
          </h3>
          <p>
            GramSathi acts as a peer-to-peer marketplace facilitating discovery:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
            <li><strong>Service Payout:</strong> Customers pay providers directly via cash or UPI.</li>
            <li><strong>Commissions:</strong> Providers agree that the platform automatically calculates and deducts a 10% commission on completed jobs.</li>
            <li><strong>Ratings integrity:</strong> Users agree to write honest reviews and not submit duplicate or spam ratings.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading flex items-center gap-2">
            <AlertTriangle size={16} className="text-primary" />
            3. Limitation of Liability
          </h3>
          <p>
            GramSathi does not directly own machinery or employ day laborers. We are not liable for:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
            <li>Any damage caused to property or crops by equipment operators during service execution.</li>
            <li>Scheduling delays, work cancellations, or payment disputes between customers and providers.</li>
            <li>Any physical injury sustained during technical electrical, plumbing, or JCB operations.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading flex items-center gap-2">
            <Info size={16} className="text-primary" />
            4. Account Suspensions
          </h3>
          <p>
            We reserve the right to suspend or ban users or providers who violate code rules, repeatedly cancel bookings without cause, submit false Aadhaar details, or abuse other community members.
          </p>
        </section>

      </div>

    </div>
  );
};

export default Terms;
