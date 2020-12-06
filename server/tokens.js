module.exports = {
  tokens: [],
  add: function(token) {
    console.log("Adding", token, "to tokens");
    this.tokens.push(token);
  },
};
