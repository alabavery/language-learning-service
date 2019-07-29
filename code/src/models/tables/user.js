import Sequelize from 'sequelize';
import sequelize from '../dbConnection';

export default sequelize.define('user', {
    name: {
      type: Sequelize.STRING,
      allowNull: true,
    },
});