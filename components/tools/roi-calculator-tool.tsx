"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/tools/copy-button";

function toNumber(value: string): number {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }
  return parsed;
}

function toCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

function toPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function RoiCalculatorTool() {
  const [monthlyVisitors, setMonthlyVisitors] = useState("5000");
  const [visitToLeadRate, setVisitToLeadRate] = useState("2.5");
  const [leadToClientRate, setLeadToClientRate] = useState("20");
  const [averageDealValue, setAverageDealValue] = useState("2500");
  const [trafficGrowthLift, setTrafficGrowthLift] = useState("25");
  const [conversionLift, setConversionLift] = useState("15");
  const [projectionMonths, setProjectionMonths] = useState("12");

  const summary = useMemo(() => {
    const visitors = toNumber(monthlyVisitors);
    const leadRate = toNumber(visitToLeadRate) / 100;
    const closeRate = toNumber(leadToClientRate) / 100;
    const dealValue = toNumber(averageDealValue);
    const trafficLift = toNumber(trafficGrowthLift) / 100;
    const cvrLift = toNumber(conversionLift) / 100;
    const months = Math.max(1, Math.round(toNumber(projectionMonths)));

    const baselineLeads = visitors * leadRate;
    const baselineClients = baselineLeads * closeRate;
    const baselineRevenue = baselineClients * dealValue;

    const projectedVisitors = visitors * (1 + trafficLift);
    const projectedLeadRate = leadRate * (1 + cvrLift);
    const projectedLeads = projectedVisitors * projectedLeadRate;
    const projectedClients = projectedLeads * closeRate;
    const projectedRevenue = projectedClients * dealValue;

    const monthlyRevenueLift = projectedRevenue - baselineRevenue;
    const totalLift = monthlyRevenueLift * months;

    const snapshot = [
      `Baseline monthly revenue: ${toCurrency(baselineRevenue)}`,
      `Projected monthly revenue: ${toCurrency(projectedRevenue)}`,
      `Monthly lift: ${toCurrency(monthlyRevenueLift)}`,
      `${months}-month projected lift: ${toCurrency(totalLift)}`
    ].join("\n");

    return {
      months,
      baselineLeads,
      baselineClients,
      baselineRevenue,
      projectedLeads,
      projectedClients,
      projectedRevenue,
      monthlyRevenueLift,
      totalLift,
      snapshot
    };
  }, [
    averageDealValue,
    conversionLift,
    leadToClientRate,
    monthlyVisitors,
    projectionMonths,
    trafficGrowthLift,
    visitToLeadRate
  ]);

  return (
    <section className="rounded-2xl border-2 border-ink/80 bg-mist p-4 shadow-hard sm:p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-semibold text-ink">
          Monthly Website Visitors
          <input
            type="number"
            min="0"
            value={monthlyVisitors}
            onChange={(event) => setMonthlyVisitors(event.target.value)}
            className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-ink">
          Visit → Lead Rate (%)
          <input
            type="number"
            min="0"
            step="0.1"
            value={visitToLeadRate}
            onChange={(event) => setVisitToLeadRate(event.target.value)}
            className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-ink">
          Lead → Client Rate (%)
          <input
            type="number"
            min="0"
            step="0.1"
            value={leadToClientRate}
            onChange={(event) => setLeadToClientRate(event.target.value)}
            className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-ink">
          Average Deal Value (USD)
          <input
            type="number"
            min="0"
            value={averageDealValue}
            onChange={(event) => setAverageDealValue(event.target.value)}
            className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-ink">
          Expected Traffic Lift (%)
          <input
            type="number"
            min="0"
            step="0.1"
            value={trafficGrowthLift}
            onChange={(event) => setTrafficGrowthLift(event.target.value)}
            className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-ink">
          Expected Conversion Lift (%)
          <input
            type="number"
            min="0"
            step="0.1"
            value={conversionLift}
            onChange={(event) => setConversionLift(event.target.value)}
            className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
          />
        </label>
      </div>

      <label className="mt-4 grid gap-1 text-sm font-semibold text-ink sm:max-w-xs">
        Projection Horizon (months)
        <input
          type="number"
          min="1"
          value={projectionMonths}
          onChange={(event) => setProjectionMonths(event.target.value)}
          className="rounded-md border border-ink/35 bg-white px-3 py-2 text-sm text-ink"
        />
      </label>

      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-xl border-2 border-ink/20 bg-white p-3">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-ink/60">Baseline Revenue</p>
          <p className="mt-1 text-2xl font-bold text-ink">{toCurrency(summary.baselineRevenue)}</p>
          <p className="mt-1 text-xs text-ink/70">
            {summary.baselineLeads.toFixed(1)} leads · {summary.baselineClients.toFixed(1)} clients / month
          </p>
        </article>
        <article className="rounded-xl border-2 border-[#9ac0ff] bg-[#edf4ff] p-3">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-[#1d4ea5]">Projected Revenue</p>
          <p className="mt-1 text-2xl font-bold text-[#123a86]">{toCurrency(summary.projectedRevenue)}</p>
          <p className="mt-1 text-xs text-[#2350a0]">
            {summary.projectedLeads.toFixed(1)} leads · {summary.projectedClients.toFixed(1)} clients / month
          </p>
        </article>
        <article className="rounded-xl border-2 border-[#9fd9b0] bg-[#e9f9ec] p-3">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-[#14582a]">Monthly Lift</p>
          <p className="mt-1 text-2xl font-bold text-[#0f6a2d]">{toCurrency(summary.monthlyRevenueLift)}</p>
          <p className="mt-1 text-xs text-[#1c6a35]">
            Over baseline with {toPercent(toNumber(trafficGrowthLift))} traffic and {toPercent(toNumber(conversionLift))} conversion lift
          </p>
        </article>
        <article className="rounded-xl border-2 border-[#f2cc7a] bg-[#fff6de] p-3">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-[#815400]">
            {summary.months}-Month Opportunity
          </p>
          <p className="mt-1 text-2xl font-bold text-[#8f5f00]">{toCurrency(summary.totalLift)}</p>
          <p className="mt-1 text-xs text-[#8f6a18]">Cumulative projected revenue lift</p>
        </article>
      </div>

      <div className="mt-5 rounded-xl border-2 border-ink/20 bg-white p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-ink">ROI Snapshot</p>
          <CopyButton text={summary.snapshot} label="Copy Snapshot" />
        </div>
        <pre className="whitespace-pre-wrap text-xs leading-relaxed text-ink/80">{summary.snapshot}</pre>
      </div>
    </section>
  );
}
