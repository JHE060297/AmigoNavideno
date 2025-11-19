// ===========================
//  CONFIGURACIÓN SUPABASE
// ===========================
const supabaseUrl = 'https://frqbqmadtfmelbhncvkk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZycWJxbWFkdGZtZWxiaG5jdmtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1MjI3MTksImV4cCI6MjA3OTA5ODcxOX0.xkU0JpZ9zIycNLuI4H6NpbUcMTF3x9ZnoHJh8-FyGyM';

const { createClient } = supabase;
const db = createClient(supabaseUrl, supabaseKey);

// ===========================
//  ELEMENTOS DEL DOM
// ===========================
const personajeSelect = document.getElementById("personajeSelect");
const editKeyInput = document.getElementById("editKeyInput");
const addPersonajeBtn = document.getElementById("addPersonajeBtn");
const board = document.getElementById("board");

let characters = []; // Lista de personajes del tablero global

// ===========================
// 1. CARGAR DICCIONARIO PERSONAJES
// ===========================
function initPersonajesSelect() {
    const dataList = document.getElementById("listaPersonajes");
    dataList.innerHTML = "";

    PERSONAJES.forEach((p) => {
        const opt = document.createElement("option");
        opt.value = p;
        dataList.appendChild(opt);
    });
}

// ===========================
// 2. CARGAR TABLERO DESDE SUPABASE
// ===========================
async function loadCharacters() {
    board.innerHTML = "Cargando personajes...";

    const { data, error } = await db
        .from("characters")
        .select("*")
        .order("created_at", { ascending: true });

    if (error) {
        console.error(error);
        board.innerHTML = "Error cargando datos.";
        return;
    }

    characters = data || [];
    renderBoard();
}

// ===========================
// 3. RENDER DEL TABLERO
// ===========================
function renderBoard() {
    board.innerHTML = "";

    if (!characters.length) {
        const msg = document.createElement("p");
        msg.textContent = "No hay personajes agregados aún.";
        msg.style.color = "white";
        msg.style.fontSize = "18px";
        board.appendChild(msg);
        return;
    }

    characters.forEach((char) => {
        const col = document.createElement("div");
        col.className = "column";
        col.dataset.id = char.id;

        col.innerHTML = `
      <h2>${char.name}</h2>
      ${char.edit_key ? '<div class="lock-badge">🔒</div>' : ""}

      <input class="opcion-input" type="text" placeholder="Opción 1" />
      <input class="opcion-input" type="text" placeholder="Opción 2" />
      <input class="opcion-input" type="text" placeholder="Opción 3" />

      <button class="saveBtn">Guardar opciones</button>

      <div class="opciones-list"></div>
    `;

        // Mostrar opciones existentes
        const list = col.querySelector(".opciones-list");
        if (char.options && char.options.length > 0) {
            list.innerHTML = char.options.map((o) => `<p>🎁 ${o}</p>`).join("");
        } else {
            list.innerHTML = `<p style="opacity:0.6;">Sin opciones aún</p>`;
        }

        // Evento para guardar opciones
        col.querySelector(".saveBtn").addEventListener("click", () =>
            saveOptions(char, col)
        );

        board.appendChild(col);
    });
}

// ===========================
// 4. GUARDAR OPCIONES
// ===========================
async function saveOptions(char, col) {
    const inputs = col.querySelectorAll(".opcion-input");
    const opciones = [...inputs].map((i) => i.value.trim()).filter((v) => v);

    if (opciones.length !== 3) {
        alert("Debes ingresar EXACTAMENTE 3 opciones");
        return;
    }

    if (char.edit_key) {
        const entered = prompt("Esta tarjeta tiene clave. Introdúcela:");
        if (entered !== char.edit_key) {
            alert("Clave incorrecta");
            return;
        }
    }

    const { error } = await db
        .from("characters")
        .update({ options: opciones })
        .eq("id", char.id);

    if (error) {
        alert("Error guardando opciones");
        console.error(error);
        return;
    }

    char.options = opciones;
    renderBoard();
}

// ===========================
// 5. AGREGAR PERSONAJE NUEVO
// ===========================
addPersonajeBtn.addEventListener("click", async () => {
    const personaje = personajeSelect.value;

    const exists = characters.some((c) => c.name === personaje);
    if (exists) {
        alert("Ese personaje ya está en el tablero");
        return;
    }

    const key = editKeyInput.value.trim();

    const { data, error } = await db
        .from("characters")
        .insert({
            name: personaje,
            options: [],
            edit_key: key || null,
        })
        .select()
        .single();

    if (error) {
        console.error(error);
        alert("Error creando personaje");
        return;
    }

    characters.push(data);
    editKeyInput.value = "";
    renderBoard();
});

// ===========================
// 6. INICIALIZAR APP
// ===========================
initPersonajesSelect();
loadCharacters();


// =========================
// EFECTO DE NIEVE CON CANVAS ❄️
// =========================

const canvas = document.getElementById("snowCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let flakes = [];

function createFlakes() {
    for (let i = 0; i < 120; i++) {
        flakes.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 3 + 1,
            d: Math.random() + 1
        });
    }
}

function drawFlakes() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.beginPath();

    flakes.forEach(f => {
        ctx.moveTo(f.x, f.y);
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2, true);
    });

    ctx.fill();
    moveFlakes();
}

let angle = 0;

function moveFlakes() {
    angle += 0.001;

    flakes.forEach(f => {
        f.y += Math.pow(f.d, 2) + 1;
        f.x += Math.sin(angle) * 0.5;

        if (f.y > canvas.height) {
            f.y = -10;
            f.x = Math.random() * canvas.width;
        }
    });
}

setInterval(drawFlakes, 25);
createFlakes();

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});