import Sequelize from 'sequelize';
import sequelize from '../dbConnection';


export default sequelize.define('frequent_string', {
    str: {
        type: Sequelize.STRING,
        allowNull: false,
    },
});