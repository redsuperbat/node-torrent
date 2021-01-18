<template>
  <div class="grid place-items-center h-screen bg-gray-800">
    <form @submit.prevent="login" class="">
      <div class="mb-3 flex flex-col">
        <label for="usr" class="form-label text-white">Username</label>
        <InputText id="usr" placeholder="Username" v-model="username" />
      </div>
      <div class="mb-3 flex flex-col">
        <label for="pwd" class="form-label text-white">Password</label>
        <InputText
          type="password"
          id="pwd"
          placeholder="Password"
          v-model="password"
        />
      </div>
      <div class="flex justify-end">
        <Button type="submit">Login</Button>
      </div>
    </form>
  </div>
</template>

<script>
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import client from "@/api/home-client";
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
      console.log(res);
      if (res.status === 200) {
        await localStorage.setItem("token", res.data.token);
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
