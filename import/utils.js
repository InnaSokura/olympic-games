function integerOrNull(value) {
  return Number.isInteger(+value) ? +value : null;
};

module.exports = {
  integerOrNull,
}
