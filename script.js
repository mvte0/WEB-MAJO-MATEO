const storageKeys = {
  photos: "majo-mateo-photos",
  notes: "majo-mateo-notes",
  dates: "majo-mateo-dates"
};

const surpriseMessages = [
  "Hoy toca abrazo largo, foto bonita y algo rico para compartir.",
  "Recordatorio serio: una salida simple con la persona correcta vale muchísimo.",
  "Plan urgente: decirle algo lindo porque sí.",
  "Michi y monita dictaminaron que se necesitan más recuerdos juntos.",
  "Una cita en casa también puede ser legendaria si la hacen suya."
];

const plans = [
  { category: "Casa", title: "Noche de películas malas", text: "Elijan una película dudosa, hagan ranking de escenas absurdas y preparen snacks.", sticker: "🍿" },
  { category: "Comida", title: "Ruta de cafeterías", text: "Prueben un café o postre nuevo y elijan su favorito con notas técnicas falsas.", sticker: "☕" },
  { category: "Aire libre", title: "Picnic simple", text: "Lleven mantita, jugo, algo dulce y una playlist bonita a una plaza o parque.", sticker: "🌿" },
  { category: "Aventura", title: "Paseo sin destino", text: "Suban a un bus o caminen una zona nueva sin plan rígido y documenten el recorrido.", sticker: "🗺️" },
  { category: "Romántico", title: "Cartitas cortas", text: "Escriban tres mini cartas: una tierna, una graciosa y una para el futuro.", sticker: "💌" },
  { category: "Casa", title: "Masterchef de pareja", text: "Cocinen algo que nunca hayan intentado y den puntajes como jurado exagerado.", sticker: "🍳" },
  { category: "Comida", title: "Completo, sushi o helado", text: "Elijan un antojo y conviértanlo en salida aunque dure poco.", sticker: "🍣" },
  { category: "Aire libre", title: "Fotos de atardecer", text: "Busquen un lugar con buena luz y armen una mini sesión de fotos juntos.", sticker: "🌇" },
  { category: "Aventura", title: "Desafío de 20 lucas", text: "Salir con presupuesto fijo y ver quién inventa el mejor panorama.", sticker: "🎯" },
  { category: "Romántico", title: "Cita del recuerdo", text: "Recreen algo de su primera etapa juntos con un giro nuevo.", sticker: "💖" }
];

const galleryGrid = document.querySelector("#galleryGrid");
const notesGrid = document.querySelector("#notesGrid");
const timeline = document.querySelector("#timeline");
const planFilters = document.querySelector("#planFilters");
const plansGrid = document.querySelector("#plansGrid");
const dailyLoveNote = document.querySelector("#dailyLoveNote");
const nextDateTitle = document.querySelector("#nextDateTitle");
const nextDateCountdown = document.querySelector("#nextDateCountdown");
const randomPlanBox = document.querySelector("#randomPlanBox");

const photoInput = document.querySelector("#photoInput");
const noteForm = document.querySelector("#noteForm");
const dateForm = document.querySelector("#dateForm");
const surpriseButton = document.querySelector("#surpriseButton");
const randomPlanButton = document.querySelector("#randomPlanButton");

let activeCategory = "Todos";
let state = {
  photos: readStorage(storageKeys.photos, []),
  notes: readStorage(storageKeys.notes, seedNotes()),
  dates: readStorage(storageKeys.dates, seedDates())
};

dailyLoveNote.textContent = `“${surpriseMessages[new Date().getDate() % surpriseMessages.length]}”`;

photoInput.addEventListener("change", handlePhotoUpload);
noteForm.addEventListener("submit", handleNoteSubmit);
dateForm.addEventListener("submit", handleDateSubmit);
surpriseButton.addEventListener("click", () => {
  const randomMessage = surpriseMessages[Math.floor(Math.random() * surpriseMessages.length)];
  dailyLoveNote.textContent = `“${randomMessage}”`;
});
randomPlanButton.addEventListener("click", renderRandomPlan);

