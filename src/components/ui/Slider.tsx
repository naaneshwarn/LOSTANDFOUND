import React from 'react';

export interface SliderProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (val: number) => void;
  formatDisplay?: (val: number) => string;
  helperText?: string;
}

export const Slider: React.FC<SliderProps> = ({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  formatDisplay = (v) => `${v}%`,
  helperText,
}) => {
  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center text-xs">
        <span className="font-semibold text-slate-700 uppercase tracking-wider">{label}</span>
        <span className="font-mono font-bold text-brand-600 px-2 py-0.5 bg-brand-50 rounded border border-brand-200">
          {formatDisplay(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
      />
      {helperText && <p className="text-xs text-slate-500">{helperText}</p>}
    </div>
  );
};

export default Slider;
