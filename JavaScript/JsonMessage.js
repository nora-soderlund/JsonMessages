export default class JsonMessage {
    static #manifest = null;

    static setDefaultManifest(manifest) {
        this.#manifest = manifest;
    };

    static compress(manifest, header, payload) {
        // allow for compress(header, payload) if manifest is set
        if(this.#manifest != null && payload == undefined) {
            payload = header;
            header = manifest;
            manifest = this.#manifest;
        }

        const structure = this.#getManifestStructure(manifest, header);
        const message = this.#compressStructure(manifest, structure, payload);

        return ([ '*', String.fromCharCode((structure.header >> 8) & 0xFF), String.fromCharCode(structure.header & 0xFF) ]).concat(message).join('');
    };

    static decompress(manifest, message) {
        // allow for decompress(message) is manifest is set
        if(this.#manifest != null && message == undefined) {
            message = manifest;
            manifest = this.#manifest;
        }

        if(message[0] != '*')
            return null;

        const high = message.charCodeAt(1) & 0xFF;
        const low = message.charCodeAt(2) & 0xFF;

        const structure = this.#getManifestStructure(manifest, (high << 8) | low);
        const payload = this.#decompressStructure(manifest, structure, message.substring(3));

        return payload;
    };

    static #getManifestStructure(manifest, header) {
        if(typeof header == "string")
            return manifest.find((structure) => structure.key == header);

        return manifest.find((structure) => structure.header == header);
    };

    static #compressStructure(manifest, structure, payload) {
        if(structure.type == "structure")
            structure = this.#getManifestStructure(manifest, structure.key);

        switch(structure.type) {
            case "array":
                return this.#compressArray(manifest, structure.properties, payload);

            case "object":
                return this.#compressObject(manifest, structure.properties, payload);

            case "structure":
                return this.#compressStructure(manifest, structure.properties, payload);

            default:
                return payload;
        };
    };

    static #compressObject(manifest, structure, payload) {
        return structure.map((key) => {
            if(typeof payload[key] == "string")
                return payload[key];

            return this.#compressStructure(manifest, key, payload[key.key]).replace(',', '\\,');
        }).join(',');
    };

    static #compressArray(manifest, structure, payload) {
        return payload.map((item) => this.#compressStructure(manifest, structure, item)).join('|');
    };

    static #decompressStructure(manifest, structure, payload) {
        if(structure.type == "structure")
            structure = this.#getManifestStructure(manifest, structure.key);

        switch(structure.type) {
            case "array":
                return this.#decompressArray(manifest, structure.properties, payload);

            case "object":
                return this.#decompressObject(manifest, structure.properties, payload);

            case "structure":
                return this.#decompressStructure(manifest, structure.properties, payload);

            default:
                return payload;
        };
    };

    static #decompressObject(manifest, structure, payload) {
        const sections = this.#decompressSections(payload, ',');

        const object = {};

        structure.forEach((key, index) => {
            if(typeof key == "string")
                return object[key] = sections[index].replace('\\,', ',');

            object[key.key] = this.#decompressStructure(manifest, key, sections[index].replace('\\,', ','));
        });

        return object;
    };

    static #decompressArray(manifest, structure, payload) {
        return this.#decompressSections(payload, '|').map((item) => this.#decompressStructure(manifest, structure, item.replace('\\|', '|')));
    };

    static #decompressSections(payload, seperator) {
        const sections = [];

        for(let index = 0; index <= payload.length; index++) {
            if(index == payload.length) {
                sections.push(payload);
           
                break;
            }

            if(payload[index] == seperator && payload[index - 1] != '\\') {
                sections.push(payload.substring(0, index));

                payload = payload.substring(index + 1, payload.length);
                index = 0;
            }
        }

        return sections;
    };
};
