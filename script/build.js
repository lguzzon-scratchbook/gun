var fs = require('fs');
var path = require('path');

var dir = __dirname + '/../';

var read = function(p){
	return fs.readFileSync(path.join(dir, p)).toString();
}

var write = function(p, data){
	return fs.writeFileSync(path.join(dir, p), data);
}

// Prefix
var useContent = read('src/polyfill/unbuild.js');
var prefix = `;(function(){

  /* UNBUILD */
${useContent}
  /* UNBUILD */

`;

// Modules in order
var modules = ['shim', 'onto', 'book', 'valid', 'state', 'dup', 'ask', 'root', 'back', 'chain', 'get', 'put','core', 'index', 'on', 'map', 'set', 'mesh', 'websocket', 'localStorage'];

var processModule = function(name){
	var code = read('src/' + name + '.js');
	// Remove outer IIFE
	code = code.replace(/^;?\s*\(\s*\(\s*\(\s*\)\s*=>\s*{s*/, '').replace(/\s*\}\s*\)\s*\(\s*\)\s*\)\s*;?$/, '');
	code = code.replace(/^;?\s*\(\s*\(\s*\)\s*=>\s*{s*/, '').replace(/\s*\}\s*\)\s*\(\s*\)\s*;?$/, '');
	code = code.replace(/^;?\s*\(function\s*\(\s*\){\s*/, '').replace(/\s*\}\s*\(\s*\)\s*\);?$/, '');
	// Replace require with USE
	code = code.replace(/\brequire\(/g, 'USE(');
	// Indent with two spaces
	code = code.split('\n').map(line => (line==='')?'':'\t\t' + line).join('\n');
	// Wrap
	return `\t;USE(function(module){
${code}
\t})(USE, './${name}');

`;
};

// Build modules
var modulesCode = '';
modules.forEach(function(mod){
	modulesCode += processModule(mod);
});

// Suffix
var suffix = `

}());

` + read('src/footer.js');

// Combine
var output = prefix + modulesCode + suffix;

// Write to gun.js
write('gun.js', output);

console.log('Built gun.js successfully.');