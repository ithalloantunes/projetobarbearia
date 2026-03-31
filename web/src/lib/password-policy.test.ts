import { describe, expect, it } from "vitest";
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  validatePasswordPolicy
} from "@/lib/password-policy";

describe("password policy", () => {
  it("accepts a strong password", () => {
    const result = validatePasswordPolicy("SenhaForte@2026");
    expect(result.valid).toBe(true);
  });

  it("rejects too short passwords", () => {
    const result = validatePasswordPolicy("Aa1@xy");
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.message).toContain(String(PASSWORD_MIN_LENGTH));
    }
  });

  it("rejects passwords without required character classes", () => {
    expect(validatePasswordPolicy("semmaiucula@2026").valid).toBe(false);
    expect(validatePasswordPolicy("SEMMINUSCULA@2026").valid).toBe(false);
    expect(validatePasswordPolicy("SemNumero@@").valid).toBe(false);
    expect(validatePasswordPolicy("SemSimbolo2026").valid).toBe(false);
  });

  it("rejects passwords above max length", () => {
    const longPassword = `Aa1@${"x".repeat(PASSWORD_MAX_LENGTH)}`;
    const result = validatePasswordPolicy(longPassword);
    expect(result.valid).toBe(false);
  });
});
