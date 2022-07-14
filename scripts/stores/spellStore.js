import { localize }           from "@typhonjs-fvtt/runtime/svelte/helper";
import { ArrayObjectStore }   from "@typhonjs-fvtt/svelte-standard/store";

import * as spells from '../spells';

/**
 * Provides a Svelte store for all spells.
 *
 * @template {SpellEntryStore} T
 */
export class SpellStore extends ArrayObjectStore {
   constructor() {
      super({ StoreClass: SpellEntryStore });
   }

   /**
    * Get first spell in store. This likely is temporary; used in `sharedSettings` when there is no existing ASE data.
    *
    * @returns {T}
    */
   get first() { return this._data[0]; }

   /**
    * Loads and registers all hooks from spell classes defined in './spells'.
    */
   initialize() {
      if (this.length > 0) { throw new Error(`SpellStore has already been initialized.`); }

      for (const [name, effect] of Object.entries(spells)) {

         // If there is a static registerHooks; invoke it now.
         if (typeof effect.registerHooks === 'function') { effect.registerHooks(); }

         // Add spell data to ArrayObjectStore.
         this.createEntry({
            name: localize(`ASE.${name[0].toUpperCase()}${name.substring(1)}`),
            effect
         });
      }
   }
}

class SpellEntryStore extends SpellStore.EntryStore {
   constructor(data = {}) {
      super(data);
   }

   /**
    * @returns {string} The localized spell name.
    */
   get name() { return this._data.name; }

   /**
    * @returns {new (data: object) => object} The spell constructor function.
    */
   get effect() { return this._data.effect; }

   /**
    * Static getRequiredSettings function from effect class.
    *
    * @returns {(currFlags: object) => SpellSettingsData}
    */
   get getRequiredSettings() { return this._data.effect.getRequiredSettings; }

   /**
    * ArrayObjectStore requires writable stores for entry data; since the entries are static this is a 'noop'
    * @param {object}   data -
    */
   set(data) { /* noop */ }
}

export const spellStore = new SpellStore();

/**
 * @typedef {object} SpellSettingsData
 *
 * @property {object[]}   animOptions -
 *
 * @property {object[]}   spellOptions -
 *
 * @property {object[]}   soundOptions -
 */