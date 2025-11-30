// src/composables/useAlert.js
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

export function useAlert() {
  const confirmDelete = async (text = 'Data akan dihapus. Lanjutkan?') => {
    return await Swal.fire({
      title: 'Konfirmasi Hapus',
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d'
    })
  }

  const success = (title = 'Berhasil', text = '', timer = 1500) => {
    Swal.fire({
      icon: 'success',
      title,
      text,
      showConfirmButton: false,
      timer
    })
  }

  const info = (title, html) => {
    return Swal.fire({
      icon: 'info',
      title,
      html,
      showCancelButton: true,
      confirmButtonText: 'Lanjut',
      cancelButtonText: 'Batal'
    })
  }

  const error = (title = 'Terjadi Kesalahan', text = '') => {
    Swal.fire({
      icon: 'error',
      title,
      text
    })
  }

  return {
    confirmDelete,
    success,
    info,
    error
  }
}
