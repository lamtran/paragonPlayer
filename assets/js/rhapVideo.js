jQuery.noConflict();
//whether this is on production or not
var rhapVideoProd = false;

var videos=[];
var RhapVideo;
var rhapVideoPlayerSetUp = function(){
	/***************
	 * sniff browser
	 * **************/
	var ua = navigator.userAgent;
	var checker = {
		iphone: ua.match(/(iPhone|iPod|iPad)/),
		blackberry: ua.match(/BlackBerry/),
		android: ua.match(/Android/)
	};
	if (checker.android || checker.iphone || checker.blackberry) {
		/*******************************
		 * set up html5 video for mobile devices
		 **************************************/
		jQuery('video').each(function(index,video){
			video.controls=true;
			jQuery(video).click(function(e){
				var v = e.target;
				if(rhapVideoSupportsVideo(v)){
					if(!v.ended && !v.paused){
						// alert('playing');
					}else{
						v.src=rhapVideoGetMp4MobileSrc(v);
						v.load();
						v.play();
					}
				}else{
					document.location = rhapVideoGetMp4MobileSrc(v);
				}
			});
		});
	} else {
		/************************************
		 * set up video player for browsers
		 ************************************/
		jQuery('video').each(function(index,video){
			videos.push(new RhapVideo().init(index,video));
		});
	}
}
/**
 * @description method to detect video element support in current browser
 * @static
 */
var rhapVideoSupportsVideo = function(v) {
	return !!v.canPlayType;
}
var rhapVideoGetMp4MobileSrc = function(v) {
	var src='';
	$(v).children('source').each( function(index,source) {
		if($(source).attr('data-mobile')=='true') {
			src = $(source).attr('src');
			return false;
		}
	});
	return src;
}
/**
 * methods exposed to Flash
 */
function rhapVideoShowMore(videoIndex){
	videos[videoIndex].showMoreControls();
}
function rhapVideoShowLess(videoIndex){
	videos[videoIndex].hideMoreControls();
}
function rhapVideoOnFlashVideoPlayerLoaded(){
	//overwrite this
	//console.log('onflashvideoplayerloaded!');
}
function rhapVideoOnFlashLog(msg){
	//console.log('fromFlash: ' + msg);
}
function rhapVideoHideMoreControls(videoIndex){
	var vid = videos[videoIndex];
	if(vid.isShowMore){
		vid.showLess();
	}
}

