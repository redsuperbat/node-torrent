import { onUnmounted, ref } from "vue";

const useObservable = (obs, { cb, initalState } = {}) => {
  const reference = ref(initalState);

  const sub = obs.subscribe((emittedValue) => {
    if (cb) {
      cb(emittedValue);
    }
    reference.value = emittedValue;
  });

  onUnmounted(() => {
    sub.unsubscribe();
  });
  return reference;
};

export default useObservable;
