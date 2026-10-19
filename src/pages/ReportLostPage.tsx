import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useItems } from '../context/ItemsContext';
import { useNotifications } from '../context/NotificationContext';
import { ITEM_CATEGORIES, COMMON_CAMPUS_LOCATIONS, COMMON_COLORS, SampleReportPreset } from '../lib/constants';
import { ItemCategory, ContactPreference } from '../types/item';
import { SampleItemPicker } from '../components/items/SampleItemPicker';
import { Input, Textarea, Select } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  UploadCloud,
  Search,
  Sparkles,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  ShieldCheck,
  AlertCircle,
  FileImage,
  X,
} from 'lucide-react';

export const ReportLostPage: React.FC = () => {
  const { user } = useAuth();
  const { reportLostItem } = useItems();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  // Form State
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<ItemCategory>('Bags');
  const [description, setDescription] = useState<string>('');
  const [brand, setBrand] = useState<string>('');
  const [color, setColor] = useState<string>('Black');
  const [identifyingMarks, setIdentifyingMarks] = useState<string>('');
  const [locationLost, setLocationLost] = useState<string>(COMMON_CAMPUS_LOCATIONS[1]);
  const [dateLost, setDateLost] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [timeLost, setTimeLost] = useState<string>('2:30 PM');
  const [rewardAmount, setRewardAmount] = useState<string>('25');
  const [contactPreference, setContactPreference] = useState<ContactPreference>('in_app');

  // Image Upload State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80'
  );
  const [imageError, setImageError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('sample-backpack');

  // Handle Preset Quick-Fill
  const handleSelectPreset = (preset: SampleReportPreset) => {
    setSelectedPresetId(preset.id);
    setTitle(preset.name);
    setCategory(preset.category);
    setDescription(preset.description);
    setBrand(preset.brand);
    setColor(preset.color);
    setIdentifyingMarks(preset.identifyingMarks);
    setLocationLost(preset.locationLost);
    setImagePreview(preset.imageUrl);
    setImageFile(null); // using preset URL
    setRewardAmount(preset.rewardAmount.toString());
    setImageError('');
    showToast({
      type: 'info',
      title: 'Sample Item Autofilled',
      message: `Selected "${preset.name}". Submit to see instant AI visual match!`,
    });
  };

  // Image File Upload Validator
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError('');
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setImageError('File size exceeds 5MB limit. Please upload a smaller image.');
      return;
    }

    // Validate MIME type
    if (!file.type.startsWith('image/')) {
      setImageError('Only image files (JPG, PNG, WebP) are accepted.');
      return;
    }

    setImageFile(file);
    setSelectedPresetId('');
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !locationLost.trim() || !imagePreview) {
      showToast({
        type: 'warning',
        title: 'Missing Required Fields',
        message: 'Please fill in the item name, description, location, and upload a photograph.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await reportLostItem(
        {
          userId: user?.id || 'guest_user',
          userName: user?.fullName || 'Anonymous Reporter',
          userEmail: user?.email || 'guest@university.edu',
          title: title.trim(),
          category,
          description: description.trim(),
          brand: brand.trim() || undefined,
          color: color.trim() || undefined,
          identifyingMarks: identifyingMarks.trim() || undefined,
          locationLost: locationLost.trim(),
          dateLost,
          timeLost: timeLost.trim() || undefined,
          imageUrl: imagePreview,
          rewardAmount: Number(rewardAmount) || 0,
          contactPreference,
        },
        imageFile || undefined
      );

      // Redirect immediately to AI Match Results Page for this lost item!
      navigate(`/matches/${result.item.id}`);
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Submission Failed',
        message: (err as Error).message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="danger" className="text-xs font-semibold gap-1">
            <Search className="h-3 w-3" />
            <span>Lost Belonging Form</span>
          </Badge>
          <span className="text-xs text-slate-400">• Step 1 of 2</span>
        </div>
        <h1 className="text-3xl font-extrabold text-navy-900 tracking-tight">
          Report a Lost Item & Find Visual Matches
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Our AI vision pipeline will immediately compute cosine similarity against found items once you submit.
        </p>
      </div>

      {/* 1-Click Sample Item Selector */}
      <SampleItemPicker
        selectedId={selectedPresetId}
        onSelect={handleSelectPreset}
      />

      {/* Main Reporting Form */}
      <form onSubmit={handleSubmit} className="space-y-8 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        {/* Section 1: Item Photograph */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-base font-bold text-navy-900 flex items-center gap-2">
              <FileImage className="h-4 w-4 text-brand-600" />
              <span>1. Item Photograph & Visual Verification</span>
            </h2>
            <span className="text-xs text-slate-400">Required for AI Vector Extraction</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Image Preview Box */}
            <div className="md:col-span-5">
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center group shadow-inner">
                {imagePreview ? (
                  <>
                    <img
                      src={imagePreview}
                      alt="Item preview"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <label className="cursor-pointer bg-white text-slate-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow-md hover:bg-slate-100 transition-colors">
                        Change Photo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6 text-slate-400">
                    <UploadCloud className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                    <p className="text-xs font-medium">No photograph selected</p>
                  </div>
                )}
              </div>
            </div>

            {/* Upload Controls & Format Notes */}
            <div className="md:col-span-7 space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
                <label className="block">
                  <span className="text-xs font-bold text-navy-900 uppercase tracking-wider block mb-1">
                    Upload from your device:
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer"
                  />
                </label>

                {imageError && (
                  <p className="text-xs text-rose-600 font-medium flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{imageError}</span>
                  </p>
                )}

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Supported formats: JPG, PNG, WebP (Max 5MB). For optimal cosine vector matching, ensure good lighting and clear view of logos or identifying features.
                </p>
              </div>

              {/* Custom Image URL Option */}
              <div>
                <Input
                  label="Or enter direct image URL:"
                  value={imagePreview}
                  onChange={(e) => {
                    setImagePreview(e.target.value);
                    setImageFile(null);
                  }}
                  placeholder="https://images.unsplash.com/..."
                  className="text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Core Details */}
        <div className="space-y-4 pt-4">
          <div className="pb-2 border-b border-slate-100">
            <h2 className="text-base font-bold text-navy-900">
              2. Item Identity & Category
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Item Name / Headline *"
              placeholder="e.g. Black North Face Borealis Backpack"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <Select
              label="Category *"
              value={category}
              onChange={(e) => setCategory(e.target.value as ItemCategory)}
              options={ITEM_CATEGORIES.map((c) => ({ value: c, label: c }))}
            />

            <Input
              label="Brand / Manufacturer"
              placeholder="e.g. Apple, The North Face, Hydro Flask"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            />

            <Select
              label="Primary Color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              options={COMMON_COLORS.map((c) => ({ value: c, label: c }))}
            />
          </div>

          <Textarea
            label="Detailed Description *"
            placeholder="Describe condition, contents, stickers, or specific marks that distinguish your item..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            required
          />

          <Input
            label="Secret Identifying Marks (Used for Verification)"
            placeholder="e.g. Red cord on main zipper, faint scratch on corner, initials inside pocket"
            value={identifyingMarks}
            onChange={(e) => setIdentifyingMarks(e.target.value)}
            helperText="These details help verify your ownership when contacting a finder."
          />
        </div>

        {/* Section 3: Location & Time */}
        <div className="space-y-4 pt-4">
          <div className="pb-2 border-b border-slate-100">
            <h2 className="text-base font-bold text-navy-900">
              3. Last-Seen Location & Timeline
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <Input
                label="Last Seen Location *"
                placeholder="e.g. Science Building, Room 302"
                value={locationLost}
                onChange={(e) => setLocationLost(e.target.value)}
                required
              />
            </div>

            <div className="sm:col-span-1">
              <Input
                label="Date Lost *"
                type="date"
                value={dateLost}
                onChange={(e) => setDateLost(e.target.value)}
                required
              />
            </div>

            <div className="sm:col-span-1">
              <Input
                label="Approximate Time"
                placeholder="e.g. 2:30 PM"
                value={timeLost}
                onChange={(e) => setTimeLost(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Section 4: Reward & Preferences */}
        <div className="space-y-4 pt-4">
          <div className="pb-2 border-b border-slate-100">
            <h2 className="text-base font-bold text-navy-900">
              4. Recovery Reward & Communication
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Optional Recovery Reward ($ USD)"
              type="number"
              min="0"
              placeholder="0"
              value={rewardAmount}
              onChange={(e) => setRewardAmount(e.target.value)}
              helperText="Optional monetary appreciation for the person who finds your item."
            />

            <Select
              label="Contact Channel Preference"
              value={contactPreference}
              onChange={(e) => setContactPreference(e.target.value as ContactPreference)}
              options={[
                { value: 'in_app', label: 'In-App Secure Messaging (Recommended)' },
                { value: 'finder_choice', label: 'Finder Choice (Campus Security Handover)' },
              ]}
              helperText="Your personal phone and email remain private and protected."
            />
          </div>
        </div>

        {/* Form Submission Bar */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Reports are encrypted and protected by PostgreSQL Row Level Security.</span>
          </div>

          <Button
            type="submit"
            size="lg"
            variant="primary"
            isLoading={isSubmitting}
            className="w-full sm:w-auto font-bold gap-2 text-base px-8 shadow-md"
          >
            <Sparkles className="h-4 w-4" />
            <span>Generate Embedding & Scan Matches</span>
          </Button>
        </div>
      </form>
    </div>
  );
};
