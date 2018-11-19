module.exports = function(url) {
  return Promise.resolve(module.parent.require(url));
}
