let express = require('express');
const { createCollection, getAllCollections, updateSchema} = require('weblancer-collection');
let router = express.Router();
let Response = require('../../utils/response');

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
            "", "Form App", {}, true);

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

module.exports = router;
