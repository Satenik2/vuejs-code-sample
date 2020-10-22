import axios from "../../../axios/index.js"
import store from "../../../../store/store.js"

let isAlreadyFetchingAccessToken = false
let subscribers = []

function onAccessTokenFetched(access_token) {
  subscribers = subscribers.filter(callback => callback(access_token))
}

function addSubscriber(callback) {
  subscribers.push(callback)
}

export default {
  init() {

      axios.interceptors.request.use(
          (config) => {
              let accessToken = localStorage.getItem('accessToken');
              if (accessToken) {
                  config.headers.Authorization = 'Bearer ' + accessToken
              }
              return config;
          },
          (error) => {
              return Promise.reject(error);
          }
      );

    axios.interceptors.response.use(function (response) {
      return response
    }, function (error) {

      const { config, response } = error
      const originalRequest = config

      if (response && response.status === 401) {
        if (!isAlreadyFetchingAccessToken) {
          isAlreadyFetchingAccessToken = true
          store.dispatch("auth/fetchAccessToken")
            .then((access_token) => {
              isAlreadyFetchingAccessToken = false
              onAccessTokenFetched(access_token)
            })
        }

        const retryOriginalRequest = new Promise((resolve) => {
          addSubscriber(access_token => {
            originalRequest.headers.Authorization = 'Bearer ' + access_token
            resolve(axios(originalRequest))
          })
        })
        return retryOriginalRequest
      }
      return Promise.reject(error)
    })
  },
  login(email, pwd, checkbox_remember_me) {
    return axios.post("/api/auth/login", {email: email, password: pwd, checkbox_remember_me: checkbox_remember_me})
  },
  registerUser(name, email, pwd, confirmPassword, phoneNumber) {
    return axios.post("/api/auth/register", {name: name, email: email, password: pwd, password_confirmation: confirmPassword, phone_number: phoneNumber})
  },
  forgotPassword(email) {
    return axios.post("/api/auth/forgot-password", {email: email})
  },
  resetPassword(email, token, password, password_confirmation) {
    return axios.post("/api/auth/reset-password", {email: email, token: token, password: password, password_confirmation: password_confirmation})
  },
  updatePassword(old_password, password, password_confirmation) {
    return axios.post("/api/auth/update-password", {old_password: old_password, password: password, password_confirmation: password_confirmation})
  },
  saveGuestRoles(roleIds, guestId) {
      return axios.post("/api/auth/admin/add-new-roles", {roleIds: roleIds, guestId: guestId})
  },
  updateGuestData(name, phone, email, guestId) {
      return axios.post("/api/auth/admin/update-guest-data", {name: name, phone_number: phone, email: email, guestId: guestId})
  },
  getUserMissingRoles(userId) {
      return axios.post("/api/auth/get-missing-roles", {userId: userId})
  },
  getUserRoles() {
    return axios.get("/api/auth/get-roles/show");
  },
  getAllRoles() {
      return axios.get("/api/auth/get-roles");
  },
  logout() {
    return axios.post("/api/auth/logout");
  },
  emailVerify(email, token) {
      return axios.post("/api/auth/email-verify", {email: email, email_verify_token: token});
  },
  getAllUsers() {
      return axios.get('/api/auth/get-all-users');
  },
  getGuestUserData(userId) {
      return axios.post('/api/auth/admin/get-user-data', {userId:userId});
  },
  getGuestRoles(userId) {
      return axios.post('/api/auth/admin/get-user-roles', {userId:userId});
  },
  deleteUserRole(roleId) {
      return axios.post('/api/auth/admin/delete-user-role', {roleId:roleId});
  },
  getUser() {
      return axios.get('/api/user');
  },
  refreshToken() {
    return axios.post("/api/auth/refresh-token", {accessToken: localStorage.getItem("accessToken")})
  }
}
