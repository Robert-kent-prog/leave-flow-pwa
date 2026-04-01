import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Eye,
  EyeOff,
  Lock,
  Loader2,
  Mail,
  ShieldCheck,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const loginFormSchema = z.object({
  identifier: z.string().min(1, "Enter your email, username, or staff ID."),
  password: z.string().min(1, "Enter your password."),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

const getIdentifierType = (value: string) => {
  if (value.includes("@")) {
    return "email";
  }

  if (/^\d+$/.test(value)) {
    return "staff";
  }

  return "username";
};

const getIdentifierPlaceholder = (type: ReturnType<typeof getIdentifierType>) => {
  if (type === "email") {
    return "name@company.com";
  }

  if (type === "staff") {
    return "Staff ID";
  }

  return "Username";
};

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const identifierValue = form.watch("identifier");
  const identifierType = useMemo(
    () => getIdentifierType(identifierValue),
    [identifierValue],
  );

  const onSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true);

    try {
      await login(values.identifier.trim(), values.password);
      toast.success("Signed in successfully.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to sign in.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center">
        <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_420px]">
          <div className="hidden rounded-[28px] border border-slate-200 bg-white p-10 shadow-sm lg:block dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-full flex-col justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                  LeaveFlow
                </p>
                <h1 className="mt-4 max-w-lg text-4xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
                  Employee self-service with HR approval control.
                </h1>
                <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300">
                  Employees submit their own requests, HR reviews them in one
                  queue, and the leave record keeps a clear owner and audit
                  trail.
                </p>
              </div>

              <div className="grid gap-4">
                {[
                  "Sign in with email, username, or staff ID.",
                  "Employees can track only their own requests and statuses.",
                  "HR keeps approval and on-behalf submission authority.",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800"
                  >
                    <div className="rounded-xl bg-slate-100 p-2 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Card className="border-slate-200 shadow-sm dark:border-slate-800">
            <CardHeader className="space-y-3 pb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-2xl">Sign in</CardTitle>
                <CardDescription className="mt-1 text-sm">
                  Access the leave workspace with your existing account.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-5"
                >
                  <FormField
                    control={form.control}
                    name="identifier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email, Username, or Staff ID</FormLabel>
                        <FormControl>
                          <div className="relative">
                            {identifierType === "email" ? (
                              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            ) : (
                              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            )}
                            <Input
                              {...field}
                              className="h-11 pl-10"
                              placeholder={getIdentifierPlaceholder(
                                identifierType,
                              )}
                              disabled={isSubmitting}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              {...field}
                              type={showPassword ? "text" : "password"}
                              className="h-11 pl-10 pr-11"
                              placeholder="Enter your password"
                              disabled={isSubmitting}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-1 top-1 h-9 w-9"
                              onClick={() => setShowPassword((value) => !value)}
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Employees and HR use the same sign-in.
                    </span>
                    <Link
                      to="/forgot-password"
                      className="font-medium text-slate-900 hover:underline dark:text-slate-100"
                    >
                      Forgot password
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    className="h-11 w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in
                      </>
                    ) : (
                      "Sign in"
                    )}
                  </Button>
                </form>
              </Form>

              <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
                New employee account?
                <Link
                  to="/signup"
                  className="ml-1 font-medium text-slate-950 hover:underline dark:text-slate-50"
                >
                  Create one here
                </Link>
                .
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
