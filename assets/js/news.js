window.Component = class extends DCLogic {
  constructor(p){ super(p); const h = decodeURIComponent(location.hash.replace('#tema-', '')).toLowerCase(); const m = ['Normativa','Scadenze','Giurisprudenza','EPR','Sostenibilità','RENTRI','Imballaggi','Rifiuti','Trasporto','Autorizzazioni'].find(x => x.toLowerCase() === h); this.state = { tema: m || 'Tutti', email: '', sent: false, err: '' }; }
  renderVals() {
    const C = { g: ['#106B2D','Conformità'], b: ['#015FC2','Controllo'], o: ['#B57505','Strategia'] };
    const N = [
      ['[Data]','Imballaggi','g','Regolamento imballaggi PPWR: cosa cambia per chi immette imballaggi','Le prime verifiche su etichettatura, documentazione e fornitori.'],
      ['[Data]','RENTRI','g','RENTRI: il FIR digitale nella gestione quotidiana','Ruoli e controlli interni da rivedere dopo il passaggio al formulario digitale.'],
      ['[Data]','Sostenibilità','o','Rendicontazione di sostenibilità: cosa cambia con l\'Omnibus UE','Obblighi, soglie e richieste che arrivano comunque dalla filiera.'],
      ['[Data]','Giurisprudenza','b','[Sentenza]: responsabilità del produttore nella scelta del trasportatore','Cosa dice la decisione e quali verifiche introdurre.'],
      ['[Data]','Scadenze','g','[Adempimento]: la scadenza si avvicina','Chi è coinvolto e cosa preparare per tempo.'],
      ['[Data]','Autorizzazioni','b','AUA: rinnovi e controllo delle prescrizioni','Perché conviene verificare le prescrizioni prima del rinnovo.'],
      ['[Data]','EPR','o','Responsabilità estesa del produttore: i nuovi regimi in arrivo','Quali settori sono coinvolti e come prepararsi.']
    ];
    const T = ['Tutti','Normativa','Scadenze','Giurisprudenza','EPR','Sostenibilità','RENTRI','Imballaggi','Rifiuti','Trasporto','Autorizzazioni'];
    const tema = this.state.tema;
    const temi = T.map(t => ({ label: t, pressed: tema === t ? 'true' : 'false', pick: () => this.setState({ tema: t }),
      style: 'width: 100%; text-align: left; min-height: 44px; padding: 0 14px; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; border: 0; ' + (tema === t ? 'background: #06331B; color: #FFFFFF' : 'background: transparent; color: #10251A') }));
    const items = N.filter(n => tema === 'Tutti' || n[1] === tema || (tema === 'Normativa' && ['Imballaggi','RENTRI','EPR','Autorizzazioni'].includes(n[1])) || (tema === 'Rifiuti' && ['RENTRI','Giurisprudenza'].includes(n[1])) || (tema === 'Trasporto' && n[1] === 'Giurisprudenza'))
      .map(n => ({ date: n[0], tema: n[1], title: n[3], sum: n[4], sfera: C[n[2]][1], dot: 'width: 10px; height: 10px; border-radius: 50%; flex: none; background: ' + C[n[2]][0] }));
    const email = this.state.email;
    return { temi, items, empty: items.length === 0, email, sent: this.state.sent, notSent: !this.state.sent, err: this.state.err, hasErr: !!this.state.err,
      onEmail: e => this.setState({ email: e.target.value, err: '' }),
      subscribe: () => { if (email.length > 254 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) this.setState({ err: 'Inserisci un indirizzo email valido, ad esempio nome@azienda.it' }); else this.setState({ sent: true }); } };
  }
}
