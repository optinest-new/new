"use client";

type AdminWorkspaceProps = {
  updateTitleDraft: string;
  updateBodyDraft: string;
  updateProgressDraft: string;
  isPostingUpdate: boolean;
  onSetUpdateTitleDraft: (value: string) => void;
  onSetUpdateBodyDraft: (value: string) => void;
  onSetUpdateProgressDraft: (value: string) => void;
  onPostProgressUpdate: (e: React.FormEvent<HTMLFormElement>) => void;
};

export function AdminWorkspace({
  updateTitleDraft, updateBodyDraft, updateProgressDraft, isPostingUpdate,
  onSetUpdateTitleDraft, onSetUpdateBodyDraft, onSetUpdateProgressDraft, onPostProgressUpdate
}: AdminWorkspaceProps) {
  return (
    <section className="rounded-2xl border-2 border-ink/80 bg-mist p-5 shadow-hard sm:p-6">
      <h3 className="font-display text-xl uppercase text-ink">Admin Workspace</h3>
      <p className="mt-2 text-sm text-ink/75">
        Manager tools for timeline communication and replying to client questions.
      </p>

      <div className="mt-4">
        <form onSubmit={onPostProgressUpdate} className="mt-3 rounded-lg border border-ink/20 bg-white p-3.5">
          <h4 className="text-sm font-semibold text-ink">Post Progress Update</h4>
          <div className="mt-3 space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">Update Title</label>
            <input type="text" value={updateTitleDraft} onChange={(e) => onSetUpdateTitleDraft(e.target.value)} className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60" placeholder="Milestone completed" required />
            <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">Details</label>
            <textarea rows={4} value={updateBodyDraft} onChange={(e) => onSetUpdateBodyDraft(e.target.value)} className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60" placeholder="What changed, what is next, and what the client should know." required />
            <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-ink/65">Progress Override (optional)</label>
            <input type="number" min={0} max={100} value={updateProgressDraft} onChange={(e) => onSetUpdateProgressDraft(e.target.value)} className="w-full rounded-lg border border-ink/25 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink/60" placeholder="Leave empty to keep current progress" />
            <button type="submit" disabled={isPostingUpdate} className="inline-flex items-center rounded-full border-2 border-[#b45309] bg-[#f59e0b] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#4a2b00] transition hover:-translate-y-0.5 hover:bg-[#e89505] disabled:cursor-not-allowed disabled:opacity-70">
              {isPostingUpdate ? "Posting..." : "Publish Update"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
