import { useState } from 'react';
import { ALL_WEEKS } from '../../config/constants.js';
import { ROUTES_BY_PSM } from '../../config/routeConfig.js';
import { LS_KEYS } from '../../services/localStorageService.js';

const createInitialData = () => {
  const initialData = {};

  Object.keys(ROUTES_BY_PSM).forEach((psm) => {
    initialData[psm] = {};

    ALL_WEEKS.forEach((week) => {
      initialData[psm][week] = {};
      ROUTES_BY_PSM[psm].forEach((route) => {
        initialData[psm][week][route] = {
          Transporte: '',
          'Indisponíveis': '',
          'Total Reparadas': '',
          Reconhecidas: '',
          'Dep. de Passagem de Cabo': '',
          'Dep. de Licença': '',
          'Dep. de Cutover': '',
          [`Fibras dependentes da ${psm}`]: ''
        };
      });
    });
  });

  return initialData;
};

const loadSavedState = (key, defaultValue) => {
  try {
    const saved = window.localStorage.getItem(key);
    if (!saved) return defaultValue;
    return JSON.parse(saved);
  } catch (error) {
    console.error('[AppState] Erro ao carregar estado salvo:', key, error);
    return defaultValue;
  }
};

export const useAppState = () => {
  const [data, setData] = useState(() => {
    const saved = loadSavedState(LS_KEYS.DATA, null);
    return saved || createInitialData();
  });

  const [distribuicaoReparacoes, setDistribuicaoReparacoes] = useState(() => {
    const saved = loadSavedState(LS_KEYS.DISTRIBUICAO, null);
    return saved || {};
  });

  const [justificativas, setJustificativas] = useState(() => {
    const saved = loadSavedState(LS_KEYS.JUSTIFICATIVAS, null);
    return saved || {};
  });

  const [alertasAbertos, setAlertasAbertos] = useState(false);
  const [alertasLidos, setAlertasLidos] = useState([]);
  const [efetividadeMode, setEfetividadeMode] = useState('global');
  const [showTestesAnalises, setShowTestesAnalises] = useState(false);
  const [testesData, setTestesData] = useState({
    cadastradas: 0,
    testadas: 0,
    validadas: 0,
    pendentes: 0,
    naoTestadas: 0,
    semIndisponibilidade: 0,
    semIndisponibilidadeTecnica: 0,
    estaveis: 0,
    concluidas: 0,
    comGanho: 0,
    degradadas: 0,
    comIndisponibilidades: 0
  });

  const [todosTestesData, setTodosTestesData] = useState({});

  const [rotasTestadas, setRotasTestadas] = useState(() => {
    const saved = loadSavedState(LS_KEYS.TESTED_ROUTES, null);
    return saved || {};
  });

  const [rotasValidadas, setRotasValidadas] = useState(() => {
    const saved = loadSavedState(LS_KEYS.VALIDATED_ROUTES, null);
    return saved || {};
  });

  const [tabelaValidacaoAberta, setTabelaValidacaoAberta] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [showMobileWarning, setShowMobileWarning] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [manualDataExpanded, setManualDataExpanded] = useState(true);
  const [presentationMode, setPresentationMode] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const [viewMode, setViewMode] = useState('carousel');
  const [viewModeClassificacao, setViewModeClassificacao] = useState('all');
  const [currentGraph, setCurrentGraph] = useState(0);
  const [currentGraphClassificacao, setCurrentGraphClassificacao] = useState(0);

  const [saveStatus, setSaveStatus] = useState('');
  const [lastSaveTime, setLastSaveTime] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedRota, setSelectedRota] = useState(null);
  const [showRepairTypeModal, setShowRepairTypeModal] = useState(false);
  const [pendingRepairData, setPendingRepairData] = useState(null);
  const [currentPageDrilldown, setCurrentPageDrilldown] = useState(0);
  const [currentPageAcomp, setCurrentPageAcomp] = useState(0);
  const [currentPageNormalizadas, setCurrentPageNormalizadas] = useState(0);
  const [currentPageIntervencoes, setCurrentPageIntervencoes] = useState(0);
  const [currentPageSemIntervencao, setCurrentPageSemIntervencao] = useState(0);

  // Hover e tooltip
  const [hoveredPieSlice, setHoveredPieSlice] = useState(null);
  const [hoveredWeekIndex, setHoveredWeekIndex] = useState(null);
  const [tooltipData, setTooltipData] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Drilldown de status
  const [showStatusDrilldown, setShowStatusDrilldown] = useState(false);
  const [selectedStatusDrilldown, setSelectedStatusDrilldown] = useState(null);

  return {
    data,
    setData,
    distribuicaoReparacoes,
    setDistribuicaoReparacoes,
    justificativas,
    setJustificativas,
    alertasAbertos,
    setAlertasAbertos,
    alertasLidos,
    setAlertasLidos,
    efetividadeMode,
    setEfetividadeMode,
    showTestesAnalises,
    setShowTestesAnalises,
    testesData,
    setTestesData,
    todosTestesData,
    setTodosTestesData,
    rotasTestadas,
    setRotasTestadas,
    rotasValidadas,
    setRotasValidadas,
    tabelaValidacaoAberta,
    setTabelaValidacaoAberta,
    isMobileDevice,
    setIsMobileDevice,
    showMobileWarning,
    setShowMobileWarning,
    menuOpen,
    setMenuOpen,
    manualDataExpanded,
    setManualDataExpanded,
    presentationMode,
    setPresentationMode,
    currentSlide,
    setCurrentSlide,
    viewMode,
    setViewMode,
    viewModeClassificacao,
    setViewModeClassificacao,
    currentGraph,
    setCurrentGraph,
    currentGraphClassificacao,
    setCurrentGraphClassificacao,
    saveStatus,
    setSaveStatus,
    lastSaveTime,
    setLastSaveTime,
    showModal,
    setShowModal,
    selectedRota,
    setSelectedRota,
    showRepairTypeModal,
    setShowRepairTypeModal,
    pendingRepairData,
    setPendingRepairData,
    currentPageDrilldown,
    setCurrentPageDrilldown,
    currentPageAcomp,
    setCurrentPageAcomp,
    currentPageNormalizadas,
    setCurrentPageNormalizadas,
    currentPageIntervencoes,
    setCurrentPageIntervencoes,
    currentPageSemIntervencao,
    setCurrentPageSemIntervencao,
    hoveredPieSlice,
    setHoveredPieSlice,
    hoveredWeekIndex,
    setHoveredWeekIndex,
    tooltipData,
    setTooltipData,
    tooltipPosition,
    setTooltipPosition,
    showStatusDrilldown,
    setShowStatusDrilldown,
    selectedStatusDrilldown,
    setSelectedStatusDrilldown,
  };
};
