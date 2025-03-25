const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
const admin = require("firebase-admin");

const app = express();
app.use(cors());
app.use(express.json());

admin.initializeApp({
  credential: admin.credential.applicationDefault(), // or provide service account key
  databaseURL: "https://todo.lilleyjakub.com", // replace with your project URL
});
const dbAdmin = admin.firestore();

app.get("/api/test", (req, res) => {
  res.send({ message: "Hello from the server!" });
});

// Schedule a weekly task to reset habit completions every Sunday at midnight
cron.schedule("0 0 * * 0", async () => {
  console.log("Running weekly habit reset");
  try {
    const habitsSnapshot = await dbAdmin.collection("habits").get();
    const resetPromises = [];
    habitsSnapshot.forEach((doc) => {
      const habitRef = dbAdmin.collection("habits").doc(doc.id);
      resetPromises.push(habitRef.update({ completion: {} }));
    });
    await Promise.all(resetPromises);
    console.log("Weekly habit completions reset successfully");
  } catch (error) {
    console.error("Error resetting habits:", error);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
