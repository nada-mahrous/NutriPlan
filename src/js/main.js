import { loadingSpinner, emptyState } from "./ui/components.js";

// !======================================================
// !----------------- DOM Elements -----------------------
// !======================================================
const navLinks = document.querySelectorAll(".nav-link");

const mealsNavBtn = document.querySelector("#meals-nav-btn");
const productsNavBtn = document.querySelector("#products-nav-btn");
const foodlogNavBtn = document.querySelector("#foodlog-nav-btn");

const loadingOverlay = document.querySelector("#app-loading-overlay");

const headerTitle = document.querySelector("#header h1");
const headerSubtitle = document.querySelector("#header p");

const mealDetailsSection = document.querySelector("#meal-details");
const productsSection = document.querySelector("#products-section");
const foodlogSection = document.querySelector("#foodlog-section");

const recipesGrid = document.querySelector("#recipes-grid");
const recipesCount = document.querySelector("#recipes-count");
const areasContainer = document.querySelector("#areas-container");

const categoriesGrid = document.querySelector("#categories-grid");
const gridViewBtn = document.querySelector("#grid-view-btn");
const listViewBtn = document.querySelector("#list-view-btn");

const searchInput = document.querySelector("#search-input");

const searchFiltersSection = document.querySelector("#search-filters-section");
const mealCategoriesSection = document.querySelector(
  "#meal-categories-section",
);
const allRecipesSection = document.querySelector("#all-recipes-section");

const logMealModal = document.querySelector("#log-meal-modal");
const logMealImage = document.querySelector("#log-meal-image");
const logMealName = document.querySelector("#log-meal-name");
const mealServingsInput = document.querySelector("#meal-servings");
const modalCalories = document.querySelector("#modal-calories");
const modalProtein = document.querySelector("#modal-protein");
const modalCarbs = document.querySelector("#modal-carbs");
const modalFat = document.querySelector("#modal-fat");
const decreaseServingsBtn = document.querySelector("#decrease-servings");
const increaseServingsBtn = document.querySelector("#increase-servings");
const cancelLogMealBtn = document.querySelector("#cancel-log-meal");
const confirmLogMealBtn = document.querySelector("#confirm-log-meal");

const quickLogMealBtn = document.querySelector("#quick-log-meal-btn");
const quickScanProductBtn = document.querySelector("#quick-scan-product-btn");

const foodLogDate = document.querySelector("#foodlog-date");

// Product Scanner Elements
const productSearchInput = document.querySelector("#product-search-input");
const searchProductBtn = document.querySelector("#search-product-btn");
const barcodeInput = document.querySelector("#barcode-input");
const lookupBarcodeBtn = document.querySelector("#lookup-barcode-btn");

const productsGrid = document.querySelector("#products-grid");
const productsCount = document.querySelector("#products-count");
const productsLoading = document.querySelector("#products-loading");
const productsEmpty = document.querySelector("#products-empty");

const nutriScoreFilters = document.querySelectorAll(".nutri-score-filter");
const productCategoryBtns = document.querySelectorAll(".product-category-btn");

// !======================================================
// !----------------- API Endpoints ----------------------
// !======================================================

const baseURL = "https://nutriplan-api.vercel.app/api";

const apiKey = "rcIge9ebGEo0FudnmZ4xLbIIeeu8yAcNAeAvs2Ic";

const API = {
  areas: `${baseURL}/meals/areas`,
  categories: `${baseURL}/meals/categories`,
  random: `${baseURL}/meals/random?count=3`,
  details: `${baseURL}/meals`,
  search: `${baseURL}/meals/search`,
  filter: `${baseURL}/meals/filter`,
  productSearch: `${baseURL}/products/search`,
  productBarcode: `${baseURL}/products/barcode`,
  productCategories: `${baseURL}/products/categories`,
  productCategory: `${baseURL}/products/category`,
};

// !======================================================
// !----------------- App Data ---------------------------
// !======================================================

let allRecipes = [];
let currentView = "grid";
let allProducts = [];
let displayedProducts = [];
let currentNutriScore = "all";

// !======================================================
// !----------------- Events -----------------------------
// !======================================================

document.addEventListener("DOMContentLoaded", async () => {
  showLoadingOverlay();

  // showMealsPage();
  handleRoute();
  window.addEventListener("hashchange", handleRoute);

  addViewToggleEvents();

  addSearchEvents();

  addRecipeCardEvents();

  addBackToMealsEvent();

  addLogMealModalEvents();

  addMealsNavEvent();
  addProductsNavEvent();
  addFoodLogNavEvent();

  addQuickFoodLogButtonsEvents();

  updateFoodLogDate();
  updateWeeklyOverview();

  updateFoodLogPage();

  addProductCardEvents();

  addNutriScoreFilterEvents();

  addProductCategoryEvents();

  await Promise.all([getRecipes(), getAreas(), addCategoryEvents()]);

  hideLoadingOverlay();
});

// !======================================================
// !----------------- Functions --------------------------
// !======================================================

//***** showLoadingOverlay() and hideLoadingOverlay()
function showLoadingOverlay() {
  if (!loadingOverlay) return;

  loadingOverlay.style.display = "flex";
  loadingOverlay.style.opacity = "1";
}

//***** hideLoadingOverlay() function
function hideLoadingOverlay() {
  if (!loadingOverlay) return;

  setTimeout(() => {
    loadingOverlay.style.opacity = "0";

    setTimeout(() => {
      loadingOverlay.style.display = "none";
    }, 300);
  }, 300);
}

//***** updateActiveNav() function
function updateActiveNav(activeLink) {
  navLinks.forEach((link) => {
    link.classList.remove("bg-emerald-50", "text-emerald-700");
    link.classList.add("text-gray-600");

    link.querySelector("span")?.classList.remove("font-semibold");
    link.querySelector("span")?.classList.add("font-medium");
  });

  activeLink.classList.remove("text-gray-600");
  activeLink.classList.add("bg-emerald-50", "text-emerald-700");

  activeLink.querySelector("span")?.classList.remove("font-medium");
  activeLink.querySelector("span")?.classList.add("font-semibold");
}

//***** hideAllMainSections() function
function hideAllMainSections() {
  searchFiltersSection.classList.add("hidden");
  mealCategoriesSection.classList.add("hidden");
  allRecipesSection.classList.add("hidden");
  mealDetailsSection.classList.add("hidden");
  productsSection.classList.add("hidden");
  foodlogSection.classList.add("hidden");
}

//***** scrollToTop() function
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

function handleRoute() {
  const route = window.location.hash.slice(1) || "meals";

  if (route === "meals") {
    showMealsPage();
  } else if (route === "products") {
    showProductsPage();
  } else if (route === "foodlog") {
    showFoodLogPage();
  } else {
    window.location.hash = "meals";
  }
}

//&&=============================================================================================================================================
//&===========================================================[getRecipes & DisplayIt]===========================================================
//&&=============================================================================================================================================

//***** getRecipes() function
async function getRecipes() {
  try {
    recipesGrid.innerHTML = loadingSpinner();

    const response = await fetch(`${API.search}?q=chicken&page=1&limit=25`);

    if (!response.ok) {
      throw new Error("Failed to fetch recipes");
    }

    const data = await response.json();

    const recipes = data.results || [];

    allRecipes = recipes.slice(0, 25);

    recipesCount.textContent = `Showing ${allRecipes.length} recipes`;

    displayRecipes(allRecipes);
  } catch (error) {
    console.error(error);
    recipesGrid.innerHTML = emptyState();
  }
}

