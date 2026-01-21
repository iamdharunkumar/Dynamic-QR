import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc, client } from "@/utils/orpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Save, Copy, Download } from "lucide-react";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/dashboard/qr/$id")({
  component: QRDetails,
});

function QRDetails() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  
  const { data: qr, isLoading } = useQuery({
      queryKey: orpc.qr.get.key({ input: { id } }),
      queryFn: () => client.qr.get({ id })
  });
  
  const { data: analytics } = useQuery({
      queryKey: orpc.analytics.getStats.key({ input: { qrId: id } }),
      queryFn: () => client.analytics.getStats({ qrId: id })
  });

  const [destUrl, setDestUrl] = useState("");

  useEffect(() => {
    if(qr) setDestUrl(qr.destinationUrl);
  }, [qr]);

  const updateMutation = useMutation(orpc.qr.update.mutationOptions({
      onSuccess: () => {
          toast.success("QR Code updated successfully");
          queryClient.invalidateQueries({ queryKey: orpc.qr.get.key({ input: { id } }) });
      },
      onError: () => {
          toast.error("Failed to update");
      }
  }));

  const handleUpdate = () => {
      updateMutation.mutate({ id, destinationUrl: destUrl });
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  if (!qr) return <div className="p-8 text-center text-red-500">QR Code Not Found</div>;

  // Placeholder domain for the short link
  const shortLink = `${window.location.origin}/${qr.shortCode}`; 

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
        <Link to="/dashboard" className="flex items-center text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Link>
        
        <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column: QR & Edit */}
            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>QR Code Visualization</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center">
                        <div className="bg-white p-4 rounded-xl border mb-4 shadow-sm">
                            {/* Placeholder using public API */}
                            <img 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${shortLink}&color=9787F3`} 
                                alt="QR Code" 
                                className="w-48 h-48 mix-blend-multiply"
                            />
                        </div>
                        <div className="flex gap-2 w-full">
                            <Button variant="outline" className="flex-1" onClick={() => {
                                navigator.clipboard.writeText(shortLink);
                                toast.success("Copied Link");
                            }}>
                                <Copy className="mr-2 h-4 w-4" /> Copy Link
                            </Button>
                             <Button variant="outline" className="flex-1">
                                <Download className="mr-2 h-4 w-4" /> PNG
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Destination</CardTitle>
                        <CardDescription>Edit where this QR code redirects to.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Destination URL</Label>
                            <Input 
                                value={destUrl} 
                                onChange={(e) => setDestUrl(e.target.value)} 
                                placeholder="https://example.com"
                            />
                        </div>
                        <Button onClick={handleUpdate} disabled={updateMutation.isPending} className="w-full">
                            {updateMutation.isPending && "Saving..."}
                            {!updateMutation.isPending && <><Save className="mr-2 h-4 w-4" /> Update Destination</>}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Right Column: Analytics */}
            <div className="lg:col-span-2 space-y-6">
                 <div className="flex items-center justify-between">
                     <h2 className="text-2xl font-bold">Analytics Overview</h2>
                 </div>
                 
                 <div className="grid sm:grid-cols-3 gap-4">
                     <StatCard label="Total Scans" value={analytics?.totalScans || 0} />
                     <StatCard label="Unique Visitors" value={analytics?.totalScans || 0} note="(Est.)" />
                     <StatCard label="Top City" value={analytics?.byCity?.[0]?.name || "-"} />
                 </div>

                 <div className="grid md:grid-cols-2 gap-6">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {analytics?.recentEvents?.length === 0 && <p className="text-muted-foreground text-sm">No recent scans detected.</p>}
                            <ul className="space-y-3">
                                {analytics?.recentEvents?.map((evt: any) => (
                                    <li key={evt.id} className="flex items-center justify-between text-sm border-b pb-2 last:border-0 last:pb-0">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-foreground">{evt.city || "Unknown Location"}, {evt.country}</span>
                                            <span className="text-xs text-muted-foreground">{new Date(evt.timestamp).toLocaleString()}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-primary">{evt.deviceType || "Other"}</span>
                                            <span className="text-xs text-muted-foreground">{evt.os}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                    
                     <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Device Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                             {analytics?.byDevice?.length === 0 && <p className="text-muted-foreground text-sm">No data yet.</p>}
                             <ul className="space-y-3">
                                {analytics?.byDevice?.map((dev: any) => (
                                    <li key={dev.name} className="flex items-center justify-between text-sm">
                                         <span className="flex items-center gap-2">
                                             <div className="h-2 w-2 rounded-full bg-primary" />
                                             {dev.name || "Unknown"}
                                         </span>
                                         <span className="font-bold">{dev.value}</span>
                                    </li>
                                ))}
                             </ul>
                        </CardContent>
                    </Card>
                 </div>
            </div>
        </div>
    </div>
  )
}

function StatCard({ label, value, note }: { label: string, value: string | number, note?: string }) {
    return (
        <Card className="bg-card hover:bg-accent/10 transition-colors">
            <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary mb-1">{value}</div>
                <div className="text-sm text-muted-foreground">{label} {note && <span className="text-xs opacity-70">{note}</span>}</div>
            </CardContent>
        </Card>
    )
}
