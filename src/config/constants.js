// src/config/constants.js
// Responsabilidade: constantes globais imutáveis da aplicação
// Não importar nenhum módulo React aqui

export const CURRENT_DATA_VERSION = 2;

export const ALL_WEEKS = Array.from({ length: 52 }, (_, i) => `W${i + 1}`);

export const STATUS_CATEGORIES = [
	'Transporte',
	'Indisponíveis',
	'Total Reparadas',
	'Reconhecidas',
	'Dep. de Passagem de Cabo',
	'Dep. de Licença',
	'Dep. de Cutover',
	'Fibras Dependentes'
];

export const ALL_OPERATORS = ['ISISTEL', 'FIBRASOL', 'ANGLOBAL'];
