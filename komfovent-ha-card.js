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
        .content { padding: 14px 18px 22px; }
        .diagram-wrap {
          position: relative;
          width: min(100%, 440px);
          margin: 0 auto;
        }
        .diagram {
          display: block;
          width: 100%;
          height: auto;
        }
        .diagram-icon {
          position: absolute;
          z-index: 1;
          display: block;
          width: 5.5%;
          aspect-ratio: 1;
          transform: translate(-50%, -50%);
          color: var(--primary-color, #315d96);
          --mdc-icon-size: 100%;
        }
        .fan-icon {
          width: 6.5%;
        }
        .heater-icon {
          color: #ff5964;
        }
        svg text {
          font-family: inherit;
          text-anchor: middle;
        }
        .label { fill: var(--secondary-text-color, #92999e); font-size: 16px; }
        .reading { fill: var(--primary-text-color, #555b60); font-size: 21px; font-weight: 500; }
        .flow-reading { font-size: 20px; font-weight: 600; }
        .house, .floor, .core {
          fill: none;
          stroke: #d7dde5;
          stroke-width: 10;
          stroke-linejoin: round;
        }
        .floor { stroke-width: 10; }
        .core { stroke-width: 5; }
        .air { fill: none; stroke-width: 11; stroke-linecap: square; stroke-linejoin: round; }
        .fresh { stroke: #43b4f5; }
        .used { stroke: #ff9b24; }
        .heater-badge {
          fill: var(--ha-card-background, var(--card-background-color, #fff));
          stroke: #ff5964;
          stroke-width: 1.5;
        }
        .heater-reading {
          font-size: 15px;
          font-weight: 700;
          text-anchor: start;
        }
        .heater-label {
          fill: var(--secondary-text-color, #92999e);
          font-size: 11px;
          text-anchor: start;
        }
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
          display: block;
          width: 25px;
          height: 25px;
          margin: 0 auto 4px;
          color: var(--primary-color, #315d96);
          --mdc-icon-size: 100%;
        }
        .metric-label { color: var(--secondary-text-color, #92999e); font-size: 14px; }
        .metric-value {
          margin-top: 2px;
          color: var(--primary-text-color, #555b60);
          font-size: 19px;
          font-weight: 600;
          overflow-wrap: anywhere;
        }
        @media (max-width: 380px) {
          .content { padding: 10px 8px 16px; }
          .metric-label { font-size: 12px; }
          .metric-value { font-size: 16px; }
        }
      </style>
      <ha-card>
        <div class="content">
          <div class="diagram-wrap">
            <svg class="diagram" viewBox="0 0 440 730" role="img" aria-label="Schemat przepływu powietrza przez centralę">
              <path class="house" d="M28 680V250L220 76 412 250V680"/>
              <path class="floor" d="M8 680H432"/>

              <path class="air fresh" d="M115 120L170 174V258L220 309"/>
              <path class="air fresh" d="M220 309L270 258V174L325 120"/>
              <path class="air used" d="M115 475L170 420V365L220 313"/>
              <path class="air used" d="M220 313L270 365V420L325 475"/>
              <path d="M170 174l-12-25-13 13zM325 120l-11 25-14-14z" fill="#43b4f5"/>
              <path d="M170 420l-11 25-14-14zM325 475l-11-25-14 14z" fill="#ff9b24"/>

              <rect class="core" x="125" y="215" width="190" height="155"/>
              <rect class="heater-badge" x="321" y="270" width="82" height="58" rx="7"/>
              <text class="heater-label" x="352" y="288" data-label="label_heater">Grzałka</text>
              <text class="reading heater-reading" x="352" y="311" data-value="heater_power">--</text>

              <text class="label" x="82" y="54" data-label="label_outside">Czerpnia</text>
              <text class="reading" x="82" y="80" data-value="outside_temperature">--</text>
              <text class="label" x="358" y="54" data-label="label_exhaust">Wyrzutnia</text>
              <text class="reading" x="358" y="80" data-value="exhaust_temperature">--</text>

              <text class="reading flow-reading" x="70" y="346" data-value="extract_flow">--</text>
              <text class="reading flow-reading" x="370" y="346" data-value="supply_flow">--</text>

              <text class="label" x="110" y="515" data-label="label_extract">Wywiew</text>
              <text class="reading" x="110" y="541" data-value="extract_temperature">--</text>
              <text class="label" x="330" y="515" data-label="label_supply">Nawiew</text>
              <text class="reading" x="330" y="541" data-value="supply_temperature">--</text>

              <text class="label" x="100" y="615" data-label="label_panel">Panel</text>
              <text class="reading" x="100" y="640" data-value="panel_temperature">--</text>
              <text class="label" x="220" y="615" data-label="label_humidity">Wilgotność</text>
              <text class="reading" x="220" y="640" data-value="humidity">--</text>
              <text class="label" x="340" y="615" data-label="label_air_quality">Jakość</text>
              <text class="reading" x="340" y="640" data-value="air_quality">--</text>
            </svg>
            <ha-icon class="diagram-icon fan-icon" style="left:32.5%;top:45.9%" icon="mdi:fan" aria-hidden="true"></ha-icon>
            <ha-icon class="diagram-icon fan-icon" style="left:67.5%;top:45.9%" icon="mdi:fan" aria-hidden="true"></ha-icon>
            <ha-icon class="diagram-icon heater-icon" style="left:76.8%;top:40.1%" icon="mdi:radiator" aria-hidden="true"></ha-icon>
            <ha-icon class="diagram-icon" style="left:22.7%;top:80%" icon="mdi:thermometer" aria-hidden="true"></ha-icon>
            <ha-icon class="diagram-icon" style="left:50%;top:80%" icon="mdi:water-percent" aria-hidden="true"></ha-icon>
            <ha-icon class="diagram-icon" style="left:77.3%;top:80%" icon="mdi:leaf" aria-hidden="true"></ha-icon>
          </div>

          <div class="metrics">
            <div class="metric">
              <ha-icon class="metric-icon" icon="mdi:autorenew" aria-hidden="true"></ha-icon>
              <div class="metric-label" data-label="label_heat_recovery">Odzysk ciepła</div>
              <div class="metric-value" data-value="heat_recovery">--</div>
            </div>
            <div class="metric">
              <ha-icon class="metric-icon" icon="mdi:flash" aria-hidden="true"></ha-icon>
              <div class="metric-label" data-label="label_power">Pobór prądu</div>
              <div class="metric-value" data-value="power">--</div>
            </div>
            <div class="metric">
              <ha-icon class="metric-icon" icon="mdi:air-filter" aria-hidden="true"></ha-icon>
              <div class="metric-label" data-label="label_filter">Filtry</div>
              <div class="metric-value" data-value="filter">--</div>
            </div>
          </div>
        </div>
      </ha-card>
    `;

    this.shadowRoot.querySelectorAll("[data-value]").forEach((node) => {
      node.textContent = this._value(this._config[node.dataset.value]);
    });
    this.shadowRoot.querySelectorAll("[data-label]").forEach((node) => {
      node.textContent = this._config[node.dataset.label] || DEFAULT_LABELS[node.dataset.label];
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
  ["heater_power", "Pobór prądu grzałki"],
  ["filter", "Stan filtrów"],
];

const DEFAULT_LABELS = {
  label_outside: "Czerpnia",
  label_exhaust: "Wyrzutnia",
  label_extract: "Wywiew",
  label_supply: "Nawiew",
  label_panel: "Panel",
  label_humidity: "Wilgotność",
  label_air_quality: "Jakość",
  label_heater: "Grzałka",
  label_heat_recovery: "Odzysk ciepła",
  label_power: "Pobór prądu",
  label_filter: "Filtry",
};

const LABEL_FIELDS = [
  ["label_outside", "Napis: czerpnia"],
  ["label_exhaust", "Napis: wyrzutnia"],
  ["label_extract", "Napis: wywiew"],
  ["label_supply", "Napis: nawiew"],
  ["label_panel", "Napis: panel"],
  ["label_humidity", "Napis: wilgotność"],
  ["label_air_quality", "Napis: jakość powietrza"],
  ["label_heater", "Napis: grzałka"],
  ["label_heat_recovery", "Napis: odzysk ciepła"],
  ["label_power", "Napis: pobór prądu"],
  ["label_filter", "Napis: filtry"],
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
      <p>Wybierz encje czujników i opcjonalnie zmień napisy karty na własny język.</p>
      <ha-form></ha-form>
    `;

    const form = this.shadowRoot.querySelector("ha-form");
    form.hass = this._hass;
    form.data = { ...DEFAULT_LABELS, ...this._config };
    form.schema = [
      ...ENTITY_FIELDS.map(([name, label]) => ({
        name,
        label,
        selector: { entity: {} },
      })),
      ...LABEL_FIELDS.map(([name, label]) => ({
        name,
        label,
        selector: { text: {} },
      })),
    ];
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
  description: "Configurable airflow diagram and sensor readings for Komfovent Domekt units.",
});
