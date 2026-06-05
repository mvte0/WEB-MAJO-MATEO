const storageKeys = {
  photos: "majo-mateo-photos",
  notes: "majo-mateo-notes",
  dates: "majo-mateo-dates",
  customPlans: "majo-mateo-custom-plans"
};

const surpriseMessages = [
  "Hoy toca regaloneo, fotos lindas y un plan inventado por ustedes.",
  "Par de monos enamorados con agenda propia y recuerdos guardados.",
  "Una salida simple con la persona correcta siempre vale mucho.",
  "Majo y Mateo necesitan seguir sumando momentos bonitos.",
  "Este espacio está hecho para llenar su historia juntos."
];

const basePlans = [
  { id: "base-1", category: "Casa", title: "Maratón de series", text: "Elegir una serie nueva, apagar el mundo y pedir algo rico.", sticker: "📺" },
  { id: "base-2", category: "Comida", title: "Ruta de completos o sushi", text: "Salir solo por antojo y convertirlo en panorama.", sticker: "🍣" },
  { id: "base-3", category: "Aire libre", title: "Picnic con fotos", text: "Llevar manta, snacks y sacar muchas fotos juntos.", sticker: "🌤️" },
  { id: "base-4", category: "Aventura", title: "Paseo sin rumbo", text: "Salir a caminar o tomar locomoción sin plan fijo.", sticker: "🗺️" },
  { id: "base-5", category: "Romántico", title: "Cartas para el futuro", text: "Escribir cartas y abrirlas en una fecha importante.", sticker: "💌" },
  { id: "base-6", category: "Casa", title: "Masterchef de pareja", text: "Cocinar algo nuevo y puntuarse como jurado dramático.", sticker: "🍳" },
  { id: "base-7", category: "Comida", title: "Cafecito y postre", text: "Ir a un café nuevo y elegir el postre más absurdo.", sticker: "☕" },
  { id: "base-8", category: "Aire libre", title: "Atardecer juntos", text: "Buscar un mirador, plaza o playa para ver el atardecer.", sticker: "🌅" },
  { id: "base-9", category: "Aventura", title: "Salida con presupuesto fijo", text: "Ver quién arma el mejor panorama con plata limitada.", sticker: "🎯" },
  { id: "base-10", category: "Romántico", title: "Recrear una cita antigua", text: "Hacer una versión mejorada de una salida que ya vivieron.", sticker: "❤️" },
  { id: "base-11", category: "Casa", title: "Tarde de juegos", text: "Competencia de cartas, consola o juegos tontos con premio.", sticker: "🎮" },
  { id: "base-12", category: "Aire libre", title: "Día de bicicletas o scooters", text: "Recorrer juntos un lugar con algo de movimiento.", sticker: "🚲" }
];

let activeCategory = "Todos";
const state = {
  photos: readStorage(storageKeys.photos, []),
  notes: readStorage(storageKeys.notes, seedNotes()),
  dates: readStorage(storageKeys.dates, seedDates()),
  customPlans: readStorage(storageKeys.customPlans, [])
};

const pageRefs = {
  galleryGrid: document.querySelector("#galleryGrid"),
  notesGrid: document.querySelector("#notesGrid"),
  timeline: document.querySelector("#timeline"),
  planFilters: document.querySelector("#planFilters"),
  plansGrid: document.querySelector("#plansGrid"),
  customPlansGrid: document.querySelector("#customPlansGrid"),
  bucketListBox: document.querySelector("#bucketListBox"),
  dailyLoveNote: document.querySelector("#dailyLoveNote"),
  nextDateTitle: document.querySelector("#nextDateTitle"),
  nextDateCountdown: document.querySelector("#nextDateCountdown"),
  randomPlanBox: document.querySelector("#randomPlanBox"),
  photoInput: document.querySelector("#photoInput"),
  noteForm: document.querySelector("#noteForm"),
  dateForm: document.querySelector("#dateForm"),
  customPlanForm: document.querySelector("#customPlanForm"),
  surpriseButton: document.querySelector("#surpriseButton"),
  randomPlanButton: document.querySelector("#randomPlanButton")
};

initPage();

