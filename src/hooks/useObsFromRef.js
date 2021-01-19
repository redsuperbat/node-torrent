import { Subject } from "rxjs";
import { watch } from "vue";

const useObsFromRef = (ref) => {
  const subject = new Subject();
  watch(ref, (value) => {
    subject.next(value);
  });

  return subject.asObservable();
};

export default useObsFromRef;
