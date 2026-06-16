import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart, Line, Area } from 'recharts';
import { Users, Calendar, UserCheck, ShieldCheck, MapPin, Coins, Wallet, TrendingUp } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

const AdminReports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await api.get('/admin/reports');
        setData(response.data);
      } catch (error) {
        console.error('Failed to fetch reports', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 dark:border-slate-800 border-t-emerald-600 dark:border-t-emerald-500"></div>
      </div>
    );
  }
  
  if (!data) {
    return (
      <div className="p-8 text-center text-red-500 bg-red-50 dark:bg-red-950/20 dark:text-red-400 rounded-xl mt-8 mx-auto max-w-2xl border border-red-200/50 dark:border-red-900/30">
        Error loading reports. Please try again.
      </div>
    );
  }

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  const revenueChartData = data.monthlyRevenue?.map(item => ({
    name: monthNames[item._id - 1] || `Month ${item._id}`,
    Revenue: item.revenue,
    Bookings: item.count
  })) || [];

  const serviceChartData = data.serviceDemand?.map(item => ({
    name: item._id,
    Bookings: item.count,
    Revenue: item.revenue
  })) || [];

  const statusChartData = data.statusBreakdown?.map(item => ({
    name: item._id,
    value: item.count
  })) || [];

  const villagesChartData = data.activeVillages?.map(item => ({
    name: item._id,
    Bookings: item.count,
    Revenue: item.revenue
  })) || [];

  const topVillage = data.activeVillages && data.activeVillages.length > 0 ? data.activeVillages[0] : null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      <header className="mb-6">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight font-heading">Analytics Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1.5">Comprehensive real-time platform performance and rural engagement metrics</p>
      </header>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {/* Total Users */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4 relative overflow-hidden group hover:shadow-md transition-all duration-300">
          <div className="absolute right-0 top-0 w-24 h-24 bg-blue-500/5 dark:bg-blue-400/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Users</p>
            <h3 className="text-3xl font-black text-foreground mt-1.5">{data.summary?.totalUsers || 0}</h3>
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4 relative overflow-hidden group hover:shadow-md transition-all duration-300">
          <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/5 dark:bg-emerald-400/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Users</p>
            <h3 className="text-3xl font-black text-foreground mt-1.5">{data.summary?.activeUsers || 0}</h3>
          </div>
        </div>

        {/* Active Providers */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4 relative overflow-hidden group hover:shadow-md transition-all duration-300">
          <div className="absolute right-0 top-0 w-24 h-24 bg-purple-500/5 dark:bg-purple-400/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
          <div className="w-12 h-12 bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Providers</p>
            <h3 className="text-3xl font-black text-foreground mt-1.5">{data.summary?.activeProviders || 0}</h3>
          </div>
        </div>

        {/* Total Bookings */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4 relative overflow-hidden group hover:shadow-md transition-all duration-300">
          <div className="absolute right-0 top-0 w-24 h-24 bg-amber-500/5 dark:bg-amber-400/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Bookings</p>
            <h3 className="text-3xl font-black text-foreground mt-1.5">{data.summary?.totalBookings || 0}</h3>
          </div>
        </div>

        {/* Most Active Village */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4 relative overflow-hidden group hover:shadow-md transition-all duration-300">
          <div className="absolute right-0 top-0 w-24 h-24 bg-rose-500/5 dark:bg-rose-400/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
          <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-xl flex items-center justify-center shrink-0">
            <MapPin className="w-6 h-6" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Top Village</p>
            <h3 className="text-xl font-black text-foreground mt-1.5 truncate" title={topVillage?._id || 'N/A'}>
              {topVillage?._id || 'N/A'}
            </h3>
            <p className="text-[10px] text-muted-foreground mt-0.5 font-bold">
              {topVillage ? `${topVillage.count} bookings` : 'No bookings yet'}
            </p>
          </div>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Total Platform Volume */}
        <div className="bg-gradient-to-br from-blue-500 to-sky-600 p-6 rounded-2xl shadow-sm text-white flex items-center gap-4 relative overflow-hidden group hover:shadow-md transition-all duration-300 border border-blue-600/20">
          <div className="absolute right-0 top-0 w-24 h-24 bg-white/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
          <div className="w-12 h-12 bg-white/10 text-white rounded-xl flex items-center justify-center shrink-0">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-white/70 uppercase tracking-wider">Total Platform Volume</p>
            <h3 className="text-3xl font-black mt-1.5">₹{(data.summary?.totalRevenue || 0).toLocaleString('en-IN')}</h3>
          </div>
        </div>

        {/* Platform Net Commissions */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-2xl shadow-sm text-white flex items-center gap-4 relative overflow-hidden group hover:shadow-md transition-all duration-300 border border-emerald-600/20">
          <div className="absolute right-0 top-0 w-24 h-24 bg-white/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
          <div className="w-12 h-12 bg-white/10 text-white rounded-xl flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-white/70 uppercase tracking-wider">Platform Commission (10%)</p>
            <h3 className="text-3xl font-black mt-1.5">₹{(data.summary?.totalCommission || 0).toLocaleString('en-IN')}</h3>
          </div>
        </div>

        {/* Providers Net Earnings */}
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-6 rounded-2xl shadow-sm text-white flex items-center gap-4 relative overflow-hidden group hover:shadow-md transition-all duration-300 border border-purple-600/20">
          <div className="absolute right-0 top-0 w-24 h-24 bg-white/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
          <div className="w-12 h-12 bg-white/10 text-white rounded-xl flex items-center justify-center shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-white/70 uppercase tracking-wider">Providers Net Earnings</p>
            <h3 className="text-3xl font-black mt-1.5">₹{(data.summary?.totalProviderEarnings || 0).toLocaleString('en-IN')}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue & Bookings Trend */}
        <div className="lg:col-span-3 bg-card rounded-2xl shadow-sm border border-border p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-foreground font-heading">Monthly Revenue & Bookings Trend</h2>
            <p className="text-xs text-muted-foreground mt-1">Platform billing and booking volume progress by month</p>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={revenueChartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" className="opacity-40" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} />
                <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} />
                <RechartsTooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))', 
                    borderColor: 'hsl(var(--border))', 
                    borderRadius: '0.75rem', 
                    color: 'hsl(var(--foreground))', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                  }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Legend wrapperStyle={{paddingTop: '20px'}} />
                <Area yAxisId="left" type="monotone" dataKey="Revenue" fill="url(#colorRevenue)" stroke="#3b82f6" strokeWidth={3} name="Revenue (₹)" />
                <Line yAxisId="right" type="monotone" dataKey="Bookings" stroke="#10b981" strokeWidth={3} name="Completed Bookings" dot={{ r: 4, strokeWidth: 2, fill: 'hsl(var(--background))' }} activeDot={{ r: 6 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Service Demand & Revenue */}
        <div className="lg:col-span-2 bg-card rounded-2xl shadow-sm border border-border p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-foreground font-heading">Service Demand & Revenue</h2>
            <p className="text-xs text-muted-foreground mt-1">Comparison of booking counts and completed earnings by category</p>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serviceChartData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" className="opacity-40" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} />
                <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--foreground))', fontWeight: 600, fontSize: 12}} />
                <RechartsTooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))', 
                    borderColor: 'hsl(var(--border))', 
                    borderRadius: '0.75rem', 
                    color: 'hsl(var(--foreground))', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                  }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Legend wrapperStyle={{paddingTop: '20px'}} />
                <Bar dataKey="Bookings" fill="#f59e0b" radius={[0, 4, 4, 0]} name="Total Bookings" />
                <Bar dataKey="Revenue" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Revenue (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Overall Booking Status */}
        <div className="bg-card rounded-2xl shadow-sm border border-border p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground font-heading">Overall Booking Status</h2>
            <p className="text-xs text-muted-foreground mt-1">Distribution of platform bookings by current status</p>
          </div>
          <div className="h-[280px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="value"
                  labelLine={false}
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))', 
                    borderColor: 'hsl(var(--border))', 
                    borderRadius: '0.75rem', 
                    color: 'hsl(var(--foreground))', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                  }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Legend wrapperStyle={{fontSize: '11px', marginTop: '10px'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Most Active Villages Heatmap & Leaderboard */}
        <div className="lg:col-span-2 bg-card rounded-2xl shadow-sm border border-border p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground font-heading">Most Active Villages (Booking Heatmap)</h2>
            <p className="text-xs text-muted-foreground mt-1">Booking distributions across the top participating village locations</p>
          </div>
          <div className="h-[320px] w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={villagesChartData} margin={{ top: 20, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" className="opacity-40" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} />
                <RechartsTooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))', 
                    borderColor: 'hsl(var(--border))', 
                    borderRadius: '0.75rem', 
                    color: 'hsl(var(--foreground))', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                  }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Bar dataKey="Bookings" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Total Bookings">
                  {villagesChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leaderboard panel */}
        <div className="bg-card rounded-2xl shadow-sm border border-border p-6 flex flex-col">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-foreground font-heading">Village Leaderboard</h2>
            <p className="text-xs text-muted-foreground mt-1">Engagement rankings based on completed requests</p>
          </div>
          
          <div className="flex-1 space-y-4.5 overflow-y-auto pr-1 no-scrollbar max-h-[310px]">
            {villagesChartData.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">
                No village data available
              </div>
            ) : (
              villagesChartData.map((village, idx) => {
                const maxBookings = Math.max(...villagesChartData.map(v => v.Bookings), 1);
                const percent = Math.round((village.Bookings / maxBookings) * 100);
                
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-semibold text-foreground flex items-center gap-2">
                        <span className="text-[10px] font-bold text-muted-foreground/60 w-5 h-5 rounded-md bg-accent flex items-center justify-center">
                          #{idx + 1}
                        </span>
                        {village.name}
                      </span>
                      <span className="font-extrabold text-foreground text-xs">
                        {village.Bookings} <span className="text-[10px] font-normal text-muted-foreground">bookings</span>
                      </span>
                    </div>
                    <div className="h-2 w-full bg-accent rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500" 
                        style={{ 
                          width: `${percent}%`,
                          backgroundImage: `linear-gradient(to right, ${COLORS[idx % COLORS.length]}, #10b981)` 
                        }} 
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Daily Revenue Ledger & Provider Earnings Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Daily Revenue Ledger */}
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground font-heading">Daily Revenue Ledger</h2>
            <p className="text-xs text-muted-foreground mt-1">Day-to-day transaction metrics tracking gross revenue, platform fees, and net payouts</p>
          </div>
          <div className="overflow-x-auto max-h-[300px] overflow-y-auto pr-1 mt-6">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-card z-10 border-b border-border">
                <tr className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-card">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Jobs</th>
                  <th className="py-2.5 px-3 text-right">Volume</th>
                  <th className="py-2.5 px-3 text-right text-indigo-600 dark:text-indigo-400">Fee</th>
                  <th className="py-2.5 px-3 text-right text-emerald-600 dark:text-emerald-400">Net Pay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-xs text-foreground">
                {data.dailyRevenue && data.dailyRevenue.length > 0 ? (
                  [...data.dailyRevenue].reverse().map((day, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                      <td className="py-3 px-3 font-semibold">{day._id}</td>
                      <td className="py-3 px-3 font-medium text-muted-foreground">{day.count}</td>
                      <td className="py-3 px-3 font-bold text-right">₹{day.revenue.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3 font-semibold text-right text-indigo-600 dark:text-indigo-400">₹{day.commission.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3 font-extrabold text-right text-emerald-600 dark:text-emerald-400">₹{day.providerEarnings.toLocaleString('en-IN')}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">No transaction history recorded yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Provider Earnings Breakdown Leaderboard */}
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground font-heading">Provider Earnings & Commissions</h2>
            <p className="text-xs text-muted-foreground mt-1">Platform payout details, booking counts, and contribution per provider</p>
          </div>
          <div className="overflow-x-auto max-h-[300px] overflow-y-auto pr-1 mt-6">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-card z-10 border-b border-border">
                <tr className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-card">
                  <th className="py-2.5 px-3">Provider Name</th>
                  <th className="py-2.5 px-3">Bookings</th>
                  <th className="py-2.5 px-3 text-right">Total Vol.</th>
                  <th className="py-2.5 px-3 text-right text-indigo-600 dark:text-indigo-400">Platform Fee</th>
                  <th className="py-2.5 px-3 text-right text-emerald-600 dark:text-emerald-400">Net Pay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-xs text-foreground">
                {data.providerEarnings && data.providerEarnings.length > 0 ? (
                  data.providerEarnings.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                      <td className="py-3 px-3 font-semibold">{p.providerName || 'N/A'}</td>
                      <td className="py-3 px-3 font-medium text-muted-foreground">{p.totalBookings}</td>
                      <td className="py-3 px-3 font-bold text-right">₹{p.totalAmount.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3 font-semibold text-right text-indigo-600 dark:text-indigo-400">₹{p.totalCommission.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3 font-extrabold text-right text-emerald-600 dark:text-emerald-400">₹{p.totalEarnings.toLocaleString('en-IN')}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">No earnings recorded yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
