import React, { useState, useEffect, useRef } from 'react';

import { cleanupOldData } from '../services/localStorageService';

import { ALL_WEEKS } from '../config/constants';
import { QUARTER_CONFIG } from '../config/quarterConfig';
import { getQuarterAnterior } from '../utils/dateUtils.js';
import { useAuth } from '../auth/useAuth.js';
import { useRouteChecks } from '../hooks/business/useRouteChecks.js';
import { useRouteConfig } from '../hooks/state/useRouteConfig.js';
import { useFilters } from '../hooks/state/useFilters.js';
import { useAppState } from '../hooks/state/useAppState.js';
import { usePersistence } from '../hooks/state/usePersistence.js';
import { useScrollHeader } from '../hooks/state/useScrollHeader.js';
import { useTestes } from '../hooks/business/useTestes.js';
import { useAlertas } from '../hooks/business/useAlertas.js';
import { useIntervencoes } from '../hooks/business/useIntervencoes.js';
import { useTendencias } from '../hooks/business/useTendencias.js';
import { usePieChart } from '../hooks/business/usePieChart.js';
import { useDashboard } from '../hooks/business/useDashboard.js';
import { useIOHandlers } from '../hooks/business/useIOHandlers.js';
import { useInputHandlers } from '../hooks/business/useInputHandlers.js';
import SaveStatus from '../components/feedback/SaveStatus.jsx';
import PresentationMode from '../features/Apresentacao/PresentationMode.jsx';
import RepairTypeModal from '../features/DataEntry/RepairTypeModal.jsx';
import TestesAnalises from '../features/Testes/TestesAnalises.jsx';
import StatusDrilldown from '../features/Dashboard/StatusDrilldown.jsx';
import ExecutiveDashboard from '../features/Dashboard/ExecutiveDashboard.jsx';
import ProvincialDashboard from '../features/Dashboard/ProvincialDashboard.jsx';
import AnaliseContainer from '../features/Analise/AnaliseContainer.jsx';
import ClassificacaoCarrossel from '../features/Analise/ClassificacaoCarrossel.jsx';
import AcompanhamentoTable from '../features/Analise/AcompanhamentoTable.jsx';
import RouteDetailModal from '../features/DataEntry/RouteDetailModal.jsx';
import Sidebar from '../features/Layout/Sidebar.jsx';
import HeaderFilters from '../features/Layout/HeaderFilters.jsx';
import MobileWarningBanner from '../features/Layout/MobileWarningBanner.jsx';

