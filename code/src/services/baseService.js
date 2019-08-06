import { Op } from 'sequelize';
import * as _ from 'lodash';
import {BulkCreateFindAllError} from "./errors/bulkCreateFindAll.error";

export default {
    delete: async function (entity) {
        return entity.destroy();
    },
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
        // if you don't pass the ids as a a where to the update, it will update all records, so want to
        // avoid the update call altogether in that case
        if (!ids || !ids.length) {
            return [];
        }
        await model.update(
            updateObj,
            this.buildWhere({ id: ids }),
        );
        if (shouldReturn) {
            // sequelize doesn't return the created
            return model.findAll(this.buildWhere({ id: ids }));
        }
    },
    create: async function (model, createObj) {
      return model.create(createObj);
    },
    /**
     * Sequelize doesn't return the created entities, so you must findAll
     * after creating.  That is the purpose of this custom bulkCreate method.
     * @param model
     * @param createObjs
     * @param findParams
     * @returns {Promise<void>}
     */
    bulkCreate: async function (model, createObjs, findParams = null) {
        let partialCreated;
        try {
            // bulkCreate gives us an array of the created, but without the postgres generated ids
            partialCreated = await model.bulkCreate(createObjs, { validate: true });
        } catch (e) {
            // e is an aggregate error, which can be treated like an array. We will
            // just throw the first error.
            throw e[0];
        }

        if (findParams && Object.keys(findParams).length) {
          const where = this.buildWhere(findParams);
          const found = await model.findAll(where);
          return found;
        }
    },
}