// ====================================
import { getAllSupportedCurrencies, getCurrencyFullName,
        getCurrencyAbbreviation, getExchangeRate } from "./currency-exchange.js";
// ====================================
const exchangeMarkerElement = document.getElementById("exchange-rate-marker");

let sourceTableRowElementList = [];
const sourceCurrencyAmountElement = document.getElementById("source-currency-amount-input");
const sourceCurrencyTableElement = document.getElementById("source-currency-table");
const sourceCurrencyHeaderElement = document.getElementById("source-currency-header");
const sourceCurrencyFilterInputElement = document.getElementById("source-currency-filter-input");
const sourceCurrencyButtonSelectorElement = document.getElementById("source-currency-filter-selector");
const sourceCurrencyFilterButtonElement = document.getElementById("source-currency-filter-button");

let destinationTableRowElementList = [];
const destinationCurrencyElement = document.getElementById("destination-currency-amount-input");
const destinationCurrencyTableElement = document.getElementById("destination-currency-table");
const destinationCurrencyHeaderElement = document.getElementById("destination-currency-header");
const destinationCurrencyFilterInputElement = document.getElementById("destination-currency-filter-input");
const destinationCurrencyButtonSelectorElement = document.getElementById("destination-currency-filter-selector");
const destinationCurrencyFilterButtonElement = document.getElementById("destination-currency-filter-button");

let currenciesData = [];
let sourceFilterQuery = "none";
let destinationFilterQuery = "none";

// Takes in the abbreviations.
let sourceCurrencyAbbr = "";
let destinationCurrencyAbbr = "";

let sourceCurrencyName = "";
let destinationCurrencyName = "";

let sourceTableVisibility = true;
let destinationTableVisibility = true;
// ====================================
function onPageLoaded() {
  sourceCurrencyTableElement.innerHTML = "";
  destinationCurrencyTableElement.innerHTML = "";
  
  sourceTableRowElementList = [];
  destinationTableRowElementList = [];

  createTableHeader(true, sourceCurrencyTableElement);
  createTableHeader(false, destinationCurrencyTableElement);

  const sourceButtonElement = document.getElementById("source-table-visibility-button");

  sourceButtonElement.addEventListener("click", () => {
    sourceTableVisibility = !sourceTableVisibility;
    filterTableRow("true");
    
    sourceButtonElement.innerHTML = sourceTableVisibility ? 
      `<i class="fa-regular fa-eye"></i>` : 
      `<i class="fa-regular fa-eye-slash"></i>` 
  });

  const destinationButtonElement = document.getElementById("destination-table-visibility-button");

  destinationButtonElement.addEventListener("click", () => {
    destinationTableVisibility = !destinationTableVisibility;
    filterTableRow("false");
    
    destinationButtonElement.innerHTML = destinationTableVisibility ? 
      `<i class="fa-regular fa-eye"></i>` : 
      `<i class="fa-regular fa-eye-slash"></i>` 
  });

  sourceCurrencyAmountElement.addEventListener("input", () => acquireExchangeRate());
  // For IE8 backward-compatibilty.
  sourceCurrencyAmountElement.addEventListener("propertychange", () => acquireExchangeRate());
  
  getAllSupportedCurrencies((currencies) => {
    currenciesData = currencies;
    
    currencies.forEach((currency, iter) => {
      createTableDataRow(true, sourceCurrencyTableElement, currency, iter);
      createTableDataRow(false, destinationCurrencyTableElement, currency, iter);
      
      // Debug
      //console.log("Currency: " + currency);
    });
  });
}
// ====================================
function createTableHeader(isSource, tableElement) {
  let headerRow = tableElement.insertRow();
  let headerCell = headerRow.insertCell();
  headerCell.innerHTML = `
    <button id="${isSource ? "source-table-visibility-button" : "destination-table-visibility-button"}" class="btn btn-sm btn-secondary">
      <i class="fa-regular fa-eye"></i>
    </button>
  `;
  headerCell.classList.add("col-3", "small", "fw-bold");
  
  headerCell = headerRow.insertCell();
  headerCell.textContent = "Currency Name";
  headerCell.classList.add("col-6", "small", "fw-bold");
  
  headerCell = headerRow.insertCell();
  headerCell.textContent = "Currency Abbreviation";
  headerCell.classList.add("col-3", "small", "fw-bold");
}

