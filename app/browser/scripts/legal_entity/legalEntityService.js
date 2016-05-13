import Nedb from 'nedb';
import xml2js from 'xml2js';
import uuid from 'node-uuid';
import {GHSTS} from '../common/ghsts.js'
import {LegalEntityIdentifier, ContactPerson, ContactAddress, LegalEntity} from './legalEntityModel.js';
import {ValueStruct} from '../common/sharedModel.js'

class LegalEntityService {
    constructor($q) {        
        this.$q = $q;
        this.legalEntities = new Nedb({ filename: __dirname + '/db/legalentities', autoload: true });
    }

    // return a list of all legal entities
    getLegalEntities() {        
        let deferred = this.$q.defer();
        this.legalEntities.find({}, function (err, rows) {
            if (err) deferred.reject(err);
            deferred.resolve(rows);
        });      
        return deferred.promise;  
    }
    
    // return a list of legal entities in role of 'Regulatory Authority'
    getRegulatoryAuthorities() {        
        let deferred = this.$q.defer();
        this.legalEntities.find({'LEGALENTITY_TYPE.VALUE': 'Regulatory Authority'}, function (err, rows) {
            if (err) deferred.reject(err);
            deferred.resolve(rows);
        });      
        return deferred.promise;  
    }
    
    // return a list of legal entities NOT in role of 'Regulatory Authority'
    getNonRALegalEntities() {        
        let deferred = this.$q.defer();
        this.legalEntities.find({'LEGALENTITY_TYPE.VALUE': {$ne : 'Regulatory Authority'}}, function (err, rows) {
            if (err) deferred.reject(err);
            deferred.resolve(rows);
        });      
        return deferred.promise;  
    }
        
    getLegalEntityById(id) {
        let deferred = this.$q.defer();
        this.legalEntities.find({'_id': id }, function (err, result) {
            if (err) deferred.reject(err);
            deferred.resolve(result);
        });       
        return deferred.promise;
    }
    
    getLegalEntityByLEId(leId) {
        let deferred = this.$q.defer();
        this.legalEntities.find({'_identifier': leId }, function (err, result) {
            if (err) deferred.reject(err);
            deferred.resolve(result);
        });       
        return deferred.promise;
    }
        
    getLegalEntityByName(name) {
        let deferred = this.$q.defer();
        var re = new RegExp(name, 'i');
        let condition = { $regex: re };
        this.legalEntities.find({'LEGALENTITY_NAME': condition }, function (err, result) {
            if (err) deferred.reject(err);
            deferred.resolve(result);
        });  
        return deferred.promise;        
    }
    
    createLegalEntity(legalEntity) { 
        let deferred = this.$q.defer();
        this.legalEntities.insert(legalEntity, function (err, result) {
            console.log(err)
            if (err) deferred.reject(err);
            deferred.resolve(result);
        });
        return deferred.promise;
    }
    
    deleteLegalEntity(id) {            
        let deferred = this.$q.defer();
        this.legalEntities.remove({'_id': id}, function (err, res) {
            if (err) deferred.reject(err);
            console.log(res);
            deferred.resolve(res.affectedRows);
        });                
        return deferred.promise;
    }
    
    updateLegalEntity(legalEntity) {
        let deferred = this.$q.defer();
        this.legalEntities.update({_id: legalEntity._id}, legalEntity, {}, function (err, numReplaced) {
            if (err) { 
                deferred.reject(err);
                console.log(err);
            }
            deferred.resolve(numReplaced);
        });
        return deferred.promise;
    }
    
    addContactPerson(contactPerson){
        this.selected.CONTACT_PERSON.push(contactPerson);
        updateLegalEntity(this.selected);
    }

