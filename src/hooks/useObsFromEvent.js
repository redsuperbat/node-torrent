import { Subject } from "rxjs";
import { onUnmounted } from "vue";

const useObsFromEvent = (cb) => {
  const subject = new Subject();
  const event = (value) => {
    subject.next(value);
  };
  const obs = subject.asObservable();
  if (cb) {
    const sub = obs.subscribe(cb);
    onUnmounted(() => sub.unsubscribe());
  }
  return [event, obs];
};

export default useObsFromEvent;
