// const getAllCryptoData = async (data) => {
//   let days = getCryptoPricesOnRange(data)[0];
//   let volume = getCryptoVolumeOnRange(data);
//   return { days, volume };
// };

// const getCryptoVolumeOnRange = async (data) => {

// }

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

  let slicedPricesArr = sliceCrytpoDataArray(pricesArr, data.from, data.to);
  let slicedVolumesArr = sliceCrytpoDataArray(volumesArr, data.from, data.to);
  let dayPricesArr = [];
  let dayVolumesArr = [];
  let daysAndVolumes = [];
  let uniqueDates = [];

  if (Array.isArray(slicedPricesArr[0])) {
    dayPricesArr = slicedPricesArr.map(
      (el) => el[el.length - 1].split(', ')[1] - el[0].split(', ')[1]
    );

    slicedVolumesArr.map((el) => {
      dayVolumesArr.push(getAverage(el));
      uniqueDates.push(el[0].split(', ')[0]);
      daysAndVolumes.push(el[0].split(', ')[0] + ', ' + getAverage(el));
    });
  } else {
    for (let i = 0; i < slicedPricesArr.length - 1; i++) {
      dayPricesArr.push(
        slicedPricesArr[i + 1].split(', ')[1] -
          slicedPricesArr[i].split(', ')[1]
      );
    }
    dayVolumesArr = slicedVolumesArr.map((el) => parseFloat(el.split(', ')[1]));
    uniqueDates = slicedVolumesArr.map((el) => el.split(', ')[0]);
  }

  finalResult.maxDescDays = getMaxDecreasingPriceDays(dayPricesArr);
  finalResult.maxVolume = getHighestVolumeData(dayVolumesArr).maxVolume;
  finalResult.maxVolumeDate =
    uniqueDates[getHighestVolumeData(dayVolumesArr).index];

  return finalResult;
};

const getAverage = (el) => {
  let arr = el.map((el) => parseFloat(el.split(', ')[1]));
  let average = arr.reduce((a, b) => a + b) / arr.length;
  return average;
};

const getHighestVolumeData = (arr) => {
  let res = {
    index: 0,
    maxVolume: 0,
  };
  res.maxVolume = Math.max.apply(null, arr);
  res.index = arr.indexOf(res.maxVolume);

  return res;
};

const getMaxDecreasingPriceDays = (arr) => {
  let maxCounter = 0;
  let negativeCountersArr = [];
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] < 0) {
      maxCounter += 1;
    } else {
      if (maxCounter > 0) {
        negativeCountersArr.push(maxCounter);
      }
      maxCounter = 0;
    }
  }
  return Math.max.apply(null, negativeCountersArr);
};

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

const getCryptoId = async (cryptoName) => {
  // let newCryptoName = cryptoName[0].toUpperCase() + cryptoName.slice(1);
  const apiUrl = 'https://api.coingecko.com/api/v3/coins/list';

  let response = await fetch(apiUrl);
  let coinsData = await response.json();

  return coinsData.find((asset) => asset.symbol === cryptoName).id;
};

const getRangedCryptoData = async (readyUrl) => {
  let response = await fetch(readyUrl);
  return response.json();
};

module.exports = {
  getCryptoDataOnRange,
};
