import Swal from 'sweetalert2';
import '@sweetalert2/theme-dark/dark.css'; // Usa el tema oscuro
import '../../styles/Alerts.css';

export const showSuccessAlert = (title, text, onConfirm) => {
  Swal.fire({
    title: title,
    text: text,
    icon: 'success',
    confirmButtonText: 'Got it',
    customClass: {
      confirmButton: 'custom-success-button' // Aplica la clase personalizada
    },
    willClose: onConfirm
  });
};

export const showErrorAlert = (title, text) => {
  Swal.fire({
    title: title,
    text: text,
    icon: 'error',
    confirmButtonText: 'OK',
    customClass: {
      confirmButton: 'custom-error-button' // Aplica la clase personalizada para errores
    }
  });
};