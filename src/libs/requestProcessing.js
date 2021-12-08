const checkIsHeaderOk = (headers) => {
  let res = { isValid: false, message: '' };
  if (headers['content-type'] === 'application/json') {
    res.isValid = true;
    return res;
  }
  res.message = `Header must be set to 'content-type':'application/json'`;

  return res;
};

const checkIsRequestDate = (data) => !Number.isNaN(Date.parse(data));

const checkIsRequestNumber = (seconds) => !Number.isNaN(seconds);

module.exports = {
  checkIsHeaderOk,
  checkIsRequestDate,
  checkIsRequestNumber,
};
