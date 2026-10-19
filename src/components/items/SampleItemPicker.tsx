import React from 'react';
import { SAMPLE_LOST_PRESETS, SampleReportPreset } from '../../lib/constants';
import { Sparkles, ArrowRight } from 'lucide-react';

export const SampleItemPicker: React.FC<{
  onSelect: (preset: SampleReportPreset) => void;
  selectedId?: string;
}> = ({ onSelect, selectedId }) => {
  return (
    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 via-blue-50/40 to-slate-50 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-brand-600" />
          <h3 className="text-sm font-bold text-navy-900">
            Quick-Fill Sample Items for Instant AI Testing
          </h3>
        </div>
        <span className="text-[11px] font-semibold text-brand-600 bg-brand-100 px-2 py-0.5 rounded-full">
          1-Click Autofill
        </span>
      </div>
      <p className="text-xs text-slate-500 mb-4 leading-relaxed">
        Click any verified campus item below to automatically populate the form with realistic high-resolution photographs, brand data, and location tags to test visual embedding matching immediately:
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {SAMPLE_LOST_PRESETS.map((preset) => {
          const isSelected = selectedId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelect(preset)}
              className={`group relative rounded-xl border p-2.5 text-left transition-all bg-white flex flex-col justify-between ${
                isSelected
                  ? 'border-brand-600 ring-2 ring-brand-500/20 shadow-md'
                  : 'border-slate-200 hover:border-brand-300 hover:shadow-sm'
              }`}
            >
              <div className="aspect-square w-full rounded-lg overflow-hidden bg-slate-100 mb-2">
                <img
                  src={preset.imageUrl}
                  alt={preset.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div>
                <p className="text-[11px] font-bold text-navy-900 line-clamp-1 leading-snug">
                  {preset.name}
                </p>
                <p className="text-[10px] text-slate-500 line-clamp-1">
                  {preset.category} • {preset.color}
                </p>
              </div>
              <div className="mt-2 pt-1 border-t border-slate-100 flex items-center justify-between text-[10px] text-brand-600 font-semibold group-hover:translate-x-0.5 transition-transform">
                <span>Select</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
