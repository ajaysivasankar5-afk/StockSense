import React, { useState, useEffect, useRef } from 'react';
import { Camera, RefreshCw, X, Check, Upload, AlertCircle } from 'lucide-react';
import { loadOpenCV, processReceiptImage } from '../../services/opencvService';
import { Button } from '../ui/Button';

export interface OpenCvCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File, previewUrl: string) => void;
}

export const OpenCvCameraModal: React.FC<OpenCvCameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sourceCanvasRef = useRef<HTMLCanvasElement>(null);
  const processedCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isOpenCvReady, setIsOpenCvReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);

  // Initialize OpenCV when modal opens
  useEffect(() => {
    if (!isOpen) return;

    loadOpenCV().then((ready) => {
      setIsOpenCvReady(ready);
    });

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    stopCamera();
    setCameraError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError(
        'Camera API is unavailable in this environment. You can upload a bill image file directly.'
      );
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      } catch {
        setCameraError(
          'Camera access permission was denied or camera is unavailable. You can upload a bill image file directly.'
        );
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const handleCaptureSnapshot = () => {
    if (!videoRef.current || !sourceCanvasRef.current || !processedCanvasRef.current) return;

    setIsCapturing(true);
    const video = videoRef.current;
    const sourceCanvas = sourceCanvasRef.current;
    const processedCanvas = processedCanvasRef.current;

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    sourceCanvas.width = width;
    sourceCanvas.height = height;

    const ctx = sourceCanvas.getContext('2d');
    if (!ctx) {
      setIsCapturing(false);
      return;
    }

    ctx.drawImage(video, 0, 0, width, height);

    // Apply OpenCV processing
    processReceiptImage(sourceCanvas, processedCanvas, 'auto');

    processedCanvas.toBlob(
      (blob) => {
        setIsCapturing(false);
        if (blob) {
          const url = URL.createObjectURL(blob);
          setCapturedPreview(url);
        }
      },
      'image/jpeg',
      0.92
    );
  };

  const handleConfirmCapturedImage = () => {
    if (!capturedPreview || !processedCanvasRef.current) return;
    processedCanvasRef.current.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], `bill_opencv_${Date.now()}.jpg`, {
            type: 'image/jpeg',
          });
          onCapture(file, capturedPreview);
          handleClose();
        }
      },
      'image/jpeg',
      0.95
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onCapture(file, url);
      handleClose();
    }
  };

  const handleClose = () => {
    stopCamera();
    setCapturedPreview(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-navy-950/90 backdrop-blur-md animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-xl bg-black rounded-[24px] shadow-2xl border border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Minimal Bar */}
        <div className="absolute top-0 inset-x-0 p-4 z-20 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-white tracking-wide">
              {isOpenCvReady ? 'Camera Active' : 'Loading OpenCV...'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="w-9 h-9 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors flex items-center justify-center cursor-pointer"
            aria-label="Close camera"
          >
            <X size={20} />
          </button>
        </div>

        {/* Viewfinder or Captured Preview */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[380px] sm:min-h-[460px]">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileUpload}
            className="hidden"
          />

          {cameraError ? (
            <div
              className="p-8 text-center max-w-md text-white space-y-4 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-14 h-14 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                <Upload size={32} />
              </div>
              <div>
                <h4 className="font-heading font-semibold text-base text-white mb-1">
                  Upload Bill Photo Directly
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Camera permission is denied or camera is unavailable in preview sandbox. Tap below to choose any bill or receipt image from your device.
                </p>
              </div>
              <div className="pt-2 flex flex-wrap justify-center gap-3" onClick={(e) => e.stopPropagation()}>
                <Button
                  size="md"
                  variant="primary"
                  onClick={() => fileInputRef.current?.click()}
                  leftIcon={<Upload size={16} />}
                >
                  Select Bill Image File
                </Button>
                <Button
                  size="md"
                  variant="secondary"
                  onClick={startCamera}
                  leftIcon={<RefreshCw size={14} />}
                >
                  Retry Camera
                </Button>
              </div>
            </div>
          ) : capturedPreview ? (
            <div className="relative w-full h-full flex items-center justify-center bg-black p-4">
              <img
                src={capturedPreview}
                alt="Captured Bill"
                className="max-h-[65vh] w-auto object-contain rounded-xl border border-slate-800"
              />
            </div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className="w-full h-full object-cover max-h-[65vh]"
              />

              {/* Minimal Scanner Alignment Frame */}
              <div className="absolute inset-8 sm:inset-12 border-2 border-emerald-400/80 rounded-2xl pointer-events-none flex flex-col justify-between p-4 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]">
                <div className="flex justify-between">
                  <div className="w-6 h-6 border-t-4 border-l-4 border-emerald-400 -mt-1 -ml-1 rounded-tl" />
                  <div className="w-6 h-6 border-t-4 border-r-4 border-emerald-400 -mt-1 -mr-1 rounded-tr" />
                </div>
                <div className="text-center">
                  <span className="inline-block px-3 py-1 rounded-full bg-black/70 text-emerald-300 text-[11px] font-semibold backdrop-blur-md">
                    Position bill inside frame
                  </span>
                </div>
                <div className="flex justify-between">
                  <div className="w-6 h-6 border-b-4 border-l-4 border-emerald-400 -mb-1 -ml-1 rounded-bl" />
                  <div className="w-6 h-6 border-b-4 border-r-4 border-emerald-400 -mb-1 -mr-1 rounded-br" />
                </div>
              </div>
            </div>
          )}

          <canvas ref={sourceCanvasRef} className="hidden" />
          <canvas ref={processedCanvasRef} className="hidden" />
        </div>

        {/* Bottom Bar: Camera Shutter Button Only */}
        <div className="p-6 bg-black border-t border-slate-900 flex items-center justify-center">
          {capturedPreview ? (
            <div className="flex items-center gap-4 w-full max-w-xs">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setCapturedPreview(null)}
                leftIcon={<RefreshCw size={16} />}
                className="flex-1"
              >
                Retake
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleConfirmCapturedImage}
                leftIcon={<Check size={16} strokeWidth={2.5} />}
                className="flex-1"
              >
                Use Bill
              </Button>
            </div>
          ) : !cameraError ? (
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={handleCaptureSnapshot}
                disabled={isCapturing}
                className="w-18 h-18 rounded-full border-4 border-white bg-white/20 p-1 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer shadow-lg disabled:opacity-50"
                title="Press Shutter to Capture"
              >
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                  <Camera size={26} className="text-slate-900" />
                </div>
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
