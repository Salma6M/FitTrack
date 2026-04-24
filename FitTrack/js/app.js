


const SUPABASE_URL = "https://afhenckyquufwifwqyct.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmaGVuY2t5cXV1ZndpZndxeWN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NzY1ODAsImV4cCI6MjA5MjQ1MjU4MH0.mavEzwEikLFyGU_goWMLV42Pg1UHDnyf306lPVMUYJo";


// ── AUTH HELPERS ─────────────────────────────────────────
function getCurrentUser() {
    try { return JSON.parse(localStorage.getItem("fittrack_user")) || null; }
    catch (e) { return null; }
}

function setCurrentUser(user) {
    localStorage.setItem("fittrack_user", JSON.stringify(user));
}

function logout() {
    localStorage.removeItem("fittrack_user");
    window.location.href = "login.html";
}

// ── NAVBAR ───────────────────────────────────────────────
function updateNavbar() {
    const user = getCurrentUser();
    const nav = document.querySelector("nav ul");
    if (!nav) return;
    if (user) {
        const loginLink = nav.querySelector(".nav-login");
        if (loginLink) loginLink.parentElement.remove();
        const li1 = document.createElement("li");
        li1.innerHTML = `<span class="nav-user">👤 ${user.username}</span>`;
        const li2 = document.createElement("li");
        li2.innerHTML = `<button class="logout-btn" onclick="logout()">Logout</button>`;
        nav.appendChild(li1);
        nav.appendChild(li2);
    }
}

// ── LOGIN PAGE ───────────────────────────────────────────
function showRegister() {
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("registerSection").style.display = "block";
}

function showLogin() {
    document.getElementById("registerSection").style.display = "none";
    document.getElementById("loginSection").style.display = "block";
}

// Handle Login
const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        const username = document.getElementById("loginUsername").value.trim();
        const password = document.getElementById("loginPassword").value.trim();

        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/users?username=eq.${username}&password=eq.${password}&select=*`, {
                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${SUPABASE_KEY}`
                }
            });
            const data = await res.json();
            if (data.length > 0) {
                setCurrentUser({ id: data[0].id, username: data[0].username });
                window.location.href = "index.html";
            } else {
                document.getElementById("loginError").style.display = "block";
            }
        } catch (err) {
            alert("Connection error. Please try again.");
        }
    });
}

// Handle Register
const registerForm = document.getElementById("registerForm");
if (registerForm) {
    registerForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const username = document.getElementById("regUsername").value.trim();
        const password = document.getElementById("regPassword").value.trim();

        if (!username || !password) {
            alert("Please fill in all fields.");
            return;
        }

        try {
            // Check if username already exists
            const checkRes = await fetch(`${SUPABASE_URL}/rest/v1/users?username=eq.${username}&select=id`, {
                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${SUPABASE_KEY}`
                }
            });
            const existing = await checkRes.json();

            if (existing.length > 0) {
                document.getElementById("registerError").style.display = "block";
                document.getElementById("registerSuccess").style.display = "none";
                return;
            }

            // Save new user
            const res = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${SUPABASE_KEY}`,
                    "Prefer": "return=minimal"
                },
                body: JSON.stringify({ username: username, password: password })
            });

            if (res.ok) {
                document.getElementById("registerError").style.display = "none";
                document.getElementById("registerSuccess").style.display = "block";
                document.getElementById("registerForm").reset();
            } else {
                alert("Something went wrong. Please try again.");
            }
        } catch (err) {
            alert("Connection error. Please try again.");
        }
    });
}

// ── SAVE WORKOUT ─────────────────────────────────────────
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

// ── GET WORKOUTS ─────────────────────────────────────────
async function getWorkouts() {
    const user = getCurrentUser();
    if (!user) return [];
    const response = await fetch(`${SUPABASE_URL}/rest/v1/workouts?user_id=eq.${user.id}&order=date.desc`, {
        headers: {
            "apikey": SUPABASE_KEY,
            "Authorization": `Bearer ${SUPABASE_KEY}`
        }
    });
    return await response.json();
}

// ── DELETE WORKOUT ───────────────────────────────────────
async function deleteWorkout(id) {
    await fetch(`${SUPABASE_URL}/rest/v1/workouts?id=eq.${id}`, {
        method: "DELETE",
        headers: {
            "apikey": SUPABASE_KEY,
            "Authorization": `Bearer ${SUPABASE_KEY}`
        }
    });
}

// ── LOG PAGE ─────────────────────────────────────────────
const workoutForm = document.getElementById("workoutForm");
if (workoutForm) {
    const user = getCurrentUser();
    if (!user) { window.location.href = "login.html"; }
    else {
        workoutForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            const workout = {
                exercise: document.getElementById("exerciseName").value,
                sets: parseInt(document.getElementById("sets").value),
                reps: parseInt(document.getElementById("reps").value),
                duration: parseInt(document.getElementById("duration").value),
                date: document.getElementById("date").value,
                user_id: user.id
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
}

// ── HISTORY PAGE ─────────────────────────────────────────
const workoutTable = document.getElementById("workoutTable");
if (workoutTable) {
    const user = getCurrentUser();
    if (!user) { window.location.href = "login.html"; }
    else { loadHistory(); }
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

// ── EXERCISES PAGE ───────────────────────────────────────
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

// ── UPDATE NAVBAR ON ALL PAGES ────────────────────────────
updateNavbar();