import { Peer } from "peerjs";

let peer = new Peer();

export const connect = (id) => {
  const connection = peer.connect(id);
  connection.on("open", () => {
    console.log("data channel open");
    connection.send("uplink established");
  });
  
  connection.on("data", console.log);
  connection.on("open", console.log);
  connection.on("close", console.log);
  connection.on("error", console.log);

  return connection;
};