var videos=[];
/**
 * methods exposed to Flash
 */
function showMore(videoIndex){
	videos[videoIndex].showMoreControls();
}
function showLess(videoIndex){
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
	var vid = videos[videoIndex];
	if(vid.isShowMore){
		vid.showLess();
	}
}
