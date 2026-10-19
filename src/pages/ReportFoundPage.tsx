import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useItems } from '../context/ItemsContext';
import { useNotifications } from '../context/NotificationContext';
import { ITEM_CATEGORIES, COMMON_CAMPUS_LOCATIONS, COMMON_COLORS } from '../lib/constants';
import { ItemCategory, SafeContactMethod } from '../types/item';
import { Input, Textarea, Select } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  PlusCircle,
  FileImage,
  UploadCloud,
  ShieldCheck,
  AlertCircle,
  MapPin,
  Calendar,
  Lock,
} from 'lucide-react';

export const ReportFoundPage: React.FC = () => {
  const { user } = useAuth();
  const { reportFoundItem } = useItems();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<ItemCategory>('Electronics');
  const [description, setDescription] = useState<string>('');
  const [brand, setBrand] = useState<string>('');
  const [color, setColor] = useState<string>('White');
  const [identifyingMarks, setIdentifyingMarks] = useState<string>('');
  const [locationFound, setLocationFound] = useState<string>(COMMON_CAMPUS_LOCATIONS[0]);
  const [dateFound, setDateFound] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [safeContactMethod, setSafeContactMethod] = useState<SafeContactMethod>('in_app');

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(
    'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80'
  );
  const [imageError, setImageError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setImageError('File size exceeds 5MB limit.');
      return;
    }
    if (!file.type.startsWith('image/')) {
      setImageError('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !locationFound.trim() || !imagePreview) {
      showToast({
        type: 'warning',
        title: 'Missing Required Fields',
        message: 'Please complete all required fields and provide an item photo.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await reportFoundItem(
        {
          finderId: user?.id || 'guest_finder',
          finderName: user?.fullName || 'Good Samaritan',
          finderEmail: user?.email || 'finder@university.edu',
          title: title.trim(),
          category,
          description: description.trim(),
          brand: brand.trim() || undefined,
          color: color.trim() || undefined,
          identifyingMarks: identifyingMarks.trim() || undefined,
          locationFound: locationFound.trim(),
          dateFound,
          imageUrl: imagePreview,
          safeContactMethod,
        },
        imageFile || undefined
      );

      navigate('/found-items');
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Failed to List Found Item',
        message: (err as Error).message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="success" className="text-xs font-semibold gap-1">
            <PlusCircle className="h-3 w-3" />
            <span>Found Item Registration</span>
          </Badge>
          <span className="text-xs text-slate-400">• Community Handover</span>
        </div>
        <h1 className="text-3xl font-extrabold text-navy-900 tracking-tight">
          Report a Found Belonging
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Thank you for your honesty. Our AI matching model will index this item to notify students searching for it.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        {/* Section 1: Photograph */}
        <div className="space-y-4">
          <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-navy-900 flex items-center gap-2">
              <FileImage className="h-4 w-4 text-brand-600" />
              <span>1. Photograph of Discovered Item</span>
            </h2>
            <span className="text-xs text-slate-400">Used for Vector Extraction</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-5">
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center group shadow-inner">
                {imagePreview ? (
                  <>
                    <img
                      src={imagePreview}
                      alt="Found item preview"
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
                    <p className="text-xs font-medium">Upload photo</p>
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-7 space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
                <label className="block">
                  <span className="text-xs font-bold text-navy-900 uppercase tracking-wider block mb-1">
                    Upload Photograph:
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
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>{imageError}</span>
                  </p>
                )}
                <p className="text-[11px] text-slate-500">
                  Tip: Avoid photographing sensitive personal data such as full credit card digits or social security numbers.
                </p>
              </div>

              <div>
                <Input
                  label="Or enter direct image URL:"
                  value={imagePreview}
                  onChange={(e) => {
                    setImagePreview(e.target.value);
                    setImageFile(null);
                  }}
                  className="text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Details */}
        <div className="space-y-4 pt-4">
          <div className="pb-2 border-b border-slate-100">
            <h2 className="text-base font-bold text-navy-900">
              2. Item Identity & Category
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Item Title *"
              placeholder="e.g. Apple AirPods Pro 2 in MagSafe Case"
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
              placeholder="e.g. Apple, Patagonia, Hydro Flask"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            />

            <Select
              label="Color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              options={COMMON_COLORS.map((c) => ({ value: c, label: c }))}
            />
          </div>

          <Textarea
            label="Public Description *"
            placeholder="Describe where and when you found it, general condition, and how the owner can safely recover it..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            required
          />

          <Input
            label="Withheld Identifying Marks (For Verifying Claimant)"
            placeholder="e.g. Specific keychain engraving, lock screen photo, internal label name"
            value={identifyingMarks}
            onChange={(e) => setIdentifyingMarks(e.target.value)}
            helperText="Keep this confidential to verify that the person contacting you is the authentic owner."
          />
        </div>

        {/* Section 3: Location & Handover */}
        <div className="space-y-4 pt-4">
          <div className="pb-2 border-b border-slate-100">
            <h2 className="text-base font-bold text-navy-900">
              3. Found Location & Safe Handover Preference
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Found Location *"
              placeholder="e.g. Main Library, 2nd Floor Study Commons"
              value={locationFound}
              onChange={(e) => setLocationFound(e.target.value)}
              required
            />

            <Input
              label="Date Found *"
              type="date"
              value={dateFound}
              onChange={(e) => setDateFound(e.target.value)}
              required
            />

            <div className="sm:col-span-2">
              <Select
                label="Safe Handover Method *"
                value={safeContactMethod}
                onChange={(e) => setSafeContactMethod(e.target.value as SafeContactMethod)}
                options={[
                  { value: 'in_app', label: 'In-App Secure Messaging (Coordinate on Campus)' },
                  { value: 'campus_security', label: 'Turned into Campus Safety / Lost Property Desk' },
                  { value: 'secure_dropoff', label: 'Designated Secure Campus Drop-off Box' },
                ]}
                helperText="Your contact details are kept strictly anonymous. Claimants message you inside the platform."
              />
            </div>
          </div>
        </div>

        {/* Submission */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Lock className="h-4 w-4 text-brand-600 shrink-0" />
            <span>Listing is secured and indexed immediately into our AI cosine search bank.</span>
          </div>

          <Button
            type="submit"
            size="lg"
            variant="primary"
            isLoading={isSubmitting}
            className="w-full sm:w-auto font-bold gap-2 text-base px-8 shadow-md"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Publish Found Listing</span>
          </Button>
        </div>
      </form>
    </div>
  );
};
