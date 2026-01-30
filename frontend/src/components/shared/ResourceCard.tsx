import { FileText, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { getFileUrl } from "@/lib/api";

interface ResourceCardProps {
  title: string;
  description: string;
  downloadUrl?: string;
  externalUrl?: string;
  date?: string;
  type?: "pdf" | "link" | "newsletter";
}

const ResourceCard = ({
  title,
  description,
  downloadUrl,
  externalUrl,
  date,
  type = "pdf",
}: ResourceCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="resource-item"
    >
      <div className="flex-shrink-0">
        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
          <FileText className="w-6 h-6 text-muted-foreground" />
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-foreground mb-1 line-clamp-2">{title}</h4>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{description}</p>
        {date && (
          <p className="text-xs text-muted-foreground/70">{date}</p>
        )}
      </div>

      <div className="flex-shrink-0 flex items-center gap-2">
        {downloadUrl && (
          <Button size="sm" variant="outline" asChild>
            <a href={getFileUrl(downloadUrl)} target="_blank" rel="noopener noreferrer">
              <Download className="w-4 h-4 mr-1" />
              Download
            </a>
          </Button>
        )}
        {externalUrl && (
          <Button size="sm" variant="outline" asChild>
            <a href={externalUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-1" />
              View
            </a>
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default ResourceCard;
