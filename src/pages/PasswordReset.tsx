import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Mail,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

// Schema: only email is needed for password reset request
const passwordResetSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required." })
    .email({ message: "Please enter a valid email address." }),
});

type PasswordResetFormValues = z.infer<typeof passwordResetSchema>;

const PasswordReset = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const form = useForm<PasswordResetFormValues>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      email: "",
    },
  });

  const showSuccessToast = (message: string) => {
    toast.success(message, {
      description:
        "Check your inbox for a link to reset your password. The link expires in 1 hour.",
      duration: 6000,
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      action: {
        label: "Dismiss",
        onClick: () => toast.dismiss(),
      },
      classNames: {
        toast:
          "group border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800",
        title: "text-green-900 dark:text-green-100 font-semibold",
        description: "text-green-700 dark:text-green-300",
        actionButton:
          "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800",
      },
    });
  };

  const showErrorToast = (message: string) => {
    toast.error(message, {
      description: "Please try again or contact support.",
      duration: 6000,
      icon: <XCircle className="h-5 w-5 text-red-500" />,
      action: {
        label: "Try Again",
        onClick: () => {
          form.setFocus("email");
        },
      },
      classNames: {
        toast:
          "group border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800",
        title: "text-red-900 dark:text-red-100 font-semibold",
        description: "text-red-700 dark:text-red-300",
        actionButton:
          "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800",
      },
    });
  };

  const onSubmit = async (data: PasswordResetFormValues) => {
    setIsSubmitting(true);

    const loadingToastId = toast.loading("Sending reset link...", {
      description: "We're emailing you a secure password reset link.",
      duration: Infinity,
    });

    try {
      // ✅ Replace this with your actual API call
      // Example: await api.post('/auth/forgot-password', { email: data.email });
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      toast.dismiss(loadingToastId);
      showSuccessToast("Reset link sent! ✉️");

      // Optional: redirect after success
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to send reset link. Please try again.";

      toast.dismiss(loadingToastId);
      showErrorToast(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="space-y-1 text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <AlertTriangle className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-br from-blue-600 to-indigo-700 bg-clip-text text-transparent">
            Reset Your Password
          </CardTitle>
          <CardDescription className="text-base">
            Enter your email and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Email Address *
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          type="email"
                          placeholder="name@company.com"
                          className="pl-10 pr-4 h-11 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          {...field}
                          disabled={isSubmitting}
                          onBlur={() => {
                            field.onChange(field.value.trim().toLowerCase());
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Reset Link
                  </>
                )}
              </Button>
            </form>
          </Form>

          <div className="text-center text-sm pt-2">
            <span className="text-muted-foreground">
              Remember your password?{" "}
            </span>
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
            >
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordReset;
