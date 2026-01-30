import { Newspaper, Plus, Edit2, Trash2, Eye, EyeOff, Loader2, RefreshCw } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAdminNewsletters,
  useCreateNewsletter,
  useDeleteNewsletter,
  useToggleNewsletterPublish,
} from "@/hooks/useQueries";
import { uploadApi } from "@/lib/api";

const sources = [
  { value: "ALN_DRN", label: "ALN & DRN (Combined)" },
  { value: "ALN", label: "ALN - Accountability Lab Nepal" },
  { value: "DRN", label: "DRN - Digital Rights Nepal" },
  { value: "other", label: "Other" },
];

const AdminNewsletters = () => {
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [newNewsletter, setNewNewsletter] = useState({
    title: "",
    summary: "",
    source: "ALN_DRN" as string,
    publishedDate: "",
  });

  const { data, isLoading, isError, refetch } = useAdminNewsletters(page);
  const createMutation = useCreateNewsletter();
  const deleteMutation = useDeleteNewsletter();
  const togglePublishMutation = useToggleNewsletterPublish();

  const newsletters = data?.data || [];
  const pagination = data?.pagination;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix to store just the base64 data
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleAddNewsletter = async () => {
    if (!newNewsletter.title || !newNewsletter.summary) return;

    try {
      setUploading(true);
      let pdfData = "";
      let pdfFileName = "";

      if (selectedFile) {
        pdfData = await fileToBase64(selectedFile);
        pdfFileName = selectedFile.name;
      }

      await createMutation.mutateAsync({
        title: newNewsletter.title,
        summary: newNewsletter.summary,
        source: newNewsletter.source,
        publishedDate: newNewsletter.publishedDate || new Date().toISOString().split('T')[0],
        pdfData: pdfData || undefined,
        pdfFileName: pdfFileName || undefined,
      });

      setNewNewsletter({ title: "", summary: "", source: "ALN_DRN", publishedDate: "" });
      setSelectedFile(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Failed to create newsletter:", error);
    } finally {
      setUploading(false);
    }
  };

  const togglePublish = (id: number) => {
    togglePublishMutation.mutate(id);
  };

  const deleteNewsletter = (id: number) => {
    if (confirm("Are you sure you want to delete this newsletter?")) {
      deleteMutation.mutate(id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-section-monitoring/20">
                <Newspaper className="w-5 h-5 text-section-monitoring" />
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                Newsletters
              </h1>
            </div>
            <p className="text-muted-foreground">
              Manage election monitoring newsletters
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Newsletter
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card">
                <DialogHeader>
                  <DialogTitle>Add New Newsletter</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Nepal Election Monitor - Issue 13"
                      value={newNewsletter.title}
                      onChange={(e) =>
                        setNewNewsletter((prev) => ({ ...prev, title: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="summary">Summary</Label>
                    <Textarea
                      id="summary"
                      placeholder="Brief summary of this issue"
                      value={newNewsletter.summary}
                      onChange={(e) =>
                        setNewNewsletter((prev) => ({ ...prev, summary: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Source</Label>
                    <Select
                      value={newNewsletter.source}
                      onValueChange={(value) =>
                        setNewNewsletter((prev) => ({ ...prev, source: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sources.map((src) => (
                          <SelectItem key={src.value} value={src.value}>
                            {src.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Publication Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newNewsletter.publishedDate}
                      onChange={(e) =>
                        setNewNewsletter((prev) => ({ ...prev, publishedDate: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Upload PDF</Label>
                    <Input type="file" accept=".pdf" onChange={handleFileChange} />
                    {selectedFile && (
                      <p className="text-sm text-muted-foreground">Selected: {selectedFile.name}</p>
                    )}
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleAddNewsletter}
                    disabled={uploading || createMutation.isPending}
                  >
                    {uploading || createMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Add Newsletter"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {isError && (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">Failed to load newsletters</p>
            <Button variant="outline" onClick={() => refetch()}>Try Again</Button>
          </div>
        )}

        {!isLoading && !isError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="admin-card overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Title</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Date</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Source</th>
                    <th className="text-center p-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {newsletters.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground">
                        No newsletters found. Add your first newsletter!
                      </td>
                    </tr>
                  ) : (
                    newsletters.map((newsletter) => (
                      <tr key={newsletter.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <p className="font-medium text-foreground">{newsletter.title}</p>
                          <p className="text-sm text-muted-foreground mt-1 truncate max-w-xs">{newsletter.summary}</p>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground hidden md:table-cell">
                          {formatDate(newsletter.publishedDate)}
                        </td>
                        <td className="p-4 hidden lg:table-cell">
                          <span className="text-xs px-2 py-1 rounded bg-muted">
                            {newsletter.source}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <Switch
                              checked={newsletter.published}
                              onCheckedChange={() => togglePublish(newsletter.id)}
                              disabled={togglePublishMutation.isPending}
                            />
                            {newsletter.published ? (
                              <Eye className="w-4 h-4 text-accent" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button size="icon" variant="ghost"><Edit2 className="w-4 h-4" /></Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => deleteNewsletter(newsletter.id)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={!pagination.hasPrevPage}>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={!pagination.hasNextPage}>
                    Next
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminNewsletters;
