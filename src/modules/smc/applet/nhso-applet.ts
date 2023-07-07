import { CommandApdu } from 'smartcard';
var legacy = require('legacy-encoding');
import { getData } from '../helper/reader';
import { apduNhso } from '../apdu';

export class NhsoApplet {
  constructor(private card: any, private req = [0x00, 0xc0, 0x00, 0x00]) {}

  async getInfo(): Promise<any> {
    const info: any = {};

    // check card
    await this.card.issueCommand(
      new CommandApdu(
        new CommandApdu({
          bytes: [...apduNhso.SELECT, ...apduNhso.NHSO_CARD],
        }),
      ),
    );

    // maininscl
    let data = await getData(this.card, apduNhso.CMD_MAININSCL, this.req);
    info.maininscl = legacy
      .decode(data, 'tis620')
      .slice(0, -2)
      .toString()
      .trim();

    // subinscl
    data = await getData(this.card, apduNhso.CMD_SUBINSCL, this.req);
    info.subinscl = legacy
      .decode(data, 'tis620')
      .slice(0, -2)
      .toString()
      .trim();

    // hmain name
    data = await getData(this.card, apduNhso.CMD_MAIN_HOSPITAL_NAME, this.req);
    info.mainHospitalName = legacy
      .decode(data, 'tis620')
      .slice(0, -2)
      .toString()
      .trim();

    // sub hospital name
    data = await getData(this.card, apduNhso.CMD_SUB_HOSPITAL_NAME, this.req);
    info.subHospitalName = legacy
      .decode(data, 'tis620')
      .slice(0, -2)
      .toString()
      .trim();

    // paid type
    data = await getData(this.card, apduNhso.CMD_PAID_TYPE, this.req);
    info.paidType = data
      .slice(0, -2)
      .toString()
      .trim();

    // Issue Date
    data = await getData(this.card, apduNhso.CMD_ISSUE, this.req);
    data = data
      .slice(0, -2)
      .toString()
      .trim();
    // info.issueDate = dayjs(`${+data.slice(0, 4) - 543}-${data.slice(4, 6)}-${data.slice(6)}`).format();
    info.issueDate = `${+data.slice(0, 4) - 543}-${data.slice(4, 6)}-${data.slice(6)}`;

    // Expire Date
    data = await getData(this.card, apduNhso.CMD_EXPIRE, this.req);
    data = data
      .slice(0, -2)
      .toString()
      .trim();
    // info.expireDate = dayjs(`${+data.slice(0, 4) - 543}-${data.slice(4, 6)}-${data.slice(6)}`).format();
    info.expireDate = `${+data.slice(0, 4) - 543}-${data.slice(4, 6)}-${data.slice(6)}`;

    // Update Date
    data = await getData(this.card, apduNhso.CMD_UPDATE, this.req);
    data = data
      .slice(0, -2)
      .toString()
      .trim();
    // info.updateDate = dayjs(`${+data.slice(0, 4) - 543}-${data.slice(4, 6)}-${data.slice(6)}`).format();
    info.updateDate = `${+data.slice(0, 4) - 543}-${data.slice(4, 6)}-${data.slice(6)}`;

    // Change Hospital Amount
    data = await getData(this.card, apduNhso.CMD_CHANGE_HOSPITAL_AMOUNT, this.req);
    info.changeHospitalAmount = data
      .slice(0, -2)
      .toString()
      .trim();

    return info;
  }
}
