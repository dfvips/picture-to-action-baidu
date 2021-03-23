var optId = chrome.contextMenus.create({
		"title" : chrome.i18n.getMessage("title"),
		"contexts" : ["image"],
		"onclick" : search
	});
var parm;
function search(info, tab) {
	var url = info.srcUrl;
	if(url.indexOf("alicdn.com")!=-1){
	   	url = url.replace(/.(\d+x\d+).*|.jpg_(\d+x\d+).*/,'.jpg')
	}
	var fName = url.substring(url.lastIndexOf('/') + 1);
	if(!url.startsWith("file")){
	var getxhr = new XMLHttpRequest();
	getxhr.open('GET', url, true);
	getxhr.responseType = 'arraybuffer';
	getxhr.onreadystatechange = function (e) {
		if (getxhr.readyState === 4 && getxhr.status === 200) {
			contentType = getxhr.getResponseHeader('Content-Type');
			if (contentType === 'image/jpeg' || contentType == 'image/png') {
				gettoken(getxhr.response, tab, fName, contentType);
			} else {
				var blob = new Blob([new Uint8Array(getxhr.response)], {
						type : contentType
					});
				var url = URL.createObjectURL(blob);
				var img = new Image();
				img.onload = function () {

					var canvas = document.createElement("canvas");
					canvas.width = this.width;
					canvas.height = this.height;
					var ctx = canvas.getContext("2d");
					ctx.drawImage(this, 0, 0);
					var imagedata = canvas.toDataURL("image/jpeg");
					imagedata = imagedata.replace(/^data:image\/(png|jpeg);base64,/, "");
					bimageData = base64DecToArr(imagedata).buffer;
					gettoken(bimageData, tab, fName, "image/jpeg")
				}
				img.src = url;
			}
		} else if (getxhr.readyState === 4 && getxhr.status !== 200) {
			console.log("图片访问异常" + xhr.status);
		}
	};
	getxhr.send();

}else{
			chrome.tabs.query({
			  active: true,
			  currentWindow: true
			}, (tabs) => {
			  let message = {
			    //这里的内容就是发送至content-script的内容
			    info: info.srcUrl
			  }
			  chrome.tabs.sendMessage(tabs[0].id, message, res => {
			    console.log('bg=>content')
			    var imagedata = res;
			    imagedata = imagedata.replace(/^data:image\/(png|jpeg);base64,/, "");
				bimageData = base64DecToArr(imagedata).buffer;
				gettoken(bimageData, tab, fName, "image/jpeg");
			  })
			})
}
}