galleryGrid.addEventListener("click", handleGridActions);
notesGrid.addEventListener("click", handleGridActions);
timeline.addEventListener("click", handleGridActions);

renderFilters();
renderGallery();
renderNotes();
renderDates();
renderPlans();
renderRandomPlan();

function seedNotes() {
  return [
    {
      id: crypto.randomUUID(),
      title: "Abrir cuando falten mimos",
      message: "Recordar que ustedes dos han construido algo muy bonito y vale la pena cuidarlo siempre."
    }
  ];
}

function seedDates() {
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  return [
    {
      id: crypto.randomUUID(),
      title: "Salida bonita",
      day: formatDateInput(nextWeek),
      place: "Elegir juntos un lugar rico o un paseo simple"
    }
  ];
}

function readStorage(key, fallback) {
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }

  try {
    return JSON.parse(stored);
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function handlePhotoUpload(event) {
  const files = Array.from(event.target.files || []).slice(0, 12);
  if (!files.length) {
    return;
  }

  Promise.all(files.map(fileToDataUrl)).then((images) => {
    state.photos = [...images.map((src) => ({ id: crypto.randomUUID(), src })), ...state.photos].slice(0, 24);
    writeStorage(storageKeys.photos, state.photos);
    renderGallery();
    photoInput.value = "";
  });
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function handleNoteSubmit(event) {
  event.preventDefault();
  const formData = new FormData(noteForm);
  const title = String(formData.get("title") || "").trim();
  const message = String(formData.get("message") || "").trim();

  if (!title || !message) {
    return;
  }

  state.notes = [{ id: crypto.randomUUID(), title, message }, ...state.notes];
  writeStorage(storageKeys.notes, state.notes);
  noteForm.reset();
  renderNotes();
}

function handleDateSubmit(event) {
  event.preventDefault();
  const formData = new FormData(dateForm);
  const title = String(formData.get("title") || "").trim();
  const day = String(formData.get("day") || "").trim();
  const place = String(formData.get("place") || "").trim();

  if (!title || !day) {
    return;
  }

  state.dates = [...state.dates, { id: crypto.randomUUID(), title, day, place }].sort(compareDates);
  writeStorage(storageKeys.dates, state.dates);
  dateForm.reset();
  renderDates();
}

function handleGridActions(event) {
  const button = event.target.closest("[data-action]");
  if (!button) {
    return;
  }

  const item = button.closest("[data-id]");
  if (!item) {
    return;
  }

  const { id } = item.dataset;
  const action = button.dataset.action;

  if (action === "delete-photo") {
    state.photos = state.photos.filter((photo) => photo.id !== id);
    writeStorage(storageKeys.photos, state.photos);
    renderGallery();
  }

  if (action === "delete-note") {
    state.notes = state.notes.filter((note) => note.id !== id);
    writeStorage(storageKeys.notes, state.notes);
    renderNotes();
  }

  if (action === "delete-date") {
    state.dates = state.dates.filter((date) => date.id !== id);
    writeStorage(storageKeys.dates, state.dates);
    renderDates();
  }
}

function renderGallery() {
  galleryGrid.innerHTML = "";
  if (!state.photos.length) {
    galleryGrid.innerHTML = '<div class="empty-state">Todavía no hay fotos aquí. Súban una juntos y queda inaugurada la galería.</div>';
    return;
  }

  const template = document.querySelector("#galleryItemTemplate");
  state.photos.forEach((photo) => {
    const node = template.content.firstElementChild.cloneNode(true);
    node.dataset.id = photo.id;
    node.querySelector("img").src = photo.src;
    galleryGrid.appendChild(node);
  });
}

function renderNotes() {
  notesGrid.innerHTML = "";
  if (!state.notes.length) {
    notesGrid.innerHTML = '<div class="empty-state">No hay recuerdos escritos todavía. El primero puede ser algo simple pero muy de ustedes.</div>';
    return;
  }

  const template = document.querySelector("#noteTemplate");
  state.notes.forEach((note) => {
    const node = template.content.firstElementChild.cloneNode(true);
    node.dataset.id = note.id;
    node.querySelector("h3").textContent = note.title;
    node.querySelector("p").textContent = note.message;
    notesGrid.appendChild(node);
  });
}

function renderDates() {
  timeline.innerHTML = "";
  const orderedDates = [...state.dates].sort(compareDates);

  if (!orderedDates.length) {
    timeline.innerHTML = '<div class="empty-state">No hay citas agendadas todavía.</div>';
    nextDateTitle.textContent = "Todavía no hay citas agendadas";
    nextDateCountdown.textContent = "Agrega una fecha para verla aquí.";
    return;
  }

  const template = document.querySelector("#dateTemplate");
  orderedDates.forEach((date) => {
    const node = template.content.firstElementChild.cloneNode(true);
    node.dataset.id = date.id;
    node.querySelector(".timeline-date").textContent = formatHumanDate(date.day);
    node.querySelector("h3").textContent = date.title;
    node.querySelector("p").textContent = date.place || "Plan pendiente por definir";
    timeline.appendChild(node);
  });

  const upcoming = orderedDates.find((date) => new Date(`${date.day}T00:00:00`).getTime() >= startOfToday());
  if (upcoming) {
    const diffDays = Math.ceil((new Date(`${upcoming.day}T00:00:00`).getTime() - startOfToday()) / 86400000);
    nextDateTitle.textContent = upcoming.title;
    nextDateCountdown.textContent =
      diffDays === 0
        ? `Es hoy. Lugar: ${upcoming.place || "por definir"}.`
        : `Faltan ${diffDays} día(s). Lugar: ${upcoming.place || "por definir"}.`;
  } else {
    nextDateTitle.textContent = "No hay citas futuras";
    nextDateCountdown.textContent = "Las que aparecen ya pasaron. Toca agendar una nueva.";
  }
}

function renderFilters() {
  const categories = ["Todos", ...new Set(plans.map((plan) => plan.category))];
  planFilters.innerHTML = "";

  categories.forEach((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `pill${activeCategory === category ? " active" : ""}`;
    button.textContent = category;
    button.addEventListener("click", () => {
      activeCategory = category;
      renderFilters();
      renderPlans();
    });
    planFilters.appendChild(button);
  });
}

function renderPlans() {
  plansGrid.innerHTML = "";
  const visiblePlans = activeCategory === "Todos"
    ? plans
    : plans.filter((plan) => plan.category === activeCategory);

  visiblePlans.forEach((plan) => {
    const card = document.createElement("article");
    card.className = "plan-card";
    card.innerHTML = `
      <h3>${plan.sticker} ${plan.title}</h3>
      <p>${plan.text}</p>
      <span class="plan-tag">${plan.category}</span>
    `;
    plansGrid.appendChild(card);
  });

  document.querySelector(".bucket-list").innerHTML = `
    <h3>Wishlist de pareja</h3>
    <p>Ideas rápidas que se pueden convertir en cita cuando quieran.</p>
    <ul>
      ${visiblePlans.slice(0, 4).map((plan) => `<li>${plan.title}</li>`).join("")}
    </ul>
  `;
}

function renderRandomPlan() {
  const source = activeCategory === "Todos"
    ? plans
    : plans.filter((plan) => plan.category === activeCategory);
  const selected = source[Math.floor(Math.random() * source.length)];

  randomPlanBox.innerHTML = `
    <h3>${selected.sticker} ${selected.title}</h3>
    <p>${selected.text}</p>
  `;
}

function compareDates(a, b) {
  return new Date(`${a.day}T00:00:00`) - new Date(`${b.day}T00:00:00`);
}

function formatHumanDate(value) {
  const date = new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);
}

function formatDateInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.getTime();
}
