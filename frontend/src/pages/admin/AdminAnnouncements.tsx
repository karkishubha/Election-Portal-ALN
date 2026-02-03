import { Bell, Plus, Edit2, Trash2, Eye, EyeOff, Loader2, RefreshCw } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  useAdminAnnouncements,
  useCreateAnnouncement,
  useUpdateAnnouncement,
  useDeleteAnnouncement,
  useToggleAnnouncementPublish,
} from "@/hooks/useQueries";
import { useMemo } from "react";

const AdminAnnouncements = () => {
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [newItem, setNewItem] = useState({
    title: "",
    date: "",
    source: "Election Commission of Nepal",
    link: "",
    priority: "medium" as "high" | "medium" | "low",
  });

  const { data, isLoading, isError, refetch } = useAdminAnnouncements(page);
  const createMutation = useCreateAnnouncement();
  const updateMutation = useUpdateAnnouncement();
  const deleteMutation = useDeleteAnnouncement();
  const togglePublishMutation = useToggleAnnouncementPublish();

  const items = data?.data || [];
  const pagination = data?.pagination;

  const isValidUrl = (url: string) => {
    try {
      const u = new URL(url);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  };

  const isValid = useMemo(() => {
    return (
      newItem.title.trim().length > 0 &&
      newItem.date.trim().length > 0 &&
      newItem.link.trim().length > 0 &&
      isValidUrl(newItem.link.trim())
    );
  }, [newItem]);

  const handleAdd = async () => {
    if (!isValid) return;
    await createMutation.mutateAsync(newItem);
    setNewItem({ title: "", date: "", source: "Election Commission of Nepal", link: "", priority: "medium" });
    setIsDialogOpen(false);
  };

  const togglePublish = (id: number) => {
    togglePublishMutation.mutate(id);
  };

  const remove = (id: number) => {
    if (confirm("Delete this announcement?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleEditClick = (item: any) => {
    setEditingItem({
      id: item.id,
      title: item.title,
      date: item.date?.split('T')[0] || "",
      source: item.source || "Election Commission of Nepal",
      link: item.link || "",
      priority: item.priority || "medium",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingItem?.title || !editingItem?.date || !editingItem?.link || !isValidUrl(editingItem.link)) return;

    await updateMutation.mutateAsync({
      id: editingItem.id,
      data: {
        title: editingItem.title,
        date: editingItem.date,
        source: editingItem.source,
        link: editingItem.link,
        priority: editingItem.priority,
      },
    });

    setEditingItem(null);
    setIsEditDialogOpen(false);
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
              <div className="p-2 rounded-lg bg-muted">
                <Bell className="w-5 h-5" />
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                Official Announcements
              </h1>
            </div>
            <p className="text-muted-foreground">
              Manage announcements from the Election Commission
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
                  Add Announcement
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card">
                <DialogHeader>
                  <DialogTitle>Add New Announcement</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" value={newItem.title} onChange={(e) => setNewItem((p) => ({ ...p, title: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" type="date" value={newItem.date} onChange={(e) => setNewItem((p) => ({ ...p, date: e.target.value }))} />
                    <p className="text-xs text-muted-foreground">Use the picker; formats as YYYY-MM-DD.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="source">Source</Label>
                    <Input id="source" value={newItem.source} onChange={(e) => setNewItem((p) => ({ ...p, source: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="link">Link</Label>
                    <Input id="link" placeholder="https://..." value={newItem.link} onChange={(e) => setNewItem((p) => ({ ...p, link: e.target.value }))} />
                    {newItem.link && !isValidUrl(newItem.link) && (
                      <p className="text-xs text-destructive">Please enter a valid URL (http/https)</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <div className="flex gap-2">
                      {(["high", "medium", "low"] as const).map((prio) => (
                        <Button key={prio} variant={newItem.priority === prio ? "default" : "outline"} size="sm" onClick={() => setNewItem((p) => ({ ...p, priority: prio }))}>
                          {prio}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <Button className="w-full" onClick={handleAdd} disabled={createMutation.isPending || !isValid}>
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Add Announcement"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="bg-card">
                <DialogHeader>
                  <DialogTitle>Edit Announcement</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-title">Title</Label>
                    <Input id="edit-title" value={editingItem?.title || ""} onChange={(e) => setEditingItem((p: any) => ({ ...p, title: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-date">Date</Label>
                    <Input id="edit-date" type="date" value={editingItem?.date || ""} onChange={(e) => setEditingItem((p: any) => ({ ...p, date: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-source">Source</Label>
                    <Input id="edit-source" value={editingItem?.source || ""} onChange={(e) => setEditingItem((p: any) => ({ ...p, source: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-link">Link</Label>
                    <Input id="edit-link" placeholder="https://..." value={editingItem?.link || ""} onChange={(e) => setEditingItem((p: any) => ({ ...p, link: e.target.value }))} />
                    {editingItem?.link && !isValidUrl(editingItem.link) && (
                      <p className="text-xs text-destructive">Please enter a valid URL (http/https)</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <div className="flex gap-2">
                      {(["high", "medium", "low"] as const).map((prio) => (
                        <Button key={prio} variant={editingItem?.priority === prio ? "default" : "outline"} size="sm" onClick={() => setEditingItem((p: any) => ({ ...p, priority: prio }))}>
                          {prio}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <Button className="w-full" onClick={handleUpdate} disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Announcement"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">Failed to load announcements</p>
            <Button variant="outline" onClick={() => refetch()}>Try Again</Button>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="admin-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Title</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="text-center p-4 text-sm font-medium text-muted-foreground">Priority</th>
                    <th className="text-center p-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground">No announcements found.</td>
                    </tr>
                  ) : (
                    items.map((item: any) => (
                      <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <p className="font-medium text-foreground">{item.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{new Date(item.date).toLocaleDateString()}</p>
                        </td>
                        <td className="p-4">{new Date(item.date).toLocaleDateString()}</td>
                        <td className="p-4 text-center capitalize">{item.priority}</td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <Switch checked={item.published} onCheckedChange={() => togglePublish(item.id)} disabled={togglePublishMutation.isPending} />
                            {item.published ? <Eye className="w-4 h-4 text-accent" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button size="icon" variant="ghost" onClick={() => handleEditClick(item)}><Edit2 className="w-4 h-4" /></Button>
                            <Button size="icon" variant="ghost" onClick={() => remove(item.id)} disabled={deleteMutation.isPending}>
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
                <p className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.totalPages}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={!pagination.hasPrevPage}>Previous</Button>
                  <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={!pagination.hasNextPage}>Next</Button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAnnouncements;
