import { onUnmounted, ref } from "vue";

const useObservable = (obs) => {
  const reference = ref();
  const sub = obs.subscribe((emittedValue) => (reference.value = emittedValue));
  onUnmounted(() => sub.unsubscribe());
  return reference;
};

export default useObservable;