//***** displayRecipes() function
function displayRecipes(recipes) {
  if (!recipes.length) {
    recipesGrid.innerHTML = emptyState();
    return;
  }

  recipesGrid.innerHTML = recipes
    .map(
      (recipe) => `
        <div
          class="recipe-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group ${
            currentView === "list" ? "flex h-40" : ""
          }"
          data-id="${recipe.id}"
        >
          <div class="relative overflow-hidden ${
            currentView === "list" ? "w-44 h-full shrink-0" : "h-48"
          }">
            <img
              src="${recipe.thumbnail}"
              alt="${recipe.name}"
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />

            ${
              currentView === "grid"
                ? `
                  <div class="absolute bottom-3 left-3 flex gap-2">
                    <span class="px-2 py-1 bg-white/90 text-xs font-semibold rounded-full">
                      <i class="fa-solid fa-tag text-emerald-600 mr-1"></i>
                      ${recipe.category || "Other"}
                    </span>

                    <span class="px-2 py-1 bg-white text-xs font-semibold rounded-full">
                      <i class="fa-solid fa-globe text-blue-600 mr-1"></i>
                      ${recipe.area || "unknown"}
                    </span>
                  </div>
                `
                : ""
            }
          </div>

          <div class="p-4 ${currentView === "list" ? "flex-1" : ""}">
            <h3
              class="text-base font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors line-clamp-1"
            >
              ${recipe.name}
            </h3>

            <p class="text-xs text-gray-600 mb-3 line-clamp-2">
              ${recipe.instructions?.[0] || "Delicious recipe to try!"}
            </p>

            <div class="flex items-center justify-between text-xs">
              <span class="font-semibold text-gray-900">
                <i class="fa-solid fa-utensils text-emerald-600 mr-1"></i>
                ${recipe.category || "Other"}
              </span>

              <span class="font-semibold text-gray-500">
                <i class="fa-solid fa-globe text-blue-500 mr-1"></i>
                ${recipe.area || "unknown"}
              </span>
            </div>
          </div>
        </div>
      `,
    )
    .join("");
}

//&&=============================================================================================================================================
//&=========================[getAreas"countries"" & DisplayIt & addAreaEvents & updateActiveAreaButton & getRecipesByArea]=========================
//&&=============================================================================================================================================

// ***** getAreas() function
// fetches[get] meal areas[countries names] from the API and displays them as buttons in the UI
async function getAreas() {
  try {
    areasContainer.innerHTML = loadingSpinner();

    const response = await fetch(API.areas);

    if (!response.ok) {
      throw new Error("Failed to fetch areas");
    }

    const data = await response.json();

    const areas = data.results || [];

    displayAreas(areas);
  } catch (error) {
    console.error(error);
    areasContainer.innerHTML = "";
  }
}

//***** displayAreas() function
/* responsible for display buttons[area/countries names] that are fetched from the api, makes:
static button for "All Recipes" and
dynamic buttons for each area fetched from the API, and
adds data-area attribute to them
*/
// responsible for convert the areas array to buttons and display them in the UI, and call addAreaEvents() to add click events to them
function displayAreas(areas) {
  areasContainer.innerHTML = `
    <button
      class="area-btn px-4 py-2 bg-emerald-600 text-white rounded-full font-medium text-sm whitespace-nowrap hover:bg-emerald-700 transition-all"
      data-area="all"
    >
      All Recipes
    </button>
  `;
  // += to keep the "All Recipes" button and add the rest of the buttons for each area
  /* areas.map()  --> loop over each element inside the areas array and
  we want convert each area object too HTML button
  EXAMPLE: { name: "Egyptian" } ---> <button data-area="Egyptian">Egyptian</button>
  then area.map() will return an array 
  EXAMPLE: [<button data-area="Egyptian">Egyptian</button>, <button data-area="Italian">Italian</button>, ...]
  */
  areasContainer.innerHTML += areas
    .map(
      (area) => `
        <button
          class="area-btn px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium text-sm whitespace-nowrap hover:bg-gray-200 transition-all"
          data-area="${area.name}"
        >
          ${area.name}
        </button>
      `,
    )
    /* it still array and innerHTMl needs string 
    Soo we use .join("") to convert the array to string and remove the commas between the buttons
    */
    .join("");

  /* Call addAreaEvents() :
    SOO after the buttons are created and show in UI, we can click on them to filter recipes by area
    */
  addAreaEvents();
}

// ***** addAreaEvents() function
// responsible for add click events to the area buttons, and when clicked, it will filter the recipes by the selected area
function addAreaEvents() {
  const areaButtons = document.querySelectorAll(".area-btn");

  areaButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // get the area name from the button's data-area attribute
      const area = button.dataset.area;

      // update the active button style to show which area is selected
      updateActiveAreaButton(button);

      if (area === "all") {
        getRecipes();
      } else {
        getRecipesByArea(area);
      }
    });
  });
}

// ***** getRecipesByArea() function
// responsible for fetch recipes by area from the API and display them in the UI
async function getRecipesByArea(area) {
  try {
    recipesGrid.innerHTML = loadingSpinner();

    const response = await fetch(`${API.filter}?area=${area}&page=1&limit=25`);

    if (!response.ok) {
      throw new Error("Failed to fetch recipes by area");
    }

    const data = await response.json();

    const recipes = data.results || [];

    allRecipes = recipes;

    recipesCount.textContent = `Showing ${recipes.length} recipes from ${area}`;

    displayRecipes(recipes);
  } catch (error) {
    console.error(error);
    recipesGrid.innerHTML = emptyState();
  }
}

// ***** updateActiveAreaButton() function
// remove green color from all buttons and add gray color,
// then add green color to the clicked button [it's for UI]
function updateActiveAreaButton(activeButton) {
  const areaButtons = document.querySelectorAll(".area-btn");

  areaButtons.forEach((button) => {
    button.classList.remove(
      "bg-emerald-600",
      "text-white",
      "hover:bg-emerald-700",
    );

    button.classList.add("bg-gray-100", "text-gray-700", "hover:bg-gray-200");
  });

  activeButton.classList.remove(
    "bg-gray-100",
    "text-gray-700",
    "hover:bg-gray-200",
  );

  activeButton.classList.add(
    "bg-emerald-600",
    "text-white",
    "hover:bg-emerald-700",
  );
}

//&&=============================================================================================================================================
//&=========================[addCategoryEvents & updateActiveCategoryCard & getRecipesByCategory]=========================
//&&=============================================================================================================================================

// ***** addCategoryEvents() function
function addCategoryEvents() {
  const categoryCards = document.querySelectorAll(".category-card");

  categoryCards.forEach((card) => {
    card.addEventListener("click", () => {
      const category = card.dataset.category;

      updateActiveCategoryCard(card);

      getRecipesByCategory(category);
    });
  });
}

//***** updateActiveCategoryCard() function
function updateActiveCategoryCard(activeCard) {
  const categoryCards = document.querySelectorAll(".category-card");

  categoryCards.forEach((card) => {
    card.classList.remove("ring-2", "ring-emerald-500", "scale-[1.02]");
  });

  activeCard.classList.add("ring-2", "ring-emerald-500", "scale-[1.02]");
}