// new Date().getTime())
function gettoken(img, tab, fName, imgType){
	if(parm!=null){
		uploadImage(img, tab, fName, "image/jpeg",parm);
	}else{
		var data = "eyJkYXRhIjoiMDg2NjU0Njg0NzBhOTlmOTZkOTdiNTM1NGJkNWMxMzU3ZmZkMzZkZDk5MTcxZTMzZGM3MDkxNDljZmY2YzA3ZGI2ZjQ1NmNkN2Y5MTZiMGZmZDlkNzJhYjA1Zjc0ZDE2Y2E5M2I2NzliMmNmYmY1NDAzYTJkM2RjMmY4NWRhOGViYTA5OGRlMzIxNDMwZWUzZTNlMDJjYWIzMDM5ZjlhYTA3NWY3MDdiZjAzNDVkMzFlOGFkMDNmMzdmZDg4OGE1Yzc4ZDVhMzFjZjEwZmYzMDM0NDUyOTY1OTMyYzljYzA0NThlMzVhZDMxYjI0OTVjOGYwZTFkODZhOWYwZTdlNzczZTQyM2MxNWU0OGM2MzgwY2UyNzVhMjhjNTJmYmZlY2YyNjc4N2E1ODMyZWU0NDQyNjRiODdiMGY3MTRlMmRlYTY1YWZiNWEwNGZlNTY4M2M3NmVjZTg4YmRhZjFkZDVkMjllNDViN2Q3M2RhNTQyZGZkYmUyNDEzNWU0YTFiMGM1NTEzY2JiNzg4OGU1M2MyZjJkYjc5ZGZiZGU5NjdjMWVhZDliMjA3N2MzZTM5MWY1MTAyNDdlMjQyMTA3NmZlZWMxMjJmZWU3N2U3Y2QyOGYyZGE0MjU5ZGE1YTBkZDFiYzFlNzY4OGU1M2RlYTY4YWQyODZmNjc3Y2JiMTQyODQ5YWFiOTI0YjllZTQ1YjRlNjc5NzQyMmFiOGM3YTAzNzQ5MGI4YTA0MGRlZGQxY2RhZDI2NzBlYzA1NGFkYTNjMTkzNzQ0YTQxOWZmMzIzMDI3ZDg2MWY2YTM4MjY3ZmVjY2ZhNGQ0ZTFiZjZkOGMwMWUwNWYwYTY4OWFiMmNiYzVjOGRiNWJiYmI2MjkzNWY3ZjQ0YjM0ZDZiODIwZWU1MWM5ZWRjYzNkMGM1MGIyZTI2N2I5ZmFlZWFiOGZjMDQ5ZmFkMTZiODBjYWRiYzVjMzMyNjM3MWJhYmQ0YThjNDliZWJjMTg5ZGM5OTNmYjA5MmIwNzk3YzY1NTgzNWUzOTUzMWJlMGViN2Q3ODc3ZTZhN2FjYjc0NTcyNTRlZGU1ODNiNDcwNjI1YTMwZmUxYTM4MDA3MTdiNzc5MDc3ZDcyMjY4MzZkZWMxYmRmYmU3YjRjMWNiYWZkZGMzNmNkZWMyMzIwMDg2ZTlmZTY1ZDBmMmFhY2VjYmJlZWFkZjI0ZjNlZWJjMjUzM2FhNjEwNDBkM2ExYmJhNGUxZmFlNDMwMzk5Mjk1MDJjNTQ3ZTIzM2FmZTZjMTE3YmRmN2I1MTJjOTFiZGU4OGM4ODgxMGIzYjNkNTBmOWI4OWNhOGQ3MWQ4M2ViZDNiZTcyZDk5Zjk3NWIzMmM4Yzg2YWEwNDVkNzJmYTg5NWU4NzFmYzdiOWFhZTA1NjMxN2M5MDZmMTk0NTcyZTE5MzE4N2VmN2IzMWE4NjcxZDRhNjRhMjgxMmJlNDE1NTliMzI4NzdhNjI0NzRkZjFiZTRlNDFkYWQwZDZhYzA3ZDNlYzYzNjM5NjY2ZGU5NzViZjIwZjFiZjdkMDJmOTkyYmZmMjYwYmJiOTA4YzUwZGJiMTc0YTA1MjVhZDU1MjY2ZGRmZmFkYjdmZGZmYzU5OTBlZjgzOTk4NzcxZjljN2MzZDk0MGE1YjRkODhjN2ZhYmM1MTQzMzI0MDdhMTJhZjVjODI5MmNlZDA4ZmExMmNhMTQ2OTc1NjJkMjMwNjc3Yzg0ODE3NjM4NzJlN2YyZThiMWEyNTE3ZDk0ZDkwNDIxMjg5OGY5YjZjMWQ4ZWU1ZDU1Y2VlZDExMGNlMzJiZTlkNzlkYjAzODQ1MzZjMDllZDIzNzg2OTYyOGFkMjVhMDY3MGM1OTU1OWIwNzU1ODBjM2Y0ZWVmNzg1MmJhNjZiZjVmZDUwMDk4OWNlMDhmNjk5YjU0YTI1YTMwYzVhZjk2ODk5NzdiMTBjYWMyNzM2YTc4ZTliMjViZjNmZTAzN2U5YjQ5ZjJjMzA2MGFjOGI1NDg4ZmI4NzhhM2VlNzNjOTc2MjkxOGNjN2VjMGQ3ODlhMjE1NDEwMDk3OTQ4YmQ2Y2QxZjAwMDU5ODRkMWI2ODkwMmExMzc4YTVhZjE2MTZhOTVjYjI4OTY0Njk2MjlhNmY0YWZkY2M3YmZmMTc1YTYyNDY5ZDgyZWJlY2E1YzE0OGExNjdhMjkyNDM4MmZhMGI1MzRmN2NlMTNiOGEyNTgyNTVjYzllMGU4NDNkZTVlNjlkZWY3OTA5MTU4ZGZkMzk4ZDBkZjFkOWZmODY2MTE3NzY5NjdmZDI1MzFkOWRmM2Y3N2ZiYWE3NzE1MTdlMjViZjkxZTZkMTdiYTU2YTM5MTE2ZDFjM2JjY2VmNTMwZjRjMjE5ZDA1MGIxMTg4MzEzMTlmZmZjMTU3ZWU4YzQ4Yjc3ZDA5MThkODA3MzYwOTBjYzcwYTlhODcxYzNiZmIyMTdlZWIzNjBhZDhmMDhlMDdiN2Q2ZDJmOWJmNjQxMDZjNTY4OWM1ZjMxYTQxZDJkNWY3MmQ1ZTA1NTVmZjBlNzdlYjk2YmYyMzkxNmI0MDUxOTMwNTdjMGVjNGJjNWY1NjAxZjFlZDIyMzkwZWI1ZDg0OTg1MTA4ZmYxZGZiMWY2ZDRmYWRjMGQ0ZDJjNmVhMmE5NzdjYWRhMzU5NDRlYTBiZTgxOGIxODVmMjY5ZDViMGNjMzRkOTA3YTBmN2FlMGEyMTlhMWZlN2Y0NTZjYmU5MTEzNDk3MmVkNDViNGNhMjBjZDczNjA2MWNlOWY0Yzk0NjNjNTUxYjBlYTAxZWQ1NDJiODYzMjg0YmEzNmYwNTVjZmZhOTU1MGYwNjAzMDUxYzFiYzNkZWQ1YzQ0ZDk5N2YwNWY3ZTU0YjczZjhjNzg1ZmVhNjkxNTY1OTk0MjVjM2NmOTQ2YTA5NzM2OGQzYzliYzI4MGIzMjVlMGI4ZDE3ZjM5NzEzOTY0M2M2NjZhZTk4Y2IzYjA1MTUxMjZlYTEyMmFhNjVhMzBjYzg3NWZhZGMzZDFkYmQ5MzI4MTE0Y2I4ZGU1M2ZlNDVmYWQ2ZThhZDBjMDBjMDQzZDkwNmE3N2UxZTU0MWUzNmZjODNlNzE1NWU3ZWI3NTY1NzEzNWRjODc0ODUzNzQ4Y2M1M2Q2Nzc5NzdkZDM2ZmU3MDFiOTY2MTE1MzRkNDM1MjE2NGU4NTQwZjcyNjhjM2I2YjVjODU4NDJmNWQ0NmJiN2M2NmEzNWUxNGY2NDExYTk0ZTc0MDM4NzkxNzIyYWRmMjVmYzIyYzgzZDIyMDIwMWJiZmUwNzgwOWUxOTczYTY2NjY5OTlkMzE2MDdiMWQwNTA4ZGVkMWNmNzdjZGRhYzFhZWFmMmE5YjEwOWQ1NjdhYjQyODM2YTJkNTMyM2Q0MTcyNzNhZmVkM2U0YzFkYjc3NTk5NzFhOGU2NDZmNWE0ODYyZGY2YWJhMzgzZWY4ZGZmNDNjM2IxMDU4ZDhkYTUxNWZlNWRhYzY0MDA5MWFiMWI4NmNkNzg4MWY1ZDFkNGRiN2ZmYTc5NGQxOTZkYTNhMDEzZTY3OTAwNTE3OWZlYmM3ZjIxMWU3ZGI3M2JmZDhiOGZhNGYwNGFkMDNjNWQyNDJmNTBjYjdlMjIwMjljNjY3ZDgxNjU1YjlhNWIzMzRhNjIwMDdmNmYzNTk2MmU2NmYxYWM4OWIyZWRiNDM1OTk2NmQ3MTRlMDBhNTVhZjlhMzdmNzEwZTNlZWNhZjk2MWZiMTUwYzQ5OTMwMTVmNGVkODg3MzNlOWJlZGQ2YzE3MWM2YjQwZWVmNDFiOWJlNzhiZGFjM2EwMDQzMGE1M2IyMDgyZmJlNDUwYzA5NDc4MGUxNDFhOWYxZWYyYTE0MmYyNzVhYTFhNTI5ZDkyOGFjMDZlMDFhMGE0YzlhNzM3ZDE5ODMxNjM1MGVlMjFkYjFiNzNkZDI2ZGQ2MzhkMmY5NDg0NTU1MzAyMDU5YzAzNDUyNWZkMmY0ODJlODY1M2IwZWZjMDNiN2MyNjg3ZTA0ZGY5NDM3OGQ1MmFkYThhMzk5ZDA0OWI2MmM1Y2RkODc0Mzc2NWE2NTNmZDgzZmNlYjFiZDQ4ZWI4NjQ4NmY5YWRiZjAxZWExNjUzNjAzZjFhMzA2NmM5NjBkMTI3NjgyNGM3NTFkMzdhZDYxZDA3YWQ5ZDczODZlOTNiYmZlNjhjNGRhZDRlNGYzZTZhNTlmZTk5N2U5MGI5NTYyNzU1MTcyMTRiMzIyM2QzM2YxZDJkMzQ3ZDQ5Njk4MjY2OTBkMGVlOTYwNGQzZTU5YjcxZjM4MWZkYWI5NTczNmNiMzIxZDg3NzFkYzRiZTdhOWMxMzFlOTBkYjcwNjc3MmQxMDZiYTZhNDYwNjg3MWY0MjBjOGU1N2Y5MDQ5MTRjYTYwMWE2MTY0YjRmYWFlZjU3MzNmYmNiOGEzNTI4Nzg2MDI2NzI1NTM1N2I1YWYzMWYxMzYxNTZjZjI2NWQwNTBhMDcxMWE5OGE5YTdiNWVjOTY4MGJjNzkyYTJjNjhiNWNmNmRmYWIxYjg1Y2Y1MGI1NGNlMmQwMDk2MzRiNGIyYzAwMWFiZDFjZDBjNTMyZThhOTNiZDlmYzc1ZGMwNzg5ZWFlMzkxN2E1MGNjODJhMGFmNWRhNjg0YWUiLCJrZXlfaWQiOiI3NjQwY2YwNmRhNDQ0M2UyIn0=";
	    var xhr = new XMLHttpRequest();
		xhr.open('POST', 'https://miao.baidu.com/abdr', true);
		xhr.setRequestHeader("Accept-Language", "zh-CN,zh;q=0.9");
		xhr.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");
		xhr.onload = function (e) {
			if (xhr.readyState === 4 && xhr.status === 200) {
				var d = xhr.response;
				// var d = JSON.parse(xhr.response);
				// if (d.msg === 'OK') {
				// 	d = d.data;
				uploadImage(img, tab, fName, "image/jpeg",d);
				// }
			} else if (xhr.readyState === 4 && xhr.status !== 200) {
				console.log("未知错误");
			}
		};
		xhr.timeout = 5000; // s seconds timeout, is too long?
	    xhr.ontimeout = function () { console.log("请求超时"); }
		xhr.send(data);
	}
}

