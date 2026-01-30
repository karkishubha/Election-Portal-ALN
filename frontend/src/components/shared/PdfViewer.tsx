import { useState, useEffect } from "react";
import { X, Download, ZoomIn, ZoomOut, Maximize2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PdfViewerProps {
  isOpen: boolean;
  onClose: () => void;
  pdfData?: string;
  pdfUrl?: string;
  title: string;
  fileName?: string;
}

const PdfViewer = ({ isOpen, onClose, pdfData, pdfUrl, title, fileName }: PdfViewerProps) => {
  const [zoom, setZoom] = useState(100);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Convert base64 to Blob URL for better browser compatibility
  useEffect(() => {
    if (!isOpen) {
      // Cleanup blob URL when dialog closes
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
        setBlobUrl(null);
      }
      return;
    }

    if (pdfData) {
      setLoading(true);
      try {
        // Remove data URL prefix if present
        const base64 = pdfData.startsWith('data:') 
          ? pdfData.split(',')[1] 
          : pdfData;
        
        // Convert base64 to binary
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Create blob and URL
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
      } catch (error) {
        console.error('Error converting PDF data:', error);
      } finally {
        setLoading(false);
      }
    } else if (pdfUrl) {
      setBlobUrl(pdfUrl);
    }

    // Cleanup on unmount
    return () => {
      if (blobUrl && pdfData) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [isOpen, pdfData, pdfUrl]);

  const handleDownload = () => {
    if (!blobUrl) return;
    
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName || `${title}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handleResetZoom = () => setZoom(100);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[95vw] h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="px-4 py-3 border-b flex flex-row items-center justify-between">
          <DialogTitle className="text-lg font-semibold truncate pr-4">
            {title}
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleZoomOut} title="Zoom Out">
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground min-w-[50px] text-center">
              {zoom}%
            </span>
            <Button variant="outline" size="sm" onClick={handleZoomIn} title="Zoom In">
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleResetZoom} title="Reset Zoom">
              <Maximize2 className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload} title="Download" disabled={!blobUrl}>
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose} title="Close">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-auto bg-muted/50 p-4" style={{ height: 'calc(90vh - 60px)' }}>
          {loading && (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading PDF...</span>
            </div>
          )}
          {!loading && !blobUrl && (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No PDF available</p>
            </div>
          )}
          {!loading && blobUrl && (
            <div 
              className="flex justify-center"
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
            >
              <embed
                src={blobUrl}
                type="application/pdf"
                className="bg-white shadow-lg rounded"
                style={{ 
                  width: '900px',
                  height: 'calc(90vh - 100px)',
                  minHeight: '700px'
                }}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PdfViewer;
