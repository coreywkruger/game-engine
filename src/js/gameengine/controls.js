class Controls {
  constructor() {
    this.actions = {};
    this.keyCodes = {};
    this.started = false;
  }
  onKeyDown(keyCode) {
    this.keyCodes[keyCode] = true;
    if (!this.started) {
      this.started = true;
      this.go();
    }
  }
  onKeyUp(keyCode) {
    this.keyCodes[keyCode] = false;
    for (var key in this.keyCodes) {
      if (this.keyCodes[key]) return;
    }
    this.started = false;
  }
  go() {
    if (this.started) {
      setTimeout(() => {
        for (var key in this.keyCodes) {
          if (this.keyCodes[key] && this.actions[key]) this.actions[key]();
        }
        this.go();
      }, 1);
    }
  }
  bindKey(key, cb) {
    this.actions[key] = cb;
  }
}

export { Controls };
