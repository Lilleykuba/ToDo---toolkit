import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction"; // needed for dayClick
import { collection, addDoc, query, getDocs, where } from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";

interface Habit {
  id: string;
  name: string;
  frequency: string;
  time: string;
  color: string;
  description: string;
}

const Habits = () => {
  const [date, setDate] = useState<string | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);

  const [habitName, setHabitName] = useState<string>("");
  const [frequency, setFrequency] = useState<string>("daily");
  const [time, setTime] = useState<string>("");
  const [color, setColor] = useState<string>("#000000");
  const [description, setDescription] = useState<string>("");

  const auth = getAuth();

  useEffect(() => {
    const user = auth.currentUser;

    if (user) {
      const fetchHabits = async () => {
        const q = query(collection(db, "habits"), where("uid", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const habits: Habit[] = [];
        querySnapshot.forEach((doc) => {
          habits.push(doc.data() as Habit);
        });
        setHabits(habits);
      };

      fetchHabits();
    }
  }, []);

  const handleDateClick = (arg: any) => {
    setDate(arg.dateStr);
    const modal = document.getElementById(
      "eventModal"
    ) as HTMLDialogElement | null;
    if (modal) {
      modal.showModal();
    }
  };

  const handleOpenHabitModal = (arg: any) => {
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

  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentUser = getAuth().currentUser;
    if (!currentUser) {
      console.error("User is not logged in!");
      return;
    }

    const habit: Habit = {
      name: habitName,
      frequency: frequency,
      time: time,
      color: color,
      description: description,
    };

    try {
      await addDoc(collection(db, "habits"), {
        ...habit,
        uid: currentUser.uid, // changed from userId to uid to match security rule
      });

      setHabitName("");
      setFrequency("daily");
      setTime("");
      setColor("#000000");
      setDescription("");
    } catch (error) {
      console.error("Error adding habit: ", error);
    }

    const modal = document.getElementById(
      "habitModal"
    ) as HTMLDialogElement | null;
    if (modal) {
      modal.close();
    }
  };

  return (
    <div className="flex flex-col w-full mt-4">
      <div className="flex flex-col items-start gap-4 w-full">
        <button
          className="font-bold btn text-xl text-primary self-center"
          onClick={handleOpenHabitModal}
        >
          Create a Habit
        </button>
        <div className="divider"></div>
        <div>
          {/* Habit list */}
          <div className="flex flex-col gap-4">
            {habits.map((habit, index) => (
              <div
                key={habit.id}
                index={index}
                className="flex flex-col gap-2 p-4 bg-base-200 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">{habit.name}</h3>
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: habit.color }}
                  ></div>
                </div>
                <p>{habit.description}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="divider"></div>
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
      <dialog id="eventModal" className="modal">
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
      <dialog id="habitModal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-xl text-center text-primary mb-4">
            Add Habit
          </h3>
          <form className="form-control flex flex-col gap-4 mb-8">
            <input
              type="text"
              placeholder="Habit name"
              className="input"
              value={habitName}
              onChange={(e) => setHabitName(e.target.value)}
            />
            <select
              id="frequency"
              name="frequency"
              className="input"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <input
              type="time"
              placeholder="Time"
              className="input"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
            <input
              type="color"
              placeholder="Color"
              className="input w-full"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
            <input
              type="text"
              placeholder="Description"
              className="input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <button className="btn" onClick={handleAddHabit}>
              Add
            </button>
          </form>
          <div className="modal-action">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn">Close</button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default React.memo(Habits);
