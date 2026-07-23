import { useState, useRef, useEffect } from "react";
import api from "../../api/api";
import { Loader2, CheckCircle2, XCircle, QrCode, ArrowRight, Camera, RefreshCw } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";

export default function ProviderTicketValidation() {
  const [qrCode, setQrCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  // Camera scanning states
  const [isScanning, setIsScanning] = useState(false);
  const [errorScan, setErrorScan] = useState("");
  const html5QrCodeRef = useRef(null);

  // Auto clean up scanning if user unmounts page
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        if (html5QrCodeRef.current.isScanning) {
          html5QrCodeRef.current.stop().catch(err => console.error("Error stopping scanner on unmount:", err));
        }
      }
    };
  }, []);

  const handleValidate = async (e) => {
    if (e) e.preventDefault();
    if (!qrCode.trim()) return;

    setLoading(true);
    setResult(null);
    try {
      const res = await api.post("/api/tickets/validate/", { qr_code: qrCode.trim() });
      setResult({
        success: true,
        data: res.data,
      });
    } catch (err) {
      console.error("Validation error:", err);
      setResult({
        success: false,
        error: err.response?.data?.error || err.response?.data?.message || "Ticket verification failed.",
      });
    } finally {
      setLoading(false);
    }
  };

  const startScanner = async () => {
    setIsScanning(true);
    setResult(null);
    setErrorScan("");
    
    // Short timeout to let the container element mount
    setTimeout(async () => {
      try {
        const html5QrCode = new Html5Qrcode("reader");
        html5QrCodeRef.current = html5QrCode;
        
        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: (width, height) => {
              const min = Math.min(width, height);
              const size = Math.floor(min * 0.7);
              return { width: size, height: size };
            }
          },
          async (decodedText) => {
            // Success call back
            await stopScanner();
            setQrCode(decodedText);
            // Execute validation
            setLoading(true);
            try {
              const res = await api.post("/api/tickets/validate/", { qr_code: decodedText.trim() });
              setResult({
                success: true,
                data: res.data,
              });
            } catch (err) {
              setResult({
                success: false,
                error: err.response?.data?.error || err.response?.data?.message || "Ticket verification failed.",
              });
            } finally {
              setLoading(false);
            }
          },
          (errorMessage) => {
            // Optional: Handle scan error logs verbosely
          }
        );
      } catch (err) {
        console.error("Scanner failed to start:", err);
        setErrorScan("Could not access camera. Please check browser permissions.");
        setIsScanning(false);
      }
    }, 150);
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
      } catch (err) {
        console.error("Failed to stop scanner:", err);
      }
      html5QrCodeRef.current = null;
    }
    setIsScanning(false);
  };

  const resetForm = () => {
    setQrCode("");
    setResult(null);
    setErrorScan("");
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 font-['Hanken_Grotesk'] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gate Validation</h1>
        <p className="text-slate-500 text-sm mt-1">Scan or manually verify monument digital passes for immediate check-in.</p>
      </div>

      {isScanning ? (
        <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl p-6 flex flex-col items-center justify-between text-white relative h-[450px]">
          {/* Top header scanner controls */}
          <div className="text-center w-full z-10">
            <span className="text-[9px] font-bold text-amber-400 uppercase tracking-widest block mb-1">Live Camera Feed</span>
            <p className="text-[10px] text-slate-400">Align QR Code inside target region to scan</p>
          </div>

          {/* Scanner Viewport */}
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div id="reader" className="w-full h-full object-cover" />
            
            {/* Custom Overlay Scanner Aiming Grid */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-56 h-56 border-2 border-dashed border-amber-400 rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                {/* Targeting corner guides */}
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-amber-400 rounded-tl-lg" />
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-amber-400 rounded-tr-lg" />
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-amber-400 rounded-bl-lg" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-amber-400 rounded-br-lg" />
                
                {/* Horizontal scanner light animation */}
                <div className="absolute top-0 left-0 w-full h-1 bg-amber-400/80 shadow-[0_0_12px_rgba(251,191,36,0.8)] rounded-full animate-scan-light" />
              </div>
            </div>
          </div>

          {/* Cancel Actions */}
          <div className="z-10 w-full flex justify-center pb-2">
            <button
              onClick={stopScanner}
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2.5 px-6 rounded-full transition-all flex items-center gap-1.5 shadow-lg cursor-pointer active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Cancel Scan
            </button>
          </div>
        </div>
      ) : !result ? (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 space-y-6">
          <div className="mx-auto w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-primary border border-indigo-100 shadow-xs">
            <QrCode className="w-6 h-6" />
          </div>

          {errorScan && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-2.5 items-start text-xs font-semibold text-red-700">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{errorScan}</span>
            </div>
          )}

          <form onSubmit={handleValidate} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                Digital Pass Reference / QR Code
              </label>
              <input
                type="text"
                value={qrCode}
                onChange={(e) => setQrCode(e.target.value)}
                placeholder="Enter booking reference or ticket QR string"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={startScanner}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3.5 px-4 rounded-xl text-xs font-bold border border-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Camera className="w-4 h-4" /> Scan QR with Camera
              </button>

              <button
                type="submit"
                disabled={loading || !qrCode.trim()}
                className="flex-1 bg-primary hover:brightness-110 disabled:bg-slate-100 disabled:text-slate-400 py-3.5 px-4 rounded-xl text-xs font-bold text-on-primary transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-98"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
                  </>
                ) : (
                  <>
                    Verify Ticket <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : result.success ? (
        <div className="bg-white rounded-3xl border border-emerald-100 shadow-xl p-8 text-center space-y-6 animate-scale-in">
          <div className="mx-auto w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-sm animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-emerald-800">Pass Validated</h2>
            <p className="text-slate-500 text-xs font-semibold">Welcome to the monument! Check-in authorized.</p>
          </div>

          {/* Details */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-left space-y-4 text-xs font-semibold">
            <div className="grid grid-cols-2 gap-y-3">
              <div>
                <span className="text-[9px] text-slate-400 block uppercase tracking-wider">Visitor Name</span>
                <span className="text-slate-900 text-sm font-bold">{result.data.visitor_name}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block uppercase tracking-wider">Clearance Pass</span>
                <span className="text-slate-900 text-sm font-bold">{result.data.ticket_type}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[9px] text-slate-400 block uppercase tracking-wider">Experience Name</span>
                <span className="text-slate-900 text-sm font-bold">{result.data.experience}</span>
              </div>
            </div>
          </div>

          <button
            onClick={resetForm}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3.5 px-4 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Scan / Input Next Ticket
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-red-100 shadow-xl p-8 text-center space-y-6 animate-scale-in">
          <div className="mx-auto w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 border border-red-100 shadow-sm animate-pulse">
            <XCircle className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-red-800">Validation Rejected</h2>
            <p className="text-slate-500 text-xs font-semibold">Clearance denied at the gate.</p>
          </div>

          <div className="bg-red-50/50 rounded-2xl p-4 border border-red-100/50 text-slate-700 text-xs leading-relaxed font-semibold">
            {result.error}
          </div>

          <div className="flex gap-3">
            <button
              onClick={resetForm}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3.5 px-4 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Retry Form
            </button>
            <button
              onClick={resetForm}
              className="flex-1 bg-primary hover:brightness-110 text-on-primary py-3.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Verify Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
