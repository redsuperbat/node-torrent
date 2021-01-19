import { computed } from "vue";

const useModelValue = (props, emit, modelValueName = "modelValue") => {
  const computedValue = computed({
    set(value) {
      emit("update:" + modelValueName, value);
    },
    get() {
      return props[modelValueName];
    },
  });
  return computedValue;
};

export default useModelValue;
