export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72;

const LOWERCASE_REGEX = /[a-z]/;
const UPPERCASE_REGEX = /[A-Z]/;
const NUMBER_REGEX = /[0-9]/;
const SYMBOL_REGEX = /[^a-zA-Z0-9]/;

export const PASSWORD_POLICY_TEXT =
  "Use no minimo 8 caracteres com letra maiuscula, letra minuscula, numero e simbolo.";

type PasswordPolicyResult =
  | {
      valid: true;
    }
  | {
      valid: false;
      message: string;
    };

export function validatePasswordPolicy(password: string): PasswordPolicyResult {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return {
      valid: false,
      message: `Senha fraca. Use no minimo ${PASSWORD_MIN_LENGTH} caracteres.`
    };
  }

  if (password.length > PASSWORD_MAX_LENGTH) {
    return {
      valid: false,
      message: `Senha invalida. O limite e ${PASSWORD_MAX_LENGTH} caracteres.`
    };
  }

  if (!LOWERCASE_REGEX.test(password)) {
    return {
      valid: false,
      message: "Senha fraca. Inclua ao menos 1 letra minuscula."
    };
  }

  if (!UPPERCASE_REGEX.test(password)) {
    return {
      valid: false,
      message: "Senha fraca. Inclua ao menos 1 letra maiuscula."
    };
  }

  if (!NUMBER_REGEX.test(password)) {
    return {
      valid: false,
      message: "Senha fraca. Inclua ao menos 1 numero."
    };
  }

  if (!SYMBOL_REGEX.test(password)) {
    return {
      valid: false,
      message: "Senha fraca. Inclua ao menos 1 simbolo."
    };
  }

  return { valid: true };
}
