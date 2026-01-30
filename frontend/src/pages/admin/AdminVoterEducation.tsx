import { BookOpen, Plus, Edit2, Trash2, Eye, EyeOff, Loader2, RefreshCw } from "lucide-react";
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
  useAdminVoterEducation,
  useCreateVoterEducation,
  useDeleteVoterEducation,
  useToggleVoterEducationPublish,
} from "@/hooks/useQueries";
import { uploadApi } from "@/lib/api";

const AdminVoterEducation = () => {
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [newResource, setNewResource] = useState({
    title: "",
    description: "",
    language: "ne" as "en" | "ne" | "other",
  });

  const { data, isLoading, isError, refetch } = useAdminVoterEducation(page);
  const createMutation = useCreateVoterEducation();
  const deleteMutation = useDeleteVoterEducation();
  const togglePublishMutation = useToggleVoterEducationPublish();

  const resources = data?.data || [];
  const pagination = data?.pagination;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleAddResource = async () => {
    if (!newResource.title || !newResource.description) {
      return;
    }

    try {
      setUploading(true);
      let pdfUrl = "";

      if (selectedFile) {
        const uploadResult = await uploadApi.uploadPdf(selectedFile, 'voter-education');
        pdfUrl = uploadResult.data.url;
      }

      await createMutation.mutateAsync({
        title: newResource.title,
        description: newResource.description,
        language: newResource.language,
        pdfUrl: pdfUrl || "/placeholder.pdf",
      });

      setNewResource({ title: "", description: "", language: "ne" });
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
    if (confirm("Are you sure you want to delete this resource?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-section-voter/20">
                <BookOpen className="w-5 h-5 text-section-voter" />
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                Voter Education
              </h1>
            </div>
            <p className="text-muted-foreground">
              Manage voter education resources and documents
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
                  Add Resource
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card">
                <DialogHeader>
                  <DialogTitle>Add New Resource</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Resource title"
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
                        setNewResource((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                    />
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
                    <Input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                    />
                    {selectedFile && (
                      <p className="text-sm text-muted-foreground">
                        Selected: {selectedFile.name}
                      </p>
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
                      "Add Resource"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">Failed to load resources</p>
            <Button variant="outline" onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        )}

        {/* Resources Table */}
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
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Title
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">
                      Description
                    </th>
                    <th className="text-center p-4 text-sm font-medium text-muted-foreground">
                      Language
                    </th>
                    <th className="text-center p-4 text-sm font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {resources.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground">
                        No resources found. Add your first resource!
                      </td>
                    </tr>
                  ) : (
                    resources.map((resource) => (
                      <tr
                        key={resource.id}
                        className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="p-4">
                          <p className="font-medium text-foreground">
                            {resource.title}
                          </p>
                          <p className="text-sm text-muted-foreground md:hidden mt-1">
                            {resource.description}
                          </p>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground hidden md:table-cell max-w-xs truncate">
                          {resource.description}
                        </td>
                        <td className="p-4 text-center">
                          <span className="text-xs px-2 py-1 rounded bg-muted">
                            {resource.language === "ne" ? "Nepali" : resource.language === "en" ? "English" : "Other"}
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
                            <Button size="icon" variant="ghost">
                              <Edit2 className="w-4 h-4" />
                            </Button>
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

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages} ({pagination.total} items)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={!pagination.hasPrevPage}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!pagination.hasNextPage}
                  >
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

export default AdminVoterEducation;
