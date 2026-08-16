import { onlyDigits } from "./formatters";

export type CheckoutFormState = {
  name: string;
  email: string;
  phone: string;
  document: string;
  recipientName: string;
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  customerNotes: string;
};

export type FieldErrors = Partial<Record<keyof CheckoutFormState, string>>;

export function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateCPF(cpf: string) {
  const digits = onlyDigits(cpf);

  if (!digits) return true;
  if (digits.length !== 11) return false;
  if (/^(\d)\1+$/.test(digits)) return false;

  let sum = 0;

  for (let i = 0; i < 9; i += 1) {
    sum += Number(digits[i]) * (10 - i);
  }

  let firstCheck = (sum * 10) % 11;

  if (firstCheck === 10) firstCheck = 0;
  if (firstCheck !== Number(digits[9])) return false;

  sum = 0;

  for (let i = 0; i < 10; i += 1) {
    sum += Number(digits[i]) * (11 - i);
  }

  let secondCheck = (sum * 10) % 11;

  if (secondCheck === 10) secondCheck = 0;

  return secondCheck === Number(digits[10]);
}

export function getFieldError(
  key: keyof CheckoutFormState,
  value: string
): string | undefined {
  const trimmed = value.trim();

  switch (key) {
    case "name":
      if (!trimmed) return "Informe seu nome completo.";
      if (trimmed.length < 2) return "Informe um nome válido.";
      return undefined;

    case "email":
      if (!trimmed) return "Informe seu e-mail.";
      if (!validateEmail(trimmed)) return "Informe um e-mail válido.";
      return undefined;

    case "phone":
      if (!trimmed) return "Informe seu telefone.";
      if (onlyDigits(trimmed).length < 10) return "Informe um telefone válido.";
      return undefined;

    case "document":
      if (!trimmed) return undefined;
      if (!validateCPF(trimmed)) return "Informe um CPF válido.";
      return undefined;

    case "recipientName":
      if (!trimmed) return "Informe o nome do destinatário.";
      if (trimmed.length < 2) return "Informe um nome válido.";
      return undefined;

    case "zipCode":
      if (!trimmed) return "Informe o CEP.";
      if (onlyDigits(trimmed).length !== 8) return "Informe um CEP válido.";
      return undefined;

    case "street":
      if (!trimmed) return "Informe a rua.";
      return undefined;

    case "number":
      if (!trimmed) return "Informe o número.";
      return undefined;

    case "complement":
      return undefined;

    case "neighborhood":
      if (!trimmed) return "Informe o bairro.";
      return undefined;

    case "city":
      if (!trimmed) return "Informe a cidade.";
      return undefined;

    case "state":
      if (!trimmed) return "Informe o estado.";
      if (trimmed.length !== 2) return "Informe a UF com 2 letras.";
      return undefined;

    case "customerNotes":
      if (trimmed.length > 1000) {
        return "As observações devem ter no máximo 1000 caracteres.";
      }
      return undefined;

    default:
      return undefined;
  }
}

export const initialCheckoutForm: CheckoutFormState = {
  name: "",
  email: "",
  phone: "",
  document: "",
  recipientName: "",
  zipCode: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
  customerNotes: "",
};