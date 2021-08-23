let express = require('express');
const { createCollection, getAllCollections, updateSchema} = require('weblancer-collection');
let router = express.Router();
let Response = require('../../utils/response');
const bodyParser = require('body-parser');
const axios = require('axios');
const {getAuthorizedUser} = require("../../utils/acl");
const {create} = require("../collection/query");

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

let _googleReCaptchaSecretKey;

router.post('/install', async (req, res) => {
    let {success, collections, error, errorStatusCode} =
        await getAllCollections();

    if (!success) {
        res.status(errorStatusCode || 500).json(
            new Response(false, {}, error).json()
        );
        return;
    }

    let collection = collections.find(c => c.name === "contacts" && c.groupId === "Form App");

    if (collection) {
        res.status(200).json(
            new Response(true).json()
        );
        return;
    }

    let {success: createSuccess, collections: createCollections, error: createError, errorStatusCode: createErrorStatusCode} =
        await createCollection("contacts", "Contacts",
            "", "Form App", {
            // TODO add acl
            }, true);

    if (!createSuccess) {
        res.status(createErrorStatusCode || 500).json(
            new Response(false, {}, createError).json()
        );
        return;
    }

    let newCollection = createCollections.find(c => c.name === "contacts");
    let schema = {
        ...newCollection.schema,
        submissionTime: {
            weblancerType: "datetime",
            order: 1,
            name: "Submission Time"
        },
        firstName: {
            weblancerType: "text",
            order: 2,
            name: "First Name"
        },
        lastName: {
            weblancerType: "text",
            order: 3,
            name: "Last Name"
        },
        email: {
            weblancerType: "text",
            order: 4,
            name: "Email"
        },
        Phone: {
            weblancerType: "text",
            order: 5,
            name: "Phone"
        },
    };
    let {success: updateSuccess, error: updateError, errorStatusCode: updateErrorStatusCode} =
        await updateSchema(newCollection.name, schema);

    if (updateSuccess) {
        res.status(200).json(
            new Response(true).json()
        );
    } else {
        res.status(updateErrorStatusCode || 500).json(
            new Response(false, {}, updateError).json()
        );
    }
});

router.post('/postinstall', async (req, res) => {
    let {metadata} = req.body;

    if (metadata && metadata.googleReCaptchaSecretKey)
        _googleReCaptchaSecretKey = metadata.googleReCaptchaSecretKey;

    res.json(
        new Response(true).json()
    );
});

router.post('/submit', async (req, res) => {
    let {collectionName, record} = req.body;

    let {recaptcha, reCaptchaActive} = record;

    if (reCaptchaActive && !await checkReCaptcha(recaptcha)) {
        res.status(401).json(
            new Response(false, {}, "Too many requests").json()
        );
        return;
    }

    delete record.recaptcha;
    delete record.reCaptchaActive;

    let user = getAuthorizedUser(req);

    let {status, response} = await create(collectionName, record, user);

    res.status(status).json(response);
});

let checkReCaptcha = async (token) => {
    if (_googleReCaptchaSecretKey)
        return true;

    try{
        const url = `https://www.google.com/recaptcha/api/siteverify`;
        let response = await axios.post(url, {
            secret: _googleReCaptchaSecretKey,
            response: token
        });

        return response.data.success;
    } catch (error) {
        console.log("checkReCaptcha error", error)
        return false;
    }
}

module.exports = router;
