"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { createSupabaseBrowserClient, hasSupabasePublicEnv } from "@/lib/supabase-browser";

type PortalNotification = {
  id: string;
  project_id: string | null;
  event_type: string;
  title: string;
  message: string | null;
  link_path: string | null;
  is_read: boolean;
  created_at: string;
  project: Array<{
    name: string | null;
  }> | null;
};

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

type PortalNotificationCenterProps = {
  session: Session | null;
  onProjectSelect?: (projectId: string) => void;
};

export function PortalNotificationCenter({ session, onProjectSelect }: PortalNotificationCenterProps) {
  const isSupabaseConfigured = hasSupabasePublicEnv();
  const supabase = useMemo(
    () => (isSupabaseConfigured ? createSupabaseBrowserClient() : null),
    [isSupabaseConfigured]
  );

  const [notifications, setNotifications] = useState<PortalNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const unreadCount = useMemo(
    () => notifications.reduce((count, item) => count + (item.is_read ? 0 : 1), 0),
    [notifications]
  );

  const loadNotifications = useCallback(async () => {
    if (!supabase || !session) {
      setNotifications([]);
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("portal_notifications")
      .select("id,project_id,event_type,title,message,link_path,is_read,created_at,project:projects(name)")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(40);

    setIsLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setNotifications((data ?? []) as PortalNotification[]);
  }, [session, supabase]);

  useEffect(() => {
    if (!session || !supabase) {
      setNotifications([]);
      setErrorMessage("");
      return;
    }

    void loadNotifications();
    const intervalId = window.setInterval(() => {
      void loadNotifications();
    }, 30000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [loadNotifications, session, supabase]);

  async function handleMarkAsRead(notificationId: string) {
    if (!supabase || !session) {
      return;
    }

    setNotifications((current) =>
      current.map((item) => (item.id === notificationId ? { ...item, is_read: true } : item))
    );

    const { error } = await supabase
      .from("portal_notifications")
      .update({ is_read: true })
      .eq("id", notificationId)
      .eq("user_id", session.user.id);

    if (error) {
      setErrorMessage(error.message);
      void loadNotifications();
    }
  }

  async function handleMarkAllAsRead() {
    if (!supabase || !session || unreadCount === 0) {
      return;
    }

    setNotifications((current) => current.map((item) => ({ ...item, is_read: true })));

    const { error } = await supabase
      .from("portal_notifications")
      .update({ is_read: true })
      .eq("user_id", session.user.id)
      .eq("is_read", false);

    if (error) {
      setErrorMessage(error.message);
      void loadNotifications();
    }
  }

  if (!session) {
    return null;
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink transition hover:-translate-y-0.5"
      >
        Alerts
        {unreadCount > 0 ? (
          <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-[#d44444] px-1.5 py-0.5 text-[0.62rem] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="absolute right-0 z-50 mt-2 w-[min(92vw,24rem)] rounded-xl border-2 border-ink/80 bg-white p-3 shadow-hard">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/70">Notifications</p>
            <button
              type="button"
              onClick={() => void handleMarkAllAsRead()}
              disabled={unreadCount === 0}
              className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-ink/70 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
            >
              Mark all read
            </button>
          </div>

          {errorMessage ? (
            <p className="mt-2 rounded-md border border-[#d88] bg-[#fff1f1] px-2.5 py-2 text-xs text-[#7a1f1f]">
              {errorMessage}
            </p>
          ) : null}

          {isLoading ? (
            <p className="mt-3 text-sm text-ink/70">Loading notifications...</p>
          ) : notifications.length === 0 ? (
            <p className="mt-3 text-sm text-ink/70">No notifications yet.</p>
          ) : (
            <div className="mt-3 max-h-96 space-y-2 overflow-y-auto pr-1">
              {notifications.map((item) => {
                const href = item.project_id ? `/portal?project=${item.project_id}` : item.link_path || "/portal";
                const projectName = item.project?.[0]?.name?.trim() || "";
                return (
                  <Link
                    key={item.id}
                    href={href}
                    onClick={() => {
                      if (item.project_id && onProjectSelect) {
                        onProjectSelect(item.project_id);
                      }
                      if (!item.is_read) {
                        void handleMarkAsRead(item.id);
                      }
                      setIsOpen(false);
                    }}
                    className={`block rounded-lg border px-3 py-2 transition ${
                      item.is_read ? "border-ink/15 bg-white" : "border-ink/30 bg-mist"
                    }`}
                  >
                    <p className="text-xs font-semibold text-ink">{item.title}</p>
                    {item.project_id ? (
                      <p className="mt-1 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-ink/65">
                        Project: {projectName || item.project_id.slice(0, 8)}
                      </p>
                    ) : null}
                    {item.message ? <p className="mt-1 text-xs text-ink/75">{item.message}</p> : null}
                    <p className="mt-1 text-[0.68rem] text-ink/60">{formatDateTime(item.created_at)}</p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
