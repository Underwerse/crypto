/**
 *
 * @param {object} data - request data
 * @returns object with fetched and filtered crypto data
 */
const getCryptoDataOnRange = async (data) => {
  let finalResult = {};

  let cryptoId = await getCryptoId(data.asset);
  let from = new Date(data.from).valueOf() / 1000;
  let to = new Date(data.to).valueOf() / 1000 + 24 * 60 * 60;
  let apiUrlRange = `https://api.coingecko.com/api/v3/coins/${cryptoId}/market_chart/range?vs_currency=eur&from=${from}&to=${to}`;

  let receivedData = await getRangedCryptoData(apiUrlRange);

  let pricesArr = receivedData.prices.map(
    (el) => new Date(el[0]).toISOString().slice(0, 10) + ', ' + el[1]
  );

  let volumesArr = receivedData.total_volumes.map(
    (el) => new Date(el[0]).toISOString().slice(0, 10) + ', ' + el[1]
  );

  let slicedByDatesPricesArr = sliceCrytpoDataArray(
    pricesArr,
    data.from,
    data.to
  );
  let slicedByDatesVolumesArr = sliceCrytpoDataArray(
    volumesArr,
    data.from,
    data.to
  );
  let dayPricesArrDayDiffs = [];
  let dayPricesArr = [];
  let dayVolumesArr = [];
  let daysAndVolumes = [];
  let uniqueDates = [];

  if (Array.isArray(slicedByDatesPricesArr[0])) {
    let tempPricesChunk = [];

    for (let i = 0; i < slicedByDatesPricesArr.length; i++) {
      let elArrLength = slicedByDatesPricesArr[i].length;
      dayPricesArrDayDiffs.push(
        slicedByDatesPricesArr[i][elArrLength - 1].split(', ')[1] -
          slicedByDatesPricesArr[i][0].split(', ')[1]
      );

      tempPricesChunk = [];
      for (let j = 0; j < slicedByDatesPricesArr[i].length; j++) {
        tempPricesChunk.push(
          parseFloat(slicedByDatesPricesArr[i][j].split(', ')[1])
        );
      }
      let minPriceInChunk = getMinFromArray(tempPricesChunk);
      let maxPriceInChunk = getMaxFromArray(tempPricesChunk);
      let avgPriceInChunk =
        tempPricesChunk.reduce((a, b) => a + b) / tempPricesChunk.length;
      dayPricesArr.push(
        `minPrice: ${minPriceInChunk}, maxPrice: ${maxPriceInChunk}, avgPrice: ${avgPriceInChunk}`
      );
    }

    slicedByDatesVolumesArr.map((el) => {
      dayVolumesArr.push(getAverage(el));
      uniqueDates.push(el[0].split(', ')[0]);
      daysAndVolumes.push(el[0].split(', ')[0] + ', ' + getAverage(el));
    });
  } else {
    for (let i = 0; i < slicedByDatesPricesArr.length - 1; i++) {
      dayPricesArrDayDiffs.push(
        slicedByDatesPricesArr[i + 1].split(', ')[1] -
          slicedByDatesPricesArr[i].split(', ')[1]
      );
    }

    dayPricesArr = slicedByDatesPricesArr.map((el) =>
      parseFloat(el.split(', ')[1])
    );

    dayVolumesArr = slicedByDatesVolumesArr.map((el) =>
      parseFloat(el.split(', ')[1])
    );
    uniqueDates = slicedByDatesVolumesArr.map((el) => el.split(', ')[0]);
  }

  finalResult.maxDescDays = getMaxDecreasingPriceDays(dayPricesArrDayDiffs);
  finalResult.maxVolumeInEur = getHighestVolumeData(dayVolumesArr).maxVolume;
  finalResult.maxVolumeDate =
    uniqueDates[getHighestVolumeData(dayVolumesArr).index];

  if (checkIfAllDescending(dayPricesArrDayDiffs)) {
    finalResult.whenToBuy = `Should't buy crypto at all`;
    finalResult.whenToSell = `No time to sell crypto`;
  } else {
    if (Array.isArray(slicedByDatesPricesArr[0])) {
      let minPricesArr = dayPricesArr.map((el) => {
        return el.split(', ')[0].split('minPrice: ')[1];
      });
      let minPriceFromArr = getMinFromArray(minPricesArr);
      let maxPricesArr = dayPricesArr.map((el) => {
        return el.split(', ')[1].split('maxPrice: ')[1];
      });
      let maxPriceFromArr = getMaxFromArray(maxPricesArr);
      finalResult.whenToBuy =
        uniqueDates[minPricesArr.indexOf(String(minPriceFromArr))];
      finalResult.whenToSell =
        uniqueDates[maxPricesArr.indexOf(String(maxPriceFromArr))];
    } else {
      finalResult.whenToBuy =
        uniqueDates[dayPricesArr.indexOf(getMinFromArray(dayPricesArr))];
      finalResult.whenToSell =
        uniqueDates[dayPricesArr.indexOf(getMaxFromArray(dayPricesArr))];
    }
  }

  return finalResult;
};

