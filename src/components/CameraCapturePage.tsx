import { useEffect, useRef, useState } from 'react';
import { useCamera } from '../hooks/useCamera';
import { FILTER_PRESETS } from '../utils/imageUtils';

interface ImageFilters {
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  blur: number;
  exposureTime: number;
  gain: number;
}

export default function CameraCapturePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [isMirrored, setIsMirrored] = useState(true);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [filters, setFilters] = useState<ImageFilters>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    hue: 0,
    blur: 0,
    exposureTime: 100,
    gain: 100,
  });

  const {
    isSupported,
    isEnabled,
    stream,
    cameras,
    selectedCameraId,
    enableCamera,
    disableCamera,
    setSelectedCameraId,
    error,
  } = useCamera(videoRef);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Auto-enable camera on mount
  useEffect(() => {
    if (isSupported && !isEnabled) {
      enableCamera();
    }

    return () => {
      disableCamera();
    };
  }, [isSupported, isEnabled, enableCamera, disableCamera]);

  const getFilterStyle = () => {
    const translatePart = zoom > 1 ? `translate(${panX}px, ${panY}px)` : '';
    return {
      filter: `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) hue-rotate(${filters.hue}deg) blur(${filters.blur}px)`,
      transform: isMirrored 
        ? `scaleX(-1) scale(${zoom}) ${translatePart}` 
        : `scale(${zoom}) ${translatePart}`,
    };
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas dimensions
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      // Apply transformations
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);

      if (isMirrored) {
        ctx.scale(-zoom, zoom);
      } else {
        ctx.scale(zoom, zoom);
      }

      ctx.translate(-canvas.width / 2, -canvas.height / 2);

      // Draw video
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      // Apply filters using canvas
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      applyFiltersToCanvas(imageData, filters);
      ctx.putImageData(imageData, 0, 0);

      ctx.restore();

      // Convert to image and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `capture-${new Date().toISOString().replace(/[:.]/g, '-')}.jpg`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }, 'image/jpeg', 0.95);
    } catch (err) {
      console.error('Capture error:', err);
      alert('Error capturando imagen');
    }
  };

  const applyFiltersToCanvas = (imageData: ImageData, filters: ImageFilters) => {
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // Exposure Time (controla la exposición general)
      r = Math.min(255, (r * filters.exposureTime) / 100);
      g = Math.min(255, (g * filters.exposureTime) / 100);
      b = Math.min(255, (b * filters.exposureTime) / 100);

      // Gain (amplifica la señal)
      r = Math.min(255, (r * filters.gain) / 100);
      g = Math.min(255, (g * filters.gain) / 100);
      b = Math.min(255, (b * filters.gain) / 100);

      // Brightness
      r = Math.min(255, (r * filters.brightness) / 100);
      g = Math.min(255, (g * filters.brightness) / 100);
      b = Math.min(255, (b * filters.brightness) / 100);

      // Contrast
      const contrast = (filters.contrast - 100) / 100;
      r = Math.min(255, Math.max(0, r + (r - 128) * contrast));
      g = Math.min(255, Math.max(0, g + (g - 128) * contrast));
      b = Math.min(255, Math.max(0, b + (b - 128) * contrast));

      // Saturation (convertir a HSL)
      const [h, s, l] = rgbToHsl(r, g, b);
      const newS = Math.min(100, (s * filters.saturation) / 100);
      const newH = (h + filters.hue) % 360;
      const [newR, newG, newB] = hslToRgb(newH, newS, l);

      data[i] = newR;
      data[i + 1] = newG;
      data[i + 2] = newB;
    }
  };

  const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return [h * 360, s * 100, l * 100];
  };

  const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
    h = (h % 360) / 360;
    s = s / 100;
    l = l / 100;

    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  };

  const handleResetFilters = () => {
    setFilters({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      hue: 0,
      blur: 0,
      exposureTime: 100,
      gain: 100,
    });
  };

  const handlePan = (direction: 'up' | 'down' | 'left' | 'right') => {
    const panSpeed = 20;
    switch (direction) {
      case 'up':
        setPanY(prev => prev + panSpeed);
        break;
      case 'down':
        setPanY(prev => prev - panSpeed);
        break;
      case 'left':
        setPanX(prev => prev + panSpeed);
        break;
      case 'right':
        setPanX(prev => prev - panSpeed);
        break;
    }
  };

  const handleResetPan = () => {
    setPanX(0);
    setPanY(0);
  };

  if (!isSupported) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black">
        <div className="p-6 bg-red-600/10 border border-red-600/30 rounded-lg text-red-300 text-center">
          <p className="text-lg font-semibold mb-2">📷 Cámara no soportada</p>
          <p className="text-sm">Tu navegador no soporta acceso a la cámara</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-black flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-black border-b border-gray-700 px-4 py-3">
        <h1 className="text-xl font-bold text-white">📷 Captura de Cámara</h1>
        <p className="text-xs text-gray-400 mt-1">Ajusta los filtros y captura imágenes con precisión</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        {/* Camera Preview Area */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          {/* Video Stream */}
          <div className="flex-1 rounded-xl overflow-hidden bg-gray-900 border border-gray-700 shadow-2xl relative flex items-center justify-center group">
            {isEnabled && stream ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                  style={getFilterStyle()}
                />
                {/* Camera Indicator */}
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-lg border border-green-500/30">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs font-semibold text-green-300">EN VIVO</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-500">
                <p className="text-4xl mb-2">📷</p>
                <p className="text-sm">Cargando cámara...</p>
              </div>
            )}
          </div>

          {/* Camera Selector */}
          {cameras.length > 1 && (
            <div className="flex gap-2">
              <label className="text-xs font-semibold text-gray-400 flex items-center">
                Cámara:
              </label>
              <select
                value={selectedCameraId}
                onChange={(e) => setSelectedCameraId(e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-800/60 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                {cameras.map((camera) => (
                  <option key={camera.deviceId} value={camera.deviceId}>
                    {camera.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleCapture}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-blue-500/50 active:scale-95"
            >
              📸 Capturar
            </button>
            <button
              onClick={() => setIsMirrored(!isMirrored)}
              className="px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700"
              title="Voltear imagen"
            >
              🔄
            </button>
          </div>
        </div>

        {/* Controls Panel */}
        <div className="w-80 bg-gray-900/50 border border-gray-700 rounded-xl p-4 overflow-y-auto max-h-full">
          <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            ⚙️ Ajustes
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-xs">
              {error}
            </div>
          )}

          {/* Zoom Control */}
          <div className="mb-5">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-gray-300">Zoom</label>
              <span className="text-xs font-mono bg-gray-800 px-2 py-1 rounded text-blue-300">
                {zoom.toFixed(1)}x
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="4"
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setZoom(1)}
                className="text-xs px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition-colors"
              >
                1x
              </button>
              <button
                onClick={() => setZoom(2)}
                className="text-xs px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition-colors"
              >
                2x
              </button>
              <button
                onClick={() => setZoom(3)}
                className="text-xs px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition-colors"
              >
                3x
              </button>
            </div>
          </div>

          {/* Pan Controls - Only show when zoomed in */}
          {zoom > 1 && (
            <div className="mb-5 p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <label className="text-xs font-semibold text-gray-300">📍 Desplazar</label>
                <button
                  onClick={handleResetPan}
                  className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
                >
                  Resetear
                </button>
              </div>
              {/* Arrow Buttons Grid */}
              <div className="grid grid-cols-3 gap-2 mb-2">
                {/* Empty cell */}
                <div />
                {/* Up Arrow */}
                <button
                  onClick={() => handlePan('up')}
                  className="py-2 px-2 bg-blue-600/40 hover:bg-blue-600/60 text-blue-300 rounded transition-colors border border-blue-600/50 font-bold text-sm"
                >
                  ↑
                </button>
                {/* Empty cell */}
                <div />
                
                {/* Left Arrow */}
                <button
                  onClick={() => handlePan('left')}
                  className="py-2 px-2 bg-blue-600/40 hover:bg-blue-600/60 text-blue-300 rounded transition-colors border border-blue-600/50 font-bold text-sm"
                >
                  ←
                </button>
                {/* Center indicator */}
                <div className="py-2 px-2 bg-gray-700/50 rounded text-center">
                  <span className="text-xs text-gray-400">●</span>
                </div>
                {/* Right Arrow */}
                <button
                  onClick={() => handlePan('right')}
                  className="py-2 px-2 bg-blue-600/40 hover:bg-blue-600/60 text-blue-300 rounded transition-colors border border-blue-600/50 font-bold text-sm"
                >
                  →
                </button>
                
                {/* Empty cell */}
                <div />
                {/* Down Arrow */}
                <button
                  onClick={() => handlePan('down')}
                  className="py-2 px-2 bg-blue-600/40 hover:bg-blue-600/60 text-blue-300 rounded transition-colors border border-blue-600/50 font-bold text-sm"
                >
                  ↓
                </button>
                {/* Empty cell */}
                <div />
              </div>
              <p className="text-xs text-gray-400 text-center">Pan: {panX}, {panY}</p>
            </div>
          )}
          <div className="mb-5">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-gray-300">☀️ Brillo</label>
              <span className="text-xs font-mono bg-gray-800 px-2 py-1 rounded text-yellow-300">
                {filters.brightness}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              step="5"
              value={filters.brightness}
              onChange={(e) =>
                setFilters({ ...filters, brightness: parseInt(e.target.value) })
              }
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Contrast */}
          <div className="mb-5">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-gray-300">⚡ Contraste</label>
              <span className="text-xs font-mono bg-gray-800 px-2 py-1 rounded text-amber-300">
                {filters.contrast}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              step="5"
              value={filters.contrast}
              onChange={(e) =>
                setFilters({ ...filters, contrast: parseInt(e.target.value) })
              }
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Saturation */}
          <div className="mb-5">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-gray-300">🎨 Saturación</label>
              <span className="text-xs font-mono bg-gray-800 px-2 py-1 rounded text-green-300">
                {filters.saturation}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              step="5"
              value={filters.saturation}
              onChange={(e) =>
                setFilters({ ...filters, saturation: parseInt(e.target.value) })
              }
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Hue */}
          <div className="mb-5">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-gray-300">🌈 Color</label>
              <span className="text-xs font-mono bg-gray-800 px-2 py-1 rounded text-purple-300">
                {filters.hue}°
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              step="5"
              value={filters.hue}
              onChange={(e) => setFilters({ ...filters, hue: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Blur */}
          <div className="mb-5">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-gray-300">🌫️ Desenfoque</label>
              <span className="text-xs font-mono bg-gray-800 px-2 py-1 rounded text-cyan-300">
                {filters.blur}px
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={filters.blur}
              onChange={(e) => setFilters({ ...filters, blur: parseFloat(e.target.value) })}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Exposure Time */}
          <div className="mb-5">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-gray-300">⏱️ Exposure</label>
              <span className="text-xs font-mono bg-gray-800 px-2 py-1 rounded text-orange-300">
                {filters.exposureTime}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              step="5"
              value={filters.exposureTime}
              onChange={(e) =>
                setFilters({ ...filters, exposureTime: parseInt(e.target.value) })
              }
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-xs text-gray-500 mt-1">Controla la exposición de la cámara</p>
          </div>

          {/* Gain */}
          <div className="mb-5">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-gray-300">📈 Gain</label>
              <span className="text-xs font-mono bg-gray-800 px-2 py-1 rounded text-red-300">
                {filters.gain}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              step="5"
              value={filters.gain}
              onChange={(e) =>
                setFilters({ ...filters, gain: parseInt(e.target.value) })
              }
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-xs text-gray-500 mt-1">Amplifica la señal de la cámara</p>
          </div>

          {/* Filter Presets */}
          <div className="mb-5">
            <label className="text-xs font-semibold text-gray-300 block mb-3">✨ Presets</label>
            <div className="grid grid-cols-2 gap-2">
              {FILTER_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => setFilters(preset.filters)}
                  className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all border ${
                    JSON.stringify(filters) === JSON.stringify(preset.filters)
                      ? 'bg-blue-600/40 border-blue-500 text-blue-300'
                      : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                  }`}
                >
                  <div className="text-lg mb-1">{preset.icon}</div>
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Reset Button */}
          <button
            onClick={handleResetFilters}
            className="w-full py-2 px-3 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-xs font-semibold rounded-lg transition-colors border border-gray-700 mt-6"
          >
            🔄 Restablecer Filtros
          </button>
        </div>
      </div>

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}