function initPage() {
  if (pageRefs.dailyLoveNote) {
    pageRefs.dailyLoveNote.textContent = `"${surpriseMessages[new Date().getDate() % surpriseMessages.length]}"`;
  }

  if (pageRefs.photoInput) {
    pageRefs.photoInput.addEventListener("change", handlePhotoUpload);
    pageRefs.galleryGrid.addEventListener("click", handleGridActions);
    renderGallery();
  }

  if (pageRefs.noteForm) {
    pageRefs.noteForm.addEventListener("submit", handleNoteSubmit);
    pageRefs.notesGrid.addEventListener("click", handleGridActions);
    renderNotes();
  }

  if (pageRefs.dateForm) {
    pageRefs.dateForm.addEventListener("submit", handleDateSubmit);
    pageRefs.timeline.addEventListener("click", handleGridActions);
    renderDates();
  }

  if (pageRefs.surpriseButton) {
    pageRefs.surpriseButton.addEventListener("click", () => {
      const randomMessage = surpriseMessages[Math.floor(Math.random() * surpriseMessages.length)];
      pageRefs.dailyLoveNote.textContent = `"${randomMessage}"`;
    });
  }

  if (pageRefs.randomPlanButton) {
    pageRefs.randomPlanButton.addEventListener("click", renderRandomPlan);
  }

  if (pageRefs.customPlanForm) {
    pageRefs.customPlanForm.addEventListener("submit", handleCustomPlanSubmit);
    pageRefs.customPlansGrid.addEventListener("click", handleGridActions);
  }

  if (pageRefs.planFilters) {
    renderFilters();
    renderPlans();
    renderRandomPlan();
    renderCustomPlans();
  }
}

