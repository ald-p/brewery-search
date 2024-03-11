/* Selectors */
const form = document.querySelector('#search-form');
const searchResultsLabel = document.querySelector('#search-results-label');
const breweryList = document.querySelector('#brewery-list');

/* Variables */
const URL = 'https://api.openbrewerydb.org/v1/breweries';

/* Functions */
async function fetchData(endpoint = '') {
  const response = await fetch(URL + endpoint);
  const data = await response.json();

  return data;
}

function displayResults(input, results) {
  // show label text
  searchResultsLabel.innerText = `Search results for ${input}`;

  // display list of search results
  //   <button type="button" class="list-group-item list-group-item-action">
  //   A second button item
  // </button>
  results.forEach((result) => {
    const btn = document.createElement('button');
    btn.setAttribute('type', 'button');
    btn.classList.add('list-group-item', 'list-group-item-action');
    btn.textContent = `${result.name} - ${result.city}, ${result.state_province}`;

    breweryList.appendChild(btn);
  });
}

/* Event handlers */
async function searchHandler(e) {
  e.preventDefault();

  // get text input from user
  const searchText = form[0].value;

  // endpoint using user input value, replacing any spaces with underscores
  const endpoint = `/search?query=${searchText.replace(/ /g, '_')}&per_page=25`;

  // fetch results based on search input
  const searchResults = await fetchData(endpoint);
  console.log(searchResults);
  // display results
  displayResults(searchText, searchResults);
}

/* Event listeners */
form.addEventListener('submit', searchHandler);
// document.addEventListener('DOMContentLoaded')
