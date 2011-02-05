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
		
		var video, parent, controls, playPause, playPauseCanvas, seekBar, timer, volumeSlider, volumeBtn, fullScreenBtn;
		var bigPlayButton, seekBarHandle, rhapVideoMoreButton;
		var seekSliding, seekValue=-1, videoVolume, savedVolumeBeforeMute, isFullScreen = false, isShowMore = false;
		var rhapVideoMoreControls, rhapVideoSharePanel, rhapVideoShareBtn;
		
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
		this.init = function(videoElement){
			video = videoElement;
			parent = $(video).parent();
			this._createVideoElement(video);
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
			if(this._renderHtml5Video(video)){
				this._drawLargePlayButton(video);
				this._drawControls(video);
				this._wireHtml5Events(video);
			}else{
				var params = {};
				params.scale = "noscale";
				params.menu = "false";
				params.allowscriptaccess = "always";
				var attributes = {};
				attributes.id = 'flashid_'+new Date().getTime();
				var flashvars = {};
				flashvars['width']=video.width;
				flashvars['height']=video.height;
				var flv;
				$(video).children().each(function(index,source){
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
					if(video.poster!=null){
						flashvars['imageurl']=video.poster;
					}
					parent.append($('<div id="replaceMe"><p><a href="http://www.adobe.com/go/getflashplayer"><img src="http://www.adobe.com/images/shared/download_buttons/get_flash_player.gif" alt="Get Adobe Flash player" /></a></p></div>'));
					swfobject.embedSWF(swfLocation, 'replaceMe', video.width, video.height, "9.0.0", false, flashvars, params, attributes);
					$(video).remove();
					setTimeout(function(){
						video = document.getElementById(attributes.id);
					},10);
				}
			}
		};
		/**
		 * @description the video controls - play, pause, progress, etc.
		 */
		this._drawControls = function(video){
			var scope = this;
			var seekBarLeftOffset = 38;
			var seekBarRightMargin = 132;
			parent.append($(
					'<div class="rhapVideoControls">'+
					'<a href="#" class="rhapVideoPlayControl paused disabled"><span>Play</span><canvas width="32" height="32" class="rhapVideoPlayControlCanvas"/></a>'+
					'<div class="rhapVideoSeekBar"></div>'+
					'<div class="rhapVideoVolumeBox">'+
					'<div class="rhapVideoVolumeSlider"></div>'+
					'<canvas width="24" height="18" class="rhapVideoVolumeButton"/>'+
					'</div>'+
					'<canvas width="24" height="18" class="rhapVideoFullScreenButton"/>'+
					'<canvas width="24" height="18" class="rhapVideoMoreButton"/>'+
			'</div>'));
			parent.append($(
					'<div class="rhapVideoMoreControls">'+
					'<ul>'+
					'<li><a href="#">more</a></li>'+
					'<li><a href="#">cc</a></li>'+
					'<li><a href="#" class="rhapVideoShareBtn">share</a></li>'+
					'</ul>'+
					'</div>'
			));
			parent.append($(
					'<div class="rhapVideoSharePanel" title="Share">'+
					
					'</div>'
			));
			//get newly created elements
			controls = $('.rhapVideoControls',parent);
			rhapVideoMoreControls = $('.rhapVideoMoreControls',parent);
			rhapVideoShareBtn = $('.rhapVideoShareBtn',rhapVideoMoreControls);
			rhapVideoSharePanel = $('.rhapVideoSharePanel',parent);
			playPause = $('.rhapVideoPlayControl',controls);
			playPauseCanvas = $('.rhapVideoPlayControlCanvas',playPause)[0];
			
			this._drawPlayButton({
				upGradientStops:['#5F6367','#1D1E25']
			});
			seekBar = $('.rhapVideoSeekBar', controls);
			seekBar.css({'width':video.width-seekBarLeftOffset-seekBarRightMargin});
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
				orientation: "vertical",
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
				$(controls).show();
			},function(){
				$(controls).hide();
				showLess();
			});
			$(bigPlayButton).click(function(){
				$(this).hide();
				video.play();
			});
			var seekUpdate = function() {
				var currenttime = video.currentTime;
				if(!seekSliding && video.readyState>video.HAVE_CURRENT_DATA) {
					if(seekValue!=-1){
						seekBar.slider('value', seekValue);
						seekValue = -1;
					}else{
						seekBar.slider('value', currenttime);
					}
				}
				//timer.text(_timeFormat(currenttime));
				scope._drawTimerLabel(timer,41,26,_timeFormat(currenttime));
			};
			$(video).bind('timeupdate',function(){
				seekUpdate();
			}); 
			$(video).bind('durationchange',function(){
				var video_duration = video.duration;
				seekBar.slider("option","max",video_duration);
			}); 
			$(video).bind('loadstart',function(){
			}); 
			$(video).bind('waiting',function(){
				playPause.addClass('disabled');
			});
			$(video).bind('canplay',function(){
				playPause.removeClass('disabled');
			});
			$(video).bind('pause',function(){
				showPausedState();
				scope._drawPlayButton(upGradientStops);
			});
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
						video.play();
					} else {
						video.pause();
					}
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
				}else{
					isFullScreen = false;
					$(parent).removeClass('rhapVideoFullscreen');
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
			$(rhapVideoShareBtn).click(function(){
				rhapVideoSharePanel.dialog();
			});
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
				$(bigPlayButton).show();
				playPause.removeClass('playing');
				playPause.addClass('paused');
				playPause.children().text('Play');
			};
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
			context.strokeStyle= '#29ABE2';
			context.beginPath();
			context.arc(width/2, height/2, 8, 0, Math.PI * 2, true);
			context.fill();
			context.stroke();
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
			context.strokeStyle= '#29ABE2';
			drawRoundRect(context,width/4+0,height/4+1,width/2-0,height/2-2,2);
			context.fill(); 
			context.stroke();
			
			context.beginPath();
			context.moveTo(radius, 0);
			context.lineTo(sides, 0);
			context.lineTo(0, sides);
			context.lineTo(0, radius);
			context.quadraticCurveTo(0, 0, radius,0);
			context.closePath();
			context.fill();
			context.stroke();
			
			context.beginPath();
			context.moveTo(width-radius, 0);
			context.lineTo(width-sides, 0);
			context.lineTo(width, sides);
			context.lineTo(width, radius);
			context.quadraticCurveTo(width, 0, width-radius,0);
			context.closePath();
			context.fill();
			context.stroke();
			
			context.beginPath();
			context.moveTo(width, height-radius);
			context.lineTo(width, height-sides);
			context.lineTo(width-sides, height);
			context.lineTo(width-radius, height);
			context.quadraticCurveTo(width, height, width,height-radius);
			context.closePath();
			context.fill();
			context.stroke();
			
			context.beginPath();
			context.moveTo(0, height-radius);
			context.lineTo(0, height-sides);
			context.lineTo(sides, height);
			context.lineTo(radius, height);
			context.quadraticCurveTo(0, height, 0,height-radius);
			context.closePath();
			context.fill();
			context.stroke();
		};
		this._drawVolumeBtn = function(volumeBtn){
			var canvas = volumeBtn[0];
			var context = canvas.getContext('2d');
			var width = 10;
			var height = 15;
			context.beginPath();
			context.moveTo(width,0);
			context.lineTo(width/2,height/4);
			context.lineTo(0,height/4);
			context.lineTo(0,3*height/4);
			context.lineTo(width/2,3*height/4);
			context.lineTo(width,height);
			context.closePath();
			
			context.fillStyle='#29ABE2';
			context.lineWidth = 1;
			context.strokeStyle= '#29ABE2';
			context.fill(); 
			context.stroke(); 
			
			context.lineWidth = 1;
			context.moveTo(width+4,3);
			context.quadraticCurveTo(width+6,height/2,width+4,height-3);
			context.stroke();
			
			context.moveTo(width+6, 1);
			context.quadraticCurveTo(width+12,height/2,width+6,height-1);
			context.stroke();
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
			/* @const */ var bigButtonMinWidth = 65;
			// set button measurements 
			var bigButtonWidth =  video.width*20/100;
			bigButtonWidth = bigButtonWidth > bigButtonMaxWidth ? bigButtonMaxWidth : Math.max(bigButtonMinWidth, bigButtonWidth);
			var bigButtonHeight = bigButtonWidth*.7;
			// draw and position it 
			$(video).after($('<canvas class="bigPlayButton" width="'+bigButtonWidth+'px" height="'+bigButtonHeight+'px"></canvas>'));
			var bigButtonX = video.width/2-bigButtonWidth/2;
			var bigButtonY = video.height/2-bigButtonHeight/2;
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
		$('video').each(function(index,video){
			//wrap each video element in a div so we have context to build the controls
			$(video).wrap(function() {
				return '<div class="rhapVideoWrapper" />';
			});
			new RhapVideo().init(video);
		});
	});
})(jQuery);