function seedNotes() {
  return [
    {
      id: crypto.randomUUID(),
      title: "Para seguir llenando",
      message: "Esta página es para guardar su historia, sus tallas internas y sus planes bonitos."
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
      place: "Elegir juntos algo rico o un paseo simple"
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
    pageRefs.photoInput.value = "";
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
  const formData = new FormData(pageRefs.noteForm);
  const title = String(formData.get("title") || "").trim();
  const message = String(formData.get("message") || "").trim();

  if (!title || !message) {
    return;
  }

  state.notes = [{ id: crypto.randomUUID(), title, message }, ...state.notes];
  writeStorage(storageKeys.notes, state.notes);
  pageRefs.noteForm.reset();
  renderNotes();
}

function handleDateSubmit(event) {
  event.preventDefault();
  const formData = new FormData(pageRefs.dateForm);
  const title = String(formData.get("title") || "").trim();
  const day = String(formData.get("day") || "").trim();
  const place = String(formData.get("place") || "").trim();

  if (!title || !day) {
    return;
  }

  state.dates = [...state.dates, { id: crypto.randomUUID(), title, day, place }].sort(compareDates);
  writeStorage(storageKeys.dates, state.dates);
  pageRefs.dateForm.reset();
  renderDates();
}

function handleCustomPlanSubmit(event) {
  event.preventDefault();
  const formData = new FormData(pageRefs.customPlanForm);
  const title = String(formData.get("title") || "").trim();
  const category = String(formData.get("category") || "").trim() || "Personalizado";
  const text = String(formData.get("text") || "").trim();
  const sticker = String(formData.get("sticker") || "").trim() || "💙";

  if (!title || !text) {
    return;
  }

  state.customPlans = [
    { id: crypto.randomUUID(), title, category, text, sticker },
    ...state.customPlans
  ];
  writeStorage(storageKeys.customPlans, state.customPlans);
  pageRefs.customPlanForm.reset();
  renderFilters();
  renderPlans();
  renderRandomPlan();
  renderCustomPlans();
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

  if (action === "delete-custom-plan") {
    state.customPlans = state.customPlans.filter((plan) => plan.id !== id);
    writeStorage(storageKeys.customPlans, state.customPlans);
    renderFilters();
    renderPlans();
    renderRandomPlan();
    renderCustomPlans();
  }
}

function renderGallery() {
  if (!pageRefs.galleryGrid) {
    return;
  }

  pageRefs.galleryGrid.innerHTML = "";
  if (!state.photos.length) {
    pageRefs.galleryGrid.innerHTML = '<div class="empty-state">Todavía no hay fotos aquí. Suban una juntos y queda inaugurada la galería.</div>';
    return;
  }

  const template = document.querySelector("#galleryItemTemplate");
  state.photos.forEach((photo) => {
    const node = template.content.firstElementChild.cloneNode(true);
    node.dataset.id = photo.id;
    node.querySelector("img").src = photo.src;
    pageRefs.galleryGrid.appendChild(node);
  });
}

function renderNotes() {
  if (!pageRefs.notesGrid) {
    return;
  }

  pageRefs.notesGrid.innerHTML = "";
  if (!state.notes.length) {
    pageRefs.notesGrid.innerHTML = '<div class="empty-state">No hay recuerdos escritos todavía. El primero puede ser algo simple pero muy de ustedes.</div>';
    return;
  }

  const template = document.querySelector("#noteTemplate");
  state.notes.forEach((note) => {
    const node = template.content.firstElementChild.cloneNode(true);
    node.dataset.id = note.id;
    node.querySelector("h3").textContent = note.title;
    node.querySelector("p").textContent = note.message;
    pageRefs.notesGrid.appendChild(node);
  });
}

function renderDates() {
  if (!pageRefs.timeline) {
    return;
  }

  pageRefs.timeline.innerHTML = "";
  const orderedDates = [...state.dates].sort(compareDates);

  if (!orderedDates.length) {
    pageRefs.timeline.innerHTML = '<div class="empty-state">No hay citas agendadas todavía.</div>';
    pageRefs.nextDateTitle.textContent = "Todavía no hay citas agendadas";
    pageRefs.nextDateCountdown.textContent = "Agrega una fecha para verla aquí.";
    return;
  }

  const template = document.querySelector("#dateTemplate");
  orderedDates.forEach((date) => {
    const node = template.content.firstElementChild.cloneNode(true);
    node.dataset.id = date.id;
    node.querySelector(".timeline-date").textContent = formatHumanDate(date.day);
    node.querySelector("h3").textContent = date.title;
    node.querySelector("p").textContent = date.place || "Plan pendiente por definir";
    pageRefs.timeline.appendChild(node);
  });

  const upcoming = orderedDates.find((date) => new Date(`${date.day}T00:00:00`).getTime() >= startOfToday());
  if (upcoming) {
    const diffDays = Math.ceil((new Date(`${upcoming.day}T00:00:00`).getTime() - startOfToday()) / 86400000);
    pageRefs.nextDateTitle.textContent = upcoming.title;
    pageRefs.nextDateCountdown.textContent =
      diffDays === 0
        ? `Es hoy. Lugar: ${upcoming.place || "por definir"}.`
        : `Faltan ${diffDays} día(s). Lugar: ${upcoming.place || "por definir"}.`;
  } else {
    pageRefs.nextDateTitle.textContent = "No hay citas futuras";
    pageRefs.nextDateCountdown.textContent = "Las que aparecen ya pasaron. Toca agendar una nueva.";
  }
}

function renderFilters() {
  if (!pageRefs.planFilters) {
    return;
  }

  const categories = ["Todos", ...new Set(getAllPlans().map((plan) => plan.category))];
  if (!categories.includes(activeCategory)) {
    activeCategory = "Todos";
  }

  pageRefs.planFilters.innerHTML = "";
  categories.forEach((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `pill${activeCategory === category ? " active" : ""}`;
    button.textContent = category;
    button.addEventListener("click", () => {
      activeCategory = category;
      renderFilters();
      renderPlans();
      renderRandomPlan();
    });
    pageRefs.planFilters.appendChild(button);
  });
}

function renderPlans() {
  if (!pageRefs.plansGrid) {
    return;
  }

  pageRefs.plansGrid.innerHTML = "";
  const visiblePlans = getVisiblePlans();

  visiblePlans.forEach((plan) => {
    const card = document.createElement("article");
    card.className = "plan-card";
    card.innerHTML = `
      <h3>${plan.sticker} ${plan.title}</h3>
      <p>${plan.text}</p>
      <span class="plan-tag">${plan.category}</span>
    `;
    pageRefs.plansGrid.appendChild(card);
  });

  if (pageRefs.bucketListBox) {
    pageRefs.bucketListBox.innerHTML = `
      <h3>Wishlist de pareja</h3>
      <p>Ideas rápidas para convertir en salida cuando quieran.</p>
      <ul>
        ${visiblePlans.slice(0, 5).map((plan) => `<li>${plan.title}</li>`).join("")}
      </ul>
    `;
  }
}

function renderRandomPlan() {
  if (!pageRefs.randomPlanBox) {
    return;
  }

  const source = getVisiblePlans();
  const selected = source[Math.floor(Math.random() * source.length)];

  pageRefs.randomPlanBox.innerHTML = `
    <h3>${selected.sticker} ${selected.title}</h3>
    <p>${selected.text}</p>
  `;
}

function renderCustomPlans() {
  if (!pageRefs.customPlansGrid) {
    return;
  }

  pageRefs.customPlansGrid.innerHTML = "";
  if (!state.customPlans.length) {
    pageRefs.customPlansGrid.innerHTML = '<div class="empty-state">Todavía no crean un plan propio. Inventen uno juntos y aparecerá aquí.</div>';
    return;
  }

  state.customPlans.forEach((plan) => {
    const card = document.createElement("article");
    card.className = "plan-card custom-card";
    card.dataset.id = plan.id;
    card.innerHTML = `
      <button class="icon-button" type="button" data-action="delete-custom-plan" aria-label="Eliminar plan">✕</button>
      <h3>${plan.sticker} ${plan.title}</h3>
      <p>${plan.text}</p>
      <span class="plan-tag">${plan.category}</span>
    `;
    pageRefs.customPlansGrid.appendChild(card);
  });
}

function getAllPlans() {
  return [...basePlans, ...state.customPlans];
}

function getVisiblePlans() {
  const allPlans = getAllPlans();
  return activeCategory === "Todos"
    ? allPlans
    : allPlans.filter((plan) => plan.category === activeCategory);
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
