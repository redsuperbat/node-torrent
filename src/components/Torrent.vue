<template>
  <div class="flex border-purple-300 border-b-2 flex-col">
    <div class="flex px-2 py-4 sm:p-9 justify-between items-center">
      <div class="flex justify-evenly flex-col">
        <h1>{{ torrent.name }}</h1>
        <h4 class="w-30">
          {{ parsedTorrent.progress }}% - {{ parsedTorrent.downloaded }} /
          {{ parsedTorrent.size }}
        </h4>
        <h4>{{ parsedTorrent.peers }} Peers</h4>
      </div>
      <div class="flex space-x-2">
        <Button
          icon="pi pi-play"
          @click="resume"
          class="p-button-rounded p-button-sm"
          v-if="paused"
        />
        <Button
          icon="pi pi-pause"
          @click="pause"
          class="p-button-rounded p-button-sm"
          v-else
        />
        <Button
          @click="toggleDialog"
          icon="pi pi-times"
          class="p-button-rounded p-button-sm"
        />
      </div>
    </div>
    <div class="flex justify-end space-x-4 ">
      <small>Download {{ parsedTorrent.downloadSpeed }}/s</small>
      <small>Upload {{ parsedTorrent.uploadSpeed }}/s</small>
      <small>Total uploaded {{ parsedTorrent.uploaded }}</small>
    </div>
    <ProgressBar style="height:5px;" mode="indeterminate" v-if="loading" />
  </div>
  <teleport to="body">
    <Dialog header="Ta bort datan också?" v-model:visible="dialog">
      <div class="flex space-x-4">
        <Button label="Ja" @click="remove(true)" />
        <Button label="Nej" @click="remove(false)" />
      </div>
    </Dialog>
  </teleport>
</template>

<script>
import Button from "primevue/button";

import Dialog from "primevue/dialog";
import ProgressBar from "primevue/progressbar";
import { ref } from "vue";
import { useStore } from "vuex";
import client from "../api/client";
export default {
  setup(props, { emit }) {
    const store = useStore();
    const dialog = ref(false);
    const paused = ref(false);
    const loading = ref(false);

    function formatBytes(bytes, decimals = 2) {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
    }
    const parsedTorrent = ref({
      progress: 0,
      uploadSpeed: "",
      downloadSpeed: "",
      uploaded: "",
      downloaded: "",
      peers: 0,
      size: "",
      timeRemaining: 0,
    });

    store.getters.io.on(props.torrent.infoHash, (t) => {
      const parsed = {
        progress: Math.round(t.progress * 1000) / 10,
        uploadSpeed: formatBytes(t.uploadSpeed),
        downloadSpeed: formatBytes(t.downloadSpeed),
        uploaded: formatBytes(t.uploaded),
        downloaded: formatBytes(t.downloaded),
        size: formatBytes(t.size),
        peers: t.peers,
        timeRemaining: t.timeRemaining,
      };
      parsedTorrent.value = parsed;
    });

    store.getters.io.on(`${props.torrent.infoHash}-done`, (t) => {
      const progress = Math.round(t.progress * 1000) / 10;
      const parsed = parsedTorrent.value;
      parsed.progress = progress;
      parsedTorrent.value = parsed;
      console.log("Done event recieved, pausing torrent now!");
      pause();
    });

    const pause = async () => {
      loading.value = true;
      const res = await client.patch(`/pause/${props.torrent.infoHash}`);
      if (res.status === 200) {
        paused.value = true;
      }
      loading.value = false;
    };

    const resume = async () => {
      loading.value = true;
      const res = await client.patch(`/resume/${props.torrent.infoHash}`);
      if (res.status === 200) {
        paused.value = false;
      }
      loading.value = false;
    };

    const toggleDialog = () => (dialog.value = !dialog.value);
    const remove = async (removeData) => {
      loading.value = true;
      await client.delete(`/remove/${props.torrent.infoHash}`, { removeData });
      emit("remove", props.torrent.infoHash);
      loading.value = false;
    };

    return {
      pause,
      resume,
      remove,
      paused,
      loading,
      parsedTorrent,
      dialog,
      toggleDialog,
    };
  },
  components: {
    Dialog,
    Button,
    ProgressBar,
  },
  props: {
    torrent: Object,
  },
};
</script>
