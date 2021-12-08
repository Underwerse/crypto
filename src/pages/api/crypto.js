const {
  checkIsHeaderOk,
  checkIsRequestDate,
} = require('../../libs/requestProcessing');

const { getCryptoPricesOnRange } = require('../../libs/dataProcessing');

const handler = async (req, res) => {
  const { method, headers } = req;

  try {
    let headerCheck = checkIsHeaderOk(headers);
    switch (method) {
      case 'GET':
        if (!headerCheck.isValid) {
          return res.status(400).json({
            error: headerCheck.message,
          });
        }
        await getCryptoData(req, res);
        break;
      case 'POST':
        break;
      default:
        return res.status(400).json({
          data: 'No data fetched, check your request',
        });
    }
  } catch (err) {
    const error = `Error: Invalid Request Method. ${err}`;
    return res.status(400).json({
      error: error,
    });
  }
};

const getCryptoData = async (req, res) => {
  try {
    let resultCryptoData;
    let msg = [];
    let reqData = {};
    let cryptoAsset;

    typeof req.query.asset != 'undefined'
      ? (cryptoAsset = req.query.asset)
      : (cryptoAsset = 'bitcoin');

    if (req.query.from && req.query.to) {
      if (
        checkIsRequestDate(req.query.from) &&
        checkIsRequestDate(req.query.to)
      ) {
        reqData.from = req.query.from;
        reqData.to = req.query.to;
        reqData.asset = cryptoAsset;
        resultCryptoData = await getCryptoPricesOnRange(reqData);
      } else {
        msg.push({
          message: 'Wrong dates',
        });
      }
    }
    resultCryptoData > 0
      ? res.status(200).json(resultCryptoData)
      : res.json(msg);
  } catch (error) {
    return res.status(400).json({
      message: `Invalid Request Method: check requested asset's symbol`,
      error: error.message,
    });
  }
};

export default handler;
