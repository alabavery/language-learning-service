import Sequelize from 'sequelize';

// Option 1: Passing parameters separately
const sequelize = new Sequelize('language_learning', 'alavery', '', {
    host: 'localhost',
    dialect: 'postgres',
    define: {
        // camelCase -> snake_case
        underscored: true,
        // don't add those fucking "s"s
        freezeTableName: true,
    },
});

sequelize
    .authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });


sequelize.sync();

export default sequelize;