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
    <form onSubmit={handleSave} className="space-y-5">

      {/* Avatar row */}
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          {form.avatarUrl ? (
            <img
              src={form.avatarUrl}
              alt="Avatar"
              className="w-16 h-16 rounded-full object-cover border border-zinc-200"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-[#059669] flex items-center justify-center text-white text-xl font-bold">
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
          <p className="text-sm font-semibold text-zinc-900">{displayName}</p>
          <p className="text-xs text-zinc-400">@{form.username || user?.username}</p>
          <label
            htmlFor="avatar-upload"
            className="mt-2 inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-lg border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 cursor-pointer transition-colors"
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
        <label className="block text-sm font-medium text-zinc-700">WhatsApp number</label>
        <div className="flex gap-2">
          <div className="relative shrink-0">
            <select
              value={selectedCountry.code}
              onChange={e => {
                const c = countryCodes.find(c => c.code === e.target.value);
                if (c) setSelectedCountry(c);
              }}
              className="h-10 w-24 rounded-lg border border-zinc-200 bg-white pl-2 pr-6 text-sm focus:outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10 appearance-none cursor-pointer"
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
            className="flex-1 h-10 px-3 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10 placeholder:text-zinc-400"
          />
        </div>
        {waError && <p className="text-xs text-red-500">{waError}</p>}
        <p className="text-xs text-zinc-400">Customers contact you on this number to place orders.</p>
      </div>

      {/* Bio */}
      <Textarea
        label="Bio"
        value={form.bio}
        onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
        placeholder="Tell customers a bit about yourself..."
      />

      {/* Save */}
      {saveError && <p className="text-xs font-medium text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-100">{saveError}</p>}

      <button
        type="submit"
        disabled={isSaving}
        className="w-full h-9 rounded-lg bg-zinc-900 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-zinc-700 transition-colors disabled:opacity-60"
      >
        {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
        {isSaving ? 'Saving…' : 'Save changes'}
      </button>

      {saveStatus === 'saved' && (
        <p className="text-sm font-medium text-emerald-700 flex items-center gap-1.5 justify-center">
          <CheckCircle2 className="w-3.5 h-3.5" /> Changes saved
        </p>
      )}
    </form>
  );
}