//***** getRecipesByCategory() function
async function getRecipesByCategory(category) {
  try {
    recipesGrid.innerHTML = loadingSpinner();

    const response = await fetch(
      `${API.filter}?category=${category}&page=1&limit=25`,
    );

    if (!response.ok) {
      throw new Error("Failed to fetch recipes by category");
    }

    const data = await response.json();

    const recipes = (data.results || []).slice(0, 20);

    allRecipes = recipes;

    recipesCount.textContent = `Showing ${recipes.length} ${category} recipes`;

    displayRecipes(recipes);
  } catch (error) {
    console.error(error);
    recipesGrid.innerHTML = emptyState();
  }
}

function addViewToggleEvents() {
  gridViewBtn.addEventListener("click", () => {
    currentView = "grid";

    recipesGrid.className = "grid grid-cols-4 gap-5";

    gridViewBtn.classList.add("bg-white", "shadow-sm");
    listViewBtn.classList.remove("bg-white", "shadow-sm");

    displayRecipes(allRecipes);
  });

  listViewBtn.addEventListener("click", () => {
    currentView = "list";

    recipesGrid.className = "grid grid-cols-2 gap-5";

    listViewBtn.classList.add("bg-white", "shadow-sm");
    gridViewBtn.classList.remove("bg-white", "shadow-sm");

    displayRecipes(allRecipes);
  });
}

//&&=============================================================================================================================================
//&===================================================================[Real Time Search]===================================================================
//&&=============================================================================================================================================

//***** addSearchEvents() function
// responsible for hear the typing in the input and search for recipes by name, and display them in the UI
function addSearchEvents() {
  let searchTimeout;

  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimeout);

    searchTimeout = setTimeout(() => {
      const searchValue = searchInput.value.trim();

      if (searchValue === "") {
        getRecipes();
        return;
      }

      searchRecipes(searchValue);
    }, 500);
  });
}

//***** searchRecipes() function
async function searchRecipes(searchValue) {
  try {
    recipesGrid.innerHTML = loadingSpinner();

    const response = await fetch(
      `${API.search}?q=${searchValue}&page=1&limit=25`,
    );

    if (!response.ok) {
      throw new Error("Failed to search recipes");
    }

    const data = await response.json();

    const recipes = data.results || [];

    allRecipes = recipes;

    recipesCount.textContent = `Showing ${recipes.length} recipes for "${searchValue}"`;

    displayRecipes(recipes);
  } catch (error) {
    console.error(error);
    recipesGrid.innerHTML = emptyState();
  }
}

//&&=============================================================================================================================================
//&===================================================================[Recipe Details Page]===================================================================
//&&=============================================================================================================================================

// ****** addRecipeCardEvents() function
// know the user clicked on which meal
function addRecipeCardEvents() {
  recipesGrid.addEventListener("click", (e) => {
    e.preventDefault();

    const recipeCard = e.target.closest(".recipe-card");

    if (!recipeCard) return;

    const mealId = recipeCard.dataset.id || recipeCard.dataset.mealId;

    if (!mealId) return;

    getMealDetails(mealId);
  });
}

// ****** getMealDetails() function
async function getMealDetails(mealId) {
  try {
    const response = await fetch(`${API.details}/${mealId}`);

    if (!response.ok) {
      throw new Error("Failed to fetch meal details");
    }

    const data = await response.json();

    const meal = data.result;

    showMealDetailsPage();

    displayMealDetails({
      ...meal,
      nutrition: null,
    });

    const nutritionResponse = await fetch(`${baseURL}/nutrition/analyze`, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipeName: meal.name,
        ingredients: meal.ingredients.map((item) => {
          return `${item.measure || ""} ${item.ingredient || ""}`;
        }),
      }),
    });

    if (!nutritionResponse.ok) {
      throw new Error("Failed to fetch nutrition data");
    }

    const nutritionData = await nutritionResponse.json();

    displayMealDetails({
      ...meal,
      nutrition: nutritionData.data,
    });
  } catch (error) {
    console.error(error);
  }
}

// ****** showMealDetailsPage() function
function showMealDetailsPage() {
  hideAllMainSections();

  mealDetailsSection.classList.remove("hidden");

  headerTitle.textContent = "Recipe Details";
  headerSubtitle.textContent =
    "View full recipe information and nutrition facts";

  updateActiveNav(mealsNavBtn);

  scrollToTop();
}

