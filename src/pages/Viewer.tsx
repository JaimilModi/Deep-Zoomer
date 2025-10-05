import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import OpenSeadragon from "openseadragon";

const Viewer = () => {
  const viewerRef = useRef(null);
  const osdRef = useRef(null);
  const location = useLocation();
  const { imageUrl, title } = location.state || {};

  useEffect(() => {
    if (!viewerRef.current || !imageUrl) return;

    const container = viewerRef.current;
    container.style.position = "relative"; // enable overlay positioning

    osdRef.current = OpenSeadragon({
      element: container,
      prefixUrl:
        "https://cdn.jsdelivr.net/npm/openseadragon@4.1/build/openseadragon/images/",
      tileSources: imageUrl,
      showNavigator: true,
      animationTime: 0.5,
      blendTime: 0.1,
      constrainDuringPan: true,
      maxZoomPixelRatio: 1,
      gestureSettingsMouse: {
        scrollToZoom: true,
        clickToZoom: true,
        dblClickToZoom: true,
        flickEnabled: true,
      },
    });

    const viewer = osdRef.current;

    // Flash overlay on zoom
    const handleZoom = () => {
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
      container.appendChild(overlay);

      requestAnimationFrame(() => {
        overlay.style.opacity = "0";
        setTimeout(() => container.removeChild(overlay), 100);
      });
    };

    viewer.addHandler("zoom", handleZoom);

    return () => {
      viewer.removeHandler("zoom", handleZoom);
      if (osdRef.current && osdRef.current.destroy) osdRef.current.destroy();
    };
  }, [imageUrl]);

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      {/* Optional title overlay */}
      {title && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(0,0,0,0.4)",
            color: "white",
            padding: "4px 10px",
            borderRadius: "4px",
            zIndex: 10,
            fontSize: "16px",
            pointerEvents: "none",
          }}
        >
          {title}
        </div>
      )}
      <div ref={viewerRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default Viewer;
