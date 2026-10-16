"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  LogOut,
  Users,
  CalendarDays,
  ImageUp,
  Settings,
  Plus,
  Pencil,
  Trash2,
  Search,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  ShieldCheck,
  Loader2,
  Eye,
  EyeOff,
  ArrowLeft,
  Phone,
  X,
  Download,
  FileText,
  Video,
  CalendarClock,
  Braces,
  PlusCircle,
  MinusCircle,
  Save,
  PencilLine,
  HelpCircle,
  FileEdit,
  BadgePercent,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { LiveCountWidget } from "@/components/admin/live-count-widget";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type AdminInfo = {
  id: string;
  username: string;
  whatsappNumber: string;
};

type Member = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  city: string | null;
  membershipPlan: string;
  amount: number;
  paymentStatus: string;
  notes: string | null;
  joinedAt: string;
  updatedAt: string;
};

type AdminEventItem = {
  id: string;
  title: string;
  type: string;
  location: string;
  time: string;
  desc: string;
  image: string | null;
  status: string;
  meetLink?: string | null;
  meetingDate?: string | null;
  recordingUrl?: string | null;
  recordingTitle?: string | null;
  createdAt: string;
  updatedAt: string;
};

type HashState = "loading" | "auth" | "dashboard";

// -----------------------------------------------------------------------------
// Root component
// -----------------------------------------------------------------------------

export function AdminPanel() {
  const [active, setActive] = useState(false);
  const [state, setState] = useState<HashState>("loading");
  const [admin, setAdmin] = useState<AdminInfo | null>(null);

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/me", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setAdmin(data.admin);
        setState("dashboard");
      } else {
        setAdmin(null);
        setState("auth");
      }
    } catch {
      setAdmin(null);
      setState("auth");
    }
  }, []);

  // Activate the overlay whenever hash === "#admin".
  useEffect(() => {
    const onHash = () => {
      const hash = window.location.hash.toLowerCase();
      const isAdmin = hash === "#admin" || hash.startsWith("#admin");
      setActive(isAdmin);
      if (isAdmin) {
        // Lock body scroll while the admin overlay is open.
        document.documentElement.style.overflow = "hidden";
        void checkSession();
      } else {
        document.documentElement.style.overflow = "";
      }
    };
    onHash();
    window.addEventListener("hashchange", onHash);
    return () => {
      window.removeEventListener("hashchange", onHash);
      document.documentElement.style.overflow = "";
    };
  }, [checkSession]);

  if (!active) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="admin-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="fixed inset-0 z-[200] bg-white text-foreground"
      >
        {/* Brand bar accent */}
        <div className="h-1.5 w-full bg-brand-red" />

        <div className="h-[calc(100vh-1.5rem)] overflow-y-auto scroll-brand">
          {state === "loading" && (
            <div className="grid h-full place-items-center">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <Loader2 className="h-7 w-7 animate-spin text-brand-red" />
                <p className="font-serif-display text-lg">Loading admin panel…</p>
              </div>
            </div>
          )}

          {state === "auth" && (
            <AuthScreen
              onLoggedIn={(a) => {
                setAdmin(a);
                setState("dashboard");
              }}
            />
          )}

          {state === "dashboard" && admin && (
            <Dashboard
              admin={admin}
              onLogout={async () => {
                await fetch("/api/admin/logout", { method: "POST" });
                setAdmin(null);
                setState("auth");
                toast.success("Logged out.");
              }}
            />
          )}
        </div>

        {/* Close button (top-right) — closes the overlay but stays on the page. */}
        <button
          type="button"
          aria-label="Close admin panel"
          onClick={() => {
            // Strip the hash without leaving a # in the URL.
            history.replaceState(
              null,
              "",
              window.location.pathname + window.location.search
            );
            setActive(false);
            document.documentElement.style.overflow = "";
          }}
          className="fixed right-4 top-4 z-[210] grid h-10 w-10 place-items-center rounded-full bg-brand-black/90 text-white shadow-lg hover:bg-brand-black"
        >
          <X className="h-5 w-5" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}

// -----------------------------------------------------------------------------
// Auth screen (Login / Register / Forgot)
// -----------------------------------------------------------------------------

function AuthScreen({
  onLoggedIn,
}: {
  onLoggedIn: (a: AdminInfo) => void;
}) {
  const [tab, setTab] = useState<"login" | "register" | "forgot">("login");
  const [adminExists, setAdminExists] = useState<boolean | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/admin/exists", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        const exists = Boolean(d.exists);
        setAdminExists(exists);
        // Auto-jump to the register tab on the very first load when no admin exists.
        // This setState is inside an async callback (NOT synchronous in the effect
        // body), so it doesn't trigger the set-state-in-effect rule.
        if (!exists) setTab("register");
      })
      .catch(() => alive && setAdminExists(false));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="min-h-[calc(100vh-1.5rem)] grid place-items-center px-4 py-10 bg-gradient-to-b from-white via-white to-muted/40">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-brand-red text-white shadow-brand">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="font-serif-display text-3xl font-bold tracking-tight">
            Big My Business <span className="text-brand-red">Admin</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage members, events, uploads and account settings.
          </p>
        </div>

        <Card className="border-border/70 shadow-brand-sm">
          <CardHeader className="pb-2">
            <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register" disabled={adminExists === true}>
                  Register
                </TabsTrigger>
                <TabsTrigger value="forgot">Forgot</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="pt-5">
                <LoginForm onLoggedIn={onLoggedIn} />
              </TabsContent>

              <TabsContent value="register" className="pt-5">
                <RegisterForm
                  adminExists={adminExists}
                  onLoggedIn={onLoggedIn}
                />
              </TabsContent>

              <TabsContent value="forgot" className="pt-5">
                <ForgotForm onDone={() => setTab("login")} />
              </TabsContent>
            </Tabs>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-center text-xs text-muted-foreground">
              Access via{" "}
              <code className="rounded bg-muted px-1.5 py-0.5">
                yoursite.com/#admin
              </code>
            </p>
          </CardContent>
        </Card>

        <div className="mt-4 text-center">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              history.replaceState(
                null,
                "",
                window.location.pathname + window.location.search
              );
              window.dispatchEvent(new HashChangeEvent("hashchange"));
            }}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-red hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Back to website
          </a>
        </div>
      </div>
    </div>
  );
}

function PasswordInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input type={show ? "text" : "password"} {...props} />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-2 top-1/2 -translate-y-1/2 grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-muted"
        aria-label={show ? "Hide password" : "Show password"}
        tabIndex={-1}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

function LoginForm({
  onLoggedIn,
}: {
  onLoggedIn: (a: AdminInfo) => void;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Please enter your username and password.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        toast.error(data.error || "Could not log in.");
        return;
      }
      toast.success("Logged in.");
      onLoggedIn(data.admin);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="login-username">Username</Label>
        <Input
          id="login-username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          placeholder="admin1"
          disabled={busy}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="login-password">Password</Label>
        <PasswordInput
          id="login-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          placeholder="••••••••"
          disabled={busy}
        />
      </div>
      <Button
        type="submit"
        className="w-full bg-brand-red hover:bg-brand-red/90"
        disabled={busy}
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Log in
      </Button>
    </form>
  );
}

