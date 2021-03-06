<template>
  <div class="flex p-4 justify-between bg-gray-800">
    <div class="flex flex-col items-start">
      <Button label="Add torrent" icon="pi pi-plus" @click="toggleDialog" />
      <div class="mt-2 flex items-center relative">
        <span class="p-input-icon-right">
          <i v-if="searchLoading" class="pi pi-spinner animate-spin"></i>
          <i
            v-else
            class="pi pi-refresh text-white cursor-pointer"
            @click="() => onHardRefresh(torrentSearchString)"
          />
          <InputText
            placeholder="Search for torrents"
            v-model="torrentSearchString"
          />
        </span>
        <PathSelector
          v-model:path="custom.dir"
          v-model:isMovie="isMovie"
          @update:isCustom="(v) => (custom.enabled = v)"
        />
        <OverlayPanel
          title="Select torrent"
          class="absolute top-full left-0 bg-white"
          v-model="showOverlay"
        >
          <div class="p-2">
            <div
              v-for="(torrent, i) in searchResults"
              :key="i"
              class="hover:bg-gray-200 p-2 flex justify-between items-center"
              @click="quickAddTorrent(torrent.magnetUri)"
            >
              <div class="flex flex-col">
                <h1 class="font-bold">{{ torrent.name }}</h1>
                <p>{{ torrent.uploaded }}</p>
                <div class="flex space-x-2">
                  <h1>
                    Seeds:
                  </h1>
                  <p>{{ torrent.seeds }}</p>
                  <h1>
                    Leech:
                  </h1>
                  <p>{{ torrent.leech }}</p>
                </div>
                <p>{{ torrent.site }}</p>
              </div>
              <h1 class="w-24 text-right">{{ torrent.size }}</h1>
            </div>
          </div>
          <!-- <table class="max-w-full">
            <tr>
              <th class="p-2" v-for="(item, i) in tableHeader" :key="i">
                {{ item.label }}
              </th>
            </tr>
            <tr
              v-for="(torrent, i) in searchResults"
              :key="i"
              class="hover:bg-gray-200"
              @click="quickAddTorrent(torrent.magnetUri)"
            >
              <td class="p-2" v-for="(item, i) in tableHeader" :key="i">
                {{ torrent[item.key] }}
              </td>
            </tr>
          </table> -->
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

      <div class="flex flex-col" v-if="custom.enabled">
        <div class="flex flex-col">
          <label for="customName" class="font-sm">
            Custom foldername (leave empty for default)
          </label>
          <InputText
            id="customName"
            aria-describedby="username2-help"
            v-model="custom.name"
          />
          <small id="username2-help" class="font-xs">
            Nice if you're downloading seasonally
          </small>
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
import Dialog from "primevue/dialog";
import Torrent from "@/components/Torrent.vue";
import PathSelector from "@/components/PathSelector.vue";
import ProgressSpinner from "primevue/progressspinner";

import homeClient from "../api/home-client";
import { useObsFromEvent, useObservable, useObsFromRef } from "use-rx-vue";
import {
  debounceTime,
  distinctUntilChanged,
  exhaustMap,
  filter,
  map,
  mapTo,
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
      dir: {},
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
      localStorage.removeItem("token");
      router.push("/login");
    };

    const removeTorrent = (infoHash) => {
      torrents.value = torrents.value.filter((t) => t.infoHash !== infoHash);
    };

    const torrentSearchString = ref("");
    const [onHardRefresh, onHardRefresh$] = useObsFromEvent();
    const searchString$ = merge(
      useObsFromRef(torrentSearchString).pipe(
        debounceTime(600),
        distinctUntilChanged(),
        filter((v) => v !== "")
      ),
      onHardRefresh$
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

    const [quickAddTorrent] = useObsFromEvent(async (magnetUri) => {
      await addNewTorrent(magnetUri);
      torrentSearchString.value = "";
    });

    const searchLoading = useObservable(searchLoading$);
    const searchResults = useObservable(searchResults$);
    const showOverlay = useObservable(
      merge(
        searchResults$.pipe(
          map(() => true),
          startWith(false)
        ),
        useObsFromRef(torrentSearchString).pipe(
          filter((v) => v === ""),
          map(() => false)
        ),
        onHardRefresh$.pipe(mapTo(false))
      )
    );

    const tableHeader = [
      { label: "Name", key: "name" },
      { label: "Uplaoded", key: "uploaded" },
      { label: "se", key: "seeds" },
      { label: "le", key: "leech" },
      { label: "Size", key: "size" },
      { label: "Site", key: "site" },
    ];

    return {
      addNewTorrent,
      torrentSearchString,
      quickAddTorrent,
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
      tableHeader,
      onHardRefresh,
    };
  },
  components: {
    Dialog,
    PathSelector,
    Torrent,
    ProgressSpinner,
    // This lazy loads the component when it is rendered
    OverlayPanel: defineAsyncComponent(() =>
      import("@/components/OverlayPanel")
    ),
  },
};
</script>
