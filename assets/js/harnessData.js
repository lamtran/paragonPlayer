var vids = [
{
	title:"Oceans Clip",
	poster:"http://lamtran.com/oceans-clip.png",
	mp4:"http://lamtran.com/oceans-clip.mp4",
	webm:"http://lamtran.com/oceans-clip.webm",
	ogg:"http://lamtran.com/oceans-clip.ogv",
	flv:{
		server:"rtmp://lamtran.com:1935/vod/",
		src:"oceans-clip"
	}
},{
	title:"Cutting Edge",
	poster:"http://lamtran.com/Cutting-Edge-640.jpg",
	mp4:"http://lamtran.com/Cutting-Edge-640.mp4",
	webm:"http://lamtran.com/Cutting-Edge-640.webm",
	ogg:"http://lamtran.com/Cutting-Edge-640.ogv",
	flv:{
		server:"rtmp://lamtran.com:1935/vod/",
		src:"Cutting-Edge-640"
	}
},{
	title:"Features",
	poster:"http://lamtran.com/FF4_Jess3Features_VO_1.jpg",
	mp4:"http://lamtran.com/FF4_Jess3Features_VO_1.mp4",
	webm:"http://lamtran.com/FF4_Jess3Features_VO_1.webm",
	ogg:"http://lamtran.com/FF4_Jess3Features_VO_1.ogv",
	flv:{
		server:"rtmp://lamtran.com:1935/vod/",
		src:"FF4_Jess3Features_VO_1"
	}
},{
	title:"Mobile Addons",
	poster:"http://lamtran.com/Mobile-Addons-640.jpg",
	mp4:"http://lamtran.com/Mobile-Addons-640.mp4",
	webm:"http://lamtran.com/Mobile-Addons-640.webm",
	ogg:"http://lamtran.com/Mobile-Addons-640.ogv",
	flv:{
		server:"rtmp://lamtran.com:1935/vod/",
		src:"Mobile-Addons-640"
	}
},{
	title:"Manifesto",
	poster:"http://lamtran.com/Mozilla_Firefox_Manifesto_v0.2_640.jpg",
	mp4:"http://lamtran.com/Mozilla_Firefox_Manifesto_v0.2_640.mp4",
	webm:"http://lamtran.com/Mozilla_Firefox_Manifesto_v0.2_640.webm",
	ogg:"http://lamtran.com/Mozilla_Firefox_Manifesto_v0.2_640.ogv",
	flv:{
		server:"rtmp://lamtran.com:1935/vod/",
		src:"Mozilla_Firefox_Manifesto_v0.2_640"
	}
},{
	title:"Meet the cubs",
	poster:"http://lamtran.com/meetthecubs.jpg",
	mp4:"http://lamtran.com/meetthecubs.mp4video.mp4",
	webm:"http://lamtran.com/meetthecubs.webm",
	ogg:"http://lamtran.com/meetthecubs.ogv",
	flv:{
		server:"rtmp://lamtran.com:1935/vod/",
		src:"meetthecubs"
	}
},{
	title:"Dart Moor",
	poster:"http://lamtran.com/dartmoor.jpg",
	mp4:"http://lamtran.com/dartmoor.mp4",
	webm:"http://lamtran.com/dartmoor.webmvp8.webm",
	ogg:"http://lamtran.com/dartmoor.ogv",
	flv:{
		server:"rtmp://lamtran.com:1935/vod/",
		src:"dartmoor"
		}
	}
];
var configData = [{
	//description: "fixed size, flash only, inline",
	initialWidth: 640,
	initialHeight: 480,
	preferredWidth: '640',
	preferredHeight: '480',
	forcedFlash: true,
	popout: false,
	videos:vids
},{
	//description: "fixed size, auto detect video support, inline",
	initialWidth: 640,
	initialHeight: 480,
	preferredWidth: '640',
	preferredHeight: '480',
	forcedFlash: false,
	popout: false,
	videos:vids
},{
	//description: "fixed size, auto detect video support, pop out",
	initialWidth: 640,
	initialHeight: 480,
	preferredWidth: '640',
	preferredHeight: '480',
	forcedFlash: false,
	popout: true,
	videos:vids
},{
	//description: "auto resize to a fixed dimension, auto detect video support, inline",
	initialWidth: 200,
	initialHeight: 100,
	preferredWidth: '640',
	preferredHeight: '480',
	forcedFlash: false,
	popout: false,
	videos:vids
},{
	//description: "auto resize to video's native dimensions, auto detect video support, inline",
	initialWidth: 640,
	initialHeight: 480,
	preferredWidth: 'auto',
	preferredHeight: 'auto',
	forcedFlash: false,
	popout: false,
	videos:vids
},{
	//description: "auto resize to video's native dimensions, auto detect video support, pop out",
	initialWidth: 640,
	initialHeight: 480,
	preferredWidth: 'auto',
	preferredHeight: 'auto',
	forcedFlash: false,
	popout: true,
	videos:vids
}
];
var mp4VideoStore=[
	"http://lamtran.com/oceans-clip.mp4",
	"http://lamtran.com/Cutting-Edge-640.mp4",
	"http://lamtran.com/FF4_Jess3Features_VO_1.mp4",
	"http://lamtran.com/Mobile-Addons-640.mp4",
	"http://lamtran.com/Mozilla_Firefox_Manifesto_v0.2_640.mp4",
	"http://lamtran.com/meetthecubs.mp4video.mp4",
	"http://lamtran.com/dartmoor.mp4"
];

var webMVideoStore=[
	"http://lamtran.com/oceans-clip.webm",
	"http://lamtran.com/Cutting-Edge-640.webm",
	"http://lamtran.com/FF4_Jess3Features_VO_1.webm",
	"http://lamtran.com/Mobile-Addons-640.webm",
	"http://lamtran.com/Mozilla_Firefox_Manifesto_v0.2_640.webm",
	"http://lamtran.com/meetthecubs.webm",
	"http://lamtran.com/dartmoor.webmvp8.webm"
];
var oggVideoStore=[
	"http://lamtran.com/oceans-clip.ogv",
	"http://lamtran.com/Cutting-Edge-640.ogv",
	"http://lamtran.com/FF4_Jess3Features_VO_1.ogv",
	"http://lamtran.com/Mobile-Addons-640.ogv",
	"http://lamtran.com/Mozilla_Firefox_Manifesto_v0.2_640.ogv",
	"http://lamtran.com/meetthecubs.ogv",
	"http://lamtran.com/dartmoor.ogv"
];
var flvVideoStore=[
	{
		server:"rtmp://lamtran.com:1935/vod/",
		src:"oceans-clip"
	},{
		server:"rtmp://lamtran.com:1935/vod/",
		src:"Cutting-Edge-640"
	},{
		server:"rtmp://lamtran.com:1935/vod/",
		src:"FF4_Jess3Features_VO_1"
	},{
		server:"rtmp://lamtran.com:1935/vod/",
		src:"Mobile-Addons-640"
	},{
		server:"rtmp://lamtran.com:1935/vod/",
		src:"Mozilla_Firefox_Manifesto_v0.2_640"
	},{
		server:"rtmp://lamtran.com:1935/vod/",
		src:"meetthecubs"
	},{
		server:"rtmp://lamtran.com:1935/vod/",
		src:"dartmoor"
	}
];
