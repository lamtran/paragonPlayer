var videos=[];
/**
 * methods exposed to Flash
 */
function showMore(videoIndex){
	console.log('show more at index: ' + videoIndex);
	console.log(videos[videoIndex]);
	console.log(videos);
	videos[videoIndex].showMoreControls();
}
function showLess(videoIndex){
	console.log('show less at index: ' + videoIndex);
	console.log(videos[videoIndex]);
	console.log(videos);
	videos[videoIndex].hideMoreControls();
}
(function($) {
	/**
	 * Convention:
	 * 		A method that starts with _ means to be a private api, although it is defined as public so it can
	 * 			be referenced by tests.  Do not call _xxx functions directly.
	 */
	
	/** global utils
	 * ***********************************************************/
	/**
	 * @description method to check if a string starts with another string
	 * @static
	 */
	function startsWith(str,startsWithThis){
		return (str.match("^"+startsWithThis)==startsWithThis);
	}
	function endsWith(str,endsWithThis){
		return (str.match(endsWithThis+"$")==endsWithThis);
	} 
	$.generateId = function() {
		return arguments.callee.prefix + arguments.callee.count++;
	};
	$.generateId.prefix = 'jq$';
	$.generateId.count = 0;
	$.fn.generateId = function() {
		return this.each(function() {
			this.id = $.generateId();
		});
	};
	jQuery.fn.aPosition = function() {
		thisLeft = this.offset().left;
		thisTop = this.offset().top;
		thisParent = this.parent();
		parentLeft = thisParent.offset().left;
		parentTop = thisParent.offset().top;
		return {
		left: thisLeft-parentLeft,
		top: thisTop-parentTop
		};
	};
	function printTimeRanges(tr) {
		if (tr == null) return "undefined";
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
	function log(event){
		if (!event) { return; }
		if (typeof event == "string") { event = { type: event }; }
		if (event.type) { this.history.push(event.type); }
		if (this.history.length >= 50) { this.history.shift(); }
		try { console.log(event.type); } catch(e) { try { opera.postError(event.type); } catch(e){} }
	}
	
	/** feature detection 
	 * ************************************************************/
	/**
	 * @description method to detect video element support in current browser
	 * @static
	 */
	function supportsVideo(v) {
		return !!v.canPlayType;
	}
	/**
	 * @description method to detect h264 codec support in current browser
	 * @static
	 */
	function supportsH264Codec(v) {
		if (!supportsVideo(v)) { return false; }
		return $(v).has('source[type=\'video/mp4; codecs="avc1.42E01E, mp4a.40.2"\']').length>0 && v.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');
	}
	/**
	 * @description method to detect vp8 support in current browser
	 * @static
	 */
	function supportsVp8Codec(v) {
		if (!supportsVideo(v)) { return false; }
		return $(v).has('source[type=\'video/webm; codecs="vp8, vorbis"\']').length>0 && v.canPlayType('video/webm; codecs="vp8, vorbis"');
	}
	/**
	 * @description method to detect theora codec support in current browser
	 * @static
	 */
	function supportsTheoraCodec(v) {
		if (!supportsVideo(v)) { return false; }
		return $(v).has('source[type=\'video/ogg; codecs="theora, vorbis"\']').length>0 && v.canPlayType('video/ogg; codecs="theora, vorbis"');
	}
	function getSupportedVideoSource(v){
		var match = {};
		$(v).children().each(function(index,source){
			if(supportsH264Codec(v)){
				if(source.type=='video/mp4; codecs="vp6"'){
					source['src'] = source.src;
					source['type'] = source.type;
					return false;
				}
			}
			if(supportsVp8Codec(v)){
				if(source.type=='video/webm; codecs="vp8, vorbis"'){
					source['src'] = source.src;
					source['type'] = source.type;
					return false;
				}
			}
			if(supportsTheoraCodec(v)){
				if(source.type=='video/ogg; codecs="theora, vorbis"'){
					match['src'] = source.src;
					match['type'] = source.type;
					return false;
				}
			}
		});
		return match;
	}
	/**
	 * @description method to detect canvas element support in current browser
	 * @static
	 */
	function supportsCanvas() {
		return !!document.createElement('canvas').getContext;
	}
	/**
	 * @description A utility function to convert from degrees to radians
	 */
	function rads(x) { return Math.PI*x/180; }
	
	/**
	 * @description helper to draw a triangle
	 * @param context
	 * @param width
	 * @param height
	 * @param padding
	 * @returns {___anonymous3214_3277}
	 */
	function drawTriangle(context,width,height,padding){
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
	function drawLargeTriangle(context,width,height,padding){
		
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
	function drawPauseLeftBar(context, width,height){
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
	function drawRoundRect(ctx, x, y, width, height, radius) {
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
	function drawPauseRightBar(context, width,height){
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
	
	/**
	 * @description Our video class
	 * @constructor
	 * @this {RhapVideo}
	 * @return {RhapVideo} the RhapVideo object
	 */
	function RhapVideo(){
		// constants
		/* @const */ var swfLocation = 'http://blog.rhapsody.com/video/SlimVideoPlayer.swf';
		
		var video, parent, videoIndex, forcedFlash, relatedVideos, controls, playPause, playPauseCanvas, seekBar, timer, volumeSlider, volumeBtn, fullScreenBtn, rhapVideoBufferBar;
		var bigPlayButton, seekBarHandle, rhapVideoMoreButton;
		var seekSliding, seekValue=-1, videoVolume, savedVolumeBeforeMute, isFullScreen = false, isShowMore = false;
		var rhapVideoMoreControls, rhapVideoSharePanel, rhapVideoShareBtn, rhapVideoShareUrl, rhapVideoSharePanelCloseButton;
		var rhapVideoDuration, rhapVideoEmbedPanel, rhapVideoEmbedBtn, rhapVideoEmbedPanelCloseButton;
		var rhapVideoRelatedBtn, rhapVideoRelatedPanel, rhapVideoRelatedPanelCloseButton;
		var toast;
		var seekBarLeftOffset = 38;
		var seekBarRightMargin = 132;//172;
		var isHideVideoArea = false;
		
		/**
		 * @description Initialize the video class
		 * @public
		 * @param {object} config data to configure the video player
		 * 		config.id      {number} id of the wrapper div
		 * 		config.width   {number} width of the video player
		 * 		config.height  {number} height of the video player
		 * 		config.preload {boolean} whether to preload the video
		 * 		config.sources {object} data containing information on video sources
		 * 			config.sources.mp4   {string} path to mp4 file - webkit browsers
		 * 			config.sources.webm  {string} path to webm file - chrome, ff 4, ie9 (?)
		 * 			config.sources.ogv   {string} path to ogv file - ff
		 * 			config.sources.flv   {string} data containing information for flash playback
		 * @return {RhapVideo} the video object
		 */
		this.init = function(index,videoElement,relateds,forced){
			videoIndex = index;
			forcedFlash = forced;
			video = videoElement;
			parent = $(video).parent();
			relatedVideos = relateds;
			this._createVideoElement(video);
			return this;
		};
		var _initialPositionTimer = function(){
			if(timer.css('top')=='0px'){
				timer.position({
					my: "center bottom",
					at: "center top",
					of: seekBarHandle,
					offset: '0 -3'
				});
				$(timer.css('top','-27px'));
			}
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
			this._drawCommonControls(video);
			if(!forcedFlash && this._renderHtml5Video(video)){
				this._drawLargePlayButton(video);
				this._drawControls(video);
				this._wireHtml5Events(video);
			}else{
				console.log('no html5, fall back to flash');
				var params = {};
				params.scale = "noscale";
				params.menu = "false";
				params.allowscriptaccess = "always";
				params.allowFullScreen = "true";
				var attributes = {};
				attributes.id = 'flashid_'+new Date().getTime();
				var flashvars = {};
				flashvars['width']=video.width;
				flashvars['height']=video.height;
				var flv;
				$($('.rhapRelatedVideos')[videoIndex]).siblings('source').each(function(index,source){
					if(source.type=='video/mp4; codecs="vp6"'){
						flv = source.src;
					}
				});
				//detecting progressive or streaming
				var server,path;
				if(flv){
					if(endsWith(flv,'.flv')){
						//progressive
						path = flv;
					}else{
						//streaming
						server = flv.substr(0,flv.lastIndexOf('/'));
						path = flv.substring(flv.lastIndexOf('/'),flv.length);
					}
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
					setTimeout(function(){
						video = document.getElementById(attributes.id);
					},10);
				}else{
					//no flv
				}
			}
		};
		this._setSeekBarWidth = function(video){
			var w = video.videoWidth ? video.videoWidth : video.width;
			seekBar.css({'width':w-seekBarLeftOffset-seekBarRightMargin});
		};
		this._drawCommonControls = function(video){
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
								'<li><a name="fb_share" type="button_count">Share</a></li>'+
								'<li><a href="http://twitter.com/share" class="twitter-share-button" data-count="none">Tweet</a></li>'+
								'<li><a title="Post to Google Buzz" class="google-buzz-button" href="http://www.google.com/buzz/post" data-button-style="small-button"></a></li>'+
							'</ul>'+
						'</div>'+
						'<a href="#" class="rhapVideoSharePanelCloseButton">Close</a>'+
					'</div>'
			));
			parent.append($(
					'<div class="rhapVideoEmbedPanel">'+
						'<h2 class="panelHeader">Embed</h2>'+
						'<div class="rhapVideoSharePanelContent">'+
							'<textarea class="rhapVideoEmbedCode">'+
								'<link href="http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.9/themes/flick/jquery-ui.css" media="screen" rel="stylesheet" type="text/css" />'+
								'<link href="assets/css/rhapVideo.css" media="screen" rel="stylesheet" type="text/css" />'+
								'<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.4.4/jquery.min.js"></script>'+
								'<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.8.8/jquery-ui.min.js"></script>'+
								'<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/swfobject/2.2/swfobject.js"></script>'+
								'<script src="http://static.ak.fbcdn.net/connect.php/js/FB.Share" type="text/javascript"></script>'+
								'<script type="text/javascript" src="http://platform.twitter.com/widgets.js"></script>'+
								'<script type="text/javascript" src="http://www.google.com/buzz/api/button.js"></script>'+
								'<script type="text/javascript" src="assets/js/rhapVideo.js"></script>'+
								'<video width="640" height="264" poster="http://lamtran.com/oceans-clip.png" >'+
							        '<source src="http://lamtran.com/oceans-clip.mp4" type=\'video/mp4; codecs="avc1.42E01E, mp4a.40.2"\' />'+
							        '<source src="http://lamtran.com/oceans-clip.webm" type=\'video/webm; codecs="vp8, vorbis"\' />'+
							        '<source src="http://lamtran.com/oceans-clip.ogv" type=\'video/ogg; codecs="theora, vorbis"\' />'+
							        '<source src="rtmp://lamtran.com:1935/vod/oceans-clip" type=\'video/mp4; codecs="vp6"\' />'+
							   '</video>'+
							'</textarea>'+
						'</div>'+
						'<a href="#" class="rhapVideoEmbedPanelCloseButton">Close</a>'+
					'</div>'
			));
			parent.append($(
					'<div class="toast">'+
						'<span class="toastMessage">loading...</span>'+
					'</div>'
			));
			var relatedVideoHtml = '';//'<li><a name="fb_share" type="button_count">Share</a></li>'+
			for(var i=0;i<relatedVideos.length;i++){
				var v = relatedVideos[i];
				relatedVideoHtml+='<li><a href="'+v.src+'" data-width="'+v.width+'" data-height="'+v.height+'" data-type="'+v.type+'"><img src="'+v.poster+'"/></a>' +
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
			rhapVideoMoreControls = $('.rhapVideoMoreControls',parent);
			rhapVideoShareBtn = $('.rhapVideoShareBtn',rhapVideoMoreControls);
			rhapVideoSharePanel = $('.rhapVideoSharePanel',parent);
			rhapVideoEmbedPanel = $('.rhapVideoEmbedPanel',parent);
			rhapVideoRelatedPanel = $('.rhapVideoRelatedPanel',parent);
			rhapVideoEmbedBtn = $('.rhapVideoEmbedBtn',rhapVideoMoreControls);
			rhapVideoEmbedPanelCloseButton = $('.rhapVideoEmbedPanelCloseButton',rhapVideoEmbedPanel);
			rhapVideoEmbedPanelCloseButton.button();
			rhapVideoRelatedBtn = $('.rhapVideoRelatedBtn',rhapVideoMoreControls);
			rhapVideoRelatedPanelCloseButton = $('.rhapVideoRelatedPanelCloseButton',rhapVideoRelatedPanel);
			rhapVideoRelatedPanelCloseButton.button();
			toast = $('.toast',parent);
			toast.css('line-height',parent.height()+'px');
			$(rhapVideoRelatedPanel).css({
				'left': parseInt($(video).css('width'))/2-723/2 + 'px'
			});
			$(rhapVideoEmbedPanel).css({
				'left': parseInt($(video).css('width'))/2-723/2 + 'px'
			});
			$(rhapVideoSharePanel).css({
				'left': parseInt($(video).css('width'))/2-723/2 + 'px'
			});
			rhapVideoShareUrl = $('.rhapVideoShareUrl',rhapVideoSharePanel);
			rhapVideoSharePanelCloseButton = $('.rhapVideoSharePanelCloseButton',rhapVideoSharePanel);
			rhapVideoSharePanelCloseButton.button();
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
			this._drawTimerLabel(timer,41,26,'00:00');
			
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
			this._drawVolumeBtn(volumeBtn);
			
			fullScreenBtn = $('.rhapVideoFullScreenButton',controls);
			this._drawFullScreenBtn(fullScreenBtn);
			
			rhapVideoMoreButton = $('.rhapVideoMoreButton',controls);
			this._drawMoreBtn(rhapVideoMoreButton);
		};
		this._play = function(video){
			this._fitSourceDimensions(video,function(){
				video.play();
			});
		};
		this._fitSourceDimensions = function(video,callback){
			var parent = $(video).parent();
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
		this._wireBigPlayButton = function(){
			var scope = this;
			$(bigPlayButton).click(function(){
				$(this).hide();
				//video.play();
				scope._play(video);
			});
		};
		this._hideVideoArea = function(){
			$(video).hide();
			$(parent).css('background','transparent');
			$(controls).hide();
			isHideVideoArea = true;
		};
		this._showVideoArea = function(){
			$(video).show();
			$(parent).css('background','#000');
			$(controls).show();
			isHideVideoArea = false;
		}
		/**
		 * @description set up event handlers for html5 video element
		 * @private
		 */
		this._wireHtml5Events = function(video){
			var overGradientStops = {overGradientStops:['#5F6367','#1D1E25']};
			var upGradientStops = {upGradientStops:['#5F6367','#1D1E25']};
			/* @const */ var WAITING_STATE = 2;
			var scope = this;
			$(parent).hover(function(){
				if(!isHideVideoArea){
					$(controls).show();
				}
			},function(){
				$(controls).hide();
				showLess();
			});
			this._wireBigPlayButton();
			var seekUpdate = function() {
				var currenttime = video.currentTime;
				if(!seekSliding && video.readyState>video.HAVE_CURRENT_DATA) {
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
				scope._drawTimerLabel(timer,41,26,_timeFormat(currenttime));
				if(video.buffered && video.buffered.end(video.buffered.length-1)<=video.duration && rhapVideoBufferBar.width()!=rhapVideoBufferBar.parent().width()){
					rhapVideoBufferBar.width(Math.floor(video.buffered.end(video.buffered.length-1)/video.duration*100)+'%');
				}
			};
			$(video).bind('timeupdate',function(){
				seekUpdate();
			}); 
			$(video).bind('durationchange',function(){
				seekBar.slider("option","max",video.duration);
			}); 
			$(video).bind('loadstart',function(){
				toast.css('line-height',parent.height()+'px');
				toast.show();
			}); 
			$(video).bind('waiting',function(){
				playPause.addClass('disabled');
			});
			$(video).bind('canplay',function(){
				toast.hide();
				playPause.removeClass('disabled');
				$('body').trigger('canplay');
			});
			$(video).bind('pause',function(){
				showPausedState();
				scope._drawPlayButton(upGradientStops);
			});
			function progressHandler(e){
			      if(e.total && e.loaded){
			           // percentage of video loaded
			          var proportion =  Math.floor(( e.loaded / e.total * 100));
			          rhapVideoBufferBar.width(proportion+'%');
			      } else {
			           // do nothing because we're autobuffering.
			      }
			}
			video.addEventListener('progress',progressHandler,false);
			$(video).bind('play',function() {
				$(bigPlayButton).hide();
				playPause.removeClass('paused');
				playPause.addClass('playing');
				playPause.children().text('Pause');
				scope._drawPausedButton(upGradientStops);
			});
			$(video).bind('ended',function() {
				showPausedState();
				video.pause();
			});
			$(playPause).click(function(){
				//only play if video's state is passed waiting for data
				if(video.readyState>video.HAVE_CURRENT_DATA){
					if (video.ended || video.paused) {
						scope._play(video);
					} else {
						video.pause();
					}
				}else{
					alert('problem fetching video stream...');
				}
			});
			$(playPause).hover(function(){
				if(video.ended || video.paused){
					scope._drawPlayButton(overGradientStops);
				}else{
					scope._drawPausedButton(overGradientStops);
				}
			},function(){
				if(video.ended || video.paused){
					scope._drawPlayButton(upGradientStops);
				}else{
					scope._drawPausedButton(upGradientStops);
				}
			});
			$( seekBar ).bind( "slide", function(event, ui) {
				scope._drawTimerLabel(timer,41,26,_timeFormat(ui.value));
				_positionTimer();
			});
			$( seekBar ).bind( "slidechange", function(event, ui) {
				_positionTimer();
			});
			$( seekBar ).bind( "slidestart", function(event, ui) {
				video.pause();
			});
			$( seekBar ).bind( "slidestop", function(event, ui) {
				video.play();
			});
			$(volumeBtn).click(function(){
				if(!video.muted){
					volumeBtn.css('opacity',0.4);
					volumeSlider.slider("value",0);
					savedVolumeBeforeMute = video.volume;
				}else{
					volumeBtn.css('opacity',1);
					if(savedVolumeBeforeMute==null || savedVolumeBeforeMute==0){
						savedVolumeBeforeMute = 0.5;
					}
					volumeSlider.slider("value",savedVolumeBeforeMute);
				}
				video.muted = !video.muted;
			});
			$(fullScreenBtn).click(function(){
				if(!isFullScreen){
					isFullScreen = true;
					$(parent).addClass('rhapVideoFullscreen');
					$(parent).css({'width':'auto','height':'auto'});
					$(video).width('100%');
					$(video).height('100%');
				}else{
					isFullScreen = false;
					$(parent).removeClass('rhapVideoFullscreen');
					$(parent).css({'width':video.videoWidth+'px','height':video.videoHeight+'px'});
					$(video).width(video.videoWidth+'px');
					$(video).height(video.videoHeight+'px');
				}
				var seekBarLeftOffset = 38;
				var seekBarRightMargin = 132;
				var w = parseInt($(video).css('width'));
				seekBar.css({'width':w-seekBarLeftOffset-seekBarRightMargin});
			});
			$(rhapVideoMoreButton).click(function(){
				if(!isShowMore){
					showMore();
				}else{
					showLess();
				}
			});
			/*****************
			 * SHARE **/
			$(rhapVideoShareBtn).click(function(){
				if(!video.paused){
					video.pause();
				}
				scope._hideVideoArea();
				rhapVideoSharePanel.slideDown('slow',function(){
					rhapVideoShareUrl.select();
					rhapVideoSharePanelCloseButton.show();
				});
				rhapVideoShareUrl.val(document.location);
				showLess();
			});
			$(rhapVideoSharePanelCloseButton).click(function(){
				scope._showVideoArea();
				closeSharePanel();
			});
			var closeSharePanel = function(){
				rhapVideoSharePanelCloseButton.hide();
				rhapVideoSharePanel.slideUp('slow');
			};
			/*******************
			 * EMBEDDED **/
			$(rhapVideoEmbedBtn).click(function(){
				if(!video.paused){
					video.pause();
				}
				scope._hideVideoArea();
				rhapVideoEmbedPanel.slideDown('slow',function(){
					rhapVideoEmbedPanelCloseButton.show();
				});
				showLess();
			});
			$(rhapVideoEmbedPanelCloseButton).click(function(){
				scope._showVideoArea();
				closeEmbedPanel();
			});
			var closeEmbedPanel = function(){
				rhapVideoEmbedPanelCloseButton.hide();
				rhapVideoEmbedPanel.slideUp('slow');
			};
			/*******************
			 * RELATED **/
			$(rhapVideoRelatedBtn).click(function(){
				if(!video.paused){
					video.pause();
				}
				scope._hideVideoArea();
				rhapVideoRelatedPanel.slideDown('slow',function(){
					rhapVideoRelatedPanelCloseButton.show();
				});
				showLess();
			});
			$(rhapVideoRelatedPanelCloseButton).click(function(){
				scope._showVideoArea();
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
			    	closeRelatedPanel();
			    	var link = $(domEl).parent();
			    	video.src = link.attr('href');
			    	video.type = link.attr('data-type');
			    	$('body').bind('canplay',function(){
			    		scope._showVideoArea();
			    		scope._play(video);
			    	});
			    	video.load();
			    }
			});
			/*********************
			 * HELPERS **/
			var showMore = function(){
				isShowMore = true;
				scope._drawMoreBtn(rhapVideoMoreButton,'down');
				if(rhapVideoMoreControls.css('display')!='block'){
					rhapVideoMoreControls.slideDown();
				}
			};
			var showLess = function(){
				isShowMore = false;
				scope._drawMoreBtn(rhapVideoMoreButton,'up');
				if(rhapVideoMoreControls.css('display')=='block'){
					rhapVideoMoreControls.slideUp();
				}
			};
			//private helpers
			var showPausedState = function(){
				//$(bigPlayButton).show();
				scope._drawLargePlayButton(video);
				scope._wireBigPlayButton();
				playPause.removeClass('playing');
				playPause.addClass('paused');
				playPause.children().text('Play');
			};
		};
		this.showMoreControls = function(){
			console.log('00rhapVideoMoreControls goes down');
			if(rhapVideoMoreControls.css('display')!='block'){
				console.log('00sliding up rhapVideoMoreControls ' + rhapVideoMoreControls);
				rhapVideoMoreControls.slideDown();
			}
		};
		this.hideMoreControls = function(){
			console.log('rhapVideoMoreControls goes down');
			if(rhapVideoMoreControls.css('display')=='block'){
				console.log('sliding up rhapVideoMoreControls ' + rhapVideoMoreControls);
				rhapVideoMoreControls.slideUp();
			}
		};
		/**
		 * @description method to check whether to render an html5 <video> element
		 * @private
		 */
		this._renderHtml5Video = function(v){
			return supportsVideo(v) &&
			(supportsH264Codec(v) || supportsVp8Codec(v)  || supportsTheoraCodec(v));
		};
		this._drawMoreBtn = function(rhapVideoMoreButton,direction){
			if(direction==null){
				direction = 'up';
			}
			var canvas = rhapVideoMoreButton[0];
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
		this._drawFullScreenBtn = function(fullScreenBtn){
			var canvas = fullScreenBtn[0];
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
		this._drawVolumeBtn = function(volumeBtn){
			var canvas = volumeBtn[0];
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
		this._drawTimerLabel = function(timer, width, boxHeight,text){
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
			
			this._drawPlayPauseButtonBackground(context,buttonCenterX,buttonCenterY);
			
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
		this._drawPlayPauseButtonBackground = function(context,buttonCenterX,buttonCenterY){
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
			
			this._drawPlayPauseButtonBackground(context,buttonCenterX,buttonCenterY);
			
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
			$(video).after($('<canvas class="bigPlayButton" width="'+bigButtonWidth+'px" height="'+bigButtonHeight+'px"></canvas>'));
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
			var mainSource = getSupportedVideoSource(video);
			relateds.push({
				poster: video.poster,
				width: video.width,
				height: video.height,
				src: mainSource.src,
				type: mainSource.type,
				title: video.title.length > stringLimit ? video.title.substring(0,stringLimit)+'...' : video.title
			});
			
			$('.rhapRelatedVideo',video).each(function(index,relatedVideo){
				var related = $(relatedVideo);
				var poster = related.attr('data-poster');
				var width = related.attr('data-width');
				var height = related.attr('data-height');
				var src = related.attr('data-src');
				var type = related.attr('data-type');
				var title = related.attr('title');
				relateds.push({
					poster: poster,
					width: width,
					height: height,
					src: src,
					type: type,
					title: title.length > stringLimit ? title.substring(0,stringLimit)+'...' : title
				});
			});
			videos.push(new RhapVideo().init(index,video,relateds,true));
		});
	});
})(jQuery);