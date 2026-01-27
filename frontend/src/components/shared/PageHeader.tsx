import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description: string;
  icon?: ReactNode;
  accentColor?: string;
}

const PageHeader = ({ title, description, icon, accentColor = "bg-accent" }: PageHeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-muted/50 border-b border-border"
    >
      <div className="civic-container py-12 md:py-16">
        <div className="flex items-start gap-4">
          {icon && (
            <div className={`p-3 rounded-xl ${accentColor} text-white hidden sm:block`}>
              {icon}
            </div>
          )}
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              {title}
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PageHeader;
