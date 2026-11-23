class KomfoventDomektCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  setConfig(config) {
    if (!config || typeof config !== "object") {
      throw new Error("Please provide a valid card configuration.");
    }
    this._config = config;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  getCardSize() {
    return 8;
  }

  _value(entityId, fallback = "--") {
    const entity = entityId && this._hass?.states?.[entityId];
    if (!entity || entity.state === "unknown" || entity.state === "unavailable") {
      return fallback;
    }

    const unit = entity.attributes?.unit_of_measurement;
    return unit ? `${entity.state} ${unit}` : entity.state;
  }

  _render() {
    if (!this.shadowRoot || !this._config) return;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          color: var(--primary-text-color, #42474b);
          font-family: var(--ha-card-header-font-family, inherit);
        }
        ha-card {
          overflow: hidden;
          background: var(--ha-card-background, var(--card-background-color, #fff));
          border-radius: var(--ha-card-border-radius, 12px);
        }
        .header {
          display: flex;
          align-items: center;
          gap: 16px;
          min-height: 60px;
          padding: 0 20px;
          color: #fff;
          background: #104c9a;
          font-size: 20px;
          font-weight: 500;
          letter-spacing: 0.2px;
        }
        .power {
          width: 23px;
          height: 23px;
          margin-left: auto;
          opacity: 0.9;
        }
        .content { padding: 14px 18px 22px; }
        .diagram {
          display: block;
          width: min(100%, 440px);
          height: auto;
          margin: 0 auto;
        }
        svg text {
          font-family: inherit;
          text-anchor: middle;
        }
        .label { fill: #92999e; font-size: 16px; }
        .reading { fill: #555b60; font-size: 21px; font-weight: 500; }
        .flow-reading { font-size: 20px; font-weight: 600; }
        .house, .floor, .core {
          fill: none;
          stroke: #d7dde5;
          stroke-width: 10;
          stroke-linejoin: round;
        }
        .floor { stroke-width: 10; }
        .core { stroke-width: 5; }
        .air { fill: none; stroke-width: 9; stroke-linecap: square; stroke-linejoin: round; }
        .fresh { stroke: #43a9e8; }
        .used { stroke: #ff941d; }
        .fan { fill: #fff; stroke: #315d96; stroke-width: 2; }
        .fan-mark { fill: #315d96; }
        .metrics {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 6px;
          margin-top: 4px;
        }
        .metric {
          min-width: 0;
          padding: 8px 2px 3px;
          text-align: center;
        }
        .metric-icon {
          width: 25px;
          height: 25px;
          margin: 0 auto 4px;
          color: #315d96;
        }
        .metric-label { color: #92999e; font-size: 14px; }
        .metric-value {
          margin-top: 2px;
          color: #555b60;
          font-size: 19px;
          font-weight: 600;
          overflow-wrap: anywhere;
        }
        @media (max-width: 380px) {
          .content { padding: 10px 8px 16px; }
          .header { font-size: 18px; }
          .metric-label { font-size: 12px; }
          .metric-value { font-size: 16px; }
        }
      </style>
      <ha-card>
        <div class="header">
          <span>Centrala wentylacyjna</span>
          <svg class="power" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2v10M5.7 5.7a9 9 0 1 0 12.6 0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="content">
          <svg class="diagram" viewBox="0 0 440 730" role="img" aria-label="Schemat przepływu powietrza przez centralę">
            <path class="house" d="M28 680V250L220 76 412 250V680"/>
            <path class="floor" d="M8 680H432"/>

            <path class="air fresh" d="M115 120L170 174V258L220 309"/>
            <path class="air fresh" d="M220 309L270 258V174L325 120"/>
            <path class="air used" d="M115 475L170 420V365L220 313"/>
            <path class="air used" d="M220 313L270 365V420L325 475"/>
            <path d="M170 174l-3-20-17 17zM325 120l-17 2 2 17z" fill="#43a9e8"/>
            <path d="M170 420l-4 20-16-16zM325 475l-17-2 2-17z" fill="#ff941d"/>

            <rect class="core" x="125" y="215" width="190" height="155"/>
            <g transform="translate(143 335)">
              <circle class="fan" r="10"/>
              <path class="fan-mark" d="M0-8Q8-7 4-1L1 0ZM8 0Q7 8 1 4L0 1ZM0 8Q-8 7-4 1L-1 0ZM-8 0Q-7-8-1-4L0-1Z"/>
            </g>
            <g transform="translate(297 335)">
              <circle class="fan" r="10"/>
              <path class="fan-mark" d="M0-8Q8-7 4-1L1 0ZM8 0Q7 8 1 4L0 1ZM0 8Q-8 7-4 1L-1 0ZM-8 0Q-7-8-1-4L0-1Z"/>
            </g>

            <text class="label" x="82" y="54">Czerpnia</text>
            <text class="reading" x="82" y="80" data-value="outside_temperature">--</text>
            <text class="label" x="358" y="54">Wyrzutnia</text>
            <text class="reading" x="358" y="80" data-value="exhaust_temperature">--</text>

            <text class="reading flow-reading" x="70" y="346" data-value="extract_flow">--</text>
            <text class="reading flow-reading" x="370" y="346" data-value="supply_flow">--</text>

            <text class="label" x="110" y="515">Wywiew</text>
            <text class="reading" x="110" y="541" data-value="extract_temperature">--</text>
            <text class="label" x="330" y="515">Nawiew</text>
            <text class="reading" x="330" y="541" data-value="supply_temperature">--</text>

            <g fill="none" stroke="#315d96" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M100 572l-10 8v17h20v-17zM100 576v9M98 587a2 2 0 1 0 4 0c0-1-2-3-2-3s-2 2-2 3z"/>
              <path d="M218 571s-7 9-7 13a4 4 0 0 0 8 0c0-4-7-13-7-13zM230 575s-6 8-6 12a4 4 0 0 0 8 0c0-4-6-12-6-12z"/>
              <path d="M340 572c-7 8-8 12-6 17a7 7 0 0 0 13-4c0-4-2-7-7-13zM340 582v15M337 588l3 3 3-3"/>
            </g>
            <text class="label" x="100" y="615">Panel</text>
            <text class="reading" x="100" y="640" data-value="panel_temperature">--</text>
            <text class="label" x="220" y="615">Wilgotność</text>
            <text class="reading" x="220" y="640" data-value="humidity">--</text>
            <text class="label" x="340" y="615">Jakość</text>
            <text class="reading" x="340" y="640" data-value="air_quality">--</text>
          </svg>

          <div class="metrics">
            <div class="metric">
              <svg class="metric-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20 7v5h-5M4 17v-5h5M5.5 9A7 7 0 0 1 18 6l2 2M4 16l2 2a7 7 0 0 0 12.5-3" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <div class="metric-label">Odzysk ciepła</div>
              <div class="metric-value" data-value="heat_recovery">--</div>
            </div>
            <div class="metric">
              <svg class="metric-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M13.5 2 5 13h6l-.5 9L19 10h-6z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
              </svg>
              <div class="metric-label">Pobór prądu</div>
              <div class="metric-value" data-value="power">--</div>
            </div>
            <div class="metric">
              <svg class="metric-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 3h12v18H6zM7 5l10 5-10 5 10 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
              </svg>
              <div class="metric-label">Filtry</div>
              <div class="metric-value" data-value="filter">--</div>
            </div>
          </div>
        </div>
      </ha-card>
    `;

    this.shadowRoot.querySelectorAll("[data-value]").forEach((node) => {
      node.textContent = this._value(this._config[node.dataset.value]);
    });
  }

  static getConfigElement() {
    return document.createElement("komfovent-domekt-card-editor");
  }

  static getStubConfig() {
    return { type: "custom:komfovent-domekt-card" };
  }
}

const ENTITY_FIELDS = [
  ["outside_temperature", "Temperatura czerpni"],
  ["exhaust_temperature", "Temperatura wyrzutni"],
  ["extract_temperature", "Temperatura wywiewu"],
  ["supply_temperature", "Temperatura nawiewu"],
  ["extract_flow", "Przepływ wywiewu"],
  ["supply_flow", "Przepływ nawiewu"],
  ["panel_temperature", "Temperatura panelu"],
  ["humidity", "Wilgotność"],
  ["air_quality", "Jakość powietrza"],
  ["heat_recovery", "Odzysk ciepła"],
  ["power", "Pobór prądu"],
  ["filter", "Stan filtrów"],
];

class KomfoventDomektCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
  }

  setConfig(config) {
    this._config = config || {};
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    const form = this.shadowRoot.querySelector("ha-form");
    if (form) form.hass = hass;
  }

  _render() {
    if (!this.shadowRoot) return;
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        p { margin: 0 0 12px; color: var(--secondary-text-color); }
      </style>
      <p>Wybierz encje odpowiadające czujnikom centrali. Pola mogą pozostać puste.</p>
      <ha-form></ha-form>
    `;

    const form = this.shadowRoot.querySelector("ha-form");
    form.hass = this._hass;
    form.data = this._config;
    form.schema = ENTITY_FIELDS.map(([name, label]) => ({
      name,
      label,
      selector: { entity: {} },
    }));
    form.addEventListener("value-changed", (event) => {
      event.stopPropagation();
      this._config = {
        ...this._config,
        ...event.detail.value,
        type: "custom:komfovent-domekt-card",
      };
      this.dispatchEvent(new CustomEvent("config-changed", {
        detail: { config: this._config },
        bubbles: true,
        composed: true,
      }));
    });
  }
}

if (!customElements.get("komfovent-domekt-card")) {
  customElements.define("komfovent-domekt-card", KomfoventDomektCard);
}
if (!customElements.get("komfovent-domekt-card-editor")) {
  customElements.define("komfovent-domekt-card-editor", KomfoventDomektCardEditor);
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: "komfovent-domekt-card",
  name: "Komfovent Domekt",
  description: "Schemat przepływu powietrza i odczyty centrali wentylacyjnej.",
});