// ****** displayMealDetails() function
function displayMealDetails(meal) {
  const tagsHTML = (meal.tags || [])
    .map(
      (tag) => `
        <span class="px-3 py-1 bg-purple-500 text-white text-sm font-semibold rounded-full">
          ${tag}
        </span>
      `,
    )
    .join("");

  const ingredientsHTML = (meal.ingredients || [])
    .map(
      (item) => `
        <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors">
          <input
            type="checkbox"
            class="ingredient-checkbox w-5 h-5 text-emerald-600 rounded border-gray-300"
          />

          <span class="text-gray-700">
            <span class="font-medium text-gray-900">${item.measure || ""}</span>
            ${item.ingredient || ""}
          </span>
        </div>
      `,
    )
    .join("");

  const instructionsHTML = (meal.instructions || [])
    .map(
      (instruction, index) => `
        <div class="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
          <div class="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
            ${index + 1}
          </div>

          <p class="text-gray-700 leading-relaxed pt-2">
            ${instruction}
          </p>
        </div>
      `,
    )
    .join("");

  const youtubeEmbedUrl = getYoutubeEmbedUrl(meal.youtube);

  const nutrition = meal.nutrition;
  const perServing = nutrition?.perServing;
  const totals = nutrition?.totals;

  mealDetailsSection.innerHTML = `
    <div class="max-w-7xl mx-auto">
      <button
        id="back-to-meals-btn"
        class="flex items-center gap-2 text-gray-600 hover:text-emerald-600 font-medium mb-6 transition-colors"
      >
        <i class="fa-solid fa-arrow-left"></i>
        <span>Back to Recipes</span>
      </button>

      <div class="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
        <div class="relative h-80 md:h-96">
          <img
            src="${meal.thumbnail}"
            alt="${meal.name}"
            class="w-full h-full object-cover"
          />

          <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

          <div class="absolute bottom-0 left-0 right-0 p-8">
            <div class="flex items-center gap-3 mb-3 flex-wrap">
              <span class="px-3 py-1 bg-emerald-500 text-white text-sm font-semibold rounded-full">
                ${meal.category || "Other"}
              </span>

              <span class="px-3 py-1 bg-blue-500 text-white text-sm font-semibold rounded-full">
                ${meal.area || "Unknown"}
              </span>

              ${tagsHTML}
            </div>

            <h1 class="text-3xl md:text-4xl font-bold text-white mb-2">
              ${meal.name}
            </h1>

            <div class="flex items-center gap-6 text-white/90 flex-wrap">
              <span class="flex items-center gap-2">
                <i class="fa-solid fa-clock"></i>
                <span>30 min</span>
              </span>

              <span class="flex items-center gap-2">
                <i class="fa-solid fa-utensils"></i>
                <span>
                  ${nutrition ? `${nutrition.servings} servings` : "Loading..."}
                </span>
              </span>

              <span class="flex items-center gap-2">
                <i class="fa-solid fa-fire"></i>
                <span>
                  ${perServing ? `${perServing.calories} cal/serving` : "Loading..."}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-wrap gap-3 mb-8">
        ${
          nutrition
            ? `
              <button
                id="log-meal-btn"
                class="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all"
                data-meal-id="${meal.id}"
                data-meal-name="${meal.name}"
                data-meal-image="${meal.thumbnail}"
                data-calories="${perServing.calories}"
                data-protein="${perServing.protein}"
                data-carbs="${Math.round(perServing.carbs)}"
                data-fat="${perServing.fat}"
              >
                <i class="fa-solid fa-clipboard-list"></i>
                <span>Log This Meal</span>
              </button>
            `
            : `
              <button
                id="log-meal-btn"
                class="flex items-center gap-2 px-6 py-3 bg-gray-300 text-gray-500 rounded-xl font-semibold cursor-not-allowed transition-all"
                data-meal-id="${meal.id}"
                disabled
              >
                <i class="fa-solid fa-spinner fa-spin"></i>
                <span>Calculating...</span>
              </button>
            `
        }
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 space-y-8">
          <div class="bg-white rounded-2xl shadow-lg p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <i class="fa-solid fa-list-check text-emerald-600"></i>
              Ingredients
              <span class="text-sm font-normal text-gray-500 ml-auto">
                ${(meal.ingredients || []).length} items
              </span>
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              ${ingredientsHTML}
            </div>
          </div>

          <div class="bg-white rounded-2xl shadow-lg p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <i class="fa-solid fa-shoe-prints text-emerald-600"></i>
              Instructions
            </h2>

            <div class="space-y-4">
              ${instructionsHTML}
            </div>
          </div>

          <div class="bg-white rounded-2xl shadow-lg p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <i class="fa-solid fa-video text-red-500"></i>
              Video Tutorial
            </h2>

            ${
              youtubeEmbedUrl
                ? `
                  <div class="relative aspect-video rounded-xl overflow-hidden bg-gray-100">
                    <iframe
                      src="${youtubeEmbedUrl}"
                      class="absolute inset-0 w-full h-full"
                      frameborder="0"
                      allowfullscreen
                    ></iframe>
                  </div>
                `
                : `
                  <div class="h-64 flex items-center justify-center bg-gray-100 rounded-xl text-gray-500">
                    No video available
                  </div>
                `
            }
          </div>
        </div>

        <div class="space-y-6">
          <div class="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
            <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <i class="fa-solid fa-chart-pie text-emerald-600"></i>
              Nutrition Facts
            </h2>

            <div id="nutrition-facts-container">
              ${
                nutrition
                  ? `
                    <p class="text-sm text-gray-500 mb-4">Per serving</p>

                    <div class="text-center py-4 mb-4 bg-linear-to-br from-emerald-50 to-teal-50 rounded-xl">
                      <p class="text-sm text-gray-600">Calories per serving</p>
                      <p class="text-4xl font-bold text-emerald-600">
                        ${perServing.calories}
                      </p>
                      <p class="text-xs text-gray-500 mt-1">
                        Total: ${totals.calories} cal
                      </p>
                    </div>

                    <div class="space-y-4">
                      <div>
                        <div class="flex items-center justify-between mb-1">
                          <span class="text-gray-700">Protein</span>
                          <span class="font-bold text-gray-900">${perServing.protein}g</span>
                        </div>
                        <div class="w-full bg-gray-100 rounded-full h-2">
                          <div class="bg-emerald-500 h-2 rounded-full" style="width: ${Math.min(100, (perServing.protein / 50) * 100)}%"></div>
                        </div>
                      </div>

                      <div>
                        <div class="flex items-center justify-between mb-1">
                          <span class="text-gray-700">Carbs</span>
                          <span class="font-bold text-gray-900">${Math.round(perServing.carbs)}g</span>
                        </div>
                        <div class="w-full bg-gray-100 rounded-full h-2">
                          <div class="bg-blue-500 h-2 rounded-full" style="width: ${Math.min(100, (perServing.carbs / 300) * 100)}%"></div>
                        </div>
                      </div>

                      <div>
                        <div class="flex items-center justify-between mb-1">
                          <span class="text-gray-700">Fat</span>
                          <span class="font-bold text-gray-900">${perServing.fat}g</span>
                        </div>
                        <div class="w-full bg-gray-100 rounded-full h-2">
                          <div class="bg-purple-500 h-2 rounded-full" style="width: ${Math.min(100, (perServing.fat / 70) * 100)}%"></div>
                        </div>
                      </div>

                      <div>
                        <div class="flex items-center justify-between mb-1">
                          <span class="text-gray-700">Fiber</span>
                          <span class="font-bold text-gray-900">${perServing.fiber}g</span>
                        </div>
                        <div class="w-full bg-gray-100 rounded-full h-2">
                          <div class="bg-orange-500 h-2 rounded-full" style="width: ${Math.min(100, (perServing.fiber / 28) * 100)}%"></div>
                        </div>
                      </div>

                      <div>
                        <div class="flex items-center justify-between mb-1">
                          <span class="text-gray-700">Sugar</span>
                          <span class="font-bold text-gray-900">${perServing.sugar}g</span>
                        </div>
                        <div class="w-full bg-gray-100 rounded-full h-2">
                          <div class="bg-pink-500 h-2 rounded-full" style="width: ${Math.min(100, (perServing.sugar / 50) * 100)}%"></div>
                        </div>
                      </div>

                      <div>
                        <div class="flex items-center justify-between mb-1">
                          <span class="text-gray-700">Saturated Fat</span>
                          <span class="font-bold text-gray-900">${perServing.saturatedFat}g</span>
                        </div>
                        <div class="w-full bg-gray-100 rounded-full h-2">
                          <div class="bg-red-500 h-2 rounded-full" style="width: ${Math.min(100, (perServing.saturatedFat / 20) * 100)}%"></div>
                        </div>
                      </div>
                    </div>

                    <div class="mt-6 pt-6 border-t border-gray-100">
                      <h3 class="text-sm font-semibold text-gray-900 mb-3">
                        Other
                      </h3>

                      <div class="grid grid-cols-2 gap-3 text-sm">
                        <div class="flex justify-between">
                          <span class="text-gray-600">Cholesterol</span>
                          <span class="font-medium">${perServing.cholesterol}mg</span>
                        </div>

                        <div class="flex justify-between">
                          <span class="text-gray-600">Sodium</span>
                          <span class="font-medium">${perServing.sodium}mg</span>
                        </div>
                      </div>
                    </div>
                  `
                  : `
                    <div class="text-center py-8">
                      <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 mb-4">
                        <i class="fa-solid fa-calculator animate-pulse text-emerald-600 text-xl"></i>
                      </div>

                      <p class="text-gray-700 font-medium mb-1">
                        Calculating Nutrition
                      </p>

                      <p class="text-sm text-gray-500">
                        Analyzing ingredients...
                      </p>

                      <div class="mt-4 flex justify-center">
                        <div class="flex space-x-1">
                          <div class="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
                          <div class="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
                          <div class="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
                        </div>
                      </div>
                    </div>
                  `
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ****** getYoutubeEmbedUrl() function
function getYoutubeEmbedUrl(youtubeUrl) {
  if (!youtubeUrl) return "";

  const videoId = youtubeUrl.split("v=")[1];

  if (!videoId) return "";

  return `https://www.youtube.com/embed/${videoId}`;
}

