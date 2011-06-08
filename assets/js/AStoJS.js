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
}