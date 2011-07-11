/**
 * @author lamtran
 */
var timeout = 1000;
AsyncTestCase("BasicUiTest",{
	setUp : function(){
		/*:DOC += <div id="harnessContainer"></div> */
		//buildVideoPlayer is in harnessUtils.js
		//configData is defined in harnessData.js
		buildVideoPlayer(configData[1],'harnessContainer');
	},
	tearDown : function(){
		
	},
	testInitialUi : function(queue){
		//verify that initially the controls are not visible
		assertFalse($('.rhapVideoControls').is(':visible'));
		//verify that the big play button is visible initially
		assertTrue($('.bigPlayButton').is(':visible'));
		//verify that the video player is initially paused
		assertTrue($('video')[0].paused);
		$('.rhapVideoWrapper').trigger('mouseenter');
		//verify video controls appeared
		assertTrue($('.rhapVideoControls').is(':visible'));
		//verify play button is present
		assertTrue($('.rhapVideoControls').children('.rhapVideoPlayControl').length==1);
		//verify play button is paused
		assertTrue($('.rhapVideoControls .rhapVideoPlayControl').hasClass('paused'));
		//verify seek bar is present
		assertTrue($('.rhapVideoControls').find('.rhapVideoSeekBar').length==1);
		//verify volume button is present
		assertTrue($('.rhapVideoControls').find('.rhapVideoVolumeButton').length==1);
		//verify fullscreen button is present
		assertTrue($('.rhapVideoControls').find('.rhapVideoFullScreenButton').length==1);
		//verify more button is present
		assertTrue($('.rhapVideoControls').find('.rhapVideoMoreButton').length==1);
	},
	testPlayVideoViaBigPlayButton : function(queue){
		queue.call("click big play button to play a video",function(callbacks){
			var verifyPlayback = callbacks.add(function(){
				//verify that the play button updated its css
				assertTrue(!$('.rhapVideoControls .rhapVideoPlayControl').hasClass('paused'));
				assertTrue($('.rhapVideoControls .rhapVideoPlayControl').hasClass('playing'));
				//verify that the video player is no longer paused
				assertFalse($('video')[0].paused);
			});
			$('video').bind('play',function(){
				//video started playing, do verifications
				verifyPlayback();
			}).bind('canplay',function(){
				$('.bigPlayButton').click();
			});
		});
	},
	testPlayVideoViaPlayButton : function(queue){
		queue.call("click play button to play a video",function(callbacks){
			var verifyPlayback = callbacks.add(function(){
				//verify that the play button updated its css
				assertTrue(!$('.rhapVideoControls .rhapVideoPlayControl').hasClass('paused'));
				assertTrue($('.rhapVideoControls .rhapVideoPlayControl').hasClass('playing'));
				//verify that the video player is no longer paused
				assertFalse($('video')[0].paused);
			});
			$('video').bind('play',function(){
				//video started playing, do verifications
				verifyPlayback();
			}).bind('canplay',function(){
				$('.rhapVideoPlayControl').click();
			});
		});
	}
});



/*
queue.call("click play button",function(callbacks){
	var m = callbacks.add(function(){
		$('.rhapVideoPlayControl').click();
	});
	window.setTimeout(m, timeout);
});
queue.call("click 'more' button",function(callbacks){
	var m = callbacks.add(function(){
		$('.rhapVideoWrapper .rhapVideoMoreButton').click();
	});
	window.setTimeout(m, timeout);
});
queue.call("click 'related' button",function(callbacks){
	var m = callbacks.add(function(){
		$('.rhapVideoWrapper .rhapVideoRelatedBtn').click();
	});
	window.setTimeout(m, timeout);
});
queue.call("verify",function(callbacks){
	var m = callbacks.add(function(){
	});
	window.setTimeout(m, timeout);
});
*/