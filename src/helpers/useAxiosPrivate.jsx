import axios from 'axios';

const baseURL = 'http://localhost:5159';

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});


axiosInstance.interceptors.request.use(
  (config) => {
    const tokens = localStorage.getItem('accessToken');
    // console.log('token storage', tokens)
    if (tokens) {
    //   const { access } = JSON.parse(tokens);
      config.headers['Authorization'] =`Bearer ${tokens}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


// axiosInstance.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     if (
//       error.response?.status === 401 &&
//       !originalRequest._retry &&
//       localStorage.getItem('authTokens')
//     ) {
//       originalRequest._retry = true;

//       try {
//         const refreshToken = JSON.parse(localStorage.getItem('authTokens')).refresh;

//         const response = await axios.post(${baseURL}/api/token/refresh/, {
//           refresh: refreshToken,
//         });

//         const newTokens = {
//           access: response.data.access,
//           refresh: refreshToken,
//         };

//         localStorage.setItem('authTokens', JSON.stringify(newTokens));

        
//         originalRequest.headers['Authorization'] = Bearer ${newTokens.access};

//         return axiosInstance(originalRequest);
//       } catch (err) {
//         Swal.fire({
//           icon: 'warning',
//           title: 'Session Expired',
//           text: 'Your session has expired. Please log in again.',
//           confirmButtonColor: '#3085d6',
//           confirmButtonText: 'OK',
//         }).then(() => {
//           localStorage.removeItem('authTokens');
//           localStorage.removeItem('user');
//           window.location.href = '/login';
//         });
//       }
//     }

//     return Promise.reject(error);
//   }
// );

export default axiosInstance;