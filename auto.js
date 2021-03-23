if(window.location.href.indexOf("http")==-1){
	var basecode = getBase64Image(document.getElementsByTagName("img")[0]);
	chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    var img = document.getElementsByTagName("img")[0];
  	sendResponse(basecode);
  });
}
var port = chrome.runtime.connect();//通道名称
port.postMessage("aaa");//发送消息
port.onMessage.addListener(function(msg) {//监听消息
 console.log(msg);
});
function getBase64Image(img) {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, img.width, img.height);
    var ext = img.src.substring(img.src.lastIndexOf(".") + 1).toLowerCase();
    var dataURL = canvas.toDataURL("image/" + ext);
    return dataURL;
}
