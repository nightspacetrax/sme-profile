import { Server, Socket } from 'socket.io';
import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage } from '@nestjs/websockets';
import { Injectable, Logger } from '@nestjs/common';
import { SmcService } from './modules/smc/smc.service';
import { sleep } from './modules/smc/helper/sleep';
import { Devices, CommandApdu } from 'smartcard';
import { PersonalApplet, NhsoApplet } from './modules/smc/applet';
import { getLaser } from './modules/smc/helper/reader';

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

let query = [...DEFAULT_QUERY];

async function readWithRetry(card, maxRetry) {
let retryCount = 0;
    while (true) {
        try {
        const data = await read(card);
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

function read(card) {
  return new Promise(async (resolve, reject) => {
    let req = [0x00, 0xc0, 0x00, 0x00];
    if (
      card.getAtr().slice(0, 4) === Buffer.from([0x3b, 0x67]).toString('hex')
    ) {
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
      
      // if (q.includes('nhso')) {
        const nhsoApplet = new NhsoApplet(card, req);
        const nhso = await nhsoApplet.getInfo();
        data = {
          ...data,
          nhso,
        };
      // }

      // laserid
      // if (q.includes('laserId')) {
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
      // }

      return resolve(data);
    } catch (ex) {
      return reject(ex);
    }
  });
}

@Injectable()
@WebSocketGateway()
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() 
  server: Server;

  constructor(private readonly smcService: SmcService) {}

  handleConnection(socket: Socket) {
    console.log(`New connection from ${socket.id}`);
  }

  handleDisconnect() {
    console.log('Client disconnected');
  }

  @SubscribeMessage('set-query')
  handleSetQuery(socket: Socket, data: { query?: [string] }) {
    const { query } = data;
    console.log(`set-query: ${query}`);
    this.smcService.setQuery(query);
  }

  @SubscribeMessage('set-all-query')
  handleSetAllQuery(socket: Socket, data: { query?: [string] }) {
    const { query } = data;
    console.log(`set-all-query: ${query}`);
    this.smcService.setAllQuery(query);
  }

  // @SubscribeMessage('card-inserted')
  // handleCardInserted(socket: Socket, data: any) {
  //   const { card, device } = data;
  //   const message = `Card '${card.getAtr()}' inserted into '${device}'`;
  //   this.server.emit('smc-inserted', {
  //     status: 202,
  //     description: 'Card Inserted',
  //     data: {
  //       message,
  //     },
  //   });
  //   console.log(message);
  // }

  init() {
    let devices = new Devices();
    devices.on('device-activated', (event) => {
      const currentDevices = event.devices;
      const device = event.device;
      console.log(`Device '${device}' activated, devices: ${currentDevices}`);
      for (const prop in currentDevices) {
        console.log(`Devices: ${currentDevices[prop]}`);
      }

      device.on('card-inserted', async (event) => {
        const card = event.card;
        const message = `Card '${card.getAtr()}' inserted into '${event.device}'`;
        this.server.emit('smc-inserted', {
          status: 202,
          description: 'Card Inserted',
          data: {
            message,
          },
        });
        console.log(message);

        card.on('command-issued', (event) => {
          console.log(`Command '${event.command}' issued to '${event.card}'`);
        });

        card.on('response-received', (event) => {
          console.log(
            `Response '${event.response}' received from '${event.card}' in response to '${event.command}'`
          );
        });

        try {
          const data = await readWithRetry(card, 3);
          if (DEBUG) console.log('Received data', data);
          this.server.emit('smc-data', {
            status: 200,
            description: 'Success',
            data,
          });
        } catch (ex) {
          const message = `Exception: ${ex.message}`;
          console.error(ex);
          this.server.emit('smc-error', {
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
        this.server.emit('smc-removed', {
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
        this.server.emit('smc-incorrect', {
          status: 400,
          description: 'Incorrect card input',
          data: {
            message,
          },
        });
      });
    });

    devices.on('device-deactivated', (event) => {
      const message = `Device '${event.device}' deactivated, devices: [${event.devices}]`;
      console.error(message);
      this.server.emit('smc-error', {
        status: 404,
        description: 'Not Found Smartcard Device',
        data: {
          message,
        },
      });
    });

    devices.on('error', (error) => {
      const message = `${error.error}`;
      console.error(message);
      this.server.emit('smc-error', {
        status: 404,
        description: 'Not Found Smartcard Device',
        data: {
          message,
        },
      });
    });
  }
}