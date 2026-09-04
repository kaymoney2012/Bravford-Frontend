// src/pages/RegisterPage.tsx

import React, { useState } from "react";
import { useApp } from "./context/AppContext";

interface FormData {
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  email: string;
  phone: string;
  address: string;
  nationality: string;
  applyingForClass: string;
  previousSchool: string;
  reasonForApplying: string;
  guardianName: string;
  guardianPhone: string;
  guardianRelation: string;
  preferredUsername: string;
  preferredPassword: string;
  confirmPassword: string;
}

const EMPTY: FormData = {
  firstName: "",
  lastName: "",
  dob: "",
  gender: "",
  email: "",
  phone: "",
  address: "",
  nationality: "Nigerian",
  applyingForClass: "",
  previousSchool: "",
  reasonForApplying: "",
  guardianName: "",
  guardianPhone: "",
  guardianRelation: "",
  preferredUsername: "",
  preferredPassword: "",
  confirmPassword: "",
};

const STEPS = ["Personal Info", "Academic", "Portal Login", "Guardian", "Review & Submit"];

export default function RegisterPage() {
  const { addApplication, setPage } = useApp();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(EMPTY);
  const [done, setDone] = useState(false);
  const [refNo, setRefNo] = useState("");
  const [errors, setErrors] = useState<Partial<FormData>>({});

  // FIX: track submitting state + DB errors
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const set = (k: keyof FormData, v: string) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: "" }));
  };

  const validate = (): boolean => {
    const errs: Partial<FormData> = {};
    if (step === 0) {
      if (!form.firstName) errs.firstName = "Required";
      if (!form.lastName) errs.lastName = "Required";
      if (!form.dob) errs.dob = "Required";
      if (!form.gender) errs.gender = "Required";
      if (!form.email) errs.email = "Required";
      if (!form.phone) errs.phone = "Required";
    }
    if (step === 1 && !form.applyingForClass)
      errs.applyingForClass = "Required";
    if (step === 2) {
      if (!form.preferredUsername) errs.preferredUsername = "Required";
      else if (!/^[a-zA-Z0-9_.-]{3,20}$/.test(form.preferredUsername))
        errs.preferredUsername = "3-20 letters/numbers, no spaces";
      if (!form.preferredPassword) errs.preferredPassword = "Required";
      else if (form.preferredPassword.length < 6) errs.preferredPassword = "At least 6 characters";
      if (form.confirmPassword !== form.preferredPassword) errs.confirmPassword = "Passwords don't match";
    }
    if (step === 3) {
      if (!form.guardianName) errs.guardianName = "Required";
      if (!form.guardianPhone) errs.guardianPhone = "Required";
      if (!form.guardianRelation) errs.guardianRelation = "Required";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // FIX: submit is now async so we await the DB write before showing success.
  // If the write fails we show the error instead of a false success screen.
  const submit = async () => {
    setSubmitting(true);
    setSubmitError("");
    try {
      const ref = await addApplication({
        firstName: form.firstName,
        lastName: form.lastName,
        dob: form.dob,
        gender: form.gender as any,
        email: form.email,
        phone: form.phone,
        address: form.address,
        nationality: form.nationality,
        applyingForClass: form.applyingForClass,
        previousSchool: form.previousSchool,
        reasonForApplying: form.reasonForApplying,
        guardianName: form.guardianName,
        guardianPhone: form.guardianPhone,
        guardianRelation: form.guardianRelation,
        preferredUsername: form.preferredUsername,
        preferredPassword: form.preferredPassword,
      });
      setRefNo(ref);
      setDone(true);
    } catch (e: any) {
      setSubmitError(
        e?.message ?? "Failed to submit application. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const err = (k: keyof FormData) =>
    errors[k] ? (
      <span style={{ color: "var(--red)", fontSize: "0.78rem", marginTop: 2 }}>
        {errors[k]}
      </span>
    ) : null;

  const inp = (
    label: string,
    k: keyof FormData,
    placeholder?: string,
    type = "text",
  ) => (
    <div className="form-group" key={k}>
      <label>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={form[k]}
        onChange={(e) => set(k, e.target.value)}
        style={{ borderColor: errors[k] ? "var(--red)" : "" }}
      />
      {err(k)}
    </div>
  );

  const sel = (label: string, k: keyof FormData, opts: string[]) => (
    <div className="form-group" key={k}>
      <label>{label}</label>
      <select
        value={form[k]}
        onChange={(e) => set(k, e.target.value)}
        style={{ borderColor: errors[k] ? "var(--red)" : "" }}
      >
        <option value="">Select…</option>
        {opts.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
      {err(k)}
    </div>
  );

  // FIX: replaced .modal / .modal-icon classes (which don't exist in global.css)
  // with inline styles that match the project's design system.
  if (done)
    return (
      <div
        style={{
          minHeight: "calc(100vh - 64px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          background: "var(--cream)",
        }}
      >
        <div
          className="card"
          style={{
            maxWidth: 480,
            width: "100%",
            textAlign: "center",
            padding: "2.5rem 2rem",
          }}
        >
          <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>🎉</div>
          <h3
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: "1.5rem",
              fontWeight: 800,
              color: "var(--navy)",
              marginBottom: "0.75rem",
            }}
          >
            Application Submitted!
          </h3>
          <p
            style={{
              color: "var(--slate)",
              lineHeight: 1.7,
              marginBottom: "1.5rem",
              fontSize: "0.92rem",
            }}
          >
            Your reference number is{" "}
            <strong style={{ color: "var(--navy)" }}>{refNo}</strong>.
            <br />
            Our admissions team will contact you via{" "}
            <strong>{form.email}</strong> within 3–5 business days.
          </p>
          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              className="btn btn-gold"
              onClick={() => {
                setDone(false);
                setStep(0);
                setForm(EMPTY);
              }}
            >
              Submit Another
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setPage("login")}
            >
              Go to Portal
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <div className="page-wrap" style={{ maxWidth: 760 }}>
      <div className="page-header">
        <h2>Admission Application</h2>
        <p>
          Complete all steps to apply for the {new Date().getFullYear() + 1}{" "}
          academic session.
        </p>
      </div>

      {/* Stepper */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "2rem",
          gap: 8,
          overflowX: "auto",
        }}
      >
        {STEPS.map((s, i) => (
          <React.Fragment key={i}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background:
                    i < step
                      ? "var(--green)"
                      : i === step
                        ? "var(--navy)"
                        : "var(--border)",
                  color: i <= step ? "white" : "var(--slate-2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  flexShrink: 0,
                }}
              >
                {i < step ? "✓" : i + 1}
              </div>
              <span
                style={{
                  fontSize: "0.82rem",
                  fontWeight: i === step ? 700 : 400,
                  color: i === step ? "var(--navy)" : "var(--slate-2)",
                  whiteSpace: "nowrap",
                }}
              >
                {s}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 2,
                  background: i < step ? "var(--green)" : "var(--border)",
                  minWidth: 20,
                }}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="card">
        {step === 0 && (
          <>
            <div className="card-title">Personal Information</div>
            <div className="form-grid">
              {inp("First Name *", "firstName", "Firstname")}
              {inp("Last Name *", "lastName", "Lastname")}
              {inp("Date of Birth *", "dob", "", "date")}
              {sel("Gender *", "gender", ["Male", "Female"])}
              {inp("Email Address *", "email", "you@example.com", "email")}
              {inp("Phone Number *", "phone", "080XXXXXXXX", "tel")}
              <div className="form-group full">
                {inp("Home Address", "address", "Street, City, State")}
              </div>
              {inp("Nationality", "nationality")}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div className="card-title">Academic Information</div>
            <div className="form-grid">
              {sel("Class Applying For *", "applyingForClass", [
                "JSS1",
                "JSS2",
                "JSS3",
                "SS1",
                "SS2",
                "SS3",
              ])}
              {inp(
                "Previous School",
                "previousSchool",
                "Name of last school attended",
              )}
              <div className="form-group full">
                <label>Why Bravford Assda?</label>
                <textarea
                  placeholder="Tell us why you'd like to join our school..."
                  value={form.reasonForApplying}
                  onChange={(e) => set("reasonForApplying", e.target.value)}
                />
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="card-title">Choose Your Portal Login</div>
            <div className="alert alert-info" style={{ marginBottom: "1rem" }}>
              💡 This is how you'll log in to the student portal once your application is approved.
              Choose a username and password you'll remember.
            </div>
            <div className="form-grid">
              {inp("Preferred Username *", "preferredUsername", "e.g. chidi.nwosu")}
              {inp("Password *", "preferredPassword", "At least 6 characters", "password")}
              {inp("Confirm Password *", "confirmPassword", "Re-enter password", "password")}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="card-title">Guardian / Parent Information</div>
            <div className="form-grid">
              {inp(
                "Guardian Full Name *",
                "guardianName",
                "e.g. Mrs. Ngozi Okafor",
              )}
              {sel("Relationship *", "guardianRelation", [
                "Parent",
                "Guardian",
                "Sibling",
                "Relative",
              ])}
              {inp("Guardian Phone *", "guardianPhone", "080XXXXXXXX", "tel")}
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <div className="card-title">Review Your Application</div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.25rem",
              }}
            >
              {[
                ["Full Name", `${form.firstName} ${form.lastName}`],
                ["Date of Birth", form.dob],
                ["Gender", form.gender],
                ["Email", form.email],
                ["Phone", form.phone],
                ["Class Applying For", form.applyingForClass],
                ["Previous School", form.previousSchool || "—"],
                ["Portal Username", form.preferredUsername],
                ["Guardian", `${form.guardianName} (${form.guardianRelation})`],
                ["Guardian Phone", form.guardianPhone],
              ].map(([k, v]) => (
                <div
                  key={k}
                  style={{
                    padding: "10px 0",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.72rem",
                      color: "var(--slate-2)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      fontWeight: 600,
                    }}
                  >
                    {k}
                  </div>
                  <div
                    style={{
                      marginTop: 3,
                      fontWeight: 500,
                      color: "var(--navy)",
                      fontSize: "0.9rem",
                    }}
                  >
                    {v || "—"}
                  </div>
                </div>
              ))}
            </div>
            <div className="alert alert-info" style={{ marginTop: "1.5rem" }}>
              By submitting, you confirm all information is accurate and
              complete.
            </div>

            {/* FIX: show DB-level errors on the final step */}
            {submitError && (
              <div
                className="alert alert-error"
                style={{ marginTop: "0.75rem" }}
              >
                {submitError}
              </div>
            )}
          </>
        )}

        {/* Navigation */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "2rem",
            paddingTop: "1.25rem",
            borderTop: "1px solid var(--border)",
          }}
        >
          {step > 0 ? (
            <button
              className="btn btn-ghost"
              onClick={() => setStep((s) => s - 1)}
              disabled={submitting}
            >
              ← Back
            </button>
          ) : (
            <div />
          )}

          {step < STEPS.length - 1 ? (
            <button
              className="btn btn-gold"
              onClick={() => {
                if (validate()) setStep((s) => s + 1);
              }}
            >
              Continue →
            </button>
          ) : (
            // FIX: button is disabled while the async submit is in-flight
            <button
              className="btn btn-green btn-lg"
              onClick={submit}
              disabled={submitting}
            >
              {submitting ? "⏳ Submitting…" : "✓ Submit Application"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
