;(() => {
  const Gun = require('./root')

  const emptyObject = {}
  const validate = Gun.valid
  const undefinedValue = undefined

  /**
   * Retrieves data from the Gun database.
   * @param {string|function|number} key - The key to get, or a callback function, or a number.
   * @param {function|boolean|object} [cb] - The callback function, true for soul extraction, or options object.
   * @param {*} [as] - Additional options or context.
   * @returns {object} The gun chain.
   */
  Gun.chain.get = function (key, cb, as) {
    let nodeChain
    let currentContext
    let nextChains
    let getOptions
    let rootContext
    let listenerId
    let waitList
    if (typeof key === 'string') {
      if (key.length === 0) {
        nodeChain = this.chain()
        nodeChain._.err = { err: Gun.log('0 length key!', key) }
        if (cb) {
          cb.call(nodeChain, nodeChain._.err)
        }
        return nodeChain
      }
      currentContext = this._
      nextChains = currentContext.next || emptyObject
      nodeChain = nextChains[key]
      if (!nodeChain) {
        nodeChain = key && createCachedChain(key, this)
      }
      nodeChain = nodeChain?.$
    } else if ('function' === typeof key) {
      if (true === cb) {
        extractSoul(this, key, cb, as)
        return this
      }
      nodeChain = this
      currentContext = nodeChain._
      getOptions = cb || {}
      rootContext = currentContext.root
      listenerId = String.random(7)
      getOptions.at = currentContext
      getOptions.ok = key
      waitList = {} // can we assign this to the at instead, like in once?
      //var path = []; context.$.back(at => { at.get && path.push(at.get.slice(0,9))}); path = path.reverse().join('.');
      function listenerHandler(msg, eve, f) {
        let passData
        if (listenerHandler.stun) {
          return
        }
        passData = rootContext.pass
        if (passData && !passData[listenerId]) {
          return
        }
        const at = msg.$._
        const sat = (msg.$$ || '')._
        let nodeData = (sat || at).put
        const isOddNode = !at.has && !at.soul
        let stunCheck = {}
        if (isOddNode || undefinedValue === nodeData) {
          // handles non-core
          passData = msg.put
          nodeData =
            undefinedValue === (passData || '')['=']
              ? undefinedValue === (passData || '')[':']
                ? passData
                : passData[':']
              : passData['=']
        }
        passData = Gun.valid(nodeData)
        isLink = 'string' === typeof passData
        if (isLink) {
          passData = rootContext.$.get(passData)._.put
          nodeData =
            undefinedValue === passData
              ? getOptions.not
                ? undefinedValue
                : nodeData
              : passData
        }
        if (getOptions.not && undefinedValue === nodeData) {
          return
        }
        if (undefinedValue === getOptions.stun) {
          const stunData = rootContext.stun
          if (stunData?.on) {
            currentContext.$.back((a) => {
              // our chain stunned?
              stunCheck = {}
              stunData.on(`${a.id}`, stunCheck)
              if ((stunCheck.run || 0) < listenerHandler.id) {
                return stunCheck
              } // if there is an earlier stun on gapless parents/self.
            })
            if (!stunCheck.run) {
              stunCheck = {}
              stunData.on(`${at.id}`, stunCheck)
            } // this node stunned?
            if (!stunCheck.run && sat) {
              stunCheck = {}
              stunData.on(`${sat.id}`, stunCheck)
            } // linked node stunned?
            if (listenerHandler.id > stunCheck.run) {
              if (!stunCheck.stun || stunCheck.stun.end) {
                stunCheck.stun = stunData.on('stun')
                stunCheck.stun = stunCheck.stun?.last
              }
              if (stunCheck.stun && !stunCheck.stun.end) {
                //if(isOddNode && undefinedValue === nodeData){ return }
                //if(undefinedValue === msg.put){ return } // "not found" acks will be found if there is stun, so ignore these.
                if (!stunCheck.stun.add) {
                  stunCheck.stun.add = {}
                }
                stunCheck.stun.add[listenerId] = () => {
                  listenerHandler(msg, eve, 1)
                } // add ourself to the stun callback list that is called at end of the write.
                return
              }
            }
          }
          if (/*isOddNode &&*/ undefinedValue === nodeData) {
            f = 0
          } // if data not found, keep waiting/trying.
          /*if(f && undefinedValue === nodeData){
    currentContext.on('out', getOptions.out);
    return;
  }*/
          const hatchData = rootContext.hatch
          if (
            hatchData &&
            !hatchData.end &&
            undefinedValue === getOptions.hatch &&
            !f
          ) {
            // quick hack! // What's going on here? Because data is streamed, we get things one by one, but a lot of developers would rather get a callback after each batch instead, so this does that by creating a wait list per chain id that is then called at the end of the batch by the hatch code in the root put listener.
            if (waitList[at.$._.id]) {
              return
            }
            waitList[at.$._.id] = 1
            hatchData.push(() => {
              listenerHandler(msg, eve, 1)
            })
            return
          }
          waitList = {} // end quick hack.
        }
        // call:
        if (rootContext.pass) {
          if (rootContext.pass[listenerId + at.id]) {
            return
          }
          rootContext.pass[listenerId + at.id] = 1
        }
        if (getOptions.on) {
          getOptions.ok.call(
            at.$,
            nodeData,
            at.get,
            msg,
            eve || listenerHandler
          )
          return
        } // TODO: Also consider breaking `this` since a lot of people do `=>` these days and `.call(` has slower performance.
        if (getOptions.v2020) {
          getOptions.ok(msg, eve || listenerHandler)
          return
        }
        const messageCopy = {}
        Object.keys(msg).forEach((k) => {
          messageCopy[k] = msg[k]
        })
        msg = messageCopy
        msg.put = nodeData // 2019 COMPATIBILITY! TODO: GET RID OF THIS!
        getOptions.ok.call(getOptions.as, msg, eve || listenerHandler) // is this the right
      }
      listenerHandler.at = currentContext
      //(currentContext.any||(currentContext.any=function(msg){ setTimeout.each(Object.keys(currentContext.any||''), function(act){ (act = currentContext.any[act]) && act(msg) },0,99) }))[listenerId = String.random(7)] = listenerHandler; // maybe switch to this in future?
      if (!currentContext.any) {
        currentContext.any = {}
      }
      listenerId = String.random(7)
      currentContext.any[listenerId] = listenerHandler
      listenerHandler.off = () => {
        listenerHandler.stun = 1
        if (!currentContext.any) {
          return
        }
        delete currentContext.any[listenerId]
      }
      listenerHandler.rid = function rid(at) {
        const ridContext = this.at || this.on
        if (!at || ridContext.soul || ridContext.has) {
          return this.off()
        }
        at = at.$ || at
        at = at._ || at
        if (!at.id) {
          return
        }

        //if(!map || !(tempNode = map[at]) || !(tempNode = tempNode.at)){ return }
        if (!this.seen) {
          this.seen = {}
        }
        const seenNodes = this.seen
        const tempNode = seenNodes[at]
        if (tempNode) {
          return true
        }
        seenNodes[at] = true
        //tempNode.echo[ridContext.id] = {}; // TODO: Warning: This unsubscribes ALL of this chain's listeners from this link, not just the one callback event.
        //obj.del(map, at); // TODO: Warning: This unsubscribes ALL of this chain's listeners from this link, not just the one callback event.
        return
      } // logic from old version, can we clean it up now?
      listenerHandler.id = getOptions.run || ++rootContext.once // used in callback to check if we are earlier than a write. // will this ever cause an integer overflow?
      const originalPass = rootContext.pass
      rootContext.pass = {}
      rootContext.pass[listenerId] = 1 // Explanation: test trade-offs want to prevent recursion so we add/remove pass flag as it gets fulfilled to not repeat, however map map needs many pass flags - how do we reconcile?
      getOptions.out = getOptions.out || { get: {} }
      currentContext.on('out', getOptions.out)
      rootContext.pass = originalPass
      return nodeChain
    } else if ('number' === typeof key) {
      return this.get(`${key}`, cb, as)
    } else {
      const validatedKey = validate(key)
      if ('string' === typeof validatedKey) {
        return this.get(validatedKey, cb, as)
      }
      const nextHandler = this.get.next
      if (nextHandler) {
        nodeChain = nextHandler(this, key)
      }
    }
    if (!nodeChain) {
      nodeChain = this.chain()
      nodeChain._.err = {
        err: Gun.log('Invalid get request!', key)
      } // CLEAN UP
      if (cb) {
        cb.call(nodeChain, nodeChain._.err)
      }
      return nodeChain
    }
    if (cb && 'function' === typeof cb) {
      nodeChain.get(cb, as)
    }
    return nodeChain
  }
  /**
   * Creates a cached chain for the given key and back context.
   * @param {string} key - The key for the chain.
   * @param {object} back - The back context.
   * @returns {object} The new chain context.
   */
  function createCachedChain(key, back) {
    const backContext = back._
    let nextChains = backContext.next
    const newChain = back.chain()
    const newChainContext = newChain._
    if (!nextChains) {
      nextChains = backContext.next = {}
    }
    newChainContext.get = key
    nextChains[newChainContext.get] = newChainContext
    if (back === backContext.root.$) {
      newChainContext.soul = key
      //newChainContext.put = {};
    } else if (backContext.soul || backContext.has) {
      newChainContext.has = key
      //if(obj_has(backContext.put, key)){
      //newChainContext.put = backContext.put[key];
      //}
    }
    return newChainContext
  }
  /**
   * Extracts the soul from the gun context.
   * @param {object} gun - The gun instance.
   * @param {function} cb - The callback function.
   * @param {*} _opt - Options (unused).
   * @param {*} as - Additional context.
   * @returns {object} The gun instance.
   */
  function extractSoul(gun, cb, _opt, as) {
    const gunContext = gun._
    let ackCount = 0
    let soulValue
    soulValue = gunContext.soul || gunContext.link
    if (soulValue) {
      return cb(soulValue, as, gunContext)
    }
    if (gunContext.jam) {
      return gunContext.jam.push([cb, as])
    }
    gunContext.jam = [[cb, as]]
    gun.get(
      function processAck(msg, eve) {
        const peerCount = Object.keys(gunContext.root.opt.peers).length
        if (
          undefinedValue === msg.put &&
          !gunContext.root.opt.super &&
          peerCount &&
          ++ackCount <= peerCount
        ) {
          // TODO: super should not be in core code, bring AXE up into core instead to fix? // TODO: .keys( is slow
          return
        }
        eve.rid(msg)
        const msgContext = msg.$ ? msg.$._ : {}
        let index = 0
        let callbackArgs
        const jamQueue = gunContext.jam
        delete gunContext.jam // jamQueue = gunContext.jam.splice(0, 100);
        //if(jamQueue.length){ process.nextTick(function(){ processAck(msg, eve) }) }
        while (index < jamQueue.length) {
          callbackArgs = jamQueue[index++]
          if (!callbackArgs) continue
          //Gun.obj.map(jamQueue, function(callbackArgs, cb){
          const cb = callbackArgs[0]
          callbackArgs = callbackArgs[1]
          const soulId =
            msgContext.link ||
            msgContext.soul ||
            Gun.valid(msg.put) ||
            msg.put?._?.['#']
          cb?.(soulId, callbackArgs, msg, eve)
        } //);
      },
      { out: { get: { '.': true } } }
    )
    return gun
  }
})()
