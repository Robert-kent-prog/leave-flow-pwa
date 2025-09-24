// components/Login.tsx
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
  User,
  Lock,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

// Updated schema to accept email, username, or staff ID
const loginFormSchema = z.object({
  identifier: z.string().min(1, {
    message: "Please enter your email, username, or staff ID.",
  }),
  password: z.string().min(1, {
    message: "Please enter your password.",
  }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, googleSignIn } = useAuth();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const showSuccessToast = (message: string) => {
    toast.success(message, {
      description: "Welcome back to your account!",
      duration: 4000,
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
      description: "Please check your credentials and try again.",
      duration: 6000,
      icon: <XCircle className="h-5 w-5 text-red-500" />,
      action: {
        label: "Try Again",
        onClick: () => {
          form.setFocus("identifier");
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

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);

    // Show loading toast
    const loadingToastId = toast.loading("Authenticating...", {
      description: "Please wait while we verify your credentials.",
      duration: Infinity, // Will be manually dismissed
    });

    try {
      await login(data.identifier, data.password);

      // Dismiss loading toast and show success
      toast.dismiss(loadingToastId);
      showSuccessToast("Login successful! 🎉");
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Login failed. Please try again.";

      // Dismiss loading toast and show error
      toast.dismiss(loadingToastId);
      showErrorToast(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = () => {
    showGoogleToast();
    // Add a small delay to show the toast before redirecting
    setTimeout(() => {
      googleSignIn();
    }, 1500);
  };

  // Determine input type for icon display
  const getInputType = (value: string): "email" | "username" | "staffId" => {
    if (value.includes("@")) return "email";
    if (/^\d+$/.test(value)) return "staffId";
    return "username";
  };

  const getPlaceholder = (type: "email" | "username" | "staffId") => {
    switch (type) {
      case "email":
        return "name@company.com";
      case "staffId":
        return "Staff ID";
      case "username":
        return "Username";
      default:
        return "Email, username, or staff ID";
    }
  };

  const getIcon = (type: "email" | "username" | "staffId") => {
    switch (type) {
      case "email":
        return (
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        );
      case "staffId":
      case "username":
        return (
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        );
      default:
        return (
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        );
    }
  };

  const identifierValue = form.watch("identifier");
  const inputType = getInputType(identifierValue);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="space-y-1 text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-br from-blue-600 to-indigo-700 bg-clip-text text-transparent">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-base">
            Sign in to your Leave Management account
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="identifier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Email, Username, or Staff ID
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        {getIcon(inputType)}
                        <Input
                          placeholder={getPlaceholder(inputType)}
                          className="pl-10 pr-4 h-11 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          {...field}
                          disabled={isSubmitting}
                          onBlur={() => {
                            const value = field.value.trim();
                            if (inputType === "email") {
                              field.onChange(value.toLowerCase());
                            }
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Password
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

              <div className="flex items-center justify-between text-sm">
                <Link
                  to="/forgot-password"
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Sign In
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
              Don't have an account?{" "}
            </span>
            <Link
              to="/signup"
              className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
            >
              Sign up now
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
