import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Shuffle, SkipBack, SkipForward, Zap } from 'lucide-react';

interface ControlsProps {
  arraySize: number;
  onArraySizeChange: (size: number) => void;
  order: 'asc' | 'desc';
  onOrderChange: (order: 'asc' | 'desc') => void;
  isPlaying: boolean;
  onPlayPause: () => void;
  onRandomize: () => void;
  onStepBack: () => void;
  onStepForward: () => void;
  canStepBack: boolean;
  canStepForward: boolean;
  targetValue?: number;
  onTargetChange?: (value: number) => void;
  showTargetInput?: boolean;
  speed: number;
  onSpeedChange: (speed: number) => void;
}

export function Controls({
  arraySize,
  onArraySizeChange,
  order,
  onOrderChange,
  isPlaying,
  onPlayPause,
  onRandomize,
  onStepBack,
  onStepForward,
  canStepBack,
  canStepForward,
  targetValue,
  onTargetChange,
  showTargetInput = false,
  speed,
  onSpeedChange
}: ControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
      <div className="flex items-center gap-2">
        <Label htmlFor="arraySize" className="text-sm font-medium text-slate-700 whitespace-nowrap">
          Array size:
        </Label>
        <Input
          id="arraySize"
          type="number"
          min={2}
          max={50}
          value={arraySize}
          onChange={(e) => onArraySizeChange(parseInt(e.target.value) || 2)}
          className="w-20 h-9"
        />
      </div>

      {showTargetInput && (
        <div className="flex items-center gap-2">
          <Label htmlFor="target" className="text-sm font-medium text-slate-700 whitespace-nowrap">
            Target:
          </Label>
          <Input
            id="target"
            type="number"
            value={targetValue || ''}
            onChange={(e) => onTargetChange?.(parseInt(e.target.value) || 0)}
            className="w-20 h-9"
          />
        </div>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={onRandomize}
        className="flex items-center gap-2"
      >
        <Shuffle className="w-4 h-4" />
        Randomize
      </Button>

      <div className="flex items-center gap-3 min-w-[140px] px-2">
        <Zap className={`w-4 h-4 ${speed < 300 ? 'text-yellow-500 fill-yellow-500' : 'text-slate-400'}`} />
        <div className="flex-1 flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Speed</Label>
            <span className="text-[10px] font-mono text-slate-500">{speed}ms</span>
          </div>
          <Slider
            value={[1050 - speed]} // Invert so right is faster (smaller interval)
            min={50}
            max={1000}
            step={50}
            onValueChange={([val]) => onSpeedChange(1050 - val)}
            className="w-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium text-slate-700 whitespace-nowrap">
          Order:
        </Label>
        <Select value={order} onValueChange={(v) => onOrderChange(v as 'asc' | 'desc')}>
          <SelectTrigger className="w-32 h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Ascending</SelectItem>
            <SelectItem value="desc">Descending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <Button
          variant="outline"
          size="icon"
          onClick={onStepBack}
          disabled={!canStepBack || isPlaying}
          className="h-9 w-9"
        >
          <SkipBack className="w-4 h-4" />
        </Button>

        <Button
          variant={isPlaying ? "secondary" : "default"}
          size="sm"
          onClick={onPlayPause}
          className="flex items-center gap-2 min-w-[100px]"
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Auto Play
            </>
          )}
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={onStepForward}
          disabled={!canStepForward || isPlaying}
          className="h-9 w-9"
        >
          <SkipForward className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
