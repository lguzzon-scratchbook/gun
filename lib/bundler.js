const fs = require('fs')
const path = require('path')

class Bundler {
  constructor(baseDir = path.join(__dirname, '../')) {
    this.baseDir = baseDir
    this.processedModules = new Set()
  }

  readFile(filePath) {
    try {
      return fs.readFileSync(path.join(this.baseDir, filePath), 'utf8')
    } catch (error) {
      throw new Error(`Failed to read file ${filePath}: ${error.message}`)
    }
  }

  writeFile(filePath, data) {
    try {
      const fullPath = path.join(this.baseDir, filePath)
      const dir = path.dirname(fullPath)

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }

      fs.writeFileSync(fullPath, data, 'utf8')
    } catch (error) {
      throw new Error(`Failed to write file ${filePath}: ${error.message}`)
    }
  }

  fileExists(filePath) {
    return fs.existsSync(path.join(this.baseDir, filePath))
  }

  addIndentation(code, levels = 2) {
    const indentation = '\t'.repeat(levels)
    return code.replace(/\n/g, `\n${indentation}`)
  }

  extractModuleContent(moduleCode) {
    // Remove IIFE wrapper if present
    const iifeMatcher = /^;\(function\(\)\{\s*([\s\S]*?)\s*\}\(\)\);?$/
    const match = moduleCode.match(iifeMatcher)

    if (match) {
      return match[1].trim()
    }

    return moduleCode.trim()
  }

  transformRequiresToUse(code) {
    // Transform require calls back to USE calls
    return code.replace(/\brequire\(/g, 'USE(')
  }

  getModulePath(fullPath, sourceDir) {
    // Convert full path back to relative module path
    const relativePath = path.relative(path.join('./', sourceDir), fullPath)
    // Remove .js extension for the path expression
    return relativePath.replace(/\.js$/, '')
  }

  collectModules(sourceDir) {
    const modules = []
    const srcPath = path.join(this.baseDir, sourceDir)

    if (!fs.existsSync(srcPath)) {
      throw new Error(`Source directory ${sourceDir} does not exist`)
    }

    const collectFromDir = (dirPath, relativePath = '') => {
      const items = fs.readdirSync(dirPath)

      items.forEach(item => {
        const itemPath = path.join(dirPath, item)
        const relativeItemPath = path.join(relativePath, item)
        const stat = fs.statSync(itemPath)

        if (stat.isDirectory()) {
          collectFromDir(itemPath, relativeItemPath)
        } else if (item.endsWith('.js') && item !== 'unbuild.js') {
          const moduleCode = fs.readFileSync(itemPath, 'utf8')
          const cleanContent = this.extractModuleContent(moduleCode)
          const transformedContent = this.transformRequiresToUse(cleanContent)
          const modulePath = this.getModulePath(relativeItemPath, '')

          modules.push({
            path: modulePath,
            content: transformedContent,
            fullPath: relativeItemPath
          })
        }
      })
    }

    collectFromDir(srcPath)
    return modules
  }

  generateModuleWrapper(module) {
    const indentedContent = this.addIndentation(module.content)
    const pathExpression = `'${module.path}'`

    return `;USE(function(module){
${indentedContent}
})(USE, ${pathExpression});`
  }

  generateUnbuildSection(projectName) {
    let unbuildContent = ''

    if (projectName === 'gun') {
      const unbuildPath = path.join(this.baseDir, 'src/polyfill/unbuild.js')
      if (fs.existsSync(unbuildPath)) {
        const unbuildCode = fs.readFileSync(unbuildPath, 'utf8')
        unbuildContent = this.addIndentation(unbuildCode, 1)
      }
    }

    return unbuildContent ? `/* UNBUILD */
${unbuildContent}
/* UNBUILD */` : ''
  }

  generateBundleHeader(projectName) {
    const timestamp = new Date().toISOString()
    return `/*!
 * ${projectName}.js - Bundled JavaScript modules
 * Generated on ${timestamp}
 * 
 * This file contains bundled modules that can be unbundled using the unbundler.
 */
`
  }

  generateUseFunction() {
    return `
// USE function for module loading
var USE = (function(){
  var modules = {};
  var USE = function(module, path) {
    if(!module) return USE;
    if(typeof module === 'function') {
      modules[path || 'main'] = module;
      return USE;
    }
    return modules[module] || function(){};
  };
  return USE;
}());
`
  }

  bundle(projectName) {
    console.log("bundle:", `${projectName}.js`)

    try {
      const sourceDir = projectName === 'gun' ? 'src' : projectName

      // Collect all modules
      const modules = this.collectModules(sourceDir)
      console.log(`Found ${modules.length} modules to bundle`)

      // Generate bundle content
      let bundleContent = this.generateBundleHeader(projectName)
      // bundleContent += this.generateUseFunction()

      // Add unbuild section if needed
      const unbuildSection = this.generateUnbuildSection(projectName)
      if (unbuildSection) {
        bundleContent += '\n' + unbuildSection + '\n'
      }

      // Add all modules
      modules.forEach(module => {
        console.log("bundle: adding", module.fullPath)
        bundleContent += '\n' + this.generateModuleWrapper(module) + '\n'
      })

      // Add initialization code
      bundleContent += `
// Initialize main module
if(typeof module !== 'undefined' && module.exports) {
  module.exports = USE('main') || USE;
} else if(typeof window !== 'undefined') {
  window.${projectName.toUpperCase()} = USE('main') || USE;
}
`

      // Write the bundled file
      this.writeFile(`${projectName}.js`, bundleContent)
      console.log(`Successfully bundled ${modules.length} modules into ${projectName}.js`)

    } catch (error) {
      console.error("Bundle failed:", error.message)
      process.exit(1)
    }
  }

  // Utility method to create a basic project structure
  createProjectStructure(projectName) {
    const sourceDir = projectName === 'gun' ? 'src' : projectName

    // Create directories
    if (!fs.existsSync(path.join(this.baseDir, sourceDir))) {
      fs.mkdirSync(path.join(this.baseDir, sourceDir), { recursive: true })
    }

    if (projectName === 'gun') {
      ['polyfill', 'adapters'].forEach(subdir => {
        const dirPath = path.join(this.baseDir, sourceDir, subdir)
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true })
        }
      })
    }

    // Create a sample main module if none exists
    const mainModulePath = path.join(this.baseDir, sourceDir, 'main.js')
    if (!fs.existsSync(mainModulePath)) {
      const sampleContent = `;(function(){
  // Main ${projectName} module
  console.log('${projectName} initialized');
  
  // Export the main functionality
  if(typeof module !== 'undefined' && module.exports) {
    module.exports = { version: '1.0.0' };
  }
}());`

      fs.writeFileSync(mainModulePath, sampleContent)
      console.log(`Created sample main module at ${sourceDir}/main.js`)
    }
  }
}

// CLI interface
function main() {
  const command = process.argv[2]
  const projectName = process.argv[3] || 'gun'

  const bundler = new Bundler()

  switch (command) {
    case 'init':
      bundler.createProjectStructure(projectName)
      console.log(`Initialized project structure for ${projectName}`)
      break

    case 'bundle':
    default:
      bundler.bundle(projectName)
      break
  }
}

if (require.main === module) {
  main()
}

module.exports = Bundler
