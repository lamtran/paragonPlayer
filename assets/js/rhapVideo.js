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
	return $j(v).has('source[type=\'video/mp4; codecs="avc1.42E01E, mp4a.40.2"\']').length>0 && v.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');
}
/**
 * @description method to detect vp8 support in current browser
 * @static
 */
function supportsVp8Codec(v) {
	if (!supportsVideo(v)) { return false; }
	return $j(v).has('source[type=\'video/webm; codecs="vp8, vorbis"\']').length>0 && v.canPlayType('video/webm; codecs="vp8, vorbis"');
}
/**
 * @description method to detect theora codec support in current browser
 * @static
 */
function supportsTheoraCodec(v) {
	if (!supportsVideo(v)) { return false; }
	return $j(v).has('source[type=\'video/ogg; codecs="theora, vorbis"\']').length>0 && v.canPlayType('video/ogg; codecs="theora, vorbis"');
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

/** relinquish $ */
$j = jQuery.noConflict();

/**
 * @description Our video class
 * @constructor
 * @this {RhapVideo}
 * @return {RhapVideo} the RhapVideo object
 */
function RhapVideo(){
	// constants
	/* @const */ var swfLocation = 'http://blog.rhapsody.com/video/SlimVideoPlayer.swf';
	
	var video, parent, controls, playPause, playPauseCanvas, seekBar, timer, volumeSlider, volumeBtn;
	var bigPlayButton, seekBarHandle;
	var seekSliding, seekValue=-1, videoVolume, savedVolumeBeforeMute;
	
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
		parent = $j(video).parent();
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
		$j(timer.css('top','-37px'));
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
			$j(video).children().each(function(index,source){
				if(source.type=='video/mp4; codecs="vp6"'){
					flv = source.src;
				}
			});
			//detecting progressive or streaming
			var server,path;
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
			parent.append($j('<div id="replaceMe"><p><a href="http://www.adobe.com/go/getflashplayer"><img src="http://www.adobe.com/images/shared/download_buttons/get_flash_player.gif" alt="Get Adobe Flash player" /></a></p></div>'));
			swfobject.embedSWF(swfLocation, 'replaceMe', video.width, video.height, "9.0.0", false, flashvars, params, attributes);
			$j(video).remove();
			setTimeout(function(){
				video = document.getElementById(attributes.id);
			},10);
		}
	};
	/**
	 * @description the video controls - play, pause, progress, etc.
	 */
	this._drawControls = function(video){
		var scope = this;
		var seekBarLeftOffset = 38;
		var seekBarRightMargin = 150;
		parent.append($j(
			'<div class="rhapVideoControls">'+
				'<a href="#" class="rhapVideoPlayControl paused disabled"><span>Play</span><canvas width="32" height="32" class="rhapVideoPlayControlCanvas"/></a>'+
				'<div class="rhapVideoSeekBar"></div>'+
				'<div class="rhapVideoVolumeBox">'+
					'<div class="rhapVideoVolumeSlider"></div>'+
					'<canvas width="24" height="18" class="rhapVideoVolumeButton"/>'+
				'</div>'+
			'</div>'));
		//get newly created elements
		controls = $j('.rhapVideoControls',parent);
		playPause = $j('.rhapVideoPlayControl',controls);
		playPauseCanvas = $j('.rhapVideoPlayControlCanvas',playPause)[0];
		
		this._drawPlayButton({
			upGradientStops:['#5F6367','#1D1E25']
		});
		seekBar = $j('.rhapVideoSeekBar', controls);
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
				$j(video).attr("currentTime",ui.value);
				seekValue = ui.value;
			}
		});
		//build the buffer bar
		var sliderRange = $j('.ui-slider-range',seekBar);
		sliderRange.after('<div class="rhapVideoBufferBar"></div>');
		//build the timer label
		seekBarHandle = $j('.ui-slider-handle',seekBar);
		seekBarHandle.after('<canvas width="41" height="26" class="rhapVideoTimer"/>');
		timer = $j('.rhapVideoTimer',seekBar);
		_positionTimer();
		this._drawTimerLabel(timer,41,26,'00:00');
		
		//volume controls
		volumeSlider = $j('.rhapVideoVolumeSlider', controls);
		volumeBtn = $j('.rhapVideoVolumeButton', controls);
		volumeSlider.slider({
			value: 1,
			orientation: "vertical",
			range: "min",
			max: 1,
			step: 0.05,
			animate: true,
			slide:function(e,ui){
				$j(video).attr('muted',false);
				videoVolume = ui.value;
				$j(video).attr('volume',ui.value);
				if(ui.value>0){
					volumeBtn.css('opacity',1);
				}else{
					volumeBtn.css('opacity',0.4);
					video.muted = true;
				}
			}
		});
		this._drawVolumeBtn(volumeBtn);
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
		$j(bigPlayButton).click(function(){
			$j(this).hide();
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
		$j(video).bind('timeupdate',function(){
			seekUpdate();
		}); 
		$j(video).bind('durationchange',function(){
			var video_duration = video.duration;
			seekBar.slider("option","max",video_duration);
		}); 
		$j(video).bind('loadstart',function(){
		}); 
		$j(video).bind('waiting',function(){
			playPause.addClass('disabled');
		});
		$j(video).bind('canplay',function(){
			playPause.removeClass('disabled');
		});
		$j(video).bind('pause',function(){
			showPausedState();
			scope._drawPlayButton(upGradientStops);
		});
		$j(video).bind('play',function() {
			$j(bigPlayButton).hide();
			playPause.removeClass('paused');
			playPause.addClass('playing');
			playPause.children().text('Pause');
			scope._drawPausedButton(upGradientStops);
		});
		$j(video).bind('ended',function() {
			showPausedState();
			video.pause();
		});
		$j(playPause).click(function(){
			//only play if video's state is passed waiting for data
			if(video.readyState>video.HAVE_CURRENT_DATA){
				if (video.ended || video.paused) {
					video.play();
				} else {
					video.pause();
				}
			}
		});
		$j(playPause).hover(function(){
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
		$j( seekBar ).bind( "slide", function(event, ui) {
			scope._drawTimerLabel(timer,41,26,_timeFormat(ui.value));
			_positionTimer();
		});
		$j( seekBar ).bind( "slidechange", function(event, ui) {
			_positionTimer();
		});
		$j( seekBar ).bind( "slidestart", function(event, ui) {
			video.pause();
		});
		$j( seekBar ).bind( "slidestop", function(event, ui) {
			video.play();
		});
		$j(volumeBtn).click(function(){
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
		//private helpers
		var showPausedState = function(){
			$j(bigPlayButton).show();
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
	this._drawVolumeBtn = function(volumeBtn){
		/*
		//4.779,0 1.916,2.586 1.916,2.592 0,2.592 0,6.635 1.936,6.635 4.779,9.166
		graphics.clear();
		graphics.beginFill(0xFFFFFF,1);
		graphics.moveTo(4.779,0);
		graphics.lineTo(1.916,2.586);
		graphics.lineTo(1.916,2.592);
		graphics.lineTo(0,2.592);
		graphics.lineTo(0,6.635);
		graphics.lineTo(1.936,6.635);
		graphics.lineTo(4.779,9.166);
		graphics.endFill();
		
		graphics.lineStyle(1,0xFFFFFF);
		graphics.moveTo(6,2);
		graphics.curveTo(8,6,6,7);
		
		graphics.moveTo(8,1);
		graphics.curveTo(12,6,8,8);
		*/
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
		
//		context.moveTo(width+2,height/2);
//		context.arc(width+2,2,3,0,Math.PI/4,false);
//		context.moveTo(width+2,2);
//		context.arc(width+12,2,43,0,Math.PI,false);
		
		
		context.fillStyle='#ffffff';
		context.lineWidth = 1;
		context.strokeStyle= '#ffffff';
		context.fill(); 
		context.stroke(); 
		
		context.lineWidth = 1;
		context.moveTo(width+4, 3);
		context.arc(width+4,height/2+1,4,-(Math.PI/2-Math.PI/4),(Math.PI-Math.PI/2),false);
		context.stroke(); 
		
		context.moveTo(width+6, 1);
		context.arc(width+6,height/2+1,6,-(Math.PI/2-Math.PI/4),(Math.PI-Math.PI/2),false);
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
		$j(video).after($j('<canvas class="bigPlayButton" width="'+bigButtonWidth+'px" height="'+bigButtonHeight+'px"></canvas>'));
		var bigButtonX = video.width/2-bigButtonWidth/2;
		var bigButtonY = video.height/2-bigButtonHeight/2;
		bigPlayButton = $j(video).next()[0];
		$j(bigPlayButton).css({
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
$j(function(){
	$j('video').each(function(index,video){
		//wrap each video element in a div so we have context to build the controls
		$j(video).wrap(function() {
			  return '<div style="position:relative" />';
		});
		new RhapVideo().init(video);
	});
});