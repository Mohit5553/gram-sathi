import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from './ProtectedRoute';

// Lazy loading all pages
const Home = lazy(() => import('../pages/Home/Home'));
const Login = lazy(() => import('../pages/Auth/Login'));
const VerifyOtp = lazy(() => import('../pages/Auth/VerifyOTP'));
const TractorList = lazy(() => import('../pages/Tractor/TractorList'));
const AddTractor = lazy(() => import('../pages/Tractor/AddTractor'));
const JCBList = lazy(() => import('../pages/JCB/JCBList'));
const AddJCB = lazy(() => import('../pages/JCB/AddJCB'));
const LabourList = lazy(() => import('../pages/Labour/LabourList'));
const HireLabour = lazy(() => import('../pages/Labour/HireLabour'));
const ElectricianList = lazy(() => import('../pages/Electrician/ElectricianList'));
const BookElectrician = lazy(() => import('../pages/Electrician/BookElectrician'));
const PlumberList = lazy(() => import('../pages/Plumber/PlumberList'));
const BookPlumber = lazy(() => import('../pages/Plumber/BookPlumber'));
const SchemeList = lazy(() => import('../pages/Schemes/SchemeList'));
const LostFoundList = lazy(() => import('../pages/LostFound/LostFoundList'));
const EmergencyContacts = lazy(() => import('../pages/Emergency/EmergencyContacts'));
const Profile = lazy(() => import('../pages/Profile/Profile'));
const UserBookings = lazy(() => import('../pages/Bookings/UserBookings'));
const ProviderDashboard = lazy(() => import('../pages/Bookings/ProviderDashboard'));
const NearbyServices = lazy(() => import('../pages/Map/NearbyServices'));
const UserNotifications = lazy(() => import('../pages/Notifications/UserNotifications'));
const LocationAvailability = lazy(() => import('../pages/Home/LocationAvailability'));
const MandiPage = lazy(() => import('../pages/Mandi/MandiPage'));
const NewsPage = lazy(() => import('../pages/News/NewsPage'));
const JobsPage = lazy(() => import('../pages/Jobs/JobsPage'));
const MarketplacePage = lazy(() => import('../pages/Marketplace/MarketplacePage'));

// Marketing Pages
const About = lazy(() => import('../pages/Marketing/About'));
const Services = lazy(() => import('../pages/Marketing/Services'));
const Contact = lazy(() => import('../pages/Marketing/Contact'));
const FAQ = lazy(() => import('../pages/Marketing/FAQ'));
const Privacy = lazy(() => import('../pages/Marketing/Privacy'));
const Terms = lazy(() => import('../pages/Marketing/Terms'));

// Admin Pages
const DashboardOverview = lazy(() => import('../pages/Admin/DashboardOverview'));
const AdminNotifications = lazy(() => import('../pages/Admin/AdminNotifications'));
const AdminReports = lazy(() => import('../pages/Admin/AdminReports'));

// Admin Data Pages grouped export won't work perfectly with lazy unless we do it like this:
const AdminUsers = lazy(() => import('../pages/Admin/AdminDataPages').then(module => ({ default: module.AdminUsers })));
const AdminProviders = lazy(() => import('../pages/Admin/AdminDataPages').then(module => ({ default: module.AdminProviders })));
const AdminBookings = lazy(() => import('../pages/Admin/AdminDataPages').then(module => ({ default: module.AdminBookings })));
const AdminSchemes = lazy(() => import('../pages/Admin/AdminDataPages').then(module => ({ default: module.AdminSchemes })));
const AdminTractors = lazy(() => import('../pages/Admin/AdminDataPages').then(module => ({ default: module.AdminTractors })));
const AdminJCB = lazy(() => import('../pages/Admin/AdminDataPages').then(module => ({ default: module.AdminJCB })));
const AdminLabour = lazy(() => import('../pages/Admin/AdminDataPages').then(module => ({ default: module.AdminLabour })));
const AdminElectrician = lazy(() => import('../pages/Admin/AdminDataPages').then(module => ({ default: module.AdminElectrician })));
const AdminPlumber = lazy(() => import('../pages/Admin/AdminDataPages').then(module => ({ default: module.AdminPlumber })));
const AdminEmergency = lazy(() => import('../pages/Admin/AdminDataPages').then(module => ({ default: module.AdminEmergency })));
const AdminLostFound = lazy(() => import('../pages/Admin/AdminDataPages').then(module => ({ default: module.AdminLostFound })));
const AdminSettings = lazy(() => import('../pages/Admin/AdminSettings'));
const AdminVerifications = lazy(() => import('../pages/Admin/AdminVerifications'));
const AdminCMS = lazy(() => import('../pages/Admin/AdminCMS'));
const AdminActivityLogs = lazy(() => import('../pages/Admin/AdminActivityLogs'));
const AdminBackup = lazy(() => import('../pages/Admin/AdminBackup'));
const AdminRoles = lazy(() => import('../pages/Admin/AdminRoles'));
const AdminSMTP = lazy(() => import('../pages/Admin/AdminSMTP'));
const AdminAPIConfig = lazy(() => import('../pages/Admin/AdminAPIConfig'));