// ****** addBackToMealsEvent() function
function addBackToMealsEvent() {
  mealDetailsSection.addEventListener("click", (e) => {
    const backBtn = e.target.closest("#back-to-meals-btn");

    if (!backBtn) return;

    showMealsPage();
  });
}

//****** addMealsNavEvent() function
function addMealsNavEvent() {
  mealsNavBtn.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.hash = "meals";
  });
}

//***** showMealsPage() function
function showMealsPage() {
  hideAllMainSections();

  searchFiltersSection.classList.remove("hidden");
  mealCategoriesSection.classList.remove("hidden");
  allRecipesSection.classList.remove("hidden");

  headerTitle.textContent = "Meals & Recipes";
  headerSubtitle.textContent =
    "Discover delicious and nutritious recipes tailored for you";

  updateActiveNav(mealsNavBtn);
  scrollToTop();
}

//&&=============================================================================================================================================
//&===================================================================[traversing between pages]===================================================================
//&&=============================================================================================================================================

//***** showProductsPage() function
function showProductsPage() {
  hideAllMainSections();

  productsSection.classList.remove("hidden");

  headerTitle.textContent = "Product Scanner";
  headerSubtitle.textContent = "Search packaged foods by name or barcode";

  updateActiveNav(productsNavBtn);
  scrollToTop();
}

//***** showFoodLogPage() function
function showFoodLogPage() {
  hideAllMainSections();

  foodlogSection.classList.remove("hidden");

  headerTitle.textContent = "Food Log";
  headerSubtitle.textContent = "Track and monitor your daily nutrition intake";

  updateActiveNav(foodlogNavBtn);
  scrollToTop();
}

//***** updateActiveNav() function
function addProductsNavEvent() {
  productsNavBtn.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.hash = "products";
  });
}

//**** addFoodLogNavEvent() function
function addFoodLogNavEvent() {
  foodlogNavBtn.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.hash = "foodlog";
  });
}

//&&=============================================================================================================================================
//&===================================================================[Food Log Page]===================================================================
//&&=============================================================================================================================================

//***** updateFoodLogDate() function
function updateFoodLogDate() {
  const today = new Date();

  foodLogDate.textContent = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

//***** updateWeeklyOverview() function
function updateWeeklyOverview() {
  const weeklyChart = document.querySelector("#weekly-chart");

  if (!weeklyChart) return;

  const today = new Date();
  const currentDay = today.getDay();

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - currentDay);

  let daysHTML = "";

  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);

    const isToday = date.toDateString() === today.toDateString();

    const totalCalories = foodLogItems
      .filter((item) => {
        return new Date(item.date).toDateString() === date.toDateString();
      })
      .reduce((sum, item) => sum + item.calories, 0);

    const itemsCount = foodLogItems.filter((item) => {
      return new Date(item.date).toDateString() === date.toDateString();
    }).length;

    daysHTML += `
      <div
        class="week-day flex-1 text-center rounded-xl py-4 ${
          isToday ? "bg-indigo-100" : ""
        }"
      >
        <p class="text-sm text-gray-500 mb-2">
          ${date.toLocaleDateString("en-US", {
            weekday: "short",
          })}
        </p>

        <p class="text-base font-semibold text-gray-900 mb-4">
          ${date.getDate()}
        </p>

        <p class="text-2xl font-bold text-emerald-600">
          ${totalCalories}
        </p>

        <p class="text-sm text-gray-500">
          calories
        </p>

        <p class="text-xs text-gray-400 mt-1">
          ${itemsCount} item${itemsCount !== 1 ? "s" : ""}
        </p>
      </div>
    `;
  }

  weeklyChart.className =
    "bg-white rounded-xl flex items-center justify-between gap-4";

  weeklyChart.innerHTML = daysHTML;
}

//***** addQuickFoodLogButtonsEvents() function
function addQuickFoodLogButtonsEvents() {
  quickLogMealBtn.addEventListener("click", () => {
    window.location.hash = "meals";
  });

  quickScanProductBtn.addEventListener("click", () => {
    window.location.hash = "products";
  });
}
//&&=============================================================================================================================================
//&===================================================================[Log This Meal Modal]===================================================================
//&&=============================================================================================================================================

let selectedMealToLog = null;
let foodLogItems = JSON.parse(localStorage.getItem("foodLogItems")) || [];

//***** addLogMealModalEvents() function
function addLogMealModalEvents() {
  mealDetailsSection.addEventListener("click", (e) => {
    const logMealBtn = e.target.closest("#log-meal-btn");

    if (!logMealBtn) return;

    selectedMealToLog = {
      name: logMealBtn.dataset.mealName,
      image: logMealBtn.dataset.mealImage,
      calories: Number(logMealBtn.dataset.calories),
      protein: Number(logMealBtn.dataset.protein),
      carbs: Number(logMealBtn.dataset.carbs),
      fat: Number(logMealBtn.dataset.fat),
    };

    openLogMealModal(selectedMealToLog);
  });

  cancelLogMealBtn.addEventListener("click", closeLogMealModal);

  logMealModal.addEventListener("click", (e) => {
    if (e.target === logMealModal) {
      closeLogMealModal();
    }
  });

  decreaseServingsBtn.addEventListener("click", () => {
    let currentServings = Number(mealServingsInput.value);

    if (currentServings <= 0.5) return;

    mealServingsInput.value = currentServings - 0.5;
  });

  increaseServingsBtn.addEventListener("click", () => {
    let currentServings = Number(mealServingsInput.value);

    if (currentServings >= 10) return;

    mealServingsInput.value = currentServings + 0.5;
  });

  confirmLogMealBtn.addEventListener("click", () => {
    logSelectedMeal();
  });
}

//***** openLogMealModal() function
function openLogMealModal(meal) {
  logMealImage.src = meal.image;
  logMealImage.alt = meal.name;

  logMealName.textContent = meal.name;

  mealServingsInput.value = 1;

  modalCalories.textContent = meal.calories;
  modalProtein.textContent = `${meal.protein}g`;
  modalCarbs.textContent = `${meal.carbs}g`;
  modalFat.textContent = `${meal.fat}g`;

  logMealModal.classList.remove("hidden");
}

//***** closeLogMealModal() function
function closeLogMealModal() {
  logMealModal.classList.add("hidden");
}

function logSelectedMeal() {
  if (!selectedMealToLog) return;

  const servings = Number(mealServingsInput.value);

  const loggedMeal = {
    name: selectedMealToLog.name,
    image: selectedMealToLog.image,
    servings: servings,

    calories: Math.round(selectedMealToLog.calories * servings),
    protein: Math.round(selectedMealToLog.protein * servings),
    carbs: Math.round(selectedMealToLog.carbs * servings),
    fat: Math.round(selectedMealToLog.fat * servings),

    time: new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }),

    date: new Date().toISOString(),
  };

  foodLogItems.push(loggedMeal);

  localStorage.setItem("foodLogItems", JSON.stringify(foodLogItems));

  closeLogMealModal();

  updateFoodLogPage();

  Swal.fire({
    icon: "success",
    title: "Meal Logged!",
    html: `
      <p>${loggedMeal.name} (${loggedMeal.servings} serving) has been added to your daily log.</p>
      <strong style="color:#059669">+${loggedMeal.calories} calories</strong>
    `,
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: false,
  });
}

