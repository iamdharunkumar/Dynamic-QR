import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";

export const Route = createFileRoute("/dashboard/create")({
  component: CreateQR,
});

function CreateQR() {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [color, setColor] = useState("#9787F3");

  const createMutation = useMutation(orpc.qr.create.mutationOptions({
      onSuccess: (data) => {
          toast.success("QR Code Created!");
          navigate({ to: `/dashboard/qr/${data.id}` });
      },
      onError: (err) => {
          toast.error("Failed to create QR code: " + err.message);
      }
  }));

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if(!url) return toast.error("URL is required");
      createMutation.mutate({
            destinationUrl: url,
            title: title || undefined,
            designConfig: {
                color: color,
                shape: "square"
            }
      });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in slide-in-from-bottom-5 duration-500">
        <Link to="/dashboard" className="flex items-center text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Link>
        <Card>
            <CardHeader>
                <CardTitle>Create New QR Code</CardTitle>
                <CardDescription>Generate a dynamic QR code for your link.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="url">Destination URL</Label>
                        <Input 
                            id="url"
                            type="url"
                            placeholder="https://example.com/my-page"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            required
                            className="bg-background"
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="title">Title (Optional)</Label>
                        <Input 
                            id="title"
                            placeholder="e.g. Summer Marketing Campaign"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="bg-background"
                        />
                    </div>

                    <div className="space-y-2">
                         <Label>QR Color</Label>
                         <div className="flex gap-3">
                             {["#000000", "#9787F3", "#2D274B", "#E11D48", "#2563EB"].map(c => (
                                 <button
                                    key={c}
                                    type="button"
                                    className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? 'border-primary ring-2 ring-primary/30' : 'border-transparent'}`}
                                    style={{ backgroundColor: c }}
                                    onClick={() => setColor(c)}
                                 />
                             ))}
                             <div className="relative">
                                <input 
                                    type="color" 
                                    className="w-10 h-10 p-0 border-0 rounded-full overflow-hidden cursor-pointer"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                />
                             </div>
                         </div>
                    </div>

                    <Button type="submit" size="lg" className="w-full" disabled={createMutation.isPending}>
                        {createMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Create QR Code
                    </Button>
                </form>
            </CardContent>
        </Card>
    </div>
  )
}
