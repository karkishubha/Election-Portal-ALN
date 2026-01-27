import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Vote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/admin/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(credentials.email, credentials.password);
      toast({
        title: "Login Successful",
        description: "Welcome to the Admin Portal",
      });
      navigate("/admin/dashboard");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Invalid credentials";
      toast({
        title: "Login Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-muted/50 to-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary mb-4">
            <Vote className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Admin Portal
          </h1>
          <p className="text-muted-foreground text-sm mt-2">
            Nepal Election Portal 2082
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-card rounded-xl border border-border p-6 md:p-8 shadow-lg">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
            <div className="p-2 rounded-lg bg-accent/10">
              <Lock className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Secure Login</h2>
              <p className="text-xs text-muted-foreground">
                Authorized personnel only
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={credentials.email}
                onChange={(e) =>
                  setCredentials((prev) => ({ ...prev, email: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={credentials.password}
                onChange={(e) =>
                  setCredentials((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-6">
            Having trouble logging in?{" "}
            <a href="mailto:info@accountabilitylab.org" className="text-accent hover:underline">
              Contact support
            </a>
          </p>
        </div>

        {/* Back to Portal */}
        <div className="text-center mt-6">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            ← Back to Public Portal
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
