import Sequelize from 'sequelize';
import sequelize from '../dbConnection';


export default sequelize.define('lesson', {
    path: {
        type: Sequelize.STRING,
        allowNull: false,
    },
});