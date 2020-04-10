class Ticker {
  constructor(func) {
    this.frame = 0;
    this.func = func;
  }
  tick(time) {
    this.frame++;
    if (this.frame > time) {
      this.frame = 0;
      this.func();
    }
  }
}

export { Ticker };