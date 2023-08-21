export const krakowSensorsTopic = 'krakow/#';
export const minecraftTopics = 'game/minecraft/#';
export const minecraftControlTopics = 'control/game/minecraft/#';
// space > area > location > item > action
export const aliasMap: Map<string, string> = new Map([
  ['main_base', 'spawn/central/base'],
]);
export const spaces = ['spawn'];
export const areas = ['central'];
export const locations = [
  'base',
  'farm',
  'mine',
  'storage',
  'railway_station',
  'power_plant',
];
export const items = [
  'front_door',
  'back_door',
  'garage_door',
  'gate',
  'window',
  'fission_reactor_A',
  'fusion_reactor_A',
  'fission_reactor_B',
  'fusion_reactor_B',
  'fission_reactor_C',
  'fusion_reactor_C',
];
export const actions = ['open', 'close', 'lock', 'unlock', 'turnon', 'turnoff'];