function updateFoodLogPage() {
  updateFoodLogSummary();
  displayLoggedItems();
  updateWeeklyOverview();
}

function updateFoodLogSummary() {
  const totalCalories = foodLogItems.reduce(
    (sum, item) => sum + item.calories,
    0,
  );

  const totalProtein = foodLogItems.reduce(
    (sum, item) => sum + item.protein,
    0,
  );

  const totalCarbs = foodLogItems.reduce((sum, item) => sum + item.carbs, 0);

  const totalFat = foodLogItems.reduce((sum, item) => sum + item.fat, 0);

  document.querySelector("#foodlog-today-section").innerHTML = `
    <h3 class="text-lg font-bold text-gray-900 mb-4">
      <i class="fa-solid fa-fire text-orange-500 mr-2"></i>
      Today's Nutrition
    </h3>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      ${nutritionProgressCard("Calories", totalCalories, 2000, "kcal", "emerald")}
      ${nutritionProgressCard("Protein", totalProtein, 50, "g", "blue")}
      ${nutritionProgressCard("Carbs", totalCarbs, 250, "g", "amber")}
      ${nutritionProgressCard("Fat", totalFat, 65, "g", "purple")}
    </div>

    <div class="border-t border-gray-200 pt-4">
      <div class="flex items-center justify-between mb-3">
        <h4 class="text-sm font-semibold text-gray-700">
          Logged Items (${foodLogItems.length})
        </h4>

        <button
          id="clear-foodlog"
          class="text-red-500 hover:text-red-600 text-sm font-medium"
          style="${foodLogItems.length === 0 ? "display:none" : ""}"
        >
          <i class="fa-solid fa-trash mr-1"></i>Clear All
        </button>
      </div>

      <div id="logged-items-list" class="space-y-2"></div>
    </div>
  `;

  const clearFoodLogBtn = document.querySelector("#clear-foodlog");

  clearFoodLogBtn.addEventListener("click", async () => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Clear Today's Log?",
      text: "This will remove all logged food items for today.",
      showCancelButton: true,
      confirmButtonText: "Yes, clear it!",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      reverseButtons: false,
    });

    if (!result.isConfirmed) return;

    foodLogItems = [];

    localStorage.removeItem("foodLogItems");

    updateFoodLogPage();

    await Swal.fire({
      icon: "success",
      title: "Cleared!",
      text: "Your food log has been cleared.",
      showConfirmButton: false,
      timer: 1800,
      timerProgressBar: false,
    });

    Swal.fire({
      toast: true,
      position: "bottom-end",
      icon: "success",
      title: "Today's log cleared",
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: false,
    });
  });
}

function nutritionProgressCard(title, value, goal, unit, color) {
  const percent = Math.min((value / goal) * 100, 100);

  return `
    <div class="bg-${color}-50 rounded-xl p-4">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-semibold text-gray-700">${title}</span>
        <span class="text-sm text-gray-500">${value} / ${goal} ${unit}</span>
      </div>

      <div class="w-full bg-gray-200 rounded-full h-2.5">
        <div
          class="bg-${color}-500 h-2.5 rounded-full"
          style="width: ${percent}%"
        ></div>
      </div>
    </div>
  `;
}

function displayLoggedItems() {
  const loggedItemsList = document.querySelector("#logged-items-list");

  if (!loggedItemsList) return;

  if (foodLogItems.length === 0) {
    loggedItemsList.innerHTML = `
      <div class="text-center py-8 text-gray-500">
        <i class="fa-solid fa-utensils text-4xl mb-3 text-gray-300"></i>
        <p class="font-medium">No meals logged today</p>
        <p class="text-sm">Add meals from the Meals page or scan products</p>
      </div>
    `;
    return;
  }

  loggedItemsList.innerHTML = foodLogItems
    .map(
      (item, index) => `
        <div class="flex items-center gap-4 bg-gray-50 rounded-xl p-4">
          <img
            src="${item.image}"
            alt="${item.name}"
            class="w-14 h-14 rounded-lg object-cover"
          />

          <div class="flex-1">
            <h4 class="font-bold text-gray-900">${item.name}</h4>
            <p class="text-sm text-gray-500">
              ${item.servings || 1} • <span class="text-emerald-600">${item.type || "Recipe"}</span>
            </p>
            <p class="text-xs text-gray-400">${item.time}</p>
          </div>

          <div class="text-right">
            <p class="text-lg font-bold text-emerald-600">${item.calories}</p>
            <p class="text-xs text-gray-500">kcal</p>
          </div>

          <div class="flex gap-2 text-xs">
            <span class="bg-blue-50 text-blue-600 px-2 py-1 rounded">${item.protein}g P</span>
            <span class="bg-amber-50 text-amber-600 px-2 py-1 rounded">${item.carbs}g C</span>
            <span class="bg-purple-50 text-purple-600 px-2 py-1 rounded">${item.fat}g F</span>
          </div>

          <button
            class="delete-log-item text-gray-400 hover:text-red-500"
            data-index="${index}"
          >
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      `,
    )
    .join("");

  const deleteButtons = document.querySelectorAll(".delete-log-item");

  deleteButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.index);

      foodLogItems.splice(index, 1);

      localStorage.setItem("foodLogItems", JSON.stringify(foodLogItems));

      updateFoodLogPage();

      Swal.fire({
        toast: true,
        position: "bottom-end",
        icon: "success",
        title: "Item removed from log",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: false,
      });
    });
  });
}

//&&=============================================================================================================================================
//&===================================================================[Product Scanner]===================================================================
//&&=============================================================================================================================================

// ^^Search products by name

//**** addEventListeners for product search
searchProductBtn.addEventListener("click", searchProducts);

//**** addEventListener for Enter key press in product search input
productSearchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    searchProducts();
  }
});

//**** searchProducts() function
async function searchProducts() {
  const searchValue = productSearchInput.value.trim();

  if (searchValue === "") {
    productsCount.textContent = "Please enter a product name";
    productsGrid.innerHTML = "";
    productsEmpty.classList.remove("hidden");
    return;
  }

  try {
    productsLoading.classList.remove("hidden");
    productsEmpty.classList.add("hidden");
    productsGrid.innerHTML = "";

    const response = await fetch(
      `${API.productSearch}?q=${searchValue}&page=1&limit=24`,
    );

    if (!response.ok) {
      throw new Error("Failed to search products");
    }

    const data = await response.json();

    const products = data.results || [];

    productsCount.textContent = `Found ${products.length} products for "${searchValue}"`;

    // displayProducts(products);

    allProducts = products;
    currentNutriScore = "all";
    resetNutriScoreFilter();
    displayProducts(allProducts);
  } catch (error) {
    console.error(error);

    productsCount.textContent = "Failed to search products";
    productsGrid.innerHTML = "";
    productsEmpty.classList.remove("hidden");
  } finally {
    productsLoading.classList.add("hidden");
  }
}

