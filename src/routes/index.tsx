import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Activity, AlertTriangle, ArrowRight, BedDouble, Check, HeartPulse, Languages, Pill, Sparkles, Stethoscope, Users } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { centres as initial, computeRecommendations, type Centre } from "@/lib/data";
import { t as tr, type Lang, type Key } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Health Bridge AI – Health Centre Dashboard" },
      { name: "description", content: "Manage medicine inventory, beds, doctors and AI resource redistribution across 5 Indian health centres." },
      { property: "og:title", content: "Health Bridge AI" },
      { property: "og:description", content: "Smart resource management dashboard for Indian health centres." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [lang, setLang] = useState<Lang>("en");
  const [data, setData] = useState<Centre[]>(initial);
  const [sel, setSel] = useState<string>("all");
  const [done, setDone] = useState<string[]>([]);
  const t = (k: Key) => tr(lang, k);
  const hi = lang === "hi";
  const cname = (c: Centre) => (hi ? c.nameHi : c.name);
  const byId = (id: string) => data.find((c) => c.id === id)!;

  const view = sel === "all" ? data : data.filter((c) => c.id === sel);
  const recs = useMemo(() => computeRecommendations(data), [data]);

  const sum = (f: (c: Centre) => number) => view.reduce((a, c) => a + f(c), 0);
  const bedsTotal = sum((c) => c.beds.total), bedsOcc = sum((c) => c.beds.occupied);
  const docT = sum((c) => c.doctors.total), docP = sum((c) => c.doctors.present);
  const alerts = view.flatMap((c) => c.medicines.filter((m) => m.stock < m.min).map((m) => ({ c, m })));

  const days = t("days").split(",");
  const trend = days.map((d, i) => ({ d, v: sum((c) => c.patients.week[i]) }));
  const bedData = view.map((c) => ({ n: cname(c).replace(/^(PHC|CHC|District Hospital|पीएचसी|सीएचसी|जिला अस्पताल) /, ""), [t("occupied")]: c.beds.occupied, [t("free")]: c.beds.total - c.beds.occupied }));

  const applyRec = (key: string, r: (typeof recs)[number]) => {
    setData((prev) => prev.map((c) => {
      if (c.id !== r.from && c.id !== r.to) return c;
      return { ...c, medicines: c.medicines.map((m) => m.name !== r.med ? m : { ...m, stock: m.stock + (c.id === r.to ? r.qty : -r.qty) }) };
    }));
    setDone((d) => [...d, key]);
  };

  const toggleDoc = (cid: string, idx: number) => setData((prev) => prev.map((c) => {
    if (c.id !== cid) return c;
    const list = c.doctors.list.map((d, i) => (i === idx ? { ...d, present: !d.present } : d));
    const delta = list[idx].present ? 1 : -1;
    return { ...c, doctors: { ...c.doctors, list, present: c.doctors.present + delta } };
  }));

  const restock = (cid: string, name: string) => setData((prev) => prev.map((c) => c.id !== cid ? c : { ...c, medicines: c.medicines.map((m) => m.name === name ? { ...m, stock: m.min * 2 } : m) }));

  const invCentre = sel === "all" ? data[0] : view[0];
  const [invId, setInvId] = useState("c1");
  const inv = sel === "all" ? byId(invId) : invCentre;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-hero text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary-foreground/15"><HeartPulse className="h-6 w-6" /></div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight">{t("title")}</h1>
                <p className="text-sm opacity-80">{t("tagline")}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select value={sel} onChange={(e) => setSel(e.target.value)} className="rounded-lg border border-primary-foreground/30 bg-primary-foreground/10 px-3 py-2 text-sm font-medium outline-none [&>option]:text-foreground">
                <option value="all">{t("all")}</option>
                {data.map((c) => <option key={c.id} value={c.id}>{cname(c)}</option>)}
              </select>
              <button onClick={() => setLang(hi ? "en" : "hi")} className="flex items-center gap-2 rounded-lg bg-primary-foreground px-3 py-2 text-sm font-semibold text-primary">
                <Languages className="h-4 w-4" />{hi ? "English" : "हिन्दी"}
              </button>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat icon={Users} label={t("patientsToday")} value={sum((c) => c.patients.today)} />
            <Stat icon={BedDouble} label={t("bedsAvail")} value={`${bedsTotal - bedsOcc}`} sub={`${t("of")} ${bedsTotal}`} />
            <Stat icon={Stethoscope} label={t("doctorsPresent")} value={`${docP}/${docT}`} sub={`${Math.round((docP / docT) * 100)}%`} />
            <Stat icon={AlertTriangle} label={t("lowStock")} value={alerts.length} warn={alerts.length > 0} />
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-5 px-4 py-6 md:px-8 lg:grid-cols-3">
        <Card title={t("weekTrend")} icon={Activity} className="lg:col-span-2">
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={trend}>
                <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} /><stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="d" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
                <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
                <Tooltip />
                <Area type="monotone" dataKey="v" name={t("patientsToday")} stroke="var(--chart-1)" strokeWidth={2.5} fill="url(#g)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3 text-center">
            {(["opd", "ipd", "emergency"] as const).map((k) => (
              <div key={k} className="rounded-lg bg-secondary p-3"><div className="text-xs text-muted-foreground">{t(k)}</div><div className="text-xl font-bold text-secondary-foreground">{sum((c) => c.patients[k])}</div></div>
            ))}
          </div>
        </Card>

        <Card title={t("lowStock")} icon={AlertTriangle}>
          <div className="max-h-80 space-y-2 overflow-auto pr-1">
            {alerts.length === 0 && <p className="text-sm text-muted-foreground">✓ {t("ok")}</p>}
            {alerts.map(({ c, m }) => {
              const crit = m.stock < m.min * 0.5;
              return (
                <div key={c.id + m.name} className={`flex items-center justify-between rounded-lg border-l-4 bg-muted p-3 ${crit ? "border-destructive" : "border-warning"}`}>
                  <div>
                    <div className="text-sm font-semibold">{hi ? m.nameHi : m.name}</div>
                    <div className="text-xs text-muted-foreground">{cname(c)} · {m.stock}/{m.min} {m.unit}</div>
                  </div>
                  <button onClick={() => restock(c.id, m.name)} className="rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground hover:bg-primary/90">{t("restock")}</button>
                </div>
              );
            })}
          </div>
        </Card>

        <Card title={t("recs")} icon={Sparkles} className="lg:col-span-3">
          {recs.length === 0 && <p className="text-sm text-muted-foreground">{t("noRecs")}</p>}
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {recs.slice(0, 9).map((r) => {
              const key = `${r.med}-${r.from}-${r.to}-${r.qty}`;
              const ok = done.includes(key);
              return (
                <div key={key} className="rounded-xl border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-sm font-semibold"><Pill className="h-4 w-4 text-primary" />{hi ? r.medHi : r.med}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${r.urgency === "high" ? "bg-destructive/10 text-destructive" : "bg-warning/15 text-warning"}`}>{t(r.urgency)}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs">
                    <span className="flex-1 rounded-md bg-secondary px-2 py-1.5 text-center font-medium">{cname(byId(r.from))}</span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-primary" />
                    <span className="flex-1 rounded-md bg-accent px-2 py-1.5 text-center font-medium">{cname(byId(r.to))}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm">{t("transfer")} <b className="text-primary">{r.qty}</b> {r.unit}</span>
                    <button disabled={ok} onClick={() => applyRec(key, r)} className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:bg-success">
                      {ok && <Check className="h-3.5 w-3.5" />}{ok ? t("approved") : t("approve")}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card title={t("bedOcc")} icon={BedDouble}>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={bedData} layout="vertical" margin={{ left: 10 }}>
                <XAxis type="number" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <YAxis type="category" dataKey="n" width={80} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <Tooltip />
                <Bar dataKey={t("occupied")} stackId="a" fill="var(--chart-1)" />
                <Bar dataKey={t("free")} stackId="a" fill="var(--chart-3)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">{t("icu")}: {sum((c) => c.beds.icu - c.beds.icuOccupied)} {t("free")} / {sum((c) => c.beds.icu)}</div>
        </Card>

        <Card title={t("inventory")} icon={Pill} className="lg:col-span-2">
          {sel === "all" && (
            <div className="mb-3 flex flex-wrap gap-2">
              {data.map((c) => <button key={c.id} onClick={() => setInvId(c.id)} className={`rounded-full px-3 py-1 text-xs font-medium ${invId === c.id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>{cname(c)}</button>)}
            </div>
          )}
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-xs text-muted-foreground"><th className="py-2">{t("medicine")}</th><th>{t("stock")}</th><th>{t("min")}</th><th>{t("status")}</th></tr></thead>
            <tbody>
              {inv.medicines.map((m) => {
                const pct = Math.min(100, (m.stock / (m.min * 2)) * 100);
                const st = m.stock < m.min * 0.5 ? "critical" : m.stock < m.min ? "low" : "ok";
                const color = st === "critical" ? "bg-destructive" : st === "low" ? "bg-warning" : "bg-success";
                return (
                  <tr key={m.name} className="border-b last:border-0">
                    <td className="py-2.5 font-medium">{hi ? m.nameHi : m.name}</td>
                    <td><div className="flex items-center gap-2"><div className="h-1.5 w-20 rounded-full bg-muted"><div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} /></div>{m.stock}</div></td>
                    <td className="text-muted-foreground">{m.min}</td>
                    <td><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${st === "ok" ? "bg-success/15 text-success" : st === "low" ? "bg-warning/15 text-warning" : "bg-destructive/10 text-destructive"}`}>{t(st)}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        <Card title={t("attendance")} icon={Stethoscope} className="lg:col-span-3">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {view.map((c) => (
              <div key={c.id} className="rounded-xl border p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div><div className="font-semibold">{cname(c)}</div><div className="text-xs text-muted-foreground">{hi ? c.districtHi : c.district}</div></div>
                  <span className="text-sm font-bold text-primary">{c.doctors.present}/{c.doctors.total}</span>
                </div>
                <ul className="space-y-1">
                  {c.doctors.list.map((d, i) => (
                    <li key={d.name}>
                      <button onClick={() => toggleDoc(c.id, i)} className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted">
                        <span><span className="font-medium">{d.name}</span> <span className="text-xs text-muted-foreground">· {d.spec}</span></span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${d.present ? "bg-success/15 text-success" : "bg-destructive/10 text-destructive"}`}>{d.present ? t("present") : t("absent")}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>
      </main>
      <footer className="pb-8 text-center text-xs text-muted-foreground">Health Bridge AI · Demo data</footer>
    </div>
  );
}

function Stat({ icon: Icon, label, value, sub, warn }: { icon: typeof Users; label: string; value: string | number; sub?: string; warn?: boolean }) {
  return (
    <div className="rounded-xl bg-primary-foreground/10 p-4 backdrop-blur">
      <div className="flex items-center gap-2 text-xs opacity-85"><Icon className={`h-4 w-4 ${warn ? "text-warning" : ""}`} />{label}</div>
      <div className="mt-1 text-2xl font-extrabold">{value} {sub && <span className="text-sm font-medium opacity-75">{sub}</span>}</div>
    </div>
  );
}

function Card({ title, icon: Icon, children, className = "" }: { title: string; icon: typeof Users; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border bg-card p-5 shadow-card ${className}`}>
      <h2 className="mb-4 flex items-center gap-2 font-bold"><span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-accent-foreground"><Icon className="h-4 w-4" /></span>{title}</h2>
      {children}
    </section>
  );
}
