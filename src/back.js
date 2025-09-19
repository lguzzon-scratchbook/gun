;(()=> {

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
	const at = this._
	if(typeof n === 'string'){
		n = n.split('.');
	}
	if(Array.isArray(n)){
		i = 0;
		l = n.length;
		tmp = at;
		for(i; i < l; i++){
			tmp = (tmp||empty)[n[i]];
		}
		if(u !== tmp){
			return opt? this : tmp;
		} else {
			tmp = at.back;
			if(tmp){
				return tmp.$.back(n, opt);
			}
		}
		return;
	}
	if('function' === typeof n){
		let yes;
		let tmp = {back: at};
		while(tmp.back){
			tmp = tmp.back;
			yes = n(tmp, opt);
			if(u !== yes) break;
		}
		return yes;
	}
	if('number' === typeof n){
		return (at.back || at).$.back(n - 1);
	}
	return this;
}

})();