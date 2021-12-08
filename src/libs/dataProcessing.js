const getCryptoPricesOnRange = async (data) => {
  let cryptoSymbol = await getCryptoSymbol(data.asset);
  let from = new Date(data.from).valueOf() / 1000;
  let to = new Date(data.to).valueOf() / 1000;
  let apiUrlRange = `https://api.coingecko.com/api/v3/coins/${cryptoSymbol}/market_chart/range?vs_currency=usd&from=${from}&to=${to}`;

  let receivedData = await getRangedCryptoData(apiUrlRange);
  let arr = receivedData.prices.map(
    (el) => new Date(el[0]).toISOString().slice(0, 10) + ', ' + el[1]
  );
  console.log(arr);

  return arr;
};

const getCryptoSymbol = async (cryptoName) => {
  let newCryptoName = cryptoName[0].toUpperCase() + cryptoName.slice(1);
  const apiUrl = 'https://api.coingecko.com/api/v3/coins/list';

  let response = await fetch(apiUrl);
  let coinsData = await response.json();

  return coinsData.find((asset) => asset.name === newCryptoName).id;
};

const getRangedCryptoData = async (readyUrl) => {
  let response = await fetch(readyUrl);
  return response.json();
};

module.exports = {
  getCryptoPricesOnRange,
};
