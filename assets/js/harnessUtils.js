function buildVideoPlayer(config,container){
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
		jQuery('#'+container).append(
			'<video width="'+config.initialWidth+'" height="'+config.initialHeight+'" data-preferred-width="'+config.preferredWidth+'" data-preferred-height="'+config.preferredHeight+'" poster="'+firstVideo.poster+'" title="'+firstVideo.title+'" data-forced-flash="'+config.forcedFlash+'" data-popout="'+config.popout+'">' +
				sources +
				relatedVideos +
			'</video>'
		);
		var video = jQuery('#harnessContainer video')[0];
		videos=[]
		videos.push(new RhapVideo().init(0,video));
	}
}

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
	var videosList = jQuery('#store-items');
	for(var video in savedVideos){
		videosList.prepend(renderVideoItemHelper(savedVideos[video]));
	}
}
function renderVideoItemHelper(data){
	return jQuery('<li><ul>'+
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
	return jQuery(markup);
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
	jQuery( "#configs tbody" ).append( "<tr id='id_"+config.id+"'>" +
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
	jQuery('tbody tr').live('mouseenter',
		function(){
			if(!jQuery(this).hasClass('ui-state-active')){
				jQuery(this).addClass('ui-state-hover1');
			}
		}).live('mouseleave',
		function(){
			jQuery(this).removeClass('ui-state-hover1');
		}
	);
	jQuery('tbody tr').live('click',function(event){
		var clickedId = Number(this.id.split('id_')[1]);
		if(clickedId>2 && clickedId<7){
			alert('not yet supported');
			return;
		}
		if(clickedId!=selectedConfig){
			jQuery(this).parent().find('tr.ui-state-active').removeClass('ui-state-active');
			jQuery(this).addClass('ui-state-active');
			if(jQuery(this).hasClass('ui-state-hover1')){
				jQuery(this).removeClass('ui-state-hover1');
			}
			selectedConfig=clickedId;
				
		}
	});	
	jQuery('tbody tr:nth-child('+(selectedConfig)+')').addClass('ui-state-active');
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
function getVideosToSave(parentSelector){
	var videoIdToSave,videosToSave=[];
	jQuery(parentSelector +' select').each(function(index,item){
		videoIdToSave = jQuery(item.options[item.selectedIndex]).attr('data');
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
	var items = jQuery('ul li',listItem);
	var data = {};
	data['title']=jQuery(items[0]).children('input').val();
	data['poster']=jQuery(items[1]).children('input').val();
	data['mp4']=jQuery(items[2]).children('input').val();
	data['webm']=jQuery(items[3]).children('input').val();
	data['ogg']=jQuery(items[4]).children('input').val();
	data['flv']={};
	data.flv['server']=jQuery(items[5]).children('input').val();
	data.flv['src']=jQuery(items[6]).children('input').val();
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
