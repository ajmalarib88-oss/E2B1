import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, FileText, Users, Shield, Clock, Building2, User } from "lucide-react";

interface Stats {
  total: number;
  byKategori: Record<string, number>;
  byNegeri: Record<string, number>;
  byPecahan: Record<string, number>;
  byStatus: Record<string, number>;
  byKategoriPertubuhan: Record<string, number>;
  senaraiPertubuhan: { nama: string; kategori: string; bilangan: number }[];
}

const PERTUBUHAN_COLORS: Record<string, string> = {
  "NGO Melayu": "bg-green-500",
  "NGO India": "bg-orange-500",
  "NGO Cina": "bg-red-500",
  "NGO Sabah": "bg-cyan-500",
  "NGO Sarawak": "bg-teal-500",
  "Aktivis": "bg-purple-500",
};

const PERTUBUHAN_BADGE: Record<string, string> = {
  "NGO Melayu": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  "NGO India": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  "NGO Cina": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  "NGO Sabah": "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  "NGO Sarawak": "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  "Aktivis": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ["/api/stats"],
    refetchInterval: 5000,
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-20 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const total = stats?.total || 0;
  const byStatus = stats?.byStatus || {};
  const byKategori = stats?.byKategori || {};
  const byNegeri = stats?.byNegeri || {};
  const byPecahan = stats?.byPecahan || {};
  const byKategoriPertubuhan = stats?.byKategoriPertubuhan || {};
  const senaraiPertubuhan = stats?.senaraiPertubuhan || [];

  const belumTindakan = byStatus["Belum Diambil Tindakan"] || 0;
  const dalamSiasatan = byStatus["Dalam Siasatan"] || 0;
  const selesai = (byStatus["Siasatan Selesai"] || 0) + (byStatus["Kes Ditutup"] || 0);
  const totalPertubuhan = Object.values(byKategoriPertubuhan).reduce((a, b) => a + b, 0);

  return (
    <div className="p-4 md:p-6 space-y-6 overflow-y-auto h-full">
      {/* Live indicator */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        LIVE - Auto-refresh setiap 5 saat
        <span className="ml-auto">
          <Clock className="inline w-3 h-3 mr-1" />
          {new Date().toLocaleString("ms-MY", { timeZone: "Asia/Kuala_Lumpur" })}
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-total">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <FileText className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Jumlah Kes</p>
                <p className="text-2xl font-bold tabular-nums">{total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-pending">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Belum Tindakan</p>
                <p className="text-2xl font-bold tabular-nums text-red-500">{belumTindakan}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-investigating">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Shield className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Dalam Siasatan</p>
                <p className="text-2xl font-bold tabular-nums text-yellow-600">{dalamSiasatan}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-resolved">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Selesai</p>
                <p className="text-2xl font-bold tabular-nums text-green-600">{selesai}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown panels - Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* By Kategori Isu */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Pecahan Mengikut Kategori Isu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(byKategori).sort((a, b) => b[1] - a[1]).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground truncate mr-2">{key}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-muted rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${total ? (val / total) * 100 : 0}%` }}
                    />
                  </div>
                  <Badge variant="secondary" className="tabular-nums min-w-[2rem] justify-center">{val}</Badge>
                </div>
              </div>
            ))}
            {Object.keys(byKategori).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Tiada data</p>
            )}
          </CardContent>
        </Card>

        {/* By Negeri */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Pecahan Mengikut Negeri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(byNegeri).sort((a, b) => b[1] - a[1]).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground truncate mr-2">{key}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-muted rounded-full h-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all"
                      style={{ width: `${total ? (val / total) * 100 : 0}%` }}
                    />
                  </div>
                  <Badge variant="secondary" className="tabular-nums min-w-[2rem] justify-center">{val}</Badge>
                </div>
              </div>
            ))}
            {Object.keys(byNegeri).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Tiada data</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Breakdown panels - Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* By Pecahan Kaum */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Pecahan Versus Kaum</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(byPecahan).sort((a, b) => b[1] - a[1]).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground truncate mr-2">{key}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-muted rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full transition-all"
                      style={{ width: `${total ? (val / total) * 100 : 0}%` }}
                    />
                  </div>
                  <Badge variant="secondary" className="tabular-nums min-w-[2rem] justify-center">{val}</Badge>
                </div>
              </div>
            ))}
            {Object.keys(byPecahan).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Tiada data</p>
            )}
          </CardContent>
        </Card>

        {/* By Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Status Tindakan Polis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(byStatus).sort((a, b) => b[1] - a[1]).map(([key, val]) => {
              const color = key === "Belum Diambil Tindakan" ? "bg-red-500" :
                key === "Dalam Siasatan" ? "bg-yellow-500" :
                key === "Tindakan Undang-Undang" ? "bg-purple-500" :
                "bg-green-500";
              return (
                <div key={key} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground truncate mr-2">{key}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div
                        className={`${color} h-2 rounded-full transition-all`}
                        style={{ width: `${total ? (val / total) * 100 : 0}%` }}
                      />
                    </div>
                    <Badge variant="secondary" className="tabular-nums min-w-[2rem] justify-center">{val}</Badge>
                  </div>
                </div>
              );
            })}
            {Object.keys(byStatus).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Tiada data</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* NGO / Pertubuhan Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Kategori Pertubuhan / NGO */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Pertubuhan / NGO Mengikut Kategori
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(byKategoriPertubuhan).sort((a, b) => b[1] - a[1]).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground truncate mr-2">{key}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-muted rounded-full h-2">
                    <div
                      className={`${PERTUBUHAN_COLORS[key] || "bg-gray-500"} h-2 rounded-full transition-all`}
                      style={{ width: `${totalPertubuhan ? (val / totalPertubuhan) * 100 : 0}%` }}
                    />
                  </div>
                  <Badge variant="secondary" className="tabular-nums min-w-[2rem] justify-center">{val}</Badge>
                </div>
              </div>
            ))}
            {Object.keys(byKategoriPertubuhan).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Tiada data pertubuhan</p>
            )}
          </CardContent>
        </Card>

        {/* Senarai Nama Pertubuhan */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <User className="w-4 h-4" />
              Senarai Pertubuhan / Aktivis Terlibat
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {senaraiPertubuhan.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs pl-6">#</TableHead>
                    <TableHead className="text-xs">Nama Pertubuhan</TableHead>
                    <TableHead className="text-xs">Kategori</TableHead>
                    <TableHead className="text-xs text-right pr-6">Kes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {senaraiPertubuhan.map((item, idx) => (
                    <TableRow key={item.nama} data-testid={`row-pertubuhan-${idx}`}>
                      <TableCell className="text-xs tabular-nums pl-6">{idx + 1}</TableCell>
                      <TableCell className="text-xs font-medium">{item.nama}</TableCell>
                      <TableCell>
                        <Badge className={`text-[10px] ${PERTUBUHAN_BADGE[item.kategori] || "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"}`} variant="secondary">
                          {item.kategori}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-right tabular-nums font-semibold pr-6">{item.bilangan}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">Tiada pertubuhan direkodkan</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