/**
 *
 * @param {Array} el - array of String-elements in format 'date, value'
 * @returns Float average value
 */
const getAverage = (el) => {
  let arr = el.map((el) => parseFloat(el.split(', ')[1]));
  let average = arr.reduce((a, b) => a + b) / arr.length;
  return average;
};

/**
 *
 * @param {Array} arr - array of daily volumes
 * @returns object with maximum value and it's index
 */
const getHighestVolumeData = (arr) => {
  let res = {
    index: 0,
    maxVolume: 0,
  };
  res.maxVolume = getMaxFromArray(arr);
  res.index = arr.indexOf(res.maxVolume);

  return res;
};

/**
 *
 * @param {Array} arr - array of daily price differences
 * @returns maximum number of consistently decreasing days
 */
const getMaxDecreasingPriceDays = (arr) => {
  let maxCounter = 0;
  let negativeCountersArr = [];
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] < 0) {
      maxCounter += 1;
    } else {
      if (maxCounter > 0) {
        negativeCountersArr.push(maxCounter);
        maxCounter = 0;
      }
      continue;
    }
  }
  if (negativeCountersArr.length === 0) {
    negativeCountersArr.push(maxCounter);
  }
  return getMaxFromArray(negativeCountersArr);
};

/**
 *
 * @param {Array} arr - array of numbers
 * @returns maximum value
 */
const getMaxFromArray = (arr) => {
  return Math.max.apply(null, arr);
};

/**
 *
 * @param {Array} arr - array of numbers
 * @returns minimum value
 */
const getMinFromArray = (arr) => {
  return Math.min.apply(null, arr);
};

/**
 *
 * @param {Array} arr - array of daily price differences
 * @returns true if all the elements are negative
 */
const checkIfAllDescending = (arr) => {
  return !arr.some((el) => el > 0);
};

/**
 *
 * @param {Array} arr - array of String-elements in format 'date, value'
 * @param {*} from - start date in format 'YYYY-mm-dd'
 * @param {*} to - end date in format 'YYYY-mm-dd'
 * @returns array of arrays of devided by different dates
 * String-elements in format 'date, value'
 */
const sliceCrytpoDataArray = (arr, from, to) => {
  let start = new Date(from);
  let end = new Date(to);

  let daysQty = 1 + (end - start) / 1000 / 60 / 60 / 24;

  let tempArray = [];

  if (daysQty <= 90) {
    for (let index = 0; index < arr.length; index += arr.length / daysQty) {
      let myChunk = arr.slice(index, index + arr.length / daysQty);
      tempArray.push(myChunk);
    }
    return tempArray;
  } else {
    return arr;
  }
};

/**
 *
 * @param {String} cryptoName - three-letters asset's code (like btc, xrp, eth etc)
 * @returns official asset's long name (like bitcoin, ripple, etherium etc)
 */
const getCryptoId = async (cryptoName) => {
  const apiUrl = 'https://api.coingecko.com/api/v3/coins/list';

  let response = await fetch(apiUrl);
  let coinsData = await response.json();

  return coinsData.find((asset) => asset.symbol === cryptoName).id;
};

/**
 *
 * @param {String} readyUrl - defined by user's request API-url
 * @returns RAW array of crypto data from API
 */
const getRangedCryptoData = async (readyUrl) => {
  let response = await fetch(readyUrl);
  return response.json();
};

module.exports = {
  getCryptoDataOnRange,
  getAverage,
  getHighestVolumeData,
  getMaxDecreasingPriceDays,
  getMaxFromArray,
  getMinFromArray,
  checkIfAllDescending,
  sliceCrytpoDataArray,
  getCryptoId,
  getRangedCryptoData,
};