function encodeBase64(){
	var encode = encodeURI(new Date().getTime());
	var base64 = btoa(encode);
	return base64;
}

function uploadImage(img, tab, fName, imgType,d) {
	var xhr = new XMLHttpRequest();
	var boundary = 'WebKitFormBoundary'+ new Date().getTime();
	xhr.open('POST', 'https://graph.baidu.com/upload?uptime='+new Date().getTime(), true);
	xhr.setRequestHeader("Accept", "*/*");
	xhr.setRequestHeader('Content-Type', 'multipart/form-data; boundary=' + boundary);
	xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
	xhr.onload = function (e) {
		if (xhr.readyState === 4 && xhr.status === 200) {
			var data = JSON.parse(xhr.response);
			var url = data.data.url;
			chrome.tabs.create({
				url : url
			});
		} else if (xhr.readyState === 4 && xhr.status !== 200) {
			console.log("请求失败" + xhr.status);
		}
	};
	var CRLF = "\r\n";
	var request = "--" + boundary + CRLF;
	var blob = new Blob([new Uint8Array(img)], {
			type : imgType
		});
	var reader = new FileReader();
	reader.onloadend = function () {
		request += 'Content-Disposition: form-data; name=\"tn\"\r\n\r\npc'+CRLF;
		request += "--" + boundary + CRLF;
		request += 'Content-Disposition: form-data; name=\"from\"\r\n\r\npc'+CRLF;
		request += "--" + boundary + CRLF;
		request += 'Content-Disposition: form-data; name=\"image_source\"\r\n\r\nPC_UPLOAD_FILE'+CRLF;
		request += "--" + boundary + CRLF;
		request += 'Content-Disposition: form-data; name=\"sdkParams\"\r\n\r\n'+d+CRLF;
		request += "--" + boundary + CRLF;
		request += 'Content-Disposition: form-data; name=\"image\"; filename=\"' + fName + '\"' + CRLF;
		request += "Content-Type: " + imgType + CRLF + CRLF;
		request += reader.result+ CRLF + CRLF;
		request += "--" + boundary + "--";

		var nBytes = request.length,
		ui8Data = new Uint8Array(nBytes);
		for (var nIdx = 0; nIdx < nBytes; nIdx++) {
			ui8Data[nIdx] = request.charCodeAt(nIdx) & 0xff;
		}
		xhr.timeout = 5000; // s seconds timeout, is too long?
		// data.append("file", ui8Data);
        xhr.ontimeout = function () { console.log("查询超时，请稍后重试!"); }
        // xhr.send(data);
		xhr.send(ui8Data);
	}
	reader.readAsBinaryString(blob);
}

