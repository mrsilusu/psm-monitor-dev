/**
 * useIOHandlers — I/O handlers extracted from App.jsx (Phase 9 refactoring)
 * Contains: processExcelFile, processCSVFile, handleUploadJustificativas,
 *           handleSaveData, handleImportData, handleImportJustificativas,
 *           handleExportJSON, handleDownloadCSV, handleExportJustificativasCSV,
 *           handleViewState
 */

import { QUARTER_CONFIG } from '../../config/quarterConfig';
import { ALL_WEEKS } from '../../config/constants';
import { ROUTES_BY_PSM } from '../../config/routeConfig';
import { findPSMForRoute as findPSMForRouteUtil } from '../../utils/routeUtils.js';
import { log, warn } from '../../utils/logger';

export function useIOHandlers({
  data,
  setData,
  justificativas,
  setJustificativas,
  rotasTestadas,
  setRotasTestadas,
  rotasValidadas,
  setRotasValidadas,
  selectedOperator,
  selectedQuarter,
  selectedYear,
  setSaveStatus,
  setLastSaveTime,
  isRotaTestada,
  isRotaValidada,
}) {

  // ============================================================================
  // IMPORTAR JUSTIFICATIVAS - CÓDIGO COMPLETO
  // ============================================================================

  /**
   * FUNÇÃO 1: Detectar PSM baseado no nome da rota
   */
  const findPSMForRoute = (routeName) => findPSMForRouteUtil(routeName);

  /**
   * FUNÇÃO 2: Carregar biblioteca XLSX dinamicamente
   */
  const loadXLSX = () => {
    return new Promise((resolve, reject) => {
      if (window.XLSX) {
        resolve(window.XLSX);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
      script.onload = () => resolve(window.XLSX);
      script.onerror = () => reject(new Error('Falha ao carregar biblioteca XLSX'));
      document.head.appendChild(script);
    });
  };

  /**
   * FUNÇÃO 3: Processar arquivo Excel (OTIMIZADO para fórmulas)
   */
  const processExcelFile = async (file) => {
    try {

      // 1. Carregar biblioteca XLSX
      const XLSX = await loadXLSX();

      // 2. Ler arquivo Excel COM CÁLCULO DE FÓRMULAS
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, {
        type: 'array',
        codepage: 65001,  // UTF-8
        cellFormula: true, // Preservar fórmulas
        cellStyles: true   // Preservar estilos
      });

      // 3. Pegar primeira aba
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // 4. Converter para JSON (array de arrays) COM VALORES CALCULADOS
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        raw: false,        // Valores como string
        defval: '',        // Default vazio
        blankrows: false   // Ignorar linhas vazias
      });

      // 5. Validar arquivo
      if (jsonData.length < 2) {
        alert('Arquivo Excel vazio ou inválido');
        return;
      }

      // 6. Buscar linha de cabeçalho (nas primeiras 5 linhas)
      const newJustificativas = {};
      let headerRow = -1;

      for (let i = 0; i < Math.min(5, jsonData.length); i++) {
        const row = jsonData[i];
        if (row && row.some(cell =>
          cell && (String(cell).toLowerCase().includes('secç') ||
                  String(cell).toLowerCase().includes('rota') ||
                  String(cell).toLowerCase().includes('secc'))
        )) {
          headerRow = i;

          break;
        }
      }

      if (headerRow === -1) {
        alert('Não foi possível encontrar os cabeçalhos.\n\nVerifique se o arquivo contém uma coluna "Secções" ou "Rota".');
        return;
      }

      // 7. Extrair headers
      const headers = jsonData[headerRow].map(h =>
        String(h || '').toLowerCase().trim()
      );

      // 8. Encontrar índices das colunas (OTIMIZADO)
      const seccaoIdx = headers.findIndex(h =>
        h.includes('secç') || h.includes('rota') || h.includes('secc')
      );
      const regiaoIdx = headers.findIndex(h =>
        h.includes('região') || h.includes('regiao')
      );
      // OTIMIZADO: aceita "Transporte Q 2" (com espaços)
      const transporteIdx = headers.findIndex(h =>
        h.includes('transporte') && (h.includes('q') || h.includes('2'))
      );
      // OTIMIZADO: aceita "Indisponíveis" simples
      const indisponiveisIdx = headers.findIndex(h =>
        h.includes('indispon') && !h.includes('delta')
      );
      // OTIMIZADO: aceita "Delta Indisponibilidade" com espaço
      const deltaIdx = headers.findIndex(h =>
        h.includes('delta')
      );
      // OTIMIZADO: aceita "JUSTIFICATIVA DEGRADAÇÃO" (maiúsculas)
      const justificativaIdx = headers.findIndex(h =>
        h.includes('justifica')
      );

      // 9. Validar coluna obrigatória
      if (seccaoIdx === -1) {
        alert('Não foi possível encontrar a coluna "Secções".\n\nColunas encontradas:\n' +
              headers.filter(h => h).join(', '));
        return;
      }

      // 10. Processar cada linha
      let totalImported = 0;
      let notFoundRoutes = [];
      let processedRows = 0;
      let skippedRows = 0;

      for (let i = headerRow + 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || row.length === 0) continue;

        const seccao = row[seccaoIdx] ? String(row[seccaoIdx]).trim() : '';

        // Ignorar linhas vazias ou com fórmulas não resolvidas
        if (!seccao || seccao === '' || seccao === '#REF!' || seccao === '#N/A') {
          skippedRows++;
          continue;
        }

        processedRows++;

        // 11. Detectar PSM automaticamente
        const detectedPSM = findPSMForRoute(seccao);

        if (!detectedPSM) {

          notFoundRoutes.push(seccao);
          continue;
        }

        // 12. Extrair valores da linha (OTIMIZADO para fórmulas)
        const regiao = regiaoIdx !== -1 && row[regiaoIdx] ?
          String(row[regiaoIdx]).trim() : '';

        // OTIMIZADO: converter valores que podem ser fórmulas ou strings
        const parseValue = (val) => {
          if (!val) return 0;
          const str = String(val).trim();
          if (str === '' || str === '#REF!' || str === '#N/A') return 0;
          const num = parseFloat(str);
          return isNaN(num) ? 0 : Math.round(num);
        };

        const transporte = transporteIdx !== -1 ? parseValue(row[transporteIdx]) : 0;
        const indisponiveis = indisponiveisIdx !== -1 ? parseValue(row[indisponiveisIdx]) : 0;
        const delta = deltaIdx !== -1 ? parseValue(row[deltaIdx]) : 0;

        const justificativa = justificativaIdx !== -1 && row[justificativaIdx] ?
          String(row[justificativaIdx]).trim() : '';

        // 13. Importar APENAS se tiver pelo menos UM valor diferente de zero
        // REGRA: Se Transporte=0 E Indisponíveis=0 E Delta=0 → NÃO IMPORTAR
        const temDadosValidos = transporte > 0 || indisponiveis > 0 || delta !== 0;

        if (temDadosValidos) {
          const key = detectedPSM + '_' + seccao;
          newJustificativas[key] = {
            seccao: seccao,
            regiao: regiao,
            transporte: transporte,
            indisponiveis: indisponiveis,
            delta: delta,
            justificativa: justificativa,
            psm: detectedPSM,
            quarter: selectedQuarter
          };
          totalImported++;

        } else {
          log('  ⚠️ Ignorado (todos valores = 0)');
          skippedRows++;
        }
      }

      // 14. Logs de estatísticas
      log('=' .repeat(60));

      log('=' .repeat(60));

      log('   ISISTEL:', Object.values(newJustificativas).filter(j => j.psm === 'ISISTEL').length);
      log('   FIBRASOL:', Object.values(newJustificativas).filter(j => j.psm === 'FIBRASOL').length);
      log('   ANGLOBAL:', Object.values(newJustificativas).filter(j => j.psm === 'ANGLOBAL').length);
      log('=' .repeat(60));

      // 15. Atualizar estado
      setJustificativas(prev => {
        const updated = { ...prev, ...newJustificativas };
        log('💾 Estado de justificativas atualizado. Total:', Object.keys(updated).length);
        return updated;
      });

      // 16. Feedback ao usuário (OTIMIZADO)
      if (totalImported === 0) {
        alert('⚠️ Nenhuma justificativa foi importada!\n\n' +
              'Possíveis causas:\n' +
              '• Nenhuma rota foi encontrada no sistema\n' +
              '• Todas as linhas estão vazias ou sem dados válidos\n\n' +
              `Linhas processadas: ${processedRows}\n` +
              `Rotas não encontradas: ${notFoundRoutes.length}`);
        return;
      }

      let message = '✅ Excel importado com sucesso!\n\n';
      message += `📊 ESTATÍSTICAS:\n`;
      message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
      message += `Linhas processadas: ${processedRows}\n`;
      message += `Total importado: ${totalImported} secções\n`;
      message += `Linhas ignoradas: ${skippedRows}\n`;
      message += `Trimestre: ${selectedQuarter}\n\n`;
      message += `📈 POR PSM:\n`;
      message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
      message += `• ISISTEL: ${Object.values(newJustificativas).filter(j => j.psm === 'ISISTEL').length}\n`;
      message += `• FIBRASOL: ${Object.values(newJustificativas).filter(j => j.psm === 'FIBRASOL').length}\n`;
      message += `• ANGLOBAL: ${Object.values(newJustificativas).filter(j => j.psm === 'ANGLOBAL').length}`;

      if (notFoundRoutes.length > 0) {
        message += `\n\n⚠️ ROTAS NÃO ENCONTRADAS (${notFoundRoutes.length}):\n`;
        message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
        message += notFoundRoutes.slice(0, 10).join('\n');
        if (notFoundRoutes.length > 10) {
          message += `\n... e mais ${notFoundRoutes.length - 10} rotas`;
        }
      }

      alert(message);

    } catch (error) {
      console.error('❌ Erro ao processar Excel:', error);
      alert('❌ Erro ao processar Excel!\n\n' +
            'Detalhes: ' + error.message + '\n\n' +
            'Verifique se o arquivo está correto e tente novamente.');
    }
  };

  /**
   * FUNÇÃO 4: Processar arquivo CSV
   */
  const processCSVFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          let text = e.target.result;

          // 1. Remover BOM UTF-8 se presente
          if (text.charCodeAt(0) === 0xFEFF) {
            text = text.substring(1);

          }

          const lines = text.split('\n');

          // 2. Validar arquivo
          if (lines.length < 2) {
            alert('Arquivo CSV vazio ou inválido');
            reject(new Error('Arquivo vazio'));
            return;
          }

          // 3. Extrair headers (linha 0)
          const headers = lines[0].split(',')
            .map(h => h.trim().replace(/"/g, '').toLowerCase());

          const newJustificativas = {};

          // 4. Encontrar índices das colunas
          const seccaoIdx = headers.findIndex(h =>
            h.includes('secç') || h.includes('rota') ||
            h.includes('troço') || h.includes('secc')
          );
          const regiaoIdx = headers.findIndex(h =>
            h.includes('região') || h.includes('regiao')
          );
          const transporteIdx = headers.findIndex(h =>
            h.includes('transporte')
          );
          const indisponiveisIdx = headers.findIndex(h =>
            h.includes('indispon') && !h.includes('delta')
          );
          const deltaIdx = headers.findIndex(h =>
            h.includes('delta')
          );
          const justificativaIdx = headers.findIndex(h =>
            h.includes('justifica')
          );

          if (seccaoIdx === -1) {
            alert('Arquivo deve conter a coluna "Secções" ou "Rota"');
            reject(new Error('Coluna Secções não encontrada'));
            return;
          }

          let totalImported = 0;
          let notFoundRoutes = [];
          let processedLines = 0;

          // 5. Processar cada linha
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            processedLines++;

            // 6. Parser CSV robusto (trata vírgulas dentro de aspas)
            const values = [];
            let currentValue = '';
            let insideQuotes = false;

            for (let char of line) {
              if (char === '"') {
                insideQuotes = !insideQuotes;
              } else if (char === ',' && !insideQuotes) {
                values.push(currentValue.trim().replace(/^"|"$/g, ''));
                currentValue = '';
              } else {
                currentValue += char;
              }
            }
            values.push(currentValue.trim().replace(/^"|"$/g, ''));

            // 7. Extrair secção/rota
            const seccao = values[seccaoIdx]?.trim();
            if (!seccao || seccao === '') continue;

            // 8. Detectar PSM automaticamente
            const detectedPSM = findPSMForRoute(seccao);

            if (!detectedPSM) {
              notFoundRoutes.push(seccao);
              continue;
            }

            // 9. Extrair valores
            const regiao = regiaoIdx !== -1 ? values[regiaoIdx]?.trim() : '';
            const transporte = transporteIdx !== -1 ?
              parseInt(values[transporteIdx]) || 0 : 0;
            const indisponiveis = indisponiveisIdx !== -1 ?
              parseInt(values[indisponiveisIdx]) || 0 : 0;
            const delta = deltaIdx !== -1 ?
              parseInt(values[deltaIdx]) || 0 : 0;
            const justificativa = justificativaIdx !== -1 ?
              values[justificativaIdx]?.trim() : '';

            // 10. Importar APENAS se tiver pelo menos UM valor diferente de zero
            // REGRA: Se Transporte=0 E Indisponíveis=0 E Delta=0 → NÃO IMPORTAR
            const temDadosValidos = transporte > 0 || indisponiveis > 0 || delta !== 0;

            if (temDadosValidos) {
              const key = detectedPSM + '_' + seccao;
              newJustificativas[key] = {
                seccao: seccao,
                regiao: regiao,
                transporte: transporte,
                indisponiveis: indisponiveis,
                delta: delta,
                justificativa: justificativa,
                psm: detectedPSM,
                quarter: selectedQuarter
              };
              totalImported++;

            } else {
              log('⚠️ Ignorado (todos valores = 0):', seccao);
            }
          }

          // 11. Atualizar estado
          setJustificativas(prev => {
            const updated = { ...prev, ...newJustificativas };
            log('💾 Estado de justificativas atualizado. Total:', Object.keys(updated).length);
            return updated;
          });

          // 12. Feedback
          let message = '✅ CSV importado com sucesso!\n';
          message += 'Linhas processadas: ' + processedLines + '\n';
          message += 'Total importado: ' + totalImported + ' secções\n';
          message += 'Trimestre: ' + selectedQuarter;

          if (notFoundRoutes.length > 0) {
            message += '\n\n⚠️ Rotas não encontradas (' + notFoundRoutes.length + '):\n';
            message += notFoundRoutes.slice(0, 10).join('\n');
            if (notFoundRoutes.length > 10) {
              message += '\n... e mais ' + (notFoundRoutes.length - 10) + ' rotas';
            }
          }

          alert(message);
          resolve();

        } catch (error) {
          console.error('❌ Erro ao processar CSV:', error);
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error('Erro ao ler o arquivo'));
      };

      // 13. Ler arquivo com UTF-8
      reader.readAsText(file, 'UTF-8');
    });
  };

  /**
   * FUNÇÃO 5: Handler principal de upload
   */
  const handleUploadJustificativas = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      // Detectar tipo de arquivo
      const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

      // Processar baseado no tipo
      if (isExcel) {
        await processExcelFile(file);
      } else {
        await processCSVFile(file);
      }
    } catch (error) {
      console.error('❌ Erro ao importar:', error);
      alert('Erro ao importar arquivo: ' + error.message);
    }

    // Limpar input (permite reimportar)
    event.target.value = '';
  };

  // ============================================================================
  // FASE 7.1: FUNÇÕES DOS BOTÕES DO MENU
  // ============================================================================

  // v3.13.8: Função CORRIGIDA - Salvar Dados PSM (localStorage + CSV)
  const handleSaveData = () => {
    try {
      // 1. Salvar no localStorage
      window.localStorage.setItem('psm_rotas_data_v3', JSON.stringify(data));
      window.localStorage.setItem('psm_justificativas_v1', JSON.stringify(justificativas));

      setSaveStatus('saved');
      setLastSaveTime(new Date());

      // 2. Exportar para CSV (igual handleDownloadCSV)
      // Header do CSV
      let csv = 'PSM,Semana,Rota,Transporte,Indisponíveis,Total Reparadas,Reconhecidas,Dep. Passagem Cabo,Dep. Licença,Dep. Cutover,Fibras Dependentes\n';

      // Obter semanas do quadrimestre selecionado
      const quarterWeeks = ALL_WEEKS.slice(
        QUARTER_CONFIG[selectedQuarter].start - 1,
        QUARTER_CONFIG[selectedQuarter].end
      );

      // Iterar sobre PSM selecionado, semanas do quadrimestre e rotas
      quarterWeeks.forEach(week => {
        if (data[selectedOperator] && data[selectedOperator][week]) {
          (ROUTES_BY_PSM[selectedOperator] || []).forEach(route => {
            const routeData = data[selectedOperator][week][route];
            if (routeData) {
              csv += `${selectedOperator},${week},"${route}",`;
              csv += `${routeData['Transporte'] || ''},`;
              csv += `${routeData['Indisponíveis'] || ''},`;
              csv += `${routeData['Total Reparadas'] || ''},`;
              csv += `${routeData['Reconhecidas'] || ''},`;
              csv += `${routeData['Dep. de Passagem de Cabo'] || ''},`;
              csv += `${routeData['Dep. de Licença'] || ''},`;
              csv += `${routeData['Dep. de Cutover'] || ''},`;
              csv += `${routeData[`Fibras dependentes da ${selectedOperator}`] || ''}\n`;
            }
          });
        }
      });

      // Criar e baixar arquivo CSV
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PSM_${selectedOperator}_${selectedQuarter}_${selectedYear}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      alert('✓ Dados salvos e exportados com sucesso!\n\n' +
            `💾 LocalStorage: Salvo\n` +
            `📄 CSV exportado: PSM_${selectedOperator}_${selectedQuarter}_${selectedYear}.csv\n\n` +
            `PSM: ${selectedOperator}\n` +
            `Quadrimestre: ${selectedQuarter}\n` +
            `Semanas: ${quarterWeeks.length}\n` +
            `Rotas: ${(ROUTES_BY_PSM[selectedOperator] || []).length}\n` +
            `Justificativas: ${Object.keys(justificativas).length}\n` +
            `Horário: ${new Date().toLocaleString('pt-BR')}`);

      setTimeout(() => setSaveStatus(''), 2000);
    } catch (error) {
      console.error('Erro ao salvar/exportar:', error);
      alert('✗ Erro ao salvar/exportar dados!\n\n' + error.message);
      setSaveStatus('error');
    }
  };

  // ============================================================================
  // FASE 17: IMPORTAR DADOS PSM (CSV/EXCEL)
  // ============================================================================

  // v3.13.16: IMPORTAÇÃO CORRIGIDA - Parser CSV robusto
  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';

    input.onchange = (event) => {
      // 1. Pegar arquivo selecionado
      const file = event.target.files[0];
      if (!file) return;  // Se cancelou, sair

      // 2. Criar leitor de arquivo
      const reader = new FileReader();

      // 3. Quando arquivo for lido
      reader.onload = (e) => {
        try {
          // 4. Pegar conteúdo do arquivo
          const text = e.target.result;

          // 5. Dividir em linhas
          const lines = text.split('\n');

          // 6. Validar: precisa ter pelo menos 2 linhas (header + 1 dado)
          if (lines.length < 2) {
            alert('Arquivo CSV vazio ou inválido');
            return;
          }

          // 7. Função para parsear linha CSV (respeita aspas)
          const parseCSVLine = (line) => {
            const values = [];
            let current = '';
            let inQuotes = false;

            for (let i = 0; i < line.length; i++) {
              const char = line[i];

              if (char === '"') {
                inQuotes = !inQuotes;
              } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
              } else {
                current += char;
              }
            }
            values.push(current.trim());
            return values;
          };

          // 8. Processar cabeçalho (linha 0)
          const headers = parseCSVLine(lines[0]);

          // 9. Clonar dados atuais (deep clone para não mutar estado)
          // v3.49.11: MERGE - Mantém dados de outros PSMs
          const newData = JSON.parse(JSON.stringify(data));

          log('📦 MERGE DE DADOS GERAIS:');
          log('  PSMs existentes:', Object.keys(data));
          log('  PSM sendo importado:', selectedOperator);

          let rowCount = 0;
          let errorCount = 0;

          // 10. Processar cada linha de dados (a partir da linha 1)
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;  // Pular linhas vazias

            try {
              // 11. Parsear valores da linha (respeitando aspas)
              const values = parseCSVLine(line);

              // v3.40.98: DETECTAR FORMATO DO CSV (com ou sem Ano/Quarter)
              const hasAnoColumn = headers[0] === 'Ano' || headers[0] === 'ano';

              let week, rota, dataStartIndex;

              if (hasAnoColumn) {
                // FORMATO NOVO: Ano,Quarter,Semana,Rota,...
                // Ignorar Ano e Quarter
                week = values[2]?.trim();   // Coluna 2: Semana
                rota = values[3]?.trim();   // Coluna 3: Rota
                dataStartIndex = 4;         // Dados começam na coluna 4

                log(`  📋 Formato NOVO detectado: Ano=${values[0]}, Quarter=${values[1]}, Semana=${week}`);
              } else {
                // FORMATO ANTIGO: Semana,Rota,...
                week = values[0]?.trim();   // Coluna 0: Semana
                rota = values[1]?.trim();   // Coluna 1: Rota
                dataStartIndex = 2;         // Dados começam na coluna 2

                log(`  📋 Formato ANTIGO detectado: Semana=${week}`);
              }

              // 12. Validar dados essenciais
              if (!week || !rota) {
                warn(`⚠️ Linha ${i} ignorada: week='${week}', rota='${rota}'`);
                continue;
              }

              // 13. Criar estrutura se não existir
              if (!newData[selectedOperator]) newData[selectedOperator] = {};
              if (!newData[selectedOperator][week]) newData[selectedOperator][week] = {};
              if (!newData[selectedOperator][week][rota]) newData[selectedOperator][week][rota] = {};

              // 14. Importar cada status (a partir da coluna dataStartIndex)
              for (let j = dataStartIndex; j < headers.length && j < values.length; j++) {
                let statusHeader = headers[j];  // Ex: 'Transporte' ou 'Fibras dependentes da FIBRASOL'
                const valueStr = values[j]?.trim() || '0';
                const value = parseInt(valueStr) || 0;  // Ex: 10

                // v3.13.22: NORMALIZAR "Fibras dependentes da [QUALQUER_PSM]"
                // para usar o PSM atualmente selecionado
                if (statusHeader.startsWith('Fibras dependentes da ')) {
                  // CSV pode ter "Fibras dependentes da FIBRASOL"
                  // mas estamos importando para ISISTEL
                  // então renomear para "Fibras dependentes da ISISTEL"
                  statusHeader = `Fibras dependentes da ${selectedOperator}`;

                }

                // 15. Atribuir valor com nome normalizado
                newData[selectedOperator][week][rota][statusHeader] = value;
              }

              rowCount++;

            } catch (lineError) {
              console.error(`✗ Erro na linha ${i}:`, lineError);
              errorCount++;
            }
          }

          // 16. Verificar se importou algo
          if (rowCount === 0) {
            alert('⚠️ Nenhum dado foi importado!\n\n' +
                  'Verifique:\n' +
                  '- Formato do CSV\n' +
                  '- PSM selecionado\n' +
                  '- Conteúdo do arquivo\n\n' +
                  'Veja o console (F12) para mais detalhes.');
            return;
          }

          // 17. Atualizar estado global (salva automaticamente no localStorage)
          setData(newData);

          log('  ✅ Estado atualizado - PSMs após merge:', Object.keys(newData));

          // v3.48.00: PROCESSAR VALIDAÇÕES POR SEMANA
          log('🔍 INICIANDO PROCESSAMENTO DE VALIDAÇÕES POR SEMANA...');
          log('  Headers:', headers);

          // V5.10.16: MERGE - Clonar estados atuais ao invés de criar vazios (com ANO)
          const novasTestadas = JSON.parse(JSON.stringify(rotasTestadas));
          const novasValidadas = JSON.parse(JSON.stringify(rotasValidadas));

          if (!novasTestadas[selectedYear]) novasTestadas[selectedYear] = {};
          if (!novasTestadas[selectedYear][selectedOperator]) novasTestadas[selectedYear][selectedOperator] = {};
          if (!novasValidadas[selectedYear]) novasValidadas[selectedYear] = {};
          if (!novasValidadas[selectedYear][selectedOperator]) novasValidadas[selectedYear][selectedOperator] = {};

          let validacoesImportadas = 0;

          // Encontrar índices das colunas
          const testadaIdx = headers.findIndex(h =>
            h === 'Testada' || h === 'testada' || h.includes('Testada')
          );
          const validadaIdx = headers.findIndex(h =>
            h === 'Validada' || h === 'validada' || h.includes('Validada')
          );

          log('  📊 ÍNDICES: Testada:', testadaIdx, 'Validada:', validadaIdx);

          if (testadaIdx >= 0 || validadaIdx >= 0) {
            log('  ✅ Colunas encontradas, processando...');

            // Processar TODAS as linhas (cada linha = uma semana)
            for (let i = 1; i < lines.length; i++) {
              const line = lines[i].trim();
              if (!line) continue;

              try {
                const values = parseCSVLine(line);
                const hasAnoColumn = headers[0] === 'Ano' || headers[0] === 'ano';

                let semana, rota;
                if (hasAnoColumn) {
                  semana = values[2]?.trim();  // Ano,Quarter,Semana
                  rota = values[3]?.trim();
                } else {
                  semana = values[0]?.trim();  // Semana,Rota
                  rota = values[1]?.trim();
                }

                if (!semana || !rota) continue;

                // V5.10.16: Inicializar semana se necessário (com ANO)
                if (!novasTestadas[selectedYear][selectedOperator][semana]) {
                  novasTestadas[selectedYear][selectedOperator][semana] = {};
                }
                if (!novasValidadas[selectedYear][selectedOperator][semana]) {
                  novasValidadas[selectedYear][selectedOperator][semana] = {};
                }

                // Importar testada
                if (testadaIdx >= 0) {
                  const testadaVal = (values[testadaIdx] || '').toString().trim().toUpperCase();

                  if (testadaVal === 'SIM' || testadaVal === 'TRUE' || testadaVal === '1') {
                    novasTestadas[selectedYear][selectedOperator][semana][rota] = {
                      testada: true
                    };
                    validacoesImportadas++;
                  }
                }

                // Importar validada
                if (validadaIdx >= 0) {
                  const validadaVal = (values[validadaIdx] || '').toString().trim().toUpperCase();

                  if (validadaVal === 'SIM' || validadaVal === 'TRUE' || validadaVal === '1') {
                    novasValidadas[selectedYear][selectedOperator][semana][rota] = {
                      validada: true
                    };
                    validacoesImportadas++;
                  }
                }
              } catch (e) {
                console.error('  ❌ Erro na linha', i, ':', e);
              }
            }

            // Atualizar estados
            log('  📦 MERGE DE DADOS:');
            log('    PSMs antes:', Object.keys(rotasTestadas));
            log('    PSM importado:', selectedOperator);
            log('    PSMs depois:', Object.keys(novasTestadas));

            setRotasTestadas(novasTestadas);
            setRotasValidadas(novasValidadas);

            log('  ✅ Validações importadas:', validacoesImportadas);

            // Contar semanas e rotas
            const semanasTest = Object.keys(novasTestadas[selectedOperator] || {}).length;
            const semanasValid = Object.keys(novasValidadas[selectedOperator] || {}).length;
            log('  📅 Semanas com testadas:', semanasTest);
            log('  📅 Semanas com validadas:', semanasValid);
          }

          // 18. DEBUG: Verificar dados importados

          // Pegar primeira semana e primeira rota para debug
          const firstWeek = Object.keys(newData[selectedOperator] || {})[0];
          const firstRoute = firstWeek ? Object.keys(newData[selectedOperator][firstWeek])[0] : null;

          if (firstWeek && firstRoute) {
            const sampleData = newData[selectedOperator][firstWeek][firstRoute];

            log('  Campos importados:', Object.keys(sampleData));

            // Verificar campos específicos - TODOS

            log('  Transporte:', sampleData['Transporte'], '(tipo:', typeof sampleData['Transporte'], ')');
            log('  Indisponíveis:', sampleData['Indisponíveis'], '(tipo:', typeof sampleData['Indisponíveis'], ')');
            log('  Total Reparadas:', sampleData['Total Reparadas'], '(tipo:', typeof sampleData['Total Reparadas'], ')');
            log('  Reconhecidas:', sampleData['Reconhecidas'], '(tipo:', typeof sampleData['Reconhecidas'], ')');
            log('  Dep. de Passagem de Cabo:', sampleData['Dep. de Passagem de Cabo'], '(tipo:', typeof sampleData['Dep. de Passagem de Cabo'], ')');
            log('  Dep. de Licença:', sampleData['Dep. de Licença'], '(tipo:', typeof sampleData['Dep. de Licença'], ')');
            log('  Dep. de Cutover:', sampleData['Dep. de Cutover'], '(tipo:', typeof sampleData['Dep. de Cutover'], ')');
            log('  Fibras dependentes da ' + selectedOperator + ':', sampleData[`Fibras dependentes da ${selectedOperator}`], '(tipo:', typeof sampleData[`Fibras dependentes da ${selectedOperator}`], ')');

            // Verificar se campo existe

          } else {
            warn('⚠️ Nenhum dado encontrado após importação!');
          }

          // 19. Contar detalhes da importação
          let semanasCont = new Set();
          let rotasCont = new Set();

          if (newData[selectedOperator]) {
            Object.keys(newData[selectedOperator]).forEach(week => {
              semanasCont.add(week);
              if (newData[selectedOperator][week]) {
                Object.keys(newData[selectedOperator][week]).forEach(rota => {
                  rotasCont.add(rota);
                });
              }
            });
          }

          log('  Semanas:', Array.from(semanasCont).sort().join(', '));

          // 19. Contar validações por semana
          let rotasTestCount = 0;
          let rotasValidCount = 0;

          Object.keys(novasTestadas[selectedOperator] || {}).forEach(semana => {
            rotasTestCount += Object.keys(novasTestadas[selectedOperator][semana]).length;
          });

          Object.keys(novasValidadas[selectedOperator] || {}).forEach(semana => {
            rotasValidCount += Object.keys(novasValidadas[selectedOperator][semana]).length;
          });

          // 20. Confirmar sucesso
          alert(`✓ Dados importados com sucesso!\n\n` +
                `PSM: ${selectedOperator}\n` +
                `Linhas CSV: ${rowCount}\n` +
                `Semanas com dados: ${semanasCont.size}\n` +
                `Rotas únicas: ${rotasCont.size}\n` +
                `🧪 Marcações testadas: ${rotasTestCount}\n` +
                `✅ Marcações validadas: ${rotasValidCount}\n` +
                (errorCount > 0 ? `Linhas com erro: ${errorCount}\n` : '') +
                `Arquivo: ${file.name}\n\n` +
                `💡 Use os dropdowns para navegar entre semanas!`);

        } catch (error) {
          // 19. Capturar erros de parsing
          console.error('✗ Erro ao importar CSV:', error);
          console.error('Stack:', error.stack);
          alert('✗ Erro ao importar CSV!\n\n' +
                error.message + '\n\n' +
                'Abra o console (F12) para mais detalhes.');
        }
      };

      // 20. Tratar erro de leitura do arquivo
      reader.onerror = () => {
        alert('Erro ao ler o arquivo');
      };

      // 21. Iniciar leitura como texto
      reader.readAsText(file);

      // 22. Limpar input (permite importar o mesmo arquivo novamente)
      event.target.value = '';
    };

    input.click();
  };

  // ============================================================================
  // FASE 18: IMPORTAR JUSTIFICATIVAS
  // ============================================================================

  const handleImportJustificativas = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';

    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const fileName = file.name.toLowerCase();

        if (!fileName.endsWith('.csv')) {
          alert('⚠️ Formato não suportado!\n\n' +
                'Apenas arquivos CSV são suportados para justificativas.\n\n' +
                'Formato esperado:\n' +
                'PSM,Semana,Rota,Justificativa');
          return;
        }

        // Ler arquivo CSV
        const text = await file.text();

        // Detectar delimitador
        const firstLine = text.split('\n')[0];
        let delimiter = ',';
        if (firstLine.split(';').length > firstLine.split(',').length) {
          delimiter = ';';
        } else if (firstLine.split('\t').length > firstLine.split(',').length) {
          delimiter = '\t';
        }

        // Parsear CSV
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(delimiter).map(h => h.trim().replace(/['"]/g, '').toLowerCase());

        // Validar headers necessários
        const hasPSM = headers.some(h => h.includes('psm'));
        const hasSemana = headers.some(h => h.includes('semana') || h.includes('week'));
        const hasRota = headers.some(h => h.includes('rota') || h.includes('route'));
        const hasJustificativa = headers.some(h => h.includes('justif') || h.includes('observ') || h.includes('coment'));

        if (!hasPSM || !hasSemana || !hasRota || !hasJustificativa) {
          alert('⚠️ Estrutura CSV inválida!\n\n' +
                'Headers obrigatórios:\n' +
                '- PSM\n' +
                '- Semana (ou Week)\n' +
                '- Rota (ou Route)\n' +
                '- Justificativa (ou Observação/Comentário)\n\n' +
                `Headers encontrados:\n${headers.join(', ')}`);
          return;
        }

        // Mapear índices das colunas
        const colIndexes = {
          psm: headers.findIndex(h => h.includes('psm')),
          semana: headers.findIndex(h => h.includes('semana') || h.includes('week')),
          rota: headers.findIndex(h => h.includes('rota') || h.includes('route')),
          justificativa: headers.findIndex(h => h.includes('justif') || h.includes('observ') || h.includes('coment'))
        };

        let importedJustificativas = {};
        let rowCount = 0;

        // Processar linhas
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          // Split respeitando aspas
          const values = [];
          let current = '';
          let inQuotes = false;

          for (let char of line) {
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === delimiter && !inQuotes) {
              values.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          values.push(current.trim());

          // Extrair dados
          const psm = values[colIndexes.psm]?.trim();
          const semana = values[colIndexes.semana]?.trim();
          const rota = values[colIndexes.rota]?.trim().replace(/['"]/g, '');
          const justificativa = values[colIndexes.justificativa]?.trim().replace(/['"]/g, '');

          if (!psm || !semana || !rota || !justificativa) continue;

          // Criar chave única: PSM_Semana_Rota
          const key = `${psm}_${semana}_${rota}`;
          importedJustificativas[key] = justificativa;
          rowCount++;
        }

        if (rowCount > 0) {
          // Mesclar com justificativas existentes
          const newJustificativas = { ...justificativas, ...importedJustificativas };
          setJustificativas(newJustificativas);

          log('  Total justificativas:', Object.keys(newJustificativas).length);

          alert(`✓ Importação de justificativas bem-sucedida!\n\n` +
                `📂 Arquivo: ${file.name}\n` +
                `📝 Justificativas importadas: ${rowCount}\n` +
                `📊 Total no sistema: ${Object.keys(newJustificativas).length}\n\n` +
                `As justificativas foram mescladas com as existentes.\n` +
                `Acesse a "Tabela de Acompanhamento" para visualizar.`);
        } else {
          alert('⚠️ Nenhuma justificativa foi importada!\n\n' +
                'Verifique:\n' +
                '- Arquivo tem dados (além do header)\n' +
                '- Colunas obrigatórias preenchidas\n' +
                '- Formato correto');
        }

      } catch (error) {
        console.error('✗ Erro ao importar justificativas:', error);
        alert(`✗ Erro ao importar justificativas!\n\n` +
              `Erro: ${error.message}\n\n` +
              `Verifique:\n` +
              `- Formato do arquivo (CSV com header)\n` +
              `- Codificação (UTF-8)\n` +
              `- Estrutura: PSM,Semana,Rota,Justificativa`);
      }
    };

    input.click();
  };

  // Função: Exportar JSON Backup
  const handleExportJSON = () => {
    try {
      const backup = {
        version: '1.7.1',
        timestamp: new Date().toISOString(),
        data: data,
        justificativas: justificativas,
        metadata: {
          totalRoutes: Object.values(ROUTES_BY_PSM).reduce((acc, r) => acc + r.length, 0),
          psms: Object.keys(ROUTES_BY_PSM),
          weeks: ALL_WEEKS.length,
          quarters: Object.keys(QUARTER_CONFIG)
        }
      };

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PSM_Backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      alert('✓ Backup JSON exportado com sucesso!\n\n' +
            `Arquivo: PSM_Backup_${new Date().toISOString().split('T')[0]}.json\n` +
            `Tamanho: ${Math.round(blob.size / 1024)} KB`);
    } catch (error) {
      console.error('Erro ao exportar JSON:', error);
      alert('✗ Erro ao exportar backup!\n\n' + error.message);
    }
  };

  // v3.13.13: Função RESTAURADA - Formato ORIGINAL do código reconstituído
  const handleDownloadCSV = () => {
    try {
      // 1. Pegar PSM selecionado e ano atual
      const psm = selectedOperator;
      const anoAtual = selectedYear;

      // v3.40.88: Função para determinar Quarter baseado na semana
      const getQuarterFromWeek = (week) => {
        const weekNum = parseInt(week.substring(1));
        if (weekNum >= 1 && weekNum <= 18) return 'Q1';
        if (weekNum >= 19 && weekNum <= 35) return 'Q2';
        if (weekNum >= 36 && weekNum <= 52) return 'Q3';
        return 'Q1';
      };

      // 2. Criar cabeçalho CSV
      const statusCategorias = [
        'Transporte',
        'Indisponíveis',
        'Total Reparadas',
        'Reconhecidas',
        'Dep. de Passagem de Cabo',
        'Dep. de Licença',
        'Dep. de Cutover',
        'Fibras dependentes'
      ];

      const statusHeaders = statusCategorias.map(status =>
        status === "Fibras dependentes" ? 'Fibras dependentes da ' + psm : status
      );

      // v3.48.00: Header com 2 colunas de validação (POR SEMANA)
      const csvHeader = 'Ano,Quarter,Semana,Rota,' + statusHeaders.join(',') + ',Testada,Validada\n';

      // v3.40.88: Coletar dados do ANO ATUAL (W1-W52 do ano selecionado)
      const weeks = ALL_WEEKS;
      const rotas = ROUTES_BY_PSM[selectedOperator] || [];
      let dadosAnoAtual = [];

      weeks.forEach(week => {
        const quarter = getQuarterFromWeek(week);

        rotas.forEach(rota => {
          const rotaData = data[psm]?.[week]?.[rota] || {};
          const valores = statusHeaders.map(header => rotaData[header] || 0);

          // v3.48.00: Verificar ESTA semana específica
          const testada = isRotaTestada(psm, week, rota) ? 'SIM' : '';
          const validada = isRotaValidada(psm, week, rota) ? 'SIM' : '';

          // Criar linha: Ano,Quarter,Semana,Rota,...,Testada,Validada
          const linha = anoAtual + ',' + quarter + ',' + week + ',' + rota + ',' + valores.join(',') +
                       ',' + testada + ',' + validada;
          dadosAnoAtual.push(linha);
        });
      });

      // v3.40.88: Perguntar se quer manter histórico de outros anos
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.csv';

      input.onchange = async (e) => {
        const file = e.target.files[0];
        let dadosOutrosAnos = [];

        if (file) {
          // Ler arquivo existente
          const text = await file.text();
          const linhas = text.split('\n');

          // v3.40.88: Manter apenas dados de OUTROS anos (não do ano atual)
          for (let i = 1; i < linhas.length; i++) {
            const linha = linhas[i].trim();
            if (!linha) continue;

            const anoLinha = linha.split(',')[0];

            // Manter apenas se for de outro ano
            if (anoLinha !== anoAtual.toString()) {
              dadosOutrosAnos.push(linha);
            }
          }

          log(`✓ Mantendo ${dadosOutrosAnos.length} linhas de outros anos`);
          log(`✓ Atualizando ${dadosAnoAtual.length} linhas de ${anoAtual}`);
        }

        // v3.40.88: Montar CSV: Header + Outros anos + Ano atual
        let csvFinal = csvHeader;

        // Adicionar outros anos (ordenados)
        if (dadosOutrosAnos.length > 0) {
          csvFinal += dadosOutrosAnos.join('\n') + '\n';
        }

        // Adicionar ano atual (atualiza ou adiciona)
        csvFinal += dadosAnoAtual.join('\n') + '\n';

        // Salvar arquivo
        const blob = new Blob(['﻿' + csvFinal], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

        const hoje = new Date();
        const dataExportacao = hoje.toISOString().split('T')[0];
        const nomeArquivo = `${psm}_Historico_${dataExportacao}.csv`;

        a.download = nomeArquivo;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        const totalLinhas = dadosOutrosAnos.length + dadosAnoAtual.length;
        const anosUnicos = new Set([...dadosOutrosAnos.map(l => l.split(',')[0]), anoAtual.toString()]);

        alert(`✅ CSV salvo com sucesso!\n\n` +
              `📊 Anos no arquivo: ${Array.from(anosUnicos).sort().join(', ')}\n` +
              `📊 Total de linhas: ${totalLinhas}\n` +
              `📊 Ano ${anoAtual}: ${dadosAnoAtual.length} linhas (atualizado)\n\n` +
              `Arquivo: ${nomeArquivo}`);
      };

      // Mostrar dialog
      const mensagem = `📁 Salvar dados de ${anoAtual}\n\n` +
                       `Deseja manter histórico de outros anos?\n\n` +
                       `SIM: Selecione o CSV anterior\n` +
                       `→ Dados de ${anoAtual} serão atualizados\n` +
                       `→ Outros anos serão mantidos\n\n` +
                       `NÃO: Cancelar e salvar apenas ${anoAtual}`;

      if (confirm(mensagem)) {
        input.click();
      } else {
        // Salvar apenas ano atual
        let csvFinal = csvHeader + dadosAnoAtual.join('\n') + '\n';

        const blob = new Blob(['﻿' + csvFinal], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

        const hoje = new Date();
        const dataExportacao = hoje.toISOString().split('T')[0];
        const nomeArquivo = `${psm}_${anoAtual}_${dataExportacao}.csv`;

        a.download = nomeArquivo;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        alert(`✅ CSV salvo com sucesso!\n\n` +
              `📊 Ano ${anoAtual}: ${dadosAnoAtual.length} linhas\n\n` +
              `Arquivo: ${nomeArquivo}`);
      }

    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      alert('❌ Erro ao exportar CSV: ' + error.message);
    }
  };

  // ============================================================================
  // FASE 19: EXPORTAR JUSTIFICATIVAS CSV
  // ============================================================================

  const handleExportJustificativasCSV = () => {
    try {

      // Header do CSV
      let csv = 'PSM,Semana,Rota,Justificativa\n';

      // Iterar sobre justificativas
      let count = 0;
      Object.entries(justificativas).forEach(([key, justificativa]) => {
        // Chave formato: PSM_Semana_Rota
        const parts = key.split('_');
        if (parts.length >= 3) {
          const psm = parts[0];
          const semana = parts[1];
          const rota = parts.slice(2).join('_'); // Rota pode ter underscore no nome

          // Escapar aspas na justificativa
          const justificativaEscaped = justificativa.replace(/"/g, '""');

          csv += `${psm},${semana},"${rota}","${justificativaEscaped}"\n`;
          count++;
        }
      });

      if (count === 0) {
        alert('⚠️ Nenhuma justificativa para exportar!\n\n' +
              'Adicione justificativas primeiro:\n' +
              '- Edite na Tabela de Acompanhamento\n' +
              '- Ou importe via CSV');
        return;
      }

      // Criar e baixar arquivo
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      // Formato: PSM_Justificativas_2025-12-28_15-30-45.csv
      const hoje = new Date();
      const dataExportacao = hoje.toISOString().split('T')[0]; // 2025-12-28
      const horaExportacao = hoje.toTimeString().split(' ')[0].replace(/:/g, '-'); // 15-30-45
      a.download = `PSM_Justificativas_${dataExportacao}_${horaExportacao}.csv`;

      a.click();
      URL.revokeObjectURL(url);

      alert(`✓ Justificativas exportadas com sucesso!\n\n` +
            `📝 Total exportado: ${count} justificativas\n` +
            `📂 Arquivo: ${a.download}\n\n` +
            `Use este arquivo para backup ou reimportação.`);
    } catch (error) {
      console.error('Erro ao exportar justificativas:', error);
      alert('✗ Erro ao exportar justificativas!\n\n' + error.message);
    }
  };

  // Função: Ver Estado no Console
  const handleViewState = () => {
    console.clear();

    log('Total PSMs:', Object.keys(ROUTES_BY_PSM).length);
    log('Total Rotas:', Object.values(ROUTES_BY_PSM).reduce((acc, r) => acc + r.length, 0));

    log('Justificativas carregadas:', Object.keys(justificativas).length);

    log('Tamanho data:', new Blob([localStorage.getItem('psm_rotas_data_v3') || '']).size, 'bytes');
    log('Tamanho justificativas:', new Blob([localStorage.getItem('psm_justificativas_v1') || '']).size, 'bytes');

    alert('✓ Estado completo exibido no console!\n\nAbra o DevTools (F12) para visualizar.');
  };

  return {
    handleUploadJustificativas,
    handleSaveData,
    handleImportData,
    handleImportJustificativas,
    handleExportJSON,
    handleDownloadCSV,
    handleExportJustificativasCSV,
    handleViewState,
  };
}
