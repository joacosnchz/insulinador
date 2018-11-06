var myApp = new Framework7({
    pushState: true,
    //swipePanel: 'left',
    tapHold: true
});

var $$ = Dom7;

var mainView = myApp.addView('.view-main', {
    dynamicNavbar: true
});

//var ws_url = 'http://192.168.1.21:3003';
var ws_url = 'http://ec2-13-58-159-226.us-east-2.compute.amazonaws.com:3003';

function upperCaseFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function getFreeSpace(onSuccess, onError) {
	cordova.exec(onSuccess, onError, "File", "getFreeDiskSpace", []);
}

function hasConnection() {
    var networkState = navigator.connection.type;

    if(networkState == Connection.NONE || networkState == Connection.UNKNOWN) {
    	return false;
    } else {
    	return true;
    }
}

document.addEventListener("deviceready", function() {
	if(hasConnection()) {
		saveRemainingFoods();
	}
}, false);

function saveRemainingFoods() {
	window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function (directoryEntry) {
        directoryEntry.getFile('comida.txt', { create: false }, function (fileEntry) {
        	fileEntry.file(function (file) {
				var reader = new FileReader();

				reader.onloadend = function() {
					if(file.size > 0) {
						myApp.showPreloader('Guardando comidas anteriores...');
						var comidas = JSON.parse("[" + this.result + ']');
						saveFoodsSync(comidas, 0, function() {
							fileEntry.createWriter(function (fileWriter) {
								fileWriter.write('');
								myApp.hidePreloader();
							});
						});
					} 
				};

				reader.readAsText(file);

			}, function() {
				
			});
        }, function() {
        	
        });
    }, function() {
    	
    });
    // no captura el error porque si no funciona intenta la proxima vez
}

function saveFoodsSync(comidas, index, onSuccess) {
	$$.ajax({
		url: ws_url + '/comidas',
		type: 'POST',
		data: comidas[index],
		timeout: 30000,
		success: function(result) {
			if(result == 'OK') {
				if(index+1 < comidas.length) {
					saveFoodsSync(comidas, index+1, onSuccess);
				} else {
					onSuccess();
				}
			}
		},
		error: function() {
			myApp.hidePreloader();
			myApp.alert('Disculpe, no se pudieron guardar las comidas anteriores. Por favor intente nuevamente más tarde.');
		}
		// no captura el error porque si no funciona intenta la proxima vez
	});
}
