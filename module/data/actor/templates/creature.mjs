import { FormulaField, makeSimpleTrait, MappingField } from "../../fields.mjs";
import SkillData from "../skill.mjs";
import CommonTemplate from "./common.mjs";

/**
 * A template for all actors that are creatures
 *
 * @property {object} attributes
 * @property {object} attributes.attunement
 * @property {number} attributes.attunement.max      Maximum number of attuned items.
 * @property {object} attributes.senses
 * @property {number} attributes.senses.darkvision   Creature's darkvision range.
 * @property {number} attributes.senses.blindsight   Creature's blindsight range.
 * @property {number} attributes.senses.tremorsense  Creature's tremorsense range.
 * @property {number} attributes.senses.truesight    Creature's truesight range.
 * @property {string} attributes.senses.units        Distance units used to measure senses.
 * @property {string} attributes.senses.special      Description of any special senses or restrictions.
 * @property {string} attributes.spellcasting        Primary spellcasting ability.
 * @property {object} bonuses
 * @property {AttackBonusesData} bonuses.mwak        Bonuses to melee weapon attacks.
 * @property {AttackBonusesData} bonuses.rwak        Bonuses to ranged weapon attacks.
 * @property {AttackBonusesData} bonuses.msak        Bonuses to melee spell attacks.
 * @property {AttackBonusesData} bonuses.rsak        Bonuses to ranged spell attacks.
 * @property {object} bonuses.abilities              Bonuses to ability scores.
 * @property {string} bonuses.abilities.check        Numeric or dice bonus to ability checks.
 * @property {string} bonuses.abilities.save         Numeric or dice bonus to ability saves.
 * @property {string} bonuses.abilities.skill        Numeric or dice bonus to skill checks.
 * @property {object} bonuses.spell                  Bonuses to spells.
 * @property {string} bonuses.spell.dc               Numeric bonus to spellcasting DC.
 * @property {object} details
 * @property {string} details.alignment              Creature's alignment.
 * @property {string} details.race                   Creature's race.
 * @property {Object<string, SkillData>} skills      Actor's skills.
 * @property {Object<string, SpellSlotData>} spells  Actor's spell slots.
 * @property {object} traits
 * @property {SimpleTraitData} traits.languages      Languages known by this creature.
 */
export default class CreatureTemplate extends CommonTemplate {
  static defineSchema() {
    return this.mergeSchema(super.defineSchema(), {
      attributes: new foundry.data.fields.SchemaField({
        attunement: new foundry.data.fields.SchemaField({
          max: new foundry.data.fields.NumberField({
            required: true, nullable: false, integer: true, min: 0, initial: 3, label: "DND5E.AttunementMax"
          })
        }, {label: "DND5E.Attunement"}),
        senses: new foundry.data.fields.SchemaField({
          darkvision: new foundry.data.fields.NumberField({
            required: true, nullable: false, integer: true, min: 0, initial: 0, label: "DND5E.SenseDarkvision"
          }),
          blindsight: new foundry.data.fields.NumberField({
            required: true, nullable: false, integer: true, min: 0, initial: 0, label: "DND5E.SenseBlindsight"
          }),
          tremorsense: new foundry.data.fields.NumberField({
            required: true, nullable: false, integer: true, min: 0, initial: 0, label: "DND5E.SenseTremorsense"
          }),
          truesight: new foundry.data.fields.NumberField({
            required: true, nullable: false, integer: true, min: 0, initial: 0, label: "DND5E.SenseTruesight"
          }),
          units: new foundry.data.fields.StringField({required: true, initial: "ft", label: "DND5E.SenseUnits"}),
          special: new foundry.data.fields.StringField({required: true, label: "DND5E.SenseSpecial"})
        }, {label: "DND5E.Senses"}),
        spellcasting: new foundry.data.fields.StringField({
          required: true, blank: true, initial: "int", label: "DND5E.SpellAbility"
        })
      }),
      bonuses: new foundry.data.fields.SchemaField({
        mwak: makeAttackBonuses({label: "DND5E.BonusMWAttack"}),
        rwak: makeAttackBonuses({label: "DND5E.BonusRWAttack"}),
        msak: makeAttackBonuses({label: "DND5E.BonusMSAttack"}),
        rsak: makeAttackBonuses({label: "DND5E.BonusRSAttack"}),
        abilities: new foundry.data.fields.SchemaField({
          check: new FormulaField({required: true, label: "DND5E.BonusAbilityCheck"}),
          save: new FormulaField({required: true, label: "DND5E.BonusAbilitySave"}),
          skill: new FormulaField({required: true, label: "DND5E.BonusAbilitySkill"})
        }, {label: "DND5E.BonusAbility"}),
        spell: new foundry.data.fields.SchemaField({
          dc: new FormulaField({required: true, deterministic: true, label: "DND5E.BonusSpellDC"})
        }, {label: "DND5E.BonusSpell"})
      }, {label: "DND5E.Bonuses"}),
      details: new foundry.data.fields.SchemaField({
        alignment: new foundry.data.fields.StringField({required: true, label: "DND5E.Alignment"}),
        race: new foundry.data.fields.StringField({required: true, label: "DND5E.Race"})
      }),
      skills: new MappingField(new foundry.data.fields.EmbeddedDataField(SkillData), {
        initialKeys: CONFIG.DND5E.skills, initialValue: this._initialSkillValue
      }),
      spells: new MappingField(new foundry.data.fields.SchemaField({
        value: new foundry.data.fields.NumberField({
          nullable: false, integer: true, min: 0, initial: 0, label: "DND5E.SpellProfAvailable"
        }),
        override: new foundry.data.fields.NumberField({
          integer: true, min: 0, label: "DND5E.SpellProgOverride"
        })
      }), {initialKeys: this._spellLevels, label: "DND5E.SpellLevels"}),
      traits: new foundry.data.fields.SchemaField({
        languages: makeSimpleTrait({label: "DND5E.Languages"})
      })
    });
  }

