const getCryptoPricesOnRange = async (data) => {
  let cryptoId = await getCryptoId(data.asset);
  let from = new Date(data.from).valueOf() / 1000;
  let to = new Date(data.to).valueOf() / 1000 + 24 * 60 * 60;
  let apiUrlRange = `https://api.coingecko.com/api/v3/coins/${cryptoId}/market_chart/range?vs_currency=usd&from=${from}&to=${to}`;

  let receivedData = await getRangedCryptoData(apiUrlRange);
  let arr = receivedData.prices.map(
    (el) => new Date(el[0]).toISOString().slice(0, 10) + ', ' + el[1]
  );

  let slicedArr = sliceCrytpoDataArray(arr, data.from, data.to);
  let dayPricesArr = [];

  if (Array.isArray(slicedArr[0])) {
    dayPricesArr = slicedArr.map(
      (el) => el[el.length - 1].split(', ')[1] - el[0].split(', ')[1]
    );
  } else {
    for (let i = 0; i < slicedArr.length - 1; i++) {
      dayPricesArr.push(
        slicedArr[i + 1].split(', ')[1] - slicedArr[i].split(', ')[1]
      );
    }
  }
  // console.log(dayPricesArr);

  return getMaxDecreasingPriceDays(dayPricesArr);
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
  getCryptoPricesOnRange,
};
