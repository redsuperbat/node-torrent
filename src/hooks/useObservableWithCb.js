import { onUnmounted } from "vue";

const useObservable = (obs, cb) => {
  const sub = obs.subscribe(cb);
  onUnmounted(() => sub.unsubscribe());
};

export default useObservable;
