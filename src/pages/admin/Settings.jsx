import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, ShieldCheck, Database, Trash2, 
  RotateCcw, Download, Check, AlertTriangle, Plus, RefreshCw, Key
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';

export default function Settings() {
  const { token, user } = useAuth();
  
  // Settings Form State
  const [settings, setSettings] = useState({
    shipping_fee: '250',
    free_shipping_threshold: '5000',
    contact_whatsapp: 'https://wa.me/94774454785',
    contact_phone: '0774454785',
    contact_email: 'info@readora.lk',
    store_address: 'Main Street, Colombo, Sri Lanka'
  });

  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  // Backup State
  const [backups, setBackups] = useState([]);
  const [loadingBackups, setLoadingBackups] = useState(false);
  const [creatingBackup, setCreatingBackup] = useState(false);

  // Fetch Settings key map
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/settings`);
      if (res.ok) {
        const data = await res.json();
        setSettings(prev => ({
          ...prev,
          ...data
        }));
      }
    } catch (err) {
      console.warn('Failed to retrieve settings keys', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch backups listing (Super Admin only API but let's load safely)
  const fetchBackups = async () => {
    if (user?.role !== 'super_admin') return;
    setLoadingBackups(true);
    try {
      const res = await fetch(`${API_BASE_URL}/settings/backups`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBackups(data);
      }
    } catch (err) {
      console.warn('Failed to retrieve backups list', err);
    } finally {
      setLoadingBackups(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchBackups();
  }, [token, user]);

  const flashSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4500);
  };

  // Save Settings forms
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      // Loop over settings object and save each setting key
      const keys = Object.keys(settings);
      for (const key of keys) {
        await fetch(`${API_BASE_URL}/settings`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ key, value: settings[key] })
        });
      }
      flashSuccess('Global configurations saved successfully.');
    } catch (err) {
      alert('Error updating system configurations.');
    } finally {
      setSavingSettings(false);
    }
  };

  // Create Backup
  const handleCreateBackup = async () => {
    setCreatingBackup(true);
    try {
      const res = await fetch(`${API_BASE_URL}/settings/backup`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        flashSuccess(`System backup "${data.filename}" created.`);
        fetchBackups();
      } else {
        alert(data.message || 'Failed to execute backup.');
      }
    } catch (err) {
      alert('Error creating backup.');
    } finally {
      setCreatingBackup(false);
    }
  };

  // Restore Backup
  const handleRestoreBackup = async (filename) => {
    if (!window.confirm(`DANGER: Are you sure you want to RESTORE from backup "${filename}"? All current database records will be OVERWRITTEN.`)) return;
    
    try {
      const res = await fetch(`${API_BASE_URL}/settings/backups/${filename}/restore`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        flashSuccess('Database restored successfully! Reloading...');
        setTimeout(() => window.location.reload(), 2000);
      } else {
        alert(data.message || 'Restore failed.');
      }
    } catch (err) {
      alert('Error executing database restore.');
    }
  };

  // Delete Backup
  const handleDeleteBackup = async (filename) => {
    if (!window.confirm(`Are you sure you want to delete backup file "${filename}"?`)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/settings/backups/${filename}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        flashSuccess('Backup file deleted.');
        fetchBackups();
      } else {
        alert('Failed to delete backup.');
      }
    } catch (err) {
      alert('Error deleting backup.');
    }
  };

  // Format File Size
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = 2;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="h-60 bg-slate-900 border border-slate-800 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Toast */}
      {successMsg && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-emerald-500 border border-emerald-400 text-white font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <Check className="h-4 w-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 font-display uppercase tracking-wide">
          Global Settings
        </h1>
        <p className="text-xs text-slate-400">Configure delivery rules, contact details, and database backups</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Settings Form Column */}
        <div className="lg:col-span-2 bg-[#0f172a] border border-slate-850 p-6 rounded-3xl space-y-5">
          <div className="border-b border-slate-850 pb-3 flex items-center gap-2 text-brand-400 font-bold uppercase text-[10px] tracking-wider">
            <SettingsIcon className="h-4.5 w-4.5" />
            <span>Store Configurations</span>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-5 text-xs">
            {/* Delivery configs */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-450 uppercase text-[9px] border-b border-slate-850/40 pb-1">1. Delivery Fees Setup</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Shipping Fee */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 uppercase">Standard Delivery Fee (LKR) *</label>
                  <input
                    type="number"
                    required
                    value={settings.shipping_fee}
                    onChange={(e) => setSettings(prev => ({ ...prev, shipping_fee: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none"
                    placeholder="250"
                  />
                </div>
                {/* Free Shipping Limit */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 uppercase">Free Delivery Order Minimum (LKR)</label>
                  <input
                    type="number"
                    value={settings.free_shipping_threshold}
                    onChange={(e) => setSettings(prev => ({ ...prev, free_shipping_threshold: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none"
                    placeholder="5000"
                  />
                </div>
              </div>
            </div>

            {/* Store details */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-450 uppercase text-[9px] border-b border-slate-850/40 pb-1">2. Contact Info & Support Links</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Whatsapp Link */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 uppercase">WhatsApp Link *</label>
                  <input
                    type="text"
                    required
                    value={settings.contact_whatsapp}
                    onChange={(e) => setSettings(prev => ({ ...prev, contact_whatsapp: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none"
                  />
                </div>
                {/* Phone */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 uppercase">Store Phone Contact *</label>
                  <input
                    type="text"
                    required
                    value={settings.contact_phone}
                    onChange={(e) => setSettings(prev => ({ ...prev, contact_phone: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none"
                  />
                </div>
                {/* Email */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 uppercase">Store Email</label>
                  <input
                    type="email"
                    value={settings.contact_email}
                    onChange={(e) => setSettings(prev => ({ ...prev, contact_email: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none"
                  />
                </div>
                {/* Address */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-400 uppercase">Store Physical Address</label>
                  <input
                    type="text"
                    value={settings.store_address}
                    onChange={(e) => setSettings(prev => ({ ...prev, store_address: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Save Buttons */}
            <div className="pt-3 border-t border-slate-850 flex justify-end">
              <button
                type="submit"
                disabled={savingSettings}
                className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl shadow-lg shadow-brand-600/10 transition-all disabled:opacity-50"
              >
                {savingSettings ? 'Saving...' : 'Save Configurations'}
              </button>
            </div>

          </form>
        </div>

        {/* Backups Column (Super Admin Only) */}
        <div className="bg-[#0f172a] border border-slate-850 p-6 rounded-3xl space-y-5 flex flex-col">
          <div className="border-b border-slate-850 pb-3 flex items-center gap-2 text-brand-400 font-bold uppercase text-[10px] tracking-wider">
            <Database className="h-4.5 w-4.5" />
            <span>Database Backups</span>
          </div>

          {user?.role !== 'super_admin' ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3">
              <Key className="h-8 w-8 text-rose-500 animate-pulse" />
              <p className="text-xs font-bold text-slate-400">Access Restricted</p>
              <p className="text-[10px] text-slate-650 leading-relaxed">
                Backups auditing and database restore triggers are reserved for Super Administrators only.
              </p>
            </div>
          ) : (
            <div className="flex flex-col flex-1 space-y-4 text-xs">
              
              {/* Backups Actions */}
              <button
                onClick={handleCreateBackup}
                disabled={creatingBackup}
                className="w-full py-2.5 bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-200 font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <Database className="h-4 w-4 text-brand-400" />
                <span>{creatingBackup ? 'Creating Backup...' : 'Create DB Backup'}</span>
              </button>

              {/* List backups */}
              <div className="flex-1 flex flex-col space-y-3 max-h-[360px] overflow-y-auto no-scrollbar pr-1">
                {loadingBackups ? (
                  <p className="text-center text-slate-500 text-[10px] py-8">Scanning backups list...</p>
                ) : backups.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-slate-800 text-slate-500 rounded-2xl italic my-4">
                    No backup files found.
                  </div>
                ) : (
                  backups.map(b => (
                    <div key={b.filename} className="p-3 bg-slate-950/40 border border-slate-850/50 rounded-2xl space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[10px] text-slate-350 font-mono truncate max-w-[120px]">
                          {b.filename.replace('backup_', '').replace('.json', '')}
                        </span>
                        <span className="text-[9px] text-slate-500">{formatBytes(b.size)}</span>
                      </div>
                      
                      <div className="flex justify-between items-center pt-1 border-t border-slate-900">
                        <span className="text-[9px] text-slate-600">
                          {new Date(b.createdAt).toLocaleDateString()}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRestoreBackup(b.filename)}
                            title="Restore Database from this file"
                            className="p-1 rounded bg-emerald-950/40 text-emerald-450 hover:bg-emerald-900"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteBackup(b.filename)}
                            title="Delete Backup File"
                            className="p-1 rounded bg-rose-950/40 text-rose-450 hover:bg-rose-900"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Warning box */}
              <div className="p-3 bg-rose-500/5 border border-rose-500/20 rounded-2xl flex items-start gap-2 text-rose-350 text-[10px]">
                <AlertTriangle className="h-4.5 w-4.5 shrink-0 text-rose-500 animate-bounce" />
                <p className="leading-relaxed">
                  Restoring backup replaces all books, orders, users, and settings. Proceed with caution.
                </p>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
