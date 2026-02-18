"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { ScheduleCallModal } from "@/components/schedule-call-modal";
import { createSupabaseBrowserClient, hasSupabasePublicEnv } from "@/lib/supabase-browser";

type AuthAwareNavLinksProps = {
  placement: "header" | "footer";
};

function resolveDisplayName(user: User | null): string {
  if (!user) {
    return "Client";
  }

  const userMeta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const metadataKeys = ["registered_full_name", "full_name", "name", "display_name", "username"] as const;
  for (const key of metadataKeys) {
    const value = userMeta[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  const email = user.email?.trim();
  if (email) {
    const [local] = email.split("@");
    if (local?.trim()) {
      return local.trim();
    }
  }

  return "Client";
}

export function AuthAwareNavLinks({ placement }: AuthAwareNavLinksProps) {
  const isSupabaseConfigured = hasSupabasePublicEnv();
  const pathname = usePathname();
  const supabase = useMemo(
    () => (isSupabaseConfigured ? createSupabaseBrowserClient() : null),
    [isSupabaseConfigured]
  );

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSessionResolved, setIsSessionResolved] = useState(false);
  const [displayName, setDisplayName] = useState("Client");

  useEffect(() => {
    if (!supabase) {
      setIsAuthenticated(false);
      setDisplayName("Client");
      setIsSessionResolved(true);
      return;
    }

    let isMounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) {
        return;
      }
      setIsAuthenticated(Boolean(data.session));
      setDisplayName(resolveDisplayName(data.session?.user ?? null));
      setIsSessionResolved(true);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session));
      setDisplayName(resolveDisplayName(session?.user ?? null));
      setIsSessionResolved(true);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  if (!isSessionResolved) {
    return null;
  }

  const isPortalPage = pathname.startsWith("/portal");

  if (isAuthenticated && placement === "header" && !isPortalPage) {
    return (
      <>
        <Link href="/portal" className="hover:underline">
          Go back to Portal
        </Link>
        <span className="inline-flex max-w-[14rem] items-center gap-1.5 rounded-full border border-[#b48400]/35 bg-[#fff1c5] px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.06em] text-[#6f4a00] sm:max-w-none">
          Signed in as
          <span className="max-w-[7.5rem] truncate rounded-full bg-[#ffd76a] px-1.5 py-0.5 text-[0.62rem] font-bold normal-case tracking-[0.02em] text-[#503400] sm:max-w-[11rem]">
            {displayName}
          </span>
        </span>
      </>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  if (placement === "header") {
    return <ScheduleCallModal label="Schedule a Call" className="hover:underline" />;
  }

  return (
    <Link href="/portal" className="hover:underline">
      Portal
    </Link>
  );
}
