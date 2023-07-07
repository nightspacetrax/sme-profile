import { Injectable } from '@nestjs/common';
import { Devices, CommandApdu } from 'smartcard';
import { Server, Socket } from 'socket.io';
import { PersonalApplet, NhsoApplet } from './applet';
import { sleep } from './helper/sleep';
import { getData } from './helper/reader';
import { getLaser } from './helper/reader';
// const reader = require('./helper/reader');

const EXIST_WHEN_READ_ERROR =
  process.env.EXIST_WHEN_READ_ERROR &&
  process.env.EXIST_WHEN_READ_ERROR === 'false'
    ? false
    : true;

const DEBUG =
  process.env.SMC_AGENT_DEBUG && process.env.SMC_AGENT_DEBUG === 'true'
    ? true
    : false;

const DEFAULT_QUERY = ['cid', 'name', 'dob', 'gender'];

const ALL_QUERY = [
  'cid',
  'name',
  'nameEn',
  'dob',
  'gender',
  'issuer',
  'issueDate',
  'expireDate',
  'address',
  'photo',
  'nhso',
  'laserId',
];

let query = [...DEFAULT_QUERY];

@Injectable()
export class SmcService {
    private devices: Devices;
    
    constructor() {
        this.devices = new Devices();
    }

    public setQuery(q = DEFAULT_QUERY) {
        query = [...q];
        // console.log(q)
    }

    public setAllQuery(q = ALL_QUERY) {
        q = [...ALL_QUERY];
        // console.log(q);
    }

    init(io: Server) {
        this.devices.on('device-activated', async (event) => {
            const currentDevices = event.devices;
            const device = event.device;
            console.log(`Device '${device}' activated, devices: ${currentDevices}`);
            for (const prop in currentDevices) {
            console.log(`Devices: ${currentDevices[prop]}`);
            }

            device.on('card-inserted', async (event) => {
            const card = event.card;
            const message = `Card '${card.getAtr()}' inserted into '${event.device}'`;
            io.emit('smc-inserted', {
                status: 202,
                description: 'Card Inserted',
                data: {
                message,
                },
            });
            console.log(message);

            card.on('command-issued', (event) => {
                console.log(`Command '${event.command}' issued to '${event.card}' `);
            });

            card.on('response-received', (event) => {
                console.log(
                `Response '${event.response}' received from '${event.card}' in response to '${event.command}'`
                );
            });

            try {
                const data = await this.readWithRetry(card, 3);
                if (DEBUG) console.log('Received data', data);
                io.emit('smc-data', {
                status: 200,
                description: 'Success',
                data,
                });
            } catch (ex) {
                const message = `Exception: ${ex.message}`;
                console.error(ex);
                io.emit('smc-error', {
                status: 500,
                description: 'Error',
                data: {
                    message,
                },
                });
                if (EXIST_WHEN_READ_ERROR) {
                process.exit(); // auto restart handle by pm2
                }
            }
            });

            device.on('card-removed', (event) => {
            const message = `Card removed from '${event.name}'`;
            console.log(message);
            io.emit('smc-removed', {
                status: 205,
                description: 'Card Removed',
                data: {
                message,
                },
            });
            });

            device.on('error', (event) => {
            const message = `Incorrect card input'`;
            console.log(message);
            io.emit('smc-incorrect', {
                status: 400,
                description: 'Incorrect card input',
                data: {
                message,
                },
            });
            });
        });

        this.devices.on('device-deactivated', (event) => {
            console.log(`Device '${event.device}' deactivated`);
        });

        this.devices.on('error', (event) => {
            console.log(`Smartcard reader error: ${event.error}`);
        });
    }

    async readWithRetry(card, maxRetry) {
    let retryCount = 0;
        while (true) {
            try {
            const data = await this.read(card);
            return data;
            } catch (error) {
            console.log(error);
            if (retryCount === maxRetry || error.message === 'Card Reader not connected') {
                throw error;
            }
            retryCount++;
            await sleep(3000);
            console.log('Retry read card #', retryCount);
            }
        }
    }

    async read(card) {
        return new Promise(async (resolve, reject) => {
            let req = [0x00, 0xc0, 0x00, 0x00];
            if (card.getAtr().slice(0, 4) === Buffer.from([0x3b, 0x67]).toString('hex')) {
            req = [0x00, 0xc0, 0x00, 0x01];
            }

            try {
            const q = query ? [...query] : [...DEFAULT_QUERY];
            let data = {};
            const personalApplet = new PersonalApplet(card, req);
            const personal = await personalApplet.getInfo(
                q.filter((key) => key !== 'nhso' && key !== 'laserId')
            );
            data = {
                ...personal,
            };

            if (q.includes('nhso')) {
                const nhsoApplets = new NhsoApplet(card, req);
                const nhso = await nhsoApplets.getInfo();
                data = {
                ...data,
                nhso,
                };
            }

            // laserid
            if (q.includes('laserId')) {
                let laserId = '';
                try {
                laserId = await getLaser(card);
                // console.log('data', data, data.length);
                } catch (error) {
                console.log('Can not read laserId', error);
                }
                data = {
                ...data,
                laserId,
                };
            }

            return resolve(data);
            } catch (ex) {
            return reject(ex);
            }
        });
    }

}
