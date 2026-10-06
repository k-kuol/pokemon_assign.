const API_URL = "https://pokeapi.co/api/v2/pokemon";
const PAGE_SIZE = 20;

let offset = 0;      // where the current page starts
let totalCount = 0;  // how many Pokémon the API has in total
let pokemon = [];    // details of the Pokémon on the current page

const grid = document.getElementById("grid");
const statusMessage = document.getElementById("status");
const searchInput = document.getElementById("search");
const prevButton = document.getElementById("prev");
const nextButton = document.getElementById("next");
const pageInfo = document.getElementById("page-info");

// Fetch a URL and turn the response into JSON (throws if the request fails)
async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return response.json();
}

// Keep only the fields we need from the big API response
function simplify(data) {
  return {
    id: data.id,
    name: data.name,
    image:
      data.sprites.other?.["official-artwork"]?.front_default ||
      data.sprites.front_default,
    types: data.types.map((t) => t.type.name),
    abilities: data.abilities.map((a) => a.ability.name),
    height: data.height / 10, // API gives decimetres -> metres
    weight: data.weight / 10, // API gives hectograms -> kilograms
  };
}

// Load one page: fetch the list once, then every Pokémon's details in parallel
async function loadPage() {
  prevButton.disabled = true;
  nextButton.disabled = true;
  pokemon = [];
  grid.innerHTML = "";
  statusMessage.textContent = "Loading Pokémon…";

  try {
    const list = await fetchJson(`${API_URL}?limit=${PAGE_SIZE}&offset=${offset}`);
    totalCount = list.count;

    const details = await Promise.all(list.results.map((item) => fetchJson(item.url)));
    pokemon = details.map(simplify);

    statusMessage.textContent = "";
    renderCards();
  } catch (error) {
    console.error(error);
    statusMessage.textContent =
      "Couldn't load Pokémon. Check your internet connection and refresh the page.";
  }

  updatePager();
}

function updatePager() {
  const page = Math.floor(offset / PAGE_SIZE) + 1;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  pageInfo.textContent = `Page ${page} of ${totalPages}`;
  prevButton.disabled = offset === 0;
  nextButton.disabled = totalCount === 0 || offset + PAGE_SIZE >= totalCount;
}

// Build the HTML for one card
function cardHTML(p) {
  const mainType = p.types[0];

  const typePills = p.types
    .map((type) => `<li class="type" style="--c: var(--t-${type})">${type}</li>`)
    .join("");

  const image = p.image
    ? `<img src="${p.image}" alt="${p.name}" loading="lazy">`
    : `<span class="no-image">No image</span>`;

  return `
    <article class="card" style="--type: var(--t-${mainType})">
      <span class="dex-no">#${String(p.id).padStart(4, "0")}</span>
      <div class="art">${image}</div>
      <h2 class="name">${p.name}</h2>
      <ul class="types">${typePills}</ul>
      <dl class="stats">
        <div><dt>Height</dt><dd>${p.height} m</dd></div>
        <div><dt>Weight</dt><dd>${p.weight} kg</dd></div>
      </dl>
      <button class="speak" type="button" data-id="${p.id}" aria-expanded="false">
        Introduce yourself
      </button>
      <p class="speech" hidden></p>
    </article>
  `;
}

// Show the cards that match the search box (filters data already loaded, no API call)
function renderCards() {
  if (pokemon.length === 0) return; // still loading or failed

  const query = searchInput.value.trim().toLowerCase();
  const matches = pokemon.filter((p) => p.name.includes(query));

  if (matches.length === 0) {
    grid.innerHTML = "";
    statusMessage.textContent = `No Pokémon on this page match "${searchInput.value.trim()}". Try another name or change the page.`;
    return;
  }

  statusMessage.textContent = "";
  grid.innerHTML = matches.map(cardHTML).join("");
}

// "overgrow" / "overgrow and chlorophyll" / "a, b and c"
function joinAbilities(abilities) {
  if (abilities.length === 0) return "no known abilities";
  if (abilities.length === 1) return abilities[0];
  return abilities.slice(0, -1).join(", ") + " and " + abilities[abilities.length - 1];
}

// One click listener on the whole grid handles every card's button
grid.addEventListener("click", (event) => {
  const button = event.target.closest(".speak");
  if (!button) return;

  const p = pokemon.find((item) => item.id === Number(button.dataset.id));
  const bubble = button.nextElementSibling;

  if (!bubble.hidden) {
    bubble.hidden = true;
    button.textContent = "Introduce yourself";
    button.setAttribute("aria-expanded", "false");
    return;
  }

  bubble.textContent = `I am ${p.name} and I have ${joinAbilities(p.abilities)}.`;
  bubble.hidden = false;
  button.textContent = "Hide";
  button.setAttribute("aria-expanded", "true");
});

searchInput.addEventListener("input", renderCards);

prevButton.addEventListener("click", () => {
  offset = Math.max(0, offset - PAGE_SIZE);
  window.scrollTo(0, 0);
  loadPage();
});

nextButton.addEventListener("click", () => {
  offset += PAGE_SIZE;
  window.scrollTo(0, 0);
  loadPage();
});

loadPage();
