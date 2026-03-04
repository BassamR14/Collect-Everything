const content = document.getElementById("content");

const data = {
  profile: "bla",
  search: "bla",
  movies: "bla",
  tv: "bla",
};

//Function to clear main(content container)
function clearContent() {
  content.innerHTML = "";
}

//Functions to render each tab

function renderSearch() {
  clearContent();

  const title = document.createElement("h1");
  title.innerText = "Search";

  const searchContainer = document.createElement("div");
  searchContainer.classList.add("flex-h");

  const resultContainer = document.createElement("div");
  resultContainer.classList.add("result-container");

  const selectCategory = document.createElement("select");
  const categories = ["Movie", "Tv Show"];

  const placeholder = document.createElement("option");
  placeholder.innerText = "Select Category";
  placeholder.value = "";
  placeholder.disabled = true;
  placeholder.selected = true;

  selectCategory.append(placeholder);

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.innerText = category;
    option.value = category.toLowerCase();
    selectCategory.append(option);
  });

  const searchInput = document.createElement("input");
  searchInput.type = "text";

  const searchButton = document.createElement("button");
  searchButton.innerText = "Search";

  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      const query = searchInput.value;
      const type = selectCategory.value;
      handleSearch(type, query, resultContainer);
    }
  });

  searchButton.addEventListener("click", () => {
    const query = searchInput.value;
    const type = selectCategory.value;
    handleSearch(type, query, resultContainer);
  });

  searchContainer.append(selectCategory, searchInput, searchButton);
  content.append(title, searchContainer, resultContainer);
}

const categories = {
  movie: {
    search: searchOMDb,
    render: renderMovieResults,
  },
  "tv show": {
    search: searchOMDb,
    render: renderMovieResults,
  },
};

async function handleSearch(type, query, container) {
  if (!type) {
    container.innerHTML = "<p>Please select a category.</p>";
    return;
  }

  const category = categories[type];

  if (!category) {
    container.innerHTML = "<p>No handler found for this category.</p>";
    return;
  }

  try {
    const data = await category.search(query, type);

    console.log("Query:", query, "Category:", type);
    console.log("Response:", data);

    category.render(container, data);
  } catch (error) {
    container.innerHTML = "<p>Something went wrong with the search.</p>";
    console.error(error);
  }
}

//Functions for each API/Category
async function searchOMDb(query, type) {
  const omdbType = type === "movie" ? "movie" : "series";

  let params = new URLSearchParams();
  params.set("apikey", "4473d6a0");
  params.set("s", query.trim());
  params.set("type", omdbType);

  const url = "https://www.omdbapi.com/?" + params.toString();

  const response = await axios.get(url);
  const responseData = response.data;
  return responseData;
}

//Render Results of search
function renderMovieResults(container, data) {
  container.innerHTML = "";

  if (data.Response === "False") {
    const error = document.createElement("p");
    error.innerText = "No results found.";
    container.append(error);
    return;
  }

  data.Search.forEach((item) => {
    console.log(item);
    const card = document.createElement("div");
    card.classList.add("card");

    const title = document.createElement("h2");
    title.innerText = item.Title;

    const year = document.createElement("p");
    year.innerText = item.Year;

    // s param does not return plot details
    // const plot = document.createElement("p");
    // plot.innerText = item.Plot;

    if (item.Poster && item.Poster !== "N/A") {
      const poster = document.createElement("img");
      poster.src = item.Poster;
      poster.alt = item.Title;
      card.append(poster);
    }

    const statusButtons = document.createElement("div");
    statusButtons.classList.add("button-group");

    const wantToSeeBtn = document.createElement("button");
    wantToSeeBtn.innerText = "Want To Watch";

    const seenBtn = document.createElement("button");
    seenBtn.innerText = "Watched";

    const ownedBtn = document.createElement("button");
    ownedBtn.innerText = "Owned";

    statusButtons.append(wantToSeeBtn, seenBtn, ownedBtn);
    card.append(title, year, statusButtons);
    container.append(card);

    card.addEventListener("click", async () => {
      const responseData = await getSpecificItem(item.imdbID);
      renderSpecificItem(responseData);
    });
  });
}

async function getSpecificItem(imdbID) {
  let params = new URLSearchParams();
  params.set("apikey", "4473d6a0");
  params.set("i", imdbID);
  params.set("plot", "full");

  const url = "https://www.omdbapi.com/?" + params.toString();

  const response = await axios.get(url);
  const responseData = response.data;
  return responseData;
}

function renderSpecificItem(data) {
  content.style.display = "none";

  const modalContainer = document.createElement("div");
  modalContainer.classList.add("modal-container");
  const modal = document.createElement("div");
  modal.classList.add("modal");

  const backBtn = document.createElement("button");
  backBtn.classList.add("back-btn");
  backBtn.innerText = "Go Back";

  const title = document.createElement("h2");
  title.innerText = data.Title;

  const year = document.createElement("p");
  year.innerText = data.Year;

  const plot = document.createElement("p");
  plot.innerText = data.Plot;

  if (data.Poster && data.Poster !== "N/A") {
    const poster = document.createElement("img");
    poster.src = data.Poster;
    poster.alt = data.Title;
    modal.append(poster);
  }

  const statusButtons = document.createElement("div");
  statusButtons.classList.add("button-group");

  const wantToSeeBtn = document.createElement("button");
  wantToSeeBtn.innerText = "Want To Watch";

  const seenBtn = document.createElement("button");
  seenBtn.innerText = "Watched";

  const ownedBtn = document.createElement("button");
  ownedBtn.innerText = "Owned";

  statusButtons.append(wantToSeeBtn, seenBtn, ownedBtn);
  modal.append(backBtn, title, year, plot, statusButtons);
  modalContainer.append(modal);
  document.body.append(modalContainer);

  backBtn.addEventListener("click", () => {
    modalContainer.remove();
    content.style.display = "block";
  });
}

//Map for render functions
const tabHandlers = {
  search: renderSearch,
};

//Tab event listener
document.querySelectorAll(".tabs button").forEach((button) => {
  button.addEventListener("click", () => {
    //If event.target is used instead of button, it would break if there is anything inside the button such as icon
    const tab = button.dataset.tab;
    const renderFunction = tabHandlers[tab];

    if (renderFunction) {
      renderFunction();
    }
  });
});

// Load default tab
tabHandlers.search();
