/**
 * 2016年会抽奖
 *
 * dubox
 *
 * 2016.01.25
 *
 */

 
 //
DOMAIN = 'wechat.51zx.com';  //document.domain
 
 

require.config({
    paths: {
        cocos: 'cocos2d-js-min-v3.9',
        mainScene:'mainScene',
        cocosRes:  'res',
        LS:'local_storage_manager'
    },
    shim: {

    }
});

//alert(window.innerWidth)
var CJ = {  //命名空间

    conf:{
        contentSize:{width:1280,height:1024},
        userImgLt:{width:100,height:100},
        userImgGt:{width:180,height:180},
    },  //全局参数
    view:{    //ui数据,操作

    },
    data:{
        user:[],
        userLottery:[],
        addUser:function(data){
			
			
			
            var userData = {
                index : this.user.length,
                headimgurl : data.hurl,
                nickname : data.nickname,
                phone : data.phone,
                id : data.id,
            };
            CJ.view.addUser(userData);
            this.user.push(userData);
            main.insTodataCenter('CJuser',this.user);
        },
        showDanMU:function(str){
            //CJ.mainScene.bgLayer.addDanmuText(str);
			//CJ.view.addDanmuImg
			//console.log(str);
			if(str.indexOf('http:') === 0){
				
				if(str.indexOf('.jpg') != -1)
					CJ.view.addDanmuImg(str);
				
				if(str.indexOf('.amr') != -1)
					playAmr(str);
				
				return;
			}
			
			CJ.runTime.layerNow.addChild(CJ.view.addDanmuText(str));
        },
		loadUsers:function(weData){
			
			var m = 0;
			for(var i in weData){
					weData[i].hurl = 'weImg/hh'+weData[i].id + '.jpg';
					CJ.data.addUser(weData[i]);
					//weData.splice(i,1);
					m++;
					//
			}
				CJ.view.lotteryNumLabel.setString(weData.length);
		}

    },
    fn:{

    },
    Timer:{},
    runTime:{
        sign:true,  //是否接受签到数据
        afterScene:false,  //true 场景加载完成
		
		DM_wenzi_show:1,
		DM_tupian_show:1,
		DM_shengyin_show:1,
    },


};


var loadCocos = new Promise(function(resolve){

    //cocos 模块
    require(["mainScene","cocosRes"], function(mainScene , res) {

        CJ.view.res = res;
        CJ.mainScene = mainScene;

        cc.game.onStart = function(){

            var policy = new cc.ResolutionPolicy(cc.ContainerStrategy.EQUAL_TO_FRAME, cc.ContentStrategy.FIXED_HEIGHT); //HEIGHT
            cc.view.setDesignResolutionSize(CJ.conf.contentSize.width, CJ.conf.contentSize.height, policy);
            cc.view.resizeWithBrowserSize(true);

            //load resources
            cc._loaderImage = main.config.baseURI + '?m=Client&a=getHeadimgurl&url=http://p.51zx.com/dist/2.16.6/assets/img/logo/index.png';
            cc.LoaderScene.preload(res.path, function () {

                cc.director.runScene(new mainScene.scene2(resolve));

                //resolve();

            }, this);
        };
        cc.game.run("gameCanvas");



    });

});