    // the following are demo related methods.  can be moved to a dedicated test class later    
    getLegalEntityGHSTSById(id) {
        // return GHSTS xml from legal entity json. 
        let deferred = this.$q.defer();
        this.legalEntities.find({'_id': id }, function (err, result) {
            if (err) deferred.reject(err);           
            
            // retrieved Json from database
            let leJSON = result[0];
            // create LegalEntity based on leJSON           
            let le = new LegalEntity(leJSON);
            
            // convert to XML
            let builder = new xml2js.Builder({rootName: 'LEGAL_ENTITY', attrkey: 'attr$'});            
            let xml = builder.buildObject(le.toGHSTSJson());    
            deferred.resolve(xml);        
        });       
        return deferred.promise;
    }
    
    initializeLE(){
        // read from sample ghsts and populate the database with legal entities.
        let ghsts = new GHSTS("./app/browser/data/ghsts.xml");     
        let promise = ghsts.readObjects();
        let self = this;      
        promise.then(function(contents) {
            let entities = ghsts.legalEntities;
            entities.forEach(le => {                
                // convert GHSTS json to legalEntities objects
                // xml2js' use-and-abuse array setting is on to play safe for now, hence the default array references.   
                let status = new ValueStruct(le.METADATA_STATUS[0].VALUE[0], le.METADATA_STATUS[0].VALUE_DECODE[0]);
                let type = new ValueStruct(le.LEGALENTITY_TYPE[0].VALUE[0], le.LEGALENTITY_TYPE[0].VALUE_DECODE[0]);                
                //let legalEntity = new LegalEntity(status, le.LEGALENTITY_PID[0], le.LEGALENTITY_NAME[0], type); 
                let legalEntity = new LegalEntity();
                legalEntity.legalEntityId = le.attr$.Id;
                legalEntity.METADATA_STATUS = status;               
                legalEntity.LEGALENTITY_PID = le.LEGALENTITY_PID[0];    
                legalEntity.LEGALENTITY_NAME = le.LEGALENTITY_NAME[0];    
                legalEntity.LEGALENTITY_TYPE = type;    
                //let IdType = new ValueStruct(le.COUNTRY[0].VALUE[0], le.COUNTRY[0].VALUE_DECODE[0]);
                //let identifier = new LegalEntityIdentifier(IdType, "DUNS00001")
                
                legalEntity.CONTACT_ADDRESS = new ContactAddress(
                    le.CONTACT_ADDRESS[0].STREET1[0],
                    (le.CONTACT_ADDRESS[0].STREET2 === undefined ? null : le.CONTACT_ADDRESS[0].STREET2[0]),
                    le.CONTACT_ADDRESS[0].ZIPCODE[0],
                    le.CONTACT_ADDRESS[0].CITY[0], 
                    le.CONTACT_ADDRESS[0].STATE[0], 
                    new ValueStruct(le.CONTACT_ADDRESS[0].COUNTRY[0].VALUE[0], le.CONTACT_ADDRESS[0].COUNTRY[0].VALUE_DECODE[0]), 
                    le.CONTACT_ADDRESS[0].PHONE[0], 
                    le.CONTACT_ADDRESS[0].FAX[0], 
                    le.CONTACT_ADDRESS[0].EMAIL[0], 
                    le.CONTACT_ADDRESS[0].WEBSITE[0]
                );    
                
                le.CONTACT_PERSON.forEach(cp => 
                    legalEntity.addContact(
                        new ContactPerson(
                            cp.ORGANISATION[0], 
                            (cp.DEPARTMENT === undefined ? null : cp.DEPARTMENT[0]),
                            (cp.TITLE === undefined ? null : cp.TITLE[0]),
                            cp.FIRSTNAME[0], 
                            cp.LASTNAME[0],
                            (cp.PHONE === undefined ? null : cp.PHONE[0]),
                            (cp.MOBILE === undefined ? null : cp.MOBILE[0]),
                            (cp.FAX === undefined ? null : cp.FAX[0]),
                            (cp.EMAIL === undefined ? null : cp.EMAIL[0])
                        ))   
                 );       
                    
                 console.log('---------------------JSON Model----------------\n' + JSON.stringify(legalEntity));
                 console.log('------------------------GHSTS Format--------------------\n' + JSON.stringify(legalEntity.toGHSTSJson()));
                 // enable the following to insert into db.
                 self.createLegalEntity(legalEntity);    
                 
            }).catch(function(e) {
                console.log(e); 
            })
        });
    }    
    
