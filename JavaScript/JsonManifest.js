export default class JsonManifest {
    structures = [];

    register(structure) {
        if(this.structures.includes((structure) => structure.header == header))
            throw new Error("Header is already registered in this manifest!");

        return this.structures[this.structures.push(structure) - 1];
    };

    unregister(_structure) {
        this.structures = this.structures.filter((structure) => structure != _structure);
    };
};