//video player definitions
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
	RhapVideo = function(){
		// constants
		var swfLocation = host+'SlimVideoPlayer.swf?t=' + new Date().getTime();
		this.video;
		var videoPlay25Percent, videoPlay50Percent, videoPlay75Percent;
		var stringLimit = 17;
		var forcedHeight, forcedWidth;
		var forcedSize = false;
		var flashId, parent, videoIndex, forcedFlash, relatedVideos, controls, playPause, playPauseCanvas, seekBar, timer, volumeSlider, volumeBtn, fullScreenBtn, rhapVideoBufferBar;
		var bigPlayButton, seekBarHandle, rhapVideoMoreButton;
		var seekSliding, seekValue=-1, videoVolume, savedVolumeBeforeMute, isFullScreen = false;
		var rhapVideoMoreControls, rhapVideoSharePanel, rhapVideoShareBtn, rhapVideoShareUrl, rhapVideoSharePanelCloseButton;
		var rhapVideoDuration, rhapVideoEmbedPanel, rhapVideoEmbedBtn, rhapVideoEmbedPanelCloseButton;
		var rhapVideoRelatedBtn, rhapVideoRelatedPanel, rhapVideoRelatedPanelCloseButton;
		var relatedCanvas;
		this.toast;
		var seekBarLeftOffset = 38;
		var seekBarRightMargin = 132;//172;
		var isHideVideoArea = false;
		var overGradientStops = {overGradientStops:['#5F6367','#1D1E25']};
		var upGradientStops = {upGradientStops:['#5F6367','#1D1E25']};
		/* @const */ var WAITING_STATE = 2;
		this.isShowMore = false;
		this.html;
		this.init = function(index,videoElement,relateds,forcedFlashVideo,forcedConstantSize){
			//wrap each video element in a div so we have context to build the controls
			$(videoElement).wrap(function() {
				return '<div class="rhapVideoWrapper" style="height:'+videoElement.height+'px;width:'+videoElement.width+'px"/>';
			});
			this.html=$(videoElement).parent().html();
			//var forcedSize = $(video).attr('data-forced-size') ? $(video).attr('data-forced-size')=='true' : false;
			var preferredWidth = Number($(videoElement).attr('data-preferred-width'));
			var preferredHeight = Number($(videoElement).attr('data-preferred-height'));
			forcedSize = videoElement.width == preferredWidth && videoElement.height == preferredHeight;
			forcedFlash = $(videoElement).attr('data-forced-flash') ? $(videoElement).attr('data-forced-flash')=='true' : false;
			var relateds = [];
			var mainSource = getSupportedVideoSource(videoElement,index,forcedFlash);
			var firstVideo = {
				poster: videoElement.poster,
				width: videoElement.width,
				height: videoElement.height,
				src: mainSource.src,
				type: mainSource.type,
				title: videoElement.title.length > stringLimit ? videoElement.title.substring(0,stringLimit)+'...' : videoElement.title
			};
			videoElement.src=mainSource.src;
			videoElement.type=mainSource.type;
			if(mainSource['server']!=null){
				firstVideo['server']=mainSource['server'];
			}
			relateds.push(firstVideo);
			var relatedVideo;
			$($('.rhapRelatedVideos')[index]).children().each(function(index,relatedVideo){
				var related = $(relatedVideo);
				var poster = related.attr('data-poster');
				var width = related.attr('data-width');
				var height = related.attr('data-height');
				var relatedVideoSource = getSupportedRelatedVideoSource(videoElement,relatedVideo,forcedFlash);
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
			
			videoIndex = index;
			this.video = videoElement;
			parent = $(this.video).parent();
			relatedVideos = relateds;
			forcedHeight = videoElement.height;
			forcedWidth = videoElement.width;
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
				this._drawRelatedCanvas(video);
				this._drawControls(video);
				this._wireHtml5Events(video);
			}else{
				forcedFlash = true;
				var params = {};
				params.scale = "noscale";
				params.menu = "false";
				params.allowscriptaccess = "always";
				params.allowFullScreen = "true";
				params.analyticstrackcode=analyticsCode;
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
					flashvars['analyticstrackcode']=analyticsCode;
					if(video.poster!=null){
						flashvars['imageurl']=video.poster;
					}
					parent.append($('<div id="replaceMe"><p><a href="http://www.adobe.com/go/getflashplayer"><img src="http://www.adobe.com/images/shared/download_buttons/get_flash_player.gif" alt="Get Adobe Flash player" /></a></p></div>'));
					swfobject.embedSWF(swfLocation, 'replaceMe', video.width, video.height, "9.0.0", false, flashvars, params, attributes);
					$(video).remove();
					var scope = this;
					rhapVideoOnFlashVideoPlayerLoaded = function(){
						scope._drawCommonControls(scope.video,parent,relatedVideos);
						scope._wireCommonEvents(scope.video);
					};
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
			$('.embedcode',parent).text(this.html);
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
		this._play = function(video,dimensions){
			this._fitSourceDimensions(video,dimensions,function(){
				video.play();
			});
		};
		this._fitSourceDimensions = function(video,dimensions,callback){
			// var parent = $(video).parent();
			var scope = this;
			if((parent.width()!=dimensions['width'] || parent.height()!=dimensions['height'])){
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
				if(scope.video.readyState>scope.video.HAVE_CURRENT_DATA){
					scope._play(scope.video,{
						width: video.width,
						height: video.height
					});
				}else{
					alert('problem fetching video stream...'+scope.video.readyState+' vs ' + scope.video.HAVE_CURRENT_DATA);
				}
				/*
				scope._play(video,{
					width: video.width,
					height: video.height
				});
				*/
			});
		};
		this._hideVideoArea = function(video){
			$(video).hide();
			$(parent).css('background','transparent');
			$(controls).hide();
			$(bigPlayButton).hide();
			isHideVideoArea = true;
		};
		this._showVideoArea = function(video){
			$(video).show();
			$(parent).css('background','#000');
			$(controls).show();
			$(bigPlayButton).show();
			isHideVideoArea = false;
		}
		this.bindVideoEvents = function(video){
			var scope = this;
			$(video).bind('timeupdate',$.proxy(this.seekUpdate,this))
			.bind('durationchange',function(){
				videoPlay25Percent = Math.round((video.duration/100)*25);
				videoPlay50Percent = Math.round((video.duration/100)*50);
				videoPlay75Percent = Math.round((video.duration/100)*75);
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
				if($(scope.video).attr("currentTime")==0){
					_gaq.push(['_trackEvent', 'VideoPlayer', 'Play', '0%'+document.location+':'+video.src]);
				}
				$(bigPlayButton).hide();
				playPause.removeClass('paused');
				playPause.addClass('playing');
				playPause.children().text('Pause');
				scope._drawPausedButton(upGradientStops);
			}).bind('ended',function() {
				_gaq.push(['_trackEvent', 'VideoPlayer', 'Play', '100%'+document.location+':'+scope.video.src]);
				videoPlay25Percent=Math.round((scope.video.duration/100)*25);
				videoPlay50Percent=Math.round((scope.video.duration/100)*50);
				videoPlay75Percent=Math.round((scope.video.duration/100)*75);
				scope.showPausedState();
				video.pause();
			});
		};
		this.showPausedState = function(){
			if(!forcedSize){
				this._drawLargePlayButton(this.video);
				this._wireBigPlayButton(this.video);
			}else{
				if(!isHideVideoArea){
					$(bigPlayButton).show();
				}
			}
			playPause.removeClass('playing');
			playPause.addClass('paused');
			playPause.children().text('Play');
		};
		this.seekUpdate = function() {
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
					var flooredT = Math.floor(t);
					if(flooredT==videoPlay25Percent){
						_gaq.push(['_trackEvent', 'VideoPlayer', 'Play', '25%'+document.location+':'+this.video.src]);
						videoPlay25Percent=-1;
					}else if(flooredT==videoPlay50Percent){
						_gaq.push(['_trackEvent', 'VideoPlayer', 'Play', '50%'+document.location+':'+this.video.src]);
						videoPlay50Percent=-1;
					}else if(flooredT==videoPlay75Percent){
						_gaq.push(['_trackEvent', 'VideoPlayer', 'Play', '75%'+document.location+':'+this.video.src]);
						videoPlay75Percent=-1;
					}
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
						scope._play(scope.video,{
							width: video.width,
							height: video.height
						});
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
					var w,h;
					if(forcedSize){
						w = forcedWidth;
						h = forcedHeight;
					}else{
						w = scope.video.videoWidth;
						h = scope.video.videoHeight;
					}
					$(parent).css({'width':w+'px','height':h+'px'});
					$(scope.video).width(w+'px');
					$(scope.video).height(h+'px');
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
				$(controls).hide();
				$(bigPlayButton).hide();
				scope.showLess();
				console.log(relatedCanvas);
				var ctx = relatedCanvas.getContext('2d');
				console.log(scope.getVideo().width+' h: ' + scope.getVideo().height);
				console.log(scope.getVideo());
				ctx.drawImage(scope.getVideo(),0,0,scope.getVideo().width,scope.getVideo().height);
				/*
				scope._hideVideoArea(scope.video);
				rhapVideoRelatedPanel.slideDown('slow',function(){
					rhapVideoRelatedPanelCloseButton.show();
				});
				*/
				
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
			    	if(forcedFlash){
    					var path = link.attr('href');
    					//IE-7 fix
    					if(startsWith(path,'http://localhost/')){
    						path = path.substring(17, path.length);
    					}
    					var videoConfig = {
							'server': link.attr('data-server'),
							'path': path
						};
						if(forcedSize){
							videoConfig['height']=forcedHeight;
							videoConfig['width']=forcedWidth;
						}else{
							// load in videos native size
						}
    					scope.getVideo().loadVideo(videoConfig);
    				}else{
		    			if($.browser.msie && startsWith($.browser.version,"9")){
		    				var newVideo = document.createElement('video');
		    				var titleLink = link.siblings().get(0);
		    				var dimensions={};
					    	if(forcedSize){
					    		dimensions['width'] = forcedWidth;
					    		dimensions['height'] = forcedHeight;
					    	}else{
					    		//size not forced, fall onto hard-coded size
						    	if(link.attr('data-width')){
						    		dimensions['width'] = link.attr('data-width');
						    	}
						    	if(link.attr('data-height')){
						    		dimensions['height'] = link.attr('data-height');
						    	}
						    	//nothing was specified, use video's native size
						    	if(vidW==null){
						    		dimensions['width'] = video.videoWidth;
						    	}
						    	if(vidH==null){
						    		dimensions['height'] = video.videoHeight;
						    	}
					    	}
						    $(newVideo).attr({
						    	'src': link.attr('href'),
						    	'poster':domEl.src,
						    	'title':$(titleLink).text()
						    })
						    .css({
						    	width: dimensions['width']+'px',
						    	height: dimensions['height']+'px'
						    })
						    ;
		    				parent.prepend(newVideo);
		    				var oldVideo = scope.video;
		    				scope.video = newVideo;
		    				scope.bindVideoEvents(scope.video);
		    				scope._showVideoArea(scope.video);
		    				$(oldVideo).remove();
		    				
					    	
		    				$('body').bind('canplay',function(){
					    		scope._play(scope.video,dimensions);
					    	});
					    	//scope._play(scope.video);
		    			}else{
					    	video.src = link.attr('href');
					    	video.type = link.attr('data-type');
					    	video.title=link.next('a').text();
					    	var dimensions={};
					    	if(forcedSize){
					    		dimensions['width'] = forcedWidth;
					    		dimensions['height'] = forcedHeight;
					    	}else{
					    		//size not forced, fall onto hard-coded size
						    	if(link.attr('data-width')){
						    		dimensions['width'] = link.attr('data-width');
						    	}
						    	if(link.attr('data-height')){
						    		dimensions['height'] = link.attr('data-height');
						    	}
						    	//nothing was specified, use video's native size
						    	if(vidW==null){
						    		dimensions['width'] = video.videoWidth;
						    	}
						    	if(vidH==null){
						    		dimensions['height'] = video.videoHeight;
						    	}
					    	}
					    	$('body').bind('canplay',function(){
					    		scope._showVideoArea(scope.video);
					    		scope._play(video,dimensions);
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
		this._drawRelatedCanvas = function(video){
			console.log('drawing related canas with: ' + video.width + ' - ' + video.height);
			$(video).after($('<canvas class="relatedCanvas" width="'+video.width+'" height="'+video.height+'"></canvas>'));
			relatedCanvas = $(video).next()[0];
		};
		/**
		 * @description method to draw the large play button for html5 video player
		 * @private
		 */
		this._drawLargePlayButton = function(video){
			/* @const */ var bigButtonMaxWidth = 125;
			/* @const */ var bigButtonMinWidth = 85;
			var videoWidth = video.width;//(video.videoWidth ? video.videoWidth : video.width);
			var videoHeight = video.height;//(video.videoHeight ? video.videoHeight : video.height);
			// set button measurements 
			var bigButtonWidth =  videoWidth*20/100;
			bigButtonWidth = bigButtonWidth > bigButtonMaxWidth ? bigButtonMaxWidth : Math.max(bigButtonMinWidth, bigButtonWidth);
			var bigButtonHeight = bigButtonWidth*.7;
			// draw and position it 
			if($('.bigPlayButton',parent).length==0){
				$(video).after($('<canvas class="bigPlayButton" width="'+bigButtonWidth+'px" height="'+bigButtonHeight+'px"></canvas>'));
				bigPlayButton = $(video).next()[0];
			}else{
				bigPlayButton = parent.find('.bigPlayButton')[0];
				bigPlayButton.width = bigButtonWidth;
				bigPlayButton.height = bigButtonHeight;
				$(bigPlayButton).show();
			}
			var bigButtonX = videoWidth/2-bigButtonWidth/2;
			var bigButtonY = videoHeight/2-bigButtonHeight/2;
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
	
	/** utils
	 * ***********************************************************/
	var host = rhapVideoProd ? 'http://labs.rhapsody.com/paragon/harness/' : '';
	var analyticsCode = localStorage['analyticscode'] ? localStorage['analyticscode'] : rhapVideoProd ? 'UA-225770-1' : 'UA-5860230-6';//'UA-225770-1';
	/**
	 * @description method to check if a string starts with another string
	 * @static
	 */
	var startsWith = function(str,startsWithThis) {
		return (str.match("^"+startsWithThis)==startsWithThis);
	}
	
	var endsWith = function(str,endsWithThis) {
		return (str.match(endsWithThis+"$")==endsWithThis);
	}
	
	var printTimeRanges = function(tr) {
		if (tr == null)
			return "undefined";
		s= tr.length + ": ";
		for (i=0; i<tr.length; i++) {
			s += tr.start(i) + " - " + tr.end(i) + "; ";
		}
		return s;
	}
	
	/**
	 * @description catch-all method to allow logging on all browsers
	 * @static
	 * @param event
	 */
	var log = function(event) {
		if (!event) {
			return;
		}
		if (typeof event == "string") {
			event = {
				type: event
			};
		}
		if (event.type) {
			this.history.push(event.type);
		}
		if (this.history.length >= 50) {
			this.history.shift();
		}
		try {
			console.log(event.type);
		} catch(e) {
			try {
				opera.postError(event.type);
			} catch(e) {
			}
		}
	}
	
	/** feature detection
	 * ************************************************************/
	/**
	 * @description method to detect h264 codec support in current browser
	 * @static
	 */
	var supportsH264Codec = function(v) {
		if (!rhapVideoSupportsVideo(v)) {
			return false;
		}
		return $(v).has('source[type=\'video/mp4; codecs="avc1.42E01E, mp4a.40.2"\']').length>0 && v.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');
	}
	
	/**
	 * @description method to detect vp8 support in current browser
	 * @static
	 */
	var supportsVp8Codec = function(v) {
		if (!rhapVideoSupportsVideo(v)) {
			return false;
		}
		return $(v).has('source[type=\'video/webm; codecs="vp8, vorbis"\']').length>0 && v.canPlayType('video/webm; codecs="vp8, vorbis"');
	}
	
	/**
	 * @description method to detect theora codec support in current browser
	 * @static
	 */
	var supportsTheoraCodec = function(v) {
		if (!rhapVideoSupportsVideo(v)) {
			return false;
		}
		return $(v).has('source[type=\'video/ogg; codecs="theora, vorbis"\']').length>0 && v.canPlayType('video/ogg; codecs="theora, vorbis"');
	}
	
	var supportsWebStorage = function(){
		return window.localStorage;
	}
	
	var getSupportedVideoSource = function(v,videoIndex,forcedFlash) {
		var match = {};
		$($('.rhapRelatedVideos')[videoIndex]).siblings('source').each( function(index,source) {
			if(!renderHtml5Video(v) || forcedFlash){
				if(source.type=='video/mp4; codecs="vp6"') {
					match['server'] = $(source).attr('data-server');
					match['type'] = source.type;
					match['src'] = $(source).attr('data-src');
					return false;
				}
			}else{
				if(supportsH264Codec(v)) {
					if(source.type=='video/mp4; codecs="avc1.42E01E, mp4a.40.2"') {
						match['src'] = source.src;
						match['type'] = source.type;
						return false;
					}
				}
				if(supportsVp8Codec(v)) {
					if(source.type=='video/webm; codecs="vp8, vorbis"') {
						match['src'] = source.src;
						match['type'] = source.type;
						return false;
					}
				}
				if(supportsTheoraCodec(v)) {
					if(source.type=='video/ogg; codecs="theora, vorbis"') {
						match['src'] = source.src;
						match['type'] = source.type;
						return false;
					}
				}
			}
		});
		return match;
	}
	var getSupportedRelatedVideoSource = function(v,relatedVideo,forcedFlash) {
		var match = {};
		$(relatedVideo).children('span').each( function(index,source) {
			if(!renderHtml5Video(v) || forcedFlash){
				if($(source).attr('data-type')=='video/mp4; codecs="vp6"') {
					match['server'] = $(source).attr('data-server');
					match['type'] = $(source).attr('data-type');
					match['src'] = $(source).attr('data-src');
					return false;
				}
			}else{
				if(supportsH264Codec(v)) {
					if($(source).attr('data-type')=='video/mp4; codecs="avc1.42E01E, mp4a.40.2"') {
						match['src'] = $(source).attr('data-src');
						match['type'] = $(source).attr('data-type');
						return false;
					}
				}
				if(supportsVp8Codec(v)) {
					if($(source).attr('data-type')=='video/webm; codecs="vp8, vorbis"') {
						match['src'] = $(source).attr('data-src');
						match['type'] = $(source).attr('data-type');
						return false;
					}
				}
				if(supportsTheoraCodec(v)) {
					if($(source).attr('data-type')=='video/ogg; codecs="theora, vorbis"') {
						match['src'] = $(source).attr('data-src');
						match['type'] = $(source).attr('data-type');
						return false;
					}
				}
			}
		});
		return match;
	}
	
	/**
	 * @description method to detect canvas element support in current browser
	 * @static
	 */
	var supportsCanvas = function() {
		return !!document.createElement('canvas').getContext;
	}
	
	/**
	 * @description A utility function to convert from degrees to radians
	 */
	var rads = function(x) {
		return Math.PI*x/180;
	}
	
	/**
	 * @description method to check whether to render an html5 <video> element
	 * @private
	 */
	var renderHtml5Video = function(v) {
		return rhapVideoSupportsVideo(v) &&
		(supportsH264Codec(v) || supportsVp8Codec(v)  || supportsTheoraCodec(v));
	};
	/**
	 * DRAW UTILS
	 */
	/**
	 * @description helper to draw a triangle
	 * @param context
	 * @param width
	 * @param height
	 * @param padding
	 * @returns {___anonymous3214_3277}
	 */
	var drawTriangle = function(context,width,height,padding) {
		var x1 = padding/2 + 1.3*width/4;
		var y1 = height/4 + padding;
		var x2 = -padding + 3.2*width/4;
		var y2 = height/2;
		var x3 = padding/2 + 1.3*width/4;
		var y3 = 3*height/4 - padding;
		context.beginPath();
		context.moveTo(x1, y1);
		context.lineTo(x2, y2 );
		context.lineTo(x3, y3);
		context.closePath();
		return {
			x1:x1,
			y1:y1,
			x2:x2,
			y2:y2,
			x3:x3,
			y3:y3
		};
	}
	
	/**
	 * @description helper to draw a large, less flattened triangle
	 * @param context
	 * @param width
	 * @param height
	 * @param padding
	 * @returns {___anonymous3889_3952}
	 */
	var drawLargeTriangle = function(context,width,height,padding) {
	
		var x1 = padding/2 + 1.5*width/4;
		var y1 = height/4 + padding;
		var x2 = -padding + 3*width/4;
		var y2 = height/2;
		var x3 = padding/2 + 1.5*width/4;
		var y3 = 3*height/4 - padding;
		context.beginPath();
		context.moveTo(x1, y1);
		context.lineTo(x2, y2 );
		context.lineTo(x3, y3);
		context.closePath();
		return {
			x1:x1,
			y1:y1,
			x2:x2,
			y2:y2,
			x3:x3,
			y3:y3
		};
	}
	
	var drawPauseLeftBar = function(context, width,height) {
		var barWidth = width/6;
		var barHeight = 14;
		var xOffset = 1.2;
		var yOffset = 1;
		var x1 = width/4+xOffset;
		var y1 = height/4+xOffset+yOffset;
		var x2 = width/4+xOffset+barWidth;
		var y2 = height/4+xOffset+yOffset;
		var x3 = width/4+xOffset+barWidth;
		var y3 = height/4+xOffset+barHeight-yOffset;
		var x4 = width/4+xOffset;
		var y4 = height/4+xOffset+barHeight-yOffset;
		context.beginPath();
		context.moveTo(x1, y1);
		context.lineTo(x2, y2 );
		context.lineTo(x3, y3);
		context.lineTo(x4, y4);
		context.closePath();
		return {
			x1:x1,
			y1:y1,
			x2:x2,
			y2:y2,
			x3:x2,
			y3:y3
		};
	}
	
	var drawRoundRect = function(ctx, x, y, width, height, radius) {
		ctx.beginPath();
		ctx.moveTo(x + radius, y);
		ctx.lineTo(x + width - radius, y);
		ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
		ctx.lineTo(x + width, y + height - radius);
		ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
		ctx.lineTo(x + radius, y + height);
		ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
		ctx.lineTo(x, y + radius);
		ctx.quadraticCurveTo(x, y, x + radius, y);
		ctx.closePath();
	}
	
	var drawPauseRightBar = function(context, width,height) {
		var barWidth = width/6;
		var barHeight = 14;
		var xOffset = 1.2;
		var yOffset = 1;
		var x1 = width/4+xOffset+barWidth+3;
		var y1 = height/4+xOffset+yOffset;
		var x2 = width/4+xOffset+barWidth+barWidth+3;
		var y2 = height/4+xOffset+yOffset;
		var x3 = width/4+xOffset+barWidth+barWidth+3;
		var y3 = height/4+xOffset+barHeight-yOffset;
		var x4 = width/4+xOffset+barWidth+3;
		var y4 = height/4+xOffset+barHeight-yOffset;
		context.beginPath();
		context.moveTo(x1, y1);
		context.lineTo(x2, y2 );
		context.lineTo(x3, y3);
		context.lineTo(x4, y4);
		context.closePath();
		return {
			x1:x1,
			y1:y1,
			x2:x2,
			y2:y2,
			x3:x2,
			y3:y3
		};
	}
	
	var toggleMoreBtn = function(canvas,direction) {
		if(direction==null) {
			direction = 'up';
		}
		var context = canvas.getContext('2d');
		var width = 18;
		var height = 18;
		var directionOffset = direction=='up' ? height/3 +1: 2*height/3-1;
		var yOffset = direction=='up' ? height/2 + 1: height/2 - 1;
		context.fillStyle='#29ABE2';
		context.lineWidth = 1;
		context.beginPath();
		context.arc(width/2, height/2, 8, 0, Math.PI * 2, true);
		context.fill();
		context.closePath();
	
		context.lineWidth = 3;
		context.strokeStyle= '#0C303F';
		context.beginPath();
		context.moveTo(width/4,yOffset);
		context.lineTo(width/2,directionOffset);
		context.lineTo(3*width/4,yOffset);
		context.stroke();
	};
	var drawCommonControlsHelper = function(parent,video) {
		parent.append($(
		'<div class="rhapVideoMoreControls">'+
		'<ul>'+
		'<li><a href="#" class="rhapVideoRelatedBtn">related</a></li>'+
		//'<li><a href="#">cc</a></li>'+
		'<li><a href="#" class="rhapVideoEmbedBtn">embed</a></li>'+
		'<li><a href="#" class="rhapVideoShareBtn">share</a></li>'+
		'</ul>'+
		'</div>'
		));
	
		parent.append($(
		'<div class="rhapVideoSharePanel">'+
		'<h2 class="panelHeader">Share</h2>'+
		'<div class="rhapVideoSharePanelContent">'+
		'<span>Get URL:&nbsp;</span><input type="text" class="rhapVideoShareUrl"/>'+
		'<ul>'+
		'<li><a name="fb_share" type="button_count">Share</a><script src="http://static.ak.fbcdn.net/connect.php/js/FB.Share" type="text/javascript"></script></li>'+
		'<li><a href="http://twitter.com/share" class="twitter-share-button" data-count="none">Tweet</a><script type="text/javascript" src="http://platform.twitter.com/widgets.js"></script></li>'+
		'<li><a title="Post to Google Buzz" class="google-buzz-button" href="http://www.google.com/buzz/post" data-button-style="small-button"></a><script type="text/javascript" src="http://www.google.com/buzz/api/button.js"></script></li>'+
		'</ul>'+
		'</div>'+
		'<a href="#" class="rhapVideoSharePanelCloseButton">Close</a>'+
		'</div>'
		));
		parent.append($(
		'<div class="rhapVideoEmbedPanel">'+
		'<h2 class="panelHeader">Embed</h2>'+
		'<div class="rhapVideoSharePanelContent">'+
		//'<textarea class="rhapVideoEmbedCode">'+
		'<h3>Put these in the &lt;head&gt; section of your webpage</h3>'+
		'<p>'+
		'<code>'+
		'&lt;!-- player\'s styles --&gt;'+
		'&lt;link href="http://ajax.googleapis.com/ajax/libs/$ui/1.8.14/themes/flick/$-ui.css" media="screen" rel="stylesheet" type="text/css" /&gt;'+
		'&lt;link href="'+host+'assets/css/rhapVideo.css" media="screen" rel="stylesheet" type="text/css" /&gt;'+
		'&lt;!-- player\'s libraries --&gt;'+
		'&lt;script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/$/1.6.2/$.min.js"&gt;&lt;/script&gt;'+
		'&lt;script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/$ui/1.8.14/$-ui.min.js"&gt;&lt;/script&gt;'+
		'&lt;script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/swfobject/2.2/swfobject.js"&gt;&lt;/script&gt;'+
		'&lt;!-- social --&gt;'+
		'&lt;script src="http://static.ak.fbcdn.net/connect.php/js/FB.Share" type="text/javascript"&gt;&lt;/script&gt;'+
		'&lt;script type="text/javascript" src="http://platform.twitter.com/widgets.js"&gt;&lt;/script&gt;'+
		'&lt;script type="text/javascript" src="http://www.google.com/buzz/api/button.js"&gt;&lt;/script&gt;'+
		'&lt;!-- player code --&gt;'+
		'&lt;script type="text/javascript" src="'+host+'assets/js/AStoJS.js"&gt;&lt;/script&gt;'+
		'&lt;script type="text/javascript" src="'+host+'assets/js/utils.js"&gt;&lt;/script&gt;'+
		'&lt;script type="text/javascript" src="'+host+'assets/js/rhapVideo.js"&gt;&lt;/script&gt;'+
		'</code>'+
		'</p>'+
		
		'<h3>Put this where you want your video to appear in your page</h3>'+
		'<p>'+
		'<code class="embedcode">'+
		'</code>'+
		'</p>'+
		'<p>For more information about this video player, please visit <a href="http://labs.rhapsody.com/videoplayer">Rhapsody Video Player</a>.</p>'+
		//'</textarea>'+
		'</div>'+
		'<a href="#" class="rhapVideoEmbedPanelCloseButton">Close</a>'+
		'</div>'
		));
		parent.append($(
		'<div class="toast">'+
		'<span class="toastMessage">loading...</span>'+
		'</div>'
		));
	}
	
	var drawRelatedVideosHelper = function(parent,relatedVideos,video) {
		var relatedVideoHtml = '';
		var v,serverStr;
		for(var i=0;i<relatedVideos.length;i++) {
			v = relatedVideos[i];
			serverStr = v['server'] ? 'data-server="'+v['server']+'"':'';
			relatedVideoHtml+='<li><a href="'+v.src+'" '+serverStr+' data-width="'+v.width+'" data-height="'+v.height+'" data-type="'+v.type+'"><img src="'+v.poster+'"/></a>' +
			'<a href="'+v.src+'" data-width="'+v.width+'" data-height="'+v.height+'" data-type="'+v.type+'" class="relatedVideoTitle">'+v.title+'</a></li>';
		}
		parent.append($(
		'<div class="rhapVideoRelatedPanel">'+
		'<h2 class="panelHeader">Related Videos</h2>'+
		'<div class="rhapVideoSharePanelContent">'+
		'<ul id="relatedVideosList" class="horizontalList">'+
		relatedVideoHtml +
		'</ul>'+
		'</div>'+
		'<a href="#" class="rhapVideoRelatedPanelCloseButton">Close</a>'+
		'</div>'
		));
	}
	
	var drawFullScreenBtn = function(canvas) {
		var context = canvas.getContext('2d');
		var width = 20;
		var height = 15;
		var radius = 5;
		var sides = 5;
		context.fillStyle='#29ABE2';
		context.lineWidth = 1;
		drawRoundRect(context,width/4+0,height/4+1,width/2-0,height/2-2,2);
		context.fill();
	
		context.beginPath();
		context.moveTo(radius, 0);
		context.lineTo(sides, 0);
		context.lineTo(0, sides);
		context.lineTo(0, radius);
		context.quadraticCurveTo(0, 0, radius,0);
		context.closePath();
		context.fill();
	
		context.beginPath();
		context.moveTo(width-radius, 0);
		context.lineTo(width-sides, 0);
		context.lineTo(width, sides);
		context.lineTo(width, radius);
		context.quadraticCurveTo(width, 0, width-radius,0);
		context.closePath();
		context.fill();
	
		context.beginPath();
		context.moveTo(width, height-radius);
		context.lineTo(width, height-sides);
		context.lineTo(width-sides, height);
		context.lineTo(width-radius, height);
		context.quadraticCurveTo(width, height, width,height-radius);
		context.closePath();
		context.fill();
	
		context.beginPath();
		context.moveTo(0, height-radius);
		context.lineTo(0, height-sides);
		context.lineTo(sides, height);
		context.lineTo(radius, height);
		context.quadraticCurveTo(0, height, 0,height-radius);
		context.closePath();
		context.fill();
	};
	var drawVolumeBtn = function(canvas) {
		var context = canvas.getContext('2d');
		var width = 10;
		var height = 15;
		context.beginPath();
		context.moveTo(width,0);
		context.lineTo(width-1,0);
		context.lineTo(width/2,height/4);
		context.lineTo(0,height/4);
		context.lineTo(0,3*height/4);
		context.lineTo(width/2,3*height/4);
		context.lineTo(width-1,height);
		context.lineTo(width,height);
		context.closePath();
	
		context.fillStyle='#29ABE2';
		context.lineWidth = 1;
		context.fill();
	
		context.lineWidth = 1;
		context.moveTo(width+2,3);
		context.quadraticCurveTo(width+4,height/2,width+2,height-3);
		context.fill();
	
		context.moveTo(width+4, 1);
		context.quadraticCurveTo(width+9,height/2,width+4,height-1);
		context.fill();
	};
	
	var drawTimerLabel = function(timer, width, boxHeight,text) {
		var canvas = timer[0];
		var height = boxHeight-6;
		var context = canvas.getContext('2d');
		var x1 = 0;
		var y1 = 0;
		var x2 = width;
		var y2 = 0;
		var x3 = width;
		var y3 = height;
		var x4 = width/2+6;
		var y4 = height;
		var x5 = width/2;
		var y5 = height+6;
		var x6 = width/2-6;
		var y6 = height;
		var x7 = 0;
		var y7 = height;
		context.beginPath();
		context.moveTo(x1, y1);
		context.lineTo(x2, y2 );
		context.lineTo(x3, y3);
		context.lineTo(x4, y4);
		context.lineTo(x5, y5);
		context.lineTo(x6, y6);
		context.lineTo(x7, y7);
		context.closePath();
	
		var grad = context.createLinearGradient(x7,y7,x1,y1);
		grad.addColorStop(0, '#5F6367');
		grad.addColorStop(1, '#1D1E25');
		context.fillStyle=grad;
		context.lineWidth = 1;
		context.strokeStyle= '#424242';
		context.fill();
		context.stroke();
	
		context.font = "10pt Arial";
		context.fillStyle='#ffffff';//grad;
		context.fillText(text,5,16);
		context.stroke();
	};
	var drawPlayPauseButtonBackground = function(context,buttonCenterX,buttonCenterY){
		context.beginPath();
		context.arc(buttonCenterX,buttonCenterY,16,0,rads(360),false); 
		context.closePath();
		var lingrad = context.createLinearGradient(0,0,0,15);
		lingrad.addColorStop(0, '#253036');
		lingrad.addColorStop(1, '#8896A7');
		context.fillStyle=lingrad;
		context.lineWidth = 1; 
		context.fill(); 
		
		context.beginPath();
		context.arc(buttonCenterX,buttonCenterY,14, 0,rads(360),false); 
		context.closePath();
		var lingrad = context.createLinearGradient(0,0,0,15);
		lingrad.addColorStop(0, '#F2F2F2');
		lingrad.addColorStop(.52, '#C9C9C9');
		lingrad.addColorStop(1, '#A6A6A6');
		context.fillStyle=lingrad;
		context.lineWidth = 2; 
		context.strokeStyle= '#424242';
		context.fill(); 
		context.stroke(); 
	};
	
	var _gaq = _gaq || [];
	_gaq.push(['_setAccount', analyticsCode]);
	//run on page loaded
	$(function(){
		/**********************
		 * set up videos
		 ********************/
		rhapVideoPlayerSetUp();
		/********************************
		 * set up analytics
		 ************************/
		var ga = document.createElement('script');
		ga.type = 'text/javascript';
		ga.async = true;
		ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
		var s = document.getElementsByTagName('script')[0];
		s.parentNode.insertBefore(ga, s);
	});
})(jQuery);