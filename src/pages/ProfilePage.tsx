import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { User, Mail, Shield, Phone, LogOut, Check } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();
  const { showToast } = useNotifications();

  const [fullName, setFullName] = useState<string>(user?.fullName || '');
  const [avatarUrl, setAvatarUrl] = useState<string>(user?.avatarUrl || '');
  const [phoneObfuscated, setPhoneObfuscated] = useState<string>(
    user?.phoneObfuscated || ''
  );
  const [isSaving, setIsSaving] = useState<boolean>(false);

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-navy-900">Please Sign In</h2>
        <p className="text-xs text-slate-500">You must be signed in to view your profile.</p>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        fullName: fullName.trim(),
        avatarUrl: avatarUrl.trim() || undefined,
        phoneObfuscated: phoneObfuscated.trim() || undefined,
      });
      showToast({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your profile changes have been saved.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-navy-900 tracking-tight">
          User Profile & Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your identity and privacy preferences on LOSTANDFOUND AI.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        {/* Avatar Display */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={user.fullName}
              className="h-16 w-16 rounded-2xl object-cover border border-slate-200 shadow-sm"
            />
          ) : (
            <div className="h-16 w-16 rounded-2xl bg-brand-100 text-brand-800 font-extrabold flex items-center justify-center text-xl">
              {user.fullName.slice(0, 2).toUpperCase()}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-navy-900">{user.fullName}</h2>
              <Badge variant={user.role === 'admin' ? 'navy' : 'secondary'} className="text-[10px]">
                {user.role.toUpperCase()}
              </Badge>
            </div>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <Input
            label="Email Address (Read Only)"
            value={user.email}
            disabled
            helperText="Account email cannot be modified directly."
          />

          <Input
            label="Avatar Photo URL"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://images.unsplash.com/..."
          />

          <Input
            label="Recovery Verification Contact (Obfuscated)"
            value={phoneObfuscated}
            onChange={(e) => setPhoneObfuscated(e.target.value)}
            placeholder="+1 (555) ***-4821"
            helperText="Stored securely and only displayed in obfuscated form to prevent spam."
          />

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={logout}
              className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 gap-1.5"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </Button>

            <Button
              type="submit"
              variant="primary"
              isLoading={isSaving}
              className="text-xs font-bold gap-1.5 shadow-sm"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Save Changes</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
