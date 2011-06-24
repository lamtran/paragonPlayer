/**
 * @author lamtran
 */
var db;
var selectedConfig = 0;

initIndexedDb();

var request = window.indexedDB.open("VideoConfigs");
request.onsuccess = function(event) {
	console.log('opened DB!');
	// Do something with request.result!
	db = this.result;
	if(db==null) {
		db=event.result;
	}
	db.onerror = function(event) {
		// Generic error handler for all errors targeted at this database's
		// requests!
		alert("Database error: " + event.target.errorCode);
	};
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
			var objectStore = db.createObjectStore("globalConfigs", {
				keyPath: "id",
				autoIncrement:true
			});

			// Store values in the newly created objectStore.
			for (i in configData) {
				objectStore.add(configData[i]);
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
	for (var i in configData) {
		var request = objectStore.add(configData[i]);
		request.onsuccess = function(event) {
			// event.target.result == configData[i].ssn
		};
	}
}

function readDb(onsuccess) {
	if(db==null){
		//console.log('wait a little bit and try again');
		setTimeout(function(){
			readDb(onsuccess);
		},500);
		return;
	}
	var transaction = db.transaction(["globalConfigs"]);
	var objectStore = transaction.objectStore("globalConfigs");
	var request = objectStore.getAll();
	request.onerror = function(event) {
		// Handle errors!
		console.log('readDb error!');
		console.log(event);
	};
	request.onsuccess = onsuccess;
	console.log('readDb!');
}

function deleteDB() {
	var indexedDBName = "VideoConfigs";
	try {
		var dbreq = window.indexedDB.deleteDatabase(indexedDBName);
		dbreq.onsuccess = function (event) {
			var db = event.result;
			console.log("indexedDB: " + indexedDBName + " deleted");
		}
		dbreq.onerror = function (event) {
			console.log("indexedDB.delete Error: " + event.message);
		}
	} catch (e) {
		console.log("Error: " + e.message);
	}
}

$(function() {
	var name = $( "#name" ),
	email = $( "#email" ),
	password = $( "#password" ),
	allFields = $( [] ).add( name ).add( email ).add( password );
	$( "#tabs" ).tabs();
	$( "#create-new-configuration" )
	.button()
	.click( function() {
		$( "#dialog-form" ).dialog( "open" );
	});
	$( "#dialog-form" ).dialog({
		autoOpen: false,
		height: 300,
		width: 350,
		modal: true,
		buttons: {
			"Create an account": function() {
				var bValid = true;
				allFields.removeClass( "ui-state-error" );
				if ( bValid ) {
					$( "#users tbody" ).append( "<tr>" +
					"<td>" + name.val() + "</td>" +
					"<td>" + email.val() + "</td>" +
					"<td>" + password.val() + "</td>" +
					"</tr>" );
					$( this ).dialog( "close" );
				}
			},
			Cancel: function() {
				$( this ).dialog( "close" );
			}
		},
		close: function() {
			allFields.val( "" ).removeClass( "ui-state-error" );
		}
	});
	readDb(function(event){
		// Do something with the request.result!
		console.log(event);
		var savedConfigs = event.target.result;
		var config, description='';
		for(var e in savedConfigs){
			config = savedConfigs[e];
			if(config.preferredWidth=='auto' || config.preferredHeight=='auto'){
				description += 'auto resize to video\'s native dimensions,';
			}else if(config.initialWidth==config.preferredWidth 
				&& config.initialHeight==config.preferredHeight){
				description += 'fixed size,'	
			}else{
				description += 'auto resize to preferred dimensions,';
			}
			if(config.forcedFlash){
				description += ' flash only,';
			}else{
				description += ' auto detect video support,';
			}
			if(config.popout){
				description += ' pop out.';
			}else{
				description += ' inline.'
			}
			$( "#users tbody" ).append( "<tr id='id_"+config.id+"'>" +
			"<td>" + description + "</td>" +
			"<td>" + config.initialWidth + "</td>" +
			"<td>" + config.initialHeight + "</td>" +
			"<td>" + config.preferredWidth + "</td>" +
			"<td>" + config.preferredHeight + "</td>" +
			"<td>" + config.forcedFlash + "</td>" +
			"<td>" + config.popout + "</td>" +
			"</tr>" );
			description='';
		}
		$('tbody tr').hover(
			function(){
				if(!$(this).hasClass('ui-state-active')){
					$(this).addClass('ui-state-hover');
				}
			},
			function(){
				$(this).removeClass('ui-state-hover');
			}
		);
		$('tbody tr').click(function(event){
			console.log('clicked on ' + this.id);
			var clickedId = Number(this.id.split('id_')[1])-1;
			console.log('clicked id: ' + clickedId);
			if(clickedId!=selectedConfig){
				$(this).parent().find('tr.ui-state-active').removeClass('ui-state-active');
				$(this).addClass('ui-state-active');
				if($(this).hasClass('ui-state-hover')){
					$(this).removeClass('ui-state-hover');
				}
				selectedConfig=clickedId;
				$('#harnessContainer .rhapVideoWrapper').remove();
				console.log(configData[selectedConfig]);
				var config = configData[selectedConfig];
				var videos = config.videos;
				var firstVideo = videos[0];
				var sources = '', relatedVideos = '';
				if(firstVideo.mp4){
					sources+='<source src="'+firstVideo.mp4+'" type=\'video/mp4; codecs="avc1.42E01E, mp4a.40.2"\' />';
				}
				if(firstVideo.webm){
					sources+='<source src="'+firstVideo.webm+'" type=\'video/webm; codecs="vp8, vorbis"\' />';
				}
				if(firstVideo.ogg){
					sources+='<source src="'+firstVideo.ogg+'" type=\'video/ogg; codecs="theora, vorbis"\' />';
				}
				if(firstVideo.flv){
					sources+='<source data-server="'+firstVideo.flv.server+'" type=\'video/mp4; codecs="vp6"\' data-src="'+firstVideo.flv.src+'"/>';
				}
				relatedVideos += '<div class="rhapRelatedVideos">';
				var relatedVideo;
				for(var i=1;i<videos.length;i++){
					relatedVideo = videos[i];
					/*
					<div title="Cutting Edge" class="rhapRelatedVideo" data-width="640" data-height="360" data-poster="http://lamtran.com/Cutting-Edge-640.jpg">
			        		<span class="rhapRelatedVideoSource" data-src="http://lamtran.com/Cutting-Edge-640.mp4" data-type='video/mp4; codecs="avc1.42E01E, mp4a.40.2"'></span>
			        		<span class="rhapRelatedVideoSource" data-src="http://lamtran.com/Cutting-Edge-640.webm" data-type='video/webm; codecs="vp8, vorbis"'></span>
			        		<span class="rhapRelatedVideoSource" data-src="http://lamtran.com/Cutting-Edge-640.ogv" data-type='video/ogg; codecs="theora, vorbis"'></span>
			        		<span class="rhapRelatedVideoSource" data-server="rtmp://lamtran.com:1935/vod/" data-src="Cutting-Edge-640" data-type='video/mp4; codecs="vp6"'></span>
			        	</div>
			        */
				}
				relatedVideos += '</div>';
				$('#harnessContainer').append(
					'<video width="'+config.initialWidth+'" height="'+config.initialHeight+'" data-preferred-width="'+config.preferredWidth+'" data-preferred-height="'+config.preferredHeight+'" poster="http://lamtran.com/oceans-clip.png" title="Oceans Clip" data-forced-flash="'+config.forcedFlash+'" data-popout="'+config.popout+'">' +
						sources +
						relatedVideos +
					'</video>'
				);
				var video = $('#harnessContainer video')[0];
				console.log(video);
				new RhapVideo().init(0,video);
			}
		});	
		$('tbody tr:nth-child('+1+')').addClass('ui-state-active');
	});
});

function initIndexedDb() {
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
					if (txt === "[]")
						return [];
					if (txt === "{}")
						return {};
					throw {
						message: "Unrecognized JSON to parse: " + txt
					};
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
}