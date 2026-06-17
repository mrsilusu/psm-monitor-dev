import React, { useState } from 'react';
import { BarChart3, PieChart, TrendingUp } from 'lucide-react';

const AnaliseContainer = ({
  selectedProvince,
  selectedQuarter,
  selectedWeek,
  selectedYear,
  data,
  trendData,
  pieChartData,
}) => {
  const [hoveredPieSlice, setHoveredPieSlice] = useState(null);
  const [hoveredWeekIndex, setHoveredWeekIndex] = useState(null);
  return (
    <>
          {/* v3.13.0: Análise Comparativa - 2 Colunas Lado a Lado Estilo Performance */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <BarChart3 className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-800">
                  Análise Comparativa: Distribuição e Tendências
                  {selectedProvince !== 'Todas' && <span className="text-blue-600"> | {selectedProvince}</span>}
                </h2>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                
                {/* COLUNA 1: Distribuição por Status - ESQUERDA - COMPACTO */}
                <div className="bg-blue-50 rounded-lg border border-blue-200 p-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <PieChart className="w-4 h-4 text-blue-600" />
                      <h3 className="text-xs font-semibold text-blue-700">Distribuição por Status - {selectedQuarter}</h3>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-[10px] text-blue-600 font-medium">Dinâmico</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    {/* Altura reduzida de 340px para 280px */}
                    <div className="relative mb-2 w-full" style={{ height: '280px' }}>
                      <svg width="100%" height="100%" viewBox="0 0 400 280" preserveAspectRatio="xMidYMid meet">
                        <defs>
                          <filter id="shadow2">
                            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15"/>
                          </filter>
                        </defs>
                        
                        {(() => {
                          const centerX = 200;
                          const centerY = 160;
                          
                          // FASE 2: Definir raios para DOIS ANÉIS
                          // ANEL EXTERNO (Outer - Transporte e Indisponíveis)
                          const outerRingOuter = 120;  // Raio externo do anel externo
                          const outerRingInner = 95;   // Raio interno do anel externo
                          
                          // ANEL INTERNO (Inner - Subcategorias)
                          const innerRingOuter = 90;   // Raio externo do anel interno
                          const innerRingInner = 60;   // Raio interno do anel interno
                          
                          return (
                            <>
                              {/* ========== ANEL EXTERNO (OUTER) ========== */}
                              {(() => {
                                let currentAngle = 0;
                                return pieChartData.outer.map((slice, index) => {
                                  const startAngle = currentAngle;
                                  const sliceAngle = (slice.percentage / 100) * 180;
                                  const endAngle = startAngle + sliceAngle;
                                  currentAngle = endAngle;
                                  
                                  const startRadians = (startAngle) * Math.PI / 180;
                                  const endRadians = (endAngle) * Math.PI / 180;
                                  
                                  // Pontos do arco EXTERNO
                                  const x1 = centerX + outerRingOuter * Math.cos(startRadians);
                                  const y1 = centerY - outerRingOuter * Math.sin(startRadians);
                                  const x2 = centerX + outerRingOuter * Math.cos(endRadians);
                                  const y2 = centerY - outerRingOuter * Math.sin(endRadians);
                                  
                                  const x3 = centerX + outerRingInner * Math.cos(endRadians);
                                  const y3 = centerY - outerRingInner * Math.sin(endRadians);
                                  const x4 = centerX + outerRingInner * Math.cos(startRadians);
                                  const y4 = centerY - outerRingInner * Math.sin(startRadians);
                                  
                                  const largeArcFlag = sliceAngle > 180 ? 1 : 0;
                                  
                                  const pathData = [
                                    `M ${x1} ${y1}`,
                                    `A ${outerRingOuter} ${outerRingOuter} 0 ${largeArcFlag} 0 ${x2} ${y2}`,
                                    `L ${x3} ${y3}`,
                                    `A ${outerRingInner} ${outerRingInner} 0 ${largeArcFlag} 1 ${x4} ${y4}`,
                                    'Z'
                                  ].join(' ');
                                  
                                  const isHovered = hoveredPieSlice === `outer-${index}`;
                                  
                                  return (
                                    <g key={`outer-${index}`}>
                                      <path 
                                        d={pathData} 
                                        fill={slice.color} 
                                        stroke="white" 
                                        strokeWidth="3" 
                                        filter="url(#shadow2)"
                                        className="transition-all cursor-pointer"
                                        style={{
                                          opacity: hoveredPieSlice === null ? 0.95 : (isHovered ? 1 : 0.4),
                                          transform: isHovered ? 'scale(1.03)' : 'scale(1)',
                                          transformOrigin: `${centerX}px ${centerY}px`
                                        }}
                                        onMouseEnter={() => setHoveredPieSlice(`outer-${index}`)}
                                        onMouseLeave={() => setHoveredPieSlice(null)}
                                      />
                                      {isHovered && (
                                        <g>
                                          <rect 
                                            x={centerX - 70} 
                                            y={centerY - 100} 
                                            width="140" 
                                            height="75" 
                                            rx="8" 
                                            fill="white" 
                                            stroke={slice.color}
                                            strokeWidth="2"
                                            filter="url(#shadow2)"
                                          />
                                          <text x={centerX} y={centerY - 72} fontSize="12" fontWeight="bold" fill="#374151" textAnchor="middle">{slice.label}</text>
                                          <text x={centerX} y={centerY - 50} fontSize="22" fontWeight="bold" fill={slice.color} textAnchor="middle">{slice.percentage}%</text>
                                          <text x={centerX} y={centerY - 30} fontSize="11" fill="#6b7280" textAnchor="middle">{slice.value} fibras</text>
                                        </g>
                                      )}
                                    </g>
                                  );
                                });
                              })()}
                              
                              {/* ========== ANEL INTERNO (INNER) ========== */}
                              {(() => {
                                let currentAngle = 0;
                                return pieChartData.inner.map((slice, index) => {
                                  const startAngle = currentAngle;
                                  const sliceAngle = (slice.percentage / 100) * 180;
                                  const endAngle = startAngle + sliceAngle;
                                  currentAngle = endAngle;
                                  
                                  const startRadians = (startAngle) * Math.PI / 180;
                                  const endRadians = (endAngle) * Math.PI / 180;
                                  
                                  // Pontos do arco INTERNO
                                  const x1 = centerX + innerRingOuter * Math.cos(startRadians);
                                  const y1 = centerY - innerRingOuter * Math.sin(startRadians);
                                  const x2 = centerX + innerRingOuter * Math.cos(endRadians);
                                  const y2 = centerY - innerRingOuter * Math.sin(endRadians);
                                  
                                  const x3 = centerX + innerRingInner * Math.cos(endRadians);
                                  const y3 = centerY - innerRingInner * Math.sin(endRadians);
                                  const x4 = centerX + innerRingInner * Math.cos(startRadians);
                                  const y4 = centerY - innerRingInner * Math.sin(startRadians);
                                  
                                  const largeArcFlag = sliceAngle > 180 ? 1 : 0;
                                  
                                  const pathData = [
                                    `M ${x1} ${y1}`,
                                    `A ${innerRingOuter} ${innerRingOuter} 0 ${largeArcFlag} 0 ${x2} ${y2}`,
                                    `L ${x3} ${y3}`,
                                    `A ${innerRingInner} ${innerRingInner} 0 ${largeArcFlag} 1 ${x4} ${y4}`,
                                    'Z'
                                  ].join(' ');
                                  
                                  const isHovered = hoveredPieSlice === `inner-${index}`;
                                  
                                  return (
                                    <g key={`inner-${index}`}>
                                      <path 
                                        d={pathData} 
                                        fill={slice.color} 
                                        stroke="white" 
                                        strokeWidth="2" 
                                        filter="url(#shadow2)"
                                        className="transition-all cursor-pointer"
                                        style={{
                                          opacity: hoveredPieSlice === null ? 0.85 : (isHovered ? 1 : 0.3),
                                          transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                                          transformOrigin: `${centerX}px ${centerY}px`
                                        }}
                                        onMouseEnter={() => setHoveredPieSlice(`inner-${index}`)}
                                        onMouseLeave={() => setHoveredPieSlice(null)}
                                      />
                                      {isHovered && (
                                        <g>
                                          <rect 
                                            x={centerX - 65} 
                                            y={centerY - 95} 
                                            width="130" 
                                            height="70" 
                                            rx="8" 
                                            fill="white" 
                                            stroke={slice.color}
                                            strokeWidth="2"
                                            filter="url(#shadow2)"
                                          />
                                          <text x={centerX} y={centerY - 70} fontSize="11" fontWeight="bold" fill="#374151" textAnchor="middle">{slice.label}</text>
                                          <text x={centerX} y={centerY - 50} fontSize="18" fontWeight="bold" fill={slice.color} textAnchor="middle">{slice.percentage}%</text>
                                          <text x={centerX} y={centerY - 32} fontSize="10" fill="#6b7280" textAnchor="middle">{slice.value} fibras</text>
                                        </g>
                                      )}
                                    </g>
                                  );
                                });
                              })()}
                              
                              <text x="200" y="190" fontSize="22" fontWeight="bold" fill="#374151" textAnchor="middle">Status</text>
                              <text x="200" y="210" fontSize="11" fill="#6b7280" textAnchor="middle">{selectedQuarter} {selectedYear}</text>
                            </>
                          );
                        })()}
                        
                      </svg>
                    </div>
                    
                    {/* FASE 3: LEGENDA HIERÁRQUICA */}
                    <div className="flex flex-col items-center gap-2 text-xs">
                      
                      {/* OUTER (Categorias Principais) - DESTAQUE */}
                      <div className="flex flex-wrap justify-center gap-3">
                        {pieChartData.outer.map((item, index) => {
                          const isHovered = hoveredPieSlice === `outer-${index}`;
                          
                          return (
                            <div 
                              key={`legend-outer-${index}`}
                              className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-gray-50 to-white border-2 rounded-lg transition-all duration-200 cursor-pointer"
                              style={{
                                borderColor: isHovered ? item.color : '#e5e7eb',
                                transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                                boxShadow: isHovered ? `0 2px 8px ${item.color}40` : 'none'
                              }}
                              onMouseEnter={() => setHoveredPieSlice(`outer-${index}`)}
                              onMouseLeave={() => setHoveredPieSlice(null)}
                            >
                              <div 
                                className="w-4 h-4 rounded transition-transform duration-200" 
                                style={{ 
                                  backgroundColor: item.color,
                                  transform: isHovered ? 'scale(1.2)' : 'scale(1)'
                                }}
                              ></div>
                              <span className="font-bold text-gray-800">{item.label}</span>
                              <span className="font-bold" style={{ color: item.color }}>{item.percentage}%</span>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* INNER (Subcategorias) - COMPACTO */}
                      <div className="flex flex-wrap justify-center gap-2 mt-1">
                        {pieChartData.inner.map((item, index) => {
                          const isHovered = hoveredPieSlice === `inner-${index}`;
                          
                          return (
                            <div 
                              key={`legend-inner-${index}`}
                              className="flex items-center space-x-1 px-2 py-0.5 bg-white border rounded transition-all duration-200 cursor-pointer"
                              style={{
                                borderColor: isHovered ? item.color : '#e5e7eb',
                                opacity: hoveredPieSlice === null || isHovered ? 1 : 0.5,
                                transform: isHovered ? 'scale(1.05)' : 'scale(1)'
                              }}
                              onMouseEnter={() => setHoveredPieSlice(`inner-${index}`)}
                              onMouseLeave={() => setHoveredPieSlice(null)}
                            >
                              <div 
                                className="w-2.5 h-2.5 rounded transition-transform duration-200" 
                                style={{ 
                                  backgroundColor: item.color,
                                  transform: isHovered ? 'scale(1.2)' : 'scale(1)'
                                }}
                              ></div>
                              <span className="text-gray-600 text-[10px]">{item.label}:</span>
                              <span className="font-semibold text-[10px]" style={{ color: item.color }}>{item.percentage}%</span>
                            </div>
                          );
                        })}
                      </div>
                      
                    </div>
                  </div>
                </div>
                
                {/* COLUNA 2: Evolução Temporal - DIREITA - COMPACTO */}
                <div className="bg-green-50 rounded-lg border border-green-200 p-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <h3 className="text-xs font-semibold text-green-700">Evolução Temporal - Até {selectedWeek}</h3>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-[10px] text-green-600 font-medium">Plateau até W52</span>
                    </div>
                  </div>
                  
                  <div className="w-full" style={{ height: '320px' }}>
                    <svg width="100%" height="100%" viewBox="0 0 600 320" preserveAspectRatio="xMidYMid meet">
                      <defs>
                        <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                          <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
                        </pattern>
                      </defs>
                      <rect width="600" height="280" fill="url(#grid)" />
                      
                      {(() => {
                        // v3.40.81: EIXO Y SEMPRE COMEÇA DO ZERO
                        const allValues = trendData.flatMap(item => [
                          item.indisponiveis,
                          item.totalReparadas,
                          item.reparadasGlobal,
                          item.fibrasDep
                        ]);
                        
                        const maxValue = Math.max(...allValues, 0);
                        
                        // v3.41.01: ESCALA DINÂMICA FLEXÍVEL - mais espaço entre linhas
                        // Adicionar margem proporcional ao valor máximo (20-50%)
                        const marginPercent = maxValue < 20 ? 0.5 : (maxValue < 50 ? 0.3 : 0.2);
                        const maxY = Math.ceil(maxValue * (1 + marginPercent));
                        
                        // v3.40.81: Garantir que eixo começa do 0 (não do mínimo)
                        const minY = 0;  // SEMPRE zero
                        
                        // Calcular intervalo dos ticks (divisões do eixo Y)
                        const numTicks = 5;
                        const tickInterval = Math.ceil(maxY / (numTicks - 1) / 10) * 10; // Arredondar para múltiplo de 10
                        const yAxisMax = tickInterval * (numTicks - 1);
                        
                        // Fator de escala: mapear valores para pixels (altura útil reduzida)
                        // v3.40.81: Escala de 0 até yAxisMax
                        const scaleFactor = 240 / yAxisMax; // 240px de altura útil (320 - 80 margens)

                        // Gerar ticks do eixo Y (começa do 0)
                        const yTicks = [];
                        for (let i = 0; i < numTicks; i++) {
                          yTicks.push(i * tickInterval);  // 0, tickInterval, 2*tickInterval, ...
                        }
                        
                        return yTicks.map((val, idx) => {
                          const y = 270 - (val * scaleFactor); // Ajustado para altura 320px
                          return (
                            <g key={idx}>
                              <line x1="80" y1={y} x2="570" y2={y} stroke="#d1d5db" strokeWidth="1" strokeDasharray="3 3" />
                              <text x="68" y={y + 5} fontSize="10" fill="#6b7280" textAnchor="end" fontWeight="600">{val}</text>
                            </g>
                          );
                        });
                      })()}
                      
                      {(() => {
                        // v3.40.81: Calcular valores para escala dinâmica (COMEÇA DO ZERO)
                        const allValues = trendData.flatMap(item => [
                          item.indisponiveis,
                          item.totalReparadas,
                          item.reparadasGlobal,
                          item.fibrasDep
                        ]);
                        
                        const maxValue = Math.max(...allValues, 0);
                        
                        // v3.41.01: ESCALA DINÂMICA FLEXÍVEL
                        const marginPercent = maxValue < 20 ? 0.5 : (maxValue < 50 ? 0.3 : 0.2);
                        const maxY = Math.ceil(maxValue * (1 + marginPercent));
                        
                        const numTicks = 5;
                        const tickInterval = Math.ceil(maxY / (numTicks - 1) / 10) * 10;
                        const yAxisMax = tickInterval * (numTicks - 1);
                        const scaleFactor = 240 / yAxisMax; // Altura útil (escala de 0 a yAxisMax)
                        
                        // Calcular espaçamento dinâmico para ocupar todo o espaço
                        // v3.49.30: Adicionar margem para não cortar primeira semana
                        const leftMargin = 80;  // Margem esquerda (era 60)
                        const rightMargin = 30; // Margem direita
                        const totalWidth = 600 - leftMargin - rightMargin; // Espaço disponível
                        const numWeeks = trendData.length;
                        const spacing = totalWidth / (numWeeks > 1 ? numWeeks - 1 : 1); // Espaçamento entre pontos
                        
                        return (
                          <>
                            {/* Labels das semanas */}
                            {trendData.map((item, idx) => {
                              const x = leftMargin + (idx * spacing);
                              return <text key={idx} x={x} y="295" fontSize="11" fill="#374151" fontWeight="600" textAnchor="middle">{item.week}</text>;
                            })}
                            
                            {/* Linha Indisponíveis (VERMELHA) */}
                            <path d={trendData.map((item, idx) => {
                              const x = leftMargin + (idx * spacing);
                              const y = 270 - (item.indisponiveis * scaleFactor);
                              return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                            }).join(' ')} fill="none" stroke="#ef4444" strokeWidth="3.5" />
                            {trendData.map((item, idx) => {
                              const x = leftMargin + (idx * spacing);
                              const y = 270 - (item.indisponiveis * scaleFactor);
                              return <circle key={idx} cx={x} cy={y} r="5" fill="#ef4444" stroke="#fff" strokeWidth="2" />;
                            })}
                            
                            {/* Linha Total Reparadas (LARANJA) */}
                            <path d={trendData.map((item, idx) => {
                              const x = leftMargin + (idx * spacing);
                              const y = 270 - (item.totalReparadas * scaleFactor);
                              return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                            }).join(' ')} fill="none" stroke="#f97316" strokeWidth="3" strokeDasharray="6 6" />
                            {trendData.map((item, idx) => {
                              const x = leftMargin + (idx * spacing);
                              const y = 270 - (item.totalReparadas * scaleFactor);
                              return <circle key={idx} cx={x} cy={y} r="4.5" fill="#f97316" stroke="#fff" strokeWidth="2" />;
                            })}
                            
                            {/* Linha Reparadas Global (VERDE) */}
                            <path d={trendData.map((item, idx) => {
                              const x = leftMargin + (idx * spacing);
                              const y = 270 - (item.reparadasGlobal * scaleFactor);
                              return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                            }).join(' ')} fill="none" stroke="#22c55e" strokeWidth="3" />
                            {trendData.map((item, idx) => {
                              const x = leftMargin + (idx * spacing);
                              const y = 270 - (item.reparadasGlobal * scaleFactor);
                              return <circle key={idx} cx={x} cy={y} r="4.5" fill="#22c55e" stroke="#fff" strokeWidth="2" />;
                            })}
                            
                            {/* Linha Fibras Dep (ROXO) - v3.40.77: valores diretos do card */}
                            <path d={trendData.map((item, idx) => {
                              const x = leftMargin + (idx * spacing);
                              const y = 270 - (item.fibrasDep * scaleFactor);
                              return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                            }).join(' ')} fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeDasharray="5 3" />
                            {trendData.map((item, idx) => {
                              const x = leftMargin + (idx * spacing);
                              const y = 270 - (item.fibrasDep * scaleFactor);
                              return <circle key={idx} cx={x} cy={y} r="4" fill="#8b5cf6" stroke="#fff" strokeWidth="2" />;
                            })}
                            
                            {/* v3.40.96: ANOTAÇÕES INTELIGENTES - Valores em pontos de variação */}
                            {(() => {
                              // Função para detectar variação significativa
                              // v3.41.01: LÓGICA CONSISTENTE E SIMPLES
                              const isVariation = (data, idx, key) => {
                                const curr = data[idx][key];
                                
                                // NUNCA mostrar zeros
                                if (curr === 0) return false;
                                
                                // Sempre mostrar primeiro e último (se não for zero)
                                if (idx === 0) return true;
                                if (idx === data.length - 1) return true;
                                
                                const prev = data[idx - 1][key];
                                
                                // REGRA SIMPLES E CONSISTENTE:
                                // Mostrar se o valor MUDOU em relação ao anterior
                                // E a mudança é >= 5% OU >= 3 unidades
                                if (curr === prev) return false; // Mesmo valor = não mostrar
                                
                                const mudancaAbsoluta = Math.abs(curr - prev);
                                const mudancaPercentual = prev !== 0 ? Math.abs((curr - prev) / prev) : 1;
                                
                                // Mostrar se mudança >= 3 unidades OU >= 5%
                                return mudancaAbsoluta >= 3 || mudancaPercentual >= 0.05;
                              };
                              
                              // Coletar todas as anotações
                              const allAnnotations = [];
                              
                              // Série 1: Indisponíveis (Vermelho)
                              trendData.forEach((item, idx) => {
                                if (isVariation(trendData, idx, 'indisponiveis')) {
                                  const x = leftMargin + (idx * spacing);
                                  const y = 270 - (item.indisponiveis * scaleFactor);
                                  allAnnotations.push({
                                    x, y, 
                                    value: item.indisponiveis,
                                    color: '#ef4444',
                                    series: 'indisponiveis',
                                    idx
                                  });
                                }
                              });
                              
                              // Série 2: Total Reparadas (Laranja)
                              trendData.forEach((item, idx) => {
                                if (isVariation(trendData, idx, 'totalReparadas')) {
                                  const x = leftMargin + (idx * spacing);
                                  const y = 270 - (item.totalReparadas * scaleFactor);
                                  allAnnotations.push({
                                    x, y,
                                    value: item.totalReparadas,
                                    color: '#f97316',
                                    series: 'totalReparadas',
                                    idx
                                  });
                                }
                              });
                              
                              // Série 3: Reparadas Global (Verde)
                              trendData.forEach((item, idx) => {
                                if (isVariation(trendData, idx, 'reparadasGlobal')) {
                                  const x = leftMargin + (idx * spacing);
                                  const y = 270 - (item.reparadasGlobal * scaleFactor);
                                  allAnnotations.push({
                                    x, y,
                                    value: item.reparadasGlobal,
                                    color: '#22c55e',
                                    series: 'reparadasGlobal',
                                    idx
                                  });
                                }
                              });
                              
                              // Série 4: Fibras Dep (Roxo)
                              trendData.forEach((item, idx) => {
                                if (isVariation(trendData, idx, 'fibrasDep')) {
                                  const x = leftMargin + (idx * spacing);
                                  const y = 270 - (item.fibrasDep * scaleFactor);
                                  allAnnotations.push({
                                    x, y,
                                    value: item.fibrasDep,
                                    color: '#8b5cf6',
                                    series: 'fibrasDep',
                                    idx
                                  });
                                }
                              });
                              
                              // Agrupar anotações por posição X (mesma semana)
                              const groupedByX = {};
                              allAnnotations.forEach(ann => {
                                if (!groupedByX[ann.x]) groupedByX[ann.x] = [];
                                groupedByX[ann.x].push(ann);
                              });
                              
                              // v3.40.97: SISTEMA ROBUSTO ANTI-COLISÃO
                              const finalAnnotations = [];
                              const minSpacing = 18; // Distância mínima entre textos (altura do texto + margem)
                              
                              Object.keys(groupedByX).forEach(x => {
                                const group = groupedByX[x];
                                // Ordenar por Y (de cima para baixo)
                                group.sort((a, b) => a.y - b.y);
                                
                                // v3.41.01: POSICIONAMENTO INTELIGENTE sem colisões
                                group.forEach((ann, i) => {
                                  // v3.41.01: ESPAÇAMENTO MAIOR - 45px
                                  const offsetY = (i % 2 === 0) ? -45 : 45;
                                  let labelY = ann.y + offsetY;
                                  
                                  // Garantir limites do gráfico
                                  if (labelY > 275) labelY = ann.y - 45; // Proteger eixo X
                                  if (labelY < 20) labelY = 20; // Limite superior
                                  
                                  // v3.41.01: ANTI-COLISÃO MELHORADO
                                  let hasCollision = true;
                                  let attempts = 0;
                                  const maxAttempts = 30; // Mais tentativas
                                  
                                  while (hasCollision && attempts < maxAttempts) {
                                    hasCollision = false;
                                    
                                    // Verificar colisão com todas as anotações já posicionadas
                                    for (const existing of finalAnnotations) {
                                      const xDistance = Math.abs(existing.x - ann.x);
                                      const yDistance = Math.abs(existing.labelY - labelY);
                                      
                                      // v3.41.01: Detecção mais sensível
                                      // Colisão se textos muito próximos (mesmo em colunas diferentes)
                                      if (xDistance < 50 && yDistance < minSpacing) {
                                        hasCollision = true;
                                        
                                        // Ajustar com espaçamento maior
                                        if (labelY < existing.labelY) {
                                          labelY = existing.labelY - minSpacing - 2; // +2px extra
                                        } else {
                                          labelY = existing.labelY + minSpacing + 2; // +2px extra
                                        }
                                        
                                        // Re-aplicar limites
                                        if (labelY > 275) {
                                          labelY = existing.labelY - minSpacing - 2;
                                        }
                                        if (labelY < 20) {
                                          labelY = existing.labelY + minSpacing + 2;
                                        }
                                        
                                        break;
                                      }
                                    }
                                    
                                    attempts++;
                                  }
                                  
                                  // Se ainda houver colisão após tentativas, usar estratégia de empilhamento
                                  if (hasCollision) {
                                    // Empilhar verticalmente com espaçamento fixo
                                    const stackPosition = finalAnnotations.length * minSpacing + 20;
                                    labelY = Math.min(stackPosition, 275);
                                  }
                                  
                                  finalAnnotations.push({
                                    ...ann,
                                    labelY
                                  });
                                });
                              });
                              
                              // Renderizar anotações
                              return finalAnnotations.map((ann, i) => (
                                <g key={`ann-${i}`}>
                                  {/* Linha conectora sutil */}
                                  <line
                                    x1={ann.x}
                                    y1={ann.y}
                                    x2={ann.x}
                                    y2={ann.labelY}
                                    stroke={ann.color}
                                    strokeWidth="1"
                                    strokeDasharray="2 2"
                                    opacity="0.4"
                                  />
                                  
                                  {/* Texto do valor - SEM retângulo */}
                                  <text
                                    x={ann.x}
                                    y={ann.labelY}
                                    fontSize="11"
                                    fontWeight="bold"
                                    fill={ann.color}
                                    textAnchor="middle"
                                    stroke="white"
                                    strokeWidth="3"
                                    paintOrder="stroke"
                                  >
                                    {ann.value}
                                  </text>
                                </g>
                              ));
                            })()}
                            
                            {/* Áreas invisíveis para capturar hover por semana */}
                            {trendData.map((item, idx) => {
                              const x = leftMargin + (idx * spacing);
                              return (
                                <rect
                                  key={idx}
                                  x={x - spacing / 2}
                                  y={30}
                                  width={spacing}
                                  height={240}
                                  fill="transparent"
                                  className="cursor-crosshair transition-opacity duration-200"
                                  onMouseEnter={() => setHoveredWeekIndex(idx)}
                                  onMouseLeave={() => setHoveredWeekIndex(null)}
                                />
                              );
                            })}
                            
                            {/* Linha vertical + Tooltip consolidado */}
                            {/* v3.40.84: Tooltip com transição suave e posicionamento inteligente */}
                            {hoveredWeekIndex !== null && (() => {
                              const x = 60 + (hoveredWeekIndex * spacing);
                              const weekData = trendData[hoveredWeekIndex];
                              
                              // v3.40.84: Cálculo inteligente de posição
                              const tooltipWidth = 145;
                              const tooltipHeight = 135;
                              const svgWidth = 600;
                              const padding = 10;
                              
                              // Calcular posição ideal
                              let tooltipX = x + padding; // Padrão: direita do ponto
                              
                              // Se não cabe à direita, coloca à esquerda
                              if (tooltipX + tooltipWidth > svgWidth - padding) {
                                tooltipX = x - tooltipWidth - padding;
                              }
                              
                              // Garantir que não sai pela esquerda
                              if (tooltipX < padding) {
                                tooltipX = padding;
                              }
                              
                              // Garantir que não sai pela direita
                              if (tooltipX + tooltipWidth > svgWidth - padding) {
                                tooltipX = svgWidth - tooltipWidth - padding;
                              }
                              
                              return (
                                <g style={{transition: 'all 0.2s ease-out'}}>
                                  {/* Sombra para tooltip */}
                                  <defs>
                                    <filter id="tooltipShadow" x="-50%" y="-50%" width="200%" height="200%">
                                      <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
                                      <feOffset dx="0" dy="2" result="offsetblur"/>
                                      <feComponentTransfer>
                                        <feFuncA type="linear" slope="0.3"/>
                                      </feComponentTransfer>
                                      <feMerge>
                                        <feMergeNode/>
                                        <feMergeNode in="SourceGraphic"/>
                                      </feMerge>
                                    </filter>
                                  </defs>
                                  
                                  {/* Linha vertical indicadora com transição */}
                                  <line 
                                    x1={x} 
                                    y1={30} 
                                    x2={x} 
                                    y2={270} 
                                    stroke="#6b7280" 
                                    strokeWidth="2" 
                                    strokeDasharray="4 4"
                                    opacity="0.7"
                                    style={{transition: 'all 0.2s ease-out'}}
                                  />
                                  
                                  {/* Círculos nos pontos das linhas com transição */}
                                  <circle 
                                    cx={x} 
                                    cy={270 - (weekData.indisponiveis * scaleFactor)} 
                                    r="5" 
                                    fill="#ef4444" 
                                    stroke="white" 
                                    strokeWidth="2"
                                    style={{transition: 'all 0.2s ease-out'}}
                                  />
                                  <circle 
                                    cx={x} 
                                    cy={270 - (weekData.totalReparadas * scaleFactor)} 
                                    r="5" 
                                    fill="#f97316" 
                                    stroke="white" 
                                    strokeWidth="2"
                                    style={{transition: 'all 0.2s ease-out'}}
                                  />
                                  <circle 
                                    cx={x} 
                                    cy={270 - (weekData.reparadasGlobal * scaleFactor)} 
                                    r="5" 
                                    fill="#22c55e" 
                                    stroke="white" 
                                    strokeWidth="2"
                                    style={{transition: 'all 0.2s ease-out'}}
                                  />
                                  <circle 
                                    cx={x} 
                                    cy={270 - (weekData.fibrasDep * scaleFactor)} 
                                    r="5" 
                                    fill="#8b5cf6" 
                                    stroke="white" 
                                    strokeWidth="2"
                                    style={{transition: 'all 0.2s ease-out'}}
                                  />
                                  
                                  {/* Tooltip box com transição suave */}
                                  <g filter="url(#tooltipShadow)" style={{transition: 'all 0.2s ease-out'}}>
                                    <rect 
                                      x={tooltipX} 
                                      y={35} 
                                      width={tooltipWidth} 
                                      height={tooltipHeight} 
                                      rx="8" 
                                      fill="white" 
                                      stroke="#e5e7eb" 
                                      strokeWidth="1.5"
                                      style={{transition: 'all 0.2s ease-out'}}
                                    />
                                    
                                    {/* Header com semana */}
                                    <rect 
                                      x={tooltipX} 
                                      y={35} 
                                      width={tooltipWidth} 
                                      height="32" 
                                      rx="8" 
                                      fill="#374151"
                                      style={{transition: 'all 0.2s ease-out'}}
                                    />
                                    <text 
                                      x={tooltipX + tooltipWidth / 2} 
                                      y={56} 
                                      fontSize="14" 
                                      fontWeight="bold" 
                                      fill="white" 
                                      textAnchor="middle"
                                      style={{transition: 'all 0.2s ease-out'}}
                                    >
                                      {weekData.week}
                                    </text>
                                    
                                    {/* Linha separadora */}
                                    <line 
                                      x1={tooltipX + 10} 
                                      y1={72} 
                                      x2={tooltipX + tooltipWidth - 10} 
                                      y2={72} 
                                      stroke="#e5e7eb" 
                                      strokeWidth="1"
                                      style={{transition: 'all 0.2s ease-out'}}
                                    />
                                    
                                    {/* Indisponíveis */}
                                    <circle 
                                      cx={tooltipX + 15} 
                                      cy={87} 
                                      r="5" 
                                      fill="#ef4444"
                                      style={{transition: 'all 0.2s ease-out'}}
                                    />
                                    <text 
                                      x={tooltipX + 25} 
                                      y={91} 
                                      fontSize="11" 
                                      fill="#6b7280" 
                                      fontWeight="600"
                                      style={{transition: 'all 0.2s ease-out'}}
                                    >
                                      Indisponíveis:
                                    </text>
                                    <text 
                                      x={tooltipX + tooltipWidth - 10} 
                                      y={91} 
                                      fontSize="12" 
                                      fill="#ef4444" 
                                      fontWeight="bold" 
                                      textAnchor="end"
                                      style={{transition: 'all 0.2s ease-out'}}
                                    >
                                      {weekData.indisponiveis}
                                    </text>
                                    
                                    {/* Rep. Semanal */}
                                    <circle 
                                      cx={tooltipX + 15} 
                                      cy={107} 
                                      r="5" 
                                      fill="#f97316"
                                      style={{transition: 'all 0.2s ease-out'}}
                                    />
                                    <text 
                                      x={tooltipX + 25} 
                                      y={111} 
                                      fontSize="11" 
                                      fill="#6b7280" 
                                      fontWeight="600"
                                      style={{transition: 'all 0.2s ease-out'}}
                                    >
                                      Rep. Semanal:
                                    </text>
                                    <text 
                                      x={tooltipX + tooltipWidth - 10} 
                                      y={111} 
                                      fontSize="12" 
                                      fill="#f97316" 
                                      fontWeight="bold" 
                                      textAnchor="end"
                                      style={{transition: 'all 0.2s ease-out'}}
                                    >
                                      {weekData.totalReparadas}
                                    </text>
                                    
                                    {/* Reparadas Global */}
                                    <circle 
                                      cx={tooltipX + 15} 
                                      cy={127} 
                                      r="5" 
                                      fill="#22c55e"
                                      style={{transition: 'all 0.2s ease-out'}}
                                    />
                                    <text 
                                      x={tooltipX + 25} 
                                      y={131} 
                                      fontSize="11" 
                                      fill="#6b7280" 
                                      fontWeight="600"
                                      style={{transition: 'all 0.2s ease-out'}}
                                    >
                                      Rep. Global:
                                    </text>
                                    <text 
                                      x={tooltipX + tooltipWidth - 10} 
                                      y={131} 
                                      fontSize="12" 
                                      fill="#22c55e" 
                                      fontWeight="bold" 
                                      textAnchor="end"
                                      style={{transition: 'all 0.2s ease-out'}}
                                    >
                                      {weekData.reparadasGlobal}
                                    </text>
                                    
                                    {/* Fibras Dep. PSM */}
                                    <circle 
                                      cx={tooltipX + 15} 
                                      cy={147} 
                                      r="5" 
                                      fill="#8b5cf6"
                                      style={{transition: 'all 0.2s ease-out'}}
                                    />
                                    <text 
                                      x={tooltipX + 25} 
                                      y={151} 
                                      fontSize="11" 
                                      fill="#6b7280" 
                                      fontWeight="600"
                                      style={{transition: 'all 0.2s ease-out'}}
                                    >
                                      Fibras Dep. PSM:
                                    </text>
                                    <text 
                                      x={tooltipX + tooltipWidth - 10} 
                                      y={151} 
                                      fontSize="12" 
                                      fill="#8b5cf6" 
                                      fontWeight="bold" 
                                      textAnchor="end"
                                      style={{transition: 'all 0.2s ease-out'}}
                                    >
                                      {weekData.fibrasDep}
                                    </text>
                                  </g>
                                </g>
                              );
                            })()}
                          </>
                        );
                      })()}
                    </svg>
                  </div>

                  {/* LEGENDA CENTRALIZADA */}
                  <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs">
                    <div className="flex items-center space-x-1">
                      <div className="w-5 h-0.5 bg-red-500"></div>
                      <span className="text-gray-700">Indisponíveis</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-5 h-0.5 bg-orange-500 border-t-2 border-dashed border-orange-500"></div>
                      <span className="text-gray-700">Rep. Semanal</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-5 h-0.5 bg-green-500"></div>
                      <span className="text-gray-700">Reparadas Global</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-5 h-0.5 bg-purple-500 border-t-2 border-dashed border-purple-500"></div>
                      <span className="text-gray-700">Fibras Dep. PSM</span>
                    </div>
                  </div>
                </div>
                
              </div>
            </div>
          </div>
    </>
  );
};

export default AnaliseContainer;
