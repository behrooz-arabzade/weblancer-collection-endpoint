let express = require('express');
const { models, getAllCollections, createCollection, addField, initSandBox, updateSchema,
    updateCollection, updateField} = require('weblancer-collection');
let router = express.Router();
let Response = require('../utils/response');

router.get('/collections', async (req, res) => {
    // if (req.user.role !== "admin") {
    //     res.status(401).json(
    //         new Response(false, {}, "Access Denied !!!").json()
    //     );
    // }

    let {success, collections, error, errorStatusCode} =
        await getAllCollections();

    if (success) {
        res.status(201).json(
            new Response(true, {collections}).json()
        );
    } else {
        res.status(errorStatusCode).json(
            new Response(false, {}, error).json()
        );
    }
})

router.post('/initsandbox', async (req, res) => {
    let {sandbox} = req.body;
    console.log("/initsandbox", sandbox);

    let {success, error, errorStatusCode} =
        await initSandBox(sandbox);

    if (success) {
        res.status(200).json(
            new Response(true, {}).json()
        );
    } else {
        res.status(errorStatusCode).json(
            new Response(false, {}, error).json()
        );
    }
})

router.post('/create', async (req, res) => {
    let {name, displayName, description, metadata, groupId, isApp} = req.body;

    // if (req.user.role !== "admin") {
    //     res.status(401).json(
    //         new Response(false, {}, "Access Denied !!!").json()
    //     );
    // }

    let {success, collections, error, errorStatusCode} =
        await createCollection(name, displayName, description, groupId, metadata, isApp);

    if (success) {
        res.status(201).json(
            new Response(true, {collections}).json()
        );
    } else {
        res.status(errorStatusCode).json(
            new Response(false, {}, error).json()
        );
    }
})

router.post('/updatecollection', async (req, res) => {
    let {collectionName, displayName, description, groupId, metadata} = req.body;

    // if (req.user.role !== "admin") {
    //     res.status(401).json(
    //         new Response(false, {}, "Access Denied !!!").json()
    //     );
    // }

    let {success, collections, error, errorStatusCode} =
        await updateCollection(collectionName, displayName, description, groupId, metadata);

    if (success) {
        res.status(201).json(
            new Response(true, {collections}).json()
        );
    } else {
        res.status(errorStatusCode).json(
            new Response(false, {}, error).json()
        );
    }
})

// use it for changing order of schema fields
router.post('/updateschema', async (req, res) => {
    let {collectionName, schema} = req.body;

    // if (req.user.role !== "admin") {
    //     res.status(401).json(
    //         new Response(false, {}, "Access Denied !!!").json()
    //     );
    // }

    let {success, collection, error, errorStatusCode} =
        await updateSchema(collectionName, schema);

    if (success) {
        res.status(200).json(
            new Response(true, {collection}).json()
        );
    } else {
        res.status(errorStatusCode).json(
            new Response(false, {}, error).json()
        );
    }
})

router.post('/addfield', async (req, res) => {
    let {collectionName, name, key, type, description, options} = req.body;

    // if (req.user.role !== "admin") {
    //     res.status(401).json(
    //         new Response(false, {}, "Access Denied !!!").json()
    //     );
    // }

    let {success, collection, error, errorStatusCode} =
        await addField(collectionName, name, key, type, description, options);

    if (success) {
        res.status(201).json(
            new Response(true, {collection}).json()
        );
    } else {
        res.status(errorStatusCode).json(
            new Response(false, {}, error).json()
        );
    }
})

router.post('/updatefield', async (req, res) => {
    let {collectionName, name, key, type, description, options} = req.body;

    // if (req.user.role !== "admin") {
    //     res.status(401).json(
    //         new Response(false, {}, "Access Denied !!!").json()
    //     );
    // }

    let {success, collection, error, errorStatusCode} =
        await updateField(collectionName, name, key, type, description, options);

    if (success) {
        res.status(200).json(
            new Response(true, {collection}).json()
        );
    } else {
        res.status(errorStatusCode).json(
            new Response(false, {}, error).json()
        );
    }
})

router.post('/syncdata', async (req, res) => {
    let {collectionName, records} = req.body;

    // if (req.user.role !== "admin") {
    //     res.status(401).json(
    //         new Response(false, {}, "Access Denied !!!").json()
    //     );
    // }

    try {
        if (!models.instance[collectionName]) {
            res.status(404).json(
                new Response(false, {}, "Collection not found").json()
            );
            return;
        }

        for(const record of records) {
            await models.instance[collectionName].upsert(record);
        }

        res.status(200).json(
            new Response(true, {records}).json()
        );
    } catch (error) {
        console.log("syncdata error", error)
        res.status(500).json(
            new Response(false, {}, "Faild to update collection").json()
        );
    }
})

module.exports = router;
