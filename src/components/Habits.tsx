import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction"; // needed for dayClick
import {
  collection,
  addDoc,
  query,
  getDocs,
  where,
  doc,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";

interface Habit {
  id: string;
  name: string;
  frequency: string;
  frequencyDays?: string[];
  startDate?: string;
  time: string;
  color: string;
  description: string;
  completion?: { [day: string]: boolean };
}

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const Habits = () => {
  const [date, setDate] = useState<string | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitCompletion, setHabitCompletion] = useState<{
    [habitId: string]: { [day: string]: boolean };
  }>({});

  const [habitName, setHabitName] = useState<string>("");
  const [frequency, setFrequency] = useState<string>("daily");
  const [time, setTime] = useState<string>("");
  const [color, setColor] = useState<string>("#000000");
  const [description, setDescription] = useState<string>("");

  const [frequencyDays, setFrequencyDays] = useState<string[]>([]);

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

  useEffect(() => {
    // Initialize completion status for each habit when habits update
    const initialCompletion = { ...habitCompletion };
    habits.forEach((habit) => {
      if (!initialCompletion[habit.id]) {
        initialCompletion[habit.id] = weekDays.reduce((acc, day) => {
          acc[day] = false;
          return acc;
        }, {} as { [day: string]: boolean });
      }
    });
    setHabitCompletion(initialCompletion);
  }, [habits]);

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

    // Generate a new document reference to get a unique Firebase doc id
    const habitRef = doc(collection(db, "habits"));

    const habit: Habit = {
      id: habitRef.id, // use generated doc id
      name: habitName,
      frequency: frequency,
      frequencyDays: frequencyDays,
      startDate: new Date().toISOString(),
      time: time,
      color: color,
      description: description,
      completion: {},
    };

    try {
      // Use setDoc with the generated doc reference
      await setDoc(habitRef, {
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

  const toggleCompletion = (habitId: string, day: string) => {
    setHabitCompletion((prev) => ({
      ...prev,
      [habitId]: {
        ...prev[habitId],
        [day]: !prev[habitId][day],
      },
    }));

    const currentUser = getAuth().currentUser;
    if (!currentUser) {
      console.error("User is not logged in!");
      return;
    }

    // Update habit completion status in Firestore
    const habitRef = doc(db, "habits", habitId);
    const habitCompletionRef = doc(habitRef, "completion", day);
    setDoc(habitCompletionRef, {
      completed: !habitCompletion[habitId][day],
      uid: currentUser.uid,
    });
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
        <div className="w-full">
          {/* Habit table replacing habit list */}
          <table className="table-auto border-collapse w-full">
            <thead>
              <tr>
                <th className="border px-4 py-2">Habits</th>
                {weekDays.map((day) => (
                  <th key={day} className="border px-4 py-2">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {habits.map((habit) => (
                <tr key={habit.id}>
                  <td className="border px-4 py-2 flex items-center gap-2">
                    {habit.name}
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: habit.color }}
                    ></div>
                  </td>
                  {weekDays.map((day) => (
                    <td key={day} className="border px-4 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={habitCompletion[habit.id]?.[day] || false}
                        onChange={() => toggleCompletion(habit.id, day)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
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
              <option value="custom">Custom</option>
            </select>
            {(frequency === "weekly" ||
              frequency === "monthly" ||
              frequency === "custom") && (
              <div className="flex gap-2 items-center justify-center">
                {weekDays.map((day) => (
                  <label key={day} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      value={day}
                      onChange={(e) =>
                        setFrequencyDays(frequencyDays.push(e.target.value))
                      }
                    />
                    {day}
                  </label>
                ))}
              </div>
            )}
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

export default Habits;
