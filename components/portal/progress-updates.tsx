"use client";

import type { ProjectUpdate } from "@/lib/portal-types";
import { formatDateTime } from "@/lib/portal-utils";

type ProgressUpdatesProps = {
  isLoadingProjectData: boolean;
  filteredProjectUpdates: ProjectUpdate[];
  projectUpdates: ProjectUpdate[];
};

export function ProgressUpdates({ isLoadingProjectData, filteredProjectUpdates, projectUpdates }: ProgressUpdatesProps) {
  return (
    <section className="rounded-2xl border-2 border-ink/80 bg-mist p-5 shadow-hard sm:p-6">
      <h3 className="font-display text-xl uppercase text-ink">Progress Updates</h3>
      {isLoadingProjectData ? <p className="mt-3 text-sm text-ink/75">Loading...</p> : null}
      {!isLoadingProjectData && filteredProjectUpdates.length === 0 ? (
        <p className="mt-3 rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm text-ink/75">
          {projectUpdates.length === 0
            ? "No updates posted yet."
            : "No updates match your current search/filter."}
        </p>
      ) : null}
      <div className="mt-4 space-y-3">
        {filteredProjectUpdates.map((update) => (
          <article key={update.id} className="rounded-lg border border-ink/20 bg-white p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-sm font-semibold text-ink">{update.title}</h4>
              <p className="text-xs text-ink/65">{formatDateTime(update.created_at)}</p>
            </div>
            {update.progress !== null ? (
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.1em] text-[#2d5bd1]">
                Progress: {update.progress}%
              </p>
            ) : null}
            <p className="mt-2 text-sm text-ink/80">{update.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
