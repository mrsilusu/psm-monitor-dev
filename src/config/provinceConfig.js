// src/config/provinceConfig.js
// Responsabilidade: mapeamento entre rotas, províncias e operadores

export const ROUTE_TO_PROVINCE = {
  // CABINDA (17 rotas - ISISTEL)
  'BSC_Cabinda - Quatro': 'Cabinda',
  'BSC_Cabinda - Resistencia (Cabo_1)': 'Cabinda',
  'BSC_Cabinda - Resistencia (Cabo_2)': 'Cabinda',
  'Cine_Popular - BSC_Cabinda': 'Cabinda',
  'Corda_Expansão_Cabassango': 'Cabinda',
  'Hoji_Cacongo - Belize': 'Cabinda',
  'Hoji_Cacongo - Massabe_Fronteira': 'Cabinda',
  'Lucola - Hoji_Cacongo': 'Cabinda',
  'Lucola - Tchizu_O': 'Cabinda',
  'Massabi_Fronteira - Belize': 'Cabinda',
  'PV_Grande_NT - Tchizu_O': 'Cabinda',
  'PV_Grande_NT - Yema_Fronteira': 'Cabinda',
  'Quatro - PV_Grande_NT': 'Cabinda',
  'Quatro - Tchizu_O': 'Cabinda',
  'Resistencia - Cine_Popular': 'Cabinda',
  'Resistencia - Lucola': 'Cabinda',
  'Tchizu_O - Cine_Popular': 'Cabinda',

  // ZAIRE (v3.40.0: 22 rotas - nomes padronizados)
  'Mucula - Soyo': 'Zaire',
  'Nzeto - Mucula': 'Zaire',
  'Nzeto - Soyo': 'Zaire',
  'Ambriz - N\'zeto': 'Zaire',
  'Lucenga - Mucula': 'Zaire',
  'Mbanza Congo - Noqui': 'Zaire',
  'Cuimba - Nguabi': 'Zaire',
  'Mbaza Centro - Cuimba': 'Zaire',
  'Tomboco - Lussenga': 'Zaire',
  'Tomboco - Mbanza Congo': 'Zaire',
  'Nzeto - Lussenga': 'Zaire',
  'Mbanza Congo_Sul - BSC ODF 3 (11 de Novembro)': 'Zaire',
  'Mbanza Congo_Sul - BSC ODF 4': 'Zaire',
  'Kimbumba - Soyo_Centro': 'Zaire',
  'Kwanda_DCS - Kwanda_O': 'Zaire',
  'Kwanda_DCS - Porto': 'Zaire',
  'Kwanda_DCS - Loja': 'Zaire',
  'Kwanda_O - Loja': 'Zaire',
  'Kwanda_O - Porto': 'Zaire',
  'Kwanda_DCS- ODFB1- JFO(288)ALNG': 'Zaire',
  'Kwanada_O (ODFB2)- JFO11 Porto': 'Zaire',
  'Kwanda_O (ODFB3)- JFO(288)- Azul Energi': 'Zaire',

  // UÍGE
  'Kimbundo - Uige (Inca)': 'Uíge',
  'Muquiama - Kimbundo': 'Uíge',
  'Nguabi - Damba': 'Uíge',
  'Damba - Uige(Negage_CRT)': 'Uíge',
  'Negage - Camabatela': 'Uíge',
  'Uíge - Negage': 'Uíge',
  'Camabatela - Lucala': 'Uíge',
  'Uíge_CTR - Unipop_Oeste ODF 2': 'Uíge',
  'Uíge_CTR - Unipop_Oeste ODF 1': 'Uíge',

  // MALANGE (v3.38.0: Nomes padronizados com routesByPSM.FIBRASOL)
  'Malange (Vila Matilde) - Mulo': 'Malanje',
  'Mulo - Cuango': 'Malanje',
  'Mussende - Malange (Catepa)': 'Malanje',
  'Calucinga - Mussende': 'Malanje',
  'Malange (Lumbo) - Lucala': 'Malanje',
  'BSC_Malange - Canambua': 'Malanje',
  'Hospital - Lumbo': 'Malanje',
  'Malange_CTR - Lumbo e Bsc': 'Malanje',
  'Lumbo - BSC_Malange': 'Malanje',
  'Canambua - Vila_Matilde': 'Malanje',
  'Vila_Matilde - Hospital': 'Malanje',
  'Maxinde (Expansão) - Lumbo': 'Malanje',
  'Maxinde (Expansão) - BSC': 'Malanje',

  // CUANZA NORTE (v3.40.1: 7 rotas - conforme imagem de referência)
  'Maria teresa Gulungo_Alto - Nadalatando': 'Cuanza Norte',
  'Alto Dondo - Quibala': 'Cuanza Norte',
  'Ndalatando - Alto_Dondo': 'Cuanza Norte',
  'Lucala - Ndalatando': 'Cuanza Norte',
  'Ndala Norte - Ndala_Leste': 'Cuanza Norte',
  'Ndala Norte - KN_Azul': 'Cuanza Norte',
  'Ndala_CTR(BSC Ndalatando) - KN_Azul': 'Cuanza Norte',

  // v3.35.0: CUANGO transferido para MALANJE (conforme imagem de referência)
  'Cuango - Cafunfo': 'Malanje',
  'Cuango - Caungula': 'Malanje',

  // LUNDA NORTE
  'Cambacumba - Dundo': 'Lunda Norte',
  'Camissombo (Lucapa) - Dundo': 'Lunda Norte',
  'Caungula - Cuilo': 'Lunda Norte',
  'Cuilo - Cambacumba': 'Lunda Norte',
  'Dundo_CRT ODF1 - Dundo_CRT ODF2': 'Lunda Norte',

  // LUNDA SUL
  'Cazombo -- Karipande': 'Lunda Sul',
  'Cazombo - Karipande': 'Lunda Sul',
  'Dala - Saurimo': 'Lunda Sul',
  'Luau -- Massibi': 'Lunda Sul',
  'Luau - Massibi': 'Lunda Sul',
  'Massibi -- Cazombo': 'Lunda Sul',
  'Massibi - Cazombo': 'Lunda Sul',
  'Muconda -- Luau': 'Lunda Sul',
  'Muconda - Luau': 'Lunda Sul',
  'Neto - Santo Antonio': 'Lunda Sul',
  'Neto - Terra_Nova (Saurimo_Sul)': 'Lunda Sul',
  'Santo Antonio - Terra Nova': 'Lunda Sul',
  'Saurimo - Muconda': 'Lunda Sul',
  'Saurimo - Lucapa (Camissombo)': 'Lunda Sul',
  'Saurimo - Dala': 'Lunda Sul',
  'Saurimo(Br_Muconda) - Muconda': 'Lunda Sul',
  'Saurimo Norte -- IEIA': 'Lunda Sul',
  'Saurimo_CRT - IEIA': 'Lunda Sul',
  'Saurimo_Norte - Neto': 'Lunda Sul',
  'Stº António - Saurimo_sul': 'Lunda Sul',
  'Terra_Nova - Saurimo_CRT': 'Lunda Sul',

  // MOXICO
  'Br_Capango_Sul - Sacalunda': 'Moxico',
  'Cangumbe - Luena': 'Moxico',
  'Cuemba - Cangumbe': 'Moxico',
  'Dom_Bosco - Luena_CTR': 'Moxico',
  'Lucusse - Lutembo': 'Moxico',
  'Luena - Dala': 'Moxico',
  'Luena - Lucusse': 'Moxico',
  'Luena_CTR - Luena_Largo': 'Moxico',
  'Luena_Largo - Zorro': 'Moxico',
  'Lumbala Nguimbo - Ninda': 'Moxico',
  'Lutembo - Lumbala Nguimbo': 'Moxico',
  'Ninda - Malundo': 'Moxico',
  'Sacalunda - Dom_Bosco': 'Moxico',
  'Zorro - Br_Capango_Sul': 'Moxico'
};

export const PROVINCE_TO_OPERATOR = {
  'Cabinda': 'ISISTEL',
  'Zaire': 'FIBRASOL',
  'Uíge': 'FIBRASOL',
  'Malanje': 'FIBRASOL',
  'Cuanza Norte': 'FIBRASOL',
  'Lunda Norte': 'ANGLOBAL',
  'Lunda Sul': 'ANGLOBAL',
  'Moxico': 'ANGLOBAL'
};

export const OPERATOR_TO_PROVINCES = {
  'ISISTEL': ['Cabinda'],
  'FIBRASOL': ['Zaire', 'Uíge', 'Malanje', 'Cuanza Norte'],
  'ANGLOBAL': ['Lunda Norte', 'Lunda Sul', 'Moxico']
};

