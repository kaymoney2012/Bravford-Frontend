export type UserRole = 'student' | 'admin';
export type StudentStatus = 'active' | 'inactive' | 'graduated';
export type ExamStatus = 'upcoming' | 'active' | 'closed';
export type Grade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface BaseUser {
  id: string; name: string; email: string; role: UserRole;
}

export interface Student extends BaseUser {
  role: 'student';
  studentClass: string; phone: string; dob: string;
  gender: 'Male' | 'Female' | 'Rather not say'; address: string;
  nationality?: string;
  guardianName: string; guardianPhone: string;
  status: StudentStatus; registrationDate: string;
  password?: string; // only ever populated transiently on the "add student" form
}

export interface Admin extends BaseUser {
  role: 'admin'; title: string;
}

export type User = Student | Admin;

export interface Question {
  id: number; text: string; options: string[]; correctAnswer: number;
}

export interface Exam {
  id: string; title: string; subject: string; targetClass: string;
  durationMinutes: number; questions: Question[];
  status: ExamStatus; createdAt: string; instructions?: string;
  scheduledStart?: string; scheduledEnd?: string;
}

export interface ExamResult {
  id: string; studentId: string; examId: string;
  examTitle: string; subject: string; studentClass?: string;
  score: number; correctCount: number; totalQuestions: number;
  grade: Grade; submittedAt: string;
  answers: Record<number, number>; timeTakenSeconds: number;
  released: boolean;
  releasedAt?: string;
}

export interface Application {
  id: string; firstName: string; lastName: string; dob: string;
  gender: 'Male' | 'Female'; email: string; phone: string;
  address: string; nationality: string; applyingForClass: string;
  previousSchool: string; guardianName: string; guardianPhone: string;
  guardianRelation: string; reasonForApplying: string;
  preferredUsername?: string;
  submittedAt: string; status: 'pending' | 'approved' | 'rejected';
  createdStudentId?: string | null;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  at: string;
}

export interface NewStudentInput {
  name: string; studentClass: string; email: string; phone: string;
  gender: string; dob: string; address: string;
  guardianName: string; guardianPhone: string;
  username: string; password: string;
}

export interface AppContextType {
  currentUser: User | null; page: PageName;
  students: Student[]; exams: Exam[];
  results: ExamResult[]; applications: Application[];
  authLoading: boolean; authError: string;
  login: (id: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void; setPage: (page: PageName) => void;
  addResult: (result: Omit<ExamResult, 'studentClass'>) => Promise<void>;
  addApplication: (
    app: Omit<Application, 'id' | 'submittedAt' | 'status' | 'createdStudentId'> & {
      preferredUsername?: string;
      preferredPassword?: string;
    }
  ) => Promise<string>;
  addStudent: (student: NewStudentInput) => Promise<{ ok: boolean; error?: string }>;
  addExam: (exam: Exam) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  updateStudent: (id: string, data: Partial<Student> & { password?: string }) => Promise<void>;
  updateStudentStatus: (id: string, status: StudentStatus) => Promise<void>;
  updateExamStatus: (id: string, status: ExamStatus) => Promise<void>;
  deleteExam: (id: string) => Promise<void>;
  deleteQuestion: (examId: string, questionId: number) => Promise<void>;
  updateApplicationStatus: (id: string, status: 'approved' | 'rejected') => Promise<void>;
  releaseResult: (resultId: string) => Promise<void>;
  releaseAllForExam: (examId: string) => Promise<void>;
  deleteResult: (resultId: string) => Promise<void>;
  refreshAll: () => Promise<void>;
  isOnline: boolean;
  pendingSyncCount: number;
  updateAdminCredentials: (data: {
    currentPassword: string;
    newId?: string;
    newPassword?: string;
  }) => Promise<{ ok: boolean; error?: string }>;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export type PageName = 'home' | 'about' | 'contact' | 'login' | 'register' | 'dashboard' | 'exams' | 'results' | 'admin';
