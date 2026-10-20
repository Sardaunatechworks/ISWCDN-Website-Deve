import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Save, Phone, Mail, MapPin, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface InstituteSettings {
  id: string | number;
  phone1: string;
  phone2: string;
  email: string;
  location: string;
  address: string;
  years_impact?: string;
}

export default function AdminSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [settings, setSettings] = useState<InstituteSettings | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      setFetching(true);
      const data = await api.get<InstituteSettings>('/settings');
      setSettings(data);
    } catch (error: any) {
      console.error('Error fetching settings:', error.message);
    } finally {
      setFetching(false);
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setLoading(true);
    try {
      await api.put('/settings', {
        phone1: settings.phone1,
        phone2: settings.phone2,
        email: settings.email,
        location: settings.location,
        address: settings.address,
        years_impact: settings.years_impact || "10+",
      });

      toast({
        title: "Settings Saved",
        description: "Institute details have been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (settings) {
      setSettings({ ...settings, [name]: value });
    }
  };

  if (fetching) {
    return (
      <div className="h-96 w-full flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold font-serif text-primary tracking-tight">Settings</h2>
          <p className="text-muted-foreground mt-1">Manage your public institute contact details here.</p>
        </div>
        <Button variant="outline" onClick={fetchSettings} disabled={loading}>
          Refresh
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-border/60 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-serif">Public Contact Details</CardTitle>
            <CardDescription>These details are displayed on the Contact page, Home page, and Footer.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold flex items-center gap-2 text-foreground">
                    <Phone className="h-4 w-4 text-primary" /> Primary Phone
                  </label>
                  <Input 
                    name="phone1"
                    value={settings?.phone1 || ""} 
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold flex items-center gap-2 text-foreground">
                    <Phone className="h-4 w-4 text-primary" /> Secondary Phone
                  </label>
                  <Input 
                    name="phone2"
                    value={settings?.phone2 || ""} 
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold flex items-center gap-2 text-foreground">
                    <Mail className="h-4 w-4 text-primary" /> Email Address
                  </label>
                  <Input 
                    name="email"
                    type="email"
                    value={settings?.email || ""} 
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold flex items-center gap-2 text-foreground">
                    <MapPin className="h-4 w-4 text-primary" /> Headquarters Location
                  </label>
                  <Input 
                    name="location"
                    value={settings?.location || ""} 
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-6">
                <div className="sm:col-span-2 space-y-2">
                  <label className="text-sm font-bold flex items-center gap-2 text-foreground">
                    Office Address Details
                  </label>
                  <Input 
                    name="address"
                    value={settings?.address || ""} 
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold flex items-center gap-2 text-foreground">
                    Years of Impact
                  </label>
                  <Input 
                    name="years_impact"
                    placeholder="10+"
                    value={settings?.years_impact || ""} 
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="pt-4 border-t border-border flex justify-end">
                <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
                  {loading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                  ) : (
                    <><Save className="h-4 w-4 mr-2" /> Save Changes</>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Security / Admin Profile snippet */}
        <Card className="h-fit border-border/60 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-serif">Admin Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="p-4 bg-slate-50 border border-border/50 rounded-lg flex gap-4 items-center">
               <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                 AD
               </div>
               <div>
                 <p className="font-bold text-foreground">System Admin</p>
                 <p className="text-xs text-muted-foreground">Admin Portal</p>
               </div>
             </div>
             <Button variant="outline" className="w-full hover:bg-slate-50 border-border" disabled>Managed via DirectAdmin MySQL & JWT Auth</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
