// components/Signup.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
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
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  IdCard,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const signupFormSchema = z
  .object({
    username: z.string().min(2, {
      message: "Username must be at least 2 characters.",
    }),
    staffId: z.string().min(1, {
      message: "Staff ID is required.",
    }),
    email: z.string().email({
      message: "Please enter a valid email address.",
    }),
    password: z.string().min(6, {
      message: "Password must be at least 6 characters.",
    }),
    confirmPassword: z.string().min(6, {
      message: "Password must be at least 6 characters.",
    }),
    phone: z.string().min(10, {
      message: "Please enter a valid phone number.",
    }),
    role: z.enum(["admin", "hr"], {
      message: "Please select a valid role.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignupFormValues = z.infer<typeof signupFormSchema>;

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signup, googleSignIn } = useAuth();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      username: "",
      staffId: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      role: "hr",
    },
  });

  const showSuccessToast = (message: string, autoLoggedIn: boolean = true) => {
    toast.success(message, {
      description: autoLoggedIn
        ? "You have been automatically logged in!"
        : "Please login with your credentials.",
      duration: 5000,
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      action: autoLoggedIn
        ? {
            label: "View Dashboard",
            onClick: () => (window.location.href = "/"),
          }
        : {
            label: "Login Now",
            onClick: () => (window.location.href = "/login"),
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
      description: "Please check your information and try again.",
      duration: 6000,
      icon: <XCircle className="h-5 w-5 text-red-500" />,
      action: {
        label: "Try Again",
        onClick: () => {
          form.setFocus("username");
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

  const showGoogleToast = () => {
    toast.info("Redirecting to Google", {
      description: "You'll be redirected to Google for authentication.",
      duration: 3000,
      icon: <AlertCircle className="h-5 w-5 text-blue-500" />,
      action: {
        label: "Cancel",
        onClick: () => toast.dismiss(),
      },
      classNames: {
        toast:
          "group border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800",
        title: "text-blue-900 dark:text-blue-100 font-semibold",
        description: "text-blue-700 dark:text-blue-300",
        actionButton:
          "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800",
      },
    });
  };

  const onSubmit = async (data: SignupFormValues) => {
    setIsSubmitting(true);

    // Show loading toast
    const loadingToastId = toast.loading("Creating your account...", {
      description: "Please wait while we set up your account.",
      duration: Infinity,
    });

    try {
      // Map to backend expected format (remove confirmPassword for backend)
      const signupData = {
        username: data.username,
        staffId: data.staffId,
        email: data.email,
        password: data.password,
        phone: data.phone,
        role: data.role,
        confirmPassword: data.confirmPassword, // keep for frontend validation
      };

      await signup(signupData);

      // Dismiss loading toast and show success
      toast.dismiss(loadingToastId);
      showSuccessToast("Account created successfully! 🎉");

      // Note: Navigation happens automatically in the signup function
      // after successful authentication
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Account creation failed. Please try again.";

      // Dismiss loading toast and show error
      toast.dismiss(loadingToastId);
      showErrorToast(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = () => {
    showGoogleToast();
    setTimeout(() => {
      googleSignIn();
    }, 1500);
  };

  // Generate a suggested staff ID based on username
  const generateStaffId = (username: string) => {
    if (username.length < 2) return "";
    const prefix = username.substring(0, 3).toUpperCase();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `${prefix}${random}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-2xl shadow-xl border-0">
        <CardHeader className="space-y-1 text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <User className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-br from-blue-600 to-indigo-700 bg-clip-text text-transparent">
            Join Our Team
          </CardTitle>
          <CardDescription className="text-base">
            Create your Leave Management System account
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Username */}
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Username *
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                          <Input
                            placeholder="johndoe"
                            className="pl-10 pr-4 h-11 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            {...field}
                            disabled={isSubmitting}
                            onBlur={(e) => {
                              field.onBlur();
                              // Auto-generate staff ID when username is filled
                              if (
                                e.target.value &&
                                !form.getValues("staffId")
                              ) {
                                form.setValue(
                                  "staffId",
                                  generateStaffId(e.target.value)
                                );
                              }
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {/* Staff ID */}
                <FormField
                  control={form.control}
                  name="staffId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Staff ID *
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                          <Input
                            placeholder="ASST001"
                            className="pl-10 pr-4 h-11 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Email *
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                          <Input
                            placeholder="name@company.com"
                            className="pl-10 pr-4 h-11 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {/* Phone */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Phone *
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                          <Input
                            placeholder="+254 793 587 027"
                            className="pl-10 pr-4 h-11 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {/* Password */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Password *
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••"
                            className="pl-10 pr-11 h-11 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            {...field}
                            disabled={isSubmitting}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-muted-foreground hover:text-foreground transition-colors"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isSubmitting}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {/* Confirm Password */}
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Confirm Password *
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••"
                            className="pl-10 pr-11 h-11 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            {...field}
                            disabled={isSubmitting}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-muted-foreground hover:text-foreground transition-colors"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            disabled={isSubmitting}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {/* Role */}
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Role *
                      </FormLabel>
                      <FormControl>
                        <select
                          className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          {...field}
                          disabled={isSubmitting}
                        >
                          <option value="hr">HR Manager</option>
                          <option value="admin">Administrator</option>
                        </select>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <User className="mr-2 h-4 w-4" />
                    Create Account
                  </>
                )}
              </Button>
            </form>
          </Form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-3 text-muted-foreground font-medium">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            type="button"
            className="w-full h-11 border-2 font-medium transition-all duration-200 hover:border-gray-300 hover:bg-gray-50"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
          >
            <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>

          <div className="text-center text-sm pt-4 border-t">
            <span className="text-muted-foreground">
              Already have an account?{" "}
            </span>
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
            >
              Sign in here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
