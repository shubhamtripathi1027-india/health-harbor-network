import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Centre, Medicine } from "@/lib/data";

const { fixtures } = vi.hoisted(() => ({ fixtures: [] as Centre[] }));
vi.mock("@/lib/data", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/data")>();
  return { ...actual, centres: fixtures };
});
// jsdom cannot measure chart containers; charts do not implement these rules.
vi.mock("recharts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("recharts")>();
  return { ...actual, ResponsiveContainer: () => null };
});
import { Route } from "@/routes/index";

function medicine(name: string, stock: number): Medicine {
  return { name, nameHi: name, stock, min: 2000, unit: "tabs" };
}
function centre(id: string, medicines: Medicine[], present = true): Centre {
  return {
    id, name: id === "c1" ? "PHC Test" : "CHC Donor", nameHi: id,
    district: "Test district", districtHi: "Test district",
    beds: { total: 10, occupied: 2, icu: 1, icuOccupied: 0 },
    doctors: { total: 1, present: Number(present), list: [{ name: id === "c1" ? "Dr. Test" : "Dr. Donor", spec: "General Medicine", present }] },
    patients: { today: 10, week: [1, 2, 3, 4, 5, 6, 7], opd: 8, ipd: 2, emergency: 0 }, medicines,
  };
}
function renderDashboard() {
  const Dashboard = Route.options.component;
  if (!Dashboard) throw new Error("Dashboard component is missing");
  return render(<Dashboard />);
}
function section(title: string): HTMLElement {
  const element = screen.getByRole("heading", { name: title }).closest("section");
  if (!element) throw new Error(`Missing section: ${title}`);
  return element;
}
function statValue(label: string): string {
  const element = screen.getByText(label, { selector: "header div" });
  return element.parentElement?.lastElementChild?.textContent?.trim() ?? "";
}
function inventoryRow(name: string) {
  const row = within(screen.getByRole("table")).getByText(name).closest("tr");
  if (!row) throw new Error(`Missing medicine row: ${name}`);
  return within(row);
}
beforeEach(() => {
  fixtures.splice(0, fixtures.length,
    centre("c1", [medicine("Paracetamol", 650)], true),
    centre("c2", [medicine("Paracetamol", 8400)], false),
  );
});
afterEach(cleanup);

describe("Low-stock alerts", () => {
  it("alerts below minimum but not at or above it", () => {
    fixtures[0] = centre("c1", [medicine("Below", 1999), medicine("At", 2000), medicine("Above", 2001)]);
    fixtures[1] = centre("c2", [medicine("Below", 1000), medicine("At", 4000), medicine("Above", 4000)]);
    renderDashboard();
    const alerts = within(section("Low-stock alerts"));
    expect(statValue("Low-stock alerts")).toBe("2");
    expect(alerts.getAllByText("Below")).toHaveLength(2);
    expect(alerts.queryByText("At")).not.toBeInTheDocument();
    expect(alerts.queryByText("Above")).not.toBeInTheDocument();
  });
  it("classifies below half as critical, exactly half as low, and minimum as OK", () => {
    fixtures[0] = centre("c1", [medicine("Critical boundary", 999), medicine("Half boundary", 1000), medicine("Minimum boundary", 2000)]);
    fixtures[1] = centre("c2", [medicine("Critical boundary", 4000), medicine("Half boundary", 4000), medicine("Minimum boundary", 4000)]);
    renderDashboard();
    expect(inventoryRow("Critical boundary").getByText("Critical")).toBeInTheDocument();
    expect(inventoryRow("Half boundary").getByText("Low")).toBeInTheDocument();
    expect(inventoryRow("Minimum boundary").getByText("OK")).toBeInTheDocument();
  });
  it("filters alerts to the selected centre", () => {
    renderDashboard();
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "c2" } });
    expect(statValue("Low-stock alerts")).toBe("0");
    expect(within(section("Low-stock alerts")).queryByRole("button", { name: "Restock" })).not.toBeInTheDocument();
  });
  it("restocks to twice minimum and removes the shortage and suggestion", () => {
    renderDashboard();
    fireEvent.click(within(section("Low-stock alerts")).getByRole("button", { name: "Restock" }));
    expect(inventoryRow("Paracetamol").getByText("4000")).toBeInTheDocument();
    expect(statValue("Low-stock alerts")).toBe("0");
    expect(within(section("AI redistribution recommendations")).queryByRole("button", { name: "Approve" })).not.toBeInTheDocument();
  });
});
describe("Redistribution approval", () => {
  it("moves the suggested quantity between centres and clears the resolved shortage", () => {
    renderDashboard();
    const suggestions = within(section("AI redistribution recommendations"));
    expect(suggestions.getByText("2350")).toBeInTheDocument();
    fireEvent.click(suggestions.getByRole("button", { name: "Approve" }));
    expect(inventoryRow("Paracetamol").getByText("3000")).toBeInTheDocument();
    expect(statValue("Low-stock alerts")).toBe("0");
    expect(suggestions.queryByRole("button", { name: "Approve" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /^CHC Donor$/ }));
    expect(inventoryRow("Paracetamol").getByText("6050")).toBeInTheDocument();
  });
});
describe("Doctor attendance", () => {
  it("changes the stored attendance count incrementally when the list is only a staff sample", () => {
    const sample = centre("c1", [medicine("Paracetamol", 650)]);
    sample.doctors.total = 6;
    sample.doctors.present = 4;
    fixtures[0] = sample;
    renderDashboard();
    expect(statValue("Doctors present")).toBe("4/7 57%");
    fireEvent.click(screen.getByRole("button", { name: /Dr\. Test/ }));
    expect(statValue("Doctors present")).toBe("3/7 43%");
    expect(within(section("Doctor attendance")).getByText("3/6")).toBeInTheDocument();
  });
  it("toggles present to absent and back, updating centre and network totals", () => {
    renderDashboard();
    const attendance = within(section("Doctor attendance"));
    const doctor = attendance.getByRole("button", { name: /Dr\. Test/ });
    expect(within(doctor).getByText("Present")).toBeInTheDocument();
    expect(statValue("Doctors present")).toBe("1/2 50%");
    fireEvent.click(doctor);
    expect(within(doctor).getByText("Absent")).toBeInTheDocument();
    expect(statValue("Doctors present")).toBe("0/2 0%");
    expect(attendance.getAllByText("0/1")).toHaveLength(2);
    fireEvent.click(doctor);
    expect(within(doctor).getByText("Present")).toBeInTheDocument();
    expect(statValue("Doctors present")).toBe("1/2 50%");
    expect(attendance.getByText("1/1")).toBeInTheDocument();
  });
  it("updates an absent doctor independently and preserves attendance through centre filtering", () => {
    renderDashboard();
    fireEvent.click(screen.getByRole("button", { name: /Dr\. Donor/ }));
    expect(statValue("Doctors present")).toBe("2/2 100%");
    expect(within(screen.getByRole("button", { name: /Dr\. Test/ })).getByText("Present")).toBeInTheDocument();
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "c2" } });
    expect(statValue("Doctors present")).toBe("1/1 100%");
    fireEvent.click(screen.getByRole("button", { name: /Dr\. Donor/ }));
    expect(statValue("Doctors present")).toBe("0/1 0%");
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "all" } });
    expect(statValue("Doctors present")).toBe("1/2 50%");
  });
});
