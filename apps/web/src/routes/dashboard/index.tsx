import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, QrCode as QrIcon, MoreHorizontal, BarChart2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export const Route = createFileRoute("/dashboard/")({
  component: DashboardIndex,
});

function DashboardIndex() {
  const { data: qrs, isLoading } = useQuery(orpc.qr.list.queryOptions());

  return (
    <div>
       <div className="flex items-center justify-between mb-8">
           <div>
              <h1 className="text-3xl font-bold tracking-tight">My QR Codes</h1>
              <p className="text-muted-foreground">Manage and track your dynamic QR codes.</p>
           </div>
           <Link to="/dashboard/create">
             <Button>
                <Plus className="mr-2 h-4 w-4" /> Create QR
             </Button>
           </Link>
       </div>

       {isLoading && <div>Loading...</div>}

       {!isLoading && qrs?.length === 0 && (
           <div className="text-center py-20 border rounded-xl bg-card border-dashed">
               <QrIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
               <h3 className="text-lg font-medium">No QR Codes yet</h3>
               <p className="text-muted-foreground mb-6">Create your first dynamic QR code to get started.</p>
               <Link to="/dashboard/create">
                  <Button>Create Now</Button>
               </Link>
           </div>
       )}

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {qrs?.map((qr) => (
              <Card key={qr.id} className="hover:border-primary/50 transition-colors">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                     <CardTitle className="text-base font-semibold truncate pr-4">
                        {qr.title || qr.shortCode}
                     </CardTitle>
                     <DropdownMenu>
                        <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", size: "icon" })}>
                        <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                                <Link to="/dashboard/qr/$id" params={{ id: qr.id }} className="w-full">
                                    Edit / Details
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                     </DropdownMenu>
                  </CardHeader>
                  <CardContent>
                      <div className="text-xs text-muted-foreground mb-4 font-mono truncate bg-muted p-1 rounded px-2">
                          {qr.destinationUrl}
                      </div>
                      <div className="flex items-center justify-between mt-4">
                          <Link to="/dashboard/qr/$id" params={{ id: qr.id }}>
                             <Button variant="outline" size="sm" className="h-8">
                                <BarChart2 className="mr-2 h-3 w-3" /> Analytics
                             </Button>
                          </Link>
                          <span className="text-xs text-muted-foreground">
                             {new Date(qr.createdAt).toLocaleDateString()}
                          </span>
                      </div>
                  </CardContent>
              </Card>
          ))}
       </div>
    </div>
  )
}
