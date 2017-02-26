define( function () {

    var res = {
        path :[],
        'bg' : 'image/bg.jpg',
        'txt_logo' : 'image/txt_logo.png',
        'txt_saoma' : 'image/txt_saoma.png',
        'btn_enter' : 'image/btn_enter.png',
        //'icon_qr' : '',
        'head1' : 'image/head1.png',
        'icon_big_0' : 'image/icon_big_0.png',
        'btn_run' : 'image/btn_run.png',
        'btn_stop' : 'image/btn_stop.png',
        's_panel' : 'image/s_panel.png',
        'clip1' : 'image/clip1.png',
        'clip2' : 'image/clip2.png',
        'signBoard' : 'image/signBoard.png',
        'btn_jiangpin' : 'image/jiangpin.png',
        'btn_jiangpin2' : 'image/jiangpin2.png',
        'btn_wenzi' : 'image/wenzi.png',
        'btn_wenzi2' : 'image/wenzi2.png',
        'btn_zhaopian' : 'image/zhaopian.png',
        'btn_zhaopian2' : 'image/zhaopian2.png',
        'btn_shengyin' : 'image/shengyin.png',
        'btn_shengyin2' : 'image/shengyin2.png',
    };
    for(var i in res){
        if(i != 'path')
        res.path.push(res[i]);
    }

    return res;
});