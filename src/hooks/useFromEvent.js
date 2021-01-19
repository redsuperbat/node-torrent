import { Subject } from "rxjs";

const useFromEvent = () => {
  const subject = new Subject();
  const event = (value) => {
    subject.next(value);
  };
  return { obs: subject.asObservable(), event };
};

export default useFromEvent;
