<template>
  <div class="flex border-purple-300 border-b-2 flex-col">
    <div class="flex p-9 justify-evenly items-center">
      <h1>{{ torrent.name }}</h1>
      <h4>{{ flooredProgress }}%</h4>
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
        @click="remove"
        icon="pi pi-times"
        class="p-button-rounded p-button-sm"
      />
    </div>
    <div class="flex justify-end space-x-4 ml-4">
      <small>Download {{ downloadSpeed }}mb/s</small>
      <small>Upload {{ uploadSpeed }}mb/s</small>
      <small>Total uploaded {{ uploaded }}mb</small>
    </div>
    <ProgressBar style="height:5px;" mode="indeterminate" v-if="loading" />
  </div>
</template>

<script>
import Button from "primevue/button";
import ProgressBar from "primevue/progressbar";
import { computed, ref } from "vue";
import { useStore } from "vuex";
import client from "../api/client";
export default {
  setup(props) {
    const store = useStore();
    const progress = ref(0);
    const uploadSpeed = ref(0);
    const downloadSpeed = ref(0);
    const uploaded = ref(0);
    const paused = ref(false);
    const loading = ref(false);
    store.getters.io.on(props.torrent.infoHash, (torrent) => {
      console.log(torrent);
      uploadSpeed.value = Math.floor(torrent.uploadSpeed / 1000000);
      downloadSpeed.value = Math.floor(torrent.downloadSpeed / 1000000);
      uploaded.value = Math.floor(torrent.uploaded / 1000000);
      progress.value = torrent.progress;
    });

    store.getters.io.on(`${props.torrent.infoHash}-done`, () => {
      progress.value = 1;
      pause();
    });

    const flooredProgress = computed(() => Math.floor(progress.value * 100));

    const pause = async () => {
      loading.value = true;
      const res = await client.post(`/pause/${props.torrent.infoHash}`);
      if (res.status === 200) {
        paused.value = true;
      }
      loading.value = false;
    };
    const resume = async () => {
      loading.value = true;
      const res = await client.post(`/resume/${props.torrent.infoHash}`);
      if (res.status === 200) {
        paused.value = false;
      }
      loading.value = false;
    };
    const remove = async () => {
      loading.value = true;
      await client.post(`/remove/${props.torrent.infoHash}`);
      loading.value = false;
    };

    return {
      pause,
      resume,
      remove,
      paused,
      loading,
      flooredProgress,
      uploadSpeed,
      downloadSpeed,
      uploaded,
    };
  },
  components: {
    Button,
    ProgressBar,
  },
  props: {
    torrent: Object,
  },
};
</script>
