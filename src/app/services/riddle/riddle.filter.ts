export class RiddleFilter {
  riddleText?: string;
  qrCode?: { qrData?: string } | any;
  hunt?: any;
  sequence?: string;

  constructor() {
    this.riddleText = '';
    this.qrCode = { qrData: '' };
    this.hunt = null;
    this.sequence = '';
  }
}
