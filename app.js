/* Selectors */
const form = document.querySelector('#search-form');
const searchResultsLabel = document.querySelector('#search-results-label');
const breweryList = document.querySelector('#brewery-list');
const modalTitle = document.querySelector('#breweryInfoModalLabel');
const modalBody = document.querySelector('#breweryInfoModalBody');

/* Variables */
const URL = 'https://api.openbrewerydb.org/v1/breweries';
let breweries;

/* Functions */
async function fetchData(endpoint = '') {
  const response = await fetch(URL + endpoint);
  const data = await response.json();

  return data;
}

function displayResults(input, results, label = 'Search results for ') {
  // show label text
  searchResultsLabel.innerText = label + input;

  // clear current display
  breweryList.textContent = '';

  if (results.length === 0) {
    breweryList.textContent = 'No results found';
  }

  // display list of search results
  results.forEach((result) => {
    const btn = document.createElement('button');
    btn.setAttribute('type', 'button');
    btn.setAttribute('data-bs-toggle', 'modal');
    btn.setAttribute('data-bs-target', '#breweryInfoModal');
    btn.setAttribute('id', result.id);
    btn.classList.add('list-group-item', 'list-group-item-action');
    btn.textContent = `${result.name} - ${result.city}, ${result.state_province}`;

    breweryList.appendChild(btn);
  });
}

function updateModalContent(brewery) {
  modalTitle.textContent = brewery.name;
  // clear modal body before updating
  modalBody.textContent = '';

  // create modal body elements
  const listGroup = document.createElement('ul');
  listGroup.classList.add('list-group');

  const address = createModalElement(
    'Address: ',
    `${brewery.street}, ${brewery.city}, ${brewery.state_province} ${brewery.postal_code}`
  );

  const website = createModalElement('Website: ');
  const link = document.createElement('a');
  link.setAttribute('href', brewery.website_url);
  link.setAttribute('target', '_blank');
  link.classList.add('link-underline', 'link-underline-opacity-25');
  link.textContent = brewery.website_url;
  website.appendChild(link);

  const phone = createModalElement(
    'Phone Number: ',
    formatPhoneNumber(brewery.phone)
  );

  listGroup.appendChild(address);
  listGroup.appendChild(website);
  listGroup.appendChild(phone);
  modalBody.appendChild(listGroup);
}

function createModalElement(label, content = '') {
  const itemEl = document.createElement('li');
  itemEl.classList.add('list-group-item');
  const itemLabel = document.createElement('span');
  itemLabel.classList.add('fw-bold');
  itemLabel.textContent = label;
  const itemText = document.createElement('span');
  itemText.textContent = content;
  itemEl.appendChild(itemLabel);
  itemEl.appendChild(itemText);

  return itemEl;
}

function formatPhoneNumber(num) {
  return num.replace(/\D+/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
}

function showSpinner() {
  const flexDiv = document.createElement('div');
  flexDiv.classList.add('d-flex', 'justify-content-center');

  const div = document.createElement('div');
  div.classList.add('spinner-border');
  div.setAttribute('role', 'status');

  const span = document.createElement('span');
  span.classList.add('visually-hidden');
  span.textContent = 'Loading...';

  flexDiv.appendChild(div);
  div.appendChild(span);
  breweryList.textContent = '';
  breweryList.appendChild(flexDiv);
}

/* Event handlers */
async function searchHandler(e) {
  e.preventDefault();

  // show spinner
  showSpinner();

  // get text input from user
  const searchText = form[0].value;

  // endpoint using user input value, replacing any spaces with underscores
  const endpoint = `/search?query=${searchText.replace(/ /g, '_')}&per_page=25`;

  // fetch results based on search input
  breweries = await fetchData(endpoint);
  console.log(breweries);

  // display results
  displayResults(searchText, breweries);

  // clear input
  form[0].value = '';
}

function breweryInfoHandler(e) {
  const targetId = e.target.id;
  const brewery = breweries.find((brewery) => brewery.id === targetId);

  updateModalContent(brewery);
}

async function init() {
  // Add event listeners
  form.addEventListener('submit', searchHandler);
  breweryList.addEventListener('click', breweryInfoHandler);

  // show spinner
  showSpinner();

  // fetch list of breweries
  breweries = await fetchData('/random?size=15');

  // display Results
  displayResults('', breweries, 'Explore Breweries!');
}

/* Event listeners */
document.addEventListener('DOMContentLoaded', init);
