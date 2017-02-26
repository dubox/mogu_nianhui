define(['cocosRes' ,'cocos'], function (res ) {

var mainScene = {};

    var bgLayer = cc.Layer.extend({
        ctor:function(){
            this._super();
			
			//cc.director.runScene(new mainScene.scene2(function(){}));
			//return false;
			
			
			CJ.runTime.layerNow = this;

            var _this = this;


            var bg = cc.Sprite.create(res.bg);
            bg.setPosition(CJ.WINSIZE.width / 2, CJ.WINSIZE.height / 2);
            bg.setScaleX(CJ.WINSIZE.width / bg.width);
            bg.setScaleY(CJ.WINSIZE.height / bg.height);
            this.addChild(bg, 0);
//this.setColor( cc.color(8,128,128,110));


            var mainNode =  CJ.view.mainNode = new cc.Sprite();

            mainNode.setContentSize(CJ.conf.contentSize.width, CJ.conf.contentSize.height);
            mainNode.setPosition(CJ.WINSIZE.width / 2, CJ.WINSIZE.height / 2);
            this.addChild(mainNode, 0);


            //logo
            var logo = cc.Sprite.create(res.txt_logo);
            logo.setScale(0.6);
            logo.setPosition( -(CJ.WINSIZE.width-mainNode.width)/2 + 250 , mainNode.height - 50);
            mainNode.addChild(logo, 0);

            //扫码抽奖文字
            /**
            var txt_saoma = cc.Sprite.create(res.txt_saoma);
			txt_saoma.setScale(0.8);
            //txt_saoma.setAnchorPoint(0,1);
            txt_saoma.setPosition(mainNode.width /2 , mainNode.height/2 - 200);
            mainNode.addChild(txt_saoma, 0);
             **/





            //进入抽奖按钮
            var btn_enter = new cc.MenuItemImage(
                res.btn_enter,
                res.btn_enter,
                function(btn){
                    CJ.runTime.sign = false; //停止接受签到
                cc.director.runScene(new mainScene.scene2());
            }, this);
            btn_enter.attr({
                x:mainNode.width /2,
                y: mainNode.height/2
            });
            var m_m = new cc.Menu(btn_enter);
            m_m.attr({x:0,y:0});
            mainNode.addChild(m_m, 2);

            //this.initPhysics();


            return true;

        },

        addUserSprite:function(userData){
            var index = userData.index;


                var clip = mainScene.cliper(res.clip1); //创建蒙板

                var userSprite = new cc.Sprite(userData.imgData); //用户头像精灵（被遮罩）
//cc.log(clip);
                var row = Math.ceil( (index + 1)/10 );
                var col = (index + 1) % 10;
                if(!col)  col = 10;

                if(col == 10 && row >= 5){
                    //向上滚动一行
                    CJ.view.signBoard.runAction(

                    cc.sequence(
                        cc.moveBy(0 ,cc.p(0,110)),
                        cc.callFunc(function(){

                            for(var i=0;i<10;i++){
                                CJ.view.signBoard.getChildByName('u'+((row-5)*10 + i)).removeFromParent(true);
                            }
                        })
                    )

                    );
                }

                userSprite.attr({
                    scaleX: 100 / userSprite.width,
                    scaleY: 100 / userSprite.height,
                });
				
                //console.log(userSprite.x +'@@'+userSprite.y);
                clip.addChild(userSprite, 0 );
                clip.attr({
                    anchorX:0.5,
                    anchorY:0.5,
                    x:  (col-1) * 110 + 100/2,
                    y: - (  (row-1) * 110 + 100/2)
                });


                CJ.view.signBoard.addChild(clip,0 ,'u'+index);


        },

        /***
         * 初始化物理世界
         *
         *
         */
        initPhysics: function () {

            this.DEBUG_NODE_SHOW = false; //物理形状debug框

            var winSize = cc.winSize;


            this.space = new cp.Space();
            this.setupDebugNode();


            // 设置重力
            this.space.gravity = cp.v(-5, 0);

            /**
            // 设置空间边界  (墙)
            var staticBody = this.space.staticBody;
            var wall_bottom = new cp.SegmentShape(staticBody, cp.v(0, -20), cp.v(winSize.width, -20), 20);
            var wall_top = new cp.SegmentShape(staticBody, cp.v(0, winSize.height), cp.v(winSize.width, winSize.height), 20);
            var wall_left = new cp.SegmentShape(staticBody, cp.v(0, 0), cp.v(0, winSize.height), 20);
            var wall_right = new cp.SegmentShape(staticBody, cp.v(winSize.width, 0), cp.v(winSize.width, winSize.height), 20);

            var walls = [wall_bottom, wall_top, wall_left, wall_right];
            for (var i = 0; i < walls.length; i++) {
                var shape = walls[i];
                shape.setElasticity(1);
                shape.setFriction(1);
                shape.setCollisionType(1);
                this.space.addStaticShape(shape);
            }

            //碰撞检测
            this.space.addCollisionHandler(1, 2,
                this.collisionEvent.Begin,
                this.collisionEvent.PreSolve,
                this.collisionEvent.PostSolve,
                this.collisionEvent.Separate
            );
            //碰撞检测
            this.space.addCollisionHandler(2, 2,
                this.collisionEvent.Begin,
                this.collisionEvent.PreSolve,
                this.collisionEvent.PostSolve,
                this.collisionEvent.Separate
            );
 **/

            this.scheduleUpdate();  //调用update函数
        },
        collisionEvent: {



            Begin: function (arbiter, space) {
                //cc.log(arbiter)
                // cc.audioEngine.playEffect(res.ding);

                if(typeof arbiter.b.crashNum == 'undefined'){
                    arbiter.b.crashNum = 0;
                }else{
                    arbiter.b.crashNum ++;
                }
                if(arbiter.b.crashNum > 3)return false; //碰撞3次 第四次掉出去

                return true;
            },
            PreSolve: function () {
                return true;
            },
            PostSolve: function () {
                return true;
            },
            Separate: function () {
                return true;    //必须return true
            },

        },

        setupDebugNode: function () {
            this._debugNode = new cc.PhysicsDebugNode(this.space);
            this._debugNode.visible = this.DEBUG_NODE_SHOW;
            this.addChild(this._debugNode);
        },

       

        textSpriteArr:[],    //文字精灵容器
        physicsSpriteArr:[],    //物理文字对象容器

        /**
         * 添加物理文字
         * @param text
         * @param p
         */
        addPhysicsTextSprite: function (str  , p) {

            var text = new cc.LabelTTF(str, "Arial", 38);

            //Body(重量 , 惯性)
            var body = new cp.Body((str.length * 0.1), cp.momentForBox(2, text.width, text.height));
            body.setPos(p);
            body.setAngVel(0.1);	//初始角速度
            body.setVel({x: 1, y: 1});	//初始线速度
            this.space.addBody(body );


            var shape = new cp.BoxShape(body, text.width, text.height);
            shape.setElasticity(0.5);  //弹性
            shape.setFriction(0.2);  //摩擦力
            shape.setCollisionType(2);  //设置形状的碰撞类别 用于碰撞检测，默认所有形状都是类别0
            this.space.addShape(shape);


            //创建物理引擎精灵对象
            var sprite = new cc.PhysicsSprite();
            sprite.addChild(text);
            sprite.setBody(body);
            sprite.setPosition(cc.p(p.x, p.y));
            this.addChild(sprite );


            this.physicsSpriteArr.push({
                'body':body,
                'shape':shape,
                'sprite':sprite,
            });

        },

        removeSpriteOverflow: function () {
            for(var i in this.physicsSpriteArr){//cc.log(this.physicsSpriteArr[i].sprite.y)
                if(this.physicsSpriteArr[i].sprite.y < -40) {
                    this.space.removeBody(this.physicsSpriteArr[i].body);
                    this.space.removeShape(this.physicsSpriteArr[i].shape);
                    this.physicsSpriteArr[i].sprite.removeFromParent(true);
                    this.physicsSpriteArr.splice(i, 1);cc.log('remove:'+i);
                }
            }
        },

        update: function (dt) {
            var timeStep = 0.09; // cc.log(timeStep)
            this.space.step(timeStep);
            this.removeSpriteOverflow();
        }
    });

    mainScene.scene1 = cc.Scene.extend({
        ctor:function(resolve) {
            this._super();
            //this.setCascadeColorEnabled(true);
            //this.setCascadeOpacityEnabled(true);
            //this.setColor( cc.color(8,128,128,0));
            this.resolve = resolve;
        },
            onEnter:function (resolve) {
                this._super();
                CJ.WINSIZE = cc.director.getWinSize();console.log(CJ.WINSIZE);


                this.addChild(mainScene.bgLayer = new bgLayer(), 0);
                //this.addChild(mainScene.physicsLayer = new physicsLayer(), 0);
                this.resolve(); //Promise 回调

            }
    });



    //抽奖界面
    var gameLayer = cc.Layer.extend({

        ctor:function() {
            this._super();
			
			CJ.runTime.layerNow = this;

            var bg = cc.Sprite.create(res.bg);
            bg.setPosition(CJ.WINSIZE.width / 2, CJ.WINSIZE.height / 2);
            bg.setScaleX(CJ.WINSIZE.width / bg.width);
            bg.setScaleY(CJ.WINSIZE.height / bg.height);
            this.addChild(bg, 0);



            var mainNode =  CJ.view.mainNode2 = new cc.Sprite();

            mainNode.setContentSize(CJ.conf.contentSize.width, CJ.conf.contentSize.height);
            mainNode.setPosition(CJ.WINSIZE.width / 2, CJ.WINSIZE.height / 2);
            this.addChild(mainNode, 0);

            //logo
			/**
            var logo = cc.Sprite.create(res.txt_logo);
            logo.setScale(1.5);
            logo.setAnchorPoint(0,1);
            logo.setPosition(557 , mainNode.height - 125);
            mainNode.addChild(logo, 0);
			**/

            //扫码抽奖文字
            /**
            var txt_saoma = cc.Sprite.create(res.txt_saoma);
            txt_saoma.setAnchorPoint(0,1);
            txt_saoma.setPosition(157 , mainNode.height - 190);
            mainNode.addChild(txt_saoma, 0);

             **/
            //logo
            var txt_logo = cc.Sprite.create(res.txt_logo);
            //txt_logo.setAnchorPoint(0,1);
            txt_logo.setScale(0.6);
            txt_logo.setPosition( -(CJ.WINSIZE.width-mainNode.width)/2 + 250 , mainNode.height - 50);
            mainNode.addChild(txt_logo, 0);
			
			
			//提示文字
                var tips_txt = cc.LabelTTF.create('Tips：向微信公众号发送文字（#2017#你想说的话）或图片参与弹幕互动', "微软雅黑", 16 );
                tips_txt.setFontFillColor(cc.color('#425466'));
                tips_txt.setAnchorPoint(0,0);
                tips_txt.setPosition(10, 5);
                this.addChild(tips_txt, 0);
            
            
            //抽奖面板
            var s_panel = cc.Sprite.create(res.s_panel);
            s_panel.setAnchorPoint(0.5,1);
            s_panel.setPosition(mainNode.width/2 , mainNode.height - 300);
            mainNode.addChild(s_panel, 0);
            
            //抽奖面板子元素
                //奖池人数
                var label_1 = cc.LabelTTF.create("奖池人数", "微软雅黑", 36);
                label_1.setAnchorPoint(0,1);
                label_1.setPosition(78, s_panel.height -90);
                s_panel.addChild(label_1, 0);
                
                //奖池人数 数字
                var label_2 = cc.LabelTTF.create(CJ.data.user.length, "微软雅黑", 60 );
                label_2.setFontFillColor(cc.color('#ffe400'));
                label_2.setAnchorPoint(0,1);
                label_2.setPosition(100, s_panel.height -155);
                s_panel.addChild(label_2, 0);
                CJ.view.lotteryNumLabel = label_2;
            
                //滚动头像
                var uLi = new cc.Sprite();
                uLi.setContentSize(510,180);
                uLi.attr({
                    anchorX:0,
                    anchorY:0.5,
                    x: 268,
                    y: s_panel.height/2,
                });
                //头像蒙板 (大头像 用于滚动效果)
                var clip = mainScene.cliper(res.clip2);
                clip.attr({x:90,y: uLi.height/2});
                uLi.addChild(clip ,0);

                //默认头像
                this.getUserSprite({imgData:res.icon_big_0} , function(defUserSprite){
                    defUserSprite.y = 0;
                    clip.addChild(defUserSprite, 0 );
                });

            
            //昵称(抽奖区)
                var nickname = cc.LabelTTF.create('XXXXXXXX', "微软雅黑", 72);
                nickname.setAnchorPoint(0,0.5);
                nickname.setPosition(200, uLi.height /2);
                uLi.addChild(nickname, 1);
                this.nickname = nickname;
                
                s_panel.addChild(uLi, 0);
                this.clip = clip;
                
                
              
              //抽奖按钮
            var btn_run = new cc.MenuItemImage(
                res.btn_run,res.btn_stop, this);
            var btn_stop = new cc.MenuItemImage(
                res.btn_stop,res.btn_run, this);
            
            var btn_cj = new cc.MenuItemToggle(
                    btn_run,
                    btn_stop,
                    function(btn){
                    if(btn.getSelectedIndex()){
                        this.chouJiang();
                    }else{
                        this.chouJiang(false);
                    }
                    
                }, this);
            btn_cj.attr({
                anchorX:1,
                anchorY:0,
                x: s_panel.width - 30,
                y: 15
            });
			
            var m_m = new cc.Menu(btn_cj);
            m_m.attr({x:0,y:0});
            s_panel.addChild(m_m, 0);
			
			var menu_ctrl = new cc.Menu(
				mainScene.switchBtn(res.btn_jiangpin,res.btn_jiangpin2,{x:20,y:50,scaleX:0.8,scaleY:0.8},function(k){s_panel.setVisible(k);}),
				mainScene.switchBtn(res.btn_wenzi,res.btn_wenzi2,{x:20 + 50,y:50,scaleX:0.8,scaleY:0.8},function(k){CJ.runTime.DM_wenzi_show = k;}),
				mainScene.switchBtn(res.btn_zhaopian,res.btn_zhaopian2,{x:20 + 50*2,y:50,scaleX:0.8,scaleY:0.8},function(k){CJ.runTime.DM_tupian_show = k;}),
				mainScene.switchBtn(res.btn_shengyin,res.btn_shengyin2,{x:20 + 50*3,y:50,scaleX:0.8,scaleY:0.8},function(k){CJ.runTime.DM_shengyin_show = k;})
			);
			menu_ctrl.attr({x:0,y:0});
            mainNode.addChild(menu_ctrl, 0);
			
			
			
			


/**
            //中奖区  蒙板
            var lotteryBoardClip =  mainScene.cliper(res.lotteryBoard ); //创建蒙板

            //signBoard.setContentSize(1100, 330);
            lotteryBoardClip.setPosition(mainNode.width / 2, 200);
            mainNode.addChild(lotteryBoardClip, 0);

            var lotteryBoard =  CJ.view.lotteryBoard =  new cc.Sprite(); //创建蒙板

            lotteryBoard.setContentSize(1, 1);
            lotteryBoard.setPosition(-1100/2, 220/2);
            lotteryBoardClip.addChild(lotteryBoard, 0);
            
**/
            
            
            CJ.runTime.animIndex = -1;  // 中奖编号

            //从缓存中读取中奖用户
            //this.setLotteryByArr(main.getFromdataCenter('userLottery'));
        },

        //批量设置中奖用户
        setLotteryByArr:function(userLottery){
            //var userLottery = ;

            if(typeof userLottery == 'undefined' || !userLottery)return false;

            for (var i in userLottery){

                userLottery[i].imgData = 0; //img对象格式化后不能使用

                //在滚动区显示当前中奖用户
                this.getUserSprite( userLottery[i] ,function(userSprite){
                    this.clip.addChild(userSprite, 0 );
                    userSprite.runAction(cc.moveTo(0.1, cc.p(0 ,0)));
                });



                CJ.view.lotteryNumLabel.setString(CJ.data.user.length);  //更新奖池人数

                CJ.data.user.splice(userLottery[i].index , 1); //从用户池中删除
                CJ.data.userLottery.push(userLottery[i]);   //压入中奖用户池
                CJ.view.lotteryNumLabel.setString(CJ.data.user.length);  //更新奖池人数

                //中奖区显示

                //this.showUserLottery( userLottery[i] );
            }



        },
        
        chouJiang:function(run ){
            var _this = this;

            if(CJ.data.user.length <1)return false;

            this.chouJiangAnim(run);
            if(run === false){

                //在滚动区显示当前中奖用户
                this.getUserSprite(CJ.data.user[CJ.runTime.animIndex] ,function(userSprite){
                    _this.clip.addChild(userSprite, 0 );
                    userSprite.runAction(cc.moveTo(0.1, cc.p(0 ,0)));
                });


                var LotteryData = CJ.data.user.splice(CJ.runTime.animIndex , 1)[0]; //从用户池中删除
                CJ.data.userLottery.push(LotteryData);   //压入中奖用户池
                main.insTodataCenter('userLottery',CJ.data.userLottery); //缓存
                //main.insTodataCenter('CJuser',CJ.data.user); //缓存

                CJ.view.lotteryNumLabel.setString(CJ.data.user.length);  //更新奖池人数

                //中奖区显示
                //this.showUserLottery(LotteryData);
            }
        },
        
        chouJiangAnim:function(run){
            var _this = this;


            if(run === false){
                CJ.runTime.animRun = false;
                return false;
            }
			
			//
			this.clip.removeAllChildren(true);
			
            CJ.runTime.animRun = true;
            
            CJ.runTime.animIndex ++;
            
            if(CJ.runTime.animIndex >= CJ.data.user.length)
            CJ.runTime.animIndex = 0;
            
            
            this.getUserSprite(CJ.data.user[CJ.runTime.animIndex] , function(userSprite){
                if(!userSprite) return false;

                _this.clip.addChild(userSprite, 0 );
                userSprite.runAction(
                    cc.sequence( cc.moveTo(0.1, cc.p(0 ,0)),
                        cc.callFunc(function(){
                            if(CJ.runTime.animRun)
                                _this.chouJiang();
                        }),
                        cc.moveTo(0.1, cc.p(0 ,180)),
                        cc.callFunc(function(){
                            userSprite.removeFromParent(true)})
                    )

                );
                _this.nickname.setString( CJ.data.user[CJ.runTime.animIndex].nickname);
            });


            
            
            
        },
        
        //大头像 用于滚动
        getUserSprite:function(userData , callback){
            
            
            //clip.setContentSize(230,230);
            if(typeof userData == 'undefined' || !userData.imgData)
            return false;

            var createUserSprite = new Promise(function(resolve){
                if(typeof userData.imgData != 'undefined' && userData.imgData) {
                    //var userSprite = cc.Sprite.create(userData.imgData); //用户头像精灵（被遮罩）
                    resolve(cc.Sprite.create(userData.imgData));
                }else{
                    cc.loader.loadImg(userData.headimgurl, function (e, data) {
                        userData.imgData = data;
                        resolve(cc.Sprite.create(data));
                    });
                }
            });
            createUserSprite.then(function(userSprite) {
                userSprite.attr({
                    scaleX: CJ.conf.userImgGt.width / userSprite.width,
                    scaleY: CJ.conf.userImgGt.height / userSprite.height,
                    x: 0,
                    y: -180,
                });
                callback(userSprite);
            });
            //console.log(userSprite.x +'@@'+userSprite.y);
            
            //return userSprite
            
        },


        //在中奖区 显示用户头像
        showUserLottery:function(userData){

            //var userData = CJ.data.user[_index];    //取用户信息
            cc.log(userData);
            
            var index = CJ.data.userLottery.length - 1;
            
            var clip = mainScene.cliper(res.clip1); //创建蒙板
            //clip.setContentSize(230,230);

            var createUserSprite = new Promise(function(resolve){
                if(typeof userData.imgData != 'undefined' && userData.imgData) {
                    //var userSprite = cc.Sprite.create(userData.imgData); //用户头像精灵（被遮罩）
                    resolve(cc.Sprite.create(userData.imgData));
                }else{
                    cc.loader.loadImg(userData.headimgurl, function (e, data) {
                        userData.imgData = data;
                        resolve(cc.Sprite.create(data));
                    });
                }
            });

            createUserSprite.then(function(userSprite){
                var row = Math.ceil( (index + 1)/10 );
                var col = (index + 1) % 10;
                if(!col)  col = 10;
                userSprite.attr({
                    scaleX: CJ.conf.userImgLt.width / userSprite.width,
                    scaleY: CJ.conf.userImgLt.height / userSprite.height,
                });


                if(col == 10 && row >= 2){
                    //向上滚动一行
                    CJ.view.lotteryBoard.runAction(

                        cc.sequence(
                            cc.moveBy(0.5 ,cc.p(0,165)),
                            cc.callFunc(function(){

                                for(var i=0;i<10;i++){
                                    CJ.view.lotteryBoard.getChildByName('u'+((row-2)*10 + i)).removeFromParent(true);
                                    CJ.view.lotteryBoard.getChildByName('n'+((row-2)*10 + i)).removeFromParent(true);
                                }
                            })
                        )

                    );
                }


                //console.log(userSprite.x +'@@'+userSprite.y);
                clip.addChild(userSprite, 0 );
                clip.attr({
                    anchorX:0.5,
                    anchorY:0.5,
                    //x: 95 + (col-1) * 110 + CJ.conf.userImgLt.width/2,
                    //y: CJ.view.mainNode.height - ( 650 + (row-1) * 160 + CJ.conf.userImgLt.height/2)
                    x:  (col-1) * 110 + 50,
                    y: - (  (row-1) * 165 )
                });
                //昵称
                var nickname = cc.LabelTTF.create(userData.nickname, "微软雅黑", 18 ,cc.size(100,20));
                nickname.setAnchorPoint(0,1);
                nickname.setPosition(clip.x -CJ.conf.userImgLt.width/2, clip.y - CJ.conf.userImgLt.height/2 - 5);
                CJ.view.lotteryBoard.addChild(nickname, 0,'n'+index);

                CJ.view.lotteryBoard.addChild(clip,0,'u'+index);

            });


        },
        


    });

	
	//直接进入抽奖场景
	
    mainScene.scene2 = cc.Scene.extend({
		ctor:function(resolve) {
            this._super();
            this.resolve = resolve;
        },
        onEnter:function () {
            this._super();
			CJ.WINSIZE = cc.director.getWinSize();
            this.addChild(mainScene.gameLayer = new gameLayer(), 0);

            //this.addChild(mainScene.physicsLayer = new physicsLayer(), 0);
            this.resolve(); //Promise 回调
        }
    });

    mainScene.cliper = function(frameName ){

        //创建一个遮罩的模板

        var sten = new cc.Sprite(frameName);

        //创建一个ClippingNode 并设置一些基础属性 容器宽高与模板有关

        var clipnode = new cc.ClippingNode();


        clipnode.attr({

            stencil:sten,

            anchorX:0,

            anchorY:0.5,

            alphaThreshold:0.5,//设置裁剪透明值阀值 默认值为1

        });

        return clipnode;

    }
	
	
	mainScene.switchBtn = function(imgRun,imgStop,attr,callback){
		
		var btn_run = new cc.MenuItemImage(
                imgRun,imgStop, this);
            var btn_stop = new cc.MenuItemImage(
                imgStop,imgRun, this);
            
            var btn_cj = new cc.MenuItemToggle(
                    btn_run,
                    btn_stop,
                    function(btn){
						if(btn.getSelectedIndex()){
							callback(0);
						}else{
							callback(1);
						}
                    
                }, this);
            btn_cj.attr(attr);
		return btn_cj;
	}
	
	 /**
         * 对外接口 向屏幕外右侧随机位置添加弹幕文字
         *
         * @param str
         */
        CJ.view.addDanmuText = function (str) {

            var x = cc.winSize.width + 300;
            var y = (cc.winSize.height - 60) * Math.random() + 30;
            var p = cc.p(x , y );

            //this.addPhysicsTextSprite(str, p);
            var text = new cc.LabelTTF(str, "黑体", 40 * Math.random() + 50);

            text.setPosition(p);
            text.setFontFillColor( cc.color(155 * Math.random()+150 ,155 * Math.random()+150 ,155 * Math.random()+150 ,155 * Math.random()+100));

            text.runAction(
                cc.sequence(
                    cc.moveTo(15 * Math.random() + 8, cc.p(-300 , y )),
                    cc.callFunc(function(){
                        text.removeFromParent(true);
                    })
                )

            );


            return text;

        };
		
		
		/**
         * 对外接口 向屏幕外右侧随机位置添加弹幕图片
         *
         * @param str
         */
        CJ.view.addDanmuImg = function (str) {

            var x = cc.winSize.width + 500;
            var y = (cc.winSize.height - 400) * Math.random() + 200;
            var p = cc.p(x , y );

            cc.loader.loadImg(str, function (e, data) {
                        //userData.imgData = data;
                        var img = cc.Sprite.create(data);
						img.setPosition(p);
						//img.attr({scale:0.4 * Math.random() + 0.3 });
						img.attr({scale:(300 * Math.random() + 300)/img.height });
						var duration = 15 * Math.random() + 8;
						img.runAction(
							cc.sequence(
								cc.spawn( cc.moveTo(duration, cc.p(-500 , y )),
										//cc.scaleBy(duration/2,0.5,0.5),
										cc.sequence(
											//
											cc.rotateTo(duration/3, 15.0 * Math.random()),
											cc.rotateTo(duration/3, -15.0 * Math.random())
										)
								)
								,
								cc.callFunc(function(){
									img.removeFromParent(true);
								})
							)

						);
						CJ.runTime.layerNow.addChild(img);
                    });

        };
		
        CJ.view.addUser = function(userData){
            var _this = this;
            
            if(typeof userData.imgData == 'undefined') {
                //clip.setContentSize(230,230);
                cc.loader.loadImg(userData.headimgurl, function (e, data) {
                    userData.imgData = data;
                    //_this.addUserSprite(userData);

                    //main.insTodataCenter('CJuser.'+userData.index , userData);
                });
            }else{
                //_this.addUserSprite(userData);
            }
            

        };

        return mainScene;

    } );



 
/**

var pageView = new ccui.PageView();
        pageView.setTouchEnabled(true);
        pageView.setContentSize(120,380);
        pageView.setPosition(110,400);

//        var Layout = new ccui.Layout();
//        Layout.setContentSize(120,380);
//        pageView.addChild(Layout);

        this._layer1=new BaseLayerBG(120,380);

        pageView.addChild( this._layer1);

        this.addChild(pageView);

 **/