//***** displayProducts() function
function displayProducts(products) {
  displayedProducts = products;

  if (!products.length) {
    productsGrid.innerHTML = "";
    productsEmpty.classList.remove("hidden");
    return;
  }

  productsEmpty.classList.add("hidden");

  productsGrid.innerHTML = products
    .map((product, index) => {
      const nutrients = product.nutrients || {};

      const image =
        product.image ||
        "https://placehold.co/300x300/e5e7eb/6b7280?text=No+Image";

      const name = product.name || "Unknown Product";
      const brand = product.brand || "Unknown Brand";

      const calories = Number((nutrients.calories || 0).toFixed(1));
      const protein = Number((nutrients.protein || 0).toFixed(1));
      const carbs = Number((nutrients.carbs || 0).toFixed(1));
      const fat = Number((nutrients.fat || 0).toFixed(1));
      const sugar = Number((nutrients.sugar || 0).toFixed(1));

      const nutriScore =
        product.nutritionGrade && product.nutritionGrade !== "unknown"
          ? product.nutritionGrade.toUpperCase()
          : "UNKNOWN";

      const novaScore = Number(product.novaGroup) || 0;

      const nutriScoreClass =
        nutriScore === "A"
          ? "bg-green-500"
          : nutriScore === "B"
            ? "bg-lime-500"
            : nutriScore === "C"
              ? "bg-yellow-500"
              : nutriScore === "D"
                ? "bg-orange-500"
                : nutriScore === "E"
                  ? "bg-red-500"
                  : "bg-gray-400";

      const novaScoreClass =
        novaScore === 1
          ? "bg-green-500"
          : novaScore === 2
            ? "bg-lime-500"
            : novaScore === 3
              ? "bg-yellow-500"
              : novaScore === 4
                ? "bg-red-500"
                : "bg-gray-500";

      return `
        <div
          class="product-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer"
          data-index="${index}"
          style="position: relative;"
        >
          <span
            class="${nutriScoreClass} text-white text-xs font-bold px-3 py-1 rounded-md uppercase shadow"
            style="position: absolute; top: 12px; left: 12px; z-index: 50;"
          >
            NUTRI-SCORE ${nutriScore}
          </span>

          ${
            novaScore
              ? `
                <span
                  class="${novaScoreClass} w-8 h-8 rounded-full text-white text-sm font-bold flex items-center justify-center shadow"
                  style="position: absolute; top: 12px; right: 12px; z-index: 50;"
                >
                  ${novaScore}
                </span>
              `
              : ""
          }

          <div class="h-48 bg-gray-100 flex items-center justify-center">
            <img
              src="${image}"
              alt="${name}"
              class="w-full h-full object-contain"
            />
          </div>

          <div class="p-4">
            <p class="text-xs text-emerald-600 font-bold mb-1 line-clamp-1">
              ${brand}
            </p>

            <h3 class="font-bold text-gray-900 mb-2 line-clamp-2">
              ${name}
            </h3>

            <p class="text-sm text-gray-500 mb-3">
              <i class="fa-solid fa-fire-flame-curved mr-1"></i>
              ${calories} kcal/100g
            </p>

            <div class="grid grid-cols-4 gap-2 text-center">
              <div class="bg-emerald-50 rounded p-2">
                <p class="text-sm font-bold text-emerald-600">${protein}g</p>
                <p class="text-xs text-gray-500">Protein</p>
              </div>

              <div class="bg-blue-50 rounded p-2">
                <p class="text-sm font-bold text-blue-600">${carbs}g</p>
                <p class="text-xs text-gray-500">Carbs</p>
              </div>

              <div class="bg-purple-50 rounded p-2">
                <p class="text-sm font-bold text-purple-600">${fat}g</p>
                <p class="text-xs text-gray-500">Fat</p>
              </div>

              <div class="bg-orange-50 rounded p-2">
                <p class="text-sm font-bold text-orange-600">${sugar}g</p>
                <p class="text-xs text-gray-500">Sugar</p>
              </div>
            </div>
          </div>
        </div>
      `;
    })
    .join("");
}

//!==================================================
//!==================================================

// ^^Search product by barcode

//**** addEventListener for barcode lookup button
lookupBarcodeBtn.addEventListener("click", lookupProductByBarcode);

//**** addEventListener for Enter key press in barcode input
barcodeInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    lookupProductByBarcode();
  }
});

//**** lookupProductByBarcode() function
async function lookupProductByBarcode() {
  const barcodeValue = barcodeInput.value.trim();

  if (barcodeValue === "") {
    productsCount.textContent = "Please enter a barcode";
    productsGrid.innerHTML = "";
    productsEmpty.classList.remove("hidden");
    return;
  }

  try {
    productsLoading.classList.remove("hidden");
    productsEmpty.classList.add("hidden");
    productsGrid.innerHTML = "";

    const response = await fetch(`${API.productBarcode}/${barcodeValue}`);

    if (!response.ok) {
      throw new Error("Product not found");
    }

    const data = await response.json();

    const product = data.result || data.product || data.data;

    if (!product) {
      displayedProducts = [];
      productsCount.textContent = `No product found with barcode: ${barcodeValue}`;
      productsGrid.innerHTML = "";
      productsEmpty.classList.remove("hidden");
      return;
    }

    productsCount.textContent = `Found product: ${product.name || "Unknown Product"}`;

    // displayProducts([product]);

    allProducts = [product];
    currentNutriScore = "all";
    resetNutriScoreFilter();
    displayProducts(allProducts);

    openProductModal(product);
  } catch (error) {
    console.error(error);

    displayedProducts = [];
    productsCount.textContent = `No product found with barcode: ${barcodeValue}`;
    productsGrid.innerHTML = "";
    productsEmpty.classList.remove("hidden");
  } finally {
    productsLoading.classList.add("hidden");
  }
}

//***** addProductCardEvents() function
function addProductCardEvents() {
  productsGrid.addEventListener("click", (e) => {
    const productCard = e.target.closest(".product-card");

    if (!productCard) return;

    const index = Number(productCard.dataset.index);

    const product = displayedProducts[index];

    if (!product) return;

    openProductModal(product);
  });
}

// ^^show product details in a modal using SweetAlert2

