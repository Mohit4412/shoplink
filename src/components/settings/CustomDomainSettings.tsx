'use client';

import { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import {
  CheckCircle2, Lock, Globe, AlertCircle, Loader2,
  RefreshCw, Trash2, Zap, Copy, ExternalLink
} from 'lucide-react';
import { UpgradeModal, useUpgradeModal } from '../billing/UpgradeModal';

export function CustomDomainSettings() {
  const { store, user, updateStoreSettings } = useStore();
  const upgradeModal = useUpgradeModal();
  const [verifying, setVerifying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState(false);

  const [customDomain, setCustomDomain] = useState(store.customDomain || '');
  const [domainStatus, setDomainStatus] = useState(store.customDomainStatus || 'pending');

  const isPro = user?.plan === 'Pro';

  const handleSaveDomain = async () => {
    if (!customDomain.trim()) return;
    setError(''); setSuccess(''); setSaving(true);
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
      setSuccess('Domain saved. Add the DNS record below, then click Verify.');
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleVerify = async () => {
    if (!customDomain.trim()) return;
    setError(''); setSuccess(''); setVerifying(true);
    try {
      const res = await fetch(`/api/domains?domain=${encodeURIComponent(customDomain.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');
      setDomainStatus(data.status);
      await updateStoreSettings({ customDomainStatus: data.status });
      if (data.verified) setSuccess('Domain verified and active.');
      else setError('DNS record not found yet. It can take up to 48 hours to propagate.');
    } catch (e: any) { setError(e.message); }
    finally { setVerifying(false); }
  };

  const handleRemove = async () => {
    if (!window.confirm('Remove this custom domain?')) return;
    setError(''); setRemoving(true);
    try {
      const res = await fetch('/api/domains', { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to remove domain');
      setCustomDomain(''); setDomainStatus('pending');
      await updateStoreSettings({ customDomain: '', customDomainStatus: undefined });
    } catch (e: any) { setError(e.message); }
    finally { setRemoving(false); }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cnameValue = 'cname.vercel-dns.com';
  const cnameHost = customDomain.split('.').length > 2 ? customDomain.split('.')[0] : '@';

  const statusBadge = () => {
    if (!customDomain || !isPro) return null;
    const map = {
      active: { label: 'Active', icon: <CheckCircle2 className="w-3 h-3 mr-1" />, cls: 'bg-green-100 text-green-700' },
      failed: { label: 'Failed', icon: <AlertCircle className="w-3 h-3 mr-1" />, cls: 'bg-red-100 text-red-700' },
      pending: { label: 'Pending', icon: <RefreshCw className="w-3 h-3 mr-1" />, cls: 'bg-amber-100 text-amber-700' },
    };
    const s = map[domainStatus as keyof typeof map] || map.pending;
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${s.cls}`}>
        {s.icon}{s.label}
      </span>
    );
  };

  return (
    <div className="space-y-3 mt-4">

      {/* Domain input card */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 pt-3.5 pb-2 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-gray-400" />
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Custom domain</p>
          </div>
          <div className="flex items-center gap-2">
            {!isPro && (
              <span className="inline-flex items-center text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                <Lock className="w-2.5 h-2.5 mr-1" /> Pro only
              </span>
            )}
            {statusBadge()}
          </div>
        </div>

        <div className="p-4 space-y-3">
          {isPro ? (
            <>
              <p className="text-xs text-gray-500 font-medium">
                Connect your own domain so customers visit <span className="font-bold text-gray-700">shop.yourbrand.com</span> instead of yourname.myshoplink.site.
              </p>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    value={customDomain}
                    onChange={e => { setCustomDomain(e.target.value); setDomainStatus('pending'); setError(''); setSuccess(''); }}
                    placeholder="shop.yourbrand.com"
                    error={error}
                  />
                </div>
                <Button type="button" variant="outline" disabled={saving || !customDomain} onClick={handleSaveDomain}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                </Button>
                <Button
                  type="button"
                  variant={domainStatus === 'active' ? 'outline' : 'primary'}
                  disabled={verifying || !customDomain}
                  onClick={handleVerify}
                >
                  {verifying ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" />Checking…</> : domainStatus === 'active' ? 'Re-verify' : 'Verify'}
                </Button>
                {store.customDomain && (
                  <Button type="button" variant="outline" className="border-red-200 text-red-500 hover:bg-red-50" disabled={removing} onClick={handleRemove}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              {success && (
                <p className="text-xs text-green-600 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {success}
                </p>
              )}
            </>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-700">Use your own domain</p>
                <p className="text-xs text-gray-400 mt-0.5">e.g. shop.yourbrand.com — upgrade to Pro to connect it.</p>
              </div>
              <button
                onClick={upgradeModal.open}
                className="shrink-0 h-9 px-4 rounded-xl bg-gray-900 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-gray-800 transition-colors"
              >
                <Zap className="w-3.5 h-3.5" /> Upgrade
              </button>
            </div>
          )}
        </div>
      </div>

      {/* DNS instructions — shown once domain is saved */}
      {isPro && customDomain && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 pt-3.5 pb-2 border-b border-gray-50">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">DNS configuration</p>
          </div>
          <div className="p-4 space-y-4">
            <p className="text-xs text-gray-500 font-medium leading-relaxed">
              Add this <span className="font-bold text-gray-700">CNAME record</span> at your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.), then click Verify above.
            </p>

            <div className="rounded-xl border border-gray-100 overflow-hidden">
              <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-100 px-3 py-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</span>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Name</span>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Value</span>
              </div>
              <div className="grid grid-cols-3 px-3 py-3 items-center gap-2">
                <span className="font-mono text-xs font-bold text-gray-700">CNAME</span>
                <span className="font-mono text-xs text-gray-700">{cnameHost}</span>
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-mono text-xs text-gray-700 truncate">{cnameValue}</span>
                  <button
                    onClick={() => handleCopy(cnameValue)}
                    className="shrink-0 p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                    title="Copy"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {copied && <p className="text-xs text-green-600 font-semibold">Copied to clipboard</p>}

            <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5 flex items-start gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 font-medium leading-relaxed">
                DNS changes can take up to <span className="font-bold">48 hours</span> to propagate. If verification fails, wait a few hours and try again.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* How it works — shown to free users */}
      {!isPro && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 pt-3.5 pb-2 border-b border-gray-50">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">How it works</p>
          </div>
          <div className="p-4 space-y-3">
            {[
              { step: '1', text: 'Upgrade to Pro and enter your domain (e.g. shop.yourbrand.com)' },
              { step: '2', text: 'Add a CNAME DNS record at your registrar pointing to MyShopLink' },
              { step: '3', text: 'Click Verify — your store goes live on your own domain' },
            ].map(s => (
              <div key={s.step} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-500 shrink-0 mt-0.5">{s.step}</div>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <UpgradeModal isOpen={upgradeModal.isOpen} onClose={upgradeModal.close} />
    </div>
  );
}
