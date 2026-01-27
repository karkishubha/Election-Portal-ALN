import { Users, Plus, Edit2, Trash2, Eye, EyeOff, ExternalLink, Loader2, RefreshCw } from "lucide-react";
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
  useTogglePoliticalPartyPublish,
} from "@/hooks/useQueries";
import { uploadApi } from "@/lib/api";

const AdminPoliticalParties = () => {
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
  const [selectedManifesto, setSelectedManifesto] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [newParty, setNewParty] = useState({
    name: "",
    abbreviation: "",
    description: "",
    website: "",
    founded: "",
    leader: "",
    headquarters: "",
  });

  const { data, isLoading, isError, refetch } = useAdminPoliticalParties(page);
  const createMutation = useCreatePoliticalParty();
  const deleteMutation = useDeletePoliticalParty();
  const togglePublishMutation = useTogglePoliticalPartyPublish();

  const parties = data?.data || [];
  const pagination = data?.pagination;

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedLogo(e.target.files[0]);
    }
  };

  const handleManifestoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedManifesto(e.target.files[0]);
    }
  };

  const handleAddParty = async () => {
    if (!newParty.name || !newParty.abbreviation) return;

    try {
      setUploading(true);
      let logoUrl = "";
      let manifestoUrl = "";

      if (selectedLogo) {
        const uploadResult = await uploadApi.uploadPdf(selectedLogo);
        logoUrl = uploadResult.data.url;
      }

      if (selectedManifesto) {
        const uploadResult = await uploadApi.uploadPdf(selectedManifesto);
        manifestoUrl = uploadResult.data.url;
      }

      await createMutation.mutateAsync({
        name: newParty.name,
        abbreviation: newParty.abbreviation,
        description: newParty.description || `Political party of Nepal`,
        logoUrl: logoUrl || "/placeholder-party.png",
        manifestoUrl: manifestoUrl || undefined,
        website: newParty.website || undefined,
        founded: newParty.founded || undefined,
        leader: newParty.leader || undefined,
        headquarters: newParty.headquarters || undefined,
      });

      setNewParty({ name: "", abbreviation: "", description: "", website: "", founded: "", leader: "", headquarters: "" });
      setSelectedLogo(null);
      setSelectedManifesto(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Failed to create party:", error);
    } finally {
      setUploading(false);
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
                      <Label htmlFor="name">Party Name *</Label>
                      <Input
                        id="name"
                        placeholder="Full party name"
                        value={newParty.name}
                        onChange={(e) =>
                          setNewParty((prev) => ({ ...prev, name: e.target.value }))
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="leader">Party Leader</Label>
                      <Input
                        id="leader"
                        placeholder="Current party leader"
                        value={newParty.leader}
                        onChange={(e) =>
                          setNewParty((prev) => ({ ...prev, leader: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="founded">Founded Year</Label>
                      <Input
                        id="founded"
                        placeholder="e.g., 1947"
                        value={newParty.founded}
                        onChange={(e) =>
                          setNewParty((prev) => ({ ...prev, founded: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        type="url"
                        placeholder="https://..."
                        value={newParty.website}
                        onChange={(e) =>
                          setNewParty((prev) => ({ ...prev, website: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="headquarters">Headquarters</Label>
                      <Input
                        id="headquarters"
                        placeholder="e.g., Kathmandu"
                        value={newParty.headquarters}
                        onChange={(e) =>
                          setNewParty((prev) => ({ ...prev, headquarters: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Party Logo (Image)</Label>
                    <Input type="file" accept="image/*" onChange={handleLogoChange} />
                    {selectedLogo && (
                      <p className="text-sm text-muted-foreground">Selected: {selectedLogo.name}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Manifesto (PDF)</Label>
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
                    <th className="text-center p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Website</th>
                    <th className="text-center p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Manifesto</th>
                    <th className="text-center p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Leader</th>
                    <th className="text-center p-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {parties.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">
                        No political parties found. Add your first party!
                      </td>
                    </tr>
                  ) : (
                    parties.map((party) => (
                      <tr key={party.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {party.logoUrl && party.logoUrl !== "/placeholder-party.png" ? (
                                <img src={party.logoUrl} alt={party.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-xs font-semibold text-muted-foreground">{party.abbreviation}</span>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{party.name}</p>
                              <p className="text-xs text-muted-foreground">{party.abbreviation}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-center hidden md:table-cell">
                          {party.website ? (
                            <a href={party.website} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline inline-flex items-center gap-1">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="p-4 text-center hidden lg:table-cell">
                          {party.manifestoUrl ? (
                            <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded">Uploaded</span>
                          ) : (
                            <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">Missing</span>
                          )}
                        </td>
                        <td className="p-4 text-center hidden lg:table-cell">
                          <span className="text-sm text-muted-foreground">{party.leader || "-"}</span>
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
                            <Button size="icon" variant="ghost"><Edit2 className="w-4 h-4" /></Button>
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
