import { Op } from 'sequelize';
import * as _ from 'lodash';

export default {
    /**
     * Should return undefined if no where is intended.
     *
     * @param whereObj
     * @returns {*}
     */
    buildWhere: function (whereObj) {
        if (!whereObj || !(Object.keys(whereObj).length)) {
            return;
        }
        return {
            where: Object.keys(whereObj).reduce((acc, columnName) => {
                if (Array.isArray(whereObj[columnName])) {
                    acc[columnName] = { [Op.or]: whereObj[columnName] };
                } else {
                    acc[columnName] = whereObj[columnName];
                }
                return acc;
            }, {}),
        };
    },
    findAll: async function (model, whereObj = null) {
        return model.findAll(this.buildWhere(whereObj));
    },
    updateOne: async function (model, updateObj) {
        return model.update(
            _.omit(updateObj, 'id'),
            { where: { id: updateObj.id } },
        );
    },
    /**
     * Update all the records for the ids passed with the updateObj
     * @param model
     * @param ids
     * @param updateObj
     * @param shouldReturn
     * @returns {Promise<Promise<Model<any, any>[]> | Promise<Array<Model>> | * | Promise<*>>}
     */
    updateMany: async function (model, ids, updateObj, shouldReturn = false) {
        await model.update(
            updateObj,
            this.buildWhere({ id: ids }),
        );
        if (shouldReturn) {
            return model.findAll(this.buildWhere({ id: ids }));
        }
    },
    create: async function (model, createObj) {
        console.dir(model);
      return model.create(createObj);
    },
    /**
     * Sequelize doesn't return the created entities, so you must findAll
     * after creating.
     * @param model
     * @param createObjs
     * @param shouldReturn
     * @param findParams
     * @returns {Promise<void>}
     */
    bulkCreate: async function (
        model,
        createObjs,
        shouldReturn = false,
        findParams = null,
    ) {
      await model.bulkCreate(createObjs);

      console.log("created createObjs of");
      console.log(createObjs);
      
      if (shouldReturn) {
          if (findParams && Object.keys(findParams).length) {
              const where = this.buildWhere(findParams);
              console.log(where);
              return model.findAll(where);
          }
          else {
              return model.findAll(
                  this.buildWhere(
                      createObjs.reduce((acc, createObj) => {
                          Object.keys(createObj).forEach(
                              columnName => {
                                  if (Array.isArray(acc[columnName])) {
                                      acc[columnName].push(createObj[columnName]);
                                  } else if (acc[columnName] !== undefined) {
                                      acc[columnName] = [
                                          acc[columnName],
                                          createObj[columnName],
                                      ];
                                  } else {
                                      acc[columnName] = createObj[columnName];
                                  }
                              },
                          );
                          return acc;
                      }, {}),
                  ),
              );
          }
      }
    },
}