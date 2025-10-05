import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import OpenSeadragon from "openseadragon";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  X, 
  RotateCcw, 
  Settings, 
  Brain, 
  Eye, 
  EyeOff,
  Info,
  Download,
  Share2,
  Layers,
  Target,
  AlertTriangle
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
  status: 'active' | 'loading' | 'error';
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
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparisonSlider, setComparisonSlider] = useState([50]);
  
  // ML Models Status
  const [mlModels, setMlModels] = useState<MLModel[]>([
    { name: "Real-ESRGAN", version: "1.0.0", confidence: 0.95, status: 'active' },
    { name: "DnCNN", version: "1.0.0", confidence: 0.88, status: 'active' },
    { name: "U-Net", version: "1.0.0", confidence: 0.92, status: 'active' },
    { name: "ResNet", version: "1.0.0", confidence: 0.85, status: 'active' }
  ]);
  
  // Feature Detection
  const [detectedFeatures, setDetectedFeatures] = useState<FeatureDetection[]>([]);
  const [showFeatureOverlay, setShowFeatureOverlay] = useState(true);
  
  // Metadata
  const [tileMetadata, setTileMetadata] = useState<any>(null);
  const [processingTime, setProcessingTime] = useState<number>(0);
  
  if (!state) {
    navigate("/gallery");
    return null;
  }

  // Selected image URL and type detection
  const imageUrl = state?.imageUrl || "/earth-image.jpg";
  const isDzi = typeof imageUrl === "string" && imageUrl.toLowerCase().endsWith(".dzi");

  useEffect(() => {
    if (!viewerRef.current) return;
    if (!isDzi) return; // For non-DZI images, we render a simple <img> and skip OSD

    const container = viewerRef.current;
    container.style.position = "relative";

    let isSameOrigin = true;
    try {
      if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
        const u = new URL(imageUrl);
        isSameOrigin = u.origin === window.location.origin;
      } else {
        isSameOrigin = true; // relative URLs are same-origin
      }
    } catch {
      isSameOrigin = true;
    }

    const tileSource = imageUrl; // DZI manifest URL as plain string

    osdRef.current = OpenSeadragon({
      element: container,
      prefixUrl: "https://cdn.jsdelivr.net/npm/openseadragon@4.1/build/openseadragon/images/",
      tileSources: tileSource,
      showNavigator: true,
      // Pixel-perfect zooming configuration
      maxZoomPixelRatio: 2,
      minZoomImageRatio: 0.1,
      maxZoomLevel: 20,
      minZoomLevel: 0,
      // Tile configuration for better quality
      tileSize: 256,
      imageLoaderLimit: 5,
      timeout: 30000,
      // Smooth zooming and panning
      springStiffness: 5.0,
      animationTime: 1.2,
      blendTime: 0.1,
      constrainDuringPan: true,
      // Gesture settings for better control
      gestureSettingsMouse: {
        scrollToZoom: true,
        clickToZoom: true,
        dblClickToZoom: true,
        flickEnabled: true,
        pinchToZoom: true,
      },
      gestureSettingsTouch: {
        scrollToZoom: true,
        clickToZoom: true,
        dblClickToZoom: true,
        flickEnabled: true,
        pinchToZoom: true,
      },
      // Cross-origin handling
      // Use AJAX only for same-origin DZI manifests; for plain images, avoid AJAX to prevent tile failures
      loadTilesWithAjax: isDzi ? isSameOrigin : false,
      ajaxWithCredentials: false,
      crossOriginPolicy: isSameOrigin ? undefined : "Anonymous",
      // Avoid canvas tainting when image is cross-origin without proper CORS
      useCanvas: isSameOrigin,
      // Retry configuration
      tileRetryMax: 3,
      tileRetryDelay: 1000,
      tileLoadTimeout: 10000,
    });

    const viewer = osdRef.current;

    // Add event handlers
    viewer.addHandler("tile-loaded", handleTileLoaded);
    viewer.addHandler("tile-load-failed", handleTileLoadFailed);
    viewer.addHandler("zoom", handleZoom);
    viewer.addHandler("pan", handlePan);
    viewer.addHandler("open-failed", (evt: any) => {
      console.error("OpenSeadragon open failed:", evt);
      const isMixedContent = typeof imageUrl === 'string' && window.location.protocol === 'https:' && imageUrl.startsWith('http:');
      const details = evt?.message || evt?.eventString || 'Unknown error';
      toast({
        title: "Viewer failed to open",
        description: isMixedContent
          ? "Blocked mixed content (http image on https site). Try an https URL."
          : (typeof imageUrl === 'string' ? `${imageUrl} — ${details}` : details),
        variant: "destructive"
      });
    });

    return () => {
      viewer.removeHandler("tile-loaded", handleTileLoaded);
      viewer.removeHandler("tile-load-failed", handleTileLoadFailed);
      viewer.removeHandler("zoom", handleZoom);
      viewer.removeHandler("pan", handlePan);
      if (osdRef.current && osdRef.current.destroy) {
        osdRef.current.destroy();
      }
    };
  }, [state?.imageUrl]);

  const handleTileLoaded = (event: any) => {
    const tile = event.tile;
    const { x, y, level } = tile;
    
    // Fetch metadata for this tile
    fetchTileMetadata(x, y, level);
    
    // Fetch feature detection if labels are enabled
    if (labelsEnabled) {
      fetchFeatureDetection(x, y, level);
    }
  };

  const handleTileLoadFailed = (event: any) => {
    console.error("Tile load failed:", event);
    toast({
      title: "Tile Load Failed",
      description: "Failed to load tile. Retrying...",
      variant: "destructive"
    });
  };

  const handleZoom = () => {
    // Flash overlay effect
    const overlay = document.createElement("div");
    overlay.style.position = "absolute";
    overlay.style.top = "0px";
    overlay.style.left = "0px";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.background = "rgba(255,255,255,0.1)";
    overlay.style.backdropFilter = "blur(1px)";
    overlay.style.transition = "opacity 0.1s";
    overlay.style.opacity = "0.7";
    overlay.style.pointerEvents = "none";
    overlay.style.zIndex = "1000";
    
    if (viewerRef.current) {
      viewerRef.current.appendChild(overlay);
      
      requestAnimationFrame(() => {
        overlay.style.opacity = "0";
        setTimeout(() => {
          if (viewerRef.current && viewerRef.current.contains(overlay)) {
            viewerRef.current.removeChild(overlay);
          }
        }, 100);
      });
    }
  };

  const handlePan = () => {
    // Update feature detection for new view
    if (labelsEnabled && osdRef.current) {
      const viewport = osdRef.current.viewport;
      const center = viewport.getCenter();
      const zoom = viewport.getZoom();
      // Convert to tile coordinates and fetch features
    }
  };

  const fetchTileMetadata = async (x: number, y: number, z: number) => {
    try {
      const response = await fetch(
        `/api/metadata/${state.nasaId}/${z}/${x}/${y}`
      );
      if (response.ok) {
        const metadata = await response.json();
        setTileMetadata(metadata);
      }
    } catch (error) {
      console.error("Error fetching tile metadata:", error);
    }
  };

  const fetchFeatureDetection = async (x: number, y: number, z: number) => {
    try {
      const response = await fetch(
        `/api/ml/infer`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image_id: state.nasaId,
            z,
            x,
            y,
            operations: ["segment", "classify"],
            confidence_threshold: confidenceThreshold[0]
          })
        }
      );
      
      if (response.ok) {
        const result = await response.json();
        setDetectedFeatures(result.features_detected || []);
        setProcessingTime(result.processing_time || 0);
      }
    } catch (error) {
      console.error("Error fetching feature detection:", error);
    }
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
    
    // Update tile source to use enhanced tiles
    if (osdRef.current) {
      const item = osdRef.current.world.getItemAt(0);
      if (!item || !item.getSource) return;
      const currentTileSource = item.getSource();
      if (!currentTileSource || !("url" in currentTileSource)) return;
      const currentUrl = (currentTileSource as any).url as string;
      const enhancedUrl = enhanceEnabled 
        ? currentUrl.replace('?enhance=true', '')
        : currentUrl + (currentUrl.includes('?') ? '&' : '?') + 'enhance=true';
      item.setSource({
        ...(currentTileSource as any),
        url: enhancedUrl
      });
    }
  };

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
          <p className="text-sm text-muted-foreground truncate">NASA ID: {state.nasaId}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowControls(!showControls)}
          >
            <Settings className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowMetadata(!showMetadata)}
          >
            <Info className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/gallery")}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative overflow-hidden">
        {/* AI Controls Panel */}
        {showControls && (
          <div className="absolute top-4 left-4 z-30 w-80">
            <Card className="bg-card/90 backdrop-blur border-border">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Brain className="w-4 h-4" />
                  AI Enhancement Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Enhancement Toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-sm">AI Enhancement</span>
                  <Switch
                    checked={enhanceEnabled}
                    onCheckedChange={toggleEnhancement}
                  />
                </div>

                {/* Labels Toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-sm">Feature Labels</span>
                  <Switch
                    checked={labelsEnabled}
                    onCheckedChange={setLabelsEnabled}
                  />
                </div>

                {/* Confidence Threshold */}
                <div className="space-y-2">
                  <label className="text-sm">Confidence Threshold</label>
                  <Slider
                    value={confidenceThreshold}
                    onValueChange={setConfidenceThreshold}
                    max={1}
                    min={0}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground">
                    {(confidenceThreshold[0] * 100).toFixed(0)}%
                  </div>
                </div>

                {/* Comparison Mode */}
                <div className="flex items-center justify-between">
                  <span className="text-sm">Comparison Mode</span>
                  <Switch
                    checked={comparisonMode}
                    onCheckedChange={setComparisonMode}
                  />
                </div>

                {comparisonMode && (
                  <div className="space-y-2">
                    <label className="text-sm">Original ↔ Enhanced</label>
                    <Slider
                      value={comparisonSlider}
                      onValueChange={setComparisonSlider}
                      max={100}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                  </div>
                )}

                {/* ML Models Status */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">ML Models</label>
                  <div className="space-y-1">
                    {mlModels.map((model, index) => (
                      <div key={index} className="flex items-center justify-between text-xs">
                        <span>{model.name}</span>
                        <Badge 
                          variant={model.status === 'active' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {model.confidence.toFixed(2)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Metadata Panel */}
        {showMetadata && (
          <div className="absolute top-4 right-4 z-30 w-80">
            <Card className="bg-card/90 backdrop-blur border-border">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Info className="w-4 h-4" />
                  Tile Metadata
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {tileMetadata ? (
                  <>
                    <div className="text-xs space-y-1">
                      <div>Processing Time: {processingTime.toFixed(2)}s</div>
                      <div>Annotations: {tileMetadata.annotation_count || 0}</div>
                      <div>Enhanced: {tileMetadata.tile_metadata?.enhanced ? 'Yes' : 'No'}</div>
                    </div>
                    
                    {tileMetadata.tile_metadata?.confidence_scores && (
                      <div className="space-y-1">
                        <label className="text-xs font-medium">Confidence Scores</label>
                        {Object.entries(tileMetadata.tile_metadata.confidence_scores).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-xs">
                            <span>{key}</span>
                            <span>{(value as number * 100).toFixed(1)}%</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-xs text-muted-foreground">
                    No metadata available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Zoom Controls (only when OSD is active for DZI) */}
        {isDzi && (
          <div className="absolute bottom-4 right-4 z-30 flex flex-col gap-2">
            <Button
              size="icon"
              onClick={() => osdRef.current?.viewer?.zoomIn()}
              className="bg-primary/20 backdrop-blur border border-primary/30"
            >
              <ZoomIn className="w-5 h-5" />
            </Button>
            <Button
              size="icon"
              onClick={() => osdRef.current?.viewer?.zoomOut()}
              className="bg-accent/20 backdrop-blur border border-accent/30"
            >
              <ZoomOut className="w-5 h-5" />
            </Button>
            <Button
              size="icon"
              onClick={() => osdRef.current?.viewer?.viewport?.goHome()}
              className="bg-secondary backdrop-blur border border-border"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
            <Button
              size="icon"
              onClick={toggleFullscreen}
              className="bg-secondary backdrop-blur border border-border"
            >
              <Maximize2 className="w-5 h-5" />
            </Button>
          </div>
        )}

        {/* Feature Overlay */}
        {renderFeatureOverlay()}

        {/* Viewer */}
        {isDzi ? (
          <div ref={viewerRef} className="w-full h-full" />
        ) : (
          <img src={imageUrl} alt={state.title} className="absolute inset-0 w-full h-full object-contain" />
        )}
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none">
        <div className="bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 backdrop-blur-lg rounded-lg px-6 py-3 border border-primary/30">
          <p className="text-sm font-medium bg-gradient-to-r from-primary via-accent to-primary-glow bg-clip-text text-transparent">
            🔍 Scroll to zoom • ✋ Drag to pan • 🖱️ Double-click to zoom in • 🧠 AI enhancement available
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIEnhancedViewer;
