import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    name: 'Jan Kowalski',
    email: 'jan.kowalski@example.com',
  }),
  actions: {
    updateUser(name, email) {
      this.name = name;
      this.email = email;
    }
  }
});
