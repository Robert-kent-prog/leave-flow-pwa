import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Camera,
  Save,
  User,
  Mail,
  Building,
  Phone,
  Lock,
  Shield,
  CheckCircle,
  XCircle,
  Trash2,
  LogOut,
  RefreshCw,
  Smartphone,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Profile form schema
const profileFormSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  staffId: z.string().min(1, {
    message: "StaffId is required.",
  }),
  phone: z.string().min(10, {
    message: "Please enter a valid phone number.",
  }),
});

// Password change schema
const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, {
      message: "Current password is required.",
    }),
    newPassword: z.string().min(6, {
      message: "New password must be at least 6 characters.",
    }),
    confirmPassword: z.string().min(6, {
      message: "Please confirm your password.",
    }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type PasswordChangeValues = z.infer<typeof passwordChangeSchema>;

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [activeSessions, setActiveSessions] = useState([
    {
      id: "1",
      device: "Chrome on Windows",
      location: "New York, USA",
      lastActive: "2 hours ago",
      current: true,
    },
    {
      id: "2",
      device: "Safari on iPhone",
      location: "San Francisco, USA",
      lastActive: "1 day ago",
      current: false,
    },
    {
      id: "3",
      device: "Firefox on Mac",
      location: "London, UK",
      lastActive: "1 week ago",
      current: false,
    },
  ]);
  const { user, updateProfile, changePassword } = useAuth(); // Import the functions from context

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: user?.username || "",
      email: user?.email || "",
      staffId: user?.staffId || "",
      phone: user?.phone || "",
    },
  });

  const passwordForm = useForm<PasswordChangeValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Reset form when user data changes
  useEffect(() => {
    if (user) {
      profileForm.reset({
        username: user.username,
        email: user.email,
        staffId: user.staffId,
        phone: user.phone,
      });
    }
  }, [user, profileForm]);

  async function onSubmitProfile(data: ProfileFormValues) {
    setIsLoading(true);
    try {
      // Call the updateProfile function from AuthContext
      const updatedUser = await updateProfile(data);

      if (!updatedUser) {
        throw new Error("No user data returned after update");
      }

      console.log("Profile updated successfully:", updatedUser);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);

      // Check if it's an authentication error
      if (
        (error instanceof Error && error.message.includes("token")) ||
        error.message.includes("unauthorized")
      ) {
        toast.error("Session expired. Please login again.");
      } else {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to update profile. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function onSubmitPassword(data: PasswordChangeValues) {
    setIsChangingPassword(true);
    try {
      // Call the changePassword function from AuthContext
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmNewPassword: data.confirmPassword,
      });

      console.log("Password changed successfully");
      passwordForm.reset();
      setIsChangingPassword(false);
      toast.success("Password changed successfully!");
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to change password. Please try again."
      );
    } finally {
      setIsChangingPassword(false);
    }
  }
  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files[0]) {
      setIsUploadingAvatar(true);
      try {
        // Simulate upload - replace with actual upload logic
        await new Promise((resolve) => setTimeout(resolve, 1500));
        toast.success("Profile picture updated successfully!");
      } catch (error) {
        console.error("Error uploading avatar:", error);
        toast.error("Failed to upload profile picture. Please try again.");
      } finally {
        setIsUploadingAvatar(false);
      }
    }
  };

  const handleToggleTwoFactor = async () => {
    try {
      // Simulate API call - replace with actual 2FA toggle
      await new Promise((resolve) => setTimeout(resolve, 800));
      setTwoFactorEnabled(!twoFactorEnabled);
      toast.success(
        `Two-factor authentication ${
          !twoFactorEnabled ? "enabled" : "disabled"
        } successfully!`
      );
    } catch (error) {
      console.error("Error toggling 2FA:", error);
      toast.error("Failed to update two-factor authentication settings.");
    }
  };

  const handleResendVerification = async () => {
    try {
      // Simulate API call - replace with actual resend verification
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast.success("Verification email sent! Please check your inbox.");
    } catch (error) {
      console.error("Error resending verification:", error);
      toast.error("Failed to send verification email. Please try again.");
    }
  };

  const handleTerminateSession = async (sessionId: string) => {
    try {
      // Simulate API call - replace with actual session termination
      await new Promise((resolve) => setTimeout(resolve, 800));
      setActiveSessions(
        activeSessions.filter((session) => session.id !== sessionId)
      );
      toast.success("Session terminated successfully!");
    } catch (error) {
      console.error("Error terminating session:", error);
      toast.error("Failed to terminate session. Please try again.");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // Simulate API call - replace with actual account deletion
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Account deleted successfully!");
      // Redirect to login or home page after deletion
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
          Profile
        </h1>
        <p className="text-muted-foreground">
          Manage your account settings and personal information.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile Information</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
                <CardDescription>
                  This will be displayed on your profile.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <Avatar className="h-32 w-32">
                  <AvatarImage
                    src="/avatars/hr-admin.jpg"
                    alt={user?.username || "User"}
                  />
                  <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                    {user?.username?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-2 w-full">
                  <Button
                    variant="outline"
                    className="w-full relative"
                    disabled={isUploadingAvatar}
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Change Avatar
                    <Input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleAvatarUpload}
                      disabled={isUploadingAvatar}
                    />
                  </Button>
                  {isUploadingAvatar && (
                    <p className="text-xs text-muted-foreground text-center">
                      Uploading...
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal information here.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form
                    onSubmit={profileForm.handleSubmit(onSubmitProfile)}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={profileForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              <User className="mr-2 h-4 w-4" />
                              Username
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Your username"
                                {...field}
                                disabled={!isEditing || isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              <Mail className="mr-2 h-4 w-4" />
                              Email
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Your email"
                                {...field}
                                disabled={!isEditing || isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                            <div className="flex items-center mt-1">
                              {user?.email === "verified@example.com" ? (
                                <Badge
                                  variant="outline"
                                  className="bg-green-50 text-green-700 border-green-200"
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant="outline"
                                    className="bg-yellow-50 text-yellow-700 border-yellow-200"
                                  >
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Not Verified
                                  </Badge>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs"
                                    onClick={handleResendVerification}
                                  >
                                    <RefreshCw className="h-3 w-3 mr-1" />
                                    Resend
                                  </Button>
                                </div>
                              )}
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={profileForm.control}
                        name="staffId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              <Building className="mr-2 h-4 w-4" />
                              StaffId
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Your StaffId"
                                {...field}
                                disabled={!isEditing || isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              <Phone className="mr-2 h-4 w-4" />
                              Phone
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Your phone number"
                                {...field}
                                disabled={!isEditing || isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end space-x-2">
                      {isEditing ? (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsEditing(false)}
                            disabled={isLoading}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                              <>
                                <Save className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="mr-2 h-4 w-4" />
                                Save Changes
                              </>
                            )}
                          </Button>
                        </>
                      ) : (
                        <Button
                          type="button"
                          onClick={() => setIsEditing(true)}
                          disabled={isLoading}
                        >
                          Edit Profile
                        </Button>
                      )}
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="mr-2 h-5 w-5" />
                  Change Password
                </CardTitle>
                <CardDescription>
                  Update your password to keep your account secure.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...passwordForm}>
                  <form
                    onSubmit={passwordForm.handleSubmit(onSubmitPassword)}
                    className="space-y-4"
                  >
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Enter current password"
                              {...field}
                              disabled={isChangingPassword}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Enter new password"
                              {...field}
                              disabled={isChangingPassword}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Confirm new password"
                              {...field}
                              disabled={isChangingPassword}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={isChangingPassword}>
                      {isChangingPassword ? (
                        <>
                          <Save className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          Change Password
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-5 w-5" />
                  Two-Factor Authentication
                </CardTitle>
                <CardDescription>
                  Add an extra layer of security to your account.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="two-factor">
                      Two-Factor Authentication
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {twoFactorEnabled
                        ? "Enabled - Requires a verification code when signing in"
                        : "Disabled - Your account is less secure"}
                    </p>
                  </div>
                  <Switch
                    id="two-factor"
                    checked={twoFactorEnabled}
                    onCheckedChange={handleToggleTwoFactor}
                  />
                </div>
                {twoFactorEnabled && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <h4 className="font-medium flex items-center">
                      <Smartphone className="mr-2 h-4 w-4" />
                      Setup Instructions
                    </h4>
                    <p className="text-sm text-muted-foreground mt-2">
                      Use an authenticator app like Google Authenticator or
                      Authy to scan the QR code and generate verification codes.
                    </p>
                    <div className="mt-3 bg-white p-3 rounded-md inline-block">
                      {/* Placeholder for QR code */}
                      <div className="w-32 h-32 bg-gray-200 flex items-center justify-center">
                        <span className="text-xs text-gray-500">QR Code</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Or enter this code manually:{" "}
                      <code className="bg-gray-100 px-1 py-0.5 rounded">
                        ABC123DEF456
                      </code>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="flex items-center text-destructive">
                  <Trash2 className="mr-2 h-5 w-5" />
                  Delete Account
                </CardTitle>
                <CardDescription>
                  Permanently delete your account and all associated data.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Once you delete your account, there is no going back. Please
                  be certain.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete your account and remove all your data from our
                        servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>
                Manage your active sessions across different devices.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="bg-muted p-2 rounded-full">
                        <Smartphone className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{session.device}</p>
                        <p className="text-sm text-muted-foreground">
                          {session.location} • {session.lastActive}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {session.current && (
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700 border-blue-200"
                        >
                          Current
                        </Badge>
                      )}
                      {!session.current && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTerminateSession(session.id)}
                        >
                          <LogOut className="h-4 w-4 mr-1" />
                          Terminate
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
