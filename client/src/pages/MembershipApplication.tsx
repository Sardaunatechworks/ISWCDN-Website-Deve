import { PageHeader } from "@/components/PageHeader";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// Local validation schema
const formSchema = z.object({
  category: z.enum([
    "Fellow",
    "Full",
    "Associate",
    "Graduate",
    "Student",
    "Corporate",
  ]),
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(7, "Invalid phone number"),
  qualification: z.string().min(2, "Please enter your qualification"),
});

type FormValues = z.infer<typeof formSchema>;

export default function MembershipApplication() {
  const { toast } = useToast();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      category: "Associate",
      qualification: "",
    },
  });

  async function onSubmit(data: FormValues) {
    try {
      await api.post('/applications/submit', {
        name: data.fullName,
        email: data.email,
        phone: data.phone,
        program: `${data.category} Membership`,
        qualification: data.qualification,
        application_type: 'Membership',
      });

      toast({
        title: "Application Received!",
        description: `Thank you, ${data.fullName}. Your membership application has been submitted to the Secretariat.`,
      });
      form.reset();
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit membership application. Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title="Membership Application"
        description="Begin your journey with ISWCDN. Fill out the form below."
      />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-border/50">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Dr. John Doe"
                        className="h-12 bg-slate-50"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="john@example.com"
                          className="h-12 bg-slate-50"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="+234..."
                          className="h-12 bg-slate-50"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Membership Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-12 bg-slate-50">
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Fellow">Fellow</SelectItem>
                        <SelectItem value="Full">Full Member</SelectItem>
                        <SelectItem value="Associate">
                          Associate Member
                        </SelectItem>
                        <SelectItem value="Graduate">
                          Graduate Member
                        </SelectItem>
                        <SelectItem value="Student">Student Member</SelectItem>
                        <SelectItem value="Corporate">
                          Corporate Member
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="qualification"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Highest Qualification</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. BSc Social Work, MSc Public Health"
                        className="h-12 bg-slate-50"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-6">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-12 text-lg bg-primary hover:bg-primary/90"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting
                    ? "Submitting..."
                    : "Submit Application"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
