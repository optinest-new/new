"use client";

import type { ProjectFile } from "@/lib/portal-types";
import { formatBytes, formatDateTime } from "@/lib/portal-utils";

type FilesDocumentsProps = {
  filteredProjectFiles: ProjectFile[];
  projectFiles: ProjectFile[];
  isUploadingFile: boolean;
  onUploadFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDownloadFile: (filePath: string) => void;
};

export function FilesDocuments({ filteredProjectFiles, projectFiles, isUploadingFile, onUploadFile, onDownloadFile }: FilesDocumentsProps) {
  return (
    <section className="rounded-2xl border-2 border-ink/80 bg-mist p-5 shadow-hard sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="font-display text-xl uppercase text-ink">Files & Documents</h3>
        <label className="inline-flex cursor-pointer items-center rounded-full border-2 border-ink bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink transition hover:-translate-y-0.5">
          <input type="file" onChange={onUploadFile} className="sr-only" disabled={isUploadingFile} />
          {isUploadingFile ? "Uploading..." : "Upload File"}
        </label>
      </div>
      <p className="mt-2 text-xs text-ink/65">Accepted: documents, images, and project assets. Uploaded files are private.</p>

      <div className="mt-4 space-y-2">
        {filteredProjectFiles.length === 0 ? (
          <p className="rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm text-ink/75">
            {projectFiles.length === 0 ? "No files uploaded yet." : "No files match your current search/filter."}
          </p>
        ) : null}
        {filteredProjectFiles.map((file) => (
          <article key={file.id} className="flex flex-col gap-2 rounded-lg border border-ink/20 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-ink">{file.file_name}</p>
              <p className="mt-1 text-xs text-ink/65">{file.mime_type || "Unknown type"} · {formatBytes(file.size_bytes)} · {formatDateTime(file.created_at)}</p>
            </div>
            <button type="button" onClick={() => void onDownloadFile(file.file_path)} className="inline-flex items-center rounded-full border border-ink/25 bg-mist px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-ink hover:border-ink/50">
              Download
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
