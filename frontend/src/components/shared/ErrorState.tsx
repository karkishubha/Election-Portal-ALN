import { AlertCircle, RefreshCw, WifiOff, ServerCrash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface ErrorStateProps {
  error?: Error | null;
  title?: string;
  message?: string;
  onRetry?: () => void;
  showRetry?: boolean;
  className?: string;
}

/**
 * Reusable error state component with user-friendly messaging
 * and optional retry functionality.
 */
const ErrorState = ({
  error,
  title,
  message,
  onRetry,
  showRetry = true,
  className = "",
}: ErrorStateProps) => {
  // Determine error type and appropriate messaging
  const getErrorDetails = () => {
    const errorMessage = error?.message?.toLowerCase() || "";
    
    // Network/Connection errors
    if (
      errorMessage.includes("failed to fetch") ||
      errorMessage.includes("network") ||
      errorMessage.includes("timeout") ||
      errorMessage.includes("net::err")
    ) {
      console.error("[ErrorState] Network error detected:", error?.message);
      return {
        icon: <WifiOff className="w-12 h-12 text-amber-500" />,
        title: title || "Connection Error",
        message: message || "Unable to connect to the server. Please check your internet connection and try again.",
        type: "network",
      };
    }
    
    // Server errors (5xx)
    if (
      errorMessage.includes("500") ||
      errorMessage.includes("502") ||
      errorMessage.includes("503") ||
      errorMessage.includes("server error")
    ) {
      console.error("[ErrorState] Server error detected:", error?.message);
      return {
        icon: <ServerCrash className="w-12 h-12 text-red-500" />,
        title: title || "Server Error",
        message: message || "Our servers are experiencing issues. Please try again in a few moments.",
        type: "server",
      };
    }
    
    // Default error
    console.error("[ErrorState] General error:", error?.message);
    return {
      icon: <AlertCircle className="w-12 h-12 text-destructive" />,
      title: title || "Something Went Wrong",
      message: message || "We couldn't load the content. Please try again.",
      type: "general",
    };
  };

  const errorDetails = getErrorDetails();

  const handleRetry = () => {
    console.log("[ErrorState] Retry requested by user");
    onRetry?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}
    >
      {/* Error Icon */}
      <div className="mb-4 p-4 rounded-full bg-muted/50">
        {errorDetails.icon}
      </div>
      
      {/* Error Title */}
      <h3 className="text-lg font-semibold text-foreground mb-2 text-center">
        {errorDetails.title}
      </h3>
      
      {/* Error Message */}
      <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
        {errorDetails.message}
      </p>
      
      {/* Retry Button */}
      {showRetry && onRetry && (
        <Button
          variant="outline"
          onClick={handleRetry}
          className="gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
      )}
      
      {/* Technical Details (collapsed, for debugging) */}
      {error && process.env.NODE_ENV === "development" && (
        <details className="mt-6 text-xs text-muted-foreground">
          <summary className="cursor-pointer hover:text-foreground">
            Technical Details
          </summary>
          <pre className="mt-2 p-3 bg-muted rounded-lg overflow-auto max-w-md">
            {error.message}
          </pre>
        </details>
      )}
    </motion.div>
  );
};

export default ErrorState;
