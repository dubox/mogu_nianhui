const  {app ,BrowserWindow ,ipcMain}  = require('electron');  // 控制应用生命周期的模块。
//var  = require('browser-window');  // 创建原生浏览器窗口的模块



// 保持一个对于 window 对象的全局引用，不然，当 JavaScript 被 GC，
// window 会被自动地关闭
var mainWindow = null;

// 当所有窗口被关闭了，退出。
app.on('window-all-closed', function() {
  // 在 OS X 上，通常用户在明确地按下 Cmd + Q 之前
  // 应用会保持活动状态
  if (process.platform != 'darwin') {
    app.quit();
  }
});

//加载flash插件
//app.commandLine.appendSwitch('ppapi-flash-path', '/opt/google/chrome/PepperFlash/libpepflashplayer.so');	
//app.commandLine.appendSwitch('ppapi-flash-path', './libpepflashplayer.so');
//app.commandLine.appendSwitch('ppapi-flash-version', '20.0.0.228');

// 当 Electron 完成了初始化并且准备创建浏览器窗口的时候
// 这个方法就被调用
app.on('ready', function() {
  // 创建浏览器窗口。
  mainWindow = new BrowserWindow({width:1600,height:900,
  
  'web-preferences': {
      //'plugins': true
    },
	'webSecurity':false,
	'useContentSize':true,
	//'fullscreen':true,
  
 });

  // 加载应用的 index.html
  mainWindow.loadURL('file://' + __dirname + '/index.html');

  // 打开开发工具
  //mainWindow.openDevTools();

  // 当 window 被关闭，这个事件会被发出
  mainWindow.on('closed', function() {
    // 取消引用 window 对象，如果你的应用支持多窗口的话，
    // 通常会把多个 window 对象存放在一个数组里面，
    // 但这次不是。
    mainWindow = null;
  });

  ipcMain.on('fullscreen', (event, arg) => {
	  mainWindow.setFullScreen(!mainWindow.isFullScreen());
	  event.returnValue='';
	})
  
});