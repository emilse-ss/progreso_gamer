// T-01: comprueba que el test runner funciona. Se elimina en T-02.
import { describe, expect, it } from "vitest";

describe("T-01 test runner", () => {
  it("el runner funciona", () => {
    expect(1 + 1).toBe(2);
  });
});
