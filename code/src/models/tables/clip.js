import Sequelize from 'sequelize';
import sequelize from '../dbConnection';


export default sequelize.define('clip', {
    path: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    text: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    resolved: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
    },
    ordinalInFullAudio: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
});
