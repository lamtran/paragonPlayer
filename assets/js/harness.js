/**
 * @author lamtran
 */
var db;
var selectedConfig = 2;
var configsFromDb=[];
var videosFromDb=[];

initIndexedDb();
initLocalStorage();

var request = window.indexedDB.open("VideoConfigs");
var dbVersion = 2;
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
				// console.log('initialize db from scratch');
				// Set up the database structure here!
				var objectStore = db.createObjectStore("videoConfigs", {
					keyPath: "id",
					autoIncrement:true
				});
	
				// Store values in the newly created objectStore.
				for (i in configData) {
					objectStore.add(configData[i]);
				}
				upgradeDbFrom1To2();
			}else if(oldVersion==1){
				// console.log('upgrade to latest from ' + oldVersion + ' to '+dbVersion);
				upgradeDbFrom1To2();
			}
		};
	}
};
function upgradeDbFrom1To2(){
	// Set up the database structure here!
	var objectStore = db.createObjectStore("videoStore", {
		keyPath: "id",
		autoIncrement:true
	});

	// Store values in the newly created objectStore.
	for (i in vids) {
		objectStore.add(vids[i]);
	}
}
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

function readDb(store,onsuccess) {
	if(db==null){
		console.log('wait a little bit and try again');
		setTimeout(function(){
			readDb(store,onsuccess);
		},500);
		return;
	}
	var transaction = db.transaction([store]);
	var objectStore = transaction.objectStore(store);
	// Get everything in the store;
	var keyRange = IDBKeyRange.lowerBound(0);
	var cursorRequest = objectStore.openCursor(keyRange);

	cursorRequest.onsuccess = onsuccess;
	cursorRequest.onerror = function(event) {
		// Handle errors!
	};
}
function renderVideosFromDb(savedVideos){
	// console.log(savedVideos);
	var videosList = $('#store-items');
	for(var video in savedVideos){
		videosList.prepend(renderVideoItemHelper(savedVideos[video]));
	}
}
function renderVideoItemHelper(data){
	return $('<li><ul>'+
			'<li><label style="font-weight:bold">title</label><input type="text" value="'+data.title+'" class="text ui-widget-content ui-corner-all"/></li>'+
			'<li><label>poster</label><input type="text" value="'+data.poster+'" class="text ui-widget-content ui-corner-all"/></li>'+
			'<li><label>mp4</label><input type="text" value="'+data.mp4+'" class="text ui-widget-content ui-corner-all"/></li>'+
			'<li><label>webm</label><input type="text" value="'+data.webm+'" class="text ui-widget-content ui-corner-all"/></li>'+
			'<li><label>ogg</label><input type="text" value="'+data.ogg+'" class="text ui-widget-content ui-corner-all"/></li>'+
			'<li><label>flv server</label><input type="text" value="'+data.flv.server+'" class="text ui-widget-content ui-corner-all"/></li>'+
			'<li><label>flv path</label><input type="text" value="'+data.flv.src+'" class="text ui-widget-content ui-corner-all"/></li>'+
			'</ul></li>');
}
function renderVideoItemForConfig(title){
	var markup = '<li><select style="width: 430px">';
	var videoFromDb;
	for(var i=0;i<videosFromDb.length;i++){
		videoFromDb = videosFromDb[i];
		markup += '<option data="'+videoFromDb.id+'"';
		if(title && videoFromDb.title==title){
			markup += ' selected="selected"';
		}
		markup +='>'+videoFromDb.title+'</option>';
	}
	markup += '</select><button class="deleteVideoBtn">Delete</button> </li>';
	return $(markup);
}
function addNewConfig(config){
	var description='';
	if(config.preferredWidth=='auto' || config.preferredHeight=='auto') {
		description += 'auto resize to video\'s native dimensions,';
	} else if(config.initialWidth==config.preferredWidth
	&& config.initialHeight==config.preferredHeight) {
		description += 'fixed size,'
	} else {
		description += 'auto resize to preferred dimensions,';
	}
	if(config.forcedFlash) {
		description += ' flash only,';
	} else {
		description += ' auto detect video support,';
	}
	if(config.popout) {
		description += ' pop out.';
	} else {
		description += ' inline.'
	}
	$( "#configs tbody" ).append( "<tr id='id_"+config.id+"'>" +
	"<td>" + config.id + "</td>" +
	"<td>" + description + "</td>" +
	"<td>" + config.initialWidth + "</td>" +
	"<td>" + config.initialHeight + "</td>" +
	"<td>" + config.preferredWidth + "</td>" +
	"<td>" + config.preferredHeight + "</td>" +
	"<td>" + config.forcedFlash + "</td>" +
	"<td>" + config.popout + "</td>" +
	"</tr>" );
}
function renderConfigs(savedConfigs){
	// Do something with the request.result!
	// var savedConfigs = event.target.result;
	var config;
	for(var e in savedConfigs){
		config = savedConfigs[e];
		addNewConfig(config);
	}
	$('tbody tr').live('mouseenter',
		function(){
			if(!$(this).hasClass('ui-state-active')){
				$(this).addClass('ui-state-hover1');
			}
		}).live('mouseleave',
		function(){
			$(this).removeClass('ui-state-hover1');
		}
	);
	$('tbody tr').live('click',function(event){
		var clickedId = Number(this.id.split('id_')[1]);
		if(clickedId>2 && clickedId<7){
			alert('not yet supported');
			return;
		}
		if(clickedId!=selectedConfig){
			$(this).parent().find('tr.ui-state-active').removeClass('ui-state-active');
			$(this).addClass('ui-state-active');
			if($(this).hasClass('ui-state-hover1')){
				$(this).removeClass('ui-state-hover1');
			}
			selectedConfig=clickedId;
				
		}
	});	
	$('tbody tr:nth-child('+(selectedConfig)+')').addClass('ui-state-active');
}

