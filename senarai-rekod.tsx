import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Eye, Pencil, Trash2, Clock } from "lucide-react";

interface Incident {
  id: number;
  negeri: string;
  daerah: string;
  lokasi: string | null;
  tarikhKejadian: string;
  masaKejadian: string;
  kategoriIsu: string;
  pecahanKaum: string;
  pertubuhan: string | null;
  kategoriPertubuhan: string | null;
  keterangan: string;
  tindakanPolis: string | null;
  statusTindakan: string;
  pegawaiRekod: string;
  createdAt: string;
  updatedAt: string;
}

interface Options {
  negeriDaerah: Record<string, string[]>;
  kategoriIsu: string[];
  pecahanKaum: string[];
  kategoriPertubuhan: string[];
  statusTindakan: string[];
}

const STATUS_COLORS: Record<string, string> = {
  "Belum Diambil Tindakan": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  "Dalam Siasatan": "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  "Siasatan Selesai": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "Tindakan Undang-Undang": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  "Kes Ditutup": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

export default function SenaraiRekod() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filterNegeri, setFilterNegeri] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewItem, setViewItem] = useState<Incident | null>(null);
  const [editItem, setEditItem] = useState<Incident | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editTindakan, setEditTindakan] = useState("");

  const { data: options } = useQuery<Options>({ queryKey: ["/api/options"] });

  const buildQueryKey = () => {
    const key = "/api/incidents";
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    else if (filterNegeri !== "all") params.set("negeri", filterNegeri);
    else if (filterStatus !== "all") params.set("status", filterStatus);
    const qs = params.toString();
    return qs ? `${key}?${qs}` : key;
  };

  const { data: incidents = [], isLoading } = useQuery<Incident[]>({
    queryKey: [buildQueryKey()],
    refetchInterval: 5000,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/incidents/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Berjaya", description: "Rekod telah dipadam." });
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("PATCH", `/api/incidents/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Berjaya", description: "Rekod telah dikemaskini." });
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setEditItem(null);
    },
  });

  const handleEdit = (item: Incident) => {
    setEditItem(item);
    setEditStatus(item.statusTindakan);
    setEditTindakan(item.tindakanPolis || "");
  };

  const handleSaveEdit = () => {
    if (!editItem) return;
    updateMutation.mutate({
      id: editItem.id,
      data: { statusTindakan: editStatus, tindakanPolis: editTindakan },
    });
  };

  return (
    <div className="p-4 md:p-6 space-y-4 overflow-y-auto h-full">
      {/* Live indicator */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        LIVE MONITOR - {incidents.length} rekod
        <span className="ml-auto">
          <Clock className="inline w-3 h-3 mr-1" />
          {new Date().toLocaleString("ms-MY", { timeZone: "Asia/Kuala_Lumpur" })}
        </span>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                data-testid="input-search"
                placeholder="Cari rekod..."
                className="pl-9"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setFilterNegeri("all"); setFilterStatus("all"); }}
              />
            </div>
            <Select value={filterNegeri} onValueChange={(v) => { setFilterNegeri(v); setSearch(""); setFilterStatus("all"); }}>
              <SelectTrigger className="w-full sm:w-[180px]" data-testid="filter-negeri">
                <SelectValue placeholder="Semua Negeri" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Negeri</SelectItem>
                {options && Object.keys(options.negeriDaerah).sort().map(n => (
                  <SelectItem key={n} value={n}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setSearch(""); setFilterNegeri("all"); }}>
              <SelectTrigger className="w-full sm:w-[200px]" data-testid="filter-status">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                {options?.statusTindakan.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px] text-xs">#</TableHead>
                  <TableHead className="text-xs">Tarikh/Masa</TableHead>
                  <TableHead className="text-xs">Negeri</TableHead>
                  <TableHead className="text-xs">Daerah</TableHead>
                  <TableHead className="text-xs">Kategori Isu</TableHead>
                  <TableHead className="text-xs">Pecahan Kaum</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Pegawai</TableHead>
                  <TableHead className="text-xs text-right">Tindakan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      {[...Array(9)].map((_, j) => (
                        <TableCell key={j}><div className="h-4 bg-muted animate-pulse rounded" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : incidents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Tiada rekod dijumpai
                    </TableCell>
                  </TableRow>
                ) : (
                  incidents.map((inc, idx) => (
                    <TableRow key={inc.id} data-testid={`row-incident-${inc.id}`}>
                      <TableCell className="text-xs tabular-nums">{idx + 1}</TableCell>
                      <TableCell className="text-xs whitespace-nowrap">
                        {inc.tarikhKejadian}<br />
                        <span className="text-muted-foreground">{inc.masaKejadian}</span>
                      </TableCell>
                      <TableCell className="text-xs">{inc.negeri}</TableCell>
                      <TableCell className="text-xs">{inc.daerah}</TableCell>
                      <TableCell className="text-xs max-w-[150px] truncate">{inc.kategoriIsu}</TableCell>
                      <TableCell className="text-xs">{inc.pecahanKaum}</TableCell>
                      <TableCell>
                        <Badge className={`text-[10px] ${STATUS_COLORS[inc.statusTindakan] || ""}`} variant="secondary">
                          {inc.statusTindakan}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{inc.pegawaiRekod}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewItem(inc)} data-testid={`button-view-${inc.id}`}>
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(inc)} data-testid={`button-edit-${inc.id}`}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600" onClick={() => deleteMutation.mutate(inc.id)} data-testid={`button-delete-${inc.id}`}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={!!viewItem} onOpenChange={() => setViewItem(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base">Butiran Rekod #{viewItem?.id}</DialogTitle>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Negeri</p>
                  <p className="font-medium">{viewItem.negeri}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Daerah</p>
                  <p className="font-medium">{viewItem.daerah}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Lokasi</p>
                  <p className="font-medium">{viewItem.lokasi || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tarikh & Masa</p>
                  <p className="font-medium">{viewItem.tarikhKejadian} {viewItem.masaKejadian}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Kategori Isu</p>
                  <p className="font-medium">{viewItem.kategoriIsu}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Pecahan Kaum</p>
                  <p className="font-medium">{viewItem.pecahanKaum}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Pertubuhan</p>
                  <p className="font-medium">{viewItem.pertubuhan || "-"} {viewItem.kategoriPertubuhan ? `(${viewItem.kategoriPertubuhan})` : ""}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge className={`${STATUS_COLORS[viewItem.statusTindakan] || ""}`} variant="secondary">
                    {viewItem.statusTindakan}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Keterangan Isu</p>
                <p className="font-medium bg-muted/50 p-3 rounded-md">{viewItem.keterangan}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tindakan Polis</p>
                <p className="font-medium bg-muted/50 p-3 rounded-md">{viewItem.tindakanPolis || "Belum ada tindakan direkodkan"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div>
                  <p className="text-xs text-muted-foreground">Pegawai Rekod</p>
                  <p className="font-medium">{viewItem.pegawaiRekod}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Dikemaskini</p>
                  <p className="font-medium">{new Date(viewItem.updatedAt).toLocaleString("ms-MY")}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-base">Kemaskini Tindakan - Rekod #{editItem?.id}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs">Status Tindakan</Label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger data-testid="edit-select-status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {options?.statusTindakan.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Tindakan Polis</Label>
              <Textarea
                data-testid="edit-textarea-tindakan"
                rows={4}
                value={editTindakan}
                onChange={(e) => setEditTindakan(e.target.value)}
                placeholder="Nyatakan tindakan yang diambil..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditItem(null)}>Batal</Button>
            <Button onClick={handleSaveEdit} disabled={updateMutation.isPending} data-testid="button-save-edit">
              {updateMutation.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
