<template>
  <div class="flex p-4 justify-between bg-gray-800">
    <div class="flex flex-col items-start">
      <Button label="Add torrent" icon="pi pi-plus" @click="toggleDialog" />
      <div class="mt-2 flex items-center relative">
        <span class="p-input-icon-right">
          <i v-if="searchLoading" class="pi pi-spin pi-spinner text-white"></i>
          <InputText
            placeholder="Search for torrents"
            v-model="torrentSearchString"
          />
        </span>

        <div class="mx-2 text-white flex items-center">
          <label for="rmov" class="mr-2">Movie</label>
          <RadioButton
            id="rmov"
            :disabled="custom.enabled"
            name="Film"
            :value="true"
            v-model="isMovie"
          />
        </div>
        <div class="flex text-white  items-center ">
          <label for="rser" class="mr-2">Series</label>
          <RadioButton
            id="rser"
            :value="false"
            :disabled="custom.enabled"
            v-model="isMovie"
            name="Serie"
          />
        </div>
        <OverlayPanel
          title="Select torrent"
          class="absolute top-full left-0 bg-white"
          v-model="showOverlay"
        >
          <table class="max-w-full">
            <tr>
              <th class="p-1">Name</th>
              <th class="p-1">Uploaded</th>
              <th class="p-1">se</th>
              <th class="p-1">le</th>
              <th class="p-1">size</th>
            </tr>
            <tr
              v-for="(torrent, i) in searchResults"
              :key="i"
              class="hover:bg-gray-200"
              @click="event(torrent.magnetUri)"
            >
              <td class="p-1">{{ torrent.name }}</td>
              <td class="p-1">{{ torrent.uploaded }}</td>
              <td class="p-1">{{ torrent.seeds }}</td>
              <td class="p-1">{{ torrent.leech }}</td>
              <td class="p-1">{{ torrent.size }}</td>
            </tr>
          </table>
        </OverlayPanel>
      </div>
    </div>

    <div class="flex flex-col justify-start h-full">
      <Button label="Logout" @click="logout" />
    </div>
  </div>

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
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Torrent from "@/components/Torrent.vue";
import RadioButton from "primevue/radiobutton";
import CheckBox from "primevue/checkbox";
import ProgressSpinner from "primevue/progressspinner";

import homeClient from "../api/home-client";
import useRefToObservable from "../hooks/useRefToObservable";
import useObservableWithRef from "../hooks/useObservableWithRef";
import useObservableWithCb from "../hooks/useObservableWithCb";
import useFromEvent from "../hooks/useFromEvent";
import {
  debounceTime,
  distinctUntilChanged,
  exhaustMap,
  filter,
  map,
  shareReplay,
  startWith,
} from "rxjs/operators";
import { merge } from "rxjs";
import { useStore } from "vuex";
import { defineAsyncComponent, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import client from "../api/home-client";
import { from } from "rxjs";

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

    const addNewTorrent = async (uri) => {
      loading.value = true;
      const payload = {
        magnetUri: uri || magnetUri.value,
        isMovie: isMovie.value,
        customDirPath: custom.enabled ? custom.dir.path : "",
        customName: custom.enabled ? custom.name : "",
      };

      const { data, status } = await homeClient.post("/torrent", {
        body: payload,
      });

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
    const searchString$ = useRefToObservable(torrentSearchString).pipe(
      debounceTime(600),
      distinctUntilChanged(),
      filter((v) => v !== "")
    );

    const searchResults$ = searchString$
      .pipe(
        exhaustMap((query) =>
          from(
            client.get("/search-torrents", {
              params: { query },
            })
          )
        )
      )
      .pipe(
        map((v) => v.data.slice(0, 20)),
        shareReplay(1)
      );
    const searchLoading$ = merge(
      searchString$.pipe(map(() => true)),
      searchResults$.pipe(map(() => false))
    );

    const { event, obs } = useFromEvent();
    useObservableWithCb(obs, (magnetUri) => {
      addNewTorrent(magnetUri);
      torrentSearchString.value = "";
    });

    const searchLoading = useObservableWithRef(searchLoading$);
    const searchResults = useObservableWithRef(searchResults$);
    const showOverlay = useObservableWithRef(
      merge(
        searchResults$.pipe(
          map(() => true),
          startWith(false)
        ),
        useRefToObservable(torrentSearchString).pipe(
          filter((v) => v === ""),
          map(() => false)
        )
      )
    );

    return {
      addNewTorrent,
      torrentSearchString,
      event,
      logout,
      torrents,
      dialog,
      isMovie,
      magnetUri,
      searchLoading,
      toggleDialog,
      loading,
      removeTorrent,
      custom,
      searchResults,
      showOverlay,
    };
  },
  components: {
    Dialog,
    Button,
    Torrent,
    CheckBox,
    RadioButton,
    ProgressSpinner,
    // This lazy loads the component when it is rendered
    FileTree: defineAsyncComponent(() => import("@/components/FileTree")),
    OverlayPanel: defineAsyncComponent(() =>
      import("@/components/OverlayPanel")
    ),
    InputText,
  },
};
</script>
