import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, RotateCcw } from "lucide-react";

interface Options {
  negeriDaerah: Record<string, string[]>;
  kategoriIsu: string[];
  pecahanKaum: string[];
  kategoriPertubuhan: string[];
  statusTindakan: string[];
}

export default function TambahRekod() {
  const { toast } = useToast();
  const { data: options } = useQuery<Options>({ queryKey: ["/api/options"] });

  const [form, setForm] = useState({
    negeri: "",
    daerah: "",
    lokasi: "",
    tarikhKejadian: new Date().toISOString().split("T")[0],
    masaKejadian: new Date().toTimeString().slice(0, 5),
    kategoriIsu: "",
    pecahanKaum: "",
    pertubuhan: "",
    kategoriPertubuhan: "",
    keterangan: "",
    tindakanPolis: "",
    statusTindakan: "Belum Diambil Tindakan",
    pegawaiRekod: "",
  });

  const [daerahList, setDaerahList] = useState<string[]>([]);

  useEffect(() => {
    if (form.negeri && options?.negeriDaerah) {
      setDaerahList(options.negeriDaerah[form.negeri] || []);
      setForm(prev => ({ ...prev, daerah: "" }));
    }
  }, [form.negeri, options]);

  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await apiRequest("POST", "/api/incidents", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Berjaya", description: "Rekod baharu telah ditambah." });
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      resetForm();
    },
    onError: (err: Error) => {
      toast({ title: "Ralat", description: err.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setForm({
      negeri: "",
      daerah: "",
      lokasi: "",
      tarikhKejadian: new Date().toISOString().split("T")[0],
      masaKejadian: new Date().toTimeString().slice(0, 5),
      kategoriIsu: "",
      pecahanKaum: "",
      pertubuhan: "",
      kategoriPertubuhan: "",
      keterangan: "",
      tindakanPolis: "",
      statusTindakan: "Belum Diambil Tindakan",
      pegawaiRekod: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.negeri || !form.daerah || !form.kategoriIsu || !form.pecahanKaum || !form.keterangan || !form.pegawaiRekod) {
      toast({ title: "Ralat", description: "Sila lengkapkan semua ruangan wajib.", variant: "destructive" });
      return;
    }
    createMutation.mutate(form);
  };

  return (
    <div className="p-4 md:p-6 overflow-y-auto h-full">
      <form onSubmit={handleSubmit}>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Lokasi */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">1</span>
                Maklumat Lokasi
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs font-medium">Negeri *</Label>
                <Select value={form.negeri} onValueChange={(v) => setForm({ ...form, negeri: v })}>
                  <SelectTrigger data-testid="select-negeri"><SelectValue placeholder="Pilih negeri" /></SelectTrigger>
                  <SelectContent>
                    {options && Object.keys(options.negeriDaerah).sort().map(n => (
                      <SelectItem key={n} value={n}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-medium">Daerah *</Label>
                <Select value={form.daerah} onValueChange={(v) => setForm({ ...form, daerah: v })} disabled={!form.negeri}>
                  <SelectTrigger data-testid="select-daerah"><SelectValue placeholder="Pilih daerah" /></SelectTrigger>
                  <SelectContent>
                    {daerahList.map(d => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-medium">Lokasi Tepat</Label>
                <Input
                  data-testid="input-lokasi"
                  placeholder="Alamat / kawasan"
                  value={form.lokasi}
                  onChange={(e) => setForm({ ...form, lokasi: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Tarikh & Masa */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">2</span>
                Tarikh & Masa Kejadian
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-medium">Tarikh Kejadian *</Label>
                <Input
                  data-testid="input-tarikh"
                  type="date"
                  value={form.tarikhKejadian}
                  onChange={(e) => setForm({ ...form, tarikhKejadian: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs font-medium">Masa Kejadian *</Label>
                <Input
                  data-testid="input-masa"
                  type="time"
                  value={form.masaKejadian}
                  onChange={(e) => setForm({ ...form, masaKejadian: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Kategori Isu */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">3</span>
                Kategori Isu & Pecahan Kaum
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-medium">Kategori Isu Perkauman *</Label>
                <Select value={form.kategoriIsu} onValueChange={(v) => setForm({ ...form, kategoriIsu: v })}>
                  <SelectTrigger data-testid="select-kategori"><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                  <SelectContent>
                    {options?.kategoriIsu.map(k => (
                      <SelectItem key={k} value={k}>{k}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-medium">Pecahan Versus Kaum *</Label>
                <Select value={form.pecahanKaum} onValueChange={(v) => setForm({ ...form, pecahanKaum: v })}>
                  <SelectTrigger data-testid="select-pecahan"><SelectValue placeholder="Pilih pecahan" /></SelectTrigger>
                  <SelectContent>
                    {options?.pecahanKaum.map(p => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Pertubuhan */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">4</span>
                Pertubuhan / Organisasi Terlibat
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-medium">Kategori Pertubuhan</Label>
                <Select value={form.kategoriPertubuhan} onValueChange={(v) => setForm({ ...form, kategoriPertubuhan: v })}>
                  <SelectTrigger data-testid="select-pertubuhan-cat"><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                  <SelectContent>
                    {options?.kategoriPertubuhan.map(p => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-medium">Nama Pertubuhan / Aktivis</Label>
                <Input
                  data-testid="input-pertubuhan"
                  placeholder="Nama pertubuhan atau individu"
                  value={form.pertubuhan}
                  onChange={(e) => setForm({ ...form, pertubuhan: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Keterangan */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">5</span>
                Keterangan & Tindakan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs font-medium">Keterangan Isu *</Label>
                <Textarea
                  data-testid="textarea-keterangan"
                  placeholder="Huraikan insiden perkauman dengan terperinci..."
                  rows={4}
                  value={form.keterangan}
                  onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-medium">Tindakan Pihak Polis</Label>
                  <Textarea
                    data-testid="textarea-tindakan"
                    placeholder="Nyatakan tindakan yang diambil..."
                    rows={3}
                    value={form.tindakanPolis}
                    onChange={(e) => setForm({ ...form, tindakanPolis: e.target.value })}
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs font-medium">Status Tindakan</Label>
                    <Select value={form.statusTindakan} onValueChange={(v) => setForm({ ...form, statusTindakan: v })}>
                      <SelectTrigger data-testid="select-status"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {options?.statusTindakan.map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-medium">Nama Pegawai Rekod *</Label>
                    <Input
                      data-testid="input-pegawai"
                      placeholder="Nama pegawai yang merekod"
                      value={form.pegawaiRekod}
                      onChange={(e) => setForm({ ...form, pegawaiRekod: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3 justify-end pb-6">
            <Button type="button" variant="outline" onClick={resetForm} data-testid="button-reset">
              <RotateCcw className="w-4 h-4 mr-2" /> Reset
            </Button>
            <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit">
              <Save className="w-4 h-4 mr-2" />
              {createMutation.isPending ? "Menyimpan..." : "Simpan Rekod"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
