<template>
  <div class="relative">
    <Button @click="setPath" :label="buttonLabel" />
    <div class="absolute" v-if="showPathPicker"></div>
  </div>
</template>

<script>
import { computed } from "vue";
import useObsFromEvent from "../hooks/useObsFromEvent";
import { map, mapTo, startWith } from "rxjs/operators";
import useObservable from "../hooks/useObservable";
export default {
  setup(props, { emit }) {
    const path = computed({
      set(value) {
        emit("update:modelValue", value);
      },
      get() {
        return props.modelValue;
      },
    });

    const [setPath, setpath$] = useObsFromEvent();
    const buttonLabel = useObservable(setPath$.pipe(mapTo("Choose Path")), {
      initalState: "Choose Path",
    });
    const showPathPicker = useObservable(setpath$.pipe(mapTo(true)), {
      initalState: false,
    });

    return { path, setPath, buttonLabel, showPathPicker };
  },
  props: {
    modelValue: String,
  },
};
</script>
