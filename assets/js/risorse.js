window.Component = class extends DCLogic {
  constructor(p){ super(p); this.state = { tipo: 'Tutti', sfera: 'tutte' }; }
  renderVals() {
    const SF = { g: ['Conformità','#106B2D','#005423','#EAF4EE'], b: ['Controllo','#015FC2','#014C9B','#EAF2FC'], o: ['Strategia','#B57505','#7A4E00','#FBF3E3'] };
    const R = [
      ['Guide pratiche','g','Ambiente','Deposito temporaneo dei rifiuti: criteri e verifiche','Le condizioni da rispettare e come documentarle.'],
      ['Guide pratiche','g','Ambiente','RENTRI per la media impresa: cosa presidiare','Ruoli, flussi e controlli interni per registri e FIR digitali.'],
      ['Checklist','b','Ambiente','Preparazione a un\'ispezione ambientale','Le evidenze da avere pronte e chi deve saperle presentare.'],
      ['Template','g','Ambiente','Registro di carico e scarico: istruzioni operative','Modello commentato per chi compila ogni giorno.'],
      ['Template','b','Ambiente','Matrice di deleghe e responsabilità','Una vista unica dei ruoli e delle responsabilità ambientali.'],
      ['Template','b','Ambiente','Scadenzario adempimenti','Autorizzazioni, prescrizioni, controlli e scadenze ambientali in un solo file.'],
      ['Webinar','g','Ambiente','FIR digitale: dalla teoria alla pratica','Registrazione e materiali del webinar.'],
      ['Approfondimenti','o','Ambiente','Richieste ESG dalla filiera: come rispondere','Questionari dei clienti, standard volontari e dati da preparare.'],
      ['Approfondimenti','o','Ambiente','Modello 231: il presidio dei rischi-reato ambientali','Come presidiare i reati ambientali nel modello organizzativo e supportare l\'Organismo di Vigilanza.']
    ];
    const tipo = this.state.tipo, sfera = this.state.sfera;
    const pill = on => 'display: inline-flex; align-items: center; min-height: 44px; padding: 0 18px; border-radius: 999px; font-size: 15px; font-weight: 700; cursor: pointer; ' + (on ? 'background: #06331B; color: #FFFFFF; border: 1.5px solid #06331B' : 'background: #FFFFFF; color: #10251A; border: 1.5px solid #C9D6CE');
    const tipi = ['Tutti','Guide pratiche','Checklist','Template','Webinar','Approfondimenti'].map(t => ({ label: t, style: pill(tipo === t), pressed: tipo === t ? 'true' : 'false', pick: () => this.setState({ tipo: t }) }));
    const sfere = [['tutte','Tutte le sfere'],['g','Conformità'],['b','Controllo'],['o','Strategia']].map(([id,l]) => ({ label: l, style: pill(sfera === id), pressed: sfera === id ? 'true' : 'false', pick: () => this.setState({ sfera: id }) }));
    const items = R.filter(r => (tipo === 'Tutti' || r[0] === tipo) && (sfera === 'tutte' || r[1] === sfera)).map(r => ({
      tipo: r[0], ambito: r[2], title: r[3], desc: r[4], sfera: SF[r[1]][0],
      tagStyle: 'display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 700; padding: 4px 10px; border-radius: 999px; color: ' + SF[r[1]][2] + '; background: ' + SF[r[1]][3],
      dotStyle: 'width: 10px; height: 10px; border-radius: 50%; background: ' + SF[r[1]][1],
      cta: r[0] === 'Webinar' ? 'Guarda la registrazione' : (r[0] === 'Approfondimenti' ? 'Leggi' : 'Scarica')
    }));
    return { tipi, sfere, items, count: items.length + (items.length === 1 ? ' risorsa' : ' risorse'), empty: items.length === 0 };
  }
}
