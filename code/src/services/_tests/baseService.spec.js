import { Op } from 'sequelize';
import service from '../baseService';

describe('BaseService', () => {
    let model;
    beforeEach(() => {
        model = {
           findAll: jest.fn(),
           update: jest.fn(),
           create: jest.fn(),
           bulkCreate: jest.fn(),
        };
    });

   describe('#buildWhere', () => {
      it ('handles basic', () => {
         expect(
             service.buildWhere({ a: 1 })
         ).toEqual({
             where: { a: 1 },
         });
      });
       it ('handles and', () => {
           expect(
               service.buildWhere({ a: 1, b: 2 })
           ).toEqual({
               where: { a: 1, b: 2 },
           });
       });
       it ('handles array', () => {
           expect(
               service.buildWhere({ a: [1, 2] })
           ).toEqual({
               where: { a: { [Op.or]: [1, 2] } },
           });
       });
       it ('handles and array', () => {
           expect(
               service.buildWhere({ a: 3, b: [1, 2] })
           ).toEqual({
               where: {
                    a: 3,
                    b: { [Op.or]: [1, 2] }
                },
           });
       });
   });

   describe('#bulkCreate', () => {
        beforeEach(() => {
            service.buildWhere = jest.fn().mockReturnValue('fromBuildWhere');
            model.findAll = jest.fn().mockReturnValue('fromFindAll');
        });

        it ('returns undefined if shouldReturn is false', async () => {
           expect(await service.bulkCreate(model, [{ a: 1 }])).toEqual(undefined);
        });

        it ('returns return of findAll when shouldReturn is true', async () => {
            expect(
                await service.bulkCreate(model, [{ a: 1 }], true)
            ).toEqual('fromFindAll');
        });

        it ('calls findAll with buildWhere return', async () => {
            await service.bulkCreate(model, [{ a: 1 }], true);
           expect(model.findAll).toHaveBeenCalledWith('fromBuildWhere');
        });

       it ('calls buildWhere with findParams if passed', async () => {
           const findParams = { x: 2 };
           await service.bulkCreate(model, [{ a: 1 }], true, findParams);
           expect(service.buildWhere).toHaveBeenCalledWith(findParams);
       });

       it ('calls buildWhere with correct params if findParams not passed', async () => {
           await service.bulkCreate(model, [{ a: 1, b: 2 }, { a: 3 }, { b: 4, c: 5 }], true);
           expect(service.buildWhere).toHaveBeenCalledWith({
               a: [1, 3],
               b: [2, 4],
               c: 5,
           });
       });
   });
});