function RegisterForm({
  adminExists,
  onLoggedIn,
}: {
  adminExists: boolean | null;
  onLoggedIn: (a: AdminInfo) => void;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [busy, setBusy] = useState(false);

  // If an admin already exists, registration is locked to logged-in admins.
  if (adminExists === true) {
    return (
      <div className="space-y-3 text-center">
        <p className="text-sm text-muted-foreground">
          An admin account already exists on this site. Registration is locked.
        </p>
        <p className="text-xs text-muted-foreground">
          Log in as an existing admin first if you need to add a second admin.
        </p>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!username || !password || !whatsapp) {
      toast.error("All fields are required.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          whatsappNumber: whatsapp.replace(/[^\d]/g, ""),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        toast.error(data.error || "Could not register.");
        return;
      }
      toast.success("Admin account created. You are now logged in.");
      onLoggedIn(data.admin);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="rounded-lg border border-brand-red/30 bg-brand-red/5 p-3 text-xs text-foreground/80">
        <strong className="text-brand-red">First admin setup.</strong> No default
        credentials exist on this site. You are creating the primary admin
        account.
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="reg-username">Username</Label>
        <Input
          id="reg-username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          placeholder="admin1"
          disabled={busy}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="reg-password">Password</Label>
        <PasswordInput
          id="reg-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          placeholder="Min. 6 characters"
          disabled={busy}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="reg-whatsapp">WhatsApp number</Label>
        <Input
          id="reg-whatsapp"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          inputMode="numeric"
          placeholder="9424242043"
          disabled={busy}
        />
        <p className="text-xs text-muted-foreground">
          Used for self-messaging password resets (wa.me).
        </p>
      </div>
      <Button
        type="submit"
        className="w-full bg-brand-red hover:bg-brand-red/90"
        disabled={busy}
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Create admin account
      </Button>
    </form>
  );
}

function ForgotForm({ onDone }: { onDone: () => void }) {
  const [username, setUsername] = useState("");
  const [waLink, setWaLink] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState<"request" | "reset">("request");

  async function requestCode(e: React.FormEvent) {
    e.preventDefault();
    if (!username) {
      toast.error("Please enter your username.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        toast.error(data.error || "Could not generate reset code.");
        return;
      }
      if (data.waLink) {
        setWaLink(data.waLink);
        setStage("reset");
        toast.success("Reset code generated. Tap the WhatsApp button below.");
      } else {
        toast.info(data.message || "If that username exists, a reset has been prepared.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function submitReset(e: React.FormEvent) {
    e.preventDefault();
    if (!username || !code || !newPassword) {
      toast.error("All fields are required.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, code, newPassword }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        toast.error(data.error || "Could not reset password.");
        return;
      }
      toast.success("Password reset. You can log in now.");
      onDone();
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (stage === "reset" && waLink) {
    return (
      <div className="space-y-4">
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full rounded-lg bg-[#25D366] px-4 py-3 text-white font-semibold shadow hover:bg-[#1ebe57] transition"
        >
          <MessageCircle className="h-5 w-5" />
          Open WhatsApp to receive your reset code
        </a>
        <p className="text-xs text-muted-foreground">
          A WhatsApp chat with your own number opens pre-filled with the code.
          Tap send, then read the code below. (We can&apos;t programmatically
          send WhatsApp messages without the Business API, so this self-message
          is the channel.)
        </p>
        <Separator />
        <form onSubmit={submitReset} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="reset-code">6-digit code</Label>
            <Input
              id="reset-code"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/[^\d]/g, "").slice(0, 6))
              }
              inputMode="numeric"
              placeholder="123456"
              className="tracking-[0.4em] text-center text-lg"
              disabled={busy}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reset-password">New password</Label>
            <PasswordInput
              id="reset-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="Min. 6 characters"
              disabled={busy}
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-brand-red hover:bg-brand-red/90"
            disabled={busy}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Reset password
          </Button>
        </form>
      </div>
    );
  }

  return (
    <form onSubmit={requestCode} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Enter your username. We&apos;ll generate a 6-digit code and open
        WhatsApp so you can self-message it to your own number.
      </p>
      <div className="space-y-1.5">
        <Label htmlFor="forgot-username">Username</Label>
        <Input
          id="forgot-username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          placeholder="admin1"
          disabled={busy}
        />
      </div>
      <Button
        type="submit"
        className="w-full bg-brand-red hover:bg-brand-red/90"
        disabled={busy}
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Generate reset code
      </Button>
    </form>
  );
}

// -----------------------------------------------------------------------------
// Dashboard
// -----------------------------------------------------------------------------

function Dashboard({
  admin,
  onLogout,
}: {
  admin: AdminInfo;
  onLogout: () => void;
}) {
  const [tab, setTab] = useState<
    "members" | "events" | "upload" | "content" | "settings"
  >("members");

  return (
    <div className="min-h-[calc(100vh-1.5rem)] flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-10 bg-brand-black text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand-red shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="font-serif-display text-base sm:text-lg leading-tight truncate">
                Big My Business <span className="text-brand-red">Admin</span>
              </p>
              <p className="text-[11px] text-white/60 truncate">
                Signed in as{" "}
                <strong className="text-white/90">{admin.username}</strong>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                history.replaceState(
                  null,
                  "",
                  window.location.pathname + window.location.search
                );
                window.dispatchEvent(new HashChangeEvent("hashchange"));
              }}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium text-white/80 hover:bg-white/10"
            >
              <ExternalLink className="h-4 w-4" /> View site
            </a>
            <Button
              onClick={onLogout}
              size="sm"
              variant="secondary"
              className="bg-white/10 text-white hover:bg-white/20"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Log out</span>
            </Button>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 pb-3 sm:px-6">
          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
            <TabsList className="bg-white/10 h-auto flex-wrap justify-start">
              <TabsTrigger
                value="members"
                className="data-[state=active]:bg-brand-red data-[state=active]:text-white text-white/80"
              >
                <Users className="h-4 w-4 sm:mr-1.5" />
                <span className="hidden sm:inline">Members</span>
              </TabsTrigger>
              <TabsTrigger
                value="events"
                className="data-[state=active]:bg-brand-red data-[state=active]:text-white text-white/80"
              >
                <CalendarDays className="h-4 w-4 sm:mr-1.5" />
                <span className="hidden sm:inline">Events</span>
              </TabsTrigger>
              <TabsTrigger
                value="upload"
                className="data-[state=active]:bg-brand-red data-[state=active]:text-white text-white/80"
              >
                <ImageUp className="h-4 w-4 sm:mr-1.5" />
                <span className="hidden sm:inline">Upload</span>
              </TabsTrigger>
              <TabsTrigger
                value="content"
                className="data-[state=active]:bg-brand-red data-[state=active]:text-white text-white/80"
              >
                <FileEdit className="h-4 w-4 sm:mr-1.5" />
                <span className="hidden sm:inline">Content</span>
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="data-[state=active]:bg-brand-red data-[state=active]:text-white text-white/80"
              >
                <Settings className="h-4 w-4 sm:mr-1.5" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
        {/* Live visitor count widget — real-time, top of dashboard */}
        <div className="mb-6">
          <LiveCountWidget />
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsContent value="members" className="mt-0 focus-visible:outline-none">
            <MembersTab />
          </TabsContent>
          <TabsContent value="events" className="mt-0 focus-visible:outline-none">
            <EventsTab />
          </TabsContent>
          <TabsContent value="upload" className="mt-0 focus-visible:outline-none">
            <UploadTab />
          </TabsContent>
          <TabsContent value="content" className="mt-0 focus-visible:outline-none">
            <ContentTab />
          </TabsContent>
          <TabsContent value="settings" className="mt-0 focus-visible:outline-none">
            <SettingsTab admin={admin} />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="mt-auto border-t border-border py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center text-xs text-muted-foreground">
          Big My Business · Admin Panel · Access via{" "}
          <code className="rounded bg-muted px-1.5 py-0.5">#admin</code>
        </div>
      </footer>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Members tab
// ----------------------------------------------------------------------------

const PLAN_OPTIONS = ["Prime", "Privilege", "Franchise", "Lead"] as const;
const STATUS_OPTIONS = ["Paid", "Pending"] as const;
const CHAPTER_OPTIONS = [
  "Bhilai",
  "Raipur",
  "Durg",
  "Bilaspur",
  "Korba",
  "Other",
] as const;

/** Try to extract the chapter from a member's city / notes. */
function memberChapter(m: Member): string {
  const city = (m.city || "").trim();
  const notes = (m.notes || "").trim();
  // 1. Explicit "Chapter: X" tag in notes
  const m1 = notes.match(/Chapter:\s*([A-Za-z][A-Za-z\- ]+)/);
  if (m1) {
    const v = m1[1].trim().split(/\s+/)[0];
    const cap = v.charAt(0).toUpperCase() + v.slice(1).toLowerCase();
    return cap;
  }
  // 2. City field exact-ish match
  if (city) {
    const c = city.toLowerCase();
    for (const opt of CHAPTER_OPTIONS) {
      if (c === opt.toLowerCase() || c.includes(opt.toLowerCase())) return opt;
    }
  }
  return "";
}

function MembersTab() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [chapterFilter, setChapterFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [exporting, setExporting] = useState(false);

  const exportExcel = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (planFilter !== "all") params.set("plan", planFilter);
      if (chapterFilter !== "all") params.set("chapter", chapterFilter);
      const qs = params.toString();
      const url = `/api/admin/members/export${qs ? "?" + qs : ""}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Export failed");
      }
      const blob = await res.blob();
      const urlObj = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = urlObj;
      const d = new Date();
      const stamp = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(d.getDate()).padStart(2, "0")}`;
      const tag = [
        planFilter !== "all" ? planFilter.toLowerCase() : null,
        chapterFilter !== "all" ? chapterFilter.toLowerCase() : null,
      ]
        .filter(Boolean)
        .join("-");
      a.download = `bmb-members-${tag || "all"}-${stamp}.xlsx`;
      // Override with the filename the server suggested (reflects server tag too).
      const cd = res.headers.get("Content-Disposition") || "";
      const m = cd.match(/filename="?([^";]+)"?/);
      if (m) a.download = m[1];
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(urlObj);
      toast.success("Excel downloaded.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed.");
    } finally {
      setExporting(false);
    }
  };

  const downloadInvoice = async (m: Member) => {
    try {
      const res = await fetch(`/api/admin/members/${m.id}/invoice`, {
        cache: "no-store",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Could not generate invoice");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `BMB-invoice-${m.name.replace(/\s+/g, "-")}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Invoice downloaded.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Invoice failed.");
    }
  };

  const sendInvoiceWhatsApp = async (m: Member) => {
    try {
      const res = await fetch(
        `/api/admin/members/${m.id}/invoice?link=1`,
        { cache: "no-store" }
      );
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Could not build invoice link");
      }
      window.open(data.waLink, "_blank", "noopener,noreferrer");
      toast.success("WhatsApp opened with invoice link.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not send invoice.");
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/members", { cache: "no-store" });
      const data = await res.json();
      if (data.ok) {
        setMembers(data.members);
      } else {
        toast.error(data.error || "Could not load members.");
      }
    } catch {
      toast.error("Network error.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = members.filter((m) => {
    const q = query.trim().toLowerCase();
    if (q) {
      const matches =
        m.name.toLowerCase().includes(q) ||
        m.phone.toLowerCase().includes(q) ||
        (m.email || "").toLowerCase().includes(q) ||
        (m.city || "").toLowerCase().includes(q);
      if (!matches) return false;
    }
    if (planFilter !== "all" && m.membershipPlan !== planFilter) return false;
    if (statusFilter !== "all" && m.paymentStatus !== statusFilter)
      return false;
    if (chapterFilter !== "all") {
      const ch = memberChapter(m);
      if (chapterFilter === "Other") {
        // "Other" = members whose chapter doesn't match the named chapters
        const named = CHAPTER_OPTIONS.filter((c) => c !== "Other");
        if (named.some((c) => ch === c)) return false;
      } else if (ch !== chapterFilter) {
        return false;
      }
    }
    return true;
  });

  const totalCollected = members
    .filter((m) => m.paymentStatus === "Paid")
    .reduce((s, m) => s + (m.amount || 0), 0);

  async function remove(m: Member) {
    if (!confirm(`Delete member "${m.name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/members/${m.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        toast.error(data.error || "Could not delete member.");
        return;
      }
      toast.success("Member deleted.");
      setMembers((prev) => prev.filter((x) => x.id !== m.id));
    } catch {
      toast.error("Network error.");
    }
  }

  return (
    <div className="space-y-5">
      {/* Stat cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Total Members"
          value={String(members.length)}
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          label="Amount Collected"
          value={`₹${totalCollected.toLocaleString("en-IN")}`}
          icon={<Check className="h-4 w-4" />}
          accent="green"
        />
        <StatCard
          label="Pending Payments"
          value={String(
            members.filter((m) => m.paymentStatus === "Pending").length
          )}
          icon={<Loader2 className="h-4 w-4" />}
        />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:flex-wrap">
          <div className="relative flex-1 max-w-md min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, phone, email, city…"
              className="pl-8"
            />
          </div>
          <Select value={planFilter} onValueChange={setPlanFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Plan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All plans</SelectItem>
              {PLAN_OPTIONS.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={chapterFilter} onValueChange={setChapterFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Chapter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All chapters</SelectItem>
              {CHAPTER_OPTIONS.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={exportExcel}
            disabled={exporting || members.length === 0}
            className="border-black/15 hover:border-brand-red hover:text-brand-red bg-white"
            title="Export the FILTERED set to Excel"
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Excel</span>
          </Button>
          <Button
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
            className="bg-brand-red hover:bg-brand-red/90"
          >
            <Plus className="h-4 w-4" /> Add member
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto scroll-brand">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[160px]">Name</TableHead>
                  <TableHead className="min-w-[140px]">Phone</TableHead>
                  <TableHead className="min-w-[120px]">City</TableHead>
                  <TableHead className="min-w-[110px]">Chapter</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="min-w-[140px]">Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center text-muted-foreground py-10"
                    >
                      <Loader2 className="h-5 w-5 animate-spin inline-block" />{" "}
                      Loading members…
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center text-muted-foreground py-10"
                    >
                      No members found. Click &ldquo;Add member&rdquo; to create
                      one.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((m) => {
                    const ch = memberChapter(m);
                    return (
                      <TableRow key={m.id}>
                        <TableCell className="font-medium">
                          {m.name}
                          {m.email ? (
                            <div className="text-[11px] text-muted-foreground">
                              {m.email}
                            </div>
                          ) : null}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {m.phone}
                        </TableCell>
                        <TableCell>{m.city || "—"}</TableCell>
                        <TableCell>
                          {ch ? (
                            <Badge variant="outline" className="border-brand-black/30 text-brand-black">
                              {ch}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              m.membershipPlan === "Prime"
                                ? "border-brand-red text-brand-red"
                                : m.membershipPlan === "Privilege"
                                ? "border-brand-black text-brand-black"
                                : "border-muted-foreground text-muted-foreground"
                            }
                          >
                            {m.membershipPlan}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          ₹{Number(m.amount || 0).toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              m.paymentStatus === "Paid"
                                ? "bg-emerald-600 hover:bg-emerald-600"
                                : "bg-amber-500 hover:bg-amber-500"
                            }
                          >
                            {m.paymentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(m.joinedAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => void downloadInvoice(m)}
                            aria-label="Download invoice"
                            title="Download invoice PDF"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-[#25D366] hover:text-[#25D366]"
                            onClick={() => void sendInvoiceWhatsApp(m)}
                            aria-label="Send invoice on WhatsApp"
                            title="Send invoice on WhatsApp"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => {
                              setEditing(m);
                              setDialogOpen(true);
                            }}
                            aria-label="Edit member"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-brand-red"
                            onClick={() => void remove(m)}
                            aria-label="Delete member"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <MemberDialog
        open={dialogOpen}
        onOpenChange={(o) => {
          setDialogOpen(o);
          if (!o) setEditing(null);
        }}
        editing={editing}
        onSaved={(m) => {
          setMembers((prev) => {
            const idx = prev.findIndex((x) => x.id === m.id);
            if (idx >= 0) {
              const next = [...prev];
              next[idx] = m;
              return next;
            }
            return [m, ...prev];
          });
          setDialogOpen(false);
          setEditing(null);
        }}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent?: "red" | "green" | "black";
}) {
  const color =
    accent === "green"
      ? "from-emerald-600 to-emerald-700"
      : accent === "black"
      ? "from-brand-black to-brand-black/80"
      : "from-brand-red to-brand-red/80";
  return (
    <Card className="overflow-hidden border-border/70">
      <CardContent className="p-4 flex items-center gap-4">
        <div
          className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${color} text-white shrink-0`}
        >
          {icon}
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="font-serif-display text-xl font-bold leading-tight">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function MemberDialog({
  open,
  onOpenChange,
  editing,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing: Member | null;
  onSaved: (m: Member) => void;
}) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    membershipPlan: "Prime",
    amount: "9999",
    paymentStatus: "Paid",
    notes: "",
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setForm({
        name: editing.name,
        phone: editing.phone,
        email: editing.email || "",
        city: editing.city || "",
        membershipPlan: editing.membershipPlan,
        amount: String(editing.amount),
        paymentStatus: editing.paymentStatus,
        notes: editing.notes || "",
      });
    } else {
      setForm({
        name: "",
        phone: "",
        email: "",
        city: "",
        membershipPlan: "Prime",
        amount: "9999",
        paymentStatus: "Paid",
        notes: "",
      });
    }
  }, [open, editing]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error("Name and phone are required.");
      return;
    }
    setBusy(true);
    try {
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        city: form.city.trim() || null,
        membershipPlan: form.membershipPlan,
        amount: Number(form.amount || 0),
        paymentStatus: form.paymentStatus,
        notes: form.notes.trim() || null,
      };
      const url = editing
        ? `/api/admin/members/${editing.id}`
        : "/api/admin/members";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        toast.error(data.error || "Could not save member.");
        return;
      }
      toast.success(editing ? "Member updated." : "Member added.");
      onSaved(data.member);
    } catch {
      toast.error("Network error.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto scroll-brand">
        <DialogHeader>
          <DialogTitle className="font-serif-display">
            {editing ? "Edit member" : "Add new member"}
          </DialogTitle>
          <DialogDescription>
            {editing
              ? "Update the member details below."
              : "Create a new member record."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="m-name">Name *</Label>
              <Input
                id="m-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                disabled={busy}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="m-phone">Phone *</Label>
              <Input
                id="m-phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                disabled={busy}
                inputMode="tel"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="m-email">Email</Label>
              <Input
                id="m-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                disabled={busy}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="m-city">City</Label>
              <Input
                id="m-city"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                disabled={busy}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="m-plan">Membership plan</Label>
              <Select
                value={form.membershipPlan}
                onValueChange={(v) =>
                  setForm({ ...form, membershipPlan: v })
                }
              >
                <SelectTrigger id="m-plan">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLAN_OPTIONS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="m-amount">Amount (₹)</Label>
              <Input
                id="m-amount"
                type="number"
                min={0}
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                disabled={busy}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="m-status">Payment status</Label>
              <Select
                value={form.paymentStatus}
                onValueChange={(v) =>
                  setForm({ ...form, paymentStatus: v })
                }
              >
                <SelectTrigger id="m-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="m-notes">Notes</Label>
              <Textarea
                id="m-notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                disabled={busy}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-brand-red hover:bg-brand-red/90"
              disabled={busy}
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {editing ? "Save changes" : "Add member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// -----------------------------------------------------------------------------
// Events tab
// ----------------------------------------------------------------------------

const EVENT_TYPES = ["Physical", "Online"] as const;
const EVENT_STATUSES = ["Upcoming", "Completed"] as const;

function EventsTab() {
  const [events, setEvents] = useState<AdminEventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminEventItem | null>(null);
  const [shareOpen, setShareOpen] = useState<AdminEventItem | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/events", { cache: "no-store" });
      const data = await res.json();
      if (data.ok) {
        setEvents(data.events);
      } else {
        toast.error(data.error || "Could not load events.");
      }
    } catch {
      toast.error("Network error.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function remove(ev: AdminEventItem) {
    if (!confirm(`Delete event "${ev.title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/events/${ev.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        toast.error(data.error || "Could not delete event.");
        return;
      }
      toast.success("Event deleted.");
      setEvents((prev) => prev.filter((x) => x.id !== ev.id));
    } catch {
      toast.error("Network error.");
    }
  }

  async function copyMeetLink(ev: AdminEventItem) {
    const link = ev.meetLink;
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Meet link copied to clipboard.");
    } catch {
      toast.error("Couldn't copy — select and copy manually.");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-serif-display text-2xl font-bold">Events</h2>
          <p className="text-sm text-muted-foreground">
            Manage chapter meets, summits, webinars &amp; awards nights.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
          className="bg-brand-red hover:bg-brand-red/90"
        >
          <Plus className="h-4 w-4" /> Add event
        </Button>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin inline-block" /> Loading
            events…
          </CardContent>
        </Card>
      ) : events.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No events yet. Click &ldquo;Add event&rdquo; to create one.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((ev) => {
            const hasMeet = !!ev.meetLink;
            const hasRec = !!ev.recordingUrl;
            return (
              <Card
                key={ev.id}
                className="overflow-hidden border-border/70 flex flex-col"
              >
                <div className="aspect-video bg-muted relative">
                  {ev.image ? (
                    <img
                      src={ev.image}
                      alt={ev.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full grid place-items-center text-muted-foreground">
                      <CalendarDays className="h-8 w-8" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
                    <Badge
                      className={
                        ev.type === "Physical"
                          ? "bg-brand-red hover:bg-brand-red"
                          : "bg-brand-black hover:bg-brand-black"
                      }
                    >
                      {ev.type}
                    </Badge>
                    <Badge
                      className={
                        ev.status === "Upcoming"
                          ? "bg-emerald-600 hover:bg-emerald-600"
                          : "bg-muted-foreground"
                      }
                    >
                      {ev.status}
                    </Badge>
                    {hasMeet ? (
                      <Badge
                        variant="outline"
                        className="border-brand-red/40 text-brand-red bg-white/95 backdrop-blur gap-1"
                        title={ev.meetLink || ""}
                      >
                        <Video className="h-3 w-3" /> Meet link
                      </Badge>
                    ) : null}
                    {hasRec ? (
                      <Badge
                        variant="outline"
                        className="border-brand-black/40 text-brand-black bg-white/95 backdrop-blur gap-1"
                        title={ev.recordingTitle || ev.recordingUrl || ""}
                      >
                        <FileText className="h-3 w-3" /> Recording
                      </Badge>
                    ) : null}
                  </div>
                </div>
                <CardContent className="p-4 flex-1 flex flex-col">
                  <h3 className="font-serif-display text-lg font-bold leading-tight">
                    {ev.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {ev.time}
                  </p>
                  <p className="text-xs text-muted-foreground">{ev.location}</p>
                  {ev.meetingDate ? (
                    <p className="text-xs text-brand-red/80 mt-1 inline-flex items-center gap-1">
                      <CalendarClock className="h-3 w-3" /> {ev.meetingDate}
                    </p>
                  ) : null}
                  {ev.desc ? (
                    <p className="text-sm mt-2 line-clamp-2 text-foreground/80">
                      {ev.desc}
                    </p>
                  ) : null}

                  {/* Meet link / recording summary */}
                  {hasMeet ? (
                    <div className="mt-3 rounded-md border border-brand-red/15 bg-brand-red/[0.04] px-2.5 py-2 text-[11px]">
                      <p className="font-semibold text-brand-red inline-flex items-center gap-1">
                        <Video className="h-3 w-3" /> Meet link
                      </p>
                      <p className="truncate text-muted-foreground" title={ev.meetLink || ""}>
                        {ev.meetLink}
                      </p>
                    </div>
                  ) : null}
                  {hasRec ? (
                    <div className="mt-2 rounded-md border border-brand-black/15 bg-brand-black/[0.03] px-2.5 py-2 text-[11px]">
                      <p className="font-semibold text-brand-black inline-flex items-center gap-1">
                        <FileText className="h-3 w-3" />{" "}
                        {ev.recordingTitle || "Recording"}
                      </p>
                      <p className="truncate text-muted-foreground" title={ev.recordingUrl || ""}>
                        {ev.recordingUrl}
                      </p>
                    </div>
                  ) : null}

                  {/* Per-event actions */}
                  <div className="mt-auto pt-3 flex flex-wrap items-center gap-1.5">
                    {hasMeet ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 border-brand-red/30 text-brand-red hover:bg-brand-red/5"
                        onClick={() => void copyMeetLink(ev)}
                        title="Copy meet link"
                      >
                        <Copy className="h-3.5 w-3.5" /> Meet link
                      </Button>
                    ) : null}
                    {hasRec ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 border-[#25D366]/40 text-[#1ebe57] hover:bg-[#25D366]/5"
                          onClick={() => setShareOpen(ev)}
                          title="Share recording on WhatsApp"
                        >
                          <MessageCircle className="h-3.5 w-3.5" /> Share
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 border-brand-black/30 text-brand-black hover:bg-brand-black/5"
                          onClick={() => {
                            if (!ev.recordingUrl) return;
                            window.open(
                              ev.recordingUrl,
                              "_blank",
                              "noopener,noreferrer"
                            );
                          }}
                          title="Download recording (opens in new tab)"
                        >
                          <ExternalLink className="h-3.5 w-3.5" /> Recording
                        </Button>
                      </>
                    ) : null}
                    <div className="ml-auto flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8"
                        onClick={() => {
                          setEditing(ev);
                          setDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-brand-red"
                        onClick={() => void remove(ev)}
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <EventDialog
        open={dialogOpen}
        onOpenChange={(o) => {
          setDialogOpen(o);
          if (!o) setEditing(null);
        }}
        editing={editing}
        onSaved={(ev) => {
          setEvents((prev) => {
            const idx = prev.findIndex((x) => x.id === ev.id);
            if (idx >= 0) {
              const next = [...prev];
              next[idx] = ev;
              return next;
            }
            return [ev, ...prev];
          });
          setDialogOpen(false);
          setEditing(null);
        }}
      />

      {/* Share recording on WhatsApp dialog (rendered only when an event is selected) */}
      {shareOpen ? (
        <ShareRecordingDialog
          key={shareOpen.id}
          event={shareOpen}
          onOpenChange={(o) => !o && setShareOpen(null)}
        />
      ) : null}
    </div>
  );
}

/**
 * ShareRecordingDialog — pick a member (or enter a phone) and open wa.me
 * with the recording link pre-filled. Parent renders this ONLY when an
 * event is selected (with key=event.id), so we initialise state from props
 * directly without a set-state-in-effect.
 */
function ShareRecordingDialog({
  event,
  onOpenChange,
}: {
  event: AdminEventItem;
  onOpenChange: (o: boolean) => void;
}) {
  const [members, setMembers] = useState<Member[]>([]);
  // Start in "loading" state — we fetch members on mount.
  const [loadingM, setLoadingM] = useState(true);
  const [memberId, setMemberId] = useState<string>("custom");
  const [phone, setPhone] = useState("");

  const recUrl = event.recordingUrl || "";
  const recTitle = event.recordingTitle || event.title || "the recording";

  useEffect(() => {
    let alive = true;
    fetch("/api/admin/members", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        if (d.ok) setMembers(d.members);
      })
      .catch(() => {})
      .finally(() => alive && setLoadingM(false));
    return () => {
      alive = false;
    };
  }, []);

  const selectedMember = members.find((m) => m.id === memberId);
  const finalPhone =
    memberId !== "custom" && selectedMember
      ? selectedMember.phone.replace(/[^\d]/g, "")
      : phone.replace(/[^\d]/g, "");

  function openWhatsApp() {
    if (!recUrl || !finalPhone) {
      toast.error("Pick a member or enter a phone, and ensure the event has a recording URL.");
      return;
    }
    const text = `Recording for ${event.title}: ${recUrl}`;
    const link = `https://wa.me/91${finalPhone}?text=${encodeURIComponent(text)}`;
    window.open(link, "_blank", "noopener,noreferrer");
    toast.success("WhatsApp opened with the recording link.");
    onOpenChange(false);
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif-display">
            Share recording on WhatsApp
          </DialogTitle>
          <DialogDescription>
            Pick a member from your list (or enter a phone) — we&rsquo;ll open
            WhatsApp with the recording link pre-filled.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="rounded-md border border-brand-black/15 bg-brand-black/[0.02] px-3 py-2 text-xs">
            <p className="font-semibold text-brand-black inline-flex items-center gap-1">
              <FileText className="h-3 w-3" /> {recTitle}
            </p>
            <p className="text-muted-foreground truncate" title={recUrl}>
              {recUrl}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="share-member">Pick a member</Label>
            <Select value={memberId} onValueChange={(v) => setMemberId(v)}>
              <SelectTrigger id="share-member">
                <SelectValue placeholder="Select member" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">Custom phone number</SelectItem>
                {loadingM ? (
                  <SelectItem value="__loading" disabled>
                    Loading members…
                  </SelectItem>
                ) : members.length === 0 ? (
                  <SelectItem value="__none" disabled>
                    No members yet
                  </SelectItem>
                ) : (
                  members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name} · {m.phone}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {memberId === "custom" ? (
            <div className="space-y-1.5">
              <Label htmlFor="share-phone">Phone number</Label>
              <Input
                id="share-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                inputMode="numeric"
                placeholder="e.g. 9424242043"
              />
              <p className="text-xs text-muted-foreground">
                We&rsquo;ll prefix with <code>91</code> (India) automatically.
              </p>
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-[#25D366] hover:bg-[#1ebe57] text-white"
            onClick={openWhatsApp}
            disabled={!finalPhone || !recUrl}
          >
            <MessageCircle className="h-4 w-4" /> Open WhatsApp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EventDialog({
  open,
  onOpenChange,
  editing,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing: AdminEventItem | null;
  onSaved: (ev: AdminEventItem) => void;
}) {
  const [form, setForm] = useState({
    title: "",
    type: "Physical",
    location: "",
    time: "",
    desc: "",
    image: "",
    status: "Upcoming",
    meetLink: "",
    meetingDate: "",
    recordingUrl: "",
    recordingTitle: "",
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setForm({
        title: editing.title,
        type: editing.type,
        location: editing.location,
        time: editing.time,
        desc: editing.desc,
        image: editing.image || "",
        status: editing.status,
        meetLink: editing.meetLink || "",
        meetingDate: editing.meetingDate || "",
        recordingUrl: editing.recordingUrl || "",
        recordingTitle: editing.recordingTitle || "",
      });
    } else {
      setForm({
        title: "",
        type: "Physical",
        location: "",
        time: "",
        desc: "",
        image: "",
        status: "Upcoming",
        meetLink: "",
        meetingDate: "",
        recordingUrl: "",
        recordingTitle: "",
      });
    }
  }, [open, editing]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.location.trim() || !form.time.trim()) {
      toast.error("Title, location and time are required.");
      return;
    }
    setBusy(true);
    try {
      const payload = {
        title: form.title.trim(),
        type: form.type,
        location: form.location.trim(),
        time: form.time.trim(),
        desc: form.desc.trim(),
        image: form.image.trim() || null,
        status: form.status,
        meetLink: form.meetLink.trim() || null,
        meetingDate: form.meetingDate.trim() || null,
        recordingUrl: form.recordingUrl.trim() || null,
        recordingTitle: form.recordingTitle.trim() || null,
      };
      const url = editing
        ? `/api/admin/events/${editing.id}`
        : "/api/admin/events";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        toast.error(data.error || "Could not save event.");
        return;
      }
      toast.success(editing ? "Event updated." : "Event added.");
      onSaved(data.event);
    } catch {
      toast.error("Network error.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto scroll-brand">
        <DialogHeader>
          <DialogTitle className="font-serif-display">
            {editing ? "Edit event" : "Add new event"}
          </DialogTitle>
          <DialogDescription>
            {editing
              ? "Update the event details below."
              : "Create a new event record."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="e-title">Title *</Label>
            <Input
              id="e-title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              disabled={busy}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="e-type">Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm({ ...form, type: v })}
              >
                <SelectTrigger id="e-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="e-status">Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm({ ...form, status: v })}
              >
                <SelectTrigger id="e-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="e-location">Location *</Label>
            <Input
              id="e-location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              disabled={busy}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="e-time">Time *</Label>
            <Input
              id="e-time"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              disabled={busy}
              placeholder="e.g. Oct 12, 10:00 AM – 12:00 PM"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="e-image">Image URL</Label>
            <div className="flex gap-2">
              <Input
                id="e-image"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                disabled={busy}
                placeholder="/uploads/abc.jpg"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const url = prompt(
                    "Paste an image URL, or upload via the Upload tab and paste the returned URL:"
                  );
                  if (url) setForm({ ...form, image: url.trim() });
                }}
              >
                Paste
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Tip: open the Upload tab, drop an image, copy the URL, then paste
              it here.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="e-desc">Description</Label>
            <Textarea
              id="e-desc"
              value={form.desc}
              onChange={(e) => setForm({ ...form, desc: e.target.value })}
              disabled={busy}
              rows={3}
            />
          </div>

          {form.image ? (
            <div className="overflow-hidden rounded-lg border border-border">
              <img
                src={form.image}
                alt="preview"
                className="h-40 w-full object-cover"
              />
            </div>
          ) : null}

          <Separator />

          {/* Meeting / recording section */}
          <div className="rounded-xl border border-brand-red/15 bg-brand-red/[0.03] p-3 sm:p-4 space-y-3">
            <div className="flex items-center gap-2 text-brand-red">
              <Video className="h-4 w-4" />
              <p className="font-serif-display text-sm font-semibold uppercase tracking-wider">
                Meeting &amp; Recording
              </p>
            </div>
            <p className="text-xs text-muted-foreground -mt-1">
              Optional. Add a Google Meet / Zoom link, a human-readable meeting
              date, and a recording URL — they power the per-event actions
              (copy meet link, share recording on WhatsApp, download
              recording).
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="e-meetlink">Meet link (Google Meet / Zoom URL)</Label>
              <Input
                id="e-meetlink"
                value={form.meetLink}
                onChange={(e) => setForm({ ...form, meetLink: e.target.value })}
                disabled={busy}
                placeholder="https://meet.google.com/abc-defg-hij"
                type="url"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="e-meetingdate">Meeting date</Label>
              <Input
                id="e-meetingdate"
                value={form.meetingDate}
                onChange={(e) => setForm({ ...form, meetingDate: e.target.value })}
                disabled={busy}
                placeholder="e.g. 12 Oct 2025"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="e-recordingtitle">Recording title</Label>
              <Input
                id="e-recordingtitle"
                value={form.recordingTitle}
                onChange={(e) => setForm({ ...form, recordingTitle: e.target.value })}
                disabled={busy}
                placeholder="e.g. October Power Meet Recording"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="e-recordingurl">Recording URL</Label>
              <Input
                id="e-recordingurl"
                value={form.recordingUrl}
                onChange={(e) => setForm({ ...form, recordingUrl: e.target.value })}
                disabled={busy}
                placeholder="/uploads/recording.mp4 or external link"
                type="url"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-brand-red hover:bg-brand-red/90"
              disabled={busy}
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {editing ? "Save changes" : "Add event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// -----------------------------------------------------------------------------
// Upload tab
// ----------------------------------------------------------------------------

function UploadTab() {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  async function uploadFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image is larger than 5 MB.");
      return;
    }
    setBusy(true);
    setResult(null);
    setCopied(false);
    setPreview(URL.createObjectURL(file));
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        toast.error(data.error || "Upload failed.");
        return;
      }
      setResult(data.url);
      toast.success("Image uploaded.");
    } catch {
      toast.error("Network error.");
    } finally {
      setBusy(false);
    }
  }

  async function copyUrl() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      toast.success("URL copied.");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Couldn't copy — select and copy manually.");
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-serif-display text-2xl font-bold">Image Upload</h2>
        <p className="text-sm text-muted-foreground">
          Upload images and copy their URL — use them inside events, blog posts
          or anywhere on the site.
        </p>
      </div>

      <Card>
        <CardContent className="p-5">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              void uploadFile(e.dataTransfer.files?.[0]);
            }}
            className={`rounded-xl border-2 border-dashed p-8 text-center transition ${
              dragOver
                ? "border-brand-red bg-brand-red/5"
                : "border-border"
            }`}
          >
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-brand-red/10 text-brand-red">
              <ImageUp className="h-7 w-7" />
            </div>
            <p className="font-serif-display text-lg font-semibold">
              Drop an image here, or
            </p>
            <Button
              type="button"
              className="mt-3 bg-brand-red hover:bg-brand-red/90"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Browse files
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">
              PNG, JPG, WebP, GIF, AVIF · max 5 MB
            </p>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                void uploadFile(e.target.files?.[0] ?? undefined)
              }
            />
          </div>
        </CardContent>
      </Card>

      {result ? (
        <Card>
          <CardHeader>
            <CardTitle className="font-serif-display text-lg">
              Upload result
            </CardTitle>
            <CardDescription>
              Copy this URL and use it where you need it.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {preview ? (
              <img
                src={preview}
                alt="preview"
                className="h-44 w-full rounded-lg object-cover border border-border"
              />
            ) : null}
            <div className="flex items-center gap-2">
              <code className="flex-1 truncate rounded-md border border-border bg-muted px-3 py-2 text-sm">
                {result}
              </code>
              <Button onClick={copyUrl} variant="outline" size="sm">
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Content tab (CMS — admin edits site content)
// ----------------------------------------------------------------------------

type CmsItem = {
  id: string;
  key: string;
  value: unknown;
  updatedAt: string;
};

type PlanForm = {
  id: string;
  name: string;
  badge: string;
  price: string;
  priceNote: string;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
};

function ContentTab() {
  const [items, setItems] = useState<CmsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/site-content", {
        cache: "no-store",
      });
      const data = await res.json();
      if (data.ok) setItems(data.items);
      else toast.error(data.error || "Could not load content.");
    } catch {
      toast.error("Network error.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function save(key: string, value: unknown) {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/site-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        toast.error(data.error || "Could not save content.");
        return;
      }
      // Update local state
      setItems((prev) => {
        const idx = prev.findIndex((x) => x.key === key);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = data.item;
          return next;
        }
        return [data.item, ...prev];
      });
      toast.success(`Saved "${key}". Public site will read the new value.`);
    } catch {
      toast.error("Network error.");
    } finally {
      setBusy(false);
    }
  }

  // Pluck helpers
  const find = <T,>(key: string, fallback: T): T => {
    const item = items.find((x) => x.key === key);
    if (!item) return fallback;
    return (item.value as T) ?? fallback;
  };

  const membershipPlans = find<PlanForm[]>("membershipPlans", []);
  const faq = find<{ q: string; a: string }[]>("faq", []);
  const about = find<{ heading?: string; body?: string[] }>("about", {
    heading: "",
    body: [],
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin inline-block" /> Loading
          content…
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif-display text-2xl font-bold">Site Content</h2>
        <p className="text-sm text-muted-foreground">
          Admin is the source of truth for membership plans, FAQ and About
          text. The public site reads these on load (falling back to the
          static defaults if a key isn&apos;t in the DB).
        </p>
      </div>

      <MembershipPlansEditor
        key={`plans-${JSON.stringify(membershipPlans)}`}
        plans={membershipPlans}
        saving={busy}
        onSave={(p) => void save("membershipPlans", p)}
      />

      <FaqEditor
        key={`faq-${JSON.stringify(faq)}`}
        faqs={faq}
        saving={busy}
        onSave={(f) => void save("faq", f)}
      />

      <AboutEditor
        key={`about-${JSON.stringify(about)}`}
        about={about}
        saving={busy}
        onSave={(a) => void save("about", a)}
      />

      <div className="rounded-xl border border-border bg-muted/40 p-5">
        <h3 className="font-serif-display text-base font-semibold inline-flex items-center gap-2">
          <Braces className="h-4 w-4 text-brand-red" />
          Public Events
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          The public events section reads from the <code>AdminEvent</code>{" "}
          table directly via <code>/api/events</code>. To add or edit events
          for the public site, use the <strong>Events</strong> tab — any event
          with status <em>Upcoming</em> appears on the public homepage.
        </p>
      </div>

      {/* Raw JSON list of stored keys */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif-display text-lg">
            Stored content keys
          </CardTitle>
          <CardDescription>
            All SiteContent rows currently saved in the DB.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No content rows stored yet — the public site is using static
              defaults. Save any section above to create a row.
            </p>
          ) : (
            <ul className="space-y-2 text-sm">
              {items.map((it) => (
                <li
                  key={it.id}
                  className="rounded-md border border-border bg-white px-3 py-2"
                >
                  <div className="flex items-center justify-between">
                    <code className="font-mono text-brand-red">{it.key}</code>
                    <span className="text-xs text-muted-foreground">
                      updated{" "}
                      {new Date(it.updatedAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <pre className="mt-2 max-h-32 overflow-auto rounded bg-muted/60 p-2 text-[11px]">
                    {JSON.stringify(it.value, null, 2)}
                  </pre>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// --- Membership plans editor (structured) ---

function MembershipPlansEditor({
  plans,
  saving,
  onSave,
}: {
  plans: PlanForm[];
  saving: boolean;
  onSave: (plans: PlanForm[]) => void;
}) {
  // Local working copy. Parent uses a `key` derived from the server snapshot
  // so we remount (with fresh initial state) whenever the server value
  // changes — no set-state-in-effect needed here.
  const [draft, setDraft] = useState<PlanForm[]>(plans);

  function updatePlan(i: number, patch: Partial<PlanForm>) {
    setDraft((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], ...patch };
      return next;
    });
  }

  function updateFeature(planIdx: number, featIdx: number, val: string) {
    setDraft((prev) => {
      const next = [...prev];
      const feats = [...next[planIdx].features];
      feats[featIdx] = val;
      next[planIdx] = { ...next[planIdx], features: feats };
      return next;
    });
  }

  function addFeature(planIdx: number) {
    setDraft((prev) => {
      const next = [...prev];
      next[planIdx] = {
        ...next[planIdx],
        features: [...next[planIdx].features, ""],
      };
      return next;
    });
  }

  function removeFeature(planIdx: number, featIdx: number) {
    setDraft((prev) => {
      const next = [...prev];
      next[planIdx] = {
        ...next[planIdx],
        features: next[planIdx].features.filter((_, j) => j !== featIdx),
      };
      return next;
    });
  }

  const dirty = JSON.stringify(draft) !== JSON.stringify(plans);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif-display text-lg inline-flex items-center gap-2">
          <BadgePercent className="h-4 w-4 text-brand-red" />
          Membership plans
        </CardTitle>
        <CardDescription>
          Edit each plan&apos;s price, period and description. Saved as
          SiteContent key <code>membershipPlans</code> (JSON array). The public
          membership section reads this.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {draft.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No plans yet. (Static defaults are being used.)
          </p>
        ) : (
          draft.map((p, i) => (
            <div
              key={p.id || i}
              className="rounded-xl border border-border bg-white p-4 space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-serif-display text-base font-semibold">
                  Plan #{i + 1}
                </h4>
                <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={!!p.highlighted}
                    onChange={(e) =>
                      updatePlan(i, { highlighted: e.target.checked })
                    }
                  />
                  Highlighted
                </label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Plan ID</Label>
                  <Input
                    value={p.id}
                    onChange={(e) => updatePlan(i, { id: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Name</Label>
                  <Input
                    value={p.name}
                    onChange={(e) => updatePlan(i, { name: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Badge</Label>
                  <Input
                    value={p.badge}
                    onChange={(e) => updatePlan(i, { badge: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Price (display string)</Label>
                  <Input
                    value={p.price}
                    onChange={(e) => updatePlan(i, { price: e.target.value })}
                    placeholder="₹9,999"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Price note</Label>
                  <Input
                    value={p.priceNote}
                    onChange={(e) => updatePlan(i, { priceNote: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Period</Label>
                  <Input
                    value={p.period}
                    onChange={(e) => updatePlan(i, { period: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>CTA button label</Label>
                  <Input
                    value={p.cta}
                    onChange={(e) => updatePlan(i, { cta: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea
                  value={p.description}
                  onChange={(e) =>
                    updatePlan(i, { description: e.target.value })
                  }
                  rows={2}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Features (one per line)</Label>
                <div className="space-y-2">
                  {p.features.map((f, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <Input
                        value={f}
                        onChange={(e) => updateFeature(i, j, e.target.value)}
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-brand-red"
                        onClick={() => removeFeature(i, j)}
                        aria-label="Remove feature"
                      >
                        <MinusCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => addFeature(i)}
                  >
                    <PlusCircle className="h-4 w-4" /> Add feature
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
        <div className="flex items-center gap-3">
          <Button
            type="button"
            className="bg-brand-red hover:bg-brand-red/90"
            disabled={saving || !dirty}
            onClick={() => onSave(draft)}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save membership plans
          </Button>
          {dirty ? (
            <span className="text-xs text-amber-600">Unsaved changes</span>
          ) : (
            <span className="text-xs text-emerald-600">All changes saved</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// --- FAQ editor (structured) ---

function FaqEditor({
  faqs,
  saving,
  onSave,
}: {
  faqs: { q: string; a: string }[];
  saving: boolean;
  onSave: (faqs: { q: string; a: string }[]) => void;
}) {
  // Parent uses a `key` derived from the server snapshot so we remount
  // whenever the server value changes — no sync effect needed here.
  const [draft, setDraft] = useState(faqs);

  function update(i: number, patch: Partial<{ q: string; a: string }>) {
    setDraft((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], ...patch };
      return next;
    });
  }
  function add() {
    setDraft((prev) => [...prev, { q: "", a: "" }]);
  }
  function remove(i: number) {
    setDraft((prev) => prev.filter((_, j) => j !== i));
  }
  const dirty = JSON.stringify(draft) !== JSON.stringify(faqs);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif-display text-lg inline-flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-brand-red" />
          FAQ
        </CardTitle>
        <CardDescription>
          List of <code>{`{q, a}`}</code> pairs. Saved as SiteContent key{" "}
          <code>faq</code>. The public FAQ section reads this.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {draft.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No questions yet. (Static defaults are being used.)
          </p>
        ) : (
          draft.map((f, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-white p-3 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">
                  Q {i + 1}
                </span>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-brand-red"
                  onClick={() => remove(i)}
                  aria-label="Remove question"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Input
                value={f.q}
                onChange={(e) => update(i, { q: e.target.value })}
                placeholder="Question"
              />
              <Textarea
                value={f.a}
                onChange={(e) => update(i, { a: e.target.value })}
                placeholder="Answer"
                rows={2}
              />
            </div>
          ))
        )}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={add}
            disabled={saving}
          >
            <PlusCircle className="h-4 w-4" /> Add question
          </Button>
          <Button
            type="button"
            className="bg-brand-red hover:bg-brand-red/90"
            disabled={saving || !dirty}
            onClick={() => onSave(draft)}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save FAQ
          </Button>
          {dirty ? (
            <span className="text-xs text-amber-600">Unsaved changes</span>
          ) : (
            <span className="text-xs text-emerald-600">All changes saved</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// --- About editor (textareas) ---

function AboutEditor({
  about,
  saving,
  onSave,
}: {
  about: { heading?: string; body?: string[] };
  saving: boolean;
  onSave: (a: { heading?: string; body?: string[] }) => void;
}) {
  // Parent uses a `key` derived from the server snapshot so we remount
  // whenever the server value changes — no sync effect needed here.
  const [heading, setHeading] = useState(about.heading || "");
  const [bodyText, setBodyText] = useState((about.body || []).join("\n\n"));

  const dirty =
    heading !== (about.heading || "") ||
    bodyText !== (about.body || []).join("\n\n");

  function save() {
    const body = bodyText
      .split(/\n{2,}/)
      .map((s) => s.trim())
      .filter(Boolean);
    onSave({ heading: heading.trim() || "", body });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif-display text-lg inline-flex items-center gap-2">
          <PencilLine className="h-4 w-4 text-brand-red" />
          About / Journey text
        </CardTitle>
        <CardDescription>
          Optional override for the Journey section heading and body
          paragraphs. Leave the heading blank to keep the static hard-coded
          copy. Saved as SiteContent key <code>about</code>.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="about-heading">Heading (optional)</Label>
          <Input
            id="about-heading"
            value={heading}
            onChange={(e) => setHeading(e.target.value)}
            placeholder="e.g. Built on trust, driven by results."
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="about-body">Body paragraphs</Label>
          <Textarea
            id="about-body"
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            rows={8}
            placeholder="Paragraph 1…

Paragraph 2…

Paragraph 3…"
          />
          <p className="text-xs text-muted-foreground">
            Separate each paragraph with a blank line.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            className="bg-brand-red hover:bg-brand-red/90"
            disabled={saving || !dirty}
            onClick={save}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save About text
          </Button>
          {dirty ? (
            <span className="text-xs text-amber-600">Unsaved changes</span>
          ) : (
            <span className="text-xs text-emerald-600">All changes saved</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// -----------------------------------------------------------------------------
// Settings tab
// ----------------------------------------------------------------------------

function SettingsTab({ admin }: { admin: AdminInfo }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!current || !next) {
      toast.error("Please enter current and new passwords.");
      return;
    }
    if (next.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: current,
          newPassword: next,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        toast.error(data.error || "Could not change password.");
        return;
      }
      toast.success("Password changed.");
      setCurrent("");
      setNext("");
    } catch {
      toast.error("Network error.");
    } finally {
      setBusy(false);
    }
  }

  const waDisplay =
    admin.whatsappNumber.length === 10
      ? `+91 ${admin.whatsappNumber}`
      : `+${admin.whatsappNumber}`;

  return (
    <div className="space-y-5 max-w-xl">
      <div>
        <h2 className="font-serif-display text-2xl font-bold">Settings</h2>
        <p className="text-sm text-muted-foreground">
          Manage your admin account.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif-display text-lg">Account</CardTitle>
          <CardDescription>Your signed-in admin details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Username</span>
            <strong>{admin.username}</strong>
          </div>
          <Separator />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">WhatsApp number</span>
            <a
              href={`https://wa.me/${
                admin.whatsappNumber.length === 10
                  ? `91${admin.whatsappNumber}`
                  : admin.whatsappNumber
              }`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-medium text-[#25D366] hover:underline"
            >
              <Phone className="h-4 w-4" />
              {waDisplay}
            </a>
          </div>
          <p className="pt-2 text-xs text-muted-foreground">
            This WhatsApp number is used for self-messaging password resets —
            when you tap &ldquo;Generate reset code&rdquo;, a wa.me chat opens
            to your own number pre-filled with the code.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif-display text-lg">
            Change password
          </CardTitle>
          <CardDescription>Use a strong, unique password.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="cur-pass">Current password</Label>
              <PasswordInput
                id="cur-pass"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                autoComplete="current-password"
                disabled={busy}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-pass">New password</Label>
              <PasswordInput
                id="new-pass"
                value={next}
                onChange={(e) => setNext(e.target.value)}
                autoComplete="new-password"
                disabled={busy}
              />
            </div>
            <Button
              type="submit"
              className="bg-brand-red hover:bg-brand-red/90"
              disabled={busy}
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Update password
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="rounded-xl border border-border bg-muted/40 p-5">
        <h3 className="font-serif-display text-base font-semibold">
          Back to website
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Close this admin panel and return to the public Big My Business
          website.
        </p>
        <Button
          variant="outline"
          className="mt-3"
          onClick={() => {
            history.replaceState(
              null,
              "",
              window.location.pathname + window.location.search
            );
            window.dispatchEvent(new HashChangeEvent("hashchange"));
          }}
        >
          <ArrowLeft className="h-4 w-4" /> Back to website
        </Button>
      </div>
    </div>
  );
}