//全局公共对象
main = {
    init:function(){
        //网络交互
        Promise.all([
            new Promise(function(resolve) {
                require(["mmRouter"],function(){
                    resolve("mmRouter");
                });
            }),
                new Promise(function(resolve) {
                    require(["mmRequest"],function(){
                        resolve("mmRequest");
                    });
                })
                ,
                new Promise(function(resolve) {
                    require(["LS"],function(LS){
                        resolve(LS);
                    });
                })
        ]

        ).then(function(res) {
            initRouters(res);

            main.LS = res[2];

            var initUrlData = AV.unparam(window.location.hash);

            CJ.conf.mp_config = initUrlData.mp_config;
            CJ.conf.sid = initUrlData.sid;

            loadCocos.then(function(){
				//console.log(document.getElementById('Cocos2dGameContainer').style.margin);
				document.getElementById('Cocos2dGameContainer').style.margin = '0px';  //为了适应现场机器
				
				//var weData = window.weData;	//先加载本地数据
				CJ.data.loadUsers(window.weData);	//加载本地微信用户数据
				window.weData = null;
				
                CJ.runTime.afterScene = true;
                //sid 二维码id  ，mp_config 公众号识别 ，id 签到id ，dm 弹幕标识
                //AV.router.navigate('/index?' + AV.param(AV.unparam(window.location.hash+'&id='+weData[i].id )));
				
				
				 window.onresize = function(){//alert('123');
	
					//cc.director.runScene(new CJ.mainScene.scene1(function(){}));
				
				};
				
				
            });


        })
    },
    config :{
	
    baseURI : 'http://'+ DOMAIN +'/index.php',
	dm : '2017',
	dmAI : 1,

},
    Timer:{},
    runTime:{
        dmTimeDelay:1,
        dmImgTimeDelay:1,
		dmSwitch : 1,
		dmImgSwitch : 1,
		dmVoiceSwitch : 1,
    },
    /*****
     * 数据中心
     * 例：{
 *          'test.aspx?a=1&b=2':{
 *              type:'urlCache',    //必须
 *              url:'test.aspx',
 *              params:{a:1,b:2},
 *              data:{s1:1,s2:2}    //必须
 *
 *          }
 *      }
     *
     */


    dataCenter : {}
};







//初始化路由
function initRouters(g){


    AV.history.start({html5Mode: false});

    //注册路由监听
    for(var c in main.Routers){
        AV.router.get('/'+c,function(){
            var _this = this;
            _this.cName = _this.path.substr(1);
            main.Routers[_this.cName](_this);
        });
    }



}
main.intCache = function(){
    var userCache = main.getFromdataCenter('CJuser');
    if(typeof userCache != 'undefined' && userCache){
        for (var i in userCache){
            CJ.data.addUser(userCache[i]);
        }
        return userCache[userCache.length - 1].id;
    }
    return 0;
}

//路由回调  业务写在这里
main.Routers = {

    index : function(routerData){


        if(!CJ.runTime.afterScene)return false;



        //AV.log(routerData);
        routerData.query.r = 0;
        /**
		main.ReqUrl('?m=Client&a=getSignData&',routerData.query).then(function(res){

            var id = res.id;
            var waitTime = 1000;
            if(res.isAjax)waitTime = 2000;

            if(id != 'complete'){
                if(main.getFromdataCenter(id).data.status === 1){
					var data = main.getFromdataCenter(id).data;
					data.hurl = AV.unparam(data.headimgurl).url;
					CJ.data.addUser(data);
				}
            }

            setTimeout(function(){
                if(CJ.runTime.sign){

                    routerData.query.r = Math.random();

                    if(id == 'complete'){
                        AV.router.navigate('/index?' + AV.param(routerData.query));
                    }else {
                        //有数据则更新id
                        routerData.query.id = main.getFromdataCenter(id).data.id;

                        AV.router.navigate('/index?' + AV.param(routerData.query));
                    }
                }
            },waitTime);

            //
        });
		**/
		
		


    },


};

 //弹幕文字

setInterval(function(){
	
	
		if(!CJ.runTime.DM_wenzi_show)return false;
	
         AV.getJSON(main.config.baseURI + '?m=Client&a=getActiveMsg&msgKey=' + main.config.dm, function (data) {

                if(data.length){

                    for (var i in data){
                        CJ.data.showDanMU(data[i]); //.substr(0,15)
						CJ.data.defaultDM.push(data[i]);
					}
                    main.runTime.dmTimeDelay = 1;
                }else if(main.config.dmAI) { //没有人发消息时走这里
                    if(main.runTime.dmTimeDelay % 5 == 0 ) {
                        var l = CJ.data.defaultDM.length;

                        for (var i = 0; i < 1; i++) {
                            var k = parseInt(l * Math.random());
                            CJ.data.showDanMU(CJ.data.defaultDM[k]);
                        }
                    }
                    main.runTime.dmTimeDelay ++;

                }


            });
},2000);

 //弹幕图片

