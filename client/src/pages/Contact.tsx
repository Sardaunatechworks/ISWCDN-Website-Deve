import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, ShieldCheck, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// Validation schema
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type FormValues = z.infer<typeof formSchema>;

interface ContactSettings {
  phone1: string;
  phone2: string;
  email: string;
  location: string;
  address: string;
}

export default function Contact() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<ContactSettings | null>(null);

  useEffect(() => {
    async function fetchContactInfo() {
      try {
        const data = await api.get<ContactSettings>('/settings');
        if (data) setSettings(data);
      } catch (err) {
        console.error("Failed to fetch contact settings:", err);
      }
    }
    fetchContactInfo();
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      await api.post('/messages/submit', values);

      toast({
        title: "Message Sent",
        description: `Thank you, ${values.name}. We've received your message and will get back to you soon.`,
      });
      form.reset();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again later.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Contact Us"
        description="We are here to answer your questions and discuss how we can work together."
      />

      <div className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Contact Info */}
          <div className="space-y-10">
            <div>
              <h2 className="text-3xl font-serif font-bold text-primary mb-6">
                Get in Touch
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Whether you have questions about our courses, membership, or
                partnership opportunities, our team is ready to assist you.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-slate-50 p-3 rounded-lg text-primary border border-border">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Headquarters</h3>
                  <p className="text-muted-foreground">{settings?.location || "Bauchi, Nigeria"}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-slate-50 p-3 rounded-lg text-primary border border-border">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Phone</h3>
                  <p className="text-muted-foreground">{settings?.phone1 || "+234 803 627 4417"}</p>
                  {settings?.phone2 && <p className="text-muted-foreground">{settings.phone2}</p>}
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-slate-50 p-3 rounded-lg text-primary border border-border">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Email</h3>
                  <a
                    href={`mailto:${settings?.email || 'isowcode@gmail.com'}`}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {settings?.email || 'isowcode@gmail.com'}
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 rounded-2xl p-8 border border-primary/10">
              <h3 className="text-xl font-bold text-primary mb-4 flex items-center">
                <ShieldCheck className="h-6 w-6 mr-2" />
                Institutional Visit
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Our headquarters is located in the heart of Bauchi. We welcome
                professional visits by appointment during official working hours
                (9:00 AM - 4:00 PM).
              </p>
              <div className="bg-white p-4 rounded-xl border border-border shadow-sm">
                <p className="text-sm font-semibold text-primary mb-1">
                  Administrative Office
                </p>
                <p className="text-sm text-muted-foreground italic">
                  {settings?.address || "Bauchi, Nigeria"}
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-slate-50 p-8 md:p-10 rounded-3xl border border-border">
            <h3 className="text-2xl font-bold text-primary mb-6">
              Send us a Message
            </h3>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="John Doe"
                          className="bg-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="john@example.com"
                          className="bg-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Inquiry about..."
                          className="bg-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="How can we help you?"
                          className="min-h-[120px] bg-white resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-12 text-lg bg-primary hover:bg-primary/90"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</>
                  ) : "Send Message"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
