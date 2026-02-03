import { FileText, Plus, Edit2, Trash2, Eye, EyeOff, Loader2, RefreshCw } from "lucide-react";
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
  useAdminExplainers,
  useCreateExplainer,
  useUpdateExplainer,
  useDeleteExplainer,
  useToggleExplainerPublish,
} from "@/hooks/useQueries";
import { uploadApi } from "@/lib/api";

const AdminExplainers = () => {
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [newResource, setNewResource] = useState({
    title: "",
    description: "",
    language: "ne" as "en" | "ne" | "other",
    resourceUrl: "",
  });

  const { data, isLoading, isError, refetch } = useAdminExplainers(page);
  const createMutation = useCreateExplainer();
  const updateMutation = useUpdateExplainer();
  const deleteMutation = useDeleteExplainer();
  const togglePublishMutation = useToggleExplainerPublish();

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
      let resourceUrl = newResource.resourceUrl || "";

      if (selectedFile) {
        const uploadResult = await uploadApi.uploadPdf(selectedFile, 'explainers');
        resourceUrl = uploadResult.data.url;
      }

      await createMutation.mutateAsync({
        title: newResource.title,
        description: newResource.description,
        language: newResource.language,
        resourceUrl: resourceUrl || "/placeholder.pdf",
      });

      setNewResource({ title: "", description: "", language: "ne", resourceUrl: "" });
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
    if (confirm("Are you sure you want to delete this explainer?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleEditClick = (resource: any) => {
    setEditingResource({
      id: resource.id,
      title: resource.title,
      description: resource.description,
      language: resource.language || "ne",
      resourceUrl: resource.resourceUrl || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateResource = async () => {
    if (!editingResource?.title || !editingResource?.description) return;

    try {
      setUploading(true);
      let resourceUrl = editingResource.resourceUrl;

      if (selectedFile) {
        const uploadResult = await uploadApi.uploadPdf(selectedFile, 'explainers');
        resourceUrl = uploadResult.data.url;
      }

      await updateMutation.mutateAsync({
        id: editingResource.id,
        data: {
          title: editingResource.title,
          description: editingResource.description,
          language: editingResource.language,
          resourceUrl,
        },
      });

      setEditingResource(null);
      setSelectedFile(null);
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Failed to update resource:", error);
    } finally {
      setUploading(false);
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
              <div className="p-2 rounded-lg bg-section-education/20">
                <FileText className="w-5 h-5 text-section-education" />
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                Explainers
              </h1>
            </div>
            <p className="text-muted-foreground">
              Manage voter education explainers and related resources
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
                  Add Explainer
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card">
                <DialogHeader>
                  <DialogTitle>Add New Explainer</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Explainer title"
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
                    <Label>Language</Label>
                    <Input
                      value={newResource.language}
                      onChange={(e) =>
                        setNewResource((prev) => ({ ...prev, language: e.target.value as "en" | "ne" | "other" }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Resource URL (optional)</Label>
                    <Input
                      placeholder="https://..."
                      value={newResource.resourceUrl}
                      onChange={(e) =>
                        setNewResource((prev) => ({ ...prev, resourceUrl: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Upload File (optional)</Label>
                    <Input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
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
                      "Add Explainer"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="bg-card">
                <DialogHeader>
                  <DialogTitle>Edit Explainer</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-title">Title</Label>
                    <Input
                      id="edit-title"
                      placeholder="Explainer title"
                      value={editingResource?.title || ""}
                      onChange={(e) =>
                        setEditingResource((prev: any) => ({ ...prev, title: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea
                      id="edit-description"
                      placeholder="Brief description"
                      value={editingResource?.description || ""}
                      onChange={(e) =>
                        setEditingResource((prev: any) => ({ ...prev, description: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Input
                      value={editingResource?.language || "ne"}
                      onChange={(e) =>
                        setEditingResource((prev: any) => ({ ...prev, language: e.target.value as "en" | "ne" | "other" }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Resource URL (optional)</Label>
                    <Input
                      placeholder="https://..."
                      value={editingResource?.resourceUrl || ""}
                      onChange={(e) =>
                        setEditingResource((prev: any) => ({ ...prev, resourceUrl: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Upload New File (optional)</Label>
                    <Input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
                    {selectedFile && (
                      <p className="text-sm text-muted-foreground">Selected: {selectedFile.name}</p>
                    )}
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleUpdateResource}
                    disabled={uploading || updateMutation.isPending}
                  >
                    {uploading || updateMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Explainer"
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
            <p className="text-destructive mb-4">Failed to load resources</p>
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
                    <th className="text-center p-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {resources.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-muted-foreground">
                        No explainers found. Add your first one!
                      </td>
                    </tr>
                  ) : (
                    resources.map((resource: any) => (
                      <tr key={resource.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <p className="font-medium text-foreground">{resource.title}</p>
                          <p className="text-sm text-muted-foreground mt-1 truncate max-w-xs">{resource.description}</p>
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
                            <Button size="icon" variant="ghost" onClick={() => handleEditClick(resource)}><Edit2 className="w-4 h-4" /></Button>
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

export default AdminExplainers;
