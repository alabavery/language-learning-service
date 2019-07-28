export class BulkCreateFindAllError extends Error {
    constructor(modelName, findParams, numberCreated, numberFound) {
        super();
        this.message =`Problem with findParams provided to bulkCreate for table ${modelName}.
                    Created ${numberCreated} but found ${numberFound} using params:
                    ${Object.keys(findParams).join(', ')}`
    }
}