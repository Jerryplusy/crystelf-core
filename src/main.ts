import apps from './app';
import logger from './utils/core/logger';
import config from './utils/core/config';

const PORT = config.get('PORT') || 3000;

const app = apps.createApp();

app.listen(PORT, () => {
  logger.info(`Crystelf-core listening on ${PORT}`);
});
