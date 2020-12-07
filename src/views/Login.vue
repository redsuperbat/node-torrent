<template>
  <div class="grid place-items-center h-screen">
    <form @submit.prevent="login">
      <div class="mb-3 flex flex-col">
        <label for="usr" class="form-label">Användarnamn</label>
        <InputText id="usr" placeholder="Användarnamn" v-model="username" />
      </div>
      <div class="mb-3 flex flex-col">
        <label for="pwd" class="form-label">Lösenord</label>
        <InputText
          type="password"
          id="pwd"
          placeholder="Lösenord"
          v-model="password"
        />
      </div>
      <div class="flex justify-end">
        <Button type="submit">Logga in</Button>
      </div>
    </form>
  </div>
</template>

<script>
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import client from "@/api/client";
import { ref } from "vue";
import { useRouter } from "vue-router";
export default {
  setup() {
    const router = useRouter();
    const password = ref("");
    const username = ref("");
    const login = async () => {
      const payload = { password: password.value, username: username.value };
      const res = await client.post("/login", payload);
      if (res.status === 200) {
        const parsed = await res.json();
        await localStorage.setItem("token", parsed.token);
        router.replace("/");
      } else {
        alert("Login failed. Try again");
      }
    };
    return { login, password, username };
  },
  components: {
    InputText,
    Button,
  },
};
</script>
