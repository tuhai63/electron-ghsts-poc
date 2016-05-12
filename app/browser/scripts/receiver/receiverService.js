import Nedb from 'nedb';
import xml2js from 'xml2js';
import {GHSTS} from '../common/ghsts.js'
import {ValueStruct} from '../common/sharedModel.js';
import {Receiver, Sender} from './receiverModel.js'

class ReceiverService {
    constructor($q) {
        this.$q = $q;
        this.receivers = new Nedb({ filename: __dirname + '/db/receivers', autoload: true });
    }

    getReceivers() {
        let deferred = this.$q.defer();
        this.receivers.find({}, function (err, rows) {
            if (err) deferred.reject(err);
            deferred.resolve(rows);
        });
        return deferred.promise;
    }

    getReceiverById(id) {
        let deferred = this.$q.defer();
        this.receivers.find({ '_id': id }, function (err, result) {
            if (err) deferred.reject(err);
            deferred.resolve(result);
        });
        return deferred.promise;
    }

    getReceiverByName(name) {
        let deferred = this.$q.defer();
        var re = new RegExp(name, 'i');
        let condition = { $regex: re };
        this.receivers.find({ 'SHORT_NAME': condition }, function (err, result) {
            if (err) deferred.reject(err);
            deferred.resolve(result);
        });
        return deferred.promise;
    }

    createReceiver(Receiver) {
        let deferred = this.$q.defer();
        this.receivers.insert(Receiver, function (err, result) {
            console.log(err)
            if (err) deferred.reject(err);
            deferred.resolve(result);
        });
        return deferred.promise;
    }

    deleteReceiver(id) {
        let deferred = this.$q.defer();
        this.receivers.remove({ '_id': id }, function (err, res) {
            if (err) deferred.reject(err);
            console.log(res);
            deferred.resolve(res.affectedRows);
        });
        return deferred.promise;
    }

    updateReceiver(Receiver) {
        let deferred = this.$q.defer();
        this.receivers.update({ _id: Receiver._id }, Receiver, {}, function (err, numReplaced) {
            if (err) deferred.reject(err);
            deferred.resolve(numReplaced);
        });
        return deferred.promise;
    }

    // the following are demo related methods.  can be moved to a dedicated test class later
    getReceiverGHSTSById(id) {
        // return GHSTS xml from receiver json. 
        let deferred = this.$q.defer();
        this.receivers.find({ '_id': id }, function (err, result) {
            if (err) deferred.reject(err);           
            
            // retrieved Json from database
            let rcvrJSON = result[0];
            // create Receiver based on receiver JSON    
            let rcvr = new Receiver(rcvrJSON);
                        
            // convert to XML
            let builder = new xml2js.Builder({ rootName: 'RECEIVER', attrkey: 'attr$' });
            let xml = builder.buildObject(rcvr.toGHSTSJson());
            deferred.resolve(xml);
        });
        return deferred.promise;
    }   
    
    initializeReceivers() {
        // read from sample ghsts and populate the database with receivers.
        let ghsts = new GHSTS("./app/browser/data/ghsts.xml");
        let promise = ghsts.readObjects();
        let self = this;
        promise.then(function (contents) {
            let entities = ghsts.receivers;
            entities.forEach(rcvr => {                
                // convert GHSTS json to receivers objects
                // xml2js' use-and-abuse array setting is on to play safe for now, hence the default array references.   
                let status = new ValueStruct(rcvr.METADATA_STATUS[0].VALUE[0], rcvr.METADATA_STATUS[0].VALUE_DECODE[0]);
                let receiver = new Receiver();
                receiver.receiverId = rcvr.attr$.Id;
                receiver.toLegalEntityId = rcvr.attr$.To_Legal_Entity_Id;
                receiver.METADATA_STATUS = status;
                receiver.ROLE = rcvr.ROLE[0];
                receiver.SHORT_NAME = rcvr.SHORT_NAME[0];

                let sender = new Sender();
                // the sample only has one sender in each receiver, otherwise we need to loop through the senders 
                sender.toLegalEntityId = rcvr.SENDER[0].attr$.To_Legal_Entity_Id,
                sender.COMPANY_CONTACT_REGULATORY_ROLE = rcvr.SENDER[0].COMPANY_CONTACT_REGULATORY_ROLE[0],
                sender.REMARK =  (rcvr.SENDER[0].REMARK[0] === undefined ? null : rcvr.SENDER[0].REMARK[0]);
                receiver.addSender(sender);                

                console.log('---------------------JSON Model----------------\n' + JSON.stringify(receiver));
                console.log('------------------------GHSTS Format--------------------\n' + JSON.stringify(receiver.toGHSTSJson()));
                // enable the following to insert into db.
                self.createReceiver(receiver);

            }).catch(function (e) {
                console.log(e);
            })
        });
    }

    _createSampleReceiver() {
        // private method: create a sample receiver for tests
        let  rcvr = new Receiver();
        rcvr.METADATA_STATUS = new ValueStruct('New', 'New');
        rcvr.SHORT_NAME = 'HealthCan';
        rcvr.ROLE = 'Recipient';
        rcvr.receiverId = 'ID_RCVR_HC';
        rcvr.toLegalEntityId = 'LE_CA_AUTHORITY';         // the number is from le sample
        let sender = new Sender();
        sender.toLegalEntityId = 'LE_CA_DRUGSYS';
        sender.COMPANY_CONTACT_REGULATORY_ROLE = 'Sender';
        sender.REMARK = 'Kanata Drug System';
        
        rcvr.addSender(sender);

        console.log(JSON.stringify(rcvr));
        return rcvr;
    }

    addReceiverToDB() {  
        // add a new receiver to database
        let rcvr = this._createSampleReceiver();
        this.createReceiver(rcvr);
    }

}

ReceiverService.$inject = ['$q'];

export { ReceiverService }


