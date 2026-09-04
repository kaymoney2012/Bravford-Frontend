// src/lib/offlineExam.ts
// Keeps an in-progress exam attempt (and any unsent results) safe on the
// student's own device, so a dropped connection during a CBT never costs
// them their answers.

import type { Exam, ExamResult } from '../types';

const ATTEMPT_PREFIX = 'bravford_attempt_'; // + studentId
const PENDING_KEY = 'bravford_pending_results';

export interface StoredAttempt {
  studentId: string;
  examId: string;
  exam: Exam;          // the shuffled snapshot used for this attempt, so option order stays stable on resume
  answers: Record<number, number>;
  currentQ: number;
  startTime: number;
  savedAt: number;
}

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
}

// ── in-progress attempt (autosaved as the student answers) ────────────────

export function saveAttempt(a: StoredAttempt) {
  try {
    localStorage.setItem(ATTEMPT_PREFIX + a.studentId, JSON.stringify({ ...a, savedAt: Date.now() }));
  } catch {
    // localStorage full/unavailable — nothing more we can do client-side
  }
}

export function loadAttempt(studentId: string): StoredAttempt | null {
  return safeParse<StoredAttempt>(localStorage.getItem(ATTEMPT_PREFIX + studentId));
}

export function clearAttempt(studentId: string) {
  localStorage.removeItem(ATTEMPT_PREFIX + studentId);
}

// ── results that finished but couldn't reach the server yet ───────────────

export function getPendingResults(): ExamResult[] {
  return safeParse<ExamResult[]>(localStorage.getItem(PENDING_KEY)) || [];
}

export function queuePendingResult(result: ExamResult) {
  const list = getPendingResults().filter(r => r.id !== result.id);
  list.push(result);
  try { localStorage.setItem(PENDING_KEY, JSON.stringify(list)); } catch { /* ignore */ }
}

export function removePendingResult(id: string) {
  const list = getPendingResults().filter(r => r.id !== id);
  try { localStorage.setItem(PENDING_KEY, JSON.stringify(list)); } catch { /* ignore */ }
}

export function pendingCountFor(studentId: string): number {
  return getPendingResults().filter(r => r.studentId === studentId).length;
}
