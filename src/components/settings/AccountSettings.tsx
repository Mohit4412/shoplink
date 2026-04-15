'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useStore } from '../../context/StoreContext';
import { Input, Textarea } from '../ui/Input';
import { CheckCircle2, Upload, ChevronDown, Loader2 } from 'lucide-react';
import { countryCodes } from '../../utils/countryCodes';
import { deleteImage, uploadImage } from '../../utils/upload';

export function AccountSettings() {
  const { user, updateUserProfile } = useStore();

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  const [saveError, setSaveError] = useState('');
  const [waError, setWaError] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    avatarUrl: user?.avatarUrl || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    username: user?.username || '',
    bio: user?.bio || '',
  });

  const [selectedCountry, setSelectedCountry] = useState(countryCodes[0]);
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    setForm({
      avatarUrl: user?.avatarUrl || '',
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      username: user?.username || '',
      bio: user?.bio || '',
    });
  }, [user]);

  useEffect(() => {
    if (user?.whatsappNumber) {
      const sorted = [...countryCodes].sort((a, b) => b.dialCode.length - a.dialCode.length);
      const match = sorted.find(c => user.whatsappNumber.startsWith(c.dialCode));
      if (match) {
        setSelectedCountry(match);
        setPhoneNumber(user.whatsappNumber.slice(match.dialCode.length));
      } else {
        setPhoneNumber(user.whatsappNumber);
      }
    }
  }, [user?.whatsappNumber]);

  const handleAvatarUpload = async (file?: File) => {
    if (!file) return;
    setUploadError('');
    setIsUploadingAvatar(true);
    try {
      const prev = form.avatarUrl;
      const avatarUrl = await uploadImage(file, 'avatars');
      if (prev && prev !== avatarUrl) void deleteImage(prev);
      setForm(f => ({ ...f, avatarUrl }));
    } catch (e: any) {
      setUploadError(e.message || 'Upload failed');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    const digits = phoneNumber.replace(/\D/g, '');
    if (digits.length < 7 || digits.length > 15) {
      setWaError('Enter a valid phone number');
      return;
    }
    setWaError('');
    setSaveError('');
    setIsSaving(true);
    try {
      const prev = user?.avatarUrl || '';
      await updateUserProfile({
        avatarUrl: form.avatarUrl,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        username: form.username.toLowerCase().replace(/[^a-z0-9-]/g, ''),
        bio: form.bio.trim(),
        whatsappNumber: `${selectedCountry.dialCode}${digits}`,
      });
      if (prev && prev !== form.avatarUrl) void deleteImage(prev);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (e: any) {
      setSaveError(e.message || 'Unable to save right now.');
    } finally {
      setIsSaving(false);
    }
  };

  const displayName = [form.firstName, form.lastName].filter(Boolean).join(' ') || user?.username || 'You';
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <form onSubmit={handleSave} className="space-y-4">

      {/* Avatar row */}
      <div className="flex items-center gap-3.5 border-b pb-4" style={{ borderColor: 'var(--app-border)' }}>
        <div className="relative shrink-0">
          {form.avatarUrl ? (
            <img
              src={form.avatarUrl}
              alt="Avatar"
              className="h-14 w-14 rounded-full object-cover border"
              style={{ borderColor: 'var(--app-border)' }}
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#4a9b6e] text-lg font-semibold text-white">
              {initials}
            </div>
          )}
          {isUploadingAvatar && (
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            </div>
          )}
        </div>

        <div>
          <p className="text-[14px] font-semibold text-[var(--app-text)]">{displayName}</p>
          <p className="text-[11px] text-[var(--app-text-muted)]">@{form.username || user?.username}</p>
          <label
            htmlFor="avatar-upload"
            className="mt-2 inline-flex h-8 items-center gap-1.5 rounded-xl border bg-white px-3 text-[11px] font-medium text-[var(--app-text-muted)] cursor-pointer transition-colors hover:bg-[var(--app-panel-muted)]"
            style={{ borderColor: 'var(--app-border)' }}
          >
            <Upload className="w-3.5 h-3.5" />
            {isUploadingAvatar ? 'Uploading…' : 'Change photo'}
          </label>
          <input
            type="file"
            accept="image/*"
            id="avatar-upload"
            className="hidden"
            onChange={e => void handleAvatarUpload(e.target.files?.[0])}
          />
          {uploadError && <p className="text-xs text-red-500 mt-1">{uploadError}</p>}
        </div>
      </div>

      {/* Name row */}
      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            label="First name"
            value={form.firstName}
            onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
            placeholder="Priya"
          />
        </div>
        <div className="flex-1">
          <Input
            label="Last name"
            value={form.lastName}
            onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
            placeholder="Sharma"
          />
        </div>
      </div>

      {/* Username */}
      <Input
        label="Username"
        value={form.username}
        onChange={e => setForm(f => ({ ...f, username: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
        helperText="Changing this updates your store URL."
      />

      {/* Email — read only */}
      <Input
        label="Email"
        type="email"
        value={user?.email || ''}
        disabled
        className="bg-zinc-50 text-zinc-400 cursor-not-allowed"
        helperText="Email cannot be changed."
      />

      {/* WhatsApp */}
      <div className="space-y-1.5">
        <label className="block text-[13px] font-medium text-[var(--app-text)]">WhatsApp number</label>
        <div className="flex gap-2">
          <div className="relative shrink-0">
            <select
              value={selectedCountry.code}
              onChange={e => {
                const c = countryCodes.find(c => c.code === e.target.value);
                if (c) setSelectedCountry(c);
              }}
              className="h-10 w-24 appearance-none rounded-xl border bg-white pl-2 pr-6 text-[12px] text-[var(--app-text)] cursor-pointer focus:outline-none focus:ring-2 focus:ring-zinc-900/8"
              style={{ borderColor: 'var(--app-border)' }}
            >
              {countryCodes.map(c => (
                <option key={c.code} value={c.code}>{c.flag} {c.dialCode}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
          </div>
          <input
            type="tel"
            value={phoneNumber}
            onChange={e => { setPhoneNumber(e.target.value); setWaError(''); }}
            placeholder="98765 43210"
            className="h-10 flex-1 rounded-xl border px-3 text-[13px] text-[var(--app-text)] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/8"
            style={{ borderColor: 'var(--app-border)' }}
          />
        </div>
        {waError && <p className="text-xs text-red-500">{waError}</p>}
        <p className="text-[11px] text-[var(--app-text-muted)]">Customers contact you on this number to place orders.</p>
      </div>

      {/* Bio */}
      <Textarea
        label="Bio"
        value={form.bio}
        onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
        placeholder="Tell customers a bit about yourself..."
      />

      {/* Save */}
      {saveError && <p className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-[11px] font-medium text-red-600">{saveError}</p>}

      <button
        type="submit"
        disabled={isSaving}
        className="flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 text-[12px] font-semibold text-white transition-colors hover:bg-zinc-800 disabled:opacity-60"
      >
        {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
        {isSaving ? 'Saving…' : 'Save changes'}
      </button>

      {saveStatus === 'saved' && (
        <p className="flex items-center justify-center gap-1.5 text-[12px] font-medium text-emerald-700">
          <CheckCircle2 className="w-3.5 h-3.5" /> Changes saved
        </p>
      )}
    </form>
  );
}