  /* -------------------------------------------- */

  /**
   * Populate the proper initial abilities for the skills.
   * @param {string} key      Key for which the initial data will be created.
   * @param {object} initial  The initial skill object created by SkillData.
   * @returns {object}        Initial skills object with the ability defined.
   * @private
   */
  static _initialSkillValue(key, initial) {
    if ( CONFIG.DND5E.skills[key]?.ability ) initial.ability = CONFIG.DND5E.skills[key].ability;
    return initial;
  }

  /* -------------------------------------------- */

  /**
   * Helper for building the default list of spell levels.
   * @type {string[]}
   * @private
   */
  static get _spellLevels() {
    const levels = Object.keys(CONFIG.DND5E.spellLevels).filter(a => a !== "0").map(l => `spell${l}`);
    return [...levels, "pact"];
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  static migrateData(source) {
    this.migrateSensesData(source);
  }

  /* -------------------------------------------- */

  /**
   * Migrate the actor traits.senses string to attributes.senses object.
   * @param {object} source  The candidate source data from which the model will be constructed.
   */
  static migrateSensesData(source) {
    const original = source.traits?.senses;
    if ( (original === undefined) || (typeof original !== "string") ) return;
    source.attributes ??= {};
    source.attributes.senses ??= {};

    // Try to match old senses with the format like "Darkvision 60 ft, Blindsight 30 ft"
    const pattern = /([A-z]+)\s?([0-9]+)\s?([A-z]+)?/;
    let wasMatched = false;

    // Match each comma-separated term
    for ( let s of original.split(",") ) {
      s = s.trim();
      const match = s.match(pattern);
      if ( !match ) continue;
      const type = match[1].toLowerCase();
      if ( type in CONFIG.DND5E.senses ) {
        source.attributes.senses[type] = Number(match[2]).toNearest(0.5);
        wasMatched = true;
      }
    }

    // If nothing was matched, but there was an old string - put the whole thing in "special"
    if ( !wasMatched && original ) source.attributes.senses.special = original;
  }
}

/* -------------------------------------------- */

/**
 * Data on configuration of a specific spell slot.
 *
 * @typedef {object} SpellSlotData
 * @property {number} value     Currently available spell slots.
 * @property {number} override  Number to replace auto-calculated max slots.
 */

/* -------------------------------------------- */

/**
 * Data structure for actor's attack bonuses.
 *
 * @typedef {object} AttackBonusesData
 * @property {string} attack  Numeric or dice bonus to attack rolls.
 * @property {string} damage  Numeric or dice bonus to damage rolls.
 */

/**
 * Produce the schema field for a simple trait.
 * @param {object} schemaOptions  Options passed to the outer schema.
 * @returns {AttackBonusesData}
 */
function makeAttackBonuses(schemaOptions={}) {
  return new foundry.data.fields.SchemaField({
    attack: new FormulaField({required: true, label: "DND5E.BonusAttack"}),
    damage: new FormulaField({required: true, label: "DND5E.BonusDamage"})
  }, schemaOptions);
}
