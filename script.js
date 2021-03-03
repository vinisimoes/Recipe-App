const mealsEl = document.getElementById('meals');
const favContainer = document.getElementById('fav-meals');
const searchTerm = document.getElementById('search-term');
const searchBtn = document.getElementById('search');
const mealPopup = document.getElementById('meal-popup');
const mealInfoEl = document.getElementById('meal-info');
const popupCloseBtn = document.getElementById('close-popup');

async function getRandomMeal() {
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
    const respData = await resp.json();
    const randomMeal = respData.meals[0];
    
    addMeal(randomMeal, true);
}

async function getMealById(id) {
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i='+id);
    const respData = await resp.json();
    const meal = respData.meals[0];

    return meal;
}

async function getMealsBySearch(name) {
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s='+name);
    const respData = await resp.json();
    const meal = respData.meals;

    return meal;
}

function addMeal(mealData, random = false) {
    const meal = document.createElement('div');
    meal.classList.add('meal');

    meal.innerHTML = `
        <div class="meal-header">
            ${random ? `<span class="random"> Random Recipe </span>` : ''}
            <img class="click" src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
        </div>
        <div class="meal-body">
            <h4>${mealData.strMeal}</h4>
            <button class="fav-btn" id="fav-btn">
                <i class="fas fa-heart"></i>
            </button>
        </div>
    `;

    const favBtn = meal.querySelector('.meal-body .fav-btn');
    favBtn.addEventListener("click", () => {
        if(favBtn.classList.contains("active")) {
            removeMealLS(mealData.idMeal);
            favBtn.classList.remove("active");
        }
        else {
            addMealLS(mealData.idMeal);
            favBtn.classList.add("active");
        }
        fetchFavoriteMeals();
    });

    const showMealBtns = meal.querySelector('.click');
    showMealBtns.addEventListener("click", () => {
        showMealInfo(mealData);
    });

    mealsEl.appendChild(meal);
}

function addMealLS(mealId) {
    const mealIds = getMealsLS();

    localStorage.setItem(
        'mealIds', 
        JSON.stringify([...mealIds, mealId])
    );
}

function removeMealLS(mealId) {
    const mealIds = getMealsLS();

    localStorage.setItem(
        'mealIds', 
        JSON.stringify(mealIds.filter((id) => id !== mealId))
    );
}

function getMealsLS() {
    const mealIds = JSON.parse(localStorage.getItem("mealIds"));

    return mealIds === null ? [] : mealIds;
}

async function fetchFavoriteMeals() {
    favContainer.innerHTML = '';

    const mealIds = getMealsLS();

    const meals = [];
    for(let i = 0; i < mealIds.length; i++) {
        const mealId = mealIds[i];

        meal = await getMealById(mealId);

        addMealFav(meal);
    }
}

function addMealFav(mealData) {
    const favMeal = document.createElement('li');

    favMeal.innerHTML = `
        <img class="click" src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
        <span>${mealData.strMeal}</span>
        <button class="clear"><i class="fas fa-window-close"></i></button>
    `;

    const showMealBtns = favMeal.querySelector('.click');
    showMealBtns.addEventListener("click", () => {
        showMealInfo(mealData);
    });

    const clearBtn = favMeal.querySelector('.clear');
    clearBtn.addEventListener("click",() => {
        removeMealLS(mealData.idMeal);
        fetchFavoriteMeals();  
    });

    favContainer.appendChild(favMeal);
}

function showMealInfo(mealData) {
    // clear 
    mealInfoEl.innerHTML = '';

    // update meal info
    const mealEl = document.createElement('div');

    // get ingredients and measures
    const ingredients = [];
    for(let i = 1; i <= 20; i++) {
        if(mealData['strIngredient'+i]) {
            ingredients.push(`${mealData['strIngredient'+i]} - ${mealData['strMeasure'+i]}`)
        }
        else {
            break;
        }
    }

    mealEl.innerHTML = `
    <div>
        <h1>${mealData.strMeal}</h1>
        <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
    </div>
    <div>
        <h3>Ingredients:</h3>
        <ul>
            ${ingredients.map(ing => 
                `<li>${ing}</li>`).join(' ')}
        </ul>
        <p>${mealData.strInstructions}</p>
    </div>
    `;

    mealInfoEl.appendChild(mealEl);

    // show popup
    mealPopup.classList.remove('hidden');
}

// Main call
getRandomMeal();
fetchFavoriteMeals();

searchBtn.addEventListener("click", async () => {
    const search = searchTerm.value;
    const meals = await getMealsBySearch(search);

    if(meals) {
        mealsEl.innerHTML = '';
        meals.forEach(meal => {
            addMeal(meal);
        })  
    }
});

popupCloseBtn.addEventListener("click", () => {
    mealPopup.classList.add("hidden");
});