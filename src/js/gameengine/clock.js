class Ticker {
  constructor(rate) {
    this.rate = rate;
    this.frame = 0;
  }
  tick(callback) {
    this.frame++;
    if (this.frame > this.rate) {
      this.frame = 0;
      callback();
    }
  }
}

export { Ticker };
