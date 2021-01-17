const moment = require("moment-timezone");

const formatDate = date =>
  moment(date)
    .tz("Europe/Moscow")
    .format("DD.MM.YYYY HH:mm");

module.exports = { formatDate };
