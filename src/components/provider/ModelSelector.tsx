'use client';

import { useChatStore } from '@/lib/store';
import { getModelsByCategory } from '@/lib/ollama-models';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Cpu } from 'lucide-react';

export function ModelSelector() {
  const { selectedModel, setSelectedModel } = useChatStore();
  const modelsByCategory = getModelsByCategory();

  return (
    <div className="flex items-center gap-2.5">
      <div className="flex items-center gap-1.5 text-xs text-white/40">
        <Cpu className="h-3.5 w-3.5 text-purple-400" strokeWidth={1.5} />
        <span className="font-semibold tracking-wide uppercase">Model:</span>
      </div>
      <Select value={selectedModel} onValueChange={setSelectedModel}>
        <SelectTrigger className="h-8 flex-1 glass-subtle border-white/[0.06] text-xs rounded-lg text-white/70 focus:ring-blue-400/20 focus:border-blue-400/20">
          <SelectValue placeholder="Pilih model..." />
        </SelectTrigger>
        <SelectContent className="max-h-[280px] glass-strong border-white/[0.06] bg-[rgba(10,10,25,0.92)]">
          {Object.entries(modelsByCategory).map(([category, models]) => (
            <SelectGroup key={category}>
              <SelectLabel className="text-[10px] font-bold uppercase tracking-widest text-white/30 px-2 py-1.5">
                {category}
              </SelectLabel>
              {models.map((model) => (
                <SelectItem key={model.name} value={model.name} className="text-xs py-2.5 text-white/70 focus:bg-blue-500/10 focus:text-blue-300 rounded-md">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-white/80">{model.name}</span>
                    <span className="text-[10px] text-white/30">
                      {model.desc}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
