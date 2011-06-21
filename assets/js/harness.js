/**
 * @author lamtran
 */
var db;
// This is what our customer data looks like.
var customerData = [{
	ssn: "444-44-4444",
	name: "Bill",
	age: 35,
	email: "bill@company.com"
},{
	ssn: "555-55-5555",
	name: "Donna",
	age: 32,
	email: "donna@home.org"
}
];

// Initialising the window.IndexedDB Object
window.indexedDB = window.mozIndexedDB || window.webkitIndexedDB;
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange;
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction;

if (!window.indexedDB) {
    window.indexedDB = new ActiveXObject("SQLCE.Factory.4.0");
    window.indexedDBSync = new ActiveXObject("SQLCE.FactorySync.4.0");

    if (window.JSON) {
        window.indexedDB.json = window.JSON;
        window.indexedDBSync.json = window.JSON;
    } else {
            var jsonObject = {
            parse: function(txt) {
                if (txt === "[]") return [];
                if (txt === "{}") return {};
                throw { message: "Unrecognized JSON to parse: " + txt };
            }
        };
        window.indexedDB.json = jsonObject;
        window.indexedDBSync.json = jsonObject;
    
    }
    
    // Add some interface-level constants and methods.
    window.IDBDatabaseException = {
        UNKNOWN_ERR : 0,
        NON_TRANSIENT_ERR : 1,
        NOT_FOUND_ERR : 2,
        CONSTRAINT_ERR : 3,
        DATA_ERR : 4,
        NOT_ALLOWED_ERR : 5,
        SERIAL_ERR : 11,
        RECOVERABLE_ERR : 21,
        TRANSIENT_ERR : 31,
        TIMEOUT_ERR : 32,
        DEADLOCK_ERR : 33
    };

    window.IDBKeyRange = {
        SINGLE: 0,
        LEFT_OPEN : 1,
        RIGHT_OPEN : 2,
        LEFT_BOUND : 4,
        RIGHT_BOUND : 8
    };

    window.IDBRequest = {
        INITIAL: 0,
        LOADING: 1,
        DONE: 2
    }

    window.IDBKeyRange.only = function (value) {
        return window.indexedDB.range.only(value);
    };

    window.IDBKeyRange.leftBound = function (bound, open) {
        return window.indexedDB.range.leftBound(bound, open);
    };

    window.IDBKeyRange.rightBound = function (bound, open) {
        return window.indexedDB.range.rightBound(bound, open);
    };

    window.IDBKeyRange.bound = function (left, right, openLeft, openRight) {
        return window.indexedDB.range.bound(left, right, openLeft, openRight);
    };
}

var DAO={};

var request = window.indexedDB.open("MyTestDatabase");
request.onsuccess = function(event) {
	console.log('opened DB!');
	// Do something with request.result!
	db = this.result;
	if(db==null){
		db=event.result;
	}
	/*
	db.onerror = function(event) {
		// Generic error handler for all errors targeted at this database's
		// requests!
		alert("Database error: " + event.target.errorCode);
	};
	*/
	if (db.version != "1.0") {
		var request = db.setVersion("1.0");
		request.onerror = function(event) {
			// Handle errors.
		};
		request.onsuccess = function(event) {
			// Set up the database structure here!
			// Create an objectStore to hold information about our customers. We're
			// going to use "ssn" as our key path because it's guaranteed to be
			// unique.
			var objectStore = db.createObjectStore("customers", {
				keyPath: "ssn"
			});

			// Create an index to search customers by name. We may have duplicates
			// so we can't use a unique index.
			objectStore.createIndex("name", "name", {
				unique: false
			});

			// Create an index to search customers by email. We want to ensure that
			// no two customers have the same email, so use a unique index.
			objectStore.createIndex("email", "email", {
				unique: true
			});

			// Store values in the newly created objectStore.
			for (i in customerData) {
				objectStore.add(customerData[i]);
			}
		};
	}
};
function writeToDb() {
	var transaction = db.transaction(["customers"], IDBTransaction.READ_WRITE);
	// Do something when all the data is added to the database.
	transaction.oncomplete = function(event) {
		alert("All done!");
	};
	transaction.onerror = function(event) {
		// Don't forget to handle errors!
	};
	var objectStore = transaction.objectStore("customers");
	for (var i in customerData) {
		var request = objectStore.add(customerData[i]);
		request.onsuccess = function(event) {
			// event.target.result == customerData[i].ssn
		};
	}
}

function readDb() {
	var transaction = db.transaction(["customers"]);
	var objectStore = transaction.objectStore("customers");
	var request = objectStore.get("555-55-5555");
	request.onerror = function(event) {
		// Handle errors!
		console.log('readDb error!');
		console.log(event);
	};
	request.onsuccess = function(event) {
		// Do something with the request.result!
		console.log("Name for SSN 555-55-5555 is " + request.result.name);
	};
	console.log('readDb!');
}