const SchemeDetails = lazy(() => import('../pages/Schemes/SchemeDetails'));


const AppRoutes = () => {
  return (
    <Suspense fallback={<div className="h-screen w-full flex items-center justify-center text-emerald-600">Loading...</div>}>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="verify-otp" element={<VerifyOtp />} />
          <Route path="tractors" element={<TractorList />} />
          <Route element={<ProtectedRoute allowedRoles={['provider', 'admin', 'super_admin']} />}>
            <Route path="tractors/add" element={<AddTractor />} />
            <Route path="jcb/add" element={<AddJCB />} />
            <Route path="provider/dashboard" element={<ProviderDashboard />} />
          </Route>
          <Route path="jcb" element={<JCBList />} />

          <Route path="labour" element={<LabourList />} />
          <Route element={<ProtectedRoute />}>
            <Route path="labour/hire/:id" element={<HireLabour />} />
          </Route>
          <Route path="electricians" element={<ElectricianList />} />
          <Route element={<ProtectedRoute />}>
            <Route path="electricians/book/:id" element={<BookElectrician />} />
          </Route>
          <Route path="plumbers" element={<PlumberList />} />
          <Route element={<ProtectedRoute />}>
            <Route path="plumbers/book/:id" element={<BookPlumber />} />
          </Route>
          <Route path="schemes" element={<SchemeList />} />
          <Route path="schemes/:id" element={<SchemeDetails />} />
          <Route path="lost-found" element={<LostFoundList />} />
          <Route path="emergency" element={<EmergencyContacts />} />
          <Route path="nearby-services" element={<NearbyServices />} />
          <Route path="location-availability" element={<LocationAvailability />} />
          <Route path="about" element={<About />} />
          <Route path="services" element={<Services />} />
          <Route path="contact" element={<Contact />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="terms" element={<Terms />} />
          <Route path="mandi" element={<MandiPage />} />
          <Route path="news" element={<NewsPage />} />
          <Route path="jobs" element={<JobsPage />} />
          <Route path="marketplace" element={<MarketplacePage />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="profile" element={<Profile />} />
            <Route path="bookings" element={<UserBookings />} />
            <Route path="notifications" element={<UserNotifications />} />
          </Route>
        </Route>
        
        <Route element={<ProtectedRoute allowedRoles={['admin', 'super_admin']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardOverview />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="providers" element={<AdminProviders />} />
            <Route path="verifications" element={<AdminVerifications />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="schemes" element={<AdminSchemes />} />
            <Route path="tractors" element={<AdminTractors />} />
            <Route path="jcb" element={<AdminJCB />} />
            <Route path="labour" element={<AdminLabour />} />
            <Route path="electricians" element={<AdminElectrician />} />
            <Route path="plumbers" element={<AdminPlumber />} />
            <Route path="emergency" element={<AdminEmergency />} />
            <Route path="lost-found" element={<AdminLostFound />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="analytics" element={<AdminReports />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="cms" element={<AdminCMS />} />
            
            {/* Super Admin Only Routes */}
            <Route element={<ProtectedRoute allowedRoles={['super_admin']} />}>
              <Route path="logs" element={<AdminActivityLogs />} />
              <Route path="backups" element={<AdminBackup />} />
              <Route path="roles" element={<AdminRoles />} />
              <Route path="smtp" element={<AdminSMTP />} />
              <Route path="api-config" element={<AdminAPIConfig />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
