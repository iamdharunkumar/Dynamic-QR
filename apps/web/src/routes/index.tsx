import { Link } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { QrCode, ArrowRight, BarChart3, Edit3, Link as LinkIcon } from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
       {/* Navbar */}
       <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
         <div className="container mx-auto px-4 h-16 flex items-center justify-between">
           <div className="flex items-center gap-2 font-bold text-xl text-primary">
             <QrCode className="h-6 w-6" />
             <span>DynamicQR</span>
           </div>
           <div className="flex gap-4">
               <Link to="/login">
                  <Button variant="ghost">Sign In</Button>
               </Link>
               <Link to="/login">
                 <Button>Get Started</Button>
               </Link>
           </div>
         </div>
       </nav>

       {/* Hero */}
       <main className="flex-1">
         <section className="py-20 lg:py-32 container mx-auto px-4 text-center">
             <h1 className="text-4xl lg:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-primary to-violet-600 bg-clip-text text-transparent">
               QR Codes that Evolve.
             </h1>
             <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
               Generate dynamic QR codes with mutable destinations. Track analytics, update links in real-time, and manage everything from a beautiful dashboard.
             </p>

             <div className="max-w-md mx-auto flex gap-2 p-2 bg-card rounded-xl shadow-lg border border-border/50">
                <Input placeholder="Enter your destination URL..." className="border-0 shadow-none focus-visible:ring-0 bg-transparent" />
                <Link to="/login">
                  <Button className="shrink-0 rounded-lg">Create QR <ArrowRight className="ml-2 h-4 w-4" /></Button>
                </Link>
             </div>
             <p className="text-sm text-muted-foreground mt-4">No credit card required for 7-day trial.</p>
         </section>

         {/* Features */}
         <section className="py-20 bg-white/50 dark:bg-black/20">
            <div className="container mx-auto px-4 grid md:grid-cols-3 gap-8">
               <FeatureCard 
                 icon={<Edit3 className="h-10 w-10 text-primary" />}
                 title="Dynamic Editing"
                 description="Change the destination URL of your QR code instantly without reprinting."
               />
               <FeatureCard 
                 icon={<BarChart3 className="h-10 w-10 text-primary" />}
                 title="Advanced Analytics"
                 description="Track scans, locations, and device types to understand your audience."
               />
               <FeatureCard 
                 icon={<LinkIcon className="h-10 w-10 text-primary" />}
                 title="Short Links"
                 description="Every QR code comes with a branded short link for easy sharing."
               />
            </div>
         </section>
       </main>
       
       <footer className="py-10 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} DynamicQR. All rights reserved.
       </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="border-none shadow-sm bg-card hover:shadow-md transition-shadow">
      <CardContent className="pt-6 text-center flex flex-col items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-full">
          {icon}
        </div>
        <h3 className="font-semibold text-xl">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
