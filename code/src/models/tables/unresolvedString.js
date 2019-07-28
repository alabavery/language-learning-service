import Sequelize from 'sequelize';
import sequelize from '../dbConnection';

export default sequelize.define('unresolved_string', {
    rawString: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    locationInText: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
});
