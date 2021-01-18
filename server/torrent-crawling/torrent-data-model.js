export class TorrentDataModel {
  constructor({ leech, seeds, magnetUri, image, uploaded, name, size }) {
    this.leech = leech;
    this.seeds = seeds;
    this.magnetUri = magnetUri;
    this.image = image;
    this.name = name;
    this.size = size;
    this.uploaded = uploaded;
  }
}
