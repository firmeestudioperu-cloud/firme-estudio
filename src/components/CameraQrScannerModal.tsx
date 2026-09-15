import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Camera,
  CameraOff,
  Sparkles,
  QrCode,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

interface CameraQrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (data: {
    dni?: string;
    name?: string;
    memId?: string;
    phone?: string;
    email?: string;
    raw: string;
  }) => void;
  title?: string;
  subtitle?: string;
}

export const CameraQrScannerModal: React.FC<CameraQrScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
  title = 'Escanear FIRME PASS',
  subtitle = 'Apunta la cámara al código QR del celular de la alumna para confirmar su asistencia y cama Reformer.',
}) => {
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isStartingCamera, setIsStartingCamera] = useState(true);
  const [manualInput, setManualInput] = useState('');
  const [availableCameras, setAvailableCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isScanningRef = useRef<boolean>(false);
  const readerElementId = 'firme-qr-camera-stream';

  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {
      // AudioContext unavailable
    }
  };

  const parseQrPayload = (rawText: string) => {
    let dni: string | undefined = undefined;
    let name: string | undefined = undefined;
    let memId: string | undefined = undefined;
    let phone: string | undefined = undefined;
    let email: string | undefined = undefined;

    const trimmed = (rawText || '').trim();

    try {
      // 1. Formato JSON: { "dni": "...", "name": "...", "phone": "...", "email": "..." }
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        const parsed = JSON.parse(trimmed);
        const docVal = parsed.dni || parsed.doc || parsed.ce || parsed.passport || parsed.documentNumber;
        dni = docVal ? String(docVal).trim() : undefined;
        name = parsed.name || undefined;
        memId = parsed.memId || parsed.id || undefined;
        phone = parsed.phone || parsed.cel || undefined;
        email = parsed.email || undefined;
      }

      // 2. Extraer parámetros de URL (incluso si están después de hash '#' o '?')
      if (!dni) {
        const dniMatch =
          trimmed.match(/[?&#](?:dni|doc|documento|ce|passport|pasaporte)=([^&#]+)/i) ||
          trimmed.match(/(?:dni|doc|documento|ce|pasaporte)[=:\s]+([A-Za-z0-9_-]{6,15})/i);
        if (dniMatch) {
          const rawDoc = decodeURIComponent(dniMatch[1]).trim();
          if (rawDoc.length >= 6 && rawDoc.length <= 15) {
            dni = rawDoc;
          }
        }
      }

      if (!phone) {
        const phoneMatch =
          trimmed.match(/[?&#](?:phone|tel|cel|celular|telefono)=([^&#]+)/i) ||
          trimmed.match(/(?:tel|cel|celular)[=:\s]+([0-9+]{9,15})/i);
        if (phoneMatch) {
          phone = decodeURIComponent(phoneMatch[1]).trim();
        }
      }

      if (!email) {
        const emailMatch =
          trimmed.match(/[?&#](?:email|correo)=([^&#]+)/i) ||
          trimmed.match(/(?:email|correo)[=:\s]+([^\s&]+@[^\s&]+)/i);
        if (emailMatch) {
          email = decodeURIComponent(emailMatch[1]).trim();
        }
      }

      if (!name) {
        const nameMatch =
          trimmed.match(/[?&#]name=([^&#]+)/i) ||
          trimmed.match(/(?:name|nombre|alumno)[=:\s]+([^&#]+)/i);
        if (nameMatch) {
          name = decodeURIComponent(nameMatch[1]).replace(/\+/g, ' ').trim();
        }
      }

      if (!memId) {
        const memMatch =
          trimmed.match(/[?&#]memId=([^&#]+)/i) ||
          trimmed.match(/(?:memId|id|codigo)[=:\s]+([^&#]+)/i);
        if (memMatch) {
          memId = decodeURIComponent(memMatch[1]).trim();
        }
      }

      // 3. Fallback si aún no hay DNI y el texto no es una URL
      if (!dni) {
        if (trimmed.includes('@')) {
          email = trimmed;
        } else {
          const isolatedMatch = trimmed.match(/(?:\b|\D)([0-9]{7,10})(?:\b|\D)/);
          if (isolatedMatch) {
            dni = isolatedMatch[1];
          } else if (!trimmed.includes('http') && !trimmed.includes('/') && !trimmed.includes('?')) {
            const digits = trimmed.replace(/\D/g, '');
            if (digits.length >= 6 && digits.length <= 12) {
              dni = digits;
            } else {
              memId = trimmed;
            }
          }
        }
      }
    } catch {
      // ignore
    }

    return { dni, name, memId, phone, email, raw: trimmed };
  };

  const handleSuccessfulScan = async (decodedText: string) => {
    if (!isScanningRef.current) return;
    isScanningRef.current = false;

    playChime();

    // Detener cámara
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch {
        // ignore
      }
    }

    const payload = parseQrPayload(decodedText);
    onScanSuccess(payload);
    onClose();
  };

  const startScanner = async (cameraId?: string) => {
    setIsStartingCamera(true);
    setCameraError(null);

    try {
      // Listar cámaras disponibles si no se han obtenido
      if (availableCameras.length === 0) {
        try {
          const devices = await Html5Qrcode.getCameras();
          if (devices && devices.length > 0) {
            setAvailableCameras(devices.map((d) => ({ id: d.id, label: d.label || `Cámara ${d.id}` })));
            if (!cameraId) {
              // Preferir cámara trasera si existe
              const backCam = devices.find((d) => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('trasera') || d.label.toLowerCase().includes('rear'));
              cameraId = backCam ? backCam.id : devices[devices.length - 1].id;
              setSelectedCameraId(cameraId);
            }
          }
        } catch {
          // continue with default constraint
        }
      }

      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(readerElementId);
      } else if (scannerRef.current.isScanning) {
        await scannerRef.current.stop();
      }

      const cameraConfig = cameraId ? { deviceId: { exact: cameraId } } : { facingMode: 'environment' };

      await scannerRef.current.start(
        cameraConfig,
        {
          fps: 12,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minDim = Math.min(viewfinderWidth, viewfinderHeight);
            return {
              width: Math.floor(minDim * 0.72),
              height: Math.floor(minDim * 0.72),
            };
          },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleSuccessfulScan(decodedText);
        },
        () => {
          // frame parse failure is normal while waiting for QR
        }
      );

      isScanningRef.current = true;
      setIsStartingCamera(false);
    } catch (err: any) {
      console.warn('Error al iniciar cámara QR:', err);
      setIsStartingCamera(false);
      setCameraError(
        err?.message?.includes('Permission') || err?.name === 'NotAllowedError'
          ? 'Permiso de cámara denegado. Permite el acceso a la cámara en tu navegador o ingresa el DNI manualmente.'
          : 'No se pudo acceder a la cámara. Comprueba que no esté en uso por otra app o usa el ingreso manual.'
      );
    }
  };

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        startScanner(selectedCameraId);
      }, 300);

      return () => {
        clearTimeout(timer);
        if (scannerRef.current && isScanningRef.current) {
          isScanningRef.current = false;
          scannerRef.current.stop().catch(() => {});
        }
      };
    } else {
      if (scannerRef.current && isScanningRef.current) {
        isScanningRef.current = false;
        scannerRef.current.stop().catch(() => {});
      }
    }
  }, [isOpen, selectedCameraId]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    const payload = parseQrPayload(manualInput.trim());
    playChime();
    onScanSuccess(payload);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1815]/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#FAF8F5] rounded-3xl border border-[#E4DED4] max-w-md w-full shadow-2xl overflow-hidden flex flex-col relative text-[#1A1815]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 pb-3 border-b border-[#E4DED4] bg-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#B5654A]/10 text-[#B5654A] flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-fraunces text-lg font-semibold tracking-wide text-[#1A1815]">
                {title}
              </h3>
              <p className="text-[11px] text-[#6B655C]">Recepción & Sala Reformer</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-[#6B655C] hover:text-[#1A1815] hover:bg-[#F1ECE5] transition-colors cursor-pointer"
            aria-label="Cerrar escáner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder Area */}
        <div className="p-5 space-y-4">
          <p className="text-xs text-[#6B655C] leading-relaxed text-center">
            {subtitle}
          </p>

          <div className="relative w-full aspect-square max-w-[320px] mx-auto bg-[#1A1815] rounded-3xl overflow-hidden shadow-inner flex items-center justify-center border-2 border-[#B5654A]">
            {/* HTML5 QR Container */}
            <div id={readerElementId} className="w-full h-full object-cover" />

            {/* Corner Targeting Overlay */}
            <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
              <div className="flex justify-between">
                <div className="w-8 h-8 border-t-4 border-l-4 border-amber-300 rounded-tl-xl" />
                <div className="w-8 h-8 border-t-4 border-r-4 border-amber-300 rounded-tr-xl" />
              </div>
              <div className="flex justify-between">
                <div className="w-8 h-8 border-b-4 border-l-4 border-amber-300 rounded-bl-xl" />
                <div className="w-8 h-8 border-b-4 border-r-4 border-amber-300 rounded-br-xl" />
              </div>
            </div>

            {/* Animated Laser Scanning Line */}
            {isScanningRef.current && (
              <div className="absolute left-8 right-8 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_12px_rgba(239,68,68,0.8)] animate-pulse pointer-events-none" />
            )}

            {/* Loading / Error States */}
            {isStartingCamera && !cameraError && (
              <div className="absolute inset-0 bg-[#1A1815]/90 flex flex-col items-center justify-center gap-2 text-white p-4 text-center">
                <RefreshCw className="w-8 h-8 text-[#B5654A] animate-spin" />
                <span className="text-xs font-semibold">Activando cámara...</span>
                <span className="text-[10px] text-white/60">Asegúrate de permitir el acceso en tu navegador</span>
              </div>
            )}

            {cameraError && (
              <div className="absolute inset-0 bg-[#1A1815]/95 flex flex-col items-center justify-center gap-2.5 text-white p-6 text-center">
                <CameraOff className="w-10 h-10 text-rose-400" />
                <span className="text-xs font-bold text-rose-300">Cámara no disponible</span>
                <p className="text-[11px] text-white/70 leading-relaxed max-w-xs">{cameraError}</p>
                <button
                  type="button"
                  onClick={() => startScanner(selectedCameraId)}
                  className="mt-1 px-3 py-1.5 rounded-xl bg-[#B5654A] text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-[#9A5340] cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reintentar</span>
                </button>
              </div>
            )}
          </div>

          {/* Camera Selector (if multiple) */}
          {availableCameras.length > 1 && (
            <div className="flex items-center justify-center gap-2">
              <span className="text-[11px] text-[#6B655C]">Cambiar lente:</span>
              <select
                value={selectedCameraId}
                onChange={(e) => {
                  setSelectedCameraId(e.target.value);
                  startScanner(e.target.value);
                }}
                className="text-xs bg-white border border-[#E4DED4] rounded-lg px-2 py-1 text-[#1A1815] focus:outline-none"
              >
                {availableCameras.map((cam) => (
                  <option key={cam.id} value={cam.id}>
                    {cam.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Manual Input Fallback */}
          <div className="pt-2 border-t border-[#E4DED4]">
            <form onSubmit={handleManualSubmit} className="space-y-2">
              <label className="block text-xs font-semibold text-[#1A1815]">
                ¿Problemas con la cámara? Ingreso manual por DNI o código:
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#6B655C] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder="Ej. 70112233 o pega URL del QR"
                    className="w-full bg-white border border-[#DDD5C9] rounded-xl pl-9 pr-3 py-2 text-xs text-[#1A1815] focus:outline-none focus:border-[#B5654A]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!manualInput.trim()}
                  className="px-4 py-2 rounded-xl bg-[#1A1815] hover:bg-[#322C27] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Validar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
