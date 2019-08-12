import Sequelize from 'sequelize';
import sequelize from '../dbConnection';

export default sequelize.define('word_part_of_speech', {
    partOfSpeech: {
        type: Sequelize.STRING,
        allowNull: false,
    },
});
