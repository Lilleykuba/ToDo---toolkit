import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction"; // needed for dayClick

const Habits = () => {
  const [date, setDate] = useState<string | null>(null);

  const handleDateClick = (arg: any) => {
    setDate(arg.dateStr);
    const modal = document.getElementById(
      "habitModal"
    ) as HTMLDialogElement | null;
    if (modal) {
      modal.showModal();
    }
  };

  const handleAddEvent = () => {
    return;
  };

  return (
    <div className="flex flex-col w-full mt-4">
      <div className="flex flex-col items-start gap-4 w-full">
        <h2 className="text-primary text-3xl mb-3">
          Habits are a work in progress
        </h2>
        <div className="w-full">
          <FullCalendar
            plugins={[timeGridPlugin, interactionPlugin]}
            dateClick={handleDateClick}
            initialView="timeGridWeek"
            headerToolbar={{
              left: "prev,next",
              center: "title",
              right: "timeGridWeek,timeGridDay", // user can switch between the two
            }}
          />
        </div>
      </div>
      <p className="mt-4">Selected date: {date}</p>
      <dialog id="habitModal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg text-primary mb-4">Add event</h3>
          <form className="form-control flex flex-col gap-4">
            <input type="text" placeholder="Event name" className="input" />
            <input type="time" className="input" />
            <button className="btn" onClick={handleAddEvent}>
              Add
            </button>
            <div className="modal-action">
              <form method="dialog">
                {/* if there is a button in form, it will close the modal */}
                <button className="btn">Close</button>
              </form>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  );
};

export default React.memo(Habits);
