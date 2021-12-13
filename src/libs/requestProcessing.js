/**
 * Function checks if headers correct or not
 * @param {Object} headers - request-headers
 * @returns object with validity-flag and message
 */
const checkIsHeaderOk = (headers) => {
  let res = { isValid: false, message: '' };
  if (headers['content-type'] === 'application/json') {
    res.isValid = true;
    return res;
  }
  res.message = `Header must be set to 'content-type':'application/json'`;

  return res;
};

/**
 * Function checks if provided date-value in correct JS-Date format or not
 * @param {Date} data - date in String-format
 * @returns true if provided string in JS-Date format
 */
const checkIsRequestDate = (data) => !Number.isNaN(Date.parse(data));

module.exports = {
  checkIsHeaderOk,
  checkIsRequestDate,
};
