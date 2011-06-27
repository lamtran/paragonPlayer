/**
 * @author lamtran
 */
var db;
var selectedConfig = 1;
var loadedConfig = 1;

initIndexedDb();
initLocalStorage();

var request = window.indexedDB.open("VideoConfigs");
var dbVersion = 1;
request.onsuccess = function(event) {
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
	if (!db.version || db.version<dbVersion) {
		var oldVersion = db.version;
		var request = db.setVersion(dbVersion);
		request.onerror = function(event) {
			// Handle errors.
		};
		request.onsuccess = function(event) {
			if(!oldVersion){
				// Set up the database structure here!
				var objectStore = db.createObjectStore("videoConfigs", {
					keyPath: "id",
					autoIncrement:true
				});
	
				// Store values in the newly created objectStore.
				for (i in configData) {
					objectStore.add(configData[i]);
				}
			}else if(oldVersion==1){
				console.log('upgrade to latest from ' + oldVersion + ' to '+dbVersion);
			}else if(oldVersion==2){
				console.log('upgrade to latest from ' + oldVersion + ' to '+dbVersion);
			}else if(oldVersion==3){
				
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
		// console.log('wait a little bit and try again');
		setTimeout(function(){
			readDb(onsuccess);
		},500);
		return;
	}
	var transaction = db.transaction(["videoConfigs"]);
	var objectStore = transaction.objectStore("videoConfigs");
	// Get everything in the store;
	var keyRange = IDBKeyRange.lowerBound(0);
	var cursorRequest = objectStore.openCursor(keyRange);

	cursorRequest.onsuccess = onsuccess;
	cursorRequest.onerror = function(event) {
		// Handle errors!
	};
	//var request = objectStore.getAll();
	//request.onerror = function(event) {
		// Handle errors!
	//};
	//request.onsuccess = onsuccess;
}
function renderConfigs(savedConfigs){
	// Do something with the request.result!
	// var savedConfigs = event.target.result;
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
		var clickedId = Number(this.id.split('id_')[1])-1;
		if(clickedId>1){
			alert('not yet supported');
			return;
		}
		if(clickedId!=selectedConfig){
			$(this).parent().find('tr.ui-state-active').removeClass('ui-state-active');
			$(this).addClass('ui-state-active');
			if($(this).hasClass('ui-state-hover')){
				$(this).removeClass('ui-state-hover');
			}
			selectedConfig=clickedId;
			/*
			if(selectedConfig!=loadedConfig){
				$('#load-video-configuration').button("option", "disabled", false );
			}else{
				$('#load-video-configuration').button("option", "disabled", true );
			}
			*/
				
		}
	});	
	$('tbody tr:nth-child('+(selectedConfig+1)+')').addClass('ui-state-active');
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
function handleTabSelect(event, tab){
	if(tab.index==0){
	}
};
var configsFromDb=[];
$(function() {
	$('#analyticscode').val(localStorage['analyticscode']);
	/*
	var name = $( "#name" ),
	email = $( "#email" ),
	password = $( "#password" ),
	allFields = $( [] ).add( name ).add( email ).add( password );
	*/
	var tabOpts = {
		select:handleTabSelect
	};
	$( "#tabs" ).tabs(tabOpts);
	$('#cfg-tabs').tabs();
	$('#cfg-tabs-edit').tabs();
	$("<span id='loadedVideoConfigName'>").text("Loaded config #2").addClass("status-message ui-corner-all").
		appendTo($("#tabs"));
		
	$( "#create-new-configuration" ).button()
	.click( function() {
		$( "#dialog-form" ).dialog( "open" );
	});
	$('#save-global-configuration').button()
	.click(function(){
		localStorage['analyticscode']=$('#analyticscode').val();
		window.location.reload();
	});
	$('#load-video-configuration').button().click(function(){
		loadedConfig=selectedConfig;
		// $('#load-video-configuration').button("option", "disabled", true );
		$('#harnessContainer .rhapVideoWrapper').remove();
		var config = configData[selectedConfig];
		$('#loadedVideoConfigName').html('Loaded config #'+(selectedConfig+1));
		var videosToRender = config.videos;
		var firstVideo = videosToRender[0];
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
		var relatedVideo, relatedVideoMarkup='';
		for(var i=1;i<videosToRender.length;i++){
			relatedVideo = videosToRender[i];
			relatedVideoMarkup += '<div title="'+relatedVideo.title+'" class="rhapRelatedVideo" data-width="640" data-height="360" data-poster="'+relatedVideo.poster+'">';
			if(relatedVideo.mp4){
				relatedVideoMarkup += '<span class="rhapRelatedVideoSource" data-src="'+relatedVideo.mp4+'" data-type=\'video/mp4; codecs="avc1.42E01E, mp4a.40.2"\'></span>';
			}
			if(relatedVideo.webm){
				relatedVideoMarkup += '<span class="rhapRelatedVideoSource" data-src="'+relatedVideo.webm+'" data-type=\'video/webm; codecs="vp8, vorbis"\'></span>';
			}
			if(relatedVideo.ogg){
				relatedVideoMarkup += '<span class="rhapRelatedVideoSource" data-src="'+relatedVideo.ogg+'" data-type=\'video/ogg; codecs="theora, vorbis"\'></span>';
			}
			if(relatedVideo.flv){
				relatedVideoMarkup += '<span class="rhapRelatedVideoSource" data-server="'+relatedVideo.flv.server+'" data-src="'+relatedVideo.flv.src+'" data-type=\'video/mp4; codecs="vp6"\'></span>';
			}
			relatedVideoMarkup += '</div>';
			relatedVideos += relatedVideoMarkup;
			relatedVideoMarkup = '';
		}
		relatedVideos += '</div>';
		$('#harnessContainer').append(
			'<video width="'+config.initialWidth+'" height="'+config.initialHeight+'" data-preferred-width="'+config.preferredWidth+'" data-preferred-height="'+config.preferredHeight+'" poster="'+firstVideo.poster+'" title="'+firstVideo.title+'" data-forced-flash="'+config.forcedFlash+'" data-popout="'+config.popout+'">' +
				sources +
				relatedVideos +
			'</video>'
		);
		var video = $('#harnessContainer video')[0];
		videos=[]
		videos.push(new RhapVideo().init(0,video));
	});
	$('#edit-video-configuration').button().click(function(){
		$( "#dialog-form-edit" ).dialog( "open" );
	});
	$('#delete-video-configuration').button()
	.click( function() {
		$( "#dialog-confirm" ).dialog( "open" );
	});
	$( "#dialog-form" ).dialog({
		autoOpen: false,
		height: 480,
		width: 640,
		modal: true,
		buttons: {
			"Create Configuration": function() {
				var bValid = true;
				/*
				allFields.removeClass( "ui-state-error" );
				if ( bValid ) {
					$( "#users tbody" ).append( "<tr>" +
					"<td>" + name.val() + "</td>" +
					"<td>" + email.val() + "</td>" +
					"<td>" + password.val() + "</td>" +
					"</tr>" );
					$( this ).dialog( "close" );
				}
				*/
			},
			Cancel: function() {
				$( this ).dialog( "close" );
			}
		},
		close: function() {
			//allFields.val( "" ).removeClass( "ui-state-error" );
		}
	});
	$( "#dialog-form-edit" ).dialog({
		autoOpen: false,
		height: 480,
		width: 640,
		modal: true,
		buttons: {
			"Update Configuration": function() {
				var bValid = true;
				/*
				allFields.removeClass( "ui-state-error" );
				if ( bValid ) {
					$( "#users tbody" ).append( "<tr>" +
					"<td>" + name.val() + "</td>" +
					"<td>" + email.val() + "</td>" +
					"<td>" + password.val() + "</td>" +
					"</tr>" );
					$( this ).dialog( "close" );
				}
				*/
			},
			Cancel: function() {
				$( this ).dialog( "close" );
			}
		},
		close: function() {
			//allFields.val( "" ).removeClass( "ui-state-error" );
		}
	});
	$( "#dialog-confirm" ).dialog({
		autoOpen: false,
		resizable: false,
		height:200,
		modal: true,
		buttons: {
			"Delete": function() {
				$( this ).dialog( "close" );
			},
			Cancel: function() {
				$( this ).dialog( "close" );
			}
		}
	});
	readDb(function(event){
		var result = event.target.result;
		if(!!result == false){
			renderConfigs(configsFromDb);			
			return;
		}

		configsFromDb.push(result.value);
		result.continue();
	});
	$('#tabs').bind('tabsselect', function(event, ui) {

	    // Objects available in the function context:
	    //ui.tab     // anchor element of the selected (clicked) tab
	    //ui.panel   // element, that contains the selected/clicked tab contents
	    //console.log(ui.index);   // zero-based index of the selected (clicked) tab
	
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
function supports_html5_storage() {
  try {
    return 'localStorage' in window && window['localStorage'] !== null;
  } catch (e) {
    return false;
  }
}
function initLocalStorage(){
	if(!localStorage['analyticscode']){
		//defaults to: UA-5860230-6
		localStorage['analyticscode']='UA-5860230-6';
	}
}
