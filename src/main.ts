import { bootstrap } from './app';
import { Logger } from '@nestjs/common';
import { SocketGateway } from './app.gateway';

async function main() {
  const port = process.env.PORT || 3000;
  const logger = new Logger('main');
  const app = await bootstrap();
  const gateway = app.get(SocketGateway);
  gateway.init();
  await app.listen(port, '0.0.0.0');
  logger.log(`start: ${port}`);
}
main();
