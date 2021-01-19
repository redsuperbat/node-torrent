<template>
  <div class="flex flex-col items-center p-2">
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
      <Button @click="setPath" :label="buttonLabel" class="w-full" />
      <div class="absolute" v-if="showPathPicker">
        <FileTree v-model="computedPath" />
      </div>
    </div>
  </div>
</template>

<script>
import FileTree from "./FileTree.vue";

import useObsFromEvent from "../hooks/useObsFromEvent";
import { map, mapTo, tap } from "rxjs/operators";
import useObservable from "../hooks/useObservable";
import useObsFromRef from "../hooks/useObsFromRef";
import useModelValue from "../hooks/useModelValue";
import { merge } from "rxjs";
export default {
  setup(props, { emit }) {
    const computedPath = useModelValue(props, emit, "path");
    const computedIsMovie = useModelValue(props, emit, "isMovie");
    const defaultBtnLabel = "Choose Path";
    const [setPath, setPath$] = useObsFromEvent();
    const onPathSelect$ = useObsFromRef(computedPath);
    const buttonLabel$ = merge(
      setPath$.pipe(mapTo(defaultBtnLabel)),
      onPathSelect$.pipe(
        map((v) => v.path),
        tap(console.log)
      )
    );
    const buttonLabel = useObservable(buttonLabel$, {
      initalState: defaultBtnLabel,
    });
    const radioBtnsDisabled = useObservable(
      buttonLabel$.pipe(map((v) => v === defaultBtnLabel))
    );
    const showPathPicker = useObservable(
      merge(setPath$.pipe(mapTo(true)), onPathSelect$.pipe(mapTo(false))),
      {
        initalState: false,
      }
    );

    return {
      computedPath,
      setPath,
      buttonLabel,
      showPathPicker,
      radioBtnsDisabled,
      computedIsMovie,
    };
  },
  props: {
    path: Object,
    isMovie: Boolean,
  },
  components: {
    FileTree,
  },
};
</script>
