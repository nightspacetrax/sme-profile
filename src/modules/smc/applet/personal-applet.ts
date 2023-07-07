import { CommandApdu } from 'smartcard';
var legacy = require('legacy-encoding');
// import * as reader from '../../helper/reader';
import { getData } from '../helper/reader';
import { apduPerson } from '../apdu';
import * as hex2imagebase64 from 'hex2imagebase64';

export class PersonalApplet {
  private card: any;
  private req: number[];

  constructor(card: any, req: number[] = [0x00, 0xc0, 0x00, 0x00]) {
    this.card = card;
    this.req = req;
  }

  async getInfo(query: string[] = ['cid']) {
    await this.card.issueCommand(
      new CommandApdu(new CommandApdu({
        bytes: [...apduPerson.SELECT, ...apduPerson.THAI_CARD],
      }))
    );

    const q = query.reduce((q, key) => ({
      ...q,
      [key]: true,
    }), {
      'cid': false,
      'name': false,
      'nameEn': false,
      'dob': false,
      'gender': false,
      'issuer': false,
      'issueDate': false,
      'expireDate': false,
      'address': false,
      'photo': false,
    });

    const info: any = {};
    let data: any;

    if (q.cid) {
      data = await getData(this.card, apduPerson.CMD_CID, this.req);
      info.cid = data.slice(0, -2).toString();
    }

    if (q.name) {
      data = await getData(this.card, apduPerson.CMD_THFULLNAME, this.req);
      data = legacy.decode(data, 'tis620');
      data = data
        .slice(0, -2)
        .toString()
        .trim()
        .split('#');
      const th = {
        prefix: data[0],
        firstname: data[1],
        middlename: data[2],
        lastname: data[3],
        fullname: data.reduce((name, d) => {
          if (d.length === 0) {
            return name;
          }
          return `${name} ${d}`;
        }, '').trim().replace(' ', ''),
      };

      info.name = th;
    }

    if (q.nameEn) {
      data = await getData(this.card, apduPerson.CMD_ENFULLNAME, this.req);
      data = legacy.decode(data, 'tis620');
      data = data
        .slice(0, -2)
        .toString()
        .trim()
        .split('#');
      const en = {
        prefix: data[0],
        firstname: data[1],
        middlename: data[2],
        lastname: data[3],
        fullname: data.reduce((name, d) => {
          if (d.length === 0) {
            return name;
          }
          return `${name} ${d}`;
        }, '').trim().replace(' ', ''),
      };

      info.nameEN = en;
    }

    if (q.dob) {
      data = await getData(this.card, apduPerson.CMD_BIRTH, this.req);
      data = data
        .slice(0, -2)
        .toString()
        .trim();
      info.dob = `${+data.slice(0, 4) - 543}-${data.slice(4, 6)}-${data.slice(6)}`;
    }

    if (q.gender) {
      data = await getData(this.card, apduPerson.CMD_GENDER, this.req);
      info.gender = data
        .slice(0, -2)
        .toString()
        .trim();
    }

    if (q.issuer) {
      data = await getData(this.card, apduPerson.CMD_ISSUER, this.req);
      info.issuer = legacy
        .decode(data, 'tis620')
        .slice(0, -2)
        .toString()
        .trim();
    }

    if (q.issueDate) {
      data = await getData(this.card, apduPerson.CMD_ISSUE, this.req);
      data = data
        .slice(0, -2)
        .toString()
        .trim();
      info.issueDate = `${+data.slice(0, 4) - 543}-${data.slice(4, 6)}-${data.slice(6)}`;
    }

    if (q.expireDate) {
      data = await getData(this.card, apduPerson.CMD_EXPIRE, this.req);
      data = data
        .slice(0, -2)
        .toString()
        .trim();
      info.expireDate = `${+data.slice(0, 4) - 543}-${data.slice(4, 6)}-${data.slice(6)}`;
    }

    if (q.address) {
      data = await getData(this.card, apduPerson.CMD_ADDRESS, this.req);
      data = legacy.decode(data, 'tis620');
      data = data
        .slice(0, -2)
        .toString()
        .trim()
        .split('#');

      info.address = {
        houseNo: data[0],
        moo: (data[1].startsWith('หมู่ที่') ? data[1].substring(7) : '').trim(),
        soi: (data[1].startsWith('ซอย') ? data[1].substring(3) : '').trim(),
        street: data
          .slice(2, -3)
          .join(' ')
          .trim(),
        subdistrict: data[data.length - 3].substring(4).trim(),
        district: data[data.length - 2].substring(0, 3) == 'เขต' ? data[data.length - 2].substring(3).trim() : data[data.length - 2].substring(5).trim(),
        province: data[data.length - 1].substring(7).trim(),
        full: data.reduce((addr, d) => {
          if (d.length === 0) {
            return addr;
          }
          return `${addr} ${d}`;
        }, ''),
      };
    }

    if (q.photo) {
      data = await getData(this.card, apduPerson.CMD_PHOTO1, this.req);
      let photo = data.toString('hex').slice(0, -4);
      data = await getData(this.card, apduPerson.CMD_PHOTO2, this.req);
      photo += data.toString('hex').slice(0, -4);
      data = await getData(this.card, apduPerson.CMD_PHOTO3, this.req);
      photo += data.toString('hex').slice(0, -4);
      data = await getData(this.card, apduPerson.CMD_PHOTO4, this.req);
      photo += data.toString('hex').slice(0, -4);
      data = await getData(this.card, apduPerson.CMD_PHOTO5, this.req);
      photo += data.toString('hex').slice(0, -4);
      data = await getData(this.card, apduPerson.CMD_PHOTO6, this.req);
      photo += data.toString('hex').slice(0, -4);
      data = await getData(this.card, apduPerson.CMD_PHOTO7, this.req);
      photo += data.toString('hex').slice(0, -4);
      data = await getData(this.card, apduPerson.CMD_PHOTO8, this.req);
      photo += data.toString('hex').slice(0, -4);
      data = await getData(this.card, apduPerson.CMD_PHOTO9, this.req);
      photo += data.toString('hex').slice(0, -4);
      data = await getData(this.card, apduPerson.CMD_PHOTO10, this.req);
      photo += data.toString('hex').slice(0, -4);
      data = await getData(this.card, apduPerson.CMD_PHOTO11, this.req);
      photo += data.toString('hex').slice(0, -4);
      data = await getData(this.card, apduPerson.CMD_PHOTO12, this.req);
      photo += data.toString('hex').slice(0, -4);
      data = await getData(this.card, apduPerson.CMD_PHOTO13, this.req);
      photo += data.toString('hex').slice(0, -4);
      data = await getData(this.card, apduPerson.CMD_PHOTO14, this.req);
      photo += data.toString('hex').slice(0, -4);
      data = await getData(this.card, apduPerson.CMD_PHOTO15, this.req);
      photo += data.toString('hex').slice(0, -4);
      data = await getData(this.card, apduPerson.CMD_PHOTO16, this.req);
      photo += data.toString('hex').slice(0, -4);
      data = await getData(this.card, apduPerson.CMD_PHOTO17, this.req);
      photo += data.toString('hex').slice(0, -4);
      data = await getData(this.card, apduPerson.CMD_PHOTO18, this.req);
      photo += data.toString('hex').slice(0, -4);
      data = await getData(this.card, apduPerson.CMD_PHOTO19, this.req);
      photo += data.toString('hex').slice(0, -4);
      data = await getData(this.card, apduPerson.CMD_PHOTO20, this.req);
      photo += data.toString('hex').slice(0, -4);
      info.photo = hex2imagebase64(photo);
    }
    return info;
  }
}

// export default PersonalApplet;
