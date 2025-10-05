import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Target, 
  Circle, 
  Square, 
  Polygon,
  Type,
  Image as ImageIcon,
  Download,
  Upload,
  Eye,
  EyeOff,
  Filter,
  Search
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Annotation {
  id: string;
  type: 'point' | 'circle' | 'rectangle' | 'polygon' | 'text';
  coordinates: number[];
  properties: {
    label: string;
    description?: string;
    confidence?: number;
    category: string;
    color: string;
  };
  created_at: string;
  updated_at: string;
}

interface AnnotationSystemProps {
  imageId: string;
  tileCoordinates: { z: number; x: number; y: number };
  onAnnotationCreate?: (annotation: Annotation) => void;
  onAnnotationUpdate?: (annotation: Annotation) => void;
  onAnnotationDelete?: (annotationId: string) => void;
}

const AnnotationSystem = ({
  imageId,
  tileCoordinates,
  onAnnotationCreate,
  onAnnotationUpdate,
  onAnnotationDelete
}: AnnotationSystemProps) => {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingMode, setDrawingMode] = useState<'point' | 'circle' | 'rectangle' | 'polygon' | 'text'>('point');
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Drawing state
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);
  const [isPolygonMode, setIsPolygonMode] = useState(false);

  const annotationCategories = [
    'crater',
    'lava_flow',
    'dust_storm',
    'rover_track',
    'cloud',
    'ice_cap',
    'mountain',
    'valley',
    'other'
  ];

  const annotationColors = [
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57',
    '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43'
  ];

  useEffect(() => {
    loadAnnotations();
  }, [imageId, tileCoordinates]);

  const loadAnnotations = async () => {
    try {
      const response = await fetch(
        `/api/annotations/image/${imageId}?z=${tileCoordinates.z}&x=${tileCoordinates.x}&y=${tileCoordinates.y}`
      );
      if (response.ok) {
        const data = await response.json();
        setAnnotations(data.annotations || []);
      }
    } catch (error) {
      console.error('Error loading annotations:', error);
    }
  };

  const handleCanvasMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    if (drawingMode === 'point') {
      createPointAnnotation(x, y);
    } else if (drawingMode === 'circle' || drawingMode === 'rectangle') {
      setStartPoint({ x, y });
      setIsDrawing(true);
    } else if (drawingMode === 'polygon') {
      if (!isPolygonMode) {
        setCurrentPath([{ x, y }]);
        setIsPolygonMode(true);
      } else {
        setCurrentPath(prev => [...prev, { x, y }]);
      }
    }
  };

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Redraw canvas with current drawing
    redrawCanvas();
    drawCurrentShape(startPoint, { x, y });
  };

  const handleCanvasMouseUp = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    if (drawingMode === 'circle') {
      createCircleAnnotation(startPoint, { x, y });
    } else if (drawingMode === 'rectangle') {
      createRectangleAnnotation(startPoint, { x, y });
    }
    
    setIsDrawing(false);
    setStartPoint(null);
  };

  const createPointAnnotation = (x: number, y: number) => {
    const annotation: Annotation = {
      id: Date.now().toString(),
      type: 'point',
      coordinates: [x, y],
      properties: {
        label: 'New Point',
        category: 'other',
        color: annotationColors[0]
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    addAnnotation(annotation);
  };

  const createCircleAnnotation = (start: { x: number; y: number }, end: { x: number; y: number }) => {
    const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
    const annotation: Annotation = {
      id: Date.now().toString(),
      type: 'circle',
      coordinates: [start.x, start.y, radius],
      properties: {
        label: 'New Circle',
        category: 'other',
        color: annotationColors[1]
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    addAnnotation(annotation);
  };

  const createRectangleAnnotation = (start: { x: number; y: number }, end: { x: number; y: number }) => {
    const x = Math.min(start.x, end.x);
    const y = Math.min(start.y, end.y);
    const width = Math.abs(end.x - start.x);
    const height = Math.abs(end.y - start.y);
    
    const annotation: Annotation = {
      id: Date.now().toString(),
      type: 'rectangle',
      coordinates: [x, y, width, height],
      properties: {
        label: 'New Rectangle',
        category: 'other',
        color: annotationColors[2]
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    addAnnotation(annotation);
  };

  const finishPolygon = () => {
    if (currentPath.length < 3) return;
    
    const annotation: Annotation = {
      id: Date.now().toString(),
      type: 'polygon',
      coordinates: currentPath.flatMap(p => [p.x, p.y]),
      properties: {
        label: 'New Polygon',
        category: 'other',
        color: annotationColors[3]
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    addAnnotation(annotation);
    setCurrentPath([]);
    setIsPolygonMode(false);
  };

  const addAnnotation = async (annotation: Annotation) => {
    try {
      const response = await fetch('/api/annotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_id: imageId,
          tile_coordinates: tileCoordinates,
          annotation_type: annotation.properties.category,
          geometry: {
            type: annotation.type,
            coordinates: annotation.coordinates
          },
          properties: annotation.properties,
          confidence: annotation.properties.confidence || 0.8
        })
      });
      
      if (response.ok) {
        const newAnnotation = await response.json();
        setAnnotations(prev => [...prev, newAnnotation]);
        onAnnotationCreate?.(newAnnotation);
        toast({
          title: "Annotation Created",
          description: "Your annotation has been saved.",
        });
      }
    } catch (error) {
      console.error('Error creating annotation:', error);
      toast({
        title: "Error",
        description: "Failed to create annotation.",
        variant: "destructive"
      });
    }
  };

  const updateAnnotation = async (annotation: Annotation) => {
    try {
      const response = await fetch(`/api/annotations/${annotation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          annotation_type: annotation.properties.category,
          geometry: {
            type: annotation.type,
            coordinates: annotation.coordinates
          },
          properties: annotation.properties,
          confidence: annotation.properties.confidence
        })
      });
      
      if (response.ok) {
        const updatedAnnotation = await response.json();
        setAnnotations(prev => prev.map(a => a.id === annotation.id ? updatedAnnotation : a));
        onAnnotationUpdate?.(updatedAnnotation);
        toast({
          title: "Annotation Updated",
          description: "Your annotation has been updated.",
        });
      }
    } catch (error) {
      console.error('Error updating annotation:', error);
      toast({
        title: "Error",
        description: "Failed to update annotation.",
        variant: "destructive"
      });
    }
  };

  const deleteAnnotation = async (annotationId: string) => {
    try {
      const response = await fetch(`/api/annotations/${annotationId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setAnnotations(prev => prev.filter(a => a.id !== annotationId));
        onAnnotationDelete?.(annotationId);
        toast({
          title: "Annotation Deleted",
          description: "Your annotation has been deleted.",
        });
      }
    } catch (error) {
      console.error('Error deleting annotation:', error);
      toast({
        title: "Error",
        description: "Failed to delete annotation.",
        variant: "destructive"
      });
    }
  };

  const redrawCanvas = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw all annotations
    annotations.forEach(annotation => {
      drawAnnotation(ctx, annotation);
    });
  };

  const drawAnnotation = (ctx: CanvasRenderingContext2D, annotation: Annotation) => {
    ctx.strokeStyle = annotation.properties.color;
    ctx.fillStyle = annotation.properties.color + '20';
    ctx.lineWidth = 2;
    
    switch (annotation.type) {
      case 'point':
        ctx.beginPath();
        ctx.arc(annotation.coordinates[0], annotation.coordinates[1], 5, 0, 2 * Math.PI);
        ctx.fill();
        break;
        
      case 'circle':
        const [cx, cy, radius] = annotation.coordinates;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
        ctx.stroke();
        break;
        
      case 'rectangle':
        const [x, y, width, height] = annotation.coordinates;
        ctx.strokeRect(x, y, width, height);
        break;
        
      case 'polygon':
        if (annotation.coordinates.length >= 6) {
          ctx.beginPath();
          ctx.moveTo(annotation.coordinates[0], annotation.coordinates[1]);
          for (let i = 2; i < annotation.coordinates.length; i += 2) {
            ctx.lineTo(annotation.coordinates[i], annotation.coordinates[i + 1]);
          }
          ctx.closePath();
          ctx.stroke();
        }
        break;
    }
  };

  const drawCurrentShape = (start: { x: number; y: number }, end: { x: number; y: number }) => {
    if (!canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    ctx.strokeStyle = '#ff6b6b';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    
    if (drawingMode === 'circle') {
      const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
      ctx.beginPath();
      ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI);
      ctx.stroke();
    } else if (drawingMode === 'rectangle') {
      ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
    }
    
    ctx.setLineDash([]);
  };

  const filteredAnnotations = annotations.filter(annotation => {
    const matchesType = filterType === 'all' || annotation.properties.category === filterType;
    const matchesSearch = searchQuery === '' || 
      annotation.properties.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      annotation.properties.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Button
            variant={drawingMode === 'point' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDrawingMode('point')}
          >
            <Target className="w-4 h-4" />
          </Button>
          <Button
            variant={drawingMode === 'circle' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDrawingMode('circle')}
          >
            <Circle className="w-4 h-4" />
          </Button>
          <Button
            variant={drawingMode === 'rectangle' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDrawingMode('rectangle')}
          >
            <Square className="w-4 h-4" />
          </Button>
          <Button
            variant={drawingMode === 'polygon' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDrawingMode('polygon')}
          >
            <Polygon className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAnnotations(!showAnnotations)}
          >
            {showAnnotations ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="w-full h-full border border-border"
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
        />
        
        {/* Polygon Finish Button */}
        {isPolygonMode && (
          <div className="absolute top-4 left-4">
            <Button onClick={finishPolygon}>
              Finish Polygon
            </Button>
          </div>
        )}
      </div>

      {/* Annotation List */}
      <div className="border-t border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Annotations ({filteredAnnotations.length})</h3>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search annotations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48"
            />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {annotationCategories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto">
          {filteredAnnotations.map(annotation => (
            <Card
              key={annotation.id}
              className={`cursor-pointer transition-colors ${
                selectedAnnotation?.id === annotation.id ? 'border-primary' : ''
              }`}
              onClick={() => setSelectedAnnotation(annotation)}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: annotation.properties.color }}
                    />
                    <span className="font-medium text-sm">
                      {annotation.properties.label}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {annotation.properties.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAnnotation(annotation);
                      }}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteAnnotation(annotation.id);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                {annotation.properties.description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {annotation.properties.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Annotation Editor */}
      {selectedAnnotation && (
        <div className="border-t border-border p-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Edit Annotation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium">Label</label>
                <Input
                  value={selectedAnnotation.properties.label}
                  onChange={(e) => setSelectedAnnotation(prev => prev ? {
                    ...prev,
                    properties: {
                      ...prev.properties,
                      label: e.target.value
                    }
                  } : null)}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={selectedAnnotation.properties.category}
                  onValueChange={(value) => setSelectedAnnotation(prev => prev ? {
                    ...prev,
                    properties: {
                      ...prev.properties,
                      category: value
                    }
                  } : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {annotationCategories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={selectedAnnotation.properties.description || ''}
                  onChange={(e) => setSelectedAnnotation(prev => prev ? {
                    ...prev,
                    properties: {
                      ...prev.properties,
                      description: e.target.value
                    }
                  } : null)}
                  rows={2}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    updateAnnotation(selectedAnnotation);
                    setSelectedAnnotation(null);
                  }}
                >
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedAnnotation(null)}
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AnnotationSystem;
