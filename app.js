/* Selectors */
const form = document.querySelector('#search-form');
const searchResultsLabel = document.querySelector('#search-results-label');
const breweryList = document.querySelector('#brewery-list');
const modalTitle = document.querySelector('#breweryInfoModalLabel');
const modalBody = document.querySelector('#breweryInfoModalBody');
const paginationBtns = document.querySelector('#pagination-btns');
const paginationRanges = document.querySelector('#pagination-ranges');

/* Variables */
const URL = 'https://api.openbrewerydb.org/v1/breweries';
let breweries;

// Pagination vars
const paginationLimit = 25;
let currentPage;
let maxPages;
let totalResults;
let currentLowRange;
let currentHighRange;

/* Functions */
async function fetchData(endpoint = '') {
  const response = await fetch(URL + endpoint);
  const data = await response.json();

  return data;
}

function displayResults(results) {
  // clear current display
  breweryList.textContent = '';

  if (results.length === 0) {
    breweryList.textContent = 'No results found';
  }

  // display list of search results given ranges
  for (let i = currentLowRange - 1; i < currentHighRange - 1; i++) {
    const btn = document.createElement('button');
    btn.setAttribute('type', 'button');
    btn.setAttribute('data-bs-toggle', 'modal');
    btn.setAttribute('data-bs-target', '#breweryInfoModal');
    btn.setAttribute('id', results[i].id);
    btn.classList.add('list-group-item', 'list-group-item-action');
    btn.textContent = `${results[i].name} - ${results[i].city}, ${results[i].state_province}`;

    breweryList.appendChild(btn);
  }
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

function resetPagination(results) {
  currentPage = 1;
  currentLowRange = 1;
  results.length < paginationLimit
    ? (currentHighRange = results.length)
    : (currentHighRange = paginationLimit);

  totalResults = results.length;
  maxPages = Math.ceil(totalResults / paginationLimit);
}

function createPaginationElements() {
  const prevBtn = document.createElement('button');
  prevBtn.setAttribute('type', 'button');
  prevBtn.id = 'prev';
  prevBtn.classList.add('btn', 'btn-outline-primary');
  prevBtn.disabled = true;
  prevBtn.textContent = 'Prev';

  const nextBtn = document.createElement('button');
  nextBtn.setAttribute('type', 'button');
  nextBtn.id = 'next';
  nextBtn.classList.add('btn', 'btn-outline-primary');
  nextBtn.textContent = 'Next';

  if (totalResults < paginationLimit) {
    nextBtn.disabled = true;
  }

  paginationBtns.textContent = '';
  paginationBtns.appendChild(prevBtn);
  paginationBtns.appendChild(nextBtn);

  prevBtn.addEventListener('click', paginationHandler);
  nextBtn.addEventListener('click', paginationHandler);
}

function displayPagination() {
  paginationRanges.textContent = '';

  const page = document.createElement('p');
  page.classList.add('fw-lighter', 'fs-6', 'mb-0');
  page.textContent = `Page ${currentPage} of ${maxPages}`;

  const range = document.createElement('p');
  range.classList.add('fw-lighter', 'fs-6');
  range.textContent = `Displaying ${currentLowRange}-${currentHighRange} of ${totalResults}`;

  paginationRanges.appendChild(page);
  paginationRanges.appendChild(range);
}

/* Event handlers */
async function searchHandler(e) {
  e.preventDefault();

  // show spinner
  showSpinner();

  // get text input from user
  const searchText = form[0].value;

  // endpoint using user input value, replacing any spaces with underscores
  const endpoint = `/search?query=${searchText.replace(/ /g, '_')}`;

  // fetch results based on search input
  breweries = await fetchData(endpoint);
  console.log(breweries);

  resetPagination(breweries);
  createPaginationElements();

  // display results
  // show label text
  searchResultsLabel.innerText = `Search results for ${searchText}`;
  displayResults(breweries);

  displayPagination();

  // clear input
  form[0].value = '';
}

function breweryInfoHandler(e) {
  const targetId = e.target.id;
  const brewery = breweries.find((brewery) => brewery.id === targetId);

  updateModalContent(brewery);
}

function paginationHandler(e) {
  console.log(e.target.id);
  if (e.target.id === 'next') {
    currentPage++;
    console.log(currentPage);

    paginationBtns.children[0].disabled = false;
    currentLowRange = currentHighRange + 1;
    currentHighRange = currentHighRange + paginationLimit;
    console.log(currentLowRange, currentHighRange);

    if (currentPage === maxPages) {
      e.target.disabled = true;
      currentHighRange = totalResults;
    }
  } else {
    currentPage--;
    console.log(currentPage);

    // paginationEl.children[1].disabled = false;
    currentHighRange = currentLowRange - 1;
    currentLowRange = currentLowRange - paginationLimit;
    console.log(currentLowRange, currentHighRange);

    if (currentPage === 1) {
      e.target.disabled = true;
      paginationBtns.children[1].disabled = false;
    }
  }

  displayPagination();
  displayResults(breweries);
}

async function init() {
  // Add event listeners
  form.addEventListener('submit', searchHandler);
  breweryList.addEventListener('click', breweryInfoHandler);

  // show spinner
  showSpinner();

  // fetch random list of breweries
  breweries = await fetchData('/random?size=50');
  console.log(breweries);

  resetPagination(breweries);
  createPaginationElements();

  // display Results
  displayResults(breweries);

  displayPagination();
}

/* Event listeners */
document.addEventListener('DOMContentLoaded', init);
