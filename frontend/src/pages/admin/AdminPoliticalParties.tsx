import { Users, Plus, Edit2, Trash2, Eye, EyeOff, ExternalLink, Loader2, RefreshCw, FileText } from "lucide-react";
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
  useAdminPoliticalParties,
  useCreatePoliticalParty,
  useDeletePoliticalParty,
  useUpdatePoliticalParty,
  useTogglePoliticalPartyPublish,
} from "@/hooks/useQueries";
import { partiesApi } from "@/lib/api";
import { toast } from "sonner";

const AdminPoliticalParties = () => {
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingParty, setEditingParty] = useState<any>(null);
  const [selectedManifesto, setSelectedManifesto] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [newParty, setNewParty] = useState({
    partyName: "",
    abbreviation: "",
    description: "",
    websiteLink: "",
  });

  const { data, isLoading, isError, refetch } = useAdminPoliticalParties(page);
  const createMutation = useCreatePoliticalParty();
  const deleteMutation = useDeletePoliticalParty();
  const updateMutation = useUpdatePoliticalParty();
  const togglePublishMutation = useTogglePoliticalPartyPublish();

  const parties = data?.data || [];
  const pagination = data?.pagination;

  const handleManifestoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedManifesto(e.target.files[0]);
    }
  };

  const handleAddParty = async () => {
    if (!newParty.partyName || !newParty.abbreviation) return;

    try {
      setUploading(true);

      // First create the party
      const result = await createMutation.mutateAsync({
        partyName: newParty.partyName,
        abbreviation: newParty.abbreviation,
        description: newParty.description || `Political party of Nepal`,
        officialWebsite: newParty.websiteLink || undefined,
      });

      // If there's a PDF file, upload it to the database
      if (selectedManifesto && result.data?.id) {
        await partiesApi.uploadManifesto(result.data.id, selectedManifesto);
        toast.success('Manifesto PDF uploaded successfully');
        refetch(); // Refresh to show updated data
      }

      setNewParty({ partyName: "", abbreviation: "", description: "", websiteLink: "" });
      setSelectedManifesto(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Failed to create party:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleRowManifestoUpload = async (id: number, file: File) => {
    try {
      await partiesApi.uploadManifesto(id, file);
      toast.success('Manifesto PDF uploaded successfully');
      refetch();
    } catch (error) {
      console.error('Failed to upload manifesto:', error);
      toast.error('Failed to upload manifesto');
    }
  };

  const handleDeleteManifesto = async (id: number) => {
    if (!confirm("Are you sure you want to delete this manifesto PDF?")) return;
    
    try {
      await partiesApi.deleteManifesto(id);
      toast.success('Manifesto PDF deleted successfully');
      // Update the editing party state to reflect the deletion
      setEditingParty((prev: any) => ({
        ...prev,
        hasManifestoPdf: false,
        manifestoPdfFilename: null,
      }));
      refetch();
    } catch (error) {
      console.error('Failed to delete manifesto:', error);
      toast.error('Failed to delete manifesto');
    }
  };

  const togglePublish = (id: number) => {
    togglePublishMutation.mutate(id);
  };

  const deleteParty = (id: number) => {
    if (confirm("Are you sure you want to delete this political party?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleEditClick = (party: any) => {
    setEditingParty({
      id: party.id,
      partyName: party.partyName,
      abbreviation: party.abbreviation,
      description: party.description || "",
      websiteLink: party.officialWebsite || "",
      hasManifestoPdf: party.hasManifestoPdf || !!party.manifestoPdfFilename,
      manifestoPdfFilename: party.manifestoPdfFilename || "",
      partyNameNepali: party.partyNameNepali || "",
    });
    setSelectedManifesto(null);
    setIsEditDialogOpen(true);
  };

  const handleUpdateParty = async () => {
    if (!editingParty?.partyName) return;

    try {
      setUploading(true);
      
      // Update party data
      await updateMutation.mutateAsync({
        id: editingParty.id,
        data: {
          partyName: editingParty.partyName,
          abbreviation: editingParty.abbreviation || undefined,
          description: editingParty.description,
          partyNameNepali: editingParty.partyNameNepali || undefined,
          officialWebsite: editingParty.websiteLink ?? null, // Send null to clear, or the value
        },
      });

      // If a new PDF file is selected, upload it to the database
      if (selectedManifesto) {
        await partiesApi.uploadManifesto(editingParty.id, selectedManifesto);
        toast.success('Manifesto PDF uploaded successfully');
        refetch(); // Refresh to show updated data
      }

      setEditingParty(null);
      setSelectedManifesto(null);
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Failed to update party:", error);
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
              <div className="p-2 rounded-lg bg-section-parties/20">
                <Users className="w-5 h-5 text-section-parties" />
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                Political Parties
              </h1>
            </div>
            <p className="text-muted-foreground">
              Manage political party information
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
                  Add Party
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add Political Party</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="partyName">Party Name *</Label>
                      <Input
                        id="partyName"
                        placeholder="Full party name"
                        value={newParty.partyName}
                        onChange={(e) =>
                          setNewParty((prev) => ({ ...prev, partyName: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="abbreviation">Abbreviation *</Label>
                      <Input
                        id="abbreviation"
                        placeholder="e.g., NC, UML"
                        value={newParty.abbreviation}
                        onChange={(e) =>
                          setNewParty((prev) => ({ ...prev, abbreviation: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of the party"
                      value={newParty.description}
                      onChange={(e) =>
                        setNewParty((prev) => ({ ...prev, description: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="websiteLink">Party Website Link (URL)</Label>
                    <Input
                      id="websiteLink"
                      type="url"
                      placeholder="https://partywebsite.com"
                      value={newParty.websiteLink}
                      onChange={(e) =>
                        setNewParty((prev) => ({ ...prev, websiteLink: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Upload Manifesto (PDF)</Label>
                    <Input type="file" accept=".pdf" onChange={handleManifestoChange} />
                    {selectedManifesto && (
                      <p className="text-sm text-muted-foreground">Selected: {selectedManifesto.name}</p>
                    )}
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleAddParty}
                    disabled={uploading || createMutation.isPending}
                  >
                    {uploading || createMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Add Party"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="bg-card max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Political Party</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-partyName">Party Name *</Label>
                      <Input
                        id="edit-partyName"
                        placeholder="Full party name"
                        value={editingParty?.partyName || ""}
                        onChange={(e) =>
                          setEditingParty((prev: any) => ({ ...prev, partyName: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-abbreviation">Abbreviation *</Label>
                      <Input
                        id="edit-abbreviation"
                        placeholder="e.g., NC, UML"
                        value={editingParty?.abbreviation || ""}
                        onChange={(e) =>
                          setEditingParty((prev: any) => ({ ...prev, abbreviation: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea
                      id="edit-description"
                      placeholder="Brief description of the party"
                      value={editingParty?.description || ""}
                      onChange={(e) =>
                        setEditingParty((prev: any) => ({ ...prev, description: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-partyNameNepali">Party Name (Nepali)</Label>
                    <Input
                      id="edit-partyNameNepali"
                      placeholder="नेपाली नाम"
                      value={editingParty?.partyNameNepali || ""}
                      onChange={(e) =>
                        setEditingParty((prev: any) => ({ ...prev, partyNameNepali: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-websiteLink">Party Website Link (URL)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="edit-websiteLink"
                        type="url"
                        placeholder="https://partywebsite.com"
                        value={editingParty?.websiteLink || ""}
                        onChange={(e) =>
                          setEditingParty((prev: any) => ({ ...prev, websiteLink: e.target.value }))
                        }
                        className="flex-1"
                      />
                      {editingParty?.websiteLink && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setEditingParty((prev: any) => ({ ...prev, websiteLink: "" }))}
                          title="Clear URL"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Upload Manifesto (PDF) - Stored in Database</Label>
                    <Input type="file" accept=".pdf" onChange={handleManifestoChange} />
                    {selectedManifesto && (
                      <p className="text-sm text-accent">Selected: {selectedManifesto.name} (will upload new PDF)</p>
                    )}
                    {!selectedManifesto && editingParty?.hasManifestoPdf && (
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-green-600 flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          PDF stored: {editingParty.manifestoPdfFilename || 'manifesto.pdf'}
                        </p>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteManifesto(editingParty.id)}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete PDF
                        </Button>
                      </div>
                    )}
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleUpdateParty}
                    disabled={uploading || updateMutation.isPending}
                  >
                    {uploading || updateMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Party"
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
            <p className="text-destructive mb-4">Failed to load political parties</p>
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
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Party</th>
                    <th className="text-center p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Manifesto</th>
                    <th className="text-center p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Name (Nepali)</th>
                    <th className="text-center p-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {parties.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground">
                        No political parties found. Add your first party!
                      </td>
                    </tr>
                  ) : (
                    parties.map((party) => (
                      <tr key={party.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {party.partySymbolUrl ? (
                                <img src={party.partySymbolUrl} alt={party.partyName} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-xs font-semibold text-muted-foreground">{party.abbreviation}</span>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{party.partyName}</p>
                              <p className="text-xs text-muted-foreground">{party.abbreviation}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-center hidden lg:table-cell">
                          {party.hasManifestoPdf || party.manifestoPdfFilename ? (
                            <a 
                              href={partiesApi.getManifestoUrl(party.id)} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 inline-flex items-center gap-1"
                            >
                              <FileText className="w-3 h-3" /> View PDF
                            </a>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              <label className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded cursor-pointer hover:bg-muted/80">
                                Upload PDF
                                <input
                                  type="file"
                                  accept=".pdf"
                                  className="hidden"
                                  onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) handleRowManifestoUpload(party.id, f);
                                  }}
                                />
                              </label>
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-center hidden lg:table-cell">
                          <span className="text-sm text-muted-foreground">{party.partyNameNepali || "-"}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <Switch
                              checked={party.published}
                              onCheckedChange={() => togglePublish(party.id)}
                              disabled={togglePublishMutation.isPending}
                            />
                            {party.published ? (
                              <Eye className="w-4 h-4 text-accent" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button size="icon" variant="ghost" onClick={() => handleEditClick(party)}><Edit2 className="w-4 h-4" /></Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => deleteParty(party.id)}
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

export default AdminPoliticalParties;
