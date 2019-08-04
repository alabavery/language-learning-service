import Sequelize from 'sequelize';
import sequelize from '../dbConnection';


export default sequelize.define('audio', {
    path: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    transcript: {
        type: Sequelize.TEXT,
        allowNull: false,
    },
});
