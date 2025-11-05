import { FileText, Video, BookOpen, Download } from "lucide-react";
import { Button } from "@/components/ui/interactive/button";

const resources = [
  {
    title: "DTF Transfer Application Guide",
    type: "PDF Guide",
    icon: FileText,
    description: "Complete step-by-step instructions for applying DTF transfers to various materials.",
  },
  {
    title: "Heat Press Settings Reference",
    type: "Technical Document",
    icon: BookOpen,
    description: "Temperature, pressure, and timing specifications for all material types.",
  },
  {
    title: "Material Compatibility Chart",
    type: "Reference Table",
    icon: Download,
    description: "Comprehensive compatibility matrix for fabrics, films, and transfer types.",
  },
  {
    title: "Professional Application Tutorial",
    type: "Video Series",
    icon: Video,
    description: "Watch expert techniques for commercial-grade DTF application.",
  },
  {
    title: "Troubleshooting Common Issues",
    type: "PDF Guide",
    icon: FileText,
    description: "Solutions for adhesion, color, and durability challenges.",
  },
  {
    title: "Care & Maintenance Instructions",
    type: "Technical Document",
    icon: BookOpen,
    description: "Best practices for equipment maintenance and transfer longevity.",
  },
];

const Resources = () => {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold mb-4">Resource Center</h1>
          <p className="text-secondary text-lg">
            Technical documentation, guides, and tutorials for professional DTF printing
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource, index) => {
            const Icon = resource.icon;
            return (
              <div
                key={index}
                className="panel p-6 rounded-lg border border-border hover-lift"
              >
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                
                <p className="text-xs text-muted uppercase tracking-wider mb-2">
                  {resource.type}
                </p>
                
                <h3 className="text-lg font-semibold mb-3">
                  {resource.title}
                </h3>
                
                <p className="text-sm text-secondary mb-4 leading-relaxed">
                  {resource.description}
                </p>

                <Button
                  variant="outline"
                  size="sm"
                  className="border-border hover:bg-muted"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Resources;
