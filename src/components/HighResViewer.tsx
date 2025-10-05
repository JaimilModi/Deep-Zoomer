import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import OpenSeadragon from "openseadragon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  X, 
  RotateCcw, 
  Settings, 
  Target,
  Info,
  Download,
  Share2,
  Layers,
  AlertTriangle,
  CheckCircle,
  Loader2
} from "lucide-react";

interface LocationState {
  imageUrl: string;
  thumbnailUrl?: string;
  title: string;
  description: string;
  nasaId: string;
}

const HighResViewer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  
  const viewerRef = useRef<HTMLDivElement>(null);
  const osdRef = useRef<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  
  // High-resolution settings
  const [tileSize, setTileSize] = useState(512);
  const [maxZoomLevel, setMaxZoomLevel] = useState(20);
  const [imageQuality, setImageQuality] = useState(95);
  const [pixelRatio, setPixelRatio] = useState(2);
  
  // Viewer state
  const [currentZoom, setCurrentZoom] = useState(1);
  const [currentCenter, setCurrentCenter] = useState({ x: 0, y: 0 });
  const [tileCount, setTileCount] = useState(0);
  const [loadingTiles, setLoadingTiles] = useState(0);
  const [loadedTiles, setLoadedTiles] = useState(0);
  const [failedTiles, setFailedTiles] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (!state) {
    navigate("/gallery");
    return null;
  }

  useEffect(() => {
    if (!viewerRef.current || !state.imageUrl) return;

    const container = viewerRef.current;
    container.style.position = "relative";
    setIsLoading(true);
    setError(null);

    // Create high-resolution tile source configuration
    const createTileSource = () => {
      // Check if it's a DZI file
      if (state.imageUrl.endsWith('.dzi')) {
        return {
          type: "dzi",
          url: state.imageUrl,
          tileSize: tileSize,
          overlap: 1,
          format: "jpg"
        };
      } else {
        // For regular images, create a tile source
        return {
          type: "image",
          url: state.imageUrl,
          buildPyramid: true,
          tileSize: tileSize,
          maxZoomLevel: maxZoomLevel
        };
      }
    };

    const tileSource = createTileSource();

    osdRef.current = OpenSeadragon({
      element: container,
      prefixUrl: "https://cdn.jsdelivr.net/npm/openseadragon@4.1/build/openseadragon/images/",
      tileSources: tileSource,
      showNavigator: true,
      showNavigationControl: true,
      showFullPageControl: true,
      showZoomControl: true,
      showHomeControl: true,
      showRotationControl: true,
      
      // High-resolution configuration
      maxZoomPixelRatio: pixelRatio,
      minZoomImageRatio: 0.01,
      maxZoomLevel: maxZoomLevel,
      minZoomLevel: 0,
      
      // Tile configuration for high quality
      tileSize: tileSize,
      imageLoaderLimit: 4, // Increased for better performance
      timeout: 60000, // Longer timeout for high-res tiles
      
      // Smooth zooming and panning
      springStiffness: 8.0,
      animationTime: 0.8,
      blendTime: 0.05,
      constrainDuringPan: false,
      
      // Gesture settings for precise control
      gestureSettingsMouse: {
        scrollToZoom: true,
        clickToZoom: true,
        dblClickToZoom: true,
        flickEnabled: true,
        pinchToZoom: true,
        zoomBy: 1.2,
      },
      gestureSettingsTouch: {
        scrollToZoom: true,
        clickToZoom: true,
        dblClickToZoom: true,
        flickEnabled: true,
        pinchToZoom: true,
        zoomBy: 1.2,
      },
      
      // Image quality settings
      imageLoaderLimit: 4,
      loadTilesWithAjax: true,
      ajaxWithCredentials: false,
      
      // Retry configuration for reliability
      tileRetryMax: 5,
      tileRetryDelay: 2000,
      tileLoadTimeout: 60000,
      
      // Performance optimization
      useCanvas: true,
      preserveViewport: true,
      preserveImageSize: true,
    });

    const viewer = osdRef.current;

    // Enhanced event handlers for high-resolution loading
    viewer.addHandler("open", () => {
      console.log("✅ High-resolution image opened successfully");
      setIsLoading(false);
      setError(null);
    });

    viewer.addHandler("tile-loaded", (event: any) => {
      setLoadedTiles(prev => prev + 1);
      setLoadingTiles(prev => Math.max(0, prev - 1));
    });

    viewer.addHandler("tile-load-failed", (event: any) => {
      console.warn("Tile load failed:", event);
      setFailedTiles(prev => prev + 1);
      setLoadingTiles(prev => Math.max(0, prev - 1));
    });

    viewer.addHandler("tile-drawing", (event: any) => {
      setLoadingTiles(prev => prev + 1);
    });

    viewer.addHandler("tile-drawn", (event: any) => {
      setLoadingTiles(prev => Math.max(0, prev - 1));
    });

    viewer.addHandler("zoom", () => {
      if (osdRef.current) {
        const zoom = osdRef.current.viewport.getZoom();
        setCurrentZoom(zoom);
        
        // Update tile count for current zoom level
        const bounds = osdRef.current.viewport.getBounds();
        const zoomLevel = Math.ceil(Math.log2(1 / bounds.width));
        setTileCount(Math.pow(2, zoomLevel));
      }
    });

    viewer.addHandler("pan", () => {
      if (osdRef.current) {
        const center = osdRef.current.viewport.getCenter();
        setCurrentCenter({ x: center.x, y: center.y });
      }
    });

    viewer.addHandler("error", (event: any) => {
      console.error("Viewer error:", event);
      setError("Failed to load high-resolution image. Please try again.");
      setIsLoading(false);
    });

    return () => {
      viewer.removeHandler("open");
      viewer.removeHandler("tile-loaded");
      viewer.removeHandler("tile-load-failed");
      viewer.removeHandler("tile-drawing");
      viewer.removeHandler("tile-drawn");
      viewer.removeHandler("zoom");
      viewer.removeHandler("pan");
      viewer.removeHandler("error");
      if (osdRef.current && osdRef.current.destroy) {
        osdRef.current.destroy();
      }
    };
  }, [state.imageUrl, tileSize, maxZoomLevel, pixelRatio]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const zoomToFit = () => {
    if (osdRef.current) {
      osdRef.current.viewport.goHome();
    }
  };

  const zoomToLevel = (level: number) => {
    if (osdRef.current) {
      osdRef.current.viewport.zoomTo(level);
    }
  };

  const centerView = () => {
    if (osdRef.current) {
      osdRef.current.viewport.panTo(new OpenSeadragon.Point(0.5, 0.5));
    }
  };

  const retryLoading = () => {
    setError(null);
    setIsLoading(true);
    setLoadedTiles(0);
    setFailedTiles(0);
    setLoadingTiles(0);
    
    // Force reload
    if (osdRef.current) {
      osdRef.current.world.removeAll();
      osdRef.current.addTiledImage({
        tileSource: state.imageUrl,
        success: () => {
          console.log("Retry successful");
          setIsLoading(false);
        },
        error: (event: any) => {
          console.error("Retry failed:", event);
          setError("Failed to load image after retry");
          setIsLoading(false);
        }
      });
    }
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
            onClick={() => setShowInfo(!showInfo)}
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
        {/* High-Resolution Controls Panel */}
        {showControls && (
          <div className="absolute top-4 left-4 z-30 w-80">
            <Card className="bg-card/90 backdrop-blur border-border">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Target className="w-4 h-4" />
                  High-Resolution Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Tile Size Control */}
                <div className="space-y-2">
                  <label className="text-sm">Tile Size: {tileSize}px</label>
                  <input
                    type="range"
                    min="256"
                    max="1024"
                    step="64"
                    value={tileSize}
                    onChange={(e) => setTileSize(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground">
                    Larger tiles = better quality, slower loading
                  </div>
                </div>

                {/* Max Zoom Level */}
                <div className="space-y-2">
                  <label className="text-sm">Max Zoom Level: {maxZoomLevel}</label>
                  <input
                    type="range"
                    min="10"
                    max="30"
                    step="1"
                    value={maxZoomLevel}
                    onChange={(e) => setMaxZoomLevel(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground">
                    Higher levels = more zoom, more tiles
                  </div>
                </div>

                {/* Pixel Ratio */}
                <div className="space-y-2">
                  <label className="text-sm">Pixel Ratio: {pixelRatio}x</label>
                  <input
                    type="range"
                    min="1"
                    max="4"
                    step="0.5"
                    value={pixelRatio}
                    onChange={(e) => setPixelRatio(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground">
                    Higher values = sharper images, more memory
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    onClick={() => zoomToLevel(1)}
                    variant="outline"
                  >
                    Fit to Screen
                  </Button>
                  <Button
                    size="sm"
                    onClick={centerView}
                    variant="outline"
                  >
                    Center View
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Info Panel */}
        {showInfo && (
          <div className="absolute top-4 right-4 z-30 w-80">
            <Card className="bg-card/90 backdrop-blur border-border">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Info className="w-4 h-4" />
                  Loading Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-xs space-y-1">
                  <div>Current Zoom: {currentZoom.toFixed(2)}x</div>
                  <div>Center: ({currentCenter.x.toFixed(3)}, {currentCenter.y.toFixed(3)})</div>
                  <div>Tiles at this zoom: {tileCount}</div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-medium">Tile Loading</label>
                  <div className="text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      Loaded: {loadedTiles}
                    </div>
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
                      Loading: {loadingTiles}
                    </div>
                    {failedTiles > 0 && (
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-3 h-3 text-red-500" />
                        Failed: {failedTiles}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <span className="font-semibold text-red-700">Loading Error</span>
                </div>
                <p className="text-sm text-red-600 mb-3">{error}</p>
                <Button onClick={retryLoading} size="sm" variant="outline">
                  Retry Loading
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
            <Card className="bg-card/90 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span className="text-sm">Loading high-resolution image...</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Zoom Controls */}
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
            onClick={zoomToFit}
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

        {/* Viewer */}
        <div ref={viewerRef} className="w-full h-full" />
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none">
        <div className="bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 backdrop-blur-lg rounded-lg px-6 py-3 border border-primary/30">
          <p className="text-sm font-medium bg-gradient-to-r from-primary via-accent to-primary-glow bg-clip-text text-transparent">
            🔍 Scroll to zoom • ✋ Drag to pan • 🖱️ Double-click to zoom in • 🎯 High-resolution loading enabled
          </p>
        </div>
      </div>
    </div>
  );
};

export default HighResViewer;
