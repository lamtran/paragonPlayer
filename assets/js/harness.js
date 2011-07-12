/**
 * @author lamtran
 */
var db;
var selectedConfig = 2;
var configsFromDb=[];
var videosFromDb=[];
jQuery.noConflict();
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
				upgradeDbFrom2To3();
			}else if(oldVersion==1){
				// console.log('upgrade to latest from ' + oldVersion + ' to '+dbVersion);
				upgradeDbFrom1To2();
			}else if(oldVersion==2){
				upgradeDbFrom2To3();
			}
		};
	}
};

(function($) {
	$(function(){
		$('#analyticscode').val(localStorage['analyticscode']);
		/*
		var name = jQuery( "#name" ),
		email = jQuery( "#email" ),
		password = jQuery( "#password" ),
		allFields = jQuery( [] ).add( name ).add( email ).add( password );
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
			buildVideoPlayer(config,'harnessContainer');
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
})(jQuery);
