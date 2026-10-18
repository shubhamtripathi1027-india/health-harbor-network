import { describe, expect, it } from "vitest";
import { centres, computeRecommendations, type Centre } from "./data";

function centre(id: string, stock: number): Centre {
  return {
    id, name: id, nameHi: id, district: "Test", districtHi: "Test",
    beds: { total: 1, occupied: 0, icu: 0, icuOccupied: 0 },
    doctors: { total: 0, present: 0, list: [] },
    patients: { today: 0, week: [], opd: 0, ipd: 0, emergency: 0 },
    medicines: [{ name: "Test medicine", nameHi: "दवा", stock, min: 100, unit: "tabs" }],
  };
}

describe("Redistribution suggestions", () => {
  it("handles an empty network", () => {
    expect(computeRecommendations([])).toEqual([]);
  });
  it("does not transfer to recipients at or above minimum", () => {
    expect(computeRecommendations([centre("at", 100), centre("above", 101), centre("donor", 500)])).toEqual([]);
  });
  it("fills a recipient to 1.5 times minimum while preserving the donor reserve", () => {
    expect(computeRecommendations([centre("recipient", 40), centre("donor", 300)])).toEqual([
      { med: "Test medicine", medHi: "दवा", from: "donor", to: "recipient", qty: 110, unit: "tabs", urgency: "high" },
    ]);
  });
  it("does not use donor stock at the 1.5-times-minimum reserve", () => {
    expect(computeRecommendations([centre("recipient", 40), centre("donor", 150)])).toEqual([]);
  });
  it("uses largest surplus first and caps transfers at available surplus", () => {
    const result = computeRecommendations([centre("recipient", 40), centre("small", 170), centre("large", 200)]);
    expect(result.map(({ from, qty }) => ({ from, qty }))).toEqual([
      { from: "large", qty: 50 }, { from: "small", qty: 20 },
    ]);
  });
  it("does not allocate donor surplus twice across recipients", () => {
    const result = computeRecommendations([centre("first", 40), centre("second", 40), centre("donor", 300)]);
    expect(result.map(({ to, qty }) => ({ to, qty }))).toEqual([
      { to: "first", qty: 110 }, { to: "second", qty: 40 },
    ]);
    expect(result.reduce((total, r) => total + r.qty, 0)).toBe(150);
  });
  it("marks below-half stock high, exactly half medium, and sorts high first", () => {
    const result = computeRecommendations([centre("medium", 50), centre("high", 49), centre("donor", 500)]);
    expect(result.map(({ to, urgency, qty }) => ({ to, urgency, qty }))).toEqual([
      { to: "high", urgency: "high", qty: 101 }, { to: "medium", urgency: "medium", qty: 100 },
    ]);
  });
  it("does not mutate its inputs", () => {
    const input = [centre("recipient", 40), centre("donor", 300)];
    const before = JSON.parse(JSON.stringify(input));
    computeRecommendations(input);
    expect(input).toEqual(before);
  });
  it("computes the first five-centre demo transfer", () => {
    expect(computeRecommendations(centres)[0]).toEqual({
      med: "Paracetamol 500mg", medHi: "पैरासिटामोल 500mg", from: "c4", to: "c1", qty: 2350, unit: "tabs", urgency: "high",
    });
  });
});
