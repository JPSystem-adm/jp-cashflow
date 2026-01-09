// 'use client'

// export const redirecionarPagina = async (destination: string) => {
//   try {
//     const response = await fetch(`/api/serverRedirect?destination=${encodeURIComponent(destination)}`);
//     if (response.ok) {
//       window.location.href = destination;
//     } else {
//       // Lide com o erro
//       console.error('Failed to redirect');
//     }
//   } catch (error) {
//     console.error('Error occurred during redirect:', error);
//   }
// }