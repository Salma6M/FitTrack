
// Supabase connection
const SUPABASE_URL = "https://afhenckyquufwifwqyct.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmaGVuY2t5cXV1ZndpZndxeWN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NzY1ODAsImV4cCI6MjA5MjQ1MjU4MH0.mavEzwEikLFyGU_goWMLV42Pg1UHDnyf306lPVMUYJo";

// Save workout to Supabase
async function saveWorkout(workout) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/workouts`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "apikey": SUPABASE_KEY,
            "Authorization": `Bearer ${SUPABASE_KEY}`
        },
        body: JSON.stringify(workout)
    });
    return response.ok;
}

// Get all workouts from Supabase
async function getWorkouts() {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/workouts?order=date.desc`, {
        headers: {
            "apikey": SUPABASE_KEY,
            "Authorization": `Bearer ${SUPABASE_KEY}`
        }
    });
    return await response.json();
}

// Delete a workout by id
async function deleteWorkout(id) {
    await fetch(`${SUPABASE_URL}/rest/v1/workouts?id=eq.${id}`, {
        method: "DELETE",
        headers: {
            "apikey": SUPABASE_KEY,
            "Authorization": `Bearer ${SUPABASE_KEY}`
        }
    });
}

// LOG PAGE - handle form submit
const workoutForm = document.getElementById("workoutForm");
if (workoutForm) {
    workoutForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const workout = {
            exercise: document.getElementById("exerciseName").value,
            sets: parseInt(document.getElementById("sets").value),
            reps: parseInt(document.getElementById("reps").value),
            duration: parseInt(document.getElementById("duration").value),
            date: document.getElementById("date").value
        };

        const success = await saveWorkout(workout);

        if (success) {
            document.getElementById("successMsg").style.display = "block";
            workoutForm.reset();
        } else {
            alert("Something went wrong. Please try again.");
        }
    });
}

// HISTORY PAGE - load and show workouts
const workoutTable = document.getElementById("workoutTable");
if (workoutTable) {
    loadHistory();
}

async function loadHistory() {
    const workouts = await getWorkouts();
    const tbody = document.getElementById("workoutBody");
    tbody.innerHTML = "";

    if (workouts.length === 0) {
        tbody.innerHTML = "<tr><td colspan='6'>No workouts yet!</td></tr>";
        return;
    }

    workouts.forEach(w => {
        const row = `
            <tr>
                <td>${w.date}</td>
                <td>${w.exercise}</td>
                <td>${w.sets}</td>
                <td>${w.reps}</td>
                <td>${w.duration} min</td>
                <td><button onclick="handleDelete(${w.id})" class="delete-btn">Delete</button></td>
            </tr>`;
        tbody.innerHTML += row;
    });
}

async function handleDelete(id) {
    await deleteWorkout(id);
    loadHistory();
}

// EXERCISES PAGE - data directly in JS
const exerciseList = document.getElementById("exerciseList");
if (exerciseList) {
    const exercises = [
        { name: "Push Up", category: "Chest", tip: "Keep your body straight and lower your chest to the ground slowly." },
        { name: "Squat", category: "Legs", tip: "Keep your back straight and push your knees outward as you go down." },
        { name: "Plank", category: "Core", tip: "Keep your hips level and breathe steadily. Hold as long as you can." },
        { name: "Pull Up", category: "Back", tip: "Grip the bar shoulder-width apart and pull until your chin is above the bar." },
        { name: "Lunges", category: "Legs", tip: "Step forward and lower your back knee close to the ground. Keep your chest up." },
        { name: "Bicep Curl", category: "Arms", tip: "Keep your elbows close to your body and curl slowly for better results." },
        { name: "Burpee", category: "Full Body", tip: "Move fast but stay controlled. Great for cardio and strength together." },
        { name: "Mountain Climber", category: "Core", tip: "Keep your hips down and drive your knees toward your chest quickly." }
    ];

    exercises.forEach(ex => {
        const card = `
            <div class="card">
                <h3>${ex.name}</h3>
                <span class="badge">${ex.category}</span>
                <p>${ex.tip}</p>
            </div>`;
        exerciseList.innerHTML += card;
    });
}