import uuid from "uuid";
import Peer from "./peer";

export default class WebRTCClient {
  constructor(config) {
    this.id = uuid.v4();
    this.onmessage = null;
    this.onconnect = null;
    this.onclose = null;
    this.peers = {};
    this.availablePeers = [];
  }
  start(host) {
    // create a websocket connection to connect to the peering service
    this.wsConnection = new WebSocket(`ws://${host}`);

    this.sendToPeerService = (message) => {
      this.wsConnection.send(JSON.stringify(message));
    };
    // on message from peer service
    this.wsConnection.onmessage = (message) => {
      this.onMessageFromBroker(JSON.parse(message.data));
    };
  }
  onMessageFromBroker(message) {
    const from = String(message.from);

    switch (message.type) {
      case "discovery":
        // if not already connected, connect
        if (! this.peers[from]) {
          this.newConnection(from).offer()
        }
        break;

      case "ice":
        console.log("ice", from, message.data);
        this.peers[from].negotiateRoute(message.data);
        break;

      case "sdp":
        console.log("sdp", from, message.data);
        if (message.data.type === "offer") {
          // create new connection and send answer to offer
          this.newConnection(from).answer(message.data);
        } else if (message.data.type === "answer") {
          // accept answer
          this.peers[from].accept(message.data);
        }
        break;
      default:
        break;
    }
  }
  // create a new connection
  newConnection(to) {
    let peer = new Peer({ from: this.id, to });
    peer.sendToPeerService = this.sendToPeerService;
    peer.onmessage = this.onmessage;
    peer.onconnect = () => this.onconnect(to);
    peer.onclose = () => {
      this.onclose(to);
      delete this.peers[id];
    };
    this.peers[to] = peer;
    return peer;
  }
  // broadcast to all connections
  broadcast(message) {
    for (var id in this.peers) {
      this.peers[id].sendToPeer("message", JSON.stringify(message));
    }
  }
  ping() {
    this.sendToPeerService({
      type: "discovery",
      from: this.id,
    });
  }
}
