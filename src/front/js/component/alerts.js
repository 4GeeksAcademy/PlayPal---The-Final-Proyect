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
      confirmButton: 'custom-confirm-button' // Aplica la clase personalizada
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
      confirmButton: 'custom-confirm-button' // Aplica la clase personalizada para errores
    }
  });
};

export const showRoomRequestSentAlert = (onConfirm) => {
  Swal.fire({
    title: 'Room Request Sent',
    text: "Your request has been sent. Once the room's creator accepts you, you can chat and share your usernames. Enjoy!",
    icon: 'success',
    confirmButtonText: 'Got it',
    customClass: {
      confirmButton: 'custom-confirm-button'
    },
    willClose: onConfirm
  });
};

export const showAutoCloseAlert = (title, html, timer = 2000) => {
  let timerInterval;
  return Swal.fire({
    title: title,
    html: html,
    timer: timer,
    timerProgressBar: true,
    didOpen: () => {
      Swal.showLoading();
      const timerEl = Swal.getPopup().querySelector('b');
      timerInterval = setInterval(() => {
        timerEl.textContent = `${Swal.getTimerLeft()}`;
      }, 100);
    },
    willClose: () => {
      clearInterval(timerInterval);
    }
  }).then((result) => {
    if (result.dismiss === Swal.DismissReason.timer) {
      console.log('I was closed by the timer');
    }
  });
};

export const showLeaveRoomConfirmAlert = () => {
  return Swal.fire({
    title: 'Are you sure?',
    text: "If you leave the room, you will have to submit another request to rejoin.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, leave it!',
    cancelButtonText: 'No, cancel!',
    customClass: {
      confirmButton: 'custom-confirm-button', // Estilo personalizado para el botón de confirmación
      cancelButton: 'custom-error-button' // Estilo personalizado para el botón de cancelación
    },
    reverseButtons: true
  });
};

export const showDeleteRoomConfirmAlert = () => {
  return Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to recover this room once deleted.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'No, cancel!',
    customClass: {
      confirmButton: 'custom-error-button', // Estilo personalizado para el botón de confirmación en rojo
      cancelButton: 'custom-confirm-button' // Estilo personalizado para el botón de cancelación
    },
    reverseButtons: true
  });
};

export const showWelcomeAlert = () => {
  Swal.fire({
    title: "Welcome to PlayPal!",
    html: `
      We're excited to have you here! You can use the search bar to find rooms by game name or room name. For the best results, we recommend using the franchise name rather than a specific game title.<br><br>
      If you don't see your game available, we have a category called "Other" where you can create rooms with the game name. This way, other players can easily find and join your game rooms.<br><br>
      Happy gaming, and may you find the perfect group to play with!
    `,
    showClass: {
      popup: `
        animate__animated
        animate__fadeInUp
        animate__faster
      `
    },
    hideClass: {
      popup: `
        animate__animated
        animate__fadeOutDown
        animate__faster
      `
    },
    customClass: {
      confirmButton: 'custom-confirm-button' // Estilo personalizado para el botón de confirmación
    }
  });
};
