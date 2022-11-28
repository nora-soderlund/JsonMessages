import JsonMessage from "../JsonMessage.js";

const manifest = [
    {
        header: 1,

        key: "CMD_TEST_OBJECT",
        type: "object",

        properties: [ "foo", "lorem" ]
    },

    {
        header: 2,

        key: "CMD_TEST_ARRAY",
        type: "array",

        properties: {
            key: 3,
            type: "structure"
        }
    },

    {
        header: 3,

        key: "CMD_HEY",
        type: "object",

        properties: [
            {
                key: "code",
                type: "string"
            },

            {
                key: "language",
                type: "string"
            },

            {
                key: "relations",
                type: "array",

                properties: {
                    key: 3,
                    type: "structure"
                }
            }
        ]
    }
];

JsonMessage.setDefaultManifest(manifest);

{
    const objects = [
        {
            language: "English",
            code: "EN",
    
            relations: null
        },
    
        {
            language: "Swedish",
            code: "SV",
    
            relations: [
                {
                    language: "Norwegian",
                    code: "NO"
                },
    
                {
                    language: "Danish",
                    code: "DK"
                }
            ]
        },
    
        {
            language: "Danish",
            code: "DK",
    
            relations: [
                {
                    language: "Norwegian",
                    code: "NO"
                },
                
                {
                    language: "Swedish",
                    code: "SV"
                }
            ]
        },
    
        {
            language: "Norwegian",
            code: "NO",
    
            relations: [
                {
                    language: "Danish",
                    code: "DK"
                },
                
                {
                    language: "Swedish",
                    code: "SV"
                }
            ]
        }
    ];

    const payload = JsonMessage.compress(manifest, "CMD_TEST_ARRAY", objects);

    console.log("json:", JSON.stringify(objects));
    console.log("payload:", payload);
    console.log("message:", JsonMessage.decompress(payload));
}

console.log(" ");

{
    const objects = {
        foo: "bar",
        lorem: "ipsum"
    };

    const payload = JsonMessage.compress(manifest, "CMD_TEST_OBJECT", objects);

    console.log("json:", JSON.stringify(objects));
    console.log("payload:", payload);
    console.log("message:", JsonMessage.decompress(payload));
}