    _createSampleLegalEntity(){
        // private method: create a sample legal entity as a sender
        let Canada = new ValueStruct('CA', 'Canada');
        let IdType = new ValueStruct("DUNS-number", "DUNS-number"); 
        let identifier = new LegalEntityIdentifier(IdType, "DUNS00001")
        let contactAddr = new ContactAddress('100 Heavenly Ave,', null, '12345', 'Ottawa', 'Ontario', Canada, '613-234-3444', '613-1233-2333', 'goodman@live.com', 'http://drugsys.com');
        let contactPerson = new ContactPerson('Ottawa Drug System', 'Drug Dept.', 'QPIC', 'James', 'Wong', '613-234-3444', '613-234-3444', '613-266-3444', 'jwong@live.com');
        let contactPerson1 = new ContactPerson('Ottawa Drug System', 'Drug Dept.', 'QPIC', 'Mary', 'Smith', '613-234-3445', '613-234-3445', '613-266-3445', 'msmith@live.com');  
                    
        let le = new LegalEntity();
        le.METADATA_STATUS =  new ValueStruct('New', 'New');               
        le.LEGALENTITY_PID = 'urn:' + uuid.v4();       
        le.LEGALENTITY_NAME = 'Ottawa Drug System';    
        le.LEGALENTITY_TYPE = new ValueStruct('Company', 'Company');    
        le.CONTACT_ADDRESS = contactAddr;               
        
        le.legalEntityId = 'LE_CA_DRUGSYS';
        le.addOtherName('The Local Drug Gang');
        le.addOtherName('Gangsters');
        le.addIdentifier(identifier);
        le.addContact(contactPerson);
        le.addContact(contactPerson1);
        
        console.log(JSON.stringify(le));
        return le;
    }
    
    _createSampleRALegalEntity(){
        // create a sample legal entity as a regulatory authority
        let Canada = new ValueStruct('CA', 'Canada');
        let IdType = new ValueStruct("DUNS-number", "DUNS-number"); 
        let identifierRA = new LegalEntityIdentifier(IdType, "DUNS50000")
        let contactAddrRA = new ContactAddress('340 Legget Drive,', null, 'K3J 6Y3', 'Kanata', 'Ontario', Canada, '613-344-9000', '613-233-9800', 'hcguy@live.com', 'http://hc.gc.ca');
        let contactPersonRA = new ContactPerson('Health Canada', 'PMRA', 'Officer', 'Don', 'Welder', '613-344-2314', '613-344-5664', '613-344-9884', 'don.welder@gc.ca');
                     
        let leRA = new LegalEntity();
        leRA.METADATA_STATUS =  new ValueStruct('New', 'New');               
        leRA.LEGALENTITY_PID = 'urn:' + uuid.v4();    
        leRA.LEGALENTITY_NAME = 'Health Canada';    
        leRA.LEGALENTITY_TYPE = new ValueStruct('Regulatory Authority', 'Regulatory Authority');    
        leRA.CONTACT_ADDRESS = contactAddrRA;               
        
        leRA.legalEntityId = 'LE_CA_AUTHORITY';
        leRA.addOtherName('The Regulatory Authority in Canada');
        leRA.addIdentifier(identifierRA);
        leRA.addContact(contactPersonRA);
        
        console.log(JSON.stringify(leRA));
        
        return leRA; 
    }
    
    addLegalEntityToDB(){  
        // add a new legal entity to database
        let le = this._createSampleLegalEntity();        
        this.createLegalEntity(le);        
        let leRA = this._createSampleRALegalEntity();        
        this.createLegalEntity(leRA);      
    }     
}

LegalEntityService.$inject = ['$q'];

export { LegalEntityService }


