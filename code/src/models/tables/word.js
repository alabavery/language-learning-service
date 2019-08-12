import Sequelize from 'sequelize';
import sequelize from '../dbConnection';

export default sequelize.define('word', {
  str: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  meaning: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  partsOfSpeech: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  tense: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  plurality: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  person: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  gender: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  metadata: {
    type: Sequelize.JSONB,
    allowNull: true,
  },
});