setInterval(function(){
	
	if(!CJ.runTime.DM_tupian_show)return false;
         AV.getJSON(main.config.baseURI + '?m=Client&a=getActiveMsg&msgNum=1&msgKey=image' + main.config.dm, function (data) {

                if(data.length){

                    for (var i in data){
                        CJ.data.showDanMU(data[i]); //.substr(0,15)
						CJ.data.defaultDMimg.push(data[i]);
					}
                    main.runTime.dmImgTimeDelay = 1;
                }else if(main.config.dmAI) { //没有人发消息时走这里
                    if(main.runTime.dmImgTimeDelay % 5 == 0 ) {
                        var l = CJ.data.defaultDMimg.length;

                        for (var i = 0; i < 1; i++) {
                            var k = parseInt(l * Math.random());
                            CJ.data.showDanMU(CJ.data.defaultDMimg[k]);
                        }
                    }
                    main.runTime.dmImgTimeDelay ++;

                }
            });
},5000);

//弹幕声音

setInterval(function(){
	if(!CJ.runTime.DM_shengyin_show || 1)return false;
         AV.getJSON(main.config.baseURI + '?m=Client&a=getActiveMsg&msgNum=1&msgKey=voice' + main.config.dm, function (data) {

                if(data.length){

                    for (var i in data)
                        CJ.data.showDanMU(data[i]); //.substr(0,15)

                    main.runTime.dmTimeDelay = 0;
                }
            });
},10000);
			



//检查数据是否存在dataCenter中
main.checkData = function (id) {

    if(typeof main.dataCenter[id] != 'undefined')
        return id;
    return false;
};

main.checkUrlCache = function(url,params){
    var params_str = AV.param(params);
    return main.checkData(url +"?"+ params_str);
}

main.insTodataCenter = function(id , data){

        this.dataCenter[id] = data;//console.log(this.dataCenter)

        //更新本地缓存
        //main.LS.setItem('dataCenter.' + id, data);

}

main.getFromdataCenter = function(id){

    if(this.checkData(id))return this.dataCenter[id];

    return false;
    var LSdata = false;
    if( LSdata = main.LS.getItem('dataCenter.'+id )){
        this.dataCenter[id] = LSdata;
        return LSdata;
    }

    return false;
    //更新本地缓存

}



//数据请求及缓存
main.ReqUrl = function(url,data,type){

    return new Promise(function(resolve) {
        var dataId = (url +'?'+ AV.param(data)).replace(/\./g , '_');

        if(main.getFromdataCenter(dataId) === false){

            AV.ajax({
                type: 'get',
                url: main.config.baseURI + url,
                data: data,
                success: function(res){

                    //记录缓存
                   /** main.dataCenter[dataId] = {
                        'url' : url,
                        params : data,
                        'data' : res
                    };  */

                    main.insTodataCenter(dataId ,{
                        'url' : url,
                        params : data,
                        'data' : res
                    });

                    resolve({id:dataId,isAjax:true});
                },
                complete:function(){
                    resolve({id:'complete',isAjax:true});
                },
                dataType: 'json'
            });



        }else{
            resolve({id:dataId,isAjax:false});
        }
    })
};


main.init();


//工具函数

AV.isNullObj = function(obj){
    /*
     for(var i in obj)
     return false;
     return true;
     */
    return !Object.keys(obj).length;
}


//防止刷新页面
window.onbeforeunload = function(event) {
    //(event || window.event).returnValue = "确定退出吗";
}


CJ.data.defaultDM = [];
CJ.data.defaultDMimg = [];
