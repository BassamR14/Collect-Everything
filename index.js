const content = document.getElementById("content");

const data = {
  profile: "bla",
  search: "bla",
  movies: "bla",
  tv: "bla",
};

//Reusable function to clear main(content container)
function clearContent() {
  content.innerHTML = "";
}

//Functions to render each tab

function renderSearch() {
  content.innerHTML = "";

  const title = document.createElement("h1");
  title.innerText = "Search";

  const searchContainer = document.createElement("div");
  searchContainer.classList.add("flex-h");

  const resultContainer = document.createElement("div");

  const selectCategory = document.createElement("select");
  const categories = ["Movie", "Tv Show"];

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

  searchButton.addEventListener("click", () => {
    const query = searchInput.value;
    const type = selectCategory.value;
    handleSearch(type, query, resultContainer);
  });

  searchContainer.append(selectCategory, searchInput, searchButton);
  content.append(title, searchContainer, resultContainer);
}

//To make handleSearch Dry for movie + tv show search
function getOMDbType(category) {
  if (category === "movie") return "movie";
  if (category === "tv show") return "series";
  return "";
}

//Function to search API depending on which category is selected
async function handleSearch(type, query, container) {
  const omdbType = getOMDbType(type);
  if (!omdbType) return;

  let params = new URLSearchParams();
  params.set("apikey", "4473d6a0");
  params.set("t", query.trim());
  params.set("type", omdbType);

  let myURL = "https://www.omdbapi.com/?" + params.toString();

  try {
    const response = await axios.get(myURL);
    const responseData = response.data;

    console.log("Query:", query, "Category:", type);
    console.log("Response:", responseData);

    renderResults(container, responseData);
  } catch (error) {
    container.innerHTML = "<p>Something went wrong with the search.</p>";
    console.error(error);
  }
}

//Render Results of search
function renderResults(container, data) {
  container.innerHTML = "";

  if (data.Response === "False") {
    const error = document.createElement("p");
    error.innerText = "No results found.";
    container.append(error);
    return;
  }

  const card = document.createElement("div");
  card.classList.add("card");

  const title = document.createElement("h2");
  title.innerText = data.Title;

  const year = document.createElement("p");
  year.innerText = `Year: ${data.Year}`;

  const plot = document.createElement("p");
  plot.innerText = data.Plot;

  if (data.Poster && data.Poster !== "N/A") {
    const poster = document.createElement("img");
    poster.src = data.Poster;
    poster.alt = data.Title;
    card.append(poster);
  }

  card.append(title, year, plot);
  container.append(card);
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