function deleteDB() {
	var indexedDBName = "VideoConfigs";
	try {
		var dbreq = window.indexedDB.deleteDatabase(indexedDBName);
		dbreq.onsuccess = function (event) {
			var db = event.result;
			// console.log("indexedDB: " + indexedDBName + " deleted");
		}
		dbreq.onerror = function (event) {
			// console.log("indexedDB.delete Error: " + event.message);
		}
	} catch (e) {
		// console.log("Error: " + e.message);
	}
}
function handleTabSelect(event, tab){
	if(tab.index==0){
	}
};
var blankVideoItem = {
	mp4:'',
	webm:'',
	ogg:'',
	poster:'',
	title:'',
	flv: {
		server:'',
		src:''
	}
};
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
	$('.deleteVideoBtn').live('click',function(){
		var ul = $(this).parent().parent().get(0);
		if(ul.id=='config-video-store-for-add'){
			//for add, simply remove the list item since it's not in db yet
			$(this).parent().remove();
		}else{
			//for edit
			var select = $(this).siblings().get(0);
			
			var videoIdToDelete = Number($(select.options[select.selectedIndex]).attr('data'));
			var videoNameToDelete = select.value;
			var config = getConfigById(selectedConfig);
			var configVideos = config.videos;
			var configVideo;
			for(var i=0;i<configVideos.length;i++){
				configVideo = configVideos[i];
				if(configVideo.title==videoNameToDelete){
					configVideos.splice(i,1);
					break;
				}
			}
			var transaction = db.transaction(["videoConfigs"], IDBTransaction.READ_WRITE);
			// Do something when all the data is added to the database.
			transaction.oncomplete = function(event) {
			};
			transaction.onerror = function(event) {
				// Don't forget to handle errors!
			};
			var objectStore = transaction.objectStore("videoConfigs");
			var request = objectStore.put(config);
			var parentLi = $(this).parent();
			request.onsuccess = function(event) {
				parentLi.remove();
			};
			request.onerror = function() {
				alert("Could not modify object");
			};
		}
	});
	$('#add-new-video').button().click(function(){
		$('#store-items').prepend(renderVideoItemHelper(blankVideoItem));
	});
	$('#add-new-video-to-config').button().click(function(){
		$('#config-video-store-edit').prepend(renderVideoItemForConfig());
		$('.deleteVideoBtn').button();
	});
	$('#add-new-video-to-config-for-add').button().click(function(){
		$('#config-video-store-for-add').prepend(renderVideoItemForConfig());
	});
	$('#video-store').button().click(function(){
		$( "#dialog-video-store" ).dialog( "open" );
		if($('#store-items').children().length==0){
			renderVideosFromDb(videosFromDb);
			/*
			readDb("videoStore",function(event){
				var result = event.target.result;
				if(!!result == false){
					renderVideosFromDb(videosFromDb);	
					return;
				}
		
				videosFromDb.push(result.value);
				result.continue();
			});
			*/
		}else{
			$('#add-new-video').button({disabled:false});
		}
	});
	$("<span id='loadedVideoConfigName'>").text("Loaded config #2").addClass("status-message ui-corner-all").
		appendTo($("#tabs > .ui-tabs-nav"));
		
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
		// $('#load-video-configuration').button("option", "disabled", true );
		$('#harnessContainer .rhapVideoWrapper').remove();
		var config = getConfigById(selectedConfig);//configsFromDb[selectedConfig];
		$('#loadedVideoConfigName').html('Loaded config #'+(selectedConfig));
		var videosToRender = config.videos;
		if(!videosToRender || videosToRender.length==0){
			alert('please add videos to this configuration before attempting to load it');
		}else{
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
		}
	});
	$('#edit-video-configuration').button().click(function(){
		$( "#dialog-form-edit" ).dialog( "open" );
		var config = getConfigById(selectedConfig);
		$('#editConfigInitialWidth').val(config.initialWidth);
		$('#editConfigInitialHeight').val(config.initialHeight);
		$('#editConfigPreferredWidth').val(config.preferredWidth);
		$('#editConfigPreferredHeight').val(config.preferredHeight);
		$('#editConfigForceFlash').attr('checked',config.forcedFlash);
		$('#editConfigPopout').attr('checked',config.popout);
		
		var cfgVideo;
		if($('#config-video-store-edit').children().length==0){
			if(config.videos && config.videos.length>0){
				for(var i=0;i<config.videos.length;i++){
					cfgVideo = config.videos[i];
					$('#config-video-store-edit').prepend(renderVideoItemForConfig(cfgVideo.title));
					$('.deleteVideoBtn').button();
				}
			}
		}
	});
	$('#delete-video-configuration').button()
	.click( function() {
		$( "#dialog-confirm" ).dialog( "open" );
	});
	$( "#dialog-form" ).dialog({
		autoOpen: false,
		height: 500,
		width: 640,
		modal: false,
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
				}
				*/
				var transaction = db.transaction(["videoConfigs"], IDBTransaction.READ_WRITE);
				// Do something when all the data is added to the database.
				transaction.oncomplete = function(event) {
					// console.log('DONE');
				};
				transaction.onerror = function(event) {
					// Don't forget to handle errors!
				};
				var updatedData = {};
				updatedData['initialWidth']=$('#newConfigInitialWidth').val();
				updatedData['initialHeight']=$('#newConfigInitialHeight').val();
				updatedData['preferredWidth']=$('#newConfigPreferredWidth').val();
				updatedData['preferredHeight']=$('#newConfigPreferredHeight').val();
				updatedData['forcedFlash']=$('#newConfigForceFlash').is(':checked');
				updatedData['popout']=$('#newConfigPopout').is(':checked');
				
				updatedData['videos']=getVideosToSave('#config-video-store-for-add');
				var objectStore = transaction.objectStore("videoConfigs");
				var request = objectStore.add(updatedData);
				request.onsuccess = function(event) {
					updatedData['id']=request.result;
					configsFromDb.push(updatedData);
					addNewConfig(updatedData);
				};
				request.onerror = function() {
					alert("Could not modify object");
				};
				
				$( this ).dialog( "close" );
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
		height: 500,
		width: 640,
		modal: false,
		buttons: {
			"Update Configuration": function() {
				// configsFromDb
				var transaction = db.transaction(["videoConfigs"], IDBTransaction.READ_WRITE);
				// Do something when all the data is added to the database.
				transaction.oncomplete = function(event) {
				};
				transaction.onerror = function(event) {
					// Don't forget to handle errors!
				};
				var updatedData = getConfigById(selectedConfig);
				updatedData['initialWidth']=$('#editConfigInitialWidth').val();
				updatedData['initialHeight']=$('#editConfigInitialHeight').val();
				updatedData['preferredWidth']=$('#editConfigPreferredWidth').val();
				updatedData['preferredHeight']=$('#editConfigPreferredHeight').val();
				updatedData['forcedFlash']=$('#editConfigForceFlash').is(':checked');
				updatedData['popout']=$('#editConfigPopout').is(':checked');
				
				updatedData['videos']=getVideosToSave('#config-video-store-edit');
				
				var objectStore = transaction.objectStore("videoConfigs");
				var request = objectStore.put(updatedData);
				request.onsuccess = function(event) {
				};
				request.onerror = function() {
					alert("Could not modify object");
				};
				$( this ).dialog( "close" );
				/*
				var bValid = true;
				for (var i in configData) {
					var request = objectStore.add(configData[i]);
					request.onsuccess = function(event) {
						// event.target.result == configData[i].ssn
					};
				}
				*/
				
				/*
				allFields.removeClass( "ui-state-error" );
				if ( bValid ) {
					$( "#users tbody" ).append( "<tr>" +
					"<td>" + name.val() + "</td>" +
					"<td>" + email.val() + "</td>" +
					"<td>" + password.val() + "</td>" +
					"</tr>" );
				}
				*/
			},
			Cancel: function() {
				$( this ).dialog( "close" );
			}
		},
		close: function() {
			//allFields.val( "" ).removeClass( "ui-state-error" );
			$('#config-video-store-edit').children().remove();
		}
	});
	$( "#dialog-confirm" ).dialog({
		autoOpen: false,
		resizable: false,
		height:200,
		modal: true,
		buttons: {
			"Delete": function() {
				var transaction = db.transaction(["videoConfigs"], IDBTransaction.READ_WRITE);
				var objectStore = transaction.objectStore("videoConfigs");
				var request = objectStore.delete(selectedConfig);
				request.onsuccess = function(event) {
					for(var i=0;i<configsFromDb.length;i++){
						var cfg = configsFromDb[i];
						if(cfg.id==selectedConfig){
							configsFromDb.splice(i,1);
							break;
						}
					}
				};
				$('#configs tr[id=id_'+selectedConfig+']').remove();
				request.onerror = function() {
				};
				$( this ).dialog( "close" );
			},
			Cancel: function() {
				$( this ).dialog( "close" );
			}
		}
	});
	$('#dialog-video-store').dialog({
		autoOpen: false,
		width: 640,
		height:480,
		buttons: {
			"Save Videos": function() {
				var videoItems = $('#store-items').children();
				var length = videoItems.length;
				var videoData;// = videosFromDb[0];
				var videoDataFromUi;// = videoItems[length-1];
				for(var i=0;i<videosFromDb.length;i++){
					videoData=videosFromDb[i];
					videoDataFromUi=getDataFromVideoListItem(videoItems[length-1-i]);
					if(!videoDataEquals(videoData,videoDataFromUi)){
						var transaction = db.transaction(["videoStore"], IDBTransaction.READ_WRITE);
						// Do something when all the data is added to the database.
						transaction.oncomplete = function(event) {
						};
						transaction.onerror = function(event) {
							// Don't forget to handle errors!
						};
						var objectStore = transaction.objectStore("videoStore");
						videoDataUpdate(videoData,videoDataFromUi);
						var request = objectStore.put(videoData);
						request.onsuccess = function(event) {
						};
						request.onerror = function() {
							alert("Could not modify object");
						};
					}else{
						// console.log('video is unchanged in UI for video: ' + videoData.title);
					}
				}
				if(length>videosFromDb.length){
					for(var i=0;i<length-videosFromDb.length;i++){
						videoDataFromUi=getDataFromVideoListItem(videoItems[i]);
						var transaction = db.transaction(["videoStore"], IDBTransaction.READ_WRITE);
						// Do something when all the data is added to the database.
						transaction.oncomplete = function(event) {
						};
						transaction.onerror = function(event) {
							// Don't forget to handle errors!
						};
						var objectStore = transaction.objectStore("videoStore");
						videoData={};
						initFlv(videoData);
						videoDataUpdate(videoData,videoDataFromUi);
						var request = objectStore.add(videoData);
						request.onsuccess = function(event) {
							videoData['id']=request.result;
							videosFromDb.push(videoData);
						};
						request.onerror = function() {
							alert("Could not modify object");
						};
					}
				}
				$( this ).dialog( "close" );
			},
			Cancel: function() {
				$( this ).dialog( "close" );
			}
		}
	});
	readDb("videoConfigs",function(event){
		var result = event.target.result;
		if(!!result == false){
			renderConfigs(configsFromDb);
			return;
		}

		configsFromDb.push(result.value);
		result.continue();
	});
	readDb("videoStore",function(event){
		var result = event.target.result;
		if(!!result == false){
			return;
		}

		videosFromDb.push(result.value);
		result.continue();
	});
	$('#tabs').bind('tabsselect', function(event, ui) {

	    // Objects available in the function context:
	    //ui.tab     // anchor element of the selected (clicked) tab
	    //ui.panel   // element, that contains the selected/clicked tab contents
	    //console.log(ui.index);   // zero-based index of the selected (clicked) tab
	
	});
});
function getVideosToSave(parentSelector){
	var videoIdToSave,videosToSave=[];
	$(parentSelector +' select').each(function(index,item){
		videoIdToSave = $(item.options[item.selectedIndex]).attr('data');
		videosToSave.unshift(getVideoById(videoIdToSave));
	});
	return videosToSave;
}
function getConfigById(id){
	var cfg; 
	for(var each in configsFromDb){
		cfg = configsFromDb[each];
		if(cfg.id==id){
			return cfg;
		}
	}
}
function getVideoById(id){
	var cfg; 
	for(var each in videosFromDb){
		cfg = videosFromDb[each];
		if(cfg.id==id){
			return cfg;
		}
	}
}
function getDataFromVideoListItem(listItem){
	var items = $('ul li',listItem);
	var data = {};
	data['title']=$(items[0]).children('input').val();
	data['poster']=$(items[1]).children('input').val();
	data['mp4']=$(items[2]).children('input').val();
	data['webm']=$(items[3]).children('input').val();
	data['ogg']=$(items[4]).children('input').val();
	data['flv']={};
	data.flv['server']=$(items[5]).children('input').val();
	data.flv['src']=$(items[6]).children('input').val();
	return data;
}
function videoDataEquals(one,two){
	initFlv(one);
	initFlv(two);
	return one.title==two.title && one.poster==two.poster
		&& one.mp4==two.mp4 && one.webm==two.webm
		&& one.ogg==two.ogg && one.flv.server==two.flv.server && one.flv.src==two.flv.src;
}
function videoDataUpdate(one,two){
	one.title=two.title;
	one.mp4=two.mp4;
	one.webm=two.webm;
	one.ogg=two.ogg;
	one.poster=two.poster;
	one.flv.server=two.flv.server;
	one.flv.src=two.flv.src;
}
function initFlv(o){
	if(!o.flv){
		o.flv={};
		o.flv.server='';
		o.flv.src='';
	}
}

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
