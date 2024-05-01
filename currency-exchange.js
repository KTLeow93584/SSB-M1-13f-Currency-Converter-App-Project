// ====================================
// Referenced Currency API: https://github.com/fawazahmed0/currency-api
// Example URL:
// https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@{date}/v1/{endpoint}
const baseURL = "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/";
const currencySubURL = "currencies";
const currencyListURL = "currencies.json";

let loadedCurrencyAbbrList = [];
let loadedCurrencyNameList = [];
let loadedCurrencyObjList = [];

let cachedCurrencyExchangeList = [];
let cacheDate = null;
const millisecondsPerDay = (24 * 60 * 60 * 1000);
// ====================================
export function getAllSupportedCurrencies(onSuccessfulCallback = null) {
  fetch(baseURL + currencyListURL)
    .then((response) => response.json())
    .then((result) => {
      loadedCurrencyAbbrList = Object.keys(result).map((abbr) => abbr.toUpperCase());
      loadedCurrencyNameList = Object.values(result);

      for (let i = 0; i < loadedCurrencyAbbrList.length; ++i) {
        if (loadedCurrencyNameList[i].trim().length <= 0)
          continue;

        loadedCurrencyObjList.push({
          name: loadedCurrencyNameList[i].trim().length > 0 ? loadedCurrencyNameList[i] : "",
          abbr: loadedCurrencyAbbrList[i]
        });
      }
      loadedCurrencyObjList.sort((element1, element2) => element1.name.localeCompare(element2.name));

      // Debug
      //console.log("[Keys] Abbreviation List.", loadedCurrencyAbbrList);
      //console.log("[Values] Currency Name List.", loadedCurrencyNameList);

      if (onSuccessfulCallback)
        onSuccessfulCallback(loadedCurrencyObjList);
    });
}

export function getCurrencyFullName(abbr) {
  const abbrIndex = loadedCurrencyAbbrList.indexOf(abbr);
  return loadedCurrencyNameList[abbrIndex];
}

export function getCurrencyAbbreviation(name) {
  const nameIndex = loadedCurrencyNameList.indexOf(name);
  return loadedCurrencyAbbrList[nameIndex];
}

export function getExchangeRate(sourceAbbr, destAbbr, onSuccessfulCallback = null) {
  const sourceIndex = loadedCurrencyAbbrList.indexOf(sourceAbbr);
  const destIndex = loadedCurrencyAbbrList.indexOf(destAbbr);

  if (sourceIndex === -1 || destIndex === -1) {
    alert(sourceIndex === -1 ? "Invalid Source Currencies." : "Invalid Destination Currencies.");
    return;
  }

  // For cache to be valid, the system date has to match the server date. If the next day has come to pass, requery again.
  const cachedResult = cachedCurrencyExchangeList.find((element) => element.source == sourceAbbr && element.dest == destAbbr);
  const today = new Date();

  let useCache = cacheDate !== null;
  if (useCache) {
    const millisecondsDiff = Math.abs(cacheDate.getTime() - today.getTime());
    useCache = millisecondsDiff < millisecondsPerDay && cachedResult !== null && cachedResult !== undefined;
  }

  // Debug
  //console.log("Use Cache.", useCache);

  // Grab Result from Live Server
  if (!useCache) {
    cacheDate = new Date();
    const url = baseURL + currencySubURL + "/" + sourceAbbr.toLowerCase() + ".json";

    // Debug
    //console.log("URL.", url);

    fetch(url)
      .then((response) => {
        // Debug
        //console.log("Response.", response);

        return response.json();
      })
      .then((result) => {
        const currencies = result["00"];

        // Debug
        //console.log(`[Live Exchange between ${sourceAbbr} and ${destAbbr}] Result.`, currencies);
        const rate = currencies[destAbbr.toLowerCase()];

        // Debug
        //console.log("Rate.", rate);

        const newObj = {
          source: sourceAbbr,
          dest: destAbbr,
          rate: rate
        };

        cachedCurrencyExchangeList.push(newObj);

        if (onSuccessfulCallback)
          onSuccessfulCallback(rate);
      });
  }
  // Use Cached Result
  else {
    // Debug
    //console.log("[Cached] Result.", cachedResult);

    if (onSuccessfulCallback)
      onSuccessfulCallback(cachedResult.rate);
  }
}
// ====================================