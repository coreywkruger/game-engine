export default class Peer {
  constructor(args) {
    this.from = args.from;
    this.to = args.to;
    this.sendToPeerService = null;
    this.onmessage = null;
    this.onconnect = null;
    this.onclose = null;
    this.connected = false;
    this.channels = {};

    // new peer
    this.localPeer = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.services.mozilla.com" },
        { urls: "stun:stun.l.google.com:19302" },
      ],
    });
    // check if connected
    this.localPeer.oniceconnectionstatechange = (event) => {
      if (this.localPeer.iceConnectionState === "connected") {
        this.connected = true;
        this.onconnect();
      } else if (this.localPeer.iceConnectionState === "disconnected") {
        this.connected = false;
        this.onclose();
      }
    };
    // new ice candidate
    this.localPeer.onicecandidate = (event) => {
      if (event.candidate != null) {
        this.sendToPeerService({
          type: "ice",
          data: event.candidate,
          from: this.from,
          to: this.to,
        });
      }
    };
    // data channel opened by other end of connection
    this.localPeer.ondatachannel = (event) => {
      let label = event.channel.label;
      this.channels[label] = event.channel;
      this.channels[label].onmessage = (event) => this.onmessage(event.data);
      this.channels[label].onclose = (event) => this.onclose();
    };
  }
  createDataChannel(label) {
    let channel = this.localPeer.createDataChannel(label, {
      ordered: false,
      maxRetransmitTime: 1000,
    });
    channel.onmessage = (event) => this.onmessage(event.data);
    channel.onclose = (event) => this.onclose();
    this.channels[label] = channel;
  }
  sendToPeer(label, message) {
    if (this.channels[label] && this.channels[label].readyState === "open") {
      this.channels[label].send(message);
    }
  }
  offer(channels) {
    this.createDataChannel("message");
    this.localPeer
      .createOffer()
      .then((offer) => this.localPeer.setLocalDescription(offer))
      .then(() =>
        this.sendToPeerService({
          type: "sdp",
          data: this.localPeer.localDescription,
          from: this.from,
          to: this.to,
        })
      );
  }
  answer(remoteDescription) {
    this.localPeer
      .setRemoteDescription(new RTCSessionDescription(remoteDescription))
      .then(() => this.localPeer.createAnswer())
      .then((answer) => this.localPeer.setLocalDescription(answer))
      .then(() =>
        this.sendToPeerService({
          type: "sdp",
          data: this.localPeer.localDescription,
          from: this.from,
          to: this.to,
        })
      );
  }
  accept(remoteDescription) {
    this.localPeer.setRemoteDescription(new RTCSessionDescription(remoteDescription));
  }
  negotiateRoute(ice) {
    this.localPeer.addIceCandidate(new RTCIceCandidate(ice));
  }
}
