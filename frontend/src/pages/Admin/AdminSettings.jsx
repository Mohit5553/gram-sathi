import React from 'react';
import { Save } from 'lucide-react';
import Button from '../../components/ui/Button';

const AdminSettings = () => {
  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
      <h2 className="text-2xl font-bold text-foreground mb-6 font-heading">Platform Settings</h2>
      
      <div className="space-y-6 max-w-2xl">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Platform Name</label>
          <input type="text" defaultValue="GramSathi" className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:ring-primary focus:border-primary" />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Support Email</label>
          <input type="email" defaultValue="support@gramsathi.com" className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:ring-primary focus:border-primary" />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Maintenance Mode</label>
          <select className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:ring-primary focus:border-primary">
            <option>Disabled</option>
            <option>Enabled (Admin Access Only)</option>
          </select>
        </div>

        <div className="pt-4 border-t border-border">
          <Button variant="save">
            <Save className="w-4 h-4 mr-2" />
            Save Configuration
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
