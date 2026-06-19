// === Configuration ===
const API_BASE = "http://localhost:8080";

// === État global ===
let articles = [];
let categories = [];
let activeFilter = "all";
let modalArticleId = null;

// === Éléments DOM ===
const articleList = document.getElementById("articleList");
const filterBar = document.getElementById("filterBar");
const navHome = document.getElementById("navHome");
const navNew = document.getElementById("navNew");
const viewHome = document.getElementById("viewHome");
const viewNew = document.getElementById("viewNew");
const articleForm = document.getElementById("articleForm");
const categorieSelect = document.getElementById("categorie");
const cancelBtn = document.getElementById("cancelBtn");

const modal = document.getElementById("articleModal");
const closeModal = document.getElementById("closeModal");
const modalTitre = document.getElementById("modalTitre");
const modalCategorie = document.getElementById("modalCategorie");
const modalDate = document.getElementById("modalDate");
const modalContenu = document.getElementById("modalContenu");
const deleteArticleBtn = document.getElementById("deleteArticleBtn");

const toast = document.getElementById("toast");

// === Utilitaires ===
function showToast(message, isError = false) {
  toast.textContent = message;
  toast.style.background = isError ? "#dc2626" : "#1a1d23";
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 2800);
}

function formatDate(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  return d.toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
}

function excerpt(text, maxLen = 140) {
  if (!text) return "";
  return text.length > maxLen ? text.slice(0, maxLen).trim() + "…" : text;
}

// === Navigation entre vues ===
function showView(view) {
  if (view === "home") {
    viewHome.classList.remove("hidden");
    viewNew.classList.add("hidden");
    navHome.classList.add("active");
    navNew.classList.remove("active");
  } else {
    viewHome.classList.add("hidden");
    viewNew.classList.remove("hidden");
    navHome.classList.remove("active");
    navNew.classList.add("active");
    articleForm.reset();
  }
}

navHome.addEventListener("click", () => showView("home"));
navNew.addEventListener("click", () => showView("new"));
cancelBtn.addEventListener("click", () => showView("home"));

// === Chargement des données ===
async function loadCategories() {
  try {
    const res = await fetch(`${API_BASE}/categories`);
    if (!res.ok) throw new Error("Erreur réseau");
    categories = await res.json();
    renderFilterChips();
    renderCategorieOptions();
  } catch (err) {
    showToast("Impossible de charger les catégories", true);
    console.error(err);
  }
}

async function loadArticles() {
  articleList.innerHTML = `<p class="loading">Chargement des articles...</p>`;
  try {
    const res = await fetch(`${API_BASE}/articles`);
    if (!res.ok) throw new Error("Erreur réseau");
    articles = await res.json();
    renderArticles();
  } catch (err) {
    articleList.innerHTML = `<p class="empty-state">Impossible de charger les articles. Vérifiez que l'API tourne sur ${API_BASE}.</p>`;
    console.error(err);
  }
}

// === Rendu ===
function renderFilterChips() {
  filterBar.innerHTML = `<button class="filter-chip ${activeFilter === "all" ? "active" : ""}" data-cat="all">Toutes</button>`;
  categories.forEach(cat => {
    const chip = document.createElement("button");
    chip.className = `filter-chip ${activeFilter === String(cat.id) ? "active" : ""}`;
    chip.dataset.cat = cat.id;
    chip.textContent = cat.libelle;
    filterBar.appendChild(chip);
  });

  filterBar.querySelectorAll(".filter-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      activeFilter = chip.dataset.cat;
      renderFilterChips();
      renderArticles();
    });
  });
}

function renderCategorieOptions() {
  categorieSelect.innerHTML = `<option value="" disabled selected>Choisir une catégorie</option>`;
  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat.id;
    opt.textContent = cat.libelle;
    categorieSelect.appendChild(opt);
  });
}

function renderArticles() {
  const filtered = activeFilter === "all"
    ? articles
    : articles.filter(a => a.categorie && String(a.categorie.id) === activeFilter);

  if (filtered.length === 0) {
    articleList.innerHTML = `<p class="empty-state">Aucun article dans cette catégorie.</p>`;
    return;
  }

  articleList.innerHTML = "";
  filtered
    .slice()
    .sort((a, b) => new Date(b.dateCreation) - new Date(a.dateCreation))
    .forEach(article => {
      const card = document.createElement("div");
      card.className = "article-card";
      card.innerHTML = `
        <span class="badge">${article.categorie ? article.categorie.libelle : "Sans catégorie"}</span>
        <h3>${escapeHtml(article.titre)}</h3>
        <p>${escapeHtml(excerpt(article.contenu))}</p>
        <span class="article-date">${formatDate(article.dateCreation)}</span>
      `;
      card.addEventListener("click", () => openModal(article));
      articleList.appendChild(card);
    });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
}

// === Modal détail / suppression ===
function openModal(article) {
  modalArticleId = article.id;
  modalTitre.textContent = article.titre;
  modalCategorie.textContent = article.categorie ? article.categorie.libelle : "Sans catégorie";
  modalDate.textContent = `Publié le ${formatDate(article.dateCreation)}`;
  modalContenu.textContent = article.contenu;
  modal.classList.remove("hidden");
}

function closeModalFn() {
  modal.classList.add("hidden");
  modalArticleId = null;
}

closeModal.addEventListener("click", closeModalFn);
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModalFn();
});

deleteArticleBtn.addEventListener("click", async () => {
  if (!modalArticleId) return;
  if (!confirm("Supprimer définitivement cet article ?")) return;

  try {
    const res = await fetch(`${API_BASE}/articles/${modalArticleId}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Erreur suppression");
    showToast("Article supprimé");
    closeModalFn();
    await loadArticles();
  } catch (err) {
    showToast("Erreur lors de la suppression", true);
    console.error(err);
  }
});

// === Création d'article ===
articleForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    titre: document.getElementById("titre").value.trim(),
    contenu: document.getElementById("contenu").value.trim(),
    categorie: { id: parseInt(categorieSelect.value) }
  };

  if (!payload.titre || !payload.contenu || !categorieSelect.value) {
    showToast("Merci de remplir tous les champs", true);
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/articles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Erreur création");

    showToast("Article publié !");
    showView("home");
    await loadArticles();
  } catch (err) {
    showToast("Erreur lors de la création de l'article", true);
    console.error(err);
  }
});

// === Initialisation ===
(async function init() {
  await loadCategories();
  await loadArticles();
})();
