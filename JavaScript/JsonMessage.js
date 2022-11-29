export default class JsonMessage {
    static #manifest = null;

    static #polyfillReplaceAll(string, target, replacement) {
        return string.split(target).join(replacement);
    };

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

    static compressWithoutHeader(manifest, header, payload) {
        return this.compress(manifest, header, payload).substring(3);
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

        return this.decompressWithoutHeader(manifest, (high << 8) | low, message.substring(3));
    };

    static decompressWithoutHeader(manifest, header, message) {
        const structure = this.#getManifestStructure(manifest, header);
        const payload = this.#decompressStructure(manifest, structure, message);

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
            if(key.key == undefined)
                return this.#polyfillReplaceAll(this.#polyfillReplaceAll(String(payload[key]), '|', '\\|'), ',', '\\,');

            if(payload[key.key] == undefined)
                return "null";

            return this.#polyfillReplaceAll(this.#polyfillReplaceAll(this.#compressStructure(manifest, key, payload[key.key]), '|', '\\|'), ',', '\\,');
        }).join(',');
    };

    static #compressArray(manifest, structure, payload) {
        return payload.map((item) => this.#compressStructure(manifest, structure, item)).join('|');
    };

    static #decompressStructure(manifest, structure, payload) {
        if(!structure)
            return null;

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
            if(!sections[index])
                return null;

            if(typeof key == "string")
                return object[key] = this.#polyfillReplaceAll(this.#polyfillReplaceAll(String(sections[index]), '\\|', '|'), '\\,', ',');

            object[key.key] = this.#decompressStructure(manifest, key, this.#polyfillReplaceAll(this.#polyfillReplaceAll(String(sections[index]), '\\|', '|'), '\\,', ','));
        });

        return object;
    };

    static #decompressArray(manifest, structure, payload) {
        if(payload == "null")
            return null;

        return this.#decompressSections(payload, '|').map((item) => this.#decompressStructure(manifest, structure, item));
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
