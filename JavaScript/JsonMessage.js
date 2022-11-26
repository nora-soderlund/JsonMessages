export default class JsonMessage {
    static #START_BYTES = 1;
    static #HEADER_BYTES = 2;
    static #SEPERATOR_BYTES = 1;
    static #END_BYTES = 0;

    static manifest = null;

    static compress(manifest, header, values) {
        if(this.manifest != null && values == undefined) {
            values = header;
            header = manifest;
            manifest = this.manifest;
        }

        if(typeof header == "string")
            header = Object.entries(manifest).find(([key, value]) => value.name == header)[0];

        const structure = manifest[header];

        let payload = [];
        payload.push('*');
        payload.push(String.fromCharCode((header >> 8) & 0xFF));
        payload.push(String.fromCharCode(header & 0xFF));

        if(structure.type == "object") {
            payload.push(structure.properties.map((property) => {
                if(!values.hasOwnProperty(property))
                    return "null";

                return this.#compress(values[property], ',');
            }).join());
        }
        else if(structure.type == "array") {
            payload.push(values.map((value) => {
                return this.#compress(value, '|');
            }).join('|'));
        }

        if(this.#END_BYTES)
            payload.push('\0');

        return payload.join('');
    };

    static #compress(value, seperator) {
        if(typeof value == "object")
            return JSON.stringify(value).replace(seperator, `\\${seperator}`);

        return value.toString().replace(seperator, `\\${seperator}`);
    };

    static decompress(manifest, value) {
        if(this.manifest != null && value == undefined) {
            value = manifest;
            manifest = this.manifest;
        }

        const high = value.charCodeAt(1) & 0xFF;
        const low = value.charCodeAt(2) & 0xFF;

        const header = (high << 8) | low;

        const structure = manifest[header];

        let payload = value.substring(this.#START_BYTES + this.#HEADER_BYTES, value.length - this.#END_BYTES);

        let array = [];
        const seperator = (structure.type == "object")?(','):('|');

        for(let index = 0; index < payload.length; index++) {
            if(index == payload.length - 1) {
                array.push(payload);

                break;
            }

            if(payload[index] != seperator || payload[index - 1] == '\\')
                continue;

            array.push(payload.substring(0, index).replace(`\\${seperator}`, seperator));

            payload = payload.substring(index + 1);
            index = 0;
        }

        array = array.map((property) => {
            if(property[0] == '*')
                return this.decompress(manifest, property);

            return property;
        });

        if(structure.type == "object") {
            const object = {};

            structure.properties.forEach((property, index) => {
                object[property] = array[index];
            });

            return object;
        }
        
        if(structure.type == "array") {
            return array;
        }

        return null;
    };
};
