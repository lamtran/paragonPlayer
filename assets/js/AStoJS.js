var videos=[];
/**
 * methods exposed to Flash
 */
function showMore(videoIndex){
	console.log('from flash show moreeee'+videoIndex);
	videos[videoIndex].showMoreControls();
}
function showLess(videoIndex){
	console.log('from flash show lesssss'+videoIndex);
	videos[videoIndex].hideMoreControls();
}
function onFlashVideoPlayerLoaded(){
	//overwrite this
	//console.log('onflashvideoplayerloaded!');
}
function onFlashLog(msg){
	//console.log('fromFlash: ' + msg);
}
function hideMoreControls(videoIndex){
	console.log('from flash hide more controlss');
	var vid = videos[videoIndex];
	if(vid.isShowMore){
		vid.showLess();
	}
}
