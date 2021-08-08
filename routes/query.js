let express = require('express');
const { models, getCollection } = require('weblancer-collection');
const { getAuthorizedUser } = require('../utils/acl');
let router = express.Router();
let Response = require('../utils/response');

router.post('/', async (req, res) => {
    let {collectionName, searchType, options = {}} = req.body;

    if (!models.instance[collectionName]) {
        res.status(404).json(
            new Response(false, {}, "Collection not found").json()
        );
        return;
    }

    let result;
    try {
        if (!hasPermission(collectionName, "read", getAuthorizedUser(req), undefined, options)) {
            res.status(401).json(
                new Response(false, {}, "Access Denied !!!").json()
            );
            return;
        }

        result = await models.instance[collectionName][searchType](options);
    } catch (error) {
        console.log("Query Error", error);
        res.status(500).json(
            new Response(false, {}, error.message).json()
        );
    }

    res.status(200).json(
        new Response(true, {result}).json()
    );
});

router.post('/create', async (req, res) => {
    let {collectionName, record} = req.body;

    if (!models.instance[collectionName]) {
        res.status(404).json(
            new Response(false, {}, "Collection not found").json()
        );
        return;
    }

    let dbRecord;
    try {
        let user = getAuthorizedUser(req);
        if (!hasPermission(collectionName, "create", user, record)) {
            res.status(401).json(
                new Response(false, {}, "Access Denied !!!").json()
            );
            return;
        }

        user && (record.userId = getAuthorizedUser(req).id);

        dbRecord = await models.instance[collectionName].create(record);
    } catch (error) {
        console.log("Create Error", error);
        res.status(500).json(
            new Response(false, {}, error.message).json()
        );
    }

    res.status(200).json(
        new Response(true, {record: dbRecord}).json()
    );
})

router.post('/update', async (req, res) => {
    let {collectionName, record} = req.body;

    if (!models.instance[collectionName]) {
        res.status(404).json(
            new Response(false, {}, "Collection not found").json()
        );
        return;
    }

    let dbRecord;
    try {
        let options = {
            where: {
                id: record.id
            }
        };

        let user = getAuthorizedUser(req);
        if (!hasPermission(collectionName, "update", user, record, options)) {
            res.status(401).json(
                new Response(false, {}, "Access Denied !!!").json()
            );
            return;
        }

        dbRecord = await models.instance[collectionName].findOne(options);

        if (!dbRecord) {
            res.status(404).json(
                new Response(false, {}, "Record not found").json()
            );
            return;
        }

        await dbRecord.update(record);

        dbRecord = await dbRecord.reload();
    } catch (error) {
        console.log("Update Error", error);
        res.status(500).json(
            new Response(false, {}, error.message).json()
        );
    }

    res.status(200).json(
        new Response(true, {record: dbRecord}).json()
    );
})

router.post('/delete', async (req, res) => {
    let {collectionName, record} = req.body;

    if (!models.instance[collectionName]) {
        res.status(404).json(
            new Response(false, {}, "Collection not found").json()
        );
        return;
    }

    let dbRecord;
    try {
        let options = {
            where: {
                id: record.id
            }
        };

        let user = getAuthorizedUser(req);
        if (!hasPermission(collectionName, "delete", user, record, options)) {
            res.status(401).json(
                new Response(false, {}, "Access Denied !!!").json()
            );
            return;
        }

        dbRecord = await models.instance[collectionName].findOne(options);

        if (!dbRecord) {
            res.status(404).json(
                new Response(false, {}, "Record not found").json()
            );
            return;
        }

        await dbRecord.destroy();
    } catch (error) {
        console.log("Delete Error", error);
        res.status(500).json(
            new Response(false, {}, error.message).json()
        );
    }

    res.status(200).json(
        new Response(true, {record}).json()
    );
})

async function hasPermission (collectionName, type, user, record, options) {
    try {
        let collection = await getCollection(collectionName);

        if (!collection)
            return {
                allow: false,
                error: "Collection not found",
                message: "Collection not found"
            };

        let acl = collection.metadata.acl;

        if (!acl)
            return {
                allow: true,
                aclType: acl[type]
            };

        if (acl[type] === "all") {
            return {allow: true, aclType: acl[type]};
        }

        if (!user) {
            return {allow: false, message: "Access Denied !!!", aclType: acl[type]};
        }

        if (acl[type] === user.role) {
            return {allow: true, aclType: acl[type]};
        }

        if (acl[type] === "owner") {
            if (!record) {
                if (options)
                    options.where = {...(options.where), userId: user.id}
                return {allow: true, aclType: acl[type]};
            }

            if (user.id !== record.userId)
                return {allow: false, message: "Access Denied !!!", aclType: acl[type]};
            else
                return {allow: true, aclType: acl[type]};
        }
    } catch (error) {
        console.log ("Permission Error", error);
        return {
            allow: false,
            error: error.message,
            errorStatusCode: 500,
            message: error.message
        };
    }
}

module.exports = router;
