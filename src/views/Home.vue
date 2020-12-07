<template>
  <Toolbar>
    <template #left>
      <Button label="Ny" icon="pi pi-plus" @click="toggleDialog" />
    </template>

    <template #right>
      <Button label="Logga ut" @click="logout" />
    </template>
  </Toolbar>

  <div class="flex flex-col space-y-2">
    <Torrent
      v-for="torrent in torrents"
      :key="torrent.name"
      :torrent="torrent"
      @remove="removeTorrent"
    />
  </div>
  <Dialog header="Lägg till magnetlänk" v-model:visible="dialog">
    <div class="flex flex-col">
      <InputText v-model="magnetUri" placeholder="Magnetlänk" />
      <div class="flex m-5 justify-evenly">
        <div class="flex items-center space-x-2">
          <label for="rmov">Film</label>
          <RadioButton id="rmov" name="Film" :value="true" v-model="isMovie" />
        </div>
        <div class="flex items-center space-x-2">
          <label for="rser">Serie</label>
          <RadioButton
            id="rser"
            :value="false"
            v-model="isMovie"
            name="Serie"
          />
        </div>
      </div>
      <ProgressSpinner v-if="loading" style="width:25px;height:25px" />
      <Button label="Lägg till" @click="addNewTorrent" v-else />
    </div>
  </Dialog>
</template>

<script>
import Toolbar from "primevue/toolbar";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Torrent from "@/components/Torrent.vue";
import RadioButton from "primevue/radiobutton";
import ProgressSpinner from "primevue/progressspinner";

import client from "../api/client";
import { useStore } from "vuex";
import { ref } from "vue";
import { useRouter } from "vue-router";

export default {
  name: "Home",
  setup() {
    const store = useStore();
    const router = useRouter();
    const torrents = ref([]);
    const isMovie = ref(true);
    const magnetUri = ref("");
    const dialog = ref(false);
    const loading = ref(false);
    store.dispatch("INIT_SOCKET");
    store.getters.io.on("init_torrents", (torrs) => {
      console.log(torrs);
      torrents.value = torrs;
    });
    const addNewTorrent = async () => {
      loading.value = true;
      const payload = { magnetUri: magnetUri.value, isMoive: isMovie.value };
      const res = await client.post("/torrent", payload);
      const data = await res.json();
      torrents.value.push(data);
      if (res.status !== 201) {
        alert("Something went wrong. Try again!");
      } else {
        dialog.value = false;
        magnetUri.value = "";
      }
      loading.value = false;
    };
    const toggleDialog = () => (dialog.value = !dialog.value);
    const logout = async () => {
      await localStorage.removeItem("token");
      router.push("/login");
    };
    const removeTorrent = (infoHash) => {
      torrents.value = torrents.value.filter((t) => t.infoHash !== infoHash);
    };
    return {
      addNewTorrent,
      logout,
      torrents,
      dialog,
      isMovie,
      magnetUri,
      toggleDialog,
      loading,
      removeTorrent,
    };
  },
  components: {
    Toolbar,
    Dialog,
    Button,
    Torrent,
    RadioButton,
    ProgressSpinner,

    InputText,
  },
};
</script>
