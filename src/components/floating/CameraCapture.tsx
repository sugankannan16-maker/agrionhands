import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logActivity } from "@/lib/activity";
import { useAuthUser } from "@/lib/auth";

type Phase = "idle" | "starting" | "live" | "uploading" | "done" | "error";

type CaptureAnalysis = {
  soilType: string;
  moistureContent: string;
  features: string[];
};

function getPosition(): Promise<GeolocationPosition | null> {
  if (typeof navigator === "undefined" || !navigator.geolocation) return Promise.resolve(null);
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (p) => resolve(p),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 },
    );
  });
}

export function CameraIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8.5A1.5 1.5 0 014.5 7h2.2l1.1-1.8A1.5 1.5 0 019.1 4.5h5.8c.5 0 1 .27 1.3.7L17.3 7h2.2A1.5 1.5 0 0121 8.5v9A1.5 1.5 0 0119.5 19h-15A1.5 1.5 0 013 17.5v-9z" />
      <circle cx="12" cy="13" r="3.2" />
    </svg>
  );
}

/** Floating camera button + capture sheet: shoots, geotags and auto-uploads. */
export default function CameraCapture() {
  const { user } = useAuthUser();
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [analysis, setAnalysis] = useState<CaptureAnalysis | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const start = useCallback(async () => {
    setPhase("starting");
    setMessage("");
    setPreview(null);
    setAnalysis(null);
    setAnalysisError(null);
    setProgress(0);
    void getPosition().then((p) => p && setCoords({ lat: p.coords.latitude, lng: p.coords.longitude }));
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1600 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
      setPhase("live");
    } catch {
      setPhase("error");
      setMessage("Camera permission denied or unavailable on this device.");
    }
  }, []);

  useEffect(() => {
    if (open) void start();
    return () => stopStream();
  }, [open, start, stopStream]);

  const capture = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !user) {
      if (!user) {
        setPhase("error");
        setMessage("Please sign in to save photos to your history.");
      }
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.86));
    if (!blob) return;

    const imageDataUrl = canvas.toDataURL("image/jpeg", 0.72);
    setPreview(imageDataUrl);
    stopStream();
    setPhase("uploading");
    setProgress(25);

    const path = `${user.id}/${Date.now()}.jpg`;
    const { error: upErr } = await supabase.storage.from("captures").upload(path, blob, {
      contentType: "image/jpeg",
      upsert: false,
    });
    if (upErr) {
      setPhase("error");
      setMessage(`Upload failed: ${upErr.message}`);
      return;
    }
    setProgress(55);

    let captureAnalysis: CaptureAnalysis | null = null;
    let captureAnalysisError: string | null = null;
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (token) {
        const analysisResponse = await fetch("/api/capture-analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ imageDataUrl }),
        });
        if (analysisResponse.ok) {
          const result = (await analysisResponse.json()) as { analysis?: CaptureAnalysis };
          if (result.analysis?.soilType && result.analysis.moistureContent && result.analysis.features?.length) {
            captureAnalysis = result.analysis;
            setAnalysis(result.analysis);
          }
        } else {
          const detail = (await analysisResponse.text()).trim();
          captureAnalysisError = detail || "Image analysis failed.";
          setAnalysisError(captureAnalysisError);
        }
      } else {
        captureAnalysisError = "Image analysis needs an active sign-in session.";
        setAnalysisError(captureAnalysisError);
      }
    } catch {
      captureAnalysisError = "Image analysis is temporarily unavailable. The photo was still saved.";
      setAnalysisError(captureAnalysisError);
    }
    setProgress(80);

    const point = coords ?? (await getPosition().then((p) => (p ? { lat: p.coords.latitude, lng: p.coords.longitude } : null)));
    const { error: dbErr } = await supabase.from("captures").insert({
      user_id: user.id,
      image_url: path,
      storage_path: path,
      latitude: point?.lat ?? null,
      longitude: point?.lng ?? null,
      prediction: captureAnalysis ? `Soil type: ${captureAnalysis.soilType}\nMoisture: ${captureAnalysis.moistureContent}` : null,
      note: captureAnalysis ? `Features: ${captureAnalysis.features.join(" • ")}` : null,
    });
    if (dbErr) {
      setPhase("error");
      setMessage(`Could not save record: ${dbErr.message}`);
      return;
    }
    setProgress(100);
    await logActivity({
      category: "capture",
      title: "Field photo captured",
      detail: captureAnalysis
        ? `${captureAnalysis.soilType} · ${captureAnalysis.moistureContent}`
        : point
          ? `GPS ${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}`
          : "No GPS available",
      meta: { path, ...(point ?? {}), ...(captureAnalysis ?? {}) },
      link: "/history",
    });
    setPhase("done");
    setMessage(captureAnalysisError ? `Photo saved. Analysis unavailable: ${captureAnalysisError}` : "Photo uploaded and saved to your history.");
  }, [user, coords, stopStream]);

  const close = () => {
    stopStream();
    setOpen(false);
    setPhase("idle");
    setPreview(null);
    setAnalysis(null);
    setAnalysisError(null);
    setMessage("");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open camera"
        title="Capture a geotagged field photo"
        className="size-12 md:size-14 grid place-items-center rounded-full bg-white/90 text-grass-900 ring-1 ring-grass-800/15 shadow-lg backdrop-blur transition hover:scale-105 active:scale-95"
      >
        <CameraIcon className="size-6" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-grass-900/60 backdrop-blur-sm p-3 animate-in fade-in duration-200">
          <div className="w-full max-w-lg glass rounded-3xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-4 py-3 border-b border-grass-800/10">
              <h2 className="text-sm font-semibold text-grass-900">Geotagged field photo</h2>
              <button type="button" onClick={close} aria-label="Close camera" className="size-8 grid place-items-center rounded-full bg-grass-100 text-grass-800">
                ✕
              </button>
            </div>

            <div className="relative aspect-[4/3] bg-grass-900">
              {preview ? (
                <img src={preview} alt="Captured field photo preview" className="size-full object-cover" />
              ) : (
                <video ref={videoRef} playsInline muted className="size-full object-cover" />
              )}
              {phase === "starting" && <div className="absolute inset-0 grid place-items-center text-grass-50 text-sm animate-pulse">Starting camera…</div>}
              {phase === "uploading" && (
                <div className="absolute inset-x-0 bottom-0 h-1.5 bg-white/30">
                  <div className="h-full bg-sun-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              )}
            </div>

            <div className="p-4 space-y-3">
              <p className="text-xs text-grass-700">
                {coords ? `📍 ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}` : "📍 Waiting for GPS (optional)"}
              </p>
              {message && (
                <p role="status" className={`text-sm ${phase === "error" ? "text-destructive" : "text-grass-800"}`}>
                  {message}
                </p>
              )}
              {analysis && (
                <div className="rounded-2xl bg-grass-100/80 p-3 text-sm text-grass-900 space-y-2">
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    <p><span className="font-semibold">Soil type:</span> {analysis.soilType}</p>
                    <p><span className="font-semibold">Moisture:</span> {analysis.moistureContent}</p>
                  </div>
                  <p><span className="font-semibold">Photo features:</span> {analysis.features.join(" • ")}</p>
                  <p className="text-[11px] text-grass-700">Visual estimate only — use a soil test or moisture sensor for accurate readings.</p>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {phase === "live" && (
                  <button type="button" onClick={() => void capture()} className="ripple-btn bg-grass-800 text-grass-50 text-sm py-2.5 px-5 rounded-full">
                    Capture &amp; upload
                  </button>
                )}
                {phase === "uploading" && <span className="text-sm text-grass-800 animate-pulse">Uploading… {progress}%</span>}
                {(phase === "done" || phase === "error") && (
                  <button type="button" onClick={() => void start()} className="text-sm py-2.5 px-5 rounded-full glass text-grass-800">
                    Take another
                  </button>
                )}
                {phase === "done" && (
                  <a href="/history" className="ripple-btn bg-sun-500 text-grass-900 text-sm py-2.5 px-5 rounded-full">
                    View in history
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
