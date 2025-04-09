import Redis from 'ioredis';
import logger from '../../utils/core/logger';
import tools from '../../utils/core/tool';
import config from '../../utils/core/config';

class RedisService {
  private client!: Redis;
  private isConnected = false;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    await this.connectWithRetry();
    this.setupEventListeners();
  }

  private async connectWithRetry(): Promise<void> {
    try {
      await tools.retry(
        async () => {
          this.client = new Redis({
            host: config.get('RD_ADD'),
            port: Number(config.get('RD_PORT')),
            retryStrategy: (times) => {
              return Math.min(times * 1000, 5000);
            },
          });

          await this.client.ping();
          this.isConnected = true;
          logger.info(`Redis连接成功!位于${config.get('RD_ADD')}:${config.get('RD_PORT')}`);
        },
        {
          maxAttempts: 5,
          initialDelay: 1000,
        }
      );
    } catch (error) {
      logger.error('Redis连接失败:', error);
      throw error;
    }
  }

  private setupEventListeners(): void {
    this.client.on('error', (err) => {
      if (!err.message.includes('ECONNREFUSED')) {
        logger.error('Redis错误:', err);
      }
      this.isConnected = false;
    });

    this.client.on('ready', () => {
      this.isConnected = true;
      logger.debug('Redis连接就绪!');
    });

    this.client.on('reconnecting', () => {
      logger.warn('Redis重新连接中...');
    });
  }

  public async waitUntilReady(): Promise<void> {
    if (this.isConnected) return;

    return new Promise((resolve) => {
      const check = () => {
        if (this.isConnected) {
          resolve();
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    });
  }

  public getClient(): Redis {
    if (!this.isConnected) {
      logger.fatal(1, 'Redis未连接..');
    }
    return this.client;
  }

  public async disconnect(): Promise<void> {
    await this.client.quit();
    this.isConnected = false;
  }
}

const redisService = new RedisService();
export default redisService;
