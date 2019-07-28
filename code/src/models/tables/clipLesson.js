import Sequelize from 'sequelize';
import sequelize from '../dbConnection';


export default sequelize.define('clip_lesson', {
    ordinalInLesson: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
});