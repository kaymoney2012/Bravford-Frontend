// src/context/AppContext.tsx
// Talks to the Bravford Portal backend (Express + MongoDB) via src/lib/apiClient.ts.

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import { api, ApiError, getToken, setToken } from "../lib/apiClient";
import { getPendingResults, removePendingResult } from "../lib/offlineExam";
import type {
  User,
  Student,
  Exam,
  ExamResult,
  Application,
  AppContextType,
  PageName,
  UserRole,
  StudentStatus,
  ExamStatus,
  NewStudentInput,
} from "../types";

// ── loading screen (outside provider to avoid broken context tree) ────────────

function LoadingScreen() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--navy)",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          border: "4px solid rgba(200,146,42,0.3)",
          borderTop: "4px solid var(--gold)",
          borderRadius: "50%",
          animation: "spin 0.9s linear infinite",
        }}
      />
      <div
        style={{
          color: "rgba(255,255,255,0.5)",
          fontSize: "0.88rem",
          fontFamily: "Outfit,sans-serif",
        }}
      >
        Loading Bravford Portal…
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}

// ── context ───────────────────────────────────────────────────────────────────

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [page, setPage] = useState<PageName>("home");

  const [students, setStudents] = useState<Student[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [booting, setBooting] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isOnline, setIsOnline] = useState(typeof navigator === "undefined" ? true : navigator.onLine);
  const [pendingSyncCount, setPendingSyncCount] = useState(() => getPendingResults().length);

  // ── data loading, tailored to the signed-in role ──────────────────────────

  const refreshAll = useCallback(async (user?: User | null) => {
    const activeUser = user !== undefined ? user : currentUser;
    if (!activeUser) return;

    try {
      if (activeUser.role === "admin") {
        const [stuRes, examRes, resRes, appRes] = await Promise.all([
          api.get<{ students: Student[] }>("/students"),
          api.get<{ exams: Exam[] }>("/exams"),
          api.get<{ results: ExamResult[] }>("/results"),
          api.get<{ applications: Application[] }>("/applications"),
        ]);
        setStudents(stuRes.students);
        setExams(examRes.exams);
        setResults(resRes.results);
        setApplications(appRes.applications);
      } else {
        const [examRes, resRes] = await Promise.all([
          api.get<{ exams: Exam[] }>("/exams"),
          api.get<{ results: ExamResult[] }>("/results"),
        ]);
        setExams(examRes.exams);
        setResults(resRes.results);
      }
    } catch (err) {
      console.error("Failed to load portal data:", err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  // ── restore session on load ───────────────────────────────────────────────

  useEffect(() => {
    (async () => {
      const token = getToken();
      if (!token) {
        setBooting(false);
        return;
      }
      try {
        const { user } = await api.get<{ user: User }>("/auth/me");
        setCurrentUser(user);
        setPage(user.role === "admin" ? "admin" : "dashboard");
        await refreshAll(user);
      } catch {
        setToken(null);
      } finally {
        setBooting(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── sync any exam results that were queued while offline ──────────────────

  const syncPendingResults = useCallback(async () => {
    if (typeof navigator !== "undefined" && !navigator.onLine) return;
    const pending = getPendingResults();
    if (pending.length === 0) return;
    let anySynced = false;
    for (const r of pending) {
      try {
        await api.post("/results", r);
        removePendingResult(r.id);
        anySynced = true;
      } catch {
        // Still offline, or the server rejected it — leave it queued and
        // retry on the next reconnect / app load.
      }
    }
    setPendingSyncCount(getPendingResults().length);
    if (anySynced) await refreshAll();
  }, [refreshAll]);

  useEffect(() => {
    const handleOnline = () => { setIsOnline(true); syncPendingResults(); };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    if (typeof navigator !== "undefined" && navigator.onLine) syncPendingResults();
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncPendingResults]);

  // ── auth ──────────────────────────────────────────────────────────────────

  const login = async (id: string, password: string, role: UserRole): Promise<boolean> => {
    setAuthLoading(true);
    setAuthError("");
    try {
      const { token, user } = await api.post<{ token: string; user: User }>("/auth/login", {
        id,
        password,
        role,
      });
      setToken(token);
      setCurrentUser(user);
      setPage(role === "admin" ? "admin" : "dashboard");
      await refreshAll(user);
      return true;
    } catch (err) {
      setAuthError(err instanceof ApiError ? err.message : "Login failed. Please try again.");
      return false;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setCurrentUser(null);
    setStudents([]);
    setExams([]);
    setResults([]);
    setApplications([]);
    setPage("home");
  };

  // ── students ──────────────────────────────────────────────────────────────

  const addStudent = async (s: NewStudentInput): Promise<{ ok: boolean; error?: string }> => {
    try {
      await api.post("/students", s);
      await refreshAll();
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof ApiError ? err.message : "Failed to add student." };
    }
  };

  const updateStudent = async (id: string, data: Partial<Student> & { password?: string }) => {
    await api.patch(`/students/${id}`, data);
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
    if (currentUser?.id === id && currentUser.role === "student") {
      setCurrentUser((prev) => (prev ? ({ ...prev, ...(data as Partial<User>) } as User) : prev));
    }
  };

  const updateStudentStatus = async (id: string, status: StudentStatus) => {
    await api.patch(`/students/${id}/status`, { status });
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
  };

  const deleteStudent = async (id: string) => {
    await api.del(`/students/${id}`);
    setStudents((prev) => prev.filter((s) => s.id !== id));
    setResults((prev) => prev.filter((r) => r.studentId !== id));
  };

  // ── exams ─────────────────────────────────────────────────────────────────

  const addExam = async (e: Exam) => {
    await api.post("/exams", e);
    await refreshAll();
  };

  const updateExamStatus = async (id: string, status: ExamStatus) => {
    await api.patch(`/exams/${id}/status`, { status });
    setExams((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
  };

  const deleteExam = async (id: string) => {
    await api.del(`/exams/${id}`);
    setExams((prev) => prev.filter((e) => e.id !== id));
  };

  const deleteQuestion = async (examId: string, questionId: number) => {
    const { exam } = await api.del<{ exam: Exam }>(`/exams/${examId}/questions/${questionId}`);
    setExams((prev) => prev.map((e) => (e.id === examId ? exam : e)));
  };

  // ── results ───────────────────────────────────────────────────────────────

  const addResult = async (r: Omit<ExamResult, "studentClass">) => {
    await api.post("/results", r);
    await refreshAll();
  };

  const releaseResult = async (resultId: string) => {
    const now = new Date().toISOString();
    await api.patch(`/results/${resultId}/release`);
    setResults((prev) =>
      prev.map((r) => (r.id === resultId ? { ...r, released: true, releasedAt: now } : r))
    );
  };

  const releaseAllForExam = async (examId: string) => {
    const now = new Date().toISOString();
    await api.patch(`/results/release-all/${examId}`);
    setResults((prev) =>
      prev.map((r) => (r.examId === examId ? { ...r, released: true, releasedAt: now } : r))
    );
  };

  const deleteResult = async (resultId: string) => {
    await api.del(`/results/${resultId}`);
    setResults((prev) => prev.filter((r) => r.id !== resultId));
  };

  // ── applications ──────────────────────────────────────────────────────────

  const addApplication: AppContextType["addApplication"] = async (a) => {
    const { application } = await api.post<{ application: Application }>("/applications", a); // throws ApiError on failure — caller catches it
    if (currentUser?.role === "admin") await refreshAll();
    return application.id;
  };

  const updateApplicationStatus = async (id: string, status: "approved" | "rejected") => {
    const path = status === "approved" ? `/applications/${id}/approve` : `/applications/${id}/reject`;
    await api.patch(path);
    await refreshAll();
  };

  // ── admin account settings ───────────────────────────────────────────────

  const updateAdminCredentials: AppContextType["updateAdminCredentials"] = async (data) => {
    try {
      const { token, user } = await api.patch<{ token: string; user: User }>(
        "/auth/admin/credentials",
        data
      );
      setToken(token);
      setCurrentUser(user);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof ApiError ? err.message : "Failed to update credentials." };
    }
  };

  // ── render ────────────────────────────────────────────────────────────────

  if (booting) return <LoadingScreen />;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        page,
        students,
        exams,
        results,
        applications,
        authLoading,
        authError,
        login,
        logout,
        setPage,
        addResult,
        addApplication,
        addStudent,
        addExam,
        deleteStudent,
        updateStudent,
        updateStudentStatus,
        updateExamStatus,
        deleteExam,
        deleteQuestion,
        updateApplicationStatus,
        releaseResult,
        releaseAllForExam,
        deleteResult,
        refreshAll: () => refreshAll(),
        isOnline,
        pendingSyncCount,
        updateAdminCredentials,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
