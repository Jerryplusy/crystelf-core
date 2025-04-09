import logger from '../core/logger';

class redisTools {
  public serialize<T>(data: T): string {
    return JSON.stringify(data);
  }

  public deserialize<T>(jsonString: string): T | undefined {
    try {
      return JSON.parse(jsonString);
    } catch (err) {
      logger.error(`redis反序列化失败：${err}`);
      return undefined;
    }
  }

  public reviveDates<T>(obj: T): T {
    const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;

    const reviver = (_: string, value: any) => {
      if (typeof value === 'string' && dateRegex.test(value)) {
        return new Date(value);
      }
      return value;
    };
    return JSON.parse(JSON.stringify(obj), reviver);
  }
}

const redisTool = new redisTools();
export default redisTool;
