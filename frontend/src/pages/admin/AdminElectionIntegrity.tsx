import { Shield, Plus, Edit2, Trash2, Eye, EyeOff, Loader2, RefreshCw } from "lucide-react";
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
  useAdminElectionIntegrity,
  useCreateElectionIntegrity,
  useDeleteElectionIntegrity,
  useToggleElectionIntegrityPublish,
} from "@/hooks/useQueries";
import { uploadApi } from "@/lib/api";

const categories = [
  { value: "code_of_conduct", label: "Code of Conduct" },
  { value: "misinformation", label: "Misinformation" },
  { value: "transparency", label: "Transparency" },
  { value: "observer_guide", label: "Observer Guide" },
  { value: "complaint_mechanism", label: "Complaint Mechanism" },
  { value: "legal_framework", label: "Legal Framework" },
  { value: "other", label: "Other" },
];

const AdminElectionIntegrity = () => {
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [newResource, setNewResource] = useState({
    title: "",
    description: "",
    category: "other" as string,
    language: "ne" as "en" | "ne" | "other",
  });

  const { data, isLoading, isError, refetch } = useAdminElectionIntegrity(page);
  const createMutation = useCreateElectionIntegrity();
  const deleteMutation = useDeleteElectionIntegrity();
  const togglePublishMutation = useToggleElectionIntegrityPublish();

  const resources = data?.data || [];
  const pagination = data?.pagination;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleAddResource = async () => {
    if (!newResource.title || !newResource.description) return;

    try {
      setUploading(true);
      let pdfUrl = "";

      if (selectedFile) {
        const uploadResult = await uploadApi.uploadPdf(selectedFile);
        pdfUrl = uploadResult.data.url;
      }

      await createMutation.mutateAsync({
        title: newResource.title,
        description: newResource.description,
        category: newResource.category,
        language: newResource.language,
        pdfUrl: pdfUrl || "/placeholder.pdf",
      });

      setNewResource({ title: "", description: "", category: "other", language: "ne" });
      setSelectedFile(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Failed to create resource:", error);
    } finally {
      setUploading(false);
    }
  };

  const togglePublish = (id: number) => {
    togglePublishMutation.mutate(id);
  };

  const deleteResource = (id: number) => {
    if (confirm("Are you sure you want to delete this document?")) {
      deleteMutation.mutate(id);
    }
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
              <div className="p-2 rounded-lg bg-section-integrity/20">
                <Shield className="w-5 h-5 text-section-integrity" />
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                Election Integrity
              </h1>
            </div>
            <p className="text-muted-foreground">
              Manage election integrity resources and documents
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
                  Add Document
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card">
                <DialogHeader>
                  <DialogTitle>Add New Document</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Document title"
                      value={newResource.title}
                      onChange={(e) =>
                        setNewResource((prev) => ({ ...prev, title: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description"
                      value={newResource.description}
                      onChange={(e) =>
                        setNewResource((prev) => ({ ...prev, description: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={newResource.category}
                      onValueChange={(value) =>
                        setNewResource((prev) => ({ ...prev, category: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select
                      value={newResource.language}
                      onValueChange={(value: "en" | "ne" | "other") =>
                        setNewResource((prev) => ({ ...prev, language: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ne">Nepali</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
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
                    onClick={handleAddResource}
                    disabled={uploading || createMutation.isPending}
                  >
                    {uploading || createMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Add Document"
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
            <p className="text-destructive mb-4">Failed to load documents</p>
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
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Category</th>
                    <th className="text-center p-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {resources.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-muted-foreground">
                        No documents found. Add your first document!
                      </td>
                    </tr>
                  ) : (
                    resources.map((resource) => (
                      <tr key={resource.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <p className="font-medium text-foreground">{resource.title}</p>
                          <p className="text-sm text-muted-foreground mt-1 truncate max-w-xs">{resource.description}</p>
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          <span className="text-xs px-2 py-1 rounded bg-muted capitalize">
                            {resource.category.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <Switch
                              checked={resource.published}
                              onCheckedChange={() => togglePublish(resource.id)}
                              disabled={togglePublishMutation.isPending}
                            />
                            {resource.published ? (
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
                              onClick={() => deleteResource(resource.id)}
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

export default AdminElectionIntegrity;
