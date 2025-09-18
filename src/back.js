;(function(){

const Gun = require('./root');
Gun.chain.back = function(n, opt){
	let i;
	let l;
	let tmp;
	const empty = {};
	let u;
	n = n || 1;
	if(-1 === n || Infinity === n){
		return this._.root.$;
	} else
	if(1 === n){
		return (this._.back || this._).$;
	}
	const gun = this
	const at = gun._
	if(typeof n === 'string'){
		n = n.split('.');
	}
	if(n instanceof Array){
		i = 0;
		l = n.length;
		tmp = at;
		for(i; i < l; i++){
			tmp = (tmp||empty)[n[i]];
		}
		if(u !== tmp){
			return opt? gun : tmp;
		} else
		if((tmp = at.back)){
			return tmp.$.back(n, opt);
		}
		return;
	}
	if('function' == typeof n){
		let yes
		let tmp = {back: at}
		while((tmp = tmp.back)
		&& u === (yes = n(tmp, opt))){}
		return yes;
	}
	if('number' == typeof n){
		return (at.back || at).$.back(n - 1);
	}
	return this;
}

}());