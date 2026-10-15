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
    "members" | "events" | "upload" | "settings"
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

const PLAN_OPTIONS = ["Prime", "Privilege", "Franchise"] as const;
const STATUS_OPTIONS = ["Paid", "Pending"] as const;

function MembersTab() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [exporting, setExporting] = useState(false);

  const exportExcel = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/admin/members/export", {
        cache: "no-store",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Export failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const d = new Date();
      const stamp = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(d.getDate()).padStart(2, "0")}`;
      a.download = `big-my-business-members-${stamp}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
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
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-md">
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
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={exportExcel}
            disabled={exporting || members.length === 0}
            className="border-black/15 hover:border-brand-red hover:text-brand-red bg-white"
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
                      colSpan={8}
                      className="text-center text-muted-foreground py-10"
                    >
                      <Loader2 className="h-5 w-5 animate-spin inline-block" />{" "}
                      Loading members…
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center text-muted-foreground py-10"
                    >
                      No members found. Click &ldquo;Add member&rdquo; to create
                      one.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((m) => (
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
                  ))
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
          {events.map((ev) => (
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
                <div className="absolute top-2 left-2 flex gap-1.5">
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
                </div>
              </div>
              <CardContent className="p-4 flex-1 flex flex-col">
                <h3 className="font-serif-display text-lg font-bold leading-tight">
                  {ev.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">{ev.time}</p>
                <p className="text-xs text-muted-foreground">{ev.location}</p>
                {ev.desc ? (
                  <p className="text-sm mt-2 line-clamp-2 text-foreground/80">
                    {ev.desc}
                  </p>
                ) : null}
                <div className="mt-auto flex items-center justify-end gap-1 pt-3">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditing(ev);
                      setDialogOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-brand-red"
                    onClick={() => void remove(ev)}
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
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
    </div>
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
