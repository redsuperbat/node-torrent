<template>
  <div class="flex p-2 space-x-2">
    <div class="flex items-center space-x-2 text-white">
      <label for="rmov">Movie</label>
      <RadioButton
        id="rmov"
        :disabled="radioBtnsDisabled"
        name="Film"
        :value="true"
        v-model="computedIsMovie"
      />
      <label for="rser">Series</label>
      <RadioButton
        id="rser"
        :value="false"
        :disabled="radioBtnsDisabled"
        v-model="computedIsMovie"
        name="Serie"
      />
    </div>
    <div class="relative">
      <Button @click="setPath" class="w-full">
        <small>{{ buttonLabel }}</small>
      </Button>
      <div
        class="absolute flex flex-col bg-dark-theme rounded shadow-xl"
        v-if="showPathPicker"
      >
        <div class="flex items-center py-1 px-4 justify-between">
          <h1 class="text-white text-lg font-bold">Select custom path</h1>
          <Button
            icon="pi pi-times"
            class="p-button-rounded p-button-sm"
            @click="onPathPickerClose"
          />
        </div>
        <FileTree v-model="computedPath" />
      </div>
    </div>
  </div>
</template>

<script>
import useObsFromEvent from "../hooks/useObsFromEvent";
import { map, mapTo, startWith, tap } from "rxjs/operators";
import useObservable from "../hooks/useObservable";
import useObsFromRef from "../hooks/useObsFromRef";
import useModelValue from "../hooks/useModelValue";
import { merge } from "rxjs";
import { defineAsyncComponent } from "vue";
export default {
  setup(props, { emit }) {
    const computedPath = useModelValue(props, emit, "path");
    const computedIsMovie = useModelValue(props, emit, "isMovie");
    const defaultBtnLabel = "Choose custom path";
    const [setPath, setPath$] = useObsFromEvent();
    const onPathSelect$ = useObsFromRef(computedPath);
    const buttonLabel$ = merge(
      setPath$.pipe(mapTo(defaultBtnLabel)),
      onPathSelect$.pipe(
        map((v) => {
          if (v.path.length > 75) {
            return "..." + v.path.slice(-75);
          }
          return v.path;
        })
      )
    );

    const buttonLabel = useObservable(
      buttonLabel$.pipe(startWith(defaultBtnLabel))
    );

    const [onPathPickerClose, onPathPickerClose$] = useObsFromEvent();
    const [onClickOutside, onClickOutside$] = useObsFromEvent();
    const showPathPicker$ = merge(
      setPath$.pipe(mapTo(true)),
      onPathSelect$.pipe(mapTo(false)),
      onPathPickerClose$.pipe(mapTo(false)),
      onClickOutside$.pipe(mapTo(false))
    );
    const showPathPicker = useObservable(showPathPicker$, {
      initalState: false,
    });
    const radioBtnsDisabled = useObservable(
      merge(buttonLabel$.pipe(map((v) => v !== defaultBtnLabel))).pipe(
        tap((v) => {
          emit("update:isCustom", v);
        })
      )
    );

    return {
      computedPath,
      setPath,
      buttonLabel,
      showPathPicker,
      radioBtnsDisabled,
      computedIsMovie,
      onPathPickerClose,
      onClickOutside,
    };
  },
  props: {
    path: Object,
    isMovie: Boolean,
  },
  components: {
    FileTree: defineAsyncComponent(() => import("./FileTree.vue")),
  },
};
</script>
