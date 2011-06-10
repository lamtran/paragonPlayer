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
function hideMoreControls(videoIndex){
	var vid = videos[videoIndex];
	console.log('is show more: ' + vid.isShowMore);
	if(vid.isShowMore){
		console.log('show lessssss');
		vid.showLess();
	}
}