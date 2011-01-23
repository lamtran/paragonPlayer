var globalConfig;
var showEmbedCode = function(){
		var wrapper = '<object height="'+globalConfig.height+'" width="'+globalConfig.width+'" codebase="http://fpdownload.macromedia.com/get/flashplayer/current/swflash.cab" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000">'+
			'<param value="SlimVideoPlayer.swf" name="movie">'+
			'<param value="high" name="quality">'+
			'<param value="'+$$('embed')[0].readAttribute('flashvars')+'" name="flashvars">';
			
		$('embedcode').update(convertCodeToText(wrapper+$('videoplayerWrapper').innerHTML+'</object>'));
	};
function Page(){
	var prog_no_ad_config = {
		'width':640,
		'height':480,
		'path':'http://meatball.prognet.com/videoplayer/the-knux.flv'		
	};
	var prog_ad_config = {
		'width':640,
		'height':480,
		'path':'http://meatball.prognet.com/videoplayer/the-knux.flv',
		'adurl':'http://ad.doubleclick.net/adx/real.rhap/;type=newvideoplayer;sz=150x120'		
	};
	var stream_no_ad_config = {
		'width':640,
		'height':480,
		'path':'download/flash/RSGG/KnuxFinal',
		'server':'rtmp://flashplay.rbn.com/a41/d1/rstone/rstone/'		
	};
	var stream_ad_config = {
		'width':640,
		'height':480,
		'path':'download/flash/RSGG/KnuxFinal',
		'server':'rtmp://flashplay.rbn.com/a41/d1/rstone/rstone/',
		'adurl':'http://ad.doubleclick.net/adx/real.rhap/;type=newvideoplayer;sz=150x120'	
	};
	
	this.init = function(config){
		globalConfig=config;
		writeSwf(config);
		$('embed').observe('click',function(e){
			e.stop();
			showEmbedCode();
			$('embedcode').toggle();
		});
		$('config').observe('click',function(e){
			e.stop();
			Effect.ScrollTo('configSection');
		});
		$('isStreaming').observe('click',toggle);
		$('isAd').observe('click',toggle);
		$('isImageUrl').observe('click',toggle);
		$('isLogo').observe('click',toggle);
		$('isFramerate').observe('click',toggle);
		$('isAnalytics').observe('click',toggle);
		$('configForm').reset();
		var scope = this;
		$('testData').observe('change',function(e){
			var conf={};
			switch(this.value){
				case 'blank':
				break;
				case 'prog_no_ad':
					conf = prog_no_ad_config;
				break;
				case 'stream_no_ad':
					conf = stream_no_ad_config;
				break;
				case 'stream_ad':
					conf = stream_ad_config;
				break;
				case 'prog_ad':
					conf = prog_ad_config;
				break;
			}
			if(this.value=='blank'){
				$('configForm').reset();
				$$('div[class="wrapper"]').each(function(div){
					div.fade();
				});
			}else{
				resetForm(conf);
				scope.setValues(conf);
			}
		});
		
		$('configForm').observe('submit',function(e){
			e.stop();
			var conf = {
				'width':$F('width'),
				'height':$F('height'),
				'path':$F('path')
			};
			if($F('isStreamingValue')!=''){
				conf['server']=$F('isStreamingValue');
			}
			if($F('isAdValue')!=''){
				conf['adurl']=$F('isAdValue');
			}
			if($F('isAutoplay')!=null){
				conf['autoplay']=true;
			}
			if($F('isTransparent')!=null){
				conf['transparent']=true;
			}
			if($F('isImageUrlValue')!=''){
				conf['imageurl']=$F('isImageUrlValue');
			}
			if($F('isLogoValue')!=''){
				conf['logourl']=$F('isLogoValue');
			}
			if($F('isShowFps')!=null){
				conf['showFps']=true;
			}
			if($F('isFramerateValue')!=''){
				conf['framerate']=$F('isFramerateValue');
			}
			if($F('isAnalyticsDebug')!=null){
				conf['analyticsDebug']=true;
			}
			if($F('isAnalyticsValue')!=null){
				conf['analyticstrackcode']=$F('isAnalyticsValue');
			}
			Effect.ScrollTo('config',{
				afterFinish:function(){
					globalConfig=conf;
					writeSwf(conf);
				}
			});
		});
		this.setValues(config);
		$('testData').selectedIndex = 3;
		
		$('isAdWrapper').down('a').observe('click',function(e){
			e.stop();
			$('isAdValue').value = 'http://ad.doubleclick.net/adx/real.rhap/;type=newvideoplayer;sz=150x120';
		});
		$('isStreamingWrapper').down('a').observe('click',function(e){
			e.stop();
			$('isStreamingValue').value = 'rtmp://flashplay.rbn.com/a41/d1/rstone/rstone/';
			$('path').value='download/flash/RSGG/KnuxFinal';
		});
		$('isImageUrlWrapper').down('a').observe('click',function(e){
			e.stop();
			$('isImageUrlValue').value='http://meatball.prognet.com/videoplayer/knux.jpg';
		});
		$('isLogoWrapper').down('a').observe('click',function(e){
			e.stop();
			$('isLogoValue').value='http://meatball.prognet.com/videoplayer/logo.png';
		});
		$('isFramerateWrapper').down('a').observe('click',function(e){
			e.stop();
			$('isFramerateValue').value = 24;
		});
		$('isAnalyticsWrapper').down('a').observe('click',function(e){
			e.stop();
			$('isAnalyticsValue').value = 'UA-7031467-1';
		});
	};
	var toggle = function(e){
		if(this.checked){
			$(this.id+'Wrapper').appear({duration:0.3});
		}else{
			$(this.id+'Wrapper').fade({duration:0.3});
		}
		$(this.id+'Value').value='';
	};
	var resetForm = function(config){
		if(!config.server && $('isStreaming').checked==true){
			$('isStreaming').click();
			$('isStreamingValue').value='';
		}
		if(!config.imageurl && $('isImageUrl').checked==true){
			$('isImageUrl').click();
			$('isImageUrlValue').value='';
		}
		if(!config.logourl && $('isLogo').checked==true){
			$('isLogo').click();
			$('isLogoValue').value='';
		}
		if(!config.adurl && $('isAd').checked==true){
			$('isAd').click();
			$('isAdValue').value='';
		}
	};
	this.setValues = function(config){
		$('width').value = config.width;
		$('height').value = config.height;
		$('path').value = config.path;
		if(config.server){
			if($('isStreaming').checked==false){
				$('isStreaming').click();
			}
			$('isStreamingValue').value=config.server;
		}
		if(config.adurl){
			if($('isAd').checked==false){
				$('isAd').click();
			}
			$('isAdValue').value=config.adurl;
		}
	}
}













