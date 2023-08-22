import { OpenAiFunction } from './openai/openai';

export const krakowSensorsTopic = 'krakow/#';
export const minecraftTopics = 'game/minecraft/#';
export const minecraftTopicPrefix = 'game/minecraft/';
export const minecraftControlTopics = 'control/game/minecraft/#';
export const minecraftControlTopicPrefix = 'control/game/minecraft/';
// city > area > location > room > item > action
export const aliasMap: Map<string, string> = new Map([
  ['main_base', 'spawn/central/base'],
]);
console.log('All aliases', [...aliasMap.keys()]);
export const cities = ['spawn'];
export const areas = ['central'];
export const locations = [
  'base',
  'farm',
  'mine',
  'storage',
  'railway_station',
  'power_plant',
];

// maybe think of a better name than location? e.g. building/place

export const rooms = [
  'bedroom',
  'bathroom',
  'kitchen',
  'living_room',
  'dining_room',
  'garage',
  'basement',
  'attic',
  'office',
  'server_room',
  'control_room',
  'storage_room',
  'hallway',
  'block_a',
  'block_b',
  'block_c',
  'block_d',
  'entranceway',
];

export const items = [
  'front_door',
  'back_door',
  'garage_door',
  'gate',
  'window',
  'fission_reactor',
  'fusion_reactor',
  'lights',
  'mood_lights',
  'lamp',
];

// TODO: finish migration to action type payload instead of string
export const actionTypes = [
  'open',
  'close',
  'lock',
  'unlock',
  'turnon',
  'turnoff',
] as const;
export type ActionType = (typeof actionTypes)[number];
// city > area > location > room > item > action
export const functions: OpenAiFunction[] = [
  {
    name: 'sendMessage',
    description:
      'Sends an action to an item in a specified room at a location within an area within a city',
    parameters: {
      type: 'object',
      properties: {
        city: { type: 'string', description: 'The broad city', enum: cities },
        area: {
          type: 'string',
          description: 'The area within the city',
          enum: areas,
        },
        location: {
          type: 'string',
          description: 'The location within the area',
          enum: locations,
        },
        room: {
          type: 'string',
          description: 'The room within the location',
          enum: rooms,
        },
        item: {
          type: 'string',
          description: 'The item within the room',
          enum: items,
        },
        action: {
          type: 'object',
          description: 'The action to perform on the item',
          properties: {
            type: { type: 'string', enum: actionTypes },
            payload: { type: 'string' },
            required: ['type'],
          },
        },
      },
      required: ['city', 'area', 'location', 'item', 'action'],
    },
  },
  {
    name: 'sendActionWithAlias',
    description:
      'Sends an action to an item within a location defined by an alias',
    parameters: {
      type: 'object',
      properties: {
        alias: {
          type: 'string',
          description: 'The alias of the location',
          enum: [...aliasMap.keys()],
        },
        room: {
          type: 'string',
          description: 'The room within the location',
          enum: rooms,
        },
        item: {
          type: 'string',
          description: 'The item within the location',
          enum: items,
        },
        action: {
          type: 'object',
          description: 'The action to perform on the item',
          properties: {
            type: { type: 'string', enum: actionTypes },
            payload: { type: 'string' },
            required: ['type'],
          },
        },
      },
      required: ['alias', 'item', 'action', 'room'],
    },
  },
];
