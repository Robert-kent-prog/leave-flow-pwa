import { useEffect, useState } from "react";
import {
  Bell,
  LayoutGrid,
  Monitor,
  Moon,
  Save,
  Sun,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/contexts/ThemeContext";

const SETTINGS_STORAGE_KEY = "leaveflow:user-preferences";

type PreferenceState = {
  emailSummaries: boolean;
  browserAlerts: boolean;
  weeklyDigest: boolean;
  compactTables: boolean;
};

const defaultPreferences: PreferenceState = {
  emailSummaries: true,
  browserAlerts: true,
  weeklyDigest: true,
  compactTables: false,
};

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const [preferences, setPreferences] =
    useState<PreferenceState>(defaultPreferences);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!stored) {
        return;
      }

      const parsed = JSON.parse(stored) as PreferenceState;
      setPreferences({ ...defaultPreferences, ...parsed });
    } catch (error) {
      console.error("Failed to load saved preferences:", error);
    }
  }, []);

  const updatePreference = (key: keyof PreferenceState) => {
    setPreferences((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const savePreferences = () => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(preferences));
    toast.success("Preferences saved for this browser.");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Workspace Appearance</CardTitle>
          <CardDescription>
            Theme settings are applied immediately and saved locally.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-2xl border p-4">
            <div className="space-y-1">
              <Label htmlFor="dark-mode">Theme</Label>
              <p className="text-sm text-muted-foreground">
                Switch between light and dark workspace modes.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-muted-foreground" />
              <Switch
                id="dark-mode"
                checked={theme === "dark"}
                onCheckedChange={toggleTheme}
              />
              <Moon className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>
              Local preferences that shape how this browser surfaces reminders.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl border p-4">
              <div className="space-y-1">
                <Label htmlFor="email-summaries">Email Summaries</Label>
                <p className="text-sm text-muted-foreground">
                  Store a preference for receiving periodic summary emails.
                </p>
              </div>
              <Switch
                id="email-summaries"
                checked={preferences.emailSummaries}
                onCheckedChange={() => updatePreference("emailSummaries")}
              />
            </div>
            <div className="flex items-center justify-between rounded-2xl border p-4">
              <div className="space-y-1">
                <Label htmlFor="browser-alerts">Browser Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Keep reminders visible in this browser session.
                </p>
              </div>
              <Switch
                id="browser-alerts"
                checked={preferences.browserAlerts}
                onCheckedChange={() => updatePreference("browserAlerts")}
              />
            </div>
            <div className="flex items-center justify-between rounded-2xl border p-4">
              <div className="space-y-1">
                <Label htmlFor="weekly-digest">Weekly Digest</Label>
                <p className="text-sm text-muted-foreground">
                  Store a preference for weekly leave overview emails.
                </p>
              </div>
              <Switch
                id="weekly-digest"
                checked={preferences.weeklyDigest}
                onCheckedChange={() => updatePreference("weeklyDigest")}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Display Preferences</CardTitle>
            <CardDescription>
              Interface choices that affect this device only.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl border p-4">
              <div className="space-y-1">
                <Label htmlFor="compact-tables">Compact Tables</Label>
                <p className="text-sm text-muted-foreground">
                  Prefer denser tables for employee and report screens.
                </p>
              </div>
              <Switch
                id="compact-tables"
                checked={preferences.compactTables}
                onCheckedChange={() => updatePreference("compactTables")}
              />
            </div>

            <div className="rounded-2xl border p-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <Monitor className="h-4 w-4" />
                Local Preference Scope
              </div>
              <p className="mt-2">
                These settings are stored in local browser storage because the
                backend does not yet expose a dedicated preferences API.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={savePreferences}>
          <Save className="mr-2 h-4 w-4" />
          Save Preferences
        </Button>
      </div>
    </div>
  );
}
