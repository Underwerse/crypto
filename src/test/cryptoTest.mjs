/* eslint-env mocha */
import assert from 'assert';
import { checkIsRequestDate } from '../libs/requestProcessing.js';

import {
  getAverage,
  getHighestVolumeData,
  getMaxDecreasingPriceDays,
  getMaxFromArray,
  getMinFromArray,
  sliceCrytpoDataArray,
} from '../libs/dataProcessing.js';

describe('Test cases for crypto-API', async () => {
  let dateVolumesArr = [
    '2021-12-07, 100',
    '2021-12-07, 400',
    '2021-12-07, 300',
    '2021-12-07, 200',
  ];

  let datePricesArr = [
    '2021-12-01, 44721.77431769078',
    '2021-12-01, 45011.831210984805',
    '2021-12-01, 44986.53185721538',
    '2021-12-02, 44929.07620634821',
    '2021-12-02, 45109.09633349153',
    '2021-12-02, 45118.82346864302',
    '2021-12-03, 45151.309649606876',
    '2021-12-03, 45279.35904679865',
    '2021-12-03, 45150.117756077096',
  ];

  it('Given the dates in different formatting, should always return true', () => {
    const reqDate1 = '2021-03-03';
    const reqDate2 = '01-01-2020';
    const reqDate3 = '01/01/2020';
    const reqDate4 = '01.01.2020';
    const reqDate5 = '2020/01/01';
    const reqDate6 = '2020.01.01';
    const wrongDate = '2020.01.0';

    assert.strictEqual(checkIsRequestDate(reqDate1), true);
    assert.strictEqual(checkIsRequestDate(reqDate2), true);
    assert.strictEqual(checkIsRequestDate(reqDate3), true);
    assert.strictEqual(checkIsRequestDate(reqDate4), true);
    assert.strictEqual(checkIsRequestDate(reqDate5), true);
    assert.strictEqual(checkIsRequestDate(reqDate6), true);
    assert.strictEqual(checkIsRequestDate(wrongDate), false);
  });

  it('Given an array of crypto data, should return average value', () => {
    assert.strictEqual(getAverage(dateVolumesArr), 250);
  });

  it('Given an array of crypto data, should return sliced array with daily data', () => {
    let result = sliceCrytpoDataArray(datePricesArr, 3);
    assert.strictEqual(result.length, 3);
    assert.strictEqual(result[1].length, 3);
  });

  it('Given an array of data, should return maximum found value', () => {
    let arr = dateVolumesArr.map((el) => el.split(', ')[1]);
    let result = getMaxFromArray(arr);
    assert.strictEqual(result, 400);
  });

  it('Given an array of data, should return minimum found value', () => {
    let arr = dateVolumesArr.map((el) => el.split(', ')[1]);
    let result = getMinFromArray(arr);
    assert.strictEqual(result, 100);
  });

  it(`Given an array of daily volumes, should return an object with maximum value and it's index`, () => {
    let arr = dateVolumesArr.map((el) => parseFloat(el.split(', ')[1]));
    let result = getHighestVolumeData(arr);
    assert.strictEqual(result.maxVolume, 400);
    assert.strictEqual(result.index, 1);
  });

  it(`Given an array of daily prices differences, should return an maximum number of continiously decreasing days`, () => {
    let dataArr = sliceCrytpoDataArray(datePricesArr, 3);
    let arr = dataArr.map(
      (el) => el[el.length - 1].split(', ')[1] - el[0].split(', ')[1]
    );
    let result = getMaxDecreasingPriceDays(arr);
    assert.strictEqual(result, 1);
  });
});
