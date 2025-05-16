// src/utils/securityAuditUtils.ts

import { CredentialEntry } from "../models/Credential";

/**
 * Security issue types that can be detected
 */
export enum SecurityIssueType {
  WEAK_PASSWORD = "weak_password",
  REUSED_PASSWORD = "reused_password",
  MISSING_USERNAME = "missing_username",
  MISSING_TITLE = "missing_title",
  OLD_PASSWORD = "old_password",
}

/**
 * Represents a detected security issue
 */
export interface SecurityIssue {
  type: SecurityIssueType;
  message: string;
  severity: "high" | "medium" | "low";
  affectedCredentials: CredentialEntry[];
}

/**
 * Check if a password is considered weak
 * @param password The password to check
 * @returns True if the password is weak
 */
export const isWeakPassword = (password: string): boolean => {
  // Password must be at least 8 characters
  if (password.length < 8) return true;

  // Check for complexity requirements
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSymbols = /[^A-Za-z0-9]/.test(password);

  // Password should meet at least 3 of the 4 complexity requirements
  const complexityScore = [
    hasLowercase,
    hasUppercase,
    hasNumbers,
    hasSymbols,
  ].filter(Boolean).length;

  return complexityScore < 3;
};

/**
 * Find all weak passwords in the credentials
 * @param credentials List of credential entries
 * @returns Security issue if weak passwords are found
 */
export const findWeakPasswords = (
  credentials: CredentialEntry[]
): SecurityIssue | null => {
  const weak = credentials.filter((cred) => isWeakPassword(cred.password));

  if (weak.length === 0) return null;

  return {
    type: SecurityIssueType.WEAK_PASSWORD,
    message: `${weak.length} ${
      weak.length === 1 ? "credential has" : "credentials have"
    } weak passwords`,
    severity: "high",
    affectedCredentials: weak,
  };
};

/**
 * Find reused passwords in the credentials
 * @param credentials List of credential entries
 * @returns Security issue if reused passwords are found
 */
export const findReusedPasswords = (
  credentials: CredentialEntry[]
): SecurityIssue | null => {
  const passwordMap = new Map<string, CredentialEntry[]>();

  // Group credentials by password
  credentials.forEach((cred) => {
    const existing = passwordMap.get(cred.password) || [];
    passwordMap.set(cred.password, [...existing, cred]);
  });

  // Find passwords used multiple times
  const reused: CredentialEntry[] = [];
  passwordMap.forEach((creds, _) => {
    if (creds.length > 1) {
      reused.push(...creds);
    }
  });

  if (reused.length === 0) return null;

  return {
    type: SecurityIssueType.REUSED_PASSWORD,
    message: `${reused.length} credentials use ${passwordMap.size} reused passwords`,
    severity: "high",
    affectedCredentials: reused,
  };
};

/**
 * Find credentials with missing usernames
 * @param credentials List of credential entries
 * @returns Security issue if credentials with missing usernames are found
 */
export const findMissingUsernames = (
  credentials: CredentialEntry[]
): SecurityIssue | null => {
  const missing = credentials.filter((cred) => !cred.username);

  if (missing.length === 0) return null;

  return {
    type: SecurityIssueType.MISSING_USERNAME,
    message: `${missing.length} ${
      missing.length === 1 ? "credential has" : "credentials have"
    } missing usernames`,
    severity: "low",
    affectedCredentials: missing,
  };
};

/**
 * Perform a full security audit on all credentials
 * @param credentials List of credential entries
 * @returns List of all detected security issues
 */
export const performSecurityAudit = (
  credentials: CredentialEntry[]
): SecurityIssue[] => {
  const issues: SecurityIssue[] = [];

  const weakPasswordsIssue = findWeakPasswords(credentials);
  if (weakPasswordsIssue) issues.push(weakPasswordsIssue);

  const reusedPasswordsIssue = findReusedPasswords(credentials);
  if (reusedPasswordsIssue) issues.push(reusedPasswordsIssue);

  const missingUsernamesIssue = findMissingUsernames(credentials);
  if (missingUsernamesIssue) issues.push(missingUsernamesIssue);

  return issues;
};
