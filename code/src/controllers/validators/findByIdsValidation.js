function validateEntitiesFoundFromIds(ids, entities) {
    if (ids.length === entities.length) {
        return;
    }
    for (const id of ids) {
        if (!entities.find(entity => entity.id === id)) {
            return `id ${id} was not found!`;
        }
    }

}

export default { validateEntitiesFoundFromIds };