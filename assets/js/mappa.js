window.Component = class extends DCLogic {
  constructor(p){ super(p); this.state = { ans: {} }; }
  renderVals() {
    const Q = [
      ['g','Le autorizzazioni e le iscrizioni ambientali sono in corso di validità e i registri obbligatori sono correttamente tenuti?'],
      ['g','Hai individuato le scadenze degli adempimenti ambientali e definito chi è responsabile della loro gestione?'],
      ['b','Se domani arrivasse un controllo, sapresti esibire subito le evidenze di ciò che dichiari?'],
      ['b','Gli audit periodici e le procedure interne ti permettono di individuare le criticità prima che diventino problemi?'],
      ['o','I dati ambientali sono utilizzati dal management per prendere decisioni e predisporre la reportistica?'],
      ['o','Hai obiettivi di miglioramento misurabili, come certificazioni, carbon footprint o rating ESG?']
    ];
    const ans = this.state.ans;
    const base = 'flex: 1 1 0; min-width: 96px; min-height: 46px; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; ';
    const OPTS = [['Sì',2],['In parte',1],['No',0]];
    const qs = Q.map(([k,text], i) => ({
      n: 'Domanda ' + (i+1) + ' di 6', text,
      opts: OPTS.map(([label,v]) => {
        const on = ans[i] === v;
        return { label, pressed: on ? 'true' : 'false',
          style: base + (on ? 'background: #06331B; color: #FFFFFF; border: 1.5px solid #06331B' : 'background: #FFFFFF; color: #10251A; border: 1.5px solid #C9D6CE'),
          pick: () => this.setState({ ans: Object.assign({}, ans, { [i]: v }) }) };
      })
    }));
    const count = Object.keys(ans).length;
    const done = count === 6;
    const sc = k => Q.reduce((t,[kk],i) => t + (kk === k ? (ans[i] || 0) : 0), 0);
    let start = 'o';
    if (sc('g') < 3) start = 'g'; else if (sc('b') < 3) start = 'b';
    return { qs, done, notDone: !done, progress: count + ' di 6 risposte',
      isG: done && start === 'g', isB: done && start === 'b', isO: done && start === 'o',
      reset: () => this.setState({ ans: {} }) };
  }
}
