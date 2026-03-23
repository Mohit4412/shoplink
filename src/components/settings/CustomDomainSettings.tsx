'use client';

import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { CheckCircle2, Lock, Globe, AlertCircle, Loader2, RefreshCw, Trash2 } from 'lucide-react';
import { UpgradeModal, useUpgradeModal } from '../billing/UpgradeModal';

export function CustomDomainSettings() {
  const { store, user, updateStoreSettings } = useStore();
  const upgradeModal = useUpgradeModal();
  const [verifying, setVerifying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [customDomain, setCustomDomain] = useState(store.customDomain || '');
  const [domainStatus, setDomainStatus] = useState(store.customDomainStatus || 'pending');

  const isPro = user?.plan === 'Pro';

  const handleSaveDomain = async () => {
    if (!customDomain.trim()) return;
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const res = await fetch('/api/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: customDomain.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save domain');
      setDomainStatus('pending');
      await updateStoreSettings({ customDomain: customDomain.trim(), customDomainStatus: 'pending' });
      setSuccess('Domain saved. Now add the DNS record below, then click Verify.');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleVerify = async () => {
    if (!customDomain.trim()) return;
    setError('');
    setSuccess('');
    setVerifying(true);
    try {
      const res = await fetch(`/api/domains?domain=${encodeURIComponent(customDomain.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');
      setDomainStatus(data.status);
      await updateStoreSettings({ customDomainStatus: data.status });
      if (data.verified) {
        setSuccess('Domain verified and active.');
      } else {
        setError('DNS record not found yet. It can take up to 48 hours to propagate.');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setVerifying(false);
    }
  };

  const handleRemove = async () => {
    if (!window.confirm('Remove this custom domain?')) return;
    setError('');
    setRemoving(true);
    try {
      const res = await fetch('/api/domains', { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to remove domain');
      setCustomDomain('');
      setDomainStatus('pending');
      await updateStoreSettings({ customDomain: '', customDomainStatus: undefined });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setRemoving(false);
    }
  };

  const statusBadge = () => {
    if (!customDomain || !isPro) return null;
    const map = {
      active: { label: 'Active', icon: <CheckCircle2 className="w-3 h-3 mr-1" />, cls: 'bg-green-100 text-green-800' },
      failed: { label: 'Verification Failed', icon: <AlertCircle className="w-3 h-3 mr-1" />, cls: 'bg-red-100 text-red-800' },
      pending: { label: 'Pending Verification', icon: <RefreshCw className="w-3 h-3 mr-1" />, cls: 'bg-yellow-100 text-yellow-800' },
    };
    const s = map[domainStatus as keyof typeof map] || map.pending;
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${s.cls}`}>
        {s.icon}{s.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className={`rounded-xl border overflow-hidden ${isPro ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200'}`}>

        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-900">Custom Domain</span>
          </div>
          <div className="flex items-center gap-2">
            {!isPro && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                <Lock className="w-3 h-3 mr-1" /> Pro Feature
              </span>
            )}
            {statusBadge()}
          </div>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                value={customDomain}
                onChange={(e) => { setCustomDomain(e.target.value); setDomainStatus('pending'); setError(''); setSuccess(''); }}
                placeholder="shop.yourbrand.com"
                disabled={!isPro}
                className={!isPro ? 'bg-gray-100' : ''}
                error={error}
              />
            </div>
            {isPro ? (
              <div className="flex gap-2 shrink-0">
                <Button type="button" variant="outline" disabled={saving || !customDomain} onClick={handleSaveDomain}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                </Button>
                <Button
                  type="button"
                  variant={domainStatus === 'active' ? 'outline' : 'primary'}
                  disabled={verifying || !customDomain}
                  onClick={handleVerify}
                >
                  {verifying ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />Verifying…</> : domainStatus === 'active' ? 'Re-verify' : 'Verify'}
                </Button>
                {store.customDomain && (
                  <Button type="button" variant="outline" className="border-red-200 text-red-500 hover:bg-red-50" disabled={removing} onClick={handleRemove}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ) : (
              <Button type="button" variant="outline" className="shrink-0 text-amber-600 border-amber-200 hover:bg-amber-50" onClick={upgradeModal.open}>
                Unlock
              </Button>
            )}
          </div>

          {success && <p className="text-xs text-green-600 font-medium">{success}</p>}

          {/* DNS instructions — shown once domain is saved */}
          {isPro && customDomain && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 text-sm space-y-3">
              <h4 className="font-medium text-blue-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> DNS Configuration Required
              </h4>
              <p className="text-blue-700 text-xs">
                Add this <strong>CNAME</strong> record at your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.):
              </p>
              <div className="bg-white rounded border border-blue-100 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-3 py-2 font-medium text-gray-500">Type</th>
                      <th className="px-3 py-2 font-medium text-gray-500">Name</th>
                      <th className="px-3 py-2 font-medium text-gray-500">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-3 py-2 font-mono text-gray-700">CNAME</td>
                      <td className="px-3 py-2 font-mono text-gray-700">
                        {customDomain.split('.').length > 2 ? customDomain.split('.')[0] : '@'}
                      </td>
                      <td className="px-3 py-2 font-mono text-gray-700">cname.vercel-dns.com</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-blue-600 text-xs">DNS changes can take up to 48 hours to propagate globally.</p>
            </div>
          )}

          {!isPro && (
            <p className="text-xs text-gray-500">
              Connect your own domain (e.g., shop.yourbrand.com) to build trust and brand identity. Upgrade to Pro to access this feature.
            </p>
          )}
        </div>
      </div>

      <UpgradeModal isOpen={upgradeModal.isOpen} onClose={upgradeModal.close} />
    </div>
  );
}
