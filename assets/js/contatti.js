window.Component = class extends DCLogic {
  constructor(p){ super(p); this.state = { f: { nome: '', cognome: '', azienda: '', ruolo: '', email: '', tel: '', dim: '', ambito: '', msg: '', privacy: false, news: false, hp: '' }, errs: {}, sent: false, t0: Date.now() }; }
  renderVals() {
    const f = this.state.f, e = this.state.errs;
    const set = k => ev => { const v = ev.target.type === 'checkbox' ? ev.target.checked : ev.target.value; this.setState({ f: Object.assign({}, this.state.f, { [k]: v }), errs: Object.assign({}, this.state.errs, { [k]: '' }) }); };
    const inp = k => 'min-height: 48px; padding: 0 14px; border-radius: 10px; font-size: 16px; color: #10251A; background: #FFFFFF; border: 1.5px solid ' + (e[k] ? '#B42318' : '#C9D6CE');
    const submit = () => {
      const f = this.state.f; const x = {};
      if (!f.nome.trim()) x.nome = 'Inserisci il nome.';
      if (!f.cognome.trim()) x.cognome = 'Inserisci il cognome.';
      if (!f.azienda.trim()) x.azienda = 'Inserisci il nome dell\'azienda.';
      if (f.email.length > 254 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.trim())) x.email = 'Inserisci un\'email valida, ad esempio nome@azienda.it';
      if (!f.privacy) x.privacy = 'Per inviare la richiesta serve il consenso al trattamento dei dati.';
      if (Object.keys(x).length) { this.setState({ errs: x }); return; }
      // trappola anti-bot: campo nascosto compilato o invio in meno di 3 secondi -> finta conferma, nessun invio
      if (f.hp || Date.now() - this.state.t0 < 3000) { this.setState({ sent: true }); return; }
      this.setState({ sent: true });
    };
    const E = {}; ['nome','cognome','azienda','email','privacy'].forEach(k => { E[k] = e[k] || ''; E[k + 'On'] = !!e[k]; });
    return { f, E, sent: this.state.sent, notSent: !this.state.sent, submit,
      sNome: inp('nome'), sCognome: inp('cognome'), sAzienda: inp('azienda'), sEmail: inp('email'), sBase: inp('_'),
      onNome: set('nome'), onCognome: set('cognome'), onAzienda: set('azienda'), onRuolo: set('ruolo'), onEmail: set('email'), onTel: set('tel'), onDim: set('dim'), onAmbito: set('ambito'), onMsg: set('msg'), onPrivacy: set('privacy'), onHp: set('hp'), onNews: set('news'),
      again: () => this.setState({ sent: false, f: Object.assign({}, f, { msg: '' }) }) };
  }
}
