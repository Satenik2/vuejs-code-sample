<template>
  <div>
    <vs-input
        v-validate="'required|email|min:3'"
        data-vv-validate-on="blur"
        name="email"
        icon-no-border
        icon="icon icon-user"
        icon-pack="feather"
        label-placeholder="Email"
        v-on:keyup.enter="loginJWT"
        v-model="email"
        class="w-full"/>
    <span class="text-danger text-sm">{{ errors.first('email') }}</span>

    <vs-input
        data-vv-validate-on="blur"
        v-validate="'required|min:6|max:10'"
        type="password"
        name="password"
        icon-no-border
        icon="icon icon-lock"
        icon-pack="feather"
        label-placeholder="Password"
        v-on:keyup.enter="loginJWT"
        v-model="password"
        class="w-full mt-6" />
    <span class="text-danger text-sm">{{ errors.first('password') }}</span>

    <div class="flex flex-wrap justify-between my-5">
        <vs-checkbox v-model="checkbox_remember_me" class="mb-3">Remember Me</vs-checkbox>
        <router-link to="/pages/forgot-password">Forgot Password?</router-link>
    </div>
    <div class="flex flex-wrap justify-between mb-3">
      <vs-button  type="border" @click="registerUser">Register</vs-button>
      <vs-button :disabled="!validateForm" @click="loginJWT">Login</vs-button>
    </div>
      <div>
          <div v-for="message in messages" class="mt-2">
              <vs-alert color="danger" icon-pack="feather" icon="icon-info" >
                  <span>{{ message }}</span>
              </vs-alert>
          </div>
          <div v-for="message in successMessages" class="mt-2">
              <vs-alert color="success" icon-pack="feather" icon="icon-check" >
                  <span>{{ message }}</span>
              </vs-alert>
          </div>

      </div>
  </div>
</template>

<script>
import { EventBus } from '../../../eventBus.js';

export default {
  data() {
    return {
      email: '',
      password: '',
      checkbox_remember_me: false,
      messages: [],
      successMessages: [],
    }
  },
  mounted() {
      EventBus.$on('success-message', clickCount => {
          this.successMessages.push(clickCount);
      });
    },
  computed: {
    validateForm() {
      return !this.errors.any() && this.email != '' && this.password != '';
    },
  },
  methods: {
    checkLogin() {
      // If user is already logged in notify
      if (this.$store.state.auth.isUserLoggedIn()) {

        // Close animation if passed as payload
        // this.$vs.loading.close()

        this.$vs.notify({
          title: 'Login Attempt',
          text: 'You are already logged in!',
          iconPack: 'feather',
          icon: 'icon-alert-circle',
          color: 'warning'
        });

        return false
      }
      return true
    },
    loginJWT() {

        this.messages = [];
        this.successMessages = [];


      // Loading
      this.$vs.loading()

      const payload = {
        checkbox_remember_me: this.checkbox_remember_me,
        userDetails: {
          email: this.email,
          password: this.password
        }
      };

      this.$store.dispatch('auth/loginJWT', payload)
        .then(response => {
            this.$vs.loading.close()
        })
        .catch(error => {
          this.$vs.loading.close()
          let validationErrors = error.response.data.message;

            if(typeof validationErrors == 'object') {
                for(let key in validationErrors) {
                    this.messages.push(validationErrors[key][0])
                }
            } else {
                this.messages.push(validationErrors)
            }


        })
    },

    registerUser() {
        console.log(this.$auth);
      if (!this.checkLogin()) return
      this.$router.push('/pages/register').catch(() => {})
    }
  }
}
</script>

