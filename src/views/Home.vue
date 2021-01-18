<template>
  <Toolbar>
    <template #left>
      <Button label="Add torrent" icon="pi pi-plus" @click="toggleDialog" />
      <InputText
        placeholder="Search for torrents"
        v-model="torrentSearchString"
      />
    </template>

    <template #right>
      <Button label="Logout" @click="logout" />
    </template>
  </Toolbar>

  <div class="flex flex-col space-y-2">
    <Torrent
      v-for="torrent in torrents"
      :key="torrent.infoHash"
      :torrent="torrent"
      @remove="removeTorrent"
    />
  </div>
  <Dialog header="Add magnet uri" v-model:visible="dialog">
    <div class="flex flex-col">
      <InputText v-model="magnetUri" placeholder="Magnet uri" />
      <div class="flex my-2 space-x-2">
        <div class="flex items-center space-x-2">
          <label for="rmov">Movie</label>
          <RadioButton
            id="rmov"
            :disabled="custom.enabled"
            name="Film"
            :value="true"
            v-model="isMovie"
          />
        </div>
        <div class="flex items-center space-x-2">
          <label for="rser">Series</label>
          <RadioButton
            id="rser"
            :value="false"
            :disabled="custom.enabled"
            v-model="isMovie"
            name="Serie"
          />
        </div>
        <div class="flex items-center space-x-2">
          <label for="custom">Custom</label>
          <CheckBox id="custom" :binary="true" v-model="custom.enabled" />
        </div>
      </div>

      <div class="flex flex-col" v-if="custom.enabled">
        <FileTree v-model="custom.dir" />
        <div class="flex flex-col">
          <label for="customName" class="font-sm"
            >Custom foldername (leave empty for default)</label
          >
          <InputText
            id="customName"
            aria-describedby="username2-help"
            v-model="custom.name"
          />
          <small id="username2-help" class="font-xs"
            >Nice if you're downloading seasonally</small
          >
        </div>
      </div>

      <ProgressSpinner v-if="loading" style="width:25px;height:25px" />
      <Button
        label="Add torrent"
        @click="addNewTorrent"
        v-else
        :disabled="!magnetUri"
      />
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
import CheckBox from "primevue/checkbox";
import ProgressSpinner from "primevue/progressspinner";

import homeClient from "../api/home-client";
import ytsClient from "../api/yts-client";
import { useStore } from "vuex";
import { defineAsyncComponent, reactive, ref } from "vue";
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
    const custom = reactive({
      enabled: false,
      dir: null,
      name: "",
    });
    store.dispatch("INIT_SOCKET");
    store.getters.io.on("init_torrents", (initTorrents) => {
      torrents.value = initTorrents;
    });

    const addNewTorrent = async () => {
      loading.value = true;
      const payload = {
        magnetUri: magnetUri.value,
        isMovie: isMovie.value,
        customDirPath: custom.enabled ? custom.dir.path : "",
        customName: custom.enabled ? custom.name : "",
      };

      const { data, status } = await homeClient.post("/torrent", payload);

      torrents.value.push(data);
      if (status !== 201) {
        alert("Something went wrong. Try again!");
      } else {
        dialog.value = false;
        magnetUri.value = "";
        custom.enabled = false;
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

    const torrentSearchString = ref("");
    async function searchTorrents() {
      const { data } = await ytsClient.get("/list_movies.json", {
        params: { sort_by: "seeds", order_by: "asc", limit: 10 },
      });
      console.log(data);
    }
    searchTorrents();
    return {
      addNewTorrent,
      torrentSearchString,
      logout,
      torrents,
      dialog,
      isMovie,
      magnetUri,
      toggleDialog,
      loading,
      removeTorrent,
      custom,
    };
  },
  components: {
    Toolbar,
    Dialog,
    Button,
    Torrent,
    CheckBox,
    RadioButton,
    ProgressSpinner,
    // This lazy loads the component when it is rendered
    FileTree: defineAsyncComponent(() => import("@/components/FileTree")),
    InputText,
  },
};
</script>