function base64DecToArr(sBase64, nBlocksSize) {

	var
	sB64Enc = sBase64.replace(/[^A-Za-z0-9\+\/]/g, ""),
	nInLen = sB64Enc.length,
	nOutLen = nBlocksSize ? Math.ceil((nInLen * 3 + 1 >> 2) / nBlocksSize) * nBlocksSize : nInLen * 3 + 1 >> 2,
	taBytes = new Uint8Array(nOutLen);

	for (var nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0; nInIdx < nInLen; nInIdx++) {
		nMod4 = nInIdx & 3;
		nUint24 |= b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << 6 * (3 - nMod4);
		if (nMod4 === 3 || nInLen - nInIdx === 1) {
			for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++, nOutIdx++) {
				taBytes[nOutIdx] = nUint24 >>> (16 >>> nMod3 & 24) & 255;
			}
			nUint24 = 0;
		}
	}

	return taBytes;
}
function b64ToUint6(nChr) {

	return nChr > 64 && nChr < 91 ?
	nChr - 65
	 : nChr > 96 && nChr < 123 ?
	nChr - 71
	 : nChr > 47 && nChr < 58 ?
	nChr + 4
	 : nChr === 43 ?
	62
	 : nChr === 47 ?
	63
	 :
	0;

}

chrome.runtime.onConnect.addListener(function(port) {
	port.onMessage.addListener(function(msg) {
	var data = "eyJkYXRhIjoiMDg2NjU0Njg0NzBhOTlmOTZkOTdiNTM1NGJkNWMxMzU3ZmZkMzZkZDk5MTcxZTMzZGM3MDkxNDljZmY2YzA3ZGI2ZjQ1NmNkN2Y5MTZiMGZmZDlkNzJhYjA1Zjc0ZDE2Y2E5M2I2NzliMmNmYmY1NDAzYTJkM2RjMmY4NWRhOGViYTA5OGRlMzIxNDMwZWUzZTNlMDJjYWIzMDM5ZjlhYTA3NWY3MDdiZjAzNDVkMzFlOGFkMDNmMzdmZDg4OGE1Yzc4ZDVhMzFjZjEwZmYzMDM0NDUyOTY1OTMyYzljYzA0NThlMzVhZDMxYjI0OTVjOGYwZTFkODZhOWYwZTdlNzczZTQyM2MxNWU0OGM2MzgwY2UyNzVhMjhjNTJmYmZlY2YyNjc4N2E1ODMyZWU0NDQyNjRiODdiMGY3MTRlMmRlYTY1YWZiNWEwNGZlNTY4M2M3NmVjZTg4YmRhZjFkZDVkMjllNDViN2Q3M2RhNTQyZGZkYmUyNDEzNWU0YTFiMGM1NTEzY2JiNzg4OGU1M2MyZjJkYjc5ZGZiZGU5NjdjMWVhZDliMjA3N2MzZTM5MWY1MTAyNDdlMjQyMTA3NmZlZWMxMjJmZWU3N2U3Y2QyOGYyZGE0MjU5ZGE1YTBkZDFiYzFlNzY4OGU1M2RlYTY4YWQyODZmNjc3Y2JiMTQyODQ5YWFiOTI0YjllZTQ1YjRlNjc5NzQyMmFiOGM3YTAzNzQ5MGI4YTA0MGRlZGQxY2RhZDI2NzBlYzA1NGFkYTNjMTkzNzQ0YTQxOWZmMzIzMDI3ZDg2MWY2YTM4MjY3ZmVjY2ZhNGQ0ZTFiZjZkOGMwMWUwNWYwYTY4OWFiMmNiYzVjOGRiNWJiYmI2MjkzNWY3ZjQ0YjM0ZDZiODIwZWU1MWM5ZWRjYzNkMGM1MGIyZTI2N2I5ZmFlZWFiOGZjMDQ5ZmFkMTZiODBjYWRiYzVjMzMyNjM3MWJhYmQ0YThjNDliZWJjMTg5ZGM5OTNmYjA5MmIwNzk3YzY1NTgzNWUzOTUzMWJlMGViN2Q3ODc3ZTZhN2FjYjc0NTcyNTRlZGU1ODNiNDcwNjI1YTMwZmUxYTM4MDA3MTdiNzc5MDc3ZDcyMjY4MzZkZWMxYmRmYmU3YjRjMWNiYWZkZGMzNmNkZWMyMzIwMDg2ZTlmZTY1ZDBmMmFhY2VjYmJlZWFkZjI0ZjNlZWJjMjUzM2FhNjEwNDBkM2ExYmJhNGUxZmFlNDMwMzk5Mjk1MDJjNTQ3ZTIzM2FmZTZjMTE3YmRmN2I1MTJjOTFiZGU4OGM4ODgxMGIzYjNkNTBmOWI4OWNhOGQ3MWQ4M2ViZDNiZTcyZDk5Zjk3NWIzMmM4Yzg2YWEwNDVkNzJmYTg5NWU4NzFmYzdiOWFhZTA1NjMxN2M5MDZmMTk0NTcyZTE5MzE4N2VmN2IzMWE4NjcxZDRhNjRhMjgxMmJlNDE1NTliMzI4NzdhNjI0NzRkZjFiZTRlNDFkYWQwZDZhYzA3ZDNlYzYzNjM5NjY2ZGU5NzViZjIwZjFiZjdkMDJmOTkyYmZmMjYwYmJiOTA4YzUwZGJiMTc0YTA1MjVhZDU1MjY2ZGRmZmFkYjdmZGZmYzU5OTBlZjgzOTk4NzcxZjljN2MzZDk0MGE1YjRkODhjN2ZhYmM1MTQzMzI0MDdhMTJhZjVjODI5MmNlZDA4ZmExMmNhMTQ2OTc1NjJkMjMwNjc3Yzg0ODE3NjM4NzJlN2YyZThiMWEyNTE3ZDk0ZDkwNDIxMjg5OGY5YjZjMWQ4ZWU1ZDU1Y2VlZDExMGNlMzJiZTlkNzlkYjAzODQ1MzZjMDllZDIzNzg2OTYyOGFkMjVhMDY3MGM1OTU1OWIwNzU1ODBjM2Y0ZWVmNzg1MmJhNjZiZjVmZDUwMDk4OWNlMDhmNjk5YjU0YTI1YTMwYzVhZjk2ODk5NzdiMTBjYWMyNzM2YTc4ZTliMjViZjNmZTAzN2U5YjQ5ZjJjMzA2MGFjOGI1NDg4ZmI4NzhhM2VlNzNjOTc2MjkxOGNjN2VjMGQ3ODlhMjE1NDEwMDk3OTQ4YmQ2Y2QxZjAwMDU5ODRkMWI2ODkwMmExMzc4YTVhZjE2MTZhOTVjYjI4OTY0Njk2MjlhNmY0YWZkY2M3YmZmMTc1YTYyNDY5ZDgyZWJlY2E1YzE0OGExNjdhMjkyNDM4MmZhMGI1MzRmN2NlMTNiOGEyNTgyNTVjYzllMGU4NDNkZTVlNjlkZWY3OTA5MTU4ZGZkMzk4ZDBkZjFkOWZmODY2MTE3NzY5NjdmZDI1MzFkOWRmM2Y3N2ZiYWE3NzE1MTdlMjViZjkxZTZkMTdiYTU2YTM5MTE2ZDFjM2JjY2VmNTMwZjRjMjE5ZDA1MGIxMTg4MzEzMTlmZmZjMTU3ZWU4YzQ4Yjc3ZDA5MThkODA3MzYwOTBjYzcwYTlhODcxYzNiZmIyMTdlZWIzNjBhZDhmMDhlMDdiN2Q2ZDJmOWJmNjQxMDZjNTY4OWM1ZjMxYTQxZDJkNWY3MmQ1ZTA1NTVmZjBlNzdlYjk2YmYyMzkxNmI0MDUxOTMwNTdjMGVjNGJjNWY1NjAxZjFlZDIyMzkwZWI1ZDg0OTg1MTA4ZmYxZGZiMWY2ZDRmYWRjMGQ0ZDJjNmVhMmE5NzdjYWRhMzU5NDRlYTBiZTgxOGIxODVmMjY5ZDViMGNjMzRkOTA3YTBmN2FlMGEyMTlhMWZlN2Y0NTZjYmU5MTEzNDk3MmVkNDViNGNhMjBjZDczNjA2MWNlOWY0Yzk0NjNjNTUxYjBlYTAxZWQ1NDJiODYzMjg0YmEzNmYwNTVjZmZhOTU1MGYwNjAzMDUxYzFiYzNkZWQ1YzQ0ZDk5N2YwNWY3ZTU0YjczZjhjNzg1ZmVhNjkxNTY1OTk0MjVjM2NmOTQ2YTA5NzM2OGQzYzliYzI4MGIzMjVlMGI4ZDE3ZjM5NzEzOTY0M2M2NjZhZTk4Y2IzYjA1MTUxMjZlYTEyMmFhNjVhMzBjYzg3NWZhZGMzZDFkYmQ5MzI4MTE0Y2I4ZGU1M2ZlNDVmYWQ2ZThhZDBjMDBjMDQzZDkwNmE3N2UxZTU0MWUzNmZjODNlNzE1NWU3ZWI3NTY1NzEzNWRjODc0ODUzNzQ4Y2M1M2Q2Nzc5NzdkZDM2ZmU3MDFiOTY2MTE1MzRkNDM1MjE2NGU4NTQwZjcyNjhjM2I2YjVjODU4NDJmNWQ0NmJiN2M2NmEzNWUxNGY2NDExYTk0ZTc0MDM4NzkxNzIyYWRmMjVmYzIyYzgzZDIyMDIwMWJiZmUwNzgwOWUxOTczYTY2NjY5OTlkMzE2MDdiMWQwNTA4ZGVkMWNmNzdjZGRhYzFhZWFmMmE5YjEwOWQ1NjdhYjQyODM2YTJkNTMyM2Q0MTcyNzNhZmVkM2U0YzFkYjc3NTk5NzFhOGU2NDZmNWE0ODYyZGY2YWJhMzgzZWY4ZGZmNDNjM2IxMDU4ZDhkYTUxNWZlNWRhYzY0MDA5MWFiMWI4NmNkNzg4MWY1ZDFkNGRiN2ZmYTc5NGQxOTZkYTNhMDEzZTY3OTAwNTE3OWZlYmM3ZjIxMWU3ZGI3M2JmZDhiOGZhNGYwNGFkMDNjNWQyNDJmNTBjYjdlMjIwMjljNjY3ZDgxNjU1YjlhNWIzMzRhNjIwMDdmNmYzNTk2MmU2NmYxYWM4OWIyZWRiNDM1OTk2NmQ3MTRlMDBhNTVhZjlhMzdmNzEwZTNlZWNhZjk2MWZiMTUwYzQ5OTMwMTVmNGVkODg3MzNlOWJlZGQ2YzE3MWM2YjQwZWVmNDFiOWJlNzhiZGFjM2EwMDQzMGE1M2IyMDgyZmJlNDUwYzA5NDc4MGUxNDFhOWYxZWYyYTE0MmYyNzVhYTFhNTI5ZDkyOGFjMDZlMDFhMGE0YzlhNzM3ZDE5ODMxNjM1MGVlMjFkYjFiNzNkZDI2ZGQ2MzhkMmY5NDg0NTU1MzAyMDU5YzAzNDUyNWZkMmY0ODJlODY1M2IwZWZjMDNiN2MyNjg3ZTA0ZGY5NDM3OGQ1MmFkYThhMzk5ZDA0OWI2MmM1Y2RkODc0Mzc2NWE2NTNmZDgzZmNlYjFiZDQ4ZWI4NjQ4NmY5YWRiZjAxZWExNjUzNjAzZjFhMzA2NmM5NjBkMTI3NjgyNGM3NTFkMzdhZDYxZDA3YWQ5ZDczODZlOTNiYmZlNjhjNGRhZDRlNGYzZTZhNTlmZTk5N2U5MGI5NTYyNzU1MTcyMTRiMzIyM2QzM2YxZDJkMzQ3ZDQ5Njk4MjY2OTBkMGVlOTYwNGQzZTU5YjcxZjM4MWZkYWI5NTczNmNiMzIxZDg3NzFkYzRiZTdhOWMxMzFlOTBkYjcwNjc3MmQxMDZiYTZhNDYwNjg3MWY0MjBjOGU1N2Y5MDQ5MTRjYTYwMWE2MTY0YjRmYWFlZjU3MzNmYmNiOGEzNTI4Nzg2MDI2NzI1NTM1N2I1YWYzMWYxMzYxNTZjZjI2NWQwNTBhMDcxMWE5OGE5YTdiNWVjOTY4MGJjNzkyYTJjNjhiNWNmNmRmYWIxYjg1Y2Y1MGI1NGNlMmQwMDk2MzRiNGIyYzAwMWFiZDFjZDBjNTMyZThhOTNiZDlmYzc1ZGMwNzg5ZWFlMzkxN2E1MGNjODJhMGFmNWRhNjg0YWUiLCJrZXlfaWQiOiI3NjQwY2YwNmRhNDQ0M2UyIn0=";
	var xhr = new XMLHttpRequest();
	xhr.open('POST', 'https://miao.baidu.com/abdr', true);
	xhr.setRequestHeader("Accept-Language", "zh-CN,zh;q=0.9");
	xhr.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");
	xhr.onload = function (e) {
	if (xhr.readyState === 4 && xhr.status === 200) {
	  var d = xhr.response;
	  parm = d;
	  port.postMessage("success");
	} else if (xhr.readyState === 4 && xhr.status !== 200) {
	  console.log("未知错误");
	  parm = null;
	  port.postMessage("fail");
	}
	};
	xhr.timeout = 5000; // s seconds timeout, is too long?
	xhr.ontimeout = function () { console.log("请求超时"); }
	xhr.send(data);
   });
});

chrome.webRequest.onBeforeSendHeaders.addListener(function (details) {
    details.requestHeaders.push({
        name:"Referer",
        value:"https://graph.baidu.com"
    });
    details.requestHeaders.push({
        name:"Origin",
        value:"https://graph.baidu.com"
    });
    return {
        requestHeaders: details.requestHeaders
    };
},
    {
        urls: ["https://graph.baidu.com/*","https://miao.baidu.com/*"]
    },
    ["blocking", "requestHeaders", "extraHeaders"]
);