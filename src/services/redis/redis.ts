import Redis from 'ioredis';
import config from '../../utils/core/config';
import logger from '../../utils/core/logger';

class RedisService {
  private readonly client: Redis;

  constructor() {
    const redisPort = config.get('RD_PORT');
    const redisAdd = config.get('RD_ADD');
    const redisConfig = {
      host: redisAdd,
      port: Number(redisPort),
    };
    this.client = new Redis(redisConfig);
    this.client.on('connect', () => {
      logger.info(`Redis数据库连接成功，位于${redisAdd}:${redisPort}`);
    });
    this.client.on('error', (err) => {
      logger.error(`Redis Error: ${err.message}`);
    });
  }

  public init(): void {
    redisService.client.on('connect', () => {
      logger.debug('Redis Connected');
    });
  }
}

const redisService = new RedisService();
export default redisService;