function createTableDataRow(isSource, tableElement, currency, iter) {
  let newRow = tableElement.insertRow();
  newRow.classList.add("align-items-center", "justify-content-center");

  let name = currency.name;
  let abbr = currency.abbr;

  let newCell = newRow.insertCell();

  newCell = newRow.insertCell();
  newCell.innerHTML = `
    <button id="${isSource ? "source" : "destination"}-currency-button-name-${iter + 1}" class="btn btn-small btn-info">
      ${name}
    </button>
  `;
  newCell.scope = "col";
  
  newCell = newRow.insertCell();
  newCell.textContent = abbr;
  newCell.scope = "col";
  newCell.classList.add("small", "fst-italic", "py-0", "my-0", "align-middle");

  const cellButtonElement = document.getElementById(`${isSource ? "source" : "destination"}-currency-button-name-${iter + 1}`);
  
  cellButtonElement.addEventListener("click", () => {
    if (isSource) {
      sourceCurrencyAbbr = abbr;
      sourceCurrencyName = name;
      sourceCurrencyHeaderElement.innerHTML = "Convert From [<i>" + name + " (" + abbr.toUpperCase() + ")" + "</i>]";
    }
    else {
      destinationCurrencyAbbr = abbr;
      destinationCurrencyName = name;
      destinationCurrencyHeaderElement.innerHTML = "Convert From [<i>" + name + " (" + abbr.toUpperCase() + ")" + "</i>]";
    }
    acquireExchangeRate();
  });

  if (isSource)
    sourceTableRowElementList.push(newRow);
  else
    destinationTableRowElementList.push(newRow);
}
// ====================================
function filterTableRow(isSource) {
  const isSourceParsed = isSource === "true";
  
  const inputValue = isSourceParsed ? sourceCurrencyFilterInputElement.value :
    destinationCurrencyFilterInputElement.value;
    
  if (isSourceParsed) {
    sourceTableRowElementList.forEach((row, iter) => {
      if (isSourceParsed && !sourceTableVisibility) {
        row.style.display = "none";
        return;
      }
      
      switch (sourceFilterQuery.toLowerCase()) {
        case "name":
          row.style.display = currenciesData[iter].name.includes(inputValue) ? "" : "none";
          break;
        case "abbr":
          row.style.display = currenciesData[iter].abbr.includes(inputValue) ? "" : "none";
          break;
        case "none":
          row.style.display = "";
          break;
      }
    });
  }
  else {
    destinationTableRowElementList.forEach((row, iter) => {
      if (!isSourceParsed && !destinationTableVisibility) {
        row.style.display = "none";
        return;
      }
      
      switch (destinationFilterQuery.toLowerCase()) {
        case "name":
          row.style.display = currenciesData[iter].name.includes(inputValue) ? "" : "none";
          break;
        case "abbr":
          row.style.display = currenciesData[iter].abbr.includes(inputValue) ? "" : "none";
          break;
        case "none":
          row.style.display = "";
          break;
      }
    });
  }
}
// ====================================
function acquireExchangeRate() {
  if (sourceCurrencyAbbr.trim().length <= 0 || destinationCurrencyAbbr.trim().length <= 0)
    return;
  
  const sourceAmount = sourceCurrencyAmountElement.value;

  // Debug
  //console.log("[Acquire Exchange Rate] Source Amount: " + sourceAmount);
  //console.log("[Acquire Exchange Rate] Source Abbr: " + sourceCurrencyAbbr);
  //console.log("[Acquire Exchange Rate] Dest Abbr: " + destinationCurrencyAbbr);

  exchangeMarkerElement.innerHTML = `Loading Exchange Rates...`;
  getExchangeRate(sourceCurrencyAbbr, destinationCurrencyAbbr, (rate) => {
    // Debug
    //console.log(`[Exchange Rate between ${sourceCurrencyAbbr} and ${destinationCurrencyAbbr}] Result.`, result);

    exchangeMarkerElement.innerHTML = `Exchange Rate between 
    <span class="text-info">[${sourceCurrencyName} (${sourceCurrencyAbbr})]</span> and 
    <span class="text-info">[${destinationCurrencyName} (${destinationCurrencyAbbr})]</span> is 
    <span class="text-info">~${rate.toFixed(2)}</span>.`;

    if (sourceAmount.trim().length > 0)
      destinationCurrencyElement.value = (sourceAmount * rate).toFixed(2);
  });
}
// ====================================
function setSourceFilterQuery(query) {
  sourceFilterQuery = query.toLowerCase();

  switch (sourceFilterQuery.toLowerCase()) {
    case "name":
      sourceCurrencyButtonSelectorElement.textContent = "Name";
      sourceCurrencyFilterInputElement.value = "";
      
      sourceCurrencyFilterInputElement.classList.remove("hidden");
      sourceCurrencyFilterButtonElement.classList.remove("hidden");
      sourceCurrencyFilterButtonElement.classList.add("btn", "btn-sm", "btn-info");
      break;
    case "abbr":
      sourceCurrencyButtonSelectorElement.textContent = "Abbr.";
      sourceCurrencyFilterInputElement.value = "";
      
      sourceCurrencyFilterInputElement.classList.remove("hidden");
      sourceCurrencyFilterButtonElement.classList.remove("hidden");
      sourceCurrencyFilterButtonElement.classList.add("btn", "btn-sm", "btn-info");
      break;
    case "none":
      sourceCurrencyButtonSelectorElement.textContent = "Select";
      
      sourceCurrencyFilterInputElement.classList.add("hidden");
      sourceCurrencyFilterButtonElement.classList.add("hidden");
      sourceCurrencyFilterButtonElement.classList.remove("btn", "btn-sm", "btn-info");

      filterTableRow("true");
      break;
  }
}

