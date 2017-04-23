import jquery from "jquery";

function KeyboardControls() {
  this.actions = {};
  this.keyCodes = {};
  this.active = false;
  this._loop = null;
  jquery(window).on(
    "keydown",
    (function(event) {
      this.keyCodes[event.keyCode] = event.type == "keydown";
      this.active = true;
    }).bind(this)
  );

  jquery(window).on(
    "keyup",
    (function(event) {
      this.keyCodes[event.keyCode] = event.type == "keydown";
      for (var key in this.keyCodes) {
        if (this.keyCodes[key]) return;
      }
      this.active = false;
    }).bind(this)
  );

  this._loop = setInterval(
    (function() {
      if (this.active) {
        for (var key in this.keyCodes) {
          if (this.keyCodes[key] && this.actions[key]) {
            this.actions[key]();
          }
        }
      }
    }).bind(this),
    1
  );
}

KeyboardControls.prototype.createAction = function(key, cb) {
  this.actions[key] = cb;
};

export default KeyboardControls;