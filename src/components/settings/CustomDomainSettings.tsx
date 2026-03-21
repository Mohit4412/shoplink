import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { CheckCircle2, Lock, Globe, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { UpgradeModal, useUpgradeModal } from '../billing/UpgradeModal';

export function CustomDomainSettings() {
  const { store, user, updateStoreSettings } = useStore();
  const upgradeModal = useUpgradeModal();
  const [verifyingDomain, setVerifyingDomain] = useState(false);
  const [domainError, setDomainError] = useState('');

  const [customDomain, setCustomDomain] = useState(store.customDomain || '');
  const [customDomainStatus, setCustomDomainStatus] = useState(store.customDomainStatus || 'pending');

  const isPro = user?.plan === 'Pro';

  const verifyDomain = () => {
    if (!customDomain) return;
    
    // Basic validation
    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/;
    if (!domainRegex.test(customDomain)) {
      setDomainError('Please enter a valid domain name (e.g., shop.brand.com)');
      return;
    }

    setDomainError('');
    setVerifyingDomain(true);
    
    // Simulate verification API call
    setTimeout(() => {
      setVerifyingDomain(false);
      
      // In a real app, this would check DNS records on the backend.
      // For this demo, we'll fail by default unless a specific test domain is used.
      const isDemoDomain = customDomain === 'demo-verified.com';
      
      if (isDemoDomain) {
        setCustomDomainStatus('active');
        void updateStoreSettings({ customDomain, customDomainStatus: 'active' });
        setDomainError('');
      } else {
        setCustomDomainStatus('failed');
        void updateStoreSettings({ customDomain, customDomainStatus: 'failed' });
        setDomainError('DNS record not found. Please ensure you have added the CNAME record.');
      }
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className={`rounded-xl border overflow-hidden ${isPro ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200'}`}>
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-500" />
                <label className="block text-sm font-medium text-gray-900">Custom Domain</label>
              </div>
              {!isPro && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                  <Lock className="w-3 h-3 mr-1" /> Pro Feature
                </span>
              )}
              {isPro && customDomain && (
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  customDomainStatus === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : customDomainStatus === 'failed'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {customDomainStatus === 'active' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                  {customDomainStatus === 'failed' && <AlertCircle className="w-3 h-3 mr-1" />}
                  {customDomainStatus === 'pending' && <RefreshCw className="w-3 h-3 mr-1" />}
                  {customDomainStatus === 'active' ? 'Active' : customDomainStatus === 'failed' ? 'Verification Failed' : 'Pending Verification'}
                </span>
              )}
            </div>
            
            <div className="p-4 space-y-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <Input
                    value={customDomain}
                    onChange={(e) => {
                      setCustomDomain(e.target.value);
                      setCustomDomainStatus('pending'); // Reset status on change
                      setDomainError('');
                    }}
                    placeholder="shop.yourbrand.com"
                    disabled={!isPro}
                    className={!isPro ? 'bg-gray-100' : ''}
                    error={domainError}
                  />
                </div>
                {isPro ? (
                  <Button 
                    type="button"
                    variant={customDomainStatus === 'active' ? 'outline' : 'primary'}
                    disabled={verifyingDomain || !customDomain}
                    onClick={verifyDomain}
                    className="shrink-0"
                  >
                    {verifyingDomain ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : customDomainStatus === 'active' ? (
                      'Re-verify'
                    ) : (
                      'Verify Domain'
                    )}
                  </Button>
                ) : (
                  <Button 
                    type="button" 
                    variant="outline"
                    className="shrink-0 text-amber-600 border-amber-200 hover:bg-amber-50"
                    onClick={upgradeModal.open}
                  >
                    Unlock Feature
                  </Button>
                )}
              </div>
              
              {isPro && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 text-sm">
                  <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    DNS Configuration Required
                  </h4>
                  <p className="text-blue-800 mb-3">
                    To connect your domain, you need to add a <strong>CNAME</strong> record in your DNS provider's settings.
                  </p>
                  <div className="bg-white rounded border border-blue-200 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-3 py-2 font-medium text-gray-500">Type</th>
                          <th className="px-3 py-2 font-medium text-gray-500">Name (Host)</th>
                          <th className="px-3 py-2 font-medium text-gray-500">Value (Points to)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="px-3 py-2 font-mono text-gray-700">CNAME</td>
                          <td className="px-3 py-2 font-mono text-gray-700">
                            {customDomain ? customDomain.split('.')[0] : 'www'}
                          </td>
                          <td className="px-3 py-2 font-mono text-gray-700">{window.location.host}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-blue-700 text-xs mt-3">
                    Note: DNS changes can take up to 48 hours to propagate globally.
                    <br />
                    <span className="opacity-70 italic">(Demo: Use <strong>demo-verified.com</strong> to test success state)</span>
                  </p>
                </div>
              )}
              
              {!isPro && (
                <p className="text-xs text-gray-500">
                  Connect your own domain (e.g., shop.yourbrand.com) to build trust and brand identity.
                  Upgrade to Pro to access this feature.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <UpgradeModal isOpen={upgradeModal.isOpen} onClose={upgradeModal.close} />
    </div>
  );
}
