/** global utils
 * ***********************************************************/
/**
 * @description method to check if a string starts with another string
 * @static
 */
function startsWith(str,startsWithThis) {
	return (str.match("^"+startsWithThis)==startsWithThis);
}

function endsWith(str,endsWithThis) {
	return (str.match(endsWithThis+"$")==endsWithThis);
}

$.generateId = function() {
	return arguments.callee.prefix + arguments.callee.count++;
};
$.generateId.prefix = 'jq$';
$.generateId.count = 0;
$.fn.generateId = function() {
	return this.each( function() {
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
function log(event) {
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
	if (!supportsVideo(v)) {
		return false;
	}
	return $(v).has('source[type=\'video/mp4; codecs="avc1.42E01E, mp4a.40.2"\']').length>0 && v.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');
}

/**
 * @description method to detect vp8 support in current browser
 * @static
 */
function supportsVp8Codec(v) {
	if (!supportsVideo(v)) {
		return false;
	}
	return $(v).has('source[type=\'video/webm; codecs="vp8, vorbis"\']').length>0 && v.canPlayType('video/webm; codecs="vp8, vorbis"');
}

/**
 * @description method to detect theora codec support in current browser
 * @static
 */
function supportsTheoraCodec(v) {
	if (!supportsVideo(v)) {
		return false;
	}
	return $(v).has('source[type=\'video/ogg; codecs="theora, vorbis"\']').length>0 && v.canPlayType('video/ogg; codecs="theora, vorbis"');
}

function supportsWebStorage(){
	return window.localStorage;
}

function getSupportedVideoSource(v,videoIndex,forcedFlash) {
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
function getSupportedRelatedVideoSource(v,relatedVideo,forcedFlash) {
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
function supportsCanvas() {
	return !!document.createElement('canvas').getContext;
}

/**
 * @description A utility function to convert from degrees to radians
 */
function rads(x) {
	return Math.PI*x/180;
}

/**
 * @description method to check whether to render an html5 <video> element
 * @private
 */
renderHtml5Video = function(v) {
	return supportsVideo(v) &&
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
function drawTriangle(context,width,height,padding) {
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
function drawLargeTriangle(context,width,height,padding) {

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

function drawPauseLeftBar(context, width,height) {
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

function drawPauseRightBar(context, width,height) {
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

toggleMoreBtn = function(canvas,direction) {
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
function drawCommonControlsHelper(parent,video) {
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
}

function drawRelatedVideosHelper(parent,relatedVideos,video) {
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

drawFullScreenBtn = function(canvas) {
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
drawVolumeBtn = function(canvas) {
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

drawTimerLabel = function(timer, width, boxHeight,text) {
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
drawPlayPauseButtonBackground = function(context,buttonCenterX,buttonCenterY){
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