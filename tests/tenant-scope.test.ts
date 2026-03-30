import { describe, expect, it } from "vitest";
import { tenantScopedWhere } from "@/lib/security/scope";

describe("tenantScopedWhere", () => {
  it("injects tenant id into where clauses", () => {
    expect(tenantScopedWhere("tenant_123", { published: true })).toEqual({ tenantId: "tenant_123", published: true });
  });
});
