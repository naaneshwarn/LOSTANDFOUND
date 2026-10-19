import React from 'react';
import { RankingWeights } from '../../types/matching';
import { WEIGHT_PRESETS } from '../../lib/constants';
import { Slider } from '../ui/Slider';
import { Button } from '../ui/Button';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';

export interface RankingControlsProps {
  weights: RankingWeights;
  onChange: (weights: RankingWeights) => void;
  onReset: () => void;
}

export const RankingControls: React.FC<RankingControlsProps> = ({
  weights,
  onChange,
  onReset,
}) => {
  const handleSliderChange = (key: keyof RankingWeights, val: number) => {
    // val is 0-100, convert to decimal 0.0-1.0
    onChange({
      ...weights,
      [key]: val / 100,
    });
  };

  const applyPreset = (presetWeights: RankingWeights) => {
    onChange(presetWeights);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-brand-600" />
          <h3 className="text-sm font-bold text-navy-900">
            Multi-Signal Ranking Weights
          </h3>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={onReset}
          className="text-xs text-slate-500 hover:text-slate-800 gap-1 h-7"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Reset Defaults</span>
        </Button>
      </div>

      {/* Preset Pills */}
      <div>
        <span className="text-xs font-semibold text-slate-500 block mb-2">
          Ranking Presets:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {Object.entries(WEIGHT_PRESETS).map(([key, preset]) => {
            const isMatch =
              weights.visual === preset.weights.visual &&
              weights.category === preset.weights.category;

            return (
              <button
                key={key}
                type="button"
                onClick={() => applyPreset(preset.weights)}
                className={`p-2 rounded-xl text-left border transition-all text-xs ${
                  isMatch
                    ? 'border-brand-600 bg-brand-50/60 ring-1 ring-brand-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <p className="font-bold text-navy-900">{preset.label}</p>
                <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                  {preset.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Weight Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <Slider
          label="1. Visual Feature Weight"
          value={Math.round(weights.visual * 100)}
          onChange={(val) => handleSliderChange('visual', val)}
          helperText="Priority of pure cosine similarity from image embeddings"
        />

        <Slider
          label="2. Exact Category Match"
          value={Math.round(weights.category * 100)}
          onChange={(val) => handleSliderChange('category', val)}
          helperText="Bonus weighting if the reported category matches"
        />

        <Slider
          label="3. Location Proximity"
          value={Math.round(weights.location * 100)}
          onChange={(val) => handleSliderChange('location', val)}
          helperText="Weighting given to matching buildings or campus zones"
        />

        <Slider
          label="4. Temporal Decay (Date)"
          value={Math.round(weights.date * 100)}
          onChange={(val) => handleSliderChange('date', val)}
          helperText="Temporal affinity decay based on days between loss and discovery"
        />
      </div>
    </div>
  );
};
