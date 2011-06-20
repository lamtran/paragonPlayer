(function($) {
	/**
	 * Convention:
	 * 		A method that starts with _ means to be a private api, although it is defined as public so it can
	 * 			be referenced by tests.  Do not call _xxx functions directly.
	 */
	
	/**
	 * @description Our video class
	 * @constructor
	 * @this {RhapVideo}
	 * @return {RhapVideo} the RhapVideo object
	 */
	function RhapVideo(){
		// constants
		/* @const */ var swfLocation = 'http://blog.rhapsody.com/video/SlimVideoPlayer.swf';
		this.video;
		var flashId, parent, videoIndex, forcedFlash, relatedVideos, controls, playPause, playPauseCanvas, seekBar, timer, volumeSlider, volumeBtn, fullScreenBtn, rhapVideoBufferBar;
		var bigPlayButton, seekBarHandle, rhapVideoMoreButton;
		var seekSliding, seekValue=-1, videoVolume, savedVolumeBeforeMute, isFullScreen = false;
		var rhapVideoMoreControls, rhapVideoSharePanel, rhapVideoShareBtn, rhapVideoShareUrl, rhapVideoSharePanelCloseButton;
		var rhapVideoDuration, rhapVideoEmbedPanel, rhapVideoEmbedBtn, rhapVideoEmbedPanelCloseButton;
		var rhapVideoRelatedBtn, rhapVideoRelatedPanel, rhapVideoRelatedPanelCloseButton;
		this.toast;
		var seekBarLeftOffset = 38;
		var seekBarRightMargin = 132;//172;
		var isHideVideoArea = false;
		var overGradientStops = {overGradientStops:['#5F6367','#1D1E25']};
		var upGradientStops = {upGradientStops:['#5F6367','#1D1E25']};
		/* @const */ var WAITING_STATE = 2;
		this.isShowMore = false;
		this.init = function(index,videoElement,relateds,forced){
			videoIndex = index;
			forcedFlash = forced;
			this.video = videoElement;
			parent = $(this.video).parent();
			relatedVideos = relateds;
			this._createVideoElement(this.video);
			return this;
		};
		var _positionTimer = function(){
			timer.position({
				my: "center bottom",
				at: "center top",
				of: seekBarHandle,
				offset: '0 -3'
			});
			$(timer.css('top','-37px'));
		};
		var _timeFormat=function(seconds){
			var m=Math.floor(seconds/60)<10?"0"+Math.floor(seconds/60):Math.floor(seconds/60);
			var s=Math.floor(seconds-(m*60))<10?"0"+Math.floor(seconds-(m*60)):Math.floor(seconds-(m*60));
			return m+":"+s;
		};
		/**
		 * @description method to render the video element
		 * @private
		 */
		this._createVideoElement = function(video){
			if(!forcedFlash && renderHtml5Video(video)){
				flashId=null;
				this._drawLargePlayButton(video);
				this._drawControls(video);
				this._wireHtml5Events(video);
			}else{
				forcedFlash = true;
				var params = {};
				params.scale = "noscale";
				params.menu = "false";
				params.allowscriptaccess = "always";
				params.allowFullScreen = "true";
				params.analyticstrackcode="UA-5860230-6";
				params.wmode = "opaque";
				var attributes = {};
				attributes.id = 'flashid_'+new Date().getTime();
				flashId = attributes.id;
				var flashvars = {};
				flashvars['width']=video.width;
				flashvars['height']=video.height;
				var server,path;
				$($('.rhapRelatedVideos')[videoIndex]).siblings('source').each(function(index,source){
					if(source.type=='video/mp4; codecs="vp6"'){
						server = $(source).attr('data-server');
						path = $(source).attr('data-src');
					}
				});
				//detecting progressive or streaming
				var server,path;
				if(path){
					if(server!=null){
						flashvars['server']=server;
					}
					flashvars['path']=path;
					flashvars['videoIndex']=videoIndex;
					if(video.poster!=null){
						flashvars['imageurl']=video.poster;
					}
					parent.append($('<div id="replaceMe"><p><a href="http://www.adobe.com/go/getflashplayer"><img src="http://www.adobe.com/images/shared/download_buttons/get_flash_player.gif" alt="Get Adobe Flash player" /></a></p></div>'));
					swfobject.embedSWF("SlimVideoPlayer.swf", 'replaceMe', video.width, video.height, "9.0.0", false, flashvars, params, attributes);
					$(video).remove();
					var scope = this;
					onFlashVideoPlayerLoaded = function(){
						scope._drawCommonControls(scope.video,parent,relatedVideos);
						scope._wireCommonEvents(scope.video);
					};
					/*
					setTimeout(function(){
						video = document.getElementById(attributes.id);
						console.log('video: ' + video);
					},10);
					*/
				}else{
					//no flv
				}
			}
			if(!forcedFlash){
				this._drawCommonControls(this.video,parent,relatedVideos);
				this._wireCommonEvents(this.video);
			}
		};
		this._setSeekBarWidth = function(video){
			var w = video.videoWidth ? video.videoWidth : video.width;
			seekBar.css({'width':w-seekBarLeftOffset-seekBarRightMargin});
		};
		this._drawCommonControls = function(video,parent,relatedVideos){
			drawCommonControlsHelper(parent,video);
			//storing private references
			rhapVideoMoreControls = $('.rhapVideoMoreControls',parent);
			rhapVideoRelatedBtn = $('.rhapVideoRelatedBtn',rhapVideoMoreControls);
			rhapVideoShareBtn = $('.rhapVideoShareBtn',rhapVideoMoreControls);
			rhapVideoSharePanel = $('.rhapVideoSharePanel',parent);
			$(rhapVideoSharePanel).css({
				'left': this.getVideoWidth()/2-723/2 + 'px'
			});
			rhapVideoEmbedPanel = $('.rhapVideoEmbedPanel',parent);
			$(rhapVideoEmbedPanel).css({
				'left': this.getVideoWidth()/2-723/2 + 'px'
			});
			rhapVideoEmbedBtn = $('.rhapVideoEmbedBtn',rhapVideoMoreControls);
			rhapVideoEmbedPanelCloseButton = $('.rhapVideoEmbedPanelCloseButton',rhapVideoEmbedPanel);
			rhapVideoEmbedPanelCloseButton.button();
			rhapVideoShareUrl = $('.rhapVideoShareUrl',rhapVideoSharePanel);
			rhapVideoSharePanelCloseButton = $('.rhapVideoSharePanelCloseButton',rhapVideoSharePanel);
			rhapVideoSharePanelCloseButton.button();
			
			drawRelatedVideosHelper(parent,relatedVideos,video);
			//storing private references
			rhapVideoRelatedPanel = $('.rhapVideoRelatedPanel',parent);
			rhapVideoRelatedPanelCloseButton = $('.rhapVideoRelatedPanelCloseButton',rhapVideoRelatedPanel);
			rhapVideoRelatedPanelCloseButton.button();
			$(rhapVideoRelatedPanel).css({
				'left': this.getVideoWidth()/2-723/2 + 'px'
			});
	
			this.toast = $('.toast',parent);
			this.toast.css('line-height',parent.height()+'px');
		};
		/**
		 * @description the video controls - play, pause, progress, etc.
		 */
		this._drawControls = function(video){
			var scope = this;
			parent.append($(
					'<div class="rhapVideoControls">'+
						'<a href="#" class="rhapVideoPlayControl paused disabled"><span>Play</span><canvas width="32" height="32" class="rhapVideoPlayControlCanvas"/></a>'+
						'<div class="rhapVideoSeekBar"></div>'+
						'<div class="rhapVideoVolumeBox">'+
							'<div class="rhapVideoVolumeBg">'+
								'<div class="rhapVideoVolumeSlider"></div>'+
							'</div>'+
							'<canvas width="24" height="18" class="rhapVideoVolumeButton"/>'+
						'</div>'+
						'<canvas width="24" height="18" class="rhapVideoFullScreenButton"/>'+
						'<canvas width="24" height="18" class="rhapVideoMoreButton"/>'+
					'</div>'));
			//get newly created elements
			controls = $('.rhapVideoControls',parent);
			
			playPause = $('.rhapVideoPlayControl',controls);
			playPauseCanvas = $('.rhapVideoPlayControlCanvas',playPause)[0];
			
			this._drawPlayButton({
				upGradientStops:['#5F6367','#1D1E25']
			});
			seekBar = $('.rhapVideoSeekBar', controls);
			this._setSeekBarWidth(video);
			//timeline controls
			seekBar.slider({
				value: 0,
				step: 0.01,
				orientation: "horizontal",
				range: "min",
				animate: true,					
				slide: function(){							
					seekSliding = true;
				},
				stop:function(e,ui){
					seekSliding = false;						
					$(video).attr("currentTime",ui.value);
					seekValue = ui.value;
				}
			});
			//build the buffer bar
			var sliderRange = $('.ui-slider-range',seekBar);
			sliderRange.after('<div class="rhapVideoBufferBar"></div>');
			rhapVideoBufferBar = $('.rhapVideoBufferBar',controls);
			//build the timer label
			seekBarHandle = $('.ui-slider-handle',seekBar);
			seekBarHandle.after('<canvas width="41" height="26" class="rhapVideoTimer"/>');
			timer = $('.rhapVideoTimer',seekBar);
			_positionTimer();
			drawTimerLabel(timer,41,26,'00:00');
			
			//volume controls
			volumeSlider = $('.rhapVideoVolumeSlider', controls);
			volumeBtn = $('.rhapVideoVolumeButton', controls);
			volumeSlider.slider({
				value: 1,
				orientation: "horizontal",
				range: "min",
				max: 1,
				step: 0.05,
				animate: true,
				slide:function(e,ui){
					$(video).attr('muted',false);
					videoVolume = ui.value;
					$(video).attr('volume',ui.value);
					if(ui.value>0){
						volumeBtn.css('opacity',1);
					}else{
						volumeBtn.css('opacity',0.4);
						video.muted = true;
					}
				}
			});
			drawVolumeBtn(volumeBtn[0]);
			
			fullScreenBtn = $('.rhapVideoFullScreenButton',controls);
			drawFullScreenBtn(fullScreenBtn[0]);
			
			rhapVideoMoreButton = $('.rhapVideoMoreButton',controls);
			toggleMoreBtn(rhapVideoMoreButton[0]);
		};
		this._play = function(video){
			this._fitSourceDimensions(video,function(){
				video.play();
			});
		};
		this._fitSourceDimensions = function(video,callback){
			// var parent = $(video).parent();
			var scope = this;
			if(parent.width()!=video.videoWidth || parent.height()!=video.videoHeight){
				$(video).hide();
				parent.animate({
				    width: video.videoWidth,
				    height: video.videoHeight
				  }, 500, function() {
				    // Animation complete.
					  $(video).css({'width':video.videoWidth,'height':video.videoHeight});
					  scope._setSeekBarWidth(video);
					  $(video).show();
					  callback();
				  });
			}else{
				callback();
			}
		};
		this._wireBigPlayButton = function(video){
			var scope = this;
			$(bigPlayButton).click(function(e){
				e.preventDefault();
				// $(scope.video).hide();
				//video.play();
				scope._play(video);
			});
		};
		this._hideVideoArea = function(video){
			$(video).hide();
			$(parent).css('background','transparent');
			$(controls).hide();
			isHideVideoArea = true;
		};
		this._showVideoArea = function(video){
			$(video).show();
			$(parent).css('background','#000');
			$(controls).show();
			isHideVideoArea = false;
		}
		this.bindVideoEvents = function(video){
			var scope = this;
			$(video).bind('timeupdate',jQuery.proxy(this.seekUpdate,this))
			.bind('durationchange',function(){
				seekBar.slider("option","max",video.duration);
			}).bind('loadstart',function(){
				scope.toast.css('line-height',parent.height()+'px');
				scope.toast.show();
			}).bind('waiting',function(){
				playPause.addClass('disabled');
			}).bind('canplay',function(){
				scope.toast.hide();
				playPause.removeClass('disabled');
				$('body').trigger('canplay');
			}).bind('pause',function(){
				scope.showPausedState();
				scope._drawPlayButton(upGradientStops);
			}).bind('progress',function (e){
			      if(e.total && e.loaded){
			           // percentage of video loaded
			          var proportion =  Math.floor(( e.loaded / e.total * 100));
			          rhapVideoBufferBar.width(proportion+'%');
			      } else {
			           // do nothing because we're autobuffering.
			      }
			}).bind('play',function() {
				$(bigPlayButton).hide();
				playPause.removeClass('paused');
				playPause.addClass('playing');
				playPause.children().text('Pause');
				scope._drawPausedButton(upGradientStops);
			}).bind('ended',function() {
				scope.showPausedState();
				video.pause();
			});
		};
		this.showPausedState = function(){
				//$(bigPlayButton).show();
			this._drawLargePlayButton(this.video);
			this._wireBigPlayButton(this.video);
			playPause.removeClass('playing');
			playPause.addClass('paused');
			playPause.children().text('Play');
		};
		this.seekUpdate = function() {
			// console.log('seek udpate');
			var currenttime = this.video.currentTime;
			if(!seekSliding && this.video.readyState>this.video.HAVE_CURRENT_DATA) {
				if(seekValue>0){
					seekBar.slider('value', seekValue);
					if(seekValue>currenttime){
						seekValue = -1;
					}else{
						seekValue = -2;
					}
				}else{
					var t = currenttime;
					if(seekValue==-1){
						if(currenttime<seekBar.slider('value')){
							t = seekBar.slider('value');
						}
						seekValue=-3;
					}else if(seekValue==-2){
						if(currenttime>seekBar.slider('value')){
							t = seekBar.slider('value');
						}
						seekValue=-3;
					}
					seekBar.slider('value', t);
				}
			}
			drawTimerLabel(timer,41,26,_timeFormat(currenttime));
			if(this.video.buffered && this.video.buffered.end(this.video.buffered.length-1)<=this.video.duration && rhapVideoBufferBar.width()!=rhapVideoBufferBar.parent().width()){
				rhapVideoBufferBar.width(Math.floor(this.video.buffered.end(this.video.buffered.length-1)/this.video.duration*100)+'%');
			}
		};
		/**
		 * @description set up event handlers for html5 video element
		 * @private
		 */
		this._wireHtml5Events = function(video){
			var scope = this;
			$(parent).hover(function(){
				if(!isHideVideoArea){
					$(controls).show();
				}
			},function(){
				$(controls).hide();
				scope.showLess();
			});
			this._wireBigPlayButton(video);
			
			this.bindVideoEvents(video);
			$(playPause).click(function(e){
				e.preventDefault();
				//only play if video's state is passed waiting for data
				if(scope.video.readyState>scope.video.HAVE_CURRENT_DATA){
					if (scope.video.ended || scope.video.paused) {
						scope._play(scope.video);
					} else {
						scope.video.pause();
					}
				}else{
					alert('problem fetching video stream...');
				}
			});
			$(playPause).hover(function(){
				if(scope.video.ended || scope.video.paused){
					scope._drawPlayButton(overGradientStops);
				}else{
					scope._drawPausedButton(overGradientStops);
				}
			},function(){
				if(scope.video.ended || scope.video.paused){
					scope._drawPlayButton(upGradientStops);
				}else{
					scope._drawPausedButton(upGradientStops);
				}
			});
			$( seekBar ).bind( "slide", function(event, ui) {
				drawTimerLabel(timer,41,26,_timeFormat(ui.value));
				_positionTimer();
			});
			$( seekBar ).bind( "slidechange", function(event, ui) {
				_positionTimer();
			});
			$( seekBar ).bind( "slidestart", function(event, ui) {
				scope.video.pause();
			});
			$( seekBar ).bind( "slidestop", function(event, ui) {
				scope.video.play();
			});
			$(volumeBtn).click(function(e){
				e.preventDefault();
				if(!scope.video.muted){
					volumeBtn.css('opacity',0.4);
					volumeSlider.slider("value",0);
					savedVolumeBeforeMute = scope.video.volume;
				}else{
					volumeBtn.css('opacity',1);
					if(savedVolumeBeforeMute==null || savedVolumeBeforeMute==0){
						savedVolumeBeforeMute = 0.5;
					}
					volumeSlider.slider("value",savedVolumeBeforeMute);
				}
				scope.video.muted = !scope.video.muted;
			});
			$(fullScreenBtn).click(function(e){
				e.preventDefault();
				if(!isFullScreen){
					isFullScreen = true;
					$(parent).addClass('rhapVideoFullscreen');
					$(parent).css({'width':'auto','height':'auto'});
					$(scope.video).width('100%');
					$(scope.video).height('100%');
				}else{
					isFullScreen = false;
					$(parent).removeClass('rhapVideoFullscreen');
					$(parent).css({'width':scope.video.videoWidth+'px','height':scope.video.videoHeight+'px'});
					$(scope.video).width(scope.video.videoWidth+'px');
					$(scope.video).height(scope.video.videoHeight+'px');
				}
				var seekBarLeftOffset = 38;
				var seekBarRightMargin = 132;
				var w = parseInt($(scope.video).css('width'));
				seekBar.css({'width':w-seekBarLeftOffset-seekBarRightMargin});
			});
			$(rhapVideoMoreButton).click(function(e){
				e.preventDefault();
				if(!scope.isShowMore){
					scope.showMore();
				}else{
					scope.showLess();
				}
			});
			//private helpers
		};
		/*********************
		 * HELPERS **/
		this._wireCommonEvents = function(video){
			var scope = this;
			/*****************
			 * SHARE **/
			$(rhapVideoShareBtn).click(function(e){
				e.preventDefault();
				if(!scope.isVideoPaused()){
					scope.getVideo().pause();
				}
				scope._hideVideoArea(scope.video);
				rhapVideoSharePanel.slideDown('slow',function(){
					rhapVideoShareUrl.select();
					rhapVideoSharePanelCloseButton.show();
				});
				rhapVideoShareUrl.val(document.location);
				scope.showLess();
			});
			$(rhapVideoSharePanelCloseButton).click(function(e){
				e.preventDefault();
				scope._showVideoArea(scope.video);
				closeSharePanel();
			});
			var closeSharePanel = function(){
				rhapVideoSharePanelCloseButton.hide();
				rhapVideoSharePanel.slideUp('slow');
			};
			/*******************
			 * EMBEDDED **/
			$(rhapVideoEmbedBtn).click(function(e){
				e.preventDefault();
				if(!scope.isVideoPaused()){
					scope.getVideo().pause();
				}
				scope._hideVideoArea(scope.video);
				rhapVideoEmbedPanel.slideDown('slow',function(){
					rhapVideoEmbedPanelCloseButton.show();
				});
				scope.showLess();
			});
			$(rhapVideoEmbedPanelCloseButton).click(function(e){
				e.preventDefault();
				scope._showVideoArea(scope.video);
				closeEmbedPanel();
			});
			var closeEmbedPanel = function(){
				rhapVideoEmbedPanelCloseButton.hide();
				rhapVideoEmbedPanel.slideUp('slow');
			};
			/*******************
			 * RELATED **/
			$(rhapVideoRelatedBtn).click(function(e){
				e.preventDefault();
				if(!scope.isVideoPaused()){
					scope.getVideo().pause();
				}
				scope._hideVideoArea(scope.video);
				rhapVideoRelatedPanel.slideDown('slow',function(){
					rhapVideoRelatedPanelCloseButton.show();
				});
				scope.showLess();
			});
			$(rhapVideoRelatedPanelCloseButton).click(function(e){
				e.preventDefault();
				scope._showVideoArea(scope.video);
				closeRelatedPanel();
			});
			var closeRelatedPanel = function(){
				rhapVideoRelatedPanelCloseButton.hide();
				rhapVideoRelatedPanel.slideUp('slow');
			};
			$("*", rhapVideoRelatedPanel).click(function(e){
				e.preventDefault();
			    var domEl = $(this).get(0);
			    if(domEl.nodeName=='IMG'){
	    			var browser = $.browser;
			    	closeRelatedPanel();
			    	var link = $(domEl).parent();
	    			if($.browser.msie && startsWith($.browser.version,"9")){
	    				var newVideo = document.createElement('video');
	    				var titleLink = link.siblings().get(0);
					    $(newVideo).attr({
					    	'src': link.attr('href'),
					    	'poster':domEl.src,
					    	'title':$(titleLink).text()
					    })
					    ;
	    				parent.prepend(newVideo);
	    				var oldVideo = scope.video;
	    				scope.video = newVideo;
	    				scope.bindVideoEvents(scope.video);
	    				scope._showVideoArea(scope.video);
	    				$(oldVideo).remove();
	    				$('body').bind('canplay',function(){
	    					console.log('can play kicked off');
				    		scope._play(scope.video);
				    	});
				    	//scope._play(scope.video);
	    			}else{
	    				if(forcedFlash){
	    					scope.getVideo().loadVideo({
									'server': link.attr('data-server'),
									'path': link.attr('href')
								});
	    				}else{
					    	video.src = link.attr('href');
					    	video.type = link.attr('data-type');
					    	video.title=link.next('a').text();
					    	$('body').bind('canplay',function(){
					    		scope._showVideoArea(scope.video);
					    		scope._play(video);
					    	});
					    	video.load();
	    				}
	    			}
			    }
			});
		};
		/**
		 * calls common to both html5 and flash
		 */
		this.showMoreControls = function(){
			this.isShowMore = true;
			if(rhapVideoMoreControls.css('display')!='block'){
				rhapVideoMoreControls.slideDown();
			}
		};
		this.hideMoreControls = function(){
			this.isShowMore = false;
			if(rhapVideoMoreControls.css('display')=='block'){
				rhapVideoMoreControls.slideUp();
			}
		};
		this.getVideo = function(){
			if(forcedFlash){
				return document.getElementById(flashId);
			}else{
				return this.video;
			}
		};
		this.isVideoPaused = function(){
			if(forcedFlash){
				return document.getElementById(flashId).isPaused();
			}else{
				return this.video.paused;
			}
		}
		this.getVideoWidth = function(){
			if(forcedFlash){
				return document.getElementById(flashId).width;
			}else{
				return parseInt($(this.video).css('width'));
			}
		}
		this.showMore = function(){
			if(forcedFlash){
				document.getElementById(flashId).toggleMoreBtn('down');
			}else{
				toggleMoreBtn(rhapVideoMoreButton[0],'down');
			}
			this.showMoreControls();
		};
		this.showLess = function(){
			if(forcedFlash){
				document.getElementById(flashId).toggleMoreBtn('up');
			}else{
				toggleMoreBtn(rhapVideoMoreButton[0],'up');
			}
			this.hideMoreControls();
		};
		
		/**
		 * @description method to draw the paused button
		 */
		this._drawPausedButton = function(config){
			var buttonWidth = 32;
			var buttonHeight = 32;
			var buttonCenterX = buttonWidth/2;
			var buttonCenterY = buttonHeight/2;
			var padding = 2;
			
			var canvas = (config.canvas!=null) ? config.canvas : playPauseCanvas;
			//reset painting
			canvas.width = canvas.width;
			var context = canvas.getContext('2d');
			
			drawPlayPauseButtonBackground(context,buttonCenterX,buttonCenterY);
			
			var triangleCoords = drawPauseLeftBar(context, buttonWidth,buttonHeight);
			var grad;
			if(config.upGradientStops!=null){
				grad = context.createLinearGradient(triangleCoords.x1,triangleCoords.y1,triangleCoords.x2,triangleCoords.y1);
				grad.addColorStop(0, config.upGradientStops[0]);
				grad.addColorStop(1, config.upGradientStops[1]);
			}else if(config.overGradientStops!=null){
				// set up gradient 
				grad = context.createRadialGradient(
						triangleCoords.x1+2, triangleCoords.y1+(triangleCoords.y3-triangleCoords.y1)/2, .2,
						triangleCoords.x1, triangleCoords.y1, 3);
				var stops = {
						0: '#86CFEF', 
						'0.55': '#6EC2E9', 
						1: '#01B4E8'
				};
				
				for (var position in stops) {
					var color = stops[position];
					grad.addColorStop(position, color);
				}
			}
			context.fillStyle=grad;
			context.lineWidth = 1;
			context.strokeStyle= '#424242';
			context.fill(); 
			context.stroke(); 
			
			var triangleCoords = drawPauseRightBar(context, buttonWidth,buttonHeight);
			var grad;
			if(config.upGradientStops!=null){
				grad = context.createLinearGradient(triangleCoords.x1,triangleCoords.y1,triangleCoords.x2,triangleCoords.y1);
				grad.addColorStop(0, config.upGradientStops[0]);
				grad.addColorStop(1, config.upGradientStops[1]);
			}else if(config.overGradientStops!=null){
				// set up gradient 
				grad = context.createRadialGradient(
						triangleCoords.x1+2, triangleCoords.y1+(triangleCoords.y3-triangleCoords.y1)/2, .2,
						triangleCoords.x1, triangleCoords.y1, 1);
				var stops = {
						0: '#86CFEF', 
						'0.55': '#6EC2E9', 
						1: '#01B4E8'
				};
				
				for (var position in stops) {
					var color = stops[position];
					grad.addColorStop(position, color);
				}
			}
			context.fillStyle=grad;
			context.lineWidth = 1;
			context.strokeStyle= '#424242';
			context.fill(); 
			context.stroke(); 
		};
		
		/**
		 * @description method to draw the play button
		 */
		this._drawPlayButton = function(config){
			var buttonWidth = 32;
			var buttonHeight = 32;
			var buttonCenterX = buttonWidth/2;
			var buttonCenterY = buttonHeight/2;
			var padding = 2;
			
			var canvas = (config.canvas!=null) ? config.canvas : playPauseCanvas;
			//reset painting
			canvas.width = canvas.width;
			var context = canvas.getContext('2d');
			
			drawPlayPauseButtonBackground(context,buttonCenterX,buttonCenterY);
			
			var triangleCoords = drawTriangle(context,buttonWidth,buttonHeight,padding);
			var grad;
			if(config.upGradientStops!=null){
				grad = context.createLinearGradient(triangleCoords.x1,triangleCoords.y1,triangleCoords.x2,triangleCoords.y1);
				grad.addColorStop(0, config.upGradientStops[0]);
				grad.addColorStop(1, config.upGradientStops[1]);
			}else if(config.overGradientStops!=null){
				// set up gradient 
				grad = context.createRadialGradient(
						buttonCenterX+2, buttonCenterY, .4,
						buttonCenterX, buttonCenterY, 3);
				var stops = {
						0: '#86CFEF', 
						'0.55': '#6EC2E9', 
						1: '#01B4E8'
				};
				
				for (var position in stops) {
					var color = stops[position];
					grad.addColorStop(position, color);
				}
			}
			context.fillStyle=grad;
			context.lineWidth = 1;
			context.strokeStyle= '#424242';
			context.fill(); 
			context.stroke(); 
		};
		/**
		 * @description method to draw the large play button for html5 video player
		 * @private
		 */
		this._drawLargePlayButton = function(video){
			/* @const */ var bigButtonMaxWidth = 125;
			/* @const */ var bigButtonMinWidth = 85;
			var videoWidth = (video.videoWidth ? video.videoWidth : video.width);
			var videoHeight = (video.videoHeight ? video.videoHeight : video.height);
			// set button measurements 
			var bigButtonWidth =  videoWidth*20/100;
			bigButtonWidth = bigButtonWidth > bigButtonMaxWidth ? bigButtonMaxWidth : Math.max(bigButtonMinWidth, bigButtonWidth);
			var bigButtonHeight = bigButtonWidth*.7;
			// draw and position it 
			if($('.bigPlayButton',parent).length==0){
				$(video).after($('<canvas class="bigPlayButton" width="'+bigButtonWidth+'px" height="'+bigButtonHeight+'px"></canvas>'));
				bigPlayButton = $(video).next()[0];
			}else{
				bigPlayButton = $(video).next()[0];
				bigPlayButton.width = bigButtonWidth;
				bigPlayButton.height = bigButtonHeight;
				$(bigPlayButton).show();
			}
			var bigButtonX = videoWidth/2-bigButtonWidth/2;
			var bigButtonY = videoHeight/2-bigButtonHeight/2;
			bigPlayButton = $(video).next()[0];
			$(bigPlayButton).css({
				'left':bigButtonX+'px',
				'top':bigButtonY+'px',
				'position':'absolute'
			});
			// draw the play triangle
			var context = bigPlayButton.getContext("2d");
			//reset canvas
			context.clearRect(0, 0, bigPlayButton.width, bigPlayButton.height);
			var padding = 0;
			
			drawLargeTriangle(context,bigButtonWidth,bigButtonHeight,2);
			
			var halfWidth = bigButtonWidth / 2;
			var halfHeight = bigButtonHeight / 2;
			
			// set up gradient 
			var grad = context.createRadialGradient(
					halfWidth+9, halfHeight, 0,
					halfWidth, halfHeight, halfWidth/2);
			var stops = {
					0: '#C2E1EF', 
					'0.55': '#6EC2E9', 
					1: '#01B4E8'
			};
			
			for (var position in stops) {
				var color = stops[position];
				grad.addColorStop(position, color);
			}
			
			// draw gradient 
			context.fillStyle = grad;
			context.fill();
		};
	};
	$(function(){
		var stringLimit = 17;
		$('video').each(function(index,video){
			//wrap each video element in a div so we have context to build the controls
			$(video).wrap(function() {
				return '<div class="rhapVideoWrapper" style="height:'+video.height+'px;width:'+video.width+'px"/>';//style="height:'+video.height+'px"
			});
			var relateds = [];
			var mainSource = getSupportedVideoSource(video,index);
			var firstVideo = {
				poster: video.poster,
				width: video.width,
				height: video.height,
				src: mainSource.src,
				type: mainSource.type,
				title: video.title.length > stringLimit ? video.title.substring(0,stringLimit)+'...' : video.title
			};
			if(mainSource['server']!=null){
				firstVideo['server']=mainSource['server'];
			}
			console.log('pushing first video: ' + firstVideo.src);
			relateds.push(firstVideo);
			var relatedVideo;
			$($('.rhapRelatedVideos')[index]).children().each(function(index,relatedVideo){
				var related = $(relatedVideo);
				var poster = related.attr('data-poster');
				var width = related.attr('data-width');
				var height = related.attr('data-height');
				var relatedVideoSource = getSupportedRelatedVideoSource(video,relatedVideo);
				var src = relatedVideoSource.src;
				var type = relatedVideoSource.type;
				var title = related.attr('title');
				relatedVideo = {
					poster: poster,
					width: width,
					height: height,
					src: src,
					type: type,
					title: title.length > stringLimit ? title.substring(0,stringLimit)+'...' : title
				};
				if(relatedVideoSource['server']!=null){
					relatedVideo['server']=relatedVideoSource['server'];
				}
				relateds.push(relatedVideo);
			});
			videos.push(new RhapVideo().init(index,video,relateds,false));
		});
	});
})(jQuery);