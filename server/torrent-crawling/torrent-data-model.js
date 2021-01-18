export class TorrentDataModel {
  constructor({ peers, seeds, magnetUri, image, uploaded, name, size }) {
    this.peers = peers;
    this.seeds = seeds;
    this.magnetUri = magnetUri;
    this.image = image;
    this.name = name;
    this.size = size;
    this.uploaded = uploaded;
  }
}
