import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Valida CPF usando o algoritmo oficial dos digitos verificadores.
 * Aceita CPF com ou sem mascara (pontos e tracos sao removidos).
 */
export function cpfValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = (control.value ?? '').toString();
    if (!value) {
      return null;
    }

    const digits = value.replace(/\D/g, '');

    if (digits.length !== 11) {
      return { cpfInvalido: true };
    }
    if (/^(\d)\1{10}$/.test(digits)) {
      return { cpfInvalido: true };
    }

    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(digits.charAt(i), 10) * (10 - i);
    }
    let resto = (soma * 10) % 11;
    if (resto === 10) resto = 0;
    if (resto !== parseInt(digits.charAt(9), 10)) {
      return { cpfInvalido: true };
    }

    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(digits.charAt(i), 10) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10) resto = 0;
    if (resto !== parseInt(digits.charAt(10), 10)) {
      return { cpfInvalido: true };
    }

    return null;
  };
}

export function telefoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = (control.value ?? '').toString();
    if (!value) return null;
    const digits = value.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 11) {
      return { telefoneInvalido: true };
    }
    return null;
  };
}
