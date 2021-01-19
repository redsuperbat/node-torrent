import { Subject } from "rxjs";
import { watch } from "vue";

const useObsFromRef = (ref) => {
  const subject = new Subject();
  watch(ref, (value) => {
    console.log("Obs from ref", value, ref);
    subject.next(value);
  });

  return subject.asObservable();
};

export default useObsFromRef;