//***** openProductModal() function
function openProductModal(product) {
  const nutrients = product.nutrients || {};

  const image =
    product.image || "https://placehold.co/300x300/e5e7eb/6b7280?text=No+Image";

  const name = product.name || "Unknown Product";
  const brand = product.brand || "Unknown Brand";
  const barcode = product.barcode || "No barcode";

  const calories = Math.round(nutrients.calories || 0);
  const protein = Number((nutrients.protein || 0).toFixed(1));
  const carbs = Number((nutrients.carbs || 0).toFixed(1));
  const fat = Number((nutrients.fat || 0).toFixed(1));
  const sugar = Number((nutrients.sugar || 0).toFixed(1));
  const saturatedFat = Number((nutrients.saturatedFat || 0).toFixed(1));
  const fiber = Number((nutrients.fiber || 0).toFixed(1));
  const salt = Number((nutrients.salt || 0).toFixed(2));

  const nutriScore = product.nutritionGrade || "unknown";
  const novaScore = product.novaGroup || "N/A";

  Swal.fire({
    width: 760,
    showConfirmButton: false,
    html: `
      <div class="bg-white rounded-2xl w-full text-left">
        <div class="p-6">
          <div class="flex items-start gap-6 mb-6">
            <div class="w-32 h-32 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
              <img src="${image}" alt="${name}" class="w-full h-full object-contain" />
            </div>

            <div class="flex-1">
              <p class="text-sm text-emerald-600 font-semibold mb-1">${brand}</p>
              <h2 class="text-2xl font-bold text-gray-900 mb-2">${name}</h2>
              <p class="text-sm text-gray-500 mb-3">${barcode}</p>

              <div class="flex items-center gap-3">
                <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-100 whitespace-nowrap">
                  <span class="w-8 h-8 rounded flex items-center justify-center text-white font-bold bg-emerald-600">
                    ${nutriScore.toUpperCase()}
                  </span>
                  <p class="text-xs font-bold text-emerald-700">Nutri-Score</p>
                </div>

                <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-100 whitespace-nowrap">
                  <span class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold bg-orange-500">
                    ${novaScore}
                  </span>
                  <p class="text-xs font-bold text-orange-600">NOVA</p>
                </div>
              </div>
            </div>

            <button onclick="Swal.close()" class="text-gray-400 hover:text-gray-600">
              <i class="fa-solid fa-xmark text-2xl"></i>
            </button>
          </div>

          <div class="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 mb-6 border border-emerald-200">
            <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <i class="fa-solid fa-chart-pie text-emerald-600"></i>
              Nutrition Facts
              <span class="text-sm font-normal text-gray-500">(per 100g)</span>
            </h3>

            <div class="text-center mb-4 pb-4 border-b border-emerald-200">
              <p class="text-4xl font-bold text-gray-900">${calories}</p>
              <p class="text-sm text-gray-500">Calories</p>
            </div>

            <div class="grid grid-cols-4 gap-4">
              <div class="text-center">
                <p class="text-lg font-bold text-emerald-600">${protein}g</p>
                <p class="text-xs text-gray-500">Protein</p>
              </div>

              <div class="text-center">
                <p class="text-lg font-bold text-blue-600">${carbs}g</p>
                <p class="text-xs text-gray-500">Carbs</p>
              </div>

              <div class="text-center">
                <p class="text-lg font-bold text-purple-600">${fat}g</p>
                <p class="text-xs text-gray-500">Fat</p>
              </div>

              <div class="text-center">
                <p class="text-lg font-bold text-orange-600">${sugar}g</p>
                <p class="text-xs text-gray-500">Sugar</p>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-emerald-200">
              <div class="text-center">
                <p class="text-sm font-semibold text-gray-900">${saturatedFat}g</p>
                <p class="text-xs text-gray-500">Saturated Fat</p>
              </div>

              <div class="text-center">
                <p class="text-sm font-semibold text-gray-900">${fiber}g</p>
                <p class="text-xs text-gray-500">Fiber</p>
              </div>

              <div class="text-center">
                <p class="text-sm font-semibold text-gray-900">${salt}g</p>
                <p class="text-xs text-gray-500">Salt</p>
              </div>
            </div>
          </div>

          <div class="flex gap-3">
            <button
              id="add-product-to-log"
              class="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all"
            >
              <i class="fa-solid fa-plus mr-2"></i>
              Log This Food
            </button>

            <button
              onclick="Swal.close()"
              class="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    `,

    didOpen: () => {
      const addProductToLogBtn = document.querySelector("#add-product-to-log");

      addProductToLogBtn.addEventListener("click", () => {
        const loggedProduct = {
          name: name,
          image: image,
          brand: brand,
          barcode: barcode,
          servings: 1,
          type: "Product",

          calories: calories,
          protein: protein,
          carbs: carbs,
          fat: fat,

          time: new Date().toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          }),

          date: new Date().toISOString(),
        };

        foodLogItems.push(loggedProduct);

        localStorage.setItem("foodLogItems", JSON.stringify(foodLogItems));

        updateFoodLogPage();

        Swal.close();

        Swal.fire({
          toast: true,
          position: "bottom-end",
          icon: "success",
          title: "Product added to log",
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: false,
        });
      });
    },
  });
}

// ^^Filter by Nutri-Score
function addNutriScoreFilterEvents() {
  nutriScoreFilters.forEach((button) => {
    button.addEventListener("click", () => {
      const score = button.dataset.score || button.textContent.trim();

      currentNutriScore = score.toLowerCase();

      updateActiveNutriScoreButton(button);

      filterProductsByNutriScore();
    });
  });
}

function filterProductsByNutriScore() {
  let productsToShow = [];

  if (currentNutriScore === "all") {
    productsToShow = allProducts;
  } else {
    productsToShow = allProducts.filter((product) => {
      const productScore = product.nutritionGrade || "unknown";

      return productScore.toLowerCase() === currentNutriScore;
    });
  }

  productsCount.textContent =
    currentNutriScore === "all"
      ? `Showing ${productsToShow.length} products`
      : `Showing ${productsToShow.length} Nutri-Score ${currentNutriScore.toUpperCase()} products`;

  displayProducts(productsToShow);
}

function updateActiveNutriScoreButton(activeButton) {
  nutriScoreFilters.forEach((button) => {
    button.classList.remove(
      "ring-2",
      "ring-gray-900",
      "ring-offset-2",
      "scale-105"
    );
  });

  activeButton.classList.add(
    "ring-2",
    "ring-gray-900",
    "ring-offset-2",
    "scale-105"
  );
}

function resetNutriScoreFilter() {
  currentNutriScore = "all";

  const allButton = [...nutriScoreFilters].find((button) => {
    return button.textContent.trim().toLowerCase() === "all";
  });

  if (!allButton) return;

  updateActiveNutriScoreButton(allButton);
}

// ^^Browse products by category

function addProductCategoryEvents() {
  productCategoryBtns.forEach((button) => {
    button.addEventListener("click", () => {
      const category = button.dataset.category || button.textContent.trim();

      updateActiveProductCategoryButton(button);

      getProductsByCategory(category);
    });
  });
}

async function getProductsByCategory(category) {
  try {
    productsLoading.classList.remove("hidden");
    productsEmpty.classList.add("hidden");
    productsGrid.innerHTML = "";

    const response = await fetch(
      `${API.productCategory}/${encodeURIComponent(category)}?page=1&limit=24`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch products by category");
    }

    const data = await response.json();

    const products = data.results || [];

    allProducts = products;
    currentNutriScore = "all";

    resetNutriScoreFilter();

    productsCount.textContent = `Showing ${products.length} ${category} products`;

    displayProducts(allProducts);
  } catch (error) {
    console.error(error);

    allProducts = [];
    displayedProducts = [];

    productsCount.textContent = `Failed to load ${category} products`;
    productsGrid.innerHTML = "";
    productsEmpty.classList.remove("hidden");
  } finally {
    productsLoading.classList.add("hidden");
  }
}

function updateActiveProductCategoryButton(activeButton) {
  productCategoryBtns.forEach((button) => {
    button.classList.remove(
      "ring-2",
      "ring-gray-900",
      "ring-offset-2",
      "scale-105"
    );
  });

  activeButton.classList.add(
    "ring-2",
    "ring-gray-900",
    "ring-offset-2",
    "scale-105"
  );
}