import Sequelize from 'sequelize';
import sequelize from '../dbConnection';

export default sequelize.define('word_lesson', {
    occurences: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
});