export class TorrentDataModel {
  constructor({ peers, seeds, magnetUri, image, fileList, name, infoHash }) {
    this.peers = peers;
    this.seeds = seeds;
    this.magnetUri = magnetUri;
    this.image = image;
    this.fileList = fileList;
    this.name = name;
    this.infoHash = infoHash;
  }
}
