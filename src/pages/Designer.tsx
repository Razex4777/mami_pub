import { useState, useRef } from "react";
import { Button } from "@/components/ui/interactive/button";
import { Input } from "@/components/ui/forms/input";
import { Label } from "@/components/ui/forms/label";
import { Slider } from "@/components/ui/forms/slider";
import { Upload, Download, Save, Type, Image as ImageIcon, Square, Circle, Trash2, Move, Palette } from "lucide-react";

type DesignElement = {
  id: string;
  type: "text" | "image" | "shape";
  content: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  fontSize?: number;
  color?: string;
  rotation?: number;
};

const Designer = () => {
  const [elements, setElements] = useState<DesignElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [canvasBg, setCanvasBg] = useState("#ffffff");
  const [textInput, setTextInput] = useState("");
  const [fontSize, setFontSize] = useState(32);
  const [textColor, setTextColor] = useState("#000000");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addText = () => {
    if (!textInput.trim()) return;
    const newElement: DesignElement = {
      id: Date.now().toString(),
      type: "text",
      content: textInput,
      x: 50,
      y: 50,
      fontSize,
      color: textColor,
    };
    setElements([...elements, newElement]);
    setTextInput("");
  };

  const addShape = (type: "square" | "circle") => {
    const newElement: DesignElement = {
      id: Date.now().toString(),
      type: "shape",
      content: type,
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      color: textColor,
    };
    setElements([...elements, newElement]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const newElement: DesignElement = {
        id: Date.now().toString(),
        type: "image",
        content: event.target?.result as string,
        x: 50,
        y: 50,
        width: 200,
        height: 200,
      };
      setElements([...elements, newElement]);
    };
    reader.readAsDataURL(file);
  };

  const deleteElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id));
    if (selectedElement === id) setSelectedElement(null);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold mb-4 gradient-text">Concepteur Personnalisé</h1>
          <p className="text-secondary text-lg">
            Outils de conception professionnels pour créer des transferts DTF sur mesure
          </p>
        </div>

        <div className="grid grid-cols-12 gap-4 lg:gap-6">
          {/* Tools Panel */}
          <div className="col-span-12 lg:col-span-3">
            <div className="panel p-4 rounded-lg border border-border space-y-6 sticky top-24">
              <div>
                <h3 className="text-sm font-semibold mb-4 text-muted uppercase tracking-wider">
                  Outils
                </h3>
                
                {/* Text Tool */}
                <div className="space-y-3 mb-6 pb-6 border-b border-border">
                  <Label className="text-xs uppercase tracking-wide">Texte</Label>
                  <Input
                    placeholder="Entrez votre texte..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addText()}
                  />
                  <div className="space-y-2">
                    <Label className="text-xs">Taille: {fontSize}px</Label>
                    <Slider
                      value={[fontSize]}
                      onValueChange={([value]) => setFontSize(value)}
                      min={12}
                      max={120}
                      step={1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Couleur</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-16 h-10 cursor-pointer"
                      />
                      <Input
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <Button onClick={addText} className="w-full">
                    <Type className="h-4 w-4 mr-2" />
                    Ajouter Texte
                  </Button>
                </div>

                {/* Shapes */}
                <div className="space-y-3 mb-6 pb-6 border-b border-border">
                  <Label className="text-xs uppercase tracking-wide">Formes</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={() => addShape("square")} className="w-full">
                      <Square className="h-4 w-4 mr-2" />
                      Carré
                    </Button>
                    <Button variant="outline" onClick={() => addShape("circle")} className="w-full">
                      <Circle className="h-4 w-4 mr-2" />
                      Cercle
                    </Button>
                  </div>
                </div>

                {/* Image Upload */}
                <div className="space-y-3 mb-6 pb-6 border-b border-border">
                  <Label className="text-xs uppercase tracking-wide">Image</Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Télécharger Image
                  </Button>
                </div>

                {/* Canvas Background */}
                <div className="space-y-3">
                  <Label className="text-xs uppercase tracking-wide">Fond du Canvas</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={canvasBg}
                      onChange={(e) => setCanvasBg(e.target.value)}
                      className="w-16 h-10 cursor-pointer"
                    />
                    <Input
                      value={canvasBg}
                      onChange={(e) => setCanvasBg(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Canvas */}
          <div className="col-span-12 lg:col-span-6">
            <div className="panel-elevated rounded-lg border border-border p-4 md:p-8">
              <div
                className="relative aspect-square w-full mx-auto rounded-lg border-2 border-dashed border-border overflow-hidden shadow-glow"
                style={{ backgroundColor: canvasBg, maxWidth: "600px" }}
              >
                {elements.length === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Palette className="h-16 w-16 mx-auto mb-4 text-muted animate-pulse" />
                      <h3 className="text-xl font-semibold mb-2">Commencez votre création</h3>
                      <p className="text-secondary">
                        Utilisez les outils à gauche pour ajouter des éléments
                      </p>
                    </div>
                  </div>
                ) : (
                  elements.map((el) => (
                    <div
                      key={el.id}
                      className={`absolute cursor-move transition-smooth ${
                        selectedElement === el.id ? "ring-2 ring-primary" : ""
                      }`}
                      style={{
                        left: `${el.x}px`,
                        top: `${el.y}px`,
                        transform: `rotate(${el.rotation || 0}deg)`,
                      }}
                      onClick={() => setSelectedElement(el.id)}
                    >
                      {el.type === "text" && (
                        <div
                          style={{
                            fontSize: `${el.fontSize}px`,
                            color: el.color,
                            fontWeight: 600,
                          }}
                        >
                          {el.content}
                        </div>
                      )}
                      {el.type === "shape" && el.content === "square" && (
                        <div
                          style={{
                            width: `${el.width}px`,
                            height: `${el.height}px`,
                            backgroundColor: el.color,
                          }}
                        />
                      )}
                      {el.type === "shape" && el.content === "circle" && (
                        <div
                          style={{
                            width: `${el.width}px`,
                            height: `${el.height}px`,
                            backgroundColor: el.color,
                            borderRadius: "50%",
                          }}
                        />
                      )}
                      {el.type === "image" && (
                        <img
                          src={el.content}
                          alt="Design element"
                          style={{
                            width: `${el.width}px`,
                            height: `${el.height}px`,
                            objectFit: "contain",
                          }}
                        />
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="mt-6 flex flex-wrap gap-2 justify-between items-center">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Exporter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    Sauvegarder
                  </Button>
                </div>
                <Button className="bg-primary hover:bg-primary/90">
                  Ajouter au Panier
                </Button>
              </div>
            </div>
          </div>

          {/* Layers Panel */}
          <div className="col-span-12 lg:col-span-3">
            <div className="panel p-4 rounded-lg border border-border sticky top-24">
              <h3 className="text-sm font-semibold mb-4 text-muted uppercase tracking-wider">
                Calques
              </h3>
              {elements.length === 0 ? (
                <p className="text-sm text-secondary">Aucun élément</p>
              ) : (
                <div className="space-y-2">
                  {elements.map((el) => (
                    <div
                      key={el.id}
                      className={`flex items-center justify-between p-2 rounded-lg transition-smooth cursor-pointer ${
                        selectedElement === el.id
                          ? "bg-primary/10 border border-primary"
                          : "bg-muted hover:bg-muted/80"
                      }`}
                      onClick={() => setSelectedElement(el.id)}
                    >
                      <div className="flex items-center gap-2">
                        {el.type === "text" && <Type className="h-4 w-4" />}
                        {el.type === "image" && <ImageIcon className="h-4 w-4" />}
                        {el.type === "shape" && <Square className="h-4 w-4" />}
                        <span className="text-sm truncate max-w-[120px]">
                          {el.type === "text" ? el.content : el.type}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteElement(el.id);
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-6 pt-6 border-t border-border space-y-3">
                <div>
                  <p className="text-xs text-muted mb-1">Dimensions</p>
                  <p className="text-sm">30cm × 30cm</p>
                </div>
                <div>
                  <p className="text-xs text-muted mb-1">Résolution</p>
                  <p className="text-sm">300 DPI</p>
                </div>
                <div>
                  <p className="text-xs text-muted mb-1">Format</p>
                  <p className="text-sm">PNG, PDF, AI</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Designer;
