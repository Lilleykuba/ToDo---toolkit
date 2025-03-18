import "cally";
import { useState } from "react";

const Habits = () => {
  const [date, setDate] = useState("");

  return (
    <div className="flex flex-col w-full mt-4">
      <div className="flex flex-col items-start gap-4 w-full">
        <h2 className="text-primary text-3xl mb-3">
          Habits are a work in progress
        </h2>
        <calendar-date
          value={date}
          class="cally bg-base-100 border border-base-300 shadow-lg rounded-box"
          onchange={(event) => setDate(event.target.value)}
        >
          <svg
            aria-label="Previous"
            className="fill-current size-4"
            slot="previous"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path fill="currentColor" d="M15.75 19.5 8.25 12l7.5-7.5"></path>
          </svg>
          <svg
            aria-label="Next"
            className="fill-current size-4"
            slot="next"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path fill="currentColor" d="m8.25 4.5 7.5 7.5-7.5 7.5"></path>
          </svg>
          <calendar-month></calendar-month>
        </calendar-date>
      </div>
      <p className="mt-4">Selected date: {date}</p>
    </div>
  );
};

export default Habits;
