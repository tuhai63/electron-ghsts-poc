
class LegalEntityIdentifier {
    constructor(value, identifier){              
        this.LEGALENTITY_IDENTIFIER_TYPE = value,         // of ValueStruct
        this.IDENTIFIER = identifier;
    }
}

class ContactPerson {
    constructor(organisation, department, title, firstName, lastName, phone, mobile, fax, email){    
        this.ORGANISATION = organisation;
        this.DEPARTMENT = department;
        this.TITLE = title;
        this.FIRSTNAME = firstName;
        this.LASTNAME = lastName;
        this.PHONE = phone;
        this.MOBILE = mobile;
        this.FAX = fax;
        this.EMAIL = email;
    }  
}    

class ContactAddress {
    constructor(street1, street2, zipCode, city, state, country, phone, fax, email, website) {
        this.STREET1 = street1;
        this.STREET2 = street2;
        this.ZIPCODE = zipCode;
        this.CITY = city;
        this.STATE = state;
        this.COUNTRY = country;     // of ValueStruct
        this.PHONE = phone;
        this.FAX = fax;
        this.EMAIL = email;
        this.WEBSITE = website;
    }  
}    

class LegalEntity {
    constructor(json){  
        if(arguments.length === 1){
            // load from json
            Object.assign(this, json);
        }else{          
            this._identifier = null;            
            this.METADATA_STATUS = {};              // of ValueStruct
            this.LEGALENTITY_PID = null;
            this.LEGALENTITY_NAME = null;
            this.LEGALENTITY_TYPE = {};             // of ValueStruct
            this.OTHER_NAME = [];
            this.LEGALENTITY_IDENTIFIER = [];       // list of LegalEntityIdentifier
            this.CONTACT_PERSON = [];               // list of ContactPerson     
            this.CONTACT_ADDRESS = {};              // of ContactAddress   
        }     
    }
    
    set legalEntityId(id){
        this._identifier = id;
    }
    
    addContact(contactPerson){
        this.CONTACT_PERSON.push(contactPerson);
    }
    
    set contactAddress(contactAddress){
        this.CONTACT_ADDRESS = contactAddress;
    } 
    
    addOtherName(otherName){
        this.OTHER_NAME.push(otherName);
    } 
    
    addIdentifier(identifier){
        this.LEGALENTITY_IDENTIFIER.push(identifier);
    } 
    
    toGHSTSJson() {     
        let contactsJson = [];
        this.CONTACT_PERSON.forEach(contact => contactsJson.push(contact));   
        let idsJson = [];
        this.LEGALENTITY_IDENTIFIER.forEach(id => idsJson.push(id));
        
        return {
            attr$ : {  Id : this._identifier  },
            METADATA_STATUS  : this.METADATA_STATUS,            
            LEGALENTITY_PID  : this.LEGALENTITY_PID,
            LEGALENTITY_NAME : this.LEGALENTITY_NAME,
            LEGALENTITY_TYPE : this.LEGALENTITY_TYPE,
            OTHER_NAME       : this.OTHER_NAME,
            LEGALENTITY_IDENTIFIER : idsJson,        
            CONTACT_ADDRESS  : this.CONTACT_ADDRESS,
            CONTACT_PERSON   : contactsJson              
        };               
    }          
}    

export {LegalEntityIdentifier, ContactPerson, ContactAddress, LegalEntity}