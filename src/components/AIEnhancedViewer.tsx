import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import OpenSeadragon from "openseadragon";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
  RotateCcw,
  Settings,
  Brain,
  Info,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LocationState {
  imageUrl: string;
  thumbnailUrl?: string;
  title: string;
  description: string;
  nasaId: string;
}

interface MLModel {
  name: string;
  version: string;
  confidence: number;
  status: "active" | "loading" | "error";
}

interface FeatureDetection {
  type: string;
  confidence: number;
  bbox: [number, number, number, number];
  properties: Record<string, any>;
}

const AIEnhancedViewer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const { toast } = useToast();

  const viewerRef = useRef<HTMLDivElement>(null);
  const osdRef = useRef<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showMetadata, setShowMetadata] = useState(false);

  // AI Enhancement Controls
  const [enhanceEnabled, setEnhanceEnabled] = useState(true);
  const [labelsEnabled, setLabelsEnabled] = useState(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState([0.5]);

  // ML Models Status
  const [mlModels] = useState<MLModel[]>([
    { name: "Real-ESRGAN", version: "1.0.0", confidence: 0.95, status: "active" },
    { name: "DnCNN", version: "1.0.0", confidence: 0.88, status: "active" },
    { name: "U-Net", version: "1.0.0", confidence: 0.92, status: "active" },
    { name: "ResNet", version: "1.0.0", confidence: 0.85, status: "active" },
  ]);

  // Feature Detection
  const [detectedFeatures, setDetectedFeatures] = useState<FeatureDetection[]>([]);
  const [showFeatureOverlay, setShowFeatureOverlay] = useState(true);

  if (!state) {
    navigate("/gallery");
    return null;
  }

  const imageUrl = state?.imageUrl || "/earth-image.jpg";

  // ✅ Initialize OpenSeadragon for JPG / PNG / DZI
  useEffect(() => {
    if (!viewerRef.current) return;

    const container = viewerRef.current;
    container.style.position = "relative";

    if (osdRef.current) {
      osdRef.current.destroy();
    }

    const tileSource = imageUrl.endsWith(".dzi")
      ? imageUrl
      : { type: "image", url: imageUrl };

    osdRef.current = OpenSeadragon({
      element: container,
      prefixUrl:
        "https://cdn.jsdelivr.net/npm/openseadragon@4.1/build/openseadragon/images/",
      tileSources: tileSource,
      showNavigator: true,
      visibilityRatio: 1,
      maxZoomPixelRatio: 2,
      minZoomImageRatio: 0.1,
      defaultZoomLevel: 1,
      maxZoomLevel: 20,
      minZoomLevel: 0,
      constrainDuringPan: true,
      animationTime: 1.2,
      blendTime: 0.2,
      springStiffness: 5.0,
      gestureSettingsMouse: {
        scrollToZoom: true,
        clickToZoom: true,
        dblClickToZoom: true,
        pinchToZoom: true,
      },
      gestureSettingsTouch: {
        scrollToZoom: true,
        clickToZoom: true,
        dblClickToZoom: true,
        pinchToZoom: true,
      },
    });

    const viewer = osdRef.current;
    viewer.addHandler("zoom", handleZoom);

    return () => {
      viewer.removeHandler("zoom", handleZoom);
      viewer.destroy();
    };
  }, [imageUrl]);

  // 🔄 Refresh/Enhance Effect on Zoom
  const handleZoom = () => {
    if (!osdRef.current) return;
    const viewer = osdRef.current;
    const zoomLevel = viewer.viewport.getZoom();

    const overlay = document.createElement("div");
    overlay.style.position = "absolute";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.background = "rgba(0, 0, 0, 0.3)";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.color = "white";
    overlay.style.fontSize = "0.9rem";
    overlay.style.fontWeight = "bold";
    overlay.style.zIndex = "999";
    overlay.innerText = "Enhancing view...";

    if (viewerRef.current) viewerRef.current.appendChild(overlay);

    setTimeout(() => {
      if (viewerRef.current && viewerRef.current.contains(overlay))
        viewerRef.current.removeChild(overlay);

      const item = viewer.world.getItemAt(0);
      if (item) {
        const src = item.source;
        const newUrl = src.url.includes("?")
          ? `${src.url}&zoom=${Math.round(zoomLevel)}`
          : `${src.url}?zoom=${Math.round(zoomLevel)}`;
        item.setSource({
          ...src,
          url: newUrl,
        });
      }
    }, 700);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const toggleEnhancement = async () => {
    setEnhanceEnabled(!enhanceEnabled);
    if (osdRef.current) {
      const item = osdRef.current.world.getItemAt(0);
      if (!item) return;
      const src = item.source;
      const newUrl = enhanceEnabled
        ? src.url.replace("?enhance=true", "")
        : src.url + (src.url.includes("?") ? "&" : "?") + "enhance=true";
      item.setSource({
        ...src,
        url: newUrl,
      });
    }
  };

  // 🔳 Feature Overlay (for AI detection boxes)
  const renderFeatureOverlay = () => {
    if (!showFeatureOverlay || !detectedFeatures.length) return null;
    return (
      <div className="absolute inset-0 pointer-events-none z-10">
        {detectedFeatures.map((feature, index) => (
          <div
            key={index}
            className="absolute border-2 border-red-500 rounded"
            style={{
              left: `${feature.bbox[0]}px`,
              top: `${feature.bbox[1]}px`,
              width: `${feature.bbox[2] - feature.bbox[0]}px`,
              height: `${feature.bbox[3] - feature.bbox[1]}px`,
            }}
          >
            <div className="absolute -top-6 left-0 bg-red-500 text-white text-xs px-1 rounded">
              {feature.type}: {(feature.confidence * 100).toFixed(1)}%
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card/50 backdrop-blur z-20">
        <div className="flex-1 min-w-0 mr-4">
          <h2 className="text-lg font-semibold truncate">{state.title}</h2>
          <p className="text-sm text-muted-foreground truncate">
            NASA ID: {state.nasaId}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowControls(!showControls)}
          >
            <Settings className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigate("/gallery")}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Viewer */}
      <div className="flex-1 relative overflow-hidden">
        <div ref={viewerRef} className="w-full h-full" />

        {/* Zoom Controls */}
        <div className="absolute bottom-4 right-4 z-30 flex flex-col gap-2 bg-card/40 backdrop-blur-lg p-2 rounded-lg border border-border">
          <Button
            size="icon"
            onClick={() => {
              osdRef.current?.viewport?.zoomBy(1.2);
              osdRef.current?.viewport?.applyConstraints();
            }}
            className="bg-primary/30 hover:bg-primary/50"
          >
            <ZoomIn className="w-5 h-5" />
          </Button>
          <Button
            size="icon"
            onClick={() => {
              osdRef.current?.viewport?.zoomBy(0.8);
              osdRef.current?.viewport?.applyConstraints();
            }}
            className="bg-primary/30 hover:bg-primary/50"
          >
            <ZoomOut className="w-5 h-5" />
          </Button>
          <Button
            size="icon"
            onClick={() => osdRef.current?.viewport?.goHome()}
            className="bg-secondary/30 hover:bg-secondary/50"
          >
            <RotateCcw className="w-5 h-5" />
          </Button>
          <Button
            size="icon"
            onClick={toggleFullscreen}
            className="bg-secondary/30 hover:bg-secondary/50"
          >
            <Maximize2 className="w-5 h-5" />
          </Button>
        </div>

        {/* Feature Overlay */}
        {renderFeatureOverlay()}
      </div>

      {/* Bottom Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none">
        <div className="bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 backdrop-blur-lg rounded-lg px-6 py-3 border border-primary/30">
          <p className="text-sm font-medium bg-gradient-to-r from-primary via-accent to-primary-glow bg-clip-text text-transparent">
            🔍 Scroll to zoom • ✋ Drag to pan • 🧠 AI enhancement auto-refreshes on zoom
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIEnhancedViewer;
