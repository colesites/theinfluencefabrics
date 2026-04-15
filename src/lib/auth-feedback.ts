type AuthErrorLike = {
  code?: string;
  message?: string;
  status?: number;
};

function scorePassword(password: string) {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  return score;
}

export function getPasswordStrength(password: string) {
  if (!password) {
    return {
      label: "",
      colorClass: "text-muted-foreground",
    };
  }

  const score = scorePassword(password);

  if (password.length < 8 || score <= 2) {
    return {
      label: "Weak password",
      colorClass: "text-destructive",
    };
  }

  if (score <= 4) {
    return {
      label: "Fair password",
      colorClass: "text-amber-600",
    };
  }

  return {
    label: "Strong password",
    colorClass: "text-emerald-700",
  };
}

export function getFriendlyAuthError(
  error: AuthErrorLike | null | undefined,
  fallback: string
) {
  if (!error) return fallback;

  const code = (error.code || "").toLowerCase();
  const message = (error.message || "").toLowerCase();

  if (code.includes("invalid_email_or_password")) {
    return "Email or password is incorrect.";
  }
  if (code.includes("user_already_exists")) {
    return "An account with this email already exists.";
  }
  if (code.includes("password") && code.includes("short")) {
    return "Password is too short. Use at least 8 characters.";
  }
  if (code.includes("too_many_requests")) {
    return "Too many attempts. Please wait a moment and try again.";
  }
  if (code.includes("social_provider_not_found")) {
    return "Google sign in is not available yet.";
  }

  if (message.includes("invalid email") || message.includes("invalid password")) {
    return "Email or password is incorrect.";
  }
  if (message.includes("already exists")) {
    return "An account with this email already exists.";
  }
  if (message.includes("network")) {
    return "Network error. Check your connection and try again.";
  }
  if (message.includes("google")) {
    return "Google sign in is not available yet.";
  }

  if (error.status === 429) {
    return "Too many attempts. Please wait a moment and try again.";
  }

  return error.message || fallback;
}
