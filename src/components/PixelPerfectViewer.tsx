import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import OpenSeadragon from "openseadragon";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  AlertTriangle
} from "lucide-react";

interface LocationState {
  imageUrl: string;
  thumbnailUrl?: string;
  title: string;
  description: string;
  nasaId: string;
}

const PixelPerfectViewer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  
  const viewerRef = useRef<HTMLDivElement>(null);
  const osdRef = useRef<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  
  // Pixel-perfect settings
  const [pixelRatio, setPixelRatio] = useState(2);
  const [tileSize, setTileSize] = useState(512);
  const [maxZoomLevel, setMaxZoomLevel] = useState(20);
  const [imageQuality, setImageQuality] = useState(95);
  
  // Viewer state
  const [currentZoom, setCurrentZoom] = useState(1);
  const [currentCenter, setCurrentCenter] = useState({ x: 0, y: 0 });
  const [tileCount, setTileCount] = useState(0);
  const [loadingTiles, setLoadingTiles] = useState(0);

  if (!state) {
    navigate("/gallery");
    return null;
  }

  useEffect(() => {
    if (!viewerRef.current || !state.imageUrl) return;

    const container = viewerRef.current;
    container.style.position = "relative";

    // Enhanced tile source configuration for pixel-perfect rendering
    const tileSource = {
      type: "dzi",
      url: state.imageUrl,
      tileSize: 256, // Match DZI tile size
      overlap: 1,
      format: "jpg"
    };

    osdRef.current = OpenSeadragon({
      element: container,
      prefixUrl: "https://cdn.jsdelivr.net/npm/openseadragon@4.1/build/openseadragon/images/",
      tileSources: tileSource,
      showNavigator: true,
      showNavigationControl: true,
      showSequenceControl: false,
      showFullPageControl: true,
      showZoomControl: true,
      showHomeControl: true,
      showRotationControl: true,
      
      // Pixel-perfect zooming configuration
      maxZoomPixelRatio: pixelRatio, // Critical for crisp rendering
      minZoomImageRatio: 0.01, // Allow extreme zoom out
      maxZoomLevel: maxZoomLevel,
      minZoomLevel: 0,
      
      // Tile configuration for maximum quality
      tileSize: tileSize,
      imageLoaderLimit: 3, // Reduce concurrent loads for stability
      timeout: 60000, // Longer timeout for high-res tiles
      
      // Smooth zooming and panning
      springStiffness: 8.0, // Higher stiffness for more responsive feel
      animationTime: 0.8, // Faster animations
      blendTime: 0.05, // Minimal blending for crisp edges
      constrainDuringPan: false, // Allow free panning
      
      // Gesture settings for precise control
      gestureSettingsMouse: {
        scrollToZoom: true,
        clickToZoom: true,
        dblClickToZoom: true,
        flickEnabled: true,
        pinchToZoom: true,
        // Precise zoom control
        zoomBy: 1.2, // Smaller zoom increments
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
      imageLoaderLimit: 3,
      loadTilesWithAjax: true,
      ajaxWithCredentials: false,
      
      // Retry configuration for reliability
      tileRetryMax: 5,
      tileRetryDelay: 2000,
      tileLoadTimeout: 60000,
      
      // Performance optimization
      preserveViewport: true,
      preserveImageSize: true,
      
      // High-DPI support
      useCanvas: true, // Use Canvas for better performance
    });

    const viewer = osdRef.current;

    // Enhanced event handlers for pixel-perfect experience
    viewer.addHandler("zoom", handleZoom);
    viewer.addHandler("pan", handlePan);
    viewer.addHandler("tile-loaded", handleTileLoaded);
    viewer.addHandler("tile-load-failed", handleTileLoadFailed);
    viewer.addHandler("tile-drawing", handleTileDrawing);
    viewer.addHandler("tile-drawn", handleTileDrawn);

    return () => {
      viewer.removeHandler("zoom", handleZoom);
      viewer.removeHandler("pan", handlePan);
      viewer.removeHandler("tile-loaded", handleTileLoaded);
      viewer.removeHandler("tile-load-failed", handleTileLoadFailed);
      viewer.removeHandler("tile-drawing", handleTileDrawing);
      viewer.removeHandler("tile-drawn", handleTileDrawn);
      if (osdRef.current && osdRef.current.destroy) {
        osdRef.current.destroy();
      }
    };
  }, [state.imageUrl, pixelRatio, tileSize, maxZoomLevel, imageQuality]);

  const handleZoom = () => {
    if (osdRef.current) {
      const zoom = osdRef.current.viewport.getZoom();
      setCurrentZoom(zoom);
      
      // Update tile count for current zoom level
      const bounds = osdRef.current.viewport.getBounds();
      const zoomLevel = Math.ceil(Math.log2(1 / bounds.width));
      setTileCount(Math.pow(2, zoomLevel));
    }
  };

  const handlePan = () => {
    if (osdRef.current) {
      const center = osdRef.current.viewport.getCenter();
      setCurrentCenter({ x: center.x, y: center.y });
    }
  };

  const handleTileLoaded = (event: any) => {
    setLoadingTiles(prev => Math.max(0, prev - 1));
  };

  const handleTileLoadFailed = (event: any) => {
    console.warn("Tile load failed:", event);
    setLoadingTiles(prev => Math.max(0, prev - 1));
  };

  const handleTileDrawing = (event: any) => {
    setLoadingTiles(prev => prev + 1);
  };

  const handleTileDrawn = (event: any) => {
    setLoadingTiles(prev => Math.max(0, prev - 1));
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
        {/* Pixel-Perfect Controls Panel */}
        {showControls && (
          <div className="absolute top-4 left-4 z-30 w-80">
            <Card className="bg-card/90 backdrop-blur border-border">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Target className="w-4 h-4" />
                  Pixel-Perfect Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Pixel Ratio Control */}
                <div className="space-y-2">
                  <label className="text-sm">Pixel Ratio: {pixelRatio}x</label>
                  <Slider
                    value={[pixelRatio]}
                    onValueChange={(value) => setPixelRatio(value[0])}
                    max={4}
                    min={1}
                    step={0.5}
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground">
                    Higher values = sharper images, more memory usage
                  </div>
                </div>

                {/* Tile Size Control */}
                <div className="space-y-2">
                  <label className="text-sm">Tile Size: {tileSize}px</label>
                  <Slider
                    value={[tileSize]}
                    onValueChange={(value) => setTileSize(value[0])}
                    max={1024}
                    min={256}
                    step={64}
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground">
                    Larger tiles = better quality, slower loading
                  </div>
                </div>

                {/* Max Zoom Level */}
                <div className="space-y-2">
                  <label className="text-sm">Max Zoom Level: {maxZoomLevel}</label>
                  <Slider
                    value={[maxZoomLevel]}
                    onValueChange={(value) => setMaxZoomLevel(value[0])}
                    max={30}
                    min={10}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground">
                    Higher levels = more zoom, more tiles
                  </div>
                </div>

                {/* Image Quality */}
                <div className="space-y-2">
                  <label className="text-sm">Image Quality: {imageQuality}%</label>
                  <Slider
                    value={[imageQuality]}
                    onValueChange={(value) => setImageQuality(value[0])}
                    max={100}
                    min={50}
                    step={5}
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground">
                    Higher quality = better images, larger files
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
                  Viewer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-xs space-y-1">
                  <div>Current Zoom: {currentZoom.toFixed(2)}x</div>
                  <div>Center: ({currentCenter.x.toFixed(3)}, {currentCenter.y.toFixed(3)})</div>
                  <div>Tiles at this zoom: {tileCount}</div>
                  <div>Loading tiles: {loadingTiles}</div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-medium">Performance</label>
                  <div className="text-xs text-muted-foreground">
                    <div>Pixel Ratio: {pixelRatio}x</div>
                    <div>Tile Size: {tileSize}px</div>
                    <div>Max Zoom: {maxZoomLevel}</div>
                    <div>Quality: {imageQuality}%</div>
                  </div>
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

        {/* Loading Indicator */}
        {loadingTiles > 0 && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
            <div className="bg-card/90 backdrop-blur rounded-lg px-4 py-2 border border-border">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-sm">Loading {loadingTiles} tiles...</span>
              </div>
            </div>
          </div>
        )}

        {/* Viewer */}
        <div ref={viewerRef} className="w-full h-full" />
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none">
        <div className="bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 backdrop-blur-lg rounded-lg px-6 py-3 border border-primary/30">
          <p className="text-sm font-medium bg-gradient-to-r from-primary via-accent to-primary-glow bg-clip-text text-transparent">
            🔍 Scroll to zoom • ✋ Drag to pan • 🖱️ Double-click to zoom in • 🎯 Pixel-perfect rendering enabled
          </p>
        </div>
      </div>
    </div>
  );
};

export default PixelPerfectViewer;