const MainPage = () => {
  // Limpeza automática do localStorage
  useEffect(() => {
    const wasCleanedUp = cleanupOldData();
    if (wasCleanedUp) {
      setTimeout(() => { window.location.reload(); }, 1000);
    }
  }, []);

  const { user } = useAuth();
  const { routesByPsm, routeToProvince, operatorToProvinces, allPsms } = useRouteConfig();

  const {
    data, setData,
    distribuicaoReparacoes, setDistribuicaoReparacoes,
    justificativas, setJustificativas,
    alertasAbertos, setAlertasAbertos,
    alertasLidos, setAlertasLidos,
    efetividadeMode, setEfetividadeMode,
    showTestesAnalises, setShowTestesAnalises,
    testesData, setTestesData,
    todosTestesData, setTodosTestesData,
    rotasTestadas, setRotasTestadas,
    rotasValidadas, setRotasValidadas,
    tabelaValidacaoAberta, setTabelaValidacaoAberta,
    isMobileDevice, setIsMobileDevice,
    showMobileWarning, setShowMobileWarning,
    menuOpen, setMenuOpen,
    manualDataExpanded, setManualDataExpanded,
    presentationMode, setPresentationMode,
    currentSlide, setCurrentSlide,
    saveStatus, setSaveStatus,
    lastSaveTime, setLastSaveTime,
    showModal, setShowModal,
    selectedRota, setSelectedRota,
    showRepairTypeModal, setShowRepairTypeModal,
    pendingRepairData, setPendingRepairData,
    currentPageDrilldown, setCurrentPageDrilldown,
    currentPageAcomp, setCurrentPageAcomp,
    currentPageNormalizadas, setCurrentPageNormalizadas,
    currentPageIntervencoes, setCurrentPageIntervencoes,
    currentPageSemIntervencao, setCurrentPageSemIntervencao,
    showStatusDrilldown, setShowStatusDrilldown,
    selectedStatusDrilldown, setSelectedStatusDrilldown,
  } = useAppState();

  const {
    selectedOperator, setSelectedOperator,
    selectedWeek, setSelectedWeek,
    selectedQuarter, setSelectedQuarter,
    selectedYear, setSelectedYear,
    selectedProvince, setSelectedProvince,
  } = useFilters({ operatorToProvinces });

  usePersistence({
    data, justificativas, distribuicaoReparacoes,
    selectedYear, selectedQuarter,
    rotasTestadas, rotasValidadas,
    setData, setJustificativas, setRotasTestadas, setRotasValidadas,
    setDistribuicaoReparacoes, setSaveStatus, setLastSaveTime,
    routeToProvince,
    user,
  });

  const { scrollContainerRef, headerVisible } = useScrollHeader();

  const modalTimerRef = useRef(null);
  const valorOriginalRef = useRef(null);
  const skipNextSaveRef = useRef(false);

  // Cleanup do timer do modal ao desmontar
  useEffect(() => {
    return () => {
      if (modalTimerRef.current) {
        clearTimeout(modalTimerRef.current);
        modalTimerRef.current = null;
      }
    };
  }, []);

  // Detecção automática de dispositivo mobile
  useEffect(() => {
    const checkMobileDevice = () => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        || window.innerWidth < 768;
      setIsMobileDevice(isMobile);
    };
    checkMobileDevice();
    window.addEventListener('resize', checkMobileDevice);
    return () => window.removeEventListener('resize', checkMobileDevice);
  }, []);

  const {
    isRotaTestada, isRotaValidada,
    getSemanasTestadasNoQuarter, getSemanasValidadasNoQuarter,
    getSemanasTestadas, getSemanasValidadas,
    isRotaTestadaGlobalNoQuarter, isRotaValidadaGlobalNoQuarter,
    isRotaTestadaGlobal, isRotaValidadaGlobal,
    isRotaValidadaNoQuarter, isRotaTestadaNoQuarter,
  } = useRouteChecks({ rotasTestadas, rotasValidadas, selectedYear });

  useTestes({
    data, rotasTestadas, rotasValidadas,
    selectedOperator, selectedQuarter,
    setTestesData, setTodosTestesData,
    isRotaTestadaGlobalNoQuarter, isRotaValidadaGlobalNoQuarter, getSemanasValidadasNoQuarter,
  });

  const { alertas } = useAlertas({
    data, selectedOperator, selectedQuarter, selectedWeek, selectedProvince, alertasLidos,
  });

  const { intervencoesRecentes, rotasNormalizadas, rotasMaisIntervencionadas, rotasSemIntervencao } = useIntervencoes({
    data, selectedOperator, selectedQuarter, selectedWeek, selectedProvince,
    routesByPsm, routeToProvince,
  });

  const { trendData } = useTendencias({
    data, distribuicaoReparacoes, selectedOperator, selectedQuarter, selectedYear, selectedWeek, selectedProvince,
    routesByPsm, routeToProvince,
  });

  const { pieChartData } = usePieChart({
    data, distribuicaoReparacoes, selectedOperator, selectedQuarter, selectedYear, selectedProvince,
    routesByPsm, routeToProvince,
  });

  const {
    executiveDashboard, headerCardsData, topRotasCriticas, acompanhamentoData,
    efetividadeGlobalMedia, efetividadePSMMedia,
  } = useDashboard({
    data, distribuicaoReparacoes, justificativas,
    selectedOperator, selectedQuarter, selectedYear, selectedWeek, selectedProvince,
    routesByPsm, routeToProvince, operatorToProvinces,
  });

  // Fechar dropdown de alertas ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (alertasAbertos && !event.target.closest('.relative')) {
        setAlertasAbertos(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [alertasAbertos]);

  const {
    handleUploadJustificativas, handleSaveData, handleImportData,
    handleImportJustificativas, handleExportJSON, handleDownloadCSV,
    handleExportJustificativasCSV, handleViewState,
  } = useIOHandlers({
    data, setData, justificativas, setJustificativas,
    rotasTestadas, setRotasTestadas, rotasValidadas, setRotasValidadas,
    selectedOperator, selectedQuarter, selectedYear,
    setSaveStatus, setLastSaveTime,
    isRotaTestada, isRotaValidada,
  });

  const {
    buscarValorAnterior, handleInputChange, aplicarReparacaoPorTipo,
    cancelarModal, handleBlurTotalReparadas, getInputValue,
    handleRotaClick, handleStatusClick,
  } = useInputHandlers({
    data, setData, justificativas, distribuicaoReparacoes, setDistribuicaoReparacoes,
    selectedOperator, selectedQuarter, selectedYear,
    pendingRepairData, setPendingRepairData,
    showRepairTypeModal, setShowRepairTypeModal,
    valorOriginalRef, skipNextSaveRef,
    setSelectedRota, setShowModal,
    setSelectedStatusDrilldown, setCurrentPageDrilldown, setShowStatusDrilldown,
    routesByPsm,
  });

  const handleLimparJustificativas = () => {
    const countFiltered = Object.values(justificativas).filter(j =>
      j.psm === selectedOperator && j.quarter === selectedQuarter
    ).length;
    if (countFiltered === 0) {
      alert(`⚠️ Não há justificativas para limpar!\n\nPSM: ${selectedOperator}\nQuarter: ${selectedQuarter}`);
      return;
    }
    const confirmar = confirm(
      `🗑️ LIMPAR JUSTIFICATIVAS\n\nDeseja realmente limpar TODAS as justificativas de:\n\nPSM: ${selectedOperator}\nQuarter: ${selectedQuarter}\n\nTotal a remover: ${countFiltered} secções\n\nEsta ação não pode ser desfeita!`
    );
    if (!confirmar) return;
    const updated = {};
    Object.entries(justificativas).forEach(([key, just]) => {
      if (!(just.psm === selectedOperator && just.quarter === selectedQuarter)) {
        updated[key] = just;
      }
    });
    setJustificativas(updated);
  };

  useEffect(() => {
    setCurrentPageAcomp(0);
    setCurrentPageNormalizadas(0);
    setCurrentPageIntervencoes(0);
    setCurrentPageSemIntervencao(0);
  }, [selectedOperator, selectedQuarter]);

  const itemsPerPageDrilldown = 16;
  const itemsPerPageAcomp = 10;
  const itemsPerPageNormalizadas = 6;
  const itemsPerPageIntervencoes = 5;
  const itemsPerPageSemIntervencao = 7;

  const quarterWeeks = ALL_WEEKS.slice(
    QUARTER_CONFIG[selectedQuarter].start - 1,
    QUARTER_CONFIG[selectedQuarter].end
  );

  const quarterAnterior = getQuarterAnterior(selectedQuarter, selectedYear);

  if (presentationMode) {
    return (
      <PresentationMode
        currentSlide={currentSlide}
        setCurrentSlide={setCurrentSlide}
        setPresentationMode={setPresentationMode}
        selectedOperator={selectedOperator}
        selectedProvince={selectedProvince}
        selectedQuarter={selectedQuarter}
        selectedWeek={selectedWeek}
        selectedYear={selectedYear}
        executiveDashboard={executiveDashboard}
        efetividadeMode={efetividadeMode}
        setEfetividadeMode={setEfetividadeMode}
        efetividadeGlobalMedia={efetividadeGlobalMedia}
        efetividadePSMMedia={efetividadePSMMedia}
        distribuicaoReparacoes={distribuicaoReparacoes}
        headerCardsData={headerCardsData}
        quarterWeeks={quarterWeeks}
        showStatusDrilldown={showStatusDrilldown}
        setShowStatusDrilldown={setShowStatusDrilldown}
        selectedStatusDrilldown={selectedStatusDrilldown}
        currentPageDrilldown={currentPageDrilldown}
        setCurrentPageDrilldown={setCurrentPageDrilldown}
        itemsPerPageDrilldown={itemsPerPageDrilldown}
        data={data}
        handleStatusClick={handleStatusClick}
        routesByPsm={routesByPsm}
        routeToProvince={routeToProvince}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex relative">

      <MobileWarningBanner
        isMobileDevice={isMobileDevice}
        showMobileWarning={showMobileWarning}
        setShowMobileWarning={setShowMobileWarning}
      />

      <RouteDetailModal
        showModal={showModal}
        selectedRota={selectedRota}
        setShowModal={setShowModal}
        selectedOperator={selectedOperator}
        selectedQuarter={selectedQuarter}
        selectedYear={selectedYear}
      />

      <StatusDrilldown
        showStatusDrilldown={showStatusDrilldown}
        setShowStatusDrilldown={setShowStatusDrilldown}
        selectedStatusDrilldown={selectedStatusDrilldown}
        selectedOperator={selectedOperator}
        selectedQuarter={selectedQuarter}
        currentPageDrilldown={currentPageDrilldown}
        setCurrentPageDrilldown={setCurrentPageDrilldown}
        itemsPerPageDrilldown={itemsPerPageDrilldown}
        data={data}
        handleRotaClick={handleRotaClick}
      />

      <Sidebar
        menuOpen={menuOpen}
        setPresentationMode={setPresentationMode}
        handleDownloadCSV={handleDownloadCSV}
        handleImportData={handleImportData}
        handleUploadJustificativas={handleUploadJustificativas}
        handleExportJSON={handleExportJSON}
        handleExportJustificativasCSV={handleExportJustificativasCSV}
        handleViewState={handleViewState}
      />

      <div ref={scrollContainerRef} className="flex-1 overflow-auto">

        <HeaderFilters
          headerVisible={headerVisible}
          isMobileDevice={isMobileDevice}
          showMobileWarning={showMobileWarning}
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          saveStatus={saveStatus}
          lastSaveTime={lastSaveTime}
          selectedOperator={selectedOperator}
          setSelectedOperator={setSelectedOperator}
          selectedProvince={selectedProvince}
          setSelectedProvince={setSelectedProvince}
          selectedWeek={selectedWeek}
          setSelectedWeek={setSelectedWeek}
          selectedQuarter={selectedQuarter}
          setSelectedQuarter={setSelectedQuarter}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          showTestesAnalises={showTestesAnalises}
          setShowTestesAnalises={setShowTestesAnalises}
          alertasAbertos={alertasAbertos}
          setAlertasAbertos={setAlertasAbertos}
          alertas={alertas}
          alertasLidos={alertasLidos}
          setAlertasLidos={setAlertasLidos}
          headerCardsData={headerCardsData}
          handleStatusClick={handleStatusClick}
          operatorToProvinces={operatorToProvinces}
          allPsms={allPsms}
        />

        <TestesAnalises
          showTestesAnalises={showTestesAnalises}
          setShowTestesAnalises={setShowTestesAnalises}
          selectedOperator={selectedOperator}
          selectedQuarter={selectedQuarter}
          selectedYear={selectedYear}
          selectedWeek={selectedWeek}
          testesData={testesData}
          todosTestesData={todosTestesData}
          rotasTestadas={rotasTestadas}
          setRotasTestadas={setRotasTestadas}
          rotasValidadas={rotasValidadas}
          setRotasValidadas={setRotasValidadas}
          tabelaValidacaoAberta={tabelaValidacaoAberta}
          setTabelaValidacaoAberta={setTabelaValidacaoAberta}
          isRotaTestada={isRotaTestada}
          isRotaValidada={isRotaValidada}
          getSemanasTestadasNoQuarter={getSemanasTestadasNoQuarter}
          getSemanasValidadasNoQuarter={getSemanasValidadasNoQuarter}
          isRotaValidadaNoQuarter={isRotaValidadaNoQuarter}
          isRotaTestadaNoQuarter={isRotaTestadaNoQuarter}
        />

        <div className="px-5 py-3">
          <ExecutiveDashboard
            selectedOperator={selectedOperator}
            selectedProvince={selectedProvince}
            selectedQuarter={selectedQuarter}
            selectedWeek={selectedWeek}
            selectedYear={selectedYear}
            executiveDashboard={executiveDashboard}
            handleStatusClick={handleStatusClick}
            distribuicaoReparacoes={distribuicaoReparacoes}
            quarterWeeks={quarterWeeks}
            efetividadeMode={efetividadeMode}
            setEfetividadeMode={setEfetividadeMode}
            efetividadeGlobalMedia={efetividadeGlobalMedia}
            efetividadePSMMedia={efetividadePSMMedia}
            data={data}
            routesByPsm={routesByPsm}
            routeToProvince={routeToProvince}
            operatorToProvinces={operatorToProvinces}
          />

          <ProvincialDashboard
            selectedOperator={selectedOperator}
            selectedProvince={selectedProvince}
            selectedQuarter={selectedQuarter}
            selectedWeek={selectedWeek}
            topRotasCriticas={topRotasCriticas}
            intervencoesRecentes={intervencoesRecentes}
            rotasNormalizadas={rotasNormalizadas}
            rotasMaisIntervencionadas={rotasMaisIntervencionadas}
            rotasSemIntervencao={rotasSemIntervencao}
            handleRotaClick={handleRotaClick}
            data={data}
            currentPageNormalizadas={currentPageNormalizadas}
            setCurrentPageNormalizadas={setCurrentPageNormalizadas}
            currentPageIntervencoes={currentPageIntervencoes}
            setCurrentPageIntervencoes={setCurrentPageIntervencoes}
            currentPageSemIntervencao={currentPageSemIntervencao}
            setCurrentPageSemIntervencao={setCurrentPageSemIntervencao}
            itemsPerPageIntervencoes={itemsPerPageIntervencoes}
            itemsPerPageSemIntervencao={itemsPerPageSemIntervencao}
            itemsPerPageNormalizadas={itemsPerPageNormalizadas}
          />

          <AnaliseContainer
            selectedProvince={selectedProvince}
            selectedQuarter={selectedQuarter}
            selectedWeek={selectedWeek}
            selectedYear={selectedYear}
            data={data}
            trendData={trendData}
            pieChartData={pieChartData}
          />

          <ClassificacaoCarrossel
            selectedOperator={selectedOperator}
            selectedProvince={selectedProvince}
            selectedQuarter={selectedQuarter}
            selectedWeek={selectedWeek}
            selectedYear={selectedYear}
            handleRotaClick={handleRotaClick}
            data={data}
            distribuicaoReparacoes={distribuicaoReparacoes}
            routesByPsm={routesByPsm}
            routeToProvince={routeToProvince}
          />

          <AcompanhamentoTable
            selectedOperator={selectedOperator}
            selectedQuarter={selectedQuarter}
            selectedWeek={selectedWeek}
            selectedYear={selectedYear}
            acompanhamentoData={acompanhamentoData}
            routesByPsm={routesByPsm}
            currentPageAcomp={currentPageAcomp}
            setCurrentPageAcomp={setCurrentPageAcomp}
            itemsPerPageAcomp={itemsPerPageAcomp}
            handleInputChange={handleInputChange}
            getInputValue={getInputValue}
            manualDataExpanded={manualDataExpanded}
            setManualDataExpanded={setManualDataExpanded}
            handleBlurTotalReparadas={handleBlurTotalReparadas}
            handleLimparJustificativas={handleLimparJustificativas}
            quarterAnterior={quarterAnterior}
          />
        </div>
      </div>

      <RepairTypeModal
        showRepairTypeModal={showRepairTypeModal}
        pendingRepairData={pendingRepairData}
        aplicarReparacaoPorTipo={aplicarReparacaoPorTipo}
        cancelarModal={cancelarModal}
      />

    </div>
  );
};

export default MainPage;
