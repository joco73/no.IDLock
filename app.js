'use strict'

const Homey = require('homey')

class IDLock extends Homey.App {
  onInit () {
    this.log('IDLock is running...')

    // Triggers

    const doorLockTrigger = this.homey.flow.getDeviceTriggerCard('door_lock')
    doorLockTrigger.registerRunListener(this.onTypeWhoMatchTrigger.bind(this))
    doorLockTrigger.getArgument('who').registerAutocompleteListener(this.onWhoAutoComplete.bind(this))

    const doorUnlockTrigger = this.homey.flow.getDeviceTriggerCard('door_unlock')
    doorUnlockTrigger.registerRunListener(this.onTypeWhoMatchTrigger.bind(this))
    doorUnlockTrigger.getArgument('who').registerAutocompleteListener(this.onWhoAutoComplete.bind(this))

    // Conditions

    // These conditions have no real use as they only check whats given to them by the condition card
    // I'll just give them a new runListener so they don't throw errors in a flow.
    // The only way these conditions will work (but have no use at all) is if the condition card is set to check Name "Any" and Type "All" (no other Name or Type will return true...)

    const doorLocking = this.homey.flow.getConditionCard('door_locking')
    doorLocking.registerRunListener(this.onTypeWhoMatchCondition.bind(this))
    doorLocking.getArgument('who').registerAutocompleteListener(this.onWhoAutoComplete.bind(this))

    const doorUnlocking = this.homey.flow.getConditionCard('door_unlocking')
    doorUnlocking.registerRunListener(this.onTypeWhoMatchCondition.bind(this))
    doorUnlocking.getArgument('who').registerAutocompleteListener(this.onWhoAutoComplete.bind(this))

    // Actions

    this.homey.flow.getActionCard('set_awaymode').registerRunListener((args, state) => {
      return args.device.awaymodeActionRunListener(args, state)
    })
  }

  onTypeWhoMatchTrigger (args, state) {
    this.log('-- TRIGGER --')
    this.log('args.type:', args.type)
    this.log('args.who:', args.who)
    this.log('state:', state)

    return (args.type === state.type || args.type === 'any') && (args.who.name.toLowerCase() === state.who.toLowerCase() || args.who.name.toLowerCase() === 'any')
  }

  onTypeWhoMatchCondition (args, state) {
    this.log('-- CONDITION --')
    this.log('args.type:', args.type)
    this.log('args.who:', args.who)
    this.log('state:', state)

    return (args.type === state.type || args.type === 'any') && ((typeof state.who === 'string' && args.who.name.toLowerCase() === state.who.toLowerCase()) || args.who.name.toLowerCase() === 'any')
  }

  onWhoAutoComplete (query, args) {
    const distinctNames = [...new Set(JSON.parse(this.homey.settings.get('codes')).map(item => item.user))].sort()
    let resultArray = distinctNames.map(user => { return { name: user } })
    resultArray.unshift({ name: 'Unknown' })
    resultArray.unshift({ name: 'Any' })
    resultArray = resultArray.filter(result => { return result.name.toLowerCase().indexOf(query.toLowerCase()) > -1 })
    return resultArray
  }
}

module.exports = IDLock
