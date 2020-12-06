<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png" />
  </div>
</template>

<script>
import { io } from "socket.io-client";
export default {
  name: "Home",
  setup() {
    const socket = io("ws://localhost:3000", { transports: ["websocket"] });
    console.log(socket);
  },
};
</script>
