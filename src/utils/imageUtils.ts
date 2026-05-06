// Utility functions for image manipulation and filtering

export interface FilterPreset {
  name: string;
  icon: string;
  filters: {
    brightness: number;
    contrast: number;
    saturation: number;
    hue: number;
    blur: number;
  };
}

export const FILTER_PRESETS: FilterPreset[] = [
  {
    name: 'Normal',
    icon: '⭐',
    filters: {
      brightness: 100,
      contrast: 100,
      saturation: 100,
      hue: 0,
      blur: 0,
    },
  },
  {
    name: 'B&N',
    icon: '🩶',
    filters: {
      brightness: 100,
      contrast: 120,
      saturation: 0,
      hue: 0,
      blur: 0,
    },
  },
  {
    name: 'Sepia',
    icon: '🟤',
    filters: {
      brightness: 100,
      contrast: 110,
      saturation: 80,
      hue: 30,
      blur: 0,
    },
  },
  {
    name: 'Vivid',
    icon: '🎨',
    filters: {
      brightness: 105,
      contrast: 130,
      saturation: 150,
      hue: 0,
      blur: 0,
    },
  },
  {
    name: 'Cool',
    icon: '❄️',
    filters: {
      brightness: 100,
      contrast: 100,
      saturation: 100,
      hue: 240,
      blur: 0,
    },
  },
  {
    name: 'Warm',
    icon: '🔥',
    filters: {
      brightness: 110,
      contrast: 100,
      saturation: 100,
      hue: 30,
      blur: 0,
    },
  },
  {
    name: 'Soft',
    icon: '☁️',
    filters: {
      brightness: 110,
      contrast: 80,
      saturation: 90,
      hue: 0,
      blur: 1,
    },
  },
  {
    name: 'Vintage',
    icon: '📽️',
    filters: {
      brightness: 95,
      contrast: 90,
      saturation: 70,
      hue: 40,
      blur: 0,
    },
  },
];

export const aspectRatios = [
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '16:9', value: 16 / 9 },
  { label: '9:16', value: 9 / 16 },
];

export function formatDate(date: Date): string {
  return date.toISOString().replace(/[:.]/g, '-');
}
