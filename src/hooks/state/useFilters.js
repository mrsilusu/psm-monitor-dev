import { useState, useEffect } from 'react';
import { LS_KEYS, lsGet, lsSet } from '../../services/localStorageService.js';
import { OPERATOR_TO_PROVINCES as STATIC_OPERATOR_TO_PROVINCES } from '../../config/provinceConfig.js';
import { QUARTER_CONFIG } from '../../config/quarterConfig.js';

const parseYear = (value) => {
  const year = parseInt(value, 10);
  return Number.isInteger(year) ? year : new Date().getFullYear();
};

export const useFilters = ({ operatorToProvinces = STATIC_OPERATOR_TO_PROVINCES } = {}) => {
  const [selectedOperator, setSelectedOperator] = useState(
    () => lsGet(LS_KEYS.OPERATOR) || 'FIBRASOL'
  );

  const [selectedWeek, setSelectedWeek] = useState(
    () => lsGet(LS_KEYS.WEEK) || 'W1'
  );

  const [selectedQuarter, setSelectedQuarter] = useState(
    () => lsGet(LS_KEYS.QUARTER) || 'Q1'
  );

  const [selectedYear, setSelectedYear] = useState(
    () => parseYear(lsGet(LS_KEYS.YEAR))
  );

  const [selectedProvince, setSelectedProvince] = useState(
    () => lsGet(LS_KEYS.PROVINCE) || 'Todas'
  );

  useEffect(() => {
    lsSet(LS_KEYS.OPERATOR, selectedOperator);
  }, [selectedOperator]);

  useEffect(() => {
    lsSet(LS_KEYS.WEEK, selectedWeek);
  }, [selectedWeek]);

  useEffect(() => {
    lsSet(LS_KEYS.QUARTER, selectedQuarter);
  }, [selectedQuarter]);

  useEffect(() => {
    lsSet(LS_KEYS.YEAR, selectedYear);
  }, [selectedYear]);

  useEffect(() => {
    lsSet(LS_KEYS.PROVINCE, selectedProvince);
  }, [selectedProvince]);

  useEffect(() => {
    if (selectedProvince !== 'Todas') {
      const provincesOfOperator = operatorToProvinces[selectedOperator] || [];
      if (!provincesOfOperator.includes(selectedProvince)) {
        setSelectedProvince('Todas');
      }
    }
  }, [selectedOperator, selectedProvince]);

  useEffect(() => {
    const config = QUARTER_CONFIG[selectedQuarter];
    const weekNumber = parseInt(selectedWeek.substring(1), 10);

    if (weekNumber < config.start || weekNumber > config.end) {
      setSelectedWeek(`W${config.start}`);
    }
  }, [selectedQuarter, selectedWeek]);

  return {
    selectedOperator,
    setSelectedOperator,
    selectedWeek,
    setSelectedWeek,
    selectedQuarter,
    setSelectedQuarter,
    selectedYear,
    setSelectedYear,
    selectedProvince,
    setSelectedProvince,
  };
};
