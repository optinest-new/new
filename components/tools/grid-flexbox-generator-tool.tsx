"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { CopyButton } from "@/components/tools/copy-button";

type LayoutMode = "grid" | "flex";

const previewItems = ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5", "Item 6"];

export function GridFlexboxGeneratorTool() {
  const [mode, setMode] = useState<LayoutMode>("grid");

  const [gap, setGap] = useState("16px");
  const [gridColumns, setGridColumns] = useState("repeat(3, minmax(0, 1fr))");
  const [gridRows, setGridRows] = useState("auto");
  const [justifyItems, setJustifyItems] = useState("stretch");
  const [alignItems, setAlignItems] = useState("stretch");

  const [flexDirection, setFlexDirection] = useState("row");
  const [flexWrap, setFlexWrap] = useState("wrap");
  const [justifyContent, setJustifyContent] = useState("flex-start");
  const [flexAlignItems, setFlexAlignItems] = useState("stretch");

  const cssCode = useMemo(() => {
    if (mode === "grid") {
      return [
        ".container {",
        "  display: grid;",
        `  grid-template-columns: ${gridColumns};`,
        `  grid-template-rows: ${gridRows};`,
        `  gap: ${gap};`,
        `  justify-items: ${justifyItems};`,
        `  align-items: ${alignItems};`,
        "}"
      ].join("\n");
    }

    return [
      ".container {",
      "  display: flex;",
      `  flex-direction: ${flexDirection};`,
      `  flex-wrap: ${flexWrap};`,
      `  gap: ${gap};`,
      `  justify-content: ${justifyContent};`,
      `  align-items: ${flexAlignItems};`,
      "}"
    ].join("\n");
  }, [
    alignItems,
    flexAlignItems,
    flexDirection,
    flexWrap,
    gap,
    gridColumns,
    gridRows,
    justifyContent,
    justifyItems,
    mode
  ]);

  const htmlCode = useMemo(() => {
    const lines = ['<div class="container">'];
    for (const item of previewItems) {
      lines.push(`  <div class="item">${item}</div>`);
    }
    lines.push("</div>");
    return lines.join("\n");
  }, []);

  const previewStyle = useMemo<CSSProperties>(() => {
    if (mode === "grid") {
      return {
        display: "grid",
        gridTemplateColumns: gridColumns,
        gridTemplateRows: gridRows,
        gap,
        justifyItems: justifyItems as CSSProperties["justifyItems"],
        alignItems: alignItems as CSSProperties["alignItems"]
      };
    }

    return {
      display: "flex",
      flexDirection: flexDirection as CSSProperties["flexDirection"],
      flexWrap: flexWrap as CSSProperties["flexWrap"],
      gap,
      justifyContent: justifyContent as CSSProperties["justifyContent"],
      alignItems: flexAlignItems as CSSProperties["alignItems"]
    };
  }, [
    alignItems,
    flexAlignItems,
    flexDirection,
    flexWrap,
    gap,
    gridColumns,
    gridRows,
    justifyContent,
    justifyItems,
    mode
  ]);

  return (
    <section className="rounded-2xl border-2 border-ink/80 bg-mist p-4 shadow-hard sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-semibold text-ink">
          Mode
          <select
            value={mode}
            onChange={(event) => setMode(event.target.value as LayoutMode)}
            className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
          >
            <option value="grid">Grid</option>
            <option value="flex">Flexbox</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold text-ink">
          Gap
          <input
            value={gap}
            onChange={(event) => setGap(event.target.value)}
            className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
          />
        </label>

        {mode === "grid" ? (
          <>
            <label className="grid gap-1 text-sm font-semibold text-ink">
              Grid Columns
              <input
                value={gridColumns}
                onChange={(event) => setGridColumns(event.target.value)}
                className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
              />
            </label>
            <label className="grid gap-1 text-sm font-semibold text-ink">
              Grid Rows
              <input
                value={gridRows}
                onChange={(event) => setGridRows(event.target.value)}
                className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
              />
            </label>
            <label className="grid gap-1 text-sm font-semibold text-ink">
              Justify Items
              <select
                value={justifyItems}
                onChange={(event) => setJustifyItems(event.target.value)}
                className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
              >
                <option value="stretch">stretch</option>
                <option value="start">start</option>
                <option value="center">center</option>
                <option value="end">end</option>
              </select>
            </label>
            <label className="grid gap-1 text-sm font-semibold text-ink">
              Align Items
              <select
                value={alignItems}
                onChange={(event) => setAlignItems(event.target.value)}
                className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
              >
                <option value="stretch">stretch</option>
                <option value="start">start</option>
                <option value="center">center</option>
                <option value="end">end</option>
              </select>
            </label>
          </>
        ) : (
          <>
            <label className="grid gap-1 text-sm font-semibold text-ink">
              Flex Direction
              <select
                value={flexDirection}
                onChange={(event) => setFlexDirection(event.target.value)}
                className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
              >
                <option value="row">row</option>
                <option value="column">column</option>
                <option value="row-reverse">row-reverse</option>
                <option value="column-reverse">column-reverse</option>
              </select>
            </label>
            <label className="grid gap-1 text-sm font-semibold text-ink">
              Flex Wrap
              <select
                value={flexWrap}
                onChange={(event) => setFlexWrap(event.target.value)}
                className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
              >
                <option value="nowrap">nowrap</option>
                <option value="wrap">wrap</option>
                <option value="wrap-reverse">wrap-reverse</option>
              </select>
            </label>
            <label className="grid gap-1 text-sm font-semibold text-ink">
              Justify Content
              <select
                value={justifyContent}
                onChange={(event) => setJustifyContent(event.target.value)}
                className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
              >
                <option value="flex-start">flex-start</option>
                <option value="center">center</option>
                <option value="flex-end">flex-end</option>
                <option value="space-between">space-between</option>
                <option value="space-around">space-around</option>
                <option value="space-evenly">space-evenly</option>
              </select>
            </label>
            <label className="grid gap-1 text-sm font-semibold text-ink">
              Align Items
              <select
                value={flexAlignItems}
                onChange={(event) => setFlexAlignItems(event.target.value)}
                className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
              >
                <option value="stretch">stretch</option>
                <option value="flex-start">flex-start</option>
                <option value="center">center</option>
                <option value="flex-end">flex-end</option>
                <option value="baseline">baseline</option>
              </select>
            </label>
          </>
        )}
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-3">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-display text-xl uppercase leading-none text-ink">Generated CSS</h2>
            <CopyButton text={cssCode} label="Copy CSS" />
          </div>
          <textarea
            readOnly
            value={cssCode}
            className="h-56 w-full rounded-lg border-2 border-ink/75 bg-[#101414] p-3 font-mono text-xs leading-relaxed text-[#ecfff3]"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-display text-xl uppercase leading-none text-ink">Generated HTML</h2>
            <CopyButton text={htmlCode} label="Copy HTML" />
          </div>
          <textarea
            readOnly
            value={htmlCode}
            className="h-56 w-full rounded-lg border-2 border-ink/75 bg-[#101414] p-3 font-mono text-xs leading-relaxed text-[#ecfff3]"
          />
        </div>

        <div>
          <h2 className="mb-2 font-display text-xl uppercase leading-none text-ink">Live Preview</h2>
          <div className="rounded-lg border-2 border-ink/75 bg-white p-3">
            <div style={previewStyle}>
              {previewItems.map((item) => (
                <div
                  key={item}
                  className="rounded-md border border-ink/40 bg-fog px-3 py-3 text-center text-xs font-bold uppercase tracking-[0.1em] text-ink"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
