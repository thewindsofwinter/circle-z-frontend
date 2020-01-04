import Vue from 'vue';
import Vuex from 'vuex';
import { version } from '../../package.json';
import userService from '../services/user';
import router from '@/router';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    version,
    profile: null,
    applications: {},
    snackbar: { snack: '' },
  },

  mutations: {
    initializeStore(state) {
      // Check if the store exists
      if (localStorage.getItem('store')) {
        const localStore = JSON.parse(localStorage.getItem('store'));

        // Check the version stored against current. If different, don't
        // load the cached version
        if (localStore.version === version) {
          this.replaceState(Object.assign(state, localStore));
        } else {
          state.version = version;
        }
      }
    },

    setProfile(state, user) {
      state.profile = user;
    },

    setApplications(state, data) {
      state.applications = {};

      for (let i = 0; i < data.length; i += 1) {
        Vue.set(state.applications, data[i].id, data[i]);
      }
    },

    logout(state) {
      state.profile = null;
    },

    loginFailure(state, error) { // eslint-disable-line no-unused-vars
      state.profile = null;
    },

    setSnack(state, snack) {
      state.snackbar.snack = snack;
    },
  },

  actions: {
    alertError({ dispatch, commit }, error) { // eslint-disable-line no-unused-vars
      if (error.response && error.response.data) commit('setSnack', error.response.data);
      else commit('setSnack', error);
    },

    alertSuccess({ dispatch, commit }, success) { // eslint-disable-line no-unused-vars
      commit('setSnack', success);
    },

    login({ dispatch, commit }, { email, password }) {
      userService.login(email, password)
        .then(
          (response) => {
            if (response.status === 200) {
              commit('setProfile', response.data);
              router.push('/');
            } else {
              commit('loginFailure', response.status);
              dispatch('alertError', response, { root: true });
            }
          },
          (error) => {
            commit('loginFailure', error);
            dispatch('alertError', error, { root: true });
          },
        );
    },

    getApplication({ dispatch, commit }, id) {
      userService.getApplication(id).then(
        (response) => {
          if (response.status === 200) {
            commit('setApplications', [response.data]);
          }
        },
        (error) => {
          dispatch('alertError', error, { root: true });
        },
      );
    },

    getApplications({ dispatch, commit }) {
      userService.getApplications().then(
        (response) => {
          if (response.status === 200) {
            commit('setApplications', response.data);
          }
        },
        (error) => {
          dispatch('alertError', error, { root: true });
        },
      );
    },

    logout({ commit }) {
      commit('logout');
    },

  },
  modules: {
  },
});

export default store;

// Subscribe to store updates
store.subscribe((mutation, state) => {
  // Store the state object as a JSON string
  localStorage.setItem('store', JSON.stringify(state));
});
