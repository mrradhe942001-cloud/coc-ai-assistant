const MODEL = "@cf/meta/llama-4-scout-17b-16e-instruct";

const TROOPS = [
  "Barbarian",
  "Archer",
  "Giant",
  "Goblin",
  "Wall Breaker",
  "Balloon",
  "Wizard",
  "Healer",
  "Dragon",
  "P.E.K.K.A",
  "Baby Dragon",
  "Miner",
  "Electro Dragon",
  "Yeti",
  "Dragon Rider",
  "Electro Titan",
  "Root Rider",
  "Thrower",
  "Meteor Golem",
  "Minion",
  "Hog Rider",
  "Valkyrie",
  "Golem",
  "Witch",
  "Lava Hound",
  "Bowler",
  "Ice Golem",
  "Headhunter",
  "Apprentice Warden",
  "Druid"
];

const SPELLS = [
  "Lightning Spell",
  "Healing Spell",
  "Rage Spell",
  "Jump Spell",
  "Freeze Spell",
  "Clone Spell",
  "Invisibility Spell",
  "Recall Spell",
  "Poison Spell",
  "Earthquake Spell",
  "Haste Spell",
  "Skeleton Spell",
  "Bat Spell",
  "Overgrowth Spell",
  "Revive Spell"
];

const HEROES = [
  "Barbarian King",
  "Archer Queen",
  "Minion Prince",
  "Grand Warden",
  "Royal Champion"
];

const SIEGES = [
  "None",
  "Wall Wrecker",
  "Battle Blimp",
  "Stone Slammer",
  "Siege Barracks",
  "Log Launcher",
  "Flame Flinger",
  "Battle Drill"
];

function pointSchema(label) {
  return {
    type: "object",
    properties: {
      x: {
        type: "number",
        minimum: 0,
        maximum: 100
      },
      y: {
        type: "number",
        minimum: 0,
        maximum: 100
      },
      label: {
        type: "string",
        enum: [label]
      }
    },
    required: ["x", "y", "label"]
  };
}

const PLAN_SCHEMA = {
  type: "object",
  properties: {
    title: {
      type: "string"
    },

    baseRead: {
      type: "string"
    },

    strategyReason: {
      type: "string"
    },

    confidence: {
      type: "string",
      enum: ["high", "medium", "low"]
    },

    army: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: {
            type: "string",
            enum: TROOPS
          },
          qty: {
            type: "integer",
            minimum: 1,
            maximum: 100
          },
          role: {
            type: "string"
          }
        },
        required: ["name", "qty", "role"]
      }
    },

    spells: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: {
            type: "string",
            enum: SPELLS
          },
          qty: {
            type: "integer",
            minimum: 1,
            maximum: 20
          },
          role: {
            type: "string"
          }
        },
        required: ["name", "qty", "role"]
      }
    },

    heroes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: {
            type: "string",
            enum: HEROES
          },
          role: {
            type: "string"
          },
          ability: {
            type: "string"
          }
        },
        required: ["name", "role", "ability"]
      }
    },

    siege: {
      type: "object",
      properties: {
        name: {
          type: "string",
          enum: SIEGES
        },
        clanCastle: {
          type: "string"
        }
      },
      required: ["name", "clanCastle"]
    },

    map: {
      type: "object",
      properties: {
        entry: pointSchema("ENTRY"),
        funnelA: pointSchema("FUNNEL A"),
        funnelB: pointSchema("FUNNEL B"),
        main: pointSchema("MAIN ARMY"),
        core: pointSchema("CORE"),
        target: pointSchema("MAIN TARGET"),

        spellZones: {
          type: "array",
          items: {
            type: "object",
            properties: {
              x: {
                type: "number",
                minimum: 0,
                maximum: 100
              },
              y: {
                type: "number",
                minimum: 0,
                maximum: 100
              },
              label: {
                type: "string"
              }
            },
            required: ["x", "y", "label"]
          }
        }
      },

      required: [
        "entry",
        "funnelA",
        "funnelB",
        "main",
        "core",
        "target",
        "spellZones"
      ]
    },

    deployment: {
      type: "array",
      items: {
        type: "object",
        properties: {
          step: {
            type: "integer"
          },
          text: {
            type: "string"
          }
        },
        required: ["step", "text"]
      }
    },

    timing: {
      type: "array",
      items: {
        type: "string"
      }
    },

    backup: {
      type: "array",
      items: {
        type: "string"
      }
    },

    practice: {
      type: "array",
      items: {
        type: "string"
      }
    },

    warnings: {
      type: "array",
      items: {
        type: "string"
      }
    }
  },

  required: [
    "title",
    "baseRead",
    "strategyReason",
    "confidence",
    "army",
    "spells",
    "heroes",
    "siege",
    "map",
    "deployment",
    "timing",
    "backup",
    "practice",
    "warnings"
  ]
};
