const SETTORI_ID = ['manifatturiero','edilizia','gdo-retail','chimico-farmaceutico','logistica-trasporti','agroalimentare'];
window.Component = class extends DCLogic {
  constructor(p){ super(p); const i = SETTORI_ID.indexOf(location.hash.slice(1)); this.state = { sel: i < 0 ? 0 : i };
    window.addEventListener('hashchange', () => { const j = SETTORI_ID.indexOf(location.hash.slice(1)); if (j >= 0) this.setState({ sel: j }); }); }
  renderVals() {
    const S = [
      ['Manifatturiero','Produzione e lavorazioni con processi complessi, emissioni e più flussi di rifiuti.',
        ['Verifica delle autorizzazioni ambientali e degli adempimenti ad essi connessi','Classificazione dei rifiuti e verifica della corretta gestione del deposito temporaneo','Verifica della gestione documentale (RENTRI, FIR e MUD)','Verifica degli obblighi relativi a emissioni in atmosfera e scarichi idrici'],
        ['Audit ambientali periodici e verifica delle procedure operative','Monitoraggio delle scadenze autorizzative e degli obblighi di controllo','Verifica della tracciabilità dei rifiuti e della gestione dei fornitori ambientali','Individuazione delle criticità e definizione delle azioni correttive'],
        ['Ottimizzazione dei processi di gestione dei rifiuti e delle risorse','Individuazione di opportunità di recupero e valorizzazione degli scarti produttivi','Riduzione dei costi di gestione ambientale e delle inefficienze operative','Definizione di un piano di miglioramento ambientale con obiettivi e priorità']],
      ['Edilizia','Cantieri temporanei, subappalti e rifiuti da costruzione e demolizione.',
        ['Verifica degli adempimenti ambientali e delle iscrizioni all\'Albo Gestori Ambientali','Classificazione dei rifiuti da costruzione e demolizione e gestione delle terre e rocce da scavo','Verifica delle condizioni del deposito temporaneo nei cantieri','Verifica della gestione documentale (RENTRI, FIR e MUD)'],
        ['Sopralluoghi e audit ambientali nei cantieri','Verifica delle autorizzazioni di trasportatori, intermediari e impianti','Monitoraggio dei conferimenti e della tracciabilità dei rifiuti','Individuazione delle criticità operative e definizione delle azioni correttive'],
        ['Pianificazione della gestione ambientale fin dalla fase di progettazione del cantiere','Ottimizzazione della logistica e dei costi di gestione dei rifiuti','Promozione della demolizione selettiva, del recupero e della valorizzazione dei materiali','Definizione di procedure ambientali standardizzate, applicabili a più cantieri']],
      ['GDO e retail','Molti punti vendita, imballaggi e logistica inversa da tenere sotto controllo.',
        ['Verifica degli obblighi ambientali applicabili ai punti vendita, ai magazzini e ai centri distributivi','Classificazione e corretta gestione dei rifiuti, degli imballaggi e dei resi','Verifica della gestione documentale (RENTRI, FIR e MUD)','Verifica degli obblighi EPR, CONAI, PPWR e delle eventuali disposizioni specifiche per RAEE e batterie'],
        ['Audit ambientali periodici presso punti vendita e piattaforme logistiche','Monitoraggio dei flussi di rifiuti e della logistica inversa','Verifica delle autorizzazioni dei fornitori e della tracciabilità dei conferimenti','Standardizzazione delle procedure e monitoraggio delle criticità nelle diverse sedi'],
        ['Definizione di un modello di gestione ambientale integrato per tutti i punti vendita','Ottimizzazione della logistica inversa e riduzione dei costi di gestione','Riduzione degli sprechi e valorizzazione dei materiali e degli imballaggi','Definizione di indicatori di performance ambientale e obiettivi di miglioramento continuo']],
      ['Chimico-farmaceutico','Sostanze pericolose, impianti complessi e adempimenti specifici.',
        ['Verifica delle autorizzazioni ambientali (AIA, AUA) e delle relative prescrizioni','Classificazione e gestione dei rifiuti, con particolare attenzione ai rifiuti pericolosi e agli scarti di produzione','Verifica degli obblighi applicabili in materia di REACH, CLP e rischio di incidente rilevante (Seveso)','Verifica della gestione documentale (RENTRI, FIR e MUD)'],
        ['Audit ambientali e verifiche periodiche degli impianti e delle aree di stoccaggio','Monitoraggio delle emissioni, degli scarichi e dei parametri previsti dalle autorizzazioni','Verifica della tracciabilità dei rifiuti e della gestione dei fornitori ambientali','Monitoraggio delle scadenze, delle prescrizioni e delle azioni correttive'],
        ['Ottimizzazione dei processi produttivi per ridurre rifiuti, emissioni e consumi di risorse','Individuazione di soluzioni per il recupero dei solventi e la valorizzazione degli scarti','Valutazione di alternative per ridurre l\'impiego di sostanze pericolose','Definizione di un piano di miglioramento ambientale con indicatori di performance e obiettivi misurabili']],
      ['Logistica e trasporti','Tracciabilità, iscrizioni, movimentazione merci e gestione delle flotte.',
        ['Verifica delle iscrizioni all\'Albo Gestori Ambientali e delle autorizzazioni applicabili','Verifica degli obblighi relativi al trasporto di rifiuti e merci pericolose (ADR)','Verifica della gestione documentale (RENTRI, FIR e MUD)','Verifica della gestione dei rifiuti prodotti dalle attività logistiche e dalla manutenzione delle flotte'],
        ['Audit documentali e verifiche periodiche su mezzi, autorizzazioni e requisiti operativi','Monitoraggio delle scadenze autorizzative','Verifica della tracciabilità dei trasporti e della corretta gestione dei documenti','Controllo dei trasportatori terzi e dei fornitori coinvolti nella filiera logistica'],
        ['Definizione di indicatori di performance ambientale per migliorare l\'efficienza della logistica']],
      ['Agroalimentare','Scarti organici, sottoprodotti, acque reflue e richieste della filiera.',
        ['Verifica delle autorizzazioni ambientali e degli obblighi relativi a scarichi idrici ed emissioni','Classificazione e gestione dei rifiuti derivanti dai processi produttivi e di lavorazione','Verifica dei requisiti per la qualificazione degli scarti come sottoprodotti e degli eventuali obblighi relativi ai sottoprodotti di origine animale','Verifica della gestione documentale (RENTRI, FIR e MUD)'],
        ['Audit ambientali degli stabilimenti e delle aree di deposito dei rifiuti','Monitoraggio degli scarichi idrici, delle emissioni e dei parametri autorizzati','Verifica della tracciabilità dei rifiuti e della corretta gestione dei sottoprodotti','Controllo dei fornitori ambientali, delle scadenze e delle prescrizioni autorizzative'],
        ['Individuazione di opportunità di recupero e valorizzazione degli scarti di lavorazione','Ottimizzazione dei consumi idrici ed energetici nei processi produttivi','Riduzione degli sprechi e miglioramento dell\'efficienza nella gestione delle risorse','Definizione di indicatori di performance ambientale e di obiettivi di miglioramento coerenti con le richieste della filiera']]
    ];
    const sel = this.state.sel;
    const base = 'display: flex; flex-direction: column; align-items: flex-start; gap: 6px; padding: 22px; border-radius: 14px; text-align: left; cursor: pointer; min-height: 132px; ';
    const tiles = S.map((s, i) => ({ name: s[0], desc: s[1], pressed: sel === i ? 'true' : 'false',
      style: base + (sel === i ? 'background: #06331B; color: #FFFFFF; border: 1.5px solid #06331B' : 'background: #FFFFFF; color: #10251A; border: 1.5px solid #DCE5DF'),
      descStyle: 'font-size: 15px; line-height: 1.45; ' + (sel === i ? 'color: #D3E6DA' : 'color: #52645A'),
      pick: () => { history.replaceState(null, '', '#' + SETTORI_ID[i]); this.setState({ sel: i }); } }));
    const cur = S[sel];
    const L = a => a.map(t => ({ t }));
    return { tiles, cur: { name: cur[0], desc: cur[1], g: L(cur[2]), b: L(cur[3]), o: L(cur[4]) } };
  }
}
