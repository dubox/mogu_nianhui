


window.fakeStorage = {
	_data: {},

	setItem: function (id, val) {
		return this._data[id] = String(val);
	},

	getItem: function (id) {
		return this._data.hasOwnProperty(id) ? this._data[id] : undefined;
	},

	removeItem: function (id) {
		return delete this._data[id];
	},

	clear: function () {
		return this._data = {};
	}
};

function LocalStorageManager() {
	var supported = this.localStorageSupported();
	this.storage = supported ? window.localStorage : window.fakeStorage;
}

LocalStorageManager.prototype.localStorageSupported = function () {
	var testKey = "test";
	var storage = window.localStorage;

	try {
		storage.setItem(testKey, "1");
		storage.removeItem(testKey);
		return true;
	} catch (error) {
		return false;
	}
};


// Best score getters/setters
LocalStorageManager.prototype.getItem = function (key) {
	var key_arr = key.split('.');

	tmp_item = this.storage.getItem(key_arr[0]) || this.Cookie(key_arr[0]);
	try{
		tmp_item = JSON.parse(tmp_item);
	}catch(e){
		//return 0;
	}

	if(typeof tmp_item == 'undefined' || !tmp_item)return tmp_item;

	if(key_arr.length < 2){	//单key模式
		return tmp_item || false;
	}

	for(var i=1;i<key_arr.length; i++){	//层层取值

		if(tmp_item[key_arr[i]]){
			tmp_item = tmp_item[key_arr[i]];
			continue;
		}
		return false;
	}
	return tmp_item;
};

/***********
 *	dubox 2014/10/25
 *
 *	setItem: 设置localStorage单元值
 *	Key：string 用.分割表示数组 如 a.b.c a为存储单元key b,c为数组一二级key
 *	value：string or obj or array
 *
 ************/
LocalStorageManager.prototype.setItem = function (key,value) {	//key:a.b.c a为Itemkey
	var key_arr = key.split('.');
	var tmp_item;

	if(key_arr.length < 2){	//单key模式
		if(typeof value == 'object'){
			value = JSON.stringify(value);
		}
		this.storage.setItem(key,value);
		this.Cookie(key,value);
		return true;
	}
	console.log('0');
	tmp_item = this.getItem(key_arr[0]);
console.log('1');

	if(typeof tmp_item != 'undefined'){console.log('2');

		var tmp_arr = {};
		tmp_arr[key_arr[0]] = tmp_item;	//key 对应对象中该key以下的部分

		for(var i=1;i<key_arr.length; i++){

			if(i == key_arr.length-1){	//给最后一个key 赋值 value
				tmp_arr[key_arr[i]] = value;
				break;
			}

			if(typeof tmp_item[key_arr[i]] != 'undefined'){
				tmp_item = tmp_item[key_arr[i]];
				tmp_arr[key_arr[i]] = tmp_item;
				continue;
			}
			//为原对象中没有 且 不是 key_arr 中最后一个的 k 赋 {}
			tmp_arr[key_arr[i]] = {};

		}

		for (var i=key_arr.length-1;i>0;i--){
			tmp_arr[key_arr[i-1]][key_arr[i]] = tmp_arr[key_arr[i]];
		}
		tmp_item = tmp_arr[key_arr[0]];
		console.log('3');

	}else{	//创建新的数组序列
		tmp_item = value;
		for (var i=key_arr.length-1;i>=0;i--){
			var t = tmp_item;
			tmp_item = {};	//防止循环引用
			tmp_item[key_arr[i]] = t;
		}
		tmp_item = tmp_item[key_arr[0]];console.log('4');
	}
	if(typeof tmp_item == 'object'){console.log('5');
		tmp_item = JSON.stringify(tmp_item);
	}console.log('6');
	return this.storage.setItem(key_arr[0],tmp_item) || this.Cookie(key_arr[0],tmp_item);
};

LocalStorageManager.prototype.clearItem = function (key){
	this.storage.removeItem(key);
	this.Cookie(key,'');
};

LocalStorageManager.prototype.Cookie = function(name, value, options) {
	if (typeof value != 'undefined') { // name and value given, set cookie
		options = options || {expires:999};
		if (value === null) {
			value = '';
			options.expires = -1;
		}

		var expires = '';
		if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
			var date;
			if (typeof options.expires == 'number') {
				date = new Date();
				date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
			} else {
				date = options.expires;
			}
			expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
		}
		var path = options.path ? '; path=' + options.path : '/';
		var domain = options.domain ? '; domain=' + options.domain : '';
		var secure = options.secure ? '; secure' : '';
		document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
	} else { // only name given, get cookie
		var cookieValue = null;
		if (document.cookie && document.cookie != '') {
			var cookies = document.cookie.split(';');
			for (var i = 0; i < cookies.length; i++) {
				var cookie = cookies[i].trim();
				// Does this cookie string begin with the name we want?
				if (cookie.substring(0, name.length + 1) == (name + '=')) {
					cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
					break;
				}
			}
		}
		return cookieValue;
	}
}

define && define(function(){return new LocalStorageManager();});

