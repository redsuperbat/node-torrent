import { Subject } from "rxjs";
import { watch } from "vue";

const useRefToObservable = (ref) => {
  const subject = new Subject();
  watch(ref, (value) => {
    subject.next(value);
  });

  return subject.asObservable();
};

export default useRefToObservable;