function setDestinationFilterQuery(query) {
  destinationFilterQuery = query.toLowerCase();

  switch (destinationFilterQuery.toLowerCase()) {
    case "name":
      destinationCurrencyButtonSelectorElement.textContent = "Name";
      destinationCurrencyFilterInputElement.value = "";
      
      destinationCurrencyFilterInputElement.classList.remove("hidden");
      destinationCurrencyFilterButtonElement.classList.remove("hidden");
      destinationCurrencyFilterButtonElement.classList.add("btn", "btn-sm", "btn-info");
      break;
    case "abbr":
      destinationCurrencyButtonSelectorElement.textContent = "Abbr.";
      destinationCurrencyFilterInputElement.value = "";
      
      destinationCurrencyFilterInputElement.classList.remove("hidden");
      destinationCurrencyFilterButtonElement.classList.remove("hidden");
      destinationCurrencyFilterButtonElement.classList.add("btn", "btn-sm", "btn-info");
      break;
    case "none":
      destinationCurrencyButtonSelectorElement.textContent = "Select";
      
      destinationCurrencyFilterInputElement.classList.add("hidden");
      destinationCurrencyFilterButtonElement.classList.add("hidden");
      destinationCurrencyFilterButtonElement.classList.remove("btn", "btn-sm", "btn-info");
      
      filterTableRow("false");
      break;
  }
}
// ====================================
window.onPageLoaded = onPageLoaded;

window.acquireExchangeRate = acquireExchangeRate;

window.setSourceFilterQuery = setSourceFilterQuery;
window.setDestinationFilterQuery = setDestinationFilterQuery;

window.filterTableRow = filterTableRow;
// ====================================