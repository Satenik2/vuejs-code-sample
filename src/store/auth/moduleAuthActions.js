import jwt from "../../http/requests/auth/jwt/index.js"

import firebase from 'firebase/app'
import 'firebase/auth'
import router from '@/router'

const tokenExpiryKey = 'tokenExpiry';
const localStorageKey = 'loggedIn';

export default {
    loginAttempt({ dispatch }, payload) {

        // New payload for login action
        const newPayload = {
            userDetails: payload.userDetails,
            notify: payload.notify,
            closeAnimation: payload.closeAnimation
        }

        // If remember_me is enabled change firebase Persistence
        if (!payload.checkbox_remember_me) {

            // Change firebase Persistence
            firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)

                // If success try to login
                .then(function() {
                    dispatch('login', newPayload)
                })

                // If error notify
                .catch(function(err) {

                    // Close animation if passed as payload
                    if(payload.closeAnimation) payload.closeAnimation()

                    payload.notify({
                        time: 2500,
                        title: 'Error',
                        text: err.message,
                        iconPack: 'feather',
                        icon: 'icon-alert-circle',
                        color: 'danger'
                    })
                })
        } else {
            // Try to login
            dispatch('login', newPayload)
        }
    },
    login({ commit, state, dispatch }, payload) {

        // If user is already logged in notify and exit
        if (state.isUserLoggedIn()) {
            // Close animation if passed as payload
            if(payload.closeAnimation) payload.closeAnimation()

            payload.notify({
                title: 'Login Attempt',
                text: 'You are already logged in!',
                iconPack: 'feather',
                icon: 'icon-alert-circle',
                color: 'warning'
            })

            return false
        }

        // Try to sigin
        firebase.auth().signInWithEmailAndPassword(payload.userDetails.email, payload.userDetails.password)

            .then((result) => {

                // Set FLAG username update required for updating username
                let isUsernameUpdateRequired = false

                // if username is provided and updateUsername FLAG is true
                  // set local username update FLAG to true
                  // try to update username
                if(payload.updateUsername && payload.userDetails.username) {

                    isUsernameUpdateRequired = true

                    dispatch('updateUsername', {
                      user: result.user,
                      username: payload.userDetails.username,
                      notify: payload.notify,
                      isReloadRequired: true
                    })
                }

                // Close animation if passed as payload
                if(payload.closeAnimation) payload.closeAnimation()

                // if username update is not required
                  // just reload the page to get fresh data
                  // set new user data in localstorage
                if(!isUsernameUpdateRequired) {
                  router.push(router.currentRoute.query.to || '/')
                  commit('UPDATE_USER_INFO', result.user.providerData[0], {root: true})
                }
            }, (err) => {

                // Close animation if passed as payload
                if(payload.closeAnimation) payload.closeAnimation()

                payload.notify({
                    time: 2500,
                    title: 'Error',
                    text: err.message,
                    iconPack: 'feather',
                    icon: 'icon-alert-circle',
                    color: 'danger'
                })
            })
    },

    // Google Login
    loginWithGoogle({commit, state}, payload) {
        if (state.isUserLoggedIn()) {
            payload.notify({
                title: 'Login Attempt',
                text: 'You are already logged in!',
                iconPack: 'feather',
                icon: 'icon-alert-circle',
                color: 'warning'
            })
            return false
        }
        const provider = new firebase.auth.GoogleAuthProvider()

        firebase.auth().signInWithPopup(provider)
          .then((result) => {
              router.push(router.currentRoute.query.to || '/')
              commit('UPDATE_USER_INFO', result.user.providerData[0], {root: true})
          }).catch((err) => {
              payload.notify({
                  time: 2500,
                  title: 'Error',
                  text: err.message,
                  iconPack: 'feather',
                  icon: 'icon-alert-circle',
                  color: 'danger'
              })
          })
    },

    // Facebook Login
    loginWithFacebook({commit, state}, payload) {
        if (state.isUserLoggedIn()) {
            payload.notify({
                title: 'Login Attempt',
                text: 'You are already logged in!',
                iconPack: 'feather',
                icon: 'icon-alert-circle',
                color: 'warning'
            })
            return false
        }
        const provider = new firebase.auth.FacebookAuthProvider()

        firebase.auth().signInWithPopup(provider)
            .then((result) => {
                router.push(router.currentRoute.query.to || '/')
                commit('UPDATE_USER_INFO', result.user.providerData[0], {root: true})
            }).catch((err) => {
                payload.notify({
                    time: 2500,
                    title: 'Error',
                    text: err.message,
                    iconPack: 'feather',
                    icon: 'icon-alert-circle',
                    color: 'danger'
                })
            })
    },

    // Twitter Login
    loginWithTwitter({commit, state}, payload) {
        if (state.isUserLoggedIn()) {
            payload.notify({
                title: 'Login Attempt',
                text: 'You are already logged in!',
                iconPack: 'feather',
                icon: 'icon-alert-circle',
                color: 'warning'
            })
            return false
        }
        const provider = new firebase.auth.TwitterAuthProvider()

        firebase.auth().signInWithPopup(provider)
            .then((result) => {
                router.push(router.currentRoute.query.to || '/')
                commit('UPDATE_USER_INFO', result.user.providerData[0], {root: true})
            }).catch((err) => {
                payload.notify({
                    time: 2500,
                    title: 'Error',
                    text: err.message,
                    iconPack: 'feather',
                    icon: 'icon-alert-circle',
                    color: 'danger'
                })
            })
    },

    // Github Login
    loginWithGithub({commit, state}, payload) {
        if (state.isUserLoggedIn()) {
            payload.notify({
                title: 'Login Attempt',
                text: 'You are already logged in!',
                iconPack: 'feather',
                icon: 'icon-alert-circle',
                color: 'warning'
            })
            return false
        }
        const provider = new firebase.auth.GithubAuthProvider()

        firebase.auth().signInWithPopup(provider)
            .then((result) => {
                router.push(router.currentRoute.query.to || '/')
                commit('UPDATE_USER_INFO', result.user.providerData[0], {root: true})
            }).catch((err) => {
                payload.notify({
                    time: 2500,
                    title: 'Error',
                    text: err.message,
                    iconPack: 'feather',
                    icon: 'icon-alert-circle',
                    color: 'danger'
                })
            })
    },
    registerUser({dispatch}, payload) {

        // create user using firebase
        firebase.auth().createUserWithEmailAndPassword(payload.userDetails.email, payload.userDetails.password)
            .then(() => {
                payload.notify({
                    title: 'Account Created',
                    text: 'You are successfully registered!',
                    iconPack: 'feather',
                    icon: 'icon-check',
                    color: 'success'
                })

                const newPayload = {
                    userDetails: payload.userDetails,
                    notify: payload.notify,
                    updateUsername: true
                }
                dispatch('login', newPayload)
            }, (error) => {
                payload.notify({
                    title: 'Error',
                    text: error.message,
                    iconPack: 'feather',
                    icon: 'icon-alert-circle',
                    color: 'danger'
                })
            })
    },
    updateUsername({ commit }, payload) {
        payload.user.updateProfile({
            name: payload.username
        }).then(() => {

            // If username update is success
              // update in localstorage
            let newUserData = Object.assign({}, payload.user.providerData[0])
            newUserData.name = payload.username
            commit('UPDATE_USER_INFO', newUserData, {root: true})

            // If reload is required to get fresh data after update
              // Reload current page
            if(payload.isReloadRequired) {
                router.push(router.currentRoute.query.to || '/')
            }
        }).catch((err) => {
              payload.notify({
                time: 8800,
                title: 'Error',
                text: err.message,
                iconPack: 'feather',
                icon: 'icon-alert-circle',
                color: 'danger'
            })
        })
    },


    // JWT
    loginJWT({ commit }, payload) {

      return new Promise((resolve,reject) => {
        jwt.login(payload.userDetails.email, payload.userDetails.password, payload.checkbox_remember_me)
          .then(response => {

            // If there's user data in response
            if(response.data.userData) {
              // Navigate User to homepage
              router.push(router.currentRoute.query.to || '/')

              // Set accessToken
              localStorage.setItem("accessToken", response.data.accessToken)
              localStorage.setItem("date", response.data.date)

                // Convert the JWT expiry time from seconds to milliseconds
                this.tokenExpiry = new Date(response.data.exp * 1000);
                localStorage.setItem(tokenExpiryKey, this.tokenExpiry);
                localStorage.setItem(localStorageKey, 'true');


              // Update user details
              commit('UPDATE_USER_INFO', response.data.userData, {root: true})

              // Set bearer token in axios
              commit("SET_BEARER", response.data.accessToken)

              resolve(response)
            }else {
              reject(response)
            }

          })
          .catch(error => {

              reject(error)
          })
      })
    },
    registerUserJWT({ commit }, payload) {

      const { name, email, password, confirmPassword, phoneNumber } = payload.userDetails

      return new Promise((resolve,reject) => {

        // Check confirm password
        if(password !== confirmPassword) {
          reject({message: "Password doesn't match. Please try again."})
        }

        jwt.registerUser(name, email, password, confirmPassword, phoneNumber)
          .then(response => {
            resolve(response)
          })
          .catch(error => { reject(error) })
      })
    },
    forgotPassword({ commit }, payload) {
        const { email } = payload.userDetails;

        return new Promise((resolve,reject) => {
            jwt.forgotPassword(email)
                .then(response => {

                    if(response.status === 200) {
                        resolve({message: response.data.message});
                    }

                })
                .catch(error => { reject(error) })
        })
    },
    getUserMissingRoles({ commit }, payload) {
        return new Promise((resolve, reject) => {
            jwt.getUserMissingRoles(payload.userId)
                .then(response => {
                    resolve(response)
                })
                .catch(error => {
                    reject(error)
                })
        })
    },
    saveGuestRoles({ commit }, payload) {
        return new Promise((resolve, reject) => {
            jwt.saveGuestRoles(payload.roleIds, payload.guestId)
                .then(response => {
                    resolve(response)
                })
                .catch(error => {
                    reject(error)
                })
        })
    },
    resetPassword({ commit }, payload) {
        const { email, token, password, password_confirmation } = payload.userDetails;

        return new Promise((resolve,reject) => {
            // Check confirm password
            if(password !== password_confirmation) {
                reject({message: "Password doesn't match. Please try again."})
            }

            jwt.resetPassword(email, token, password, password_confirmation).then(response => {

                if(response.status === 200) {
                    resolve({message: response.data.message});
                }
            })
                .catch(error => { reject(error) })

        })
    },
    updatePassword({ commit }, payload) {

        return new Promise((resolve,reject) => {

            if(payload.password !== payload.password_confirmation) {
                reject({message: "Password doesn't match. Please try again."})
            }

            jwt.updatePassword(payload.old_password, payload.password, payload.password_confirmation)
                .then(response => {

                    console.log("response.data", response.data);

                    resolve(response)
                })
                .catch(error => {
                    reject(error)
                })
        });

    },
    updateGuestData({ commit }, payload) {
        return new Promise((resolve, reject) => {
            jwt.updateGuestData(payload.name, payload.phone, payload.email, payload.guestId)
                .then(response => {
                    resolve(response);
                }).catch(error => {
                 reject(error);
            })
        })
    },
    getUserRoles({commit}) {
        return new Promise((resolve, reject) => {
            jwt.getUserRoles().then(response => {
                resolve(response)
            }).catch(error => {
                reject(error)
            })
        });
    },
    emailVerify({ commit }, payload) {
        return new Promise((resolve,reject) => {
            jwt.emailVerify(payload.email, payload.token)
                .then(response => {

                    router.push(router.currentRoute.query.to || '/')
                    // Update data in localStorage
                    localStorage.setItem("accessToken", response.data.accessToken)
                    this.tokenExpiry = new Date(response.data.exp * 1000);
                    localStorage.setItem(tokenExpiryKey, this.tokenExpiry);
                    localStorage.setItem(localStorageKey, 'true');
                    localStorage.setItem("date", response.data.date)
                    commit('UPDATE_USER_INFO', response.data.userData, {root: true})

                    resolve(response)
                })
                .catch(error => {
                    reject(error)
                })
        })
    },
    getAllUsers() {
        return new Promise((resolve,reject) => {
                jwt.getAllUsers().then(response => {
                    resolve(response)
                }).catch(error => {
                    reject(error)
                })
        })
    },
    getGuestUserData({ commit }, payload) {
        return new Promise((resolve,reject) => {
            jwt.getGuestUserData(payload.userId).then(response => {
                resolve(response)
            }).catch(error => {
                reject(error)
            })
        })
    },
    deleteUserRole({ commit }, payload) {
        return new Promise((resolve,reject) => {
            jwt.deleteUserRole(payload.roleId).then(response => {
                resolve(response)
            }).catch(error => {
                reject(error)
            })
        })
    },
    getGuestRoles({ commit }, payload) {
        return new Promise((resolve, reject) => {
            jwt.getGuestRoles(payload.userId).then(response => {
                resolve(response)
            }).catch(error => {
                reject(error)
            })
        })
    },
    getAllRoles() {
        return new Promise((resolve,reject) => {
                jwt.getAllRoles().then(response => {
                    resolve(response)
                }).catch(error => {
                    reject(error)
                })
        })
    },
    logout() {
        return new Promise((resolve,reject) => {
            jwt.logout().then(response => { resolve(response) }).catch(error => { reject(error) })
        })
    },
    fetchAccessToken({commit}) {
      return new Promise((resolve) => {
          jwt.refreshToken().then(response => {
            commit("SET_BEARER", response.data.accessToken)
            localStorage.setItem("accessToken", response.data.accessToken)
            resolve(response)
        })
      })
    }
}