function convertCodeToText(s){
	s=s.replace(/&/g,'&amp;');
	s=s.replace(/</g,'&lt;');
	s=s.replace(/>/g,'&gt;');
	s=s.replace(/\n/g,'<br />\n');
	s=s.replace(/\r/g,'');
	return s;
}

function writeSwf(config)
{
	var swfPath = config.swfPath != null ? config.swfPath : 'SlimVideoPlayer.swf';
	var id = config.id != null ? config.id : 'videoplayer';
	var parent = config.parent != null ? config.parent : 'videoplayerWrapper';
	// We're curretly using SWFObject 1.5 in production
	var so = new SWFObject(swfPath, id, config.width, config.height, "9", "#3c3c3c");
	so.useExpressInstall('playerProductInstall.swf');
	so.addParam("scale", "noscale");
	so.addParam("allowScriptAccess", "always");
	if(config.transparent && config.transparent==true){
		so.addParam("wmode","transparent");
	}
	so.addVariable("width", config.width);
	so.addVariable("height", config.height);
	if(config.server){
		so.addVariable("server", config.server);
	}
	so.addVariable("path", config.path);
	if(config.adurl){
		so.addVariable("adurl", config.adurl);
	}
	if(config.autoplay && config.autoplay==true){
		so.addVariable("autoplay",true);
	}
	if(config.config){
		so.addVariable("config",config.config);
	}
	if(config.imageurl){
		so.addVariable("imageurl",config.imageurl);
	}
	if(config.logourl){
		so.addVariable("logourl",config.logourl);
	}
	if(config.showFps){
		so.addVariable("showFps",config.showFps);
	}
	if(config.framerate){
		so.addVariable("framerate",config.framerate);
	}
	if(config.analyticsDebug){
		so.addVariable("analyticsdebug",config.analyticsDebug);
	}
	if(config.analyticstrackcode){
		so.addVariable("analyticstrackcode",config.analyticstrackcode);
	}
	so.write( parent );
	showEmbedCode();
}