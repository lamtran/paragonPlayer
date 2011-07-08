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
		console.log($('#harnessContainer'));
	},
	tearDown : function(){
		
	},
	testHoverPlayer : function(queue){
		queue.call("hover over the player",function(callbacks){
			var m = callbacks.add(function(){
				$('.rhapVideoWrapper .rhapVideoMoreButton').trigger('mouseenter');
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
	}
});