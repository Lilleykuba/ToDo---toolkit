import type {
  CalendarRangeProps,
  CalendarMonthProps,
  CalendarDateProps,
  CalendarMultiProps,
} from "cally";

type MapEvents<T> = {
  [K in keyof T as K extends `on${infer E}` ? `on${Lowercase<E>}` : K]: T[K];
};

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "calendar-month": MapEvents<CalendarMonthProps> &
        React.HTMLAttributes<HTMLElement>;
    }
  }
}
