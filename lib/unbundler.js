const fs = require('fs')
const path = require('path')
const fsrm = require('./fsrm')

class Unbundler {
  constructor(baseDir = path.join(__dirname, '../')) {
    this.baseDir = baseDir
    this.currentText = ''
  }

  // File system operations
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

      // Ensure directory exists
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }

      fs.writeFileSync(fullPath, data, 'utf8')
    } catch (error) {
      throw new Error(`Failed to write file ${filePath}: ${error.message}`)
    }
  }

  createDirectory(dirPath) {
    const fullPath = path.join(this.baseDir, dirPath)
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true })
    }
  }

  renameIfNotExists(oldPath, newPath) {
    const fullOldPath = path.join(this.baseDir, oldPath)
    const fullNewPath = path.join(this.baseDir, newPath)

    if (fs.existsSync(fullNewPath)) {
      return false // Target already exists
    }

    if (fs.existsSync(fullOldPath)) {
      fs.renameSync(fullOldPath, fullNewPath)
      return true
    }

    return false // Source doesn't exist
  }

  // Text parsing utilities
  extractBetween(text, startDelimiter, endDelimiter = startDelimiter) {
    const startIndex = text.indexOf(startDelimiter)
    if (startIndex === -1) {
      return null
    }

    const contentStart = startIndex + startDelimiter.length
    const endIndex = text.indexOf(endDelimiter, contentStart)

    if (endIndex === -1) {
      return null
    }

    return {
      startIndex: contentStart,
      content: text.slice(contentStart, endIndex),
      endIndex: endIndex
    }
  }

  getNextSection(startDelimiter, endDelimiter = startDelimiter) {
    if (!this.currentText) {
      this.currentText = startDelimiter
      return null
    }

    const result = this.extractBetween(this.currentText, startDelimiter, endDelimiter)
    if (!result) {
      return null
    }

    // Update currentText to continue from after the end delimiter
    this.currentText = this.currentText.slice(result.endIndex + endDelimiter.length)
    return result.content
  }

  parseModulePath(sourceDir = 'src') {
    const pathExpression = this.getNextSection(',', ')')
    if (!pathExpression) {
      return null
    }

    let modulePath
    try {
      // Safely evaluate the path expression
      modulePath = eval(pathExpression)
    } catch (error) {
      console.warn(`Failed to evaluate path expression: ${pathExpression}`, error)
      return null
    }

    if (!modulePath) {
      return null
    }

    // Ensure .js extension
    if (!modulePath.endsWith('.js')) {
      modulePath += '.js'
    }

    return path.join('./', sourceDir, modulePath)
  }

  removeIndentation(code, levels = 2) {
    const tabPattern = new RegExp(`\\n\\t{${levels}}`, 'g')
    return code.replace(tabPattern, '\n')
  }

  setupDirectories(projectName) {
    if (projectName === 'gun') {
      this.renameIfNotExists('./src', './old_src')
      this.createDirectory('./src')
      this.createDirectory('./src/polyfill')
      this.createDirectory('./src/adapters')
    } else {
      this.renameIfNotExists(`./${projectName}`, `./old_${projectName}`)
      this.createDirectory(`./${projectName}`)
    }
  }

  processModules(projectName) {
    const sourceDir = projectName === 'gun' ? 'src' : projectName
    const modules = []

    while (true) {
      const moduleCode = this.getNextSection(";USE(function(module){", "})(USE")
      if (!moduleCode) {
        break
      }

      const modulePath = this.parseModulePath(sourceDir)
      if (!modulePath) {
        continue
      }

      // Transform USE calls to require calls
      const transformedCode = moduleCode.replace(/\bUSE\(/g, 'require(')
      const cleanedCode = this.removeIndentation(transformedCode)

      // Wrap in IIFE
      const wrappedCode = `;(function(){\n${cleanedCode}\n}());`

      modules.push({ path: modulePath, code: wrappedCode })
    }

    return modules
  }

  writeModules(modules) {
    modules.forEach(({ path: modulePath, code }) => {
      let existingCode = ''
      try {
        existingCode = this.readFile(`old_${modulePath}`)
      } catch (error) {
        // File doesn't exist, which is fine
      }

      if (existingCode !== code) {
        console.log("unbuild: update", modulePath)
      }

      this.writeFile(modulePath, code)
    })
  }

  cleanup(projectName) {
    const oldDir = projectName === 'gun' ? './old_src' : `./old_${projectName}`
    try {
      fsrm(oldDir)
    } catch (error) {
      console.warn(`Failed to clean up ${oldDir}:`, error.message)
    }
  }

  unbundle(projectName) {
    console.log("unbuild:", `${projectName}.js`)

    try {
      // Setup directory structure
      this.setupDirectories(projectName)

      // Read and initialize the bundled file
      const bundledContent = this.readFile(`${projectName}.js`)
      this.currentText = bundledContent

      // Skip to unbuild section
      const unbuildCode = this.getNextSection("/* UNBUILD */")

      // Handle special case for gun project
      if (projectName === 'gun' && unbuildCode) {
        const cleanedUnbuildCode = this.removeIndentation(unbuildCode, 1)
        this.writeFile('src/polyfill/unbuild.js', cleanedUnbuildCode)
      }

      // Process all modules
      const modules = this.processModules(projectName)
      this.writeModules(modules)

      // Cleanup old directories
      this.cleanup(projectName)

      console.log(`Successfully unbundled ${modules.length} modules`)

    } catch (error) {
      console.error("Unbundle failed:", error.message)
      process.exit(1)
    }
  }
}

// Main execution
function main() {
  const projectName = process.argv[2] || 'gun'
  const unbundler = new Unbundler()
  unbundler.unbundle(projectName)
}

if (require.main === module) {
  main()
}

module.exports = Unbundler
