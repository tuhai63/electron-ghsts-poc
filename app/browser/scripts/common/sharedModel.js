class ValueStruct {
    constructor(value, decode){
        this.VALUE = value;
        this.VALUE_DECODE = decode;
    }
}

class IdentifierStruct {
    constructor(type, value, identifier){              
        this.LEGALENTITY_IDENTIFIER_TYPE = value,         // of ValueStruct
        this.IDENTIFIER = identifier;
    }
}

export {ValueStruct, IdentifierStruct}