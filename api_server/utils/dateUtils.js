const moment = require('moment');

function convertLocalStringToDate(
  localString,
  hour = undefined,
  minute = undefined,
  second = undefined
) {
  const temp_date = new Date(localString);

  let year = temp_date.getFullYear();
  let month = temp_date.getUTCMonth() + 1;
  let day = temp_date.getUTCDate();
  day = '' + day;
  if (day.length === 1) {
    day = '0' + day;
  }
  if (hour === undefined && minute === undefined && second === undefined) {
    return new Date(`${year}-${month}-${day}`);
  } else {
    return new Date(`${year}-${month}-${day} ${hour}:${minute}:${second}`);
  }
}

function getMidNighOfDate() {
  return moment(new Date()).format('YYYY-MM-DD 00:00:00');
}

function getDate() {
  return moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
}

function stringToDate(dateStr) {
  return moment(dateStr, 'YYYY-MM-DD 00:00:00').toDate();
}

function stringToDateTime(dateStr) {
  return moment(dateStr).format('YYYY-MM-DD HH:mm:ss').toDate();
}

function dateToStr(date) {
  return moment(date).format('YYYY-MM-DD');
}

function dateTimeToStr(date) {
  return moment(date).format('YYYY-MM-DD HH:mm:ss');
}

function createIntervalDatesSalesObject(start_date, end_date) {
  const result = {};
  const startDateObj = stringToDate(start_date);
  const endDateObj = stringToDate(end_date);
  let curDateObj = startDateObj;
  while (true) {
    if (curDateObj > endDateObj) {
      break;
    }
    result[dateToStr(curDateObj)] = 0;
    curDateObj = moment(curDateObj).add(1, 'days').toDate();
  }
  return result;
}

module.exports = {
  convertLocalStringToDate,
  getDate,
  getMidNighOfDate,
  stringToDate,
  stringToDateTime,
  dateToStr,
  dateTimeToStr,
  createIntervalDatesSalesObject,
};
