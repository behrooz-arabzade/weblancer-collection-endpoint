let express = require('express');
const { models, DataTypes, createCollection, addField } = require('weblancer-collection');
let router = express.Router();
let Response = require('../utils/response');

router.post('/create', async (req, res) => {
    let {name, displayName, description, acl, isApp} = req.body;

    if (req.user.role !== "admin") {
        res.status(401).json(
            new Response(false, {}, "Access Denied !!!").json()
        );
    }

    let {success, collections, error, errorStatusCode} = 
        await createCollection(name, displayName, description, acl, isApp);

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
    let {collectionName, displayName, description, metadata} = req.body;

    if (req.user.role !== "admin") {
        res.status(401).json(
            new Response(false, {}, "Access Denied !!!").json()
        );
    }

    let {success, collections, error, errorStatusCode} = 
        await updateCollection(collectionName, displayName, description, metadata);

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

    if (req.user.role !== "admin") {
        res.status(401).json(
            new Response(false, {}, "Access Denied !!!").json()
        );
    }

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

    if (req.user.role !== "admin") {
        res.status(401).json(
            new Response(false, {}, "Access Denied !!!").json()
        );
    }

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

    if (req.user.role !== "admin") {
        res.status(401).json(
            new Response(false, {}, "Access Denied !!!").json()
        );
    }

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

    if (req.user.role !== "admin") {
        res.status(401).json(
            new Response(false, {}, "Access Denied !!!").json()
        );
    }

    try {
        if (!models.instance[collectionName]) {
            res.status(404).json(
                new Response(false, {}, "Collection not found").json()
            );
            return;
        }

        let updatedRecords = await models.instance[collectionName].createBulk(records);

        res.status(200).json(
            new Response(true, {updatedRecords: updatedRecords.toJSON()}).json()
        );
    } catch (error) {
        res.status(500).json(
            new Response(false, {}, "Faild to update collection").json()
        );
    }
})

module.exports = router;