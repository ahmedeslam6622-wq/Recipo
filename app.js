const randpopup = document.getElementById('randomize-popup');
const closeRandPopupButton = document.getElementById('close-popup');
const randomizeRecipeButton = document.getElementById('randomize-recipe');
const addButton = document.getElementById('add');
const randomizeButton = document.getElementById('randomize');
const addRecipePopup = document.getElementById('add-recipe-popup');
const closeAddPopupButton = document.getElementById('close-add-popup');
const saveRecipe = document.getElementById('save-recipe');

// FIX 1: Initialize recipes directly from localStorage right away
const recipes = JSON.parse(localStorage.getItem("all_recipes")) || []; 

const popupContentContainer = randpopup.querySelector('.popup-content') || randpopup;

// Popups toggles
closeAddPopupButton.addEventListener('click', () => { addRecipePopup.classList.remove('show'); });
randomizeButton.addEventListener('click', () => { randpopup.classList.add('show'); });
closeRandPopupButton.addEventListener('click', () => { randpopup.classList.remove('show'); });
addButton.addEventListener('click', () => { addRecipePopup.classList.add('show'); });

saveRecipe.addEventListener('click', () => {
    const recipeNameInput = document.getElementById('recipe-name');
    
    // FIX: Changed 'recipe-input' to 'recipe-ingredients' to match your HTML ID
    const recipeBodyInput = document.getElementById('recipe-ingredients'); 
    
    const recipename = recipeNameInput.value.trim();
    const recipeInput = recipeBodyInput.value.trim();
    
    if (recipename && recipeInput) {
        save(recipename, recipeInput);
        
        recipeNameInput.value = '';
        recipeBodyInput.value = '';
        addRecipePopup.classList.remove('show');
    } else {
        alert("Please fill out both fields!");
    }
});


// FIX 1 continued: Save everything to a structured array list
function save(recipe_name, recipe) {
    const combinedString = `${recipe_name}: ${recipe}`;
    recipes.push(combinedString);
    localStorage.setItem("all_recipes", JSON.stringify(recipes));
    
    // Add it to the visual list immediately without needing a page refresh
    displaySingleRecipe(combinedString);
}

function getRandomRecipe() {
    if (recipes.length === 0) {
        return "No recipes available.";
    }
    const randomIndex = Math.floor(Math.random() * recipes.length);
    return recipes[randomIndex];
}

randomizeRecipeButton.addEventListener('click', () => {
    popupContentContainer.querySelectorAll('.recipe-text').forEach(el => el.remove());
    const el = document.createElement('span');
    el.className = 'recipe-text';
    el.textContent = getRandomRecipe();
    popupContentContainer.appendChild(el);
});

// Helper function to build the DOM list items safely
function displaySingleRecipe(recipeText) {
    const recipeContainer = document.getElementById('recipe-container');
    if (!recipeContainer) return; // Guard clause in case element doesn't exist yet
    
    const recipeElement = document.createElement('div');
    recipeElement.textContent = recipeText;
    recipeElement.className = "recipe-item"; // FIX 4: Changed .class to .className
    
    recipeContainer.appendChild(recipeElement);
    recipeContainer.appendChild(document.createElement('hr'));
}

// FIX 2: Rewritten parse function to loop through and render existing list on load
function parse() {
    recipes.forEach(recipeText => {
        displaySingleRecipe(recipeText);
    });
}

// FIX 2 continued: Execute the loading process immediately
parse();
