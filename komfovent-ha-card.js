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
        .content { padding: 8px 10px 10px; }
        .diagram-wrap {
          position: relative;
          width: 100%;
          max-width: 520px;
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
        .heater-symbol {
          fill: none;
          stroke: #ff5964;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }
        .arrowhead { stroke: var(--ha-card-background, var(--card-background-color, #fff)); stroke-width: 2.5; stroke-linejoin: round; }
        svg text {
          font-family: inherit;
          text-anchor: middle;
        }
        .label { fill: var(--secondary-text-color, #92999e); font-size: 15px; }
        .reading { fill: var(--primary-text-color, #555b60); font-size: 18px; font-weight: 600; }
        .flow-reading { font-weight: 600; }
        .recovery-reading { font-weight: 600; }
        .recovery-icon { width: 5%; }
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
          fill: none;
          stroke: #ff5964;
          stroke-width: 1.5;
        }
        .heater-reading {
          font-size: 18px;
          font-weight: 600;
          text-anchor: start;
        }
        .heater-label {
          fill: var(--secondary-text-color, #92999e);
          font-size: 15px;
          text-anchor: start;
        }
        @media (max-width: 380px) {
          .content { padding: 8px 6px 10px; }
        }
      </style>
      <ha-card>
        <div class="content">
          <div class="diagram-wrap">
            <svg class="diagram" viewBox="0 30 440 622" role="img" aria-label="Komfovent airflow diagram">
              <g transform="translate(0 -9)">
              <path class="house" d="M28 650V250L220 76 412 250V650"/>
              <path class="floor" d="M8 650H432"/>

              <path class="air fresh" d="M115 120L170 174V258L220 309"/>
              <path class="air fresh" d="M220 309L270 258V174L325 120"/>
              <path class="air used" d="M115 475L170 420V365L220 313"/>
              <path class="air used" d="M220 313L270 365V420L325 475"/>
              <path class="arrowhead" d="M170 174L146 168L162 150Z M325 120L317 143L301 127Z" fill="#43b4f5"/>
              <path class="arrowhead" d="M170 420L162 444L146 428Z M325 475L301 467L317 451Z" fill="#ff9b24"/>

              <rect class="core" x="125" y="215" width="190" height="155"/>
              <g class="heater-symbol" transform="translate(277 286)" aria-hidden="true">
                <path d="M6 8C3 6 9 4 6 2M14 8C11 6 17 4 14 2M22 8C19 6 25 4 22 2"/>
                <rect x="1" y="12" width="25" height="12" rx="1.5"/>
                <path d="M7 13v10M13.5 13v10M20 13v10M5 27v-3M22 27v-3"/>
              </g>
              <rect class="heater-badge" x="321" y="270" width="93" height="58" rx="7"/>
              <text class="heater-label" x="330" y="288" data-label="label_heater">Heater</text>
              <text class="reading heater-reading" x="330" y="311" data-value="heater_power">--</text>

              <text class="reading recovery-reading" x="220" y="252" data-value="heat_recovery">--</text>
              <text class="label" x="82" y="54" data-label="label_outside">Fresh air</text>
              <text class="reading" x="82" y="80" data-value="outside_temperature">--</text>
              <text class="label" x="358" y="54" data-label="label_exhaust">Exhaust</text>
              <text class="reading" x="358" y="80" data-value="exhaust_temperature">--</text>

              <text class="reading flow-reading" x="88" y="346" data-value="extract_flow">--</text>
              <text class="reading flow-reading" x="352" y="346" data-value="supply_flow">--</text>

              <text class="label" x="110" y="495" data-label="label_extract">Extract</text>
              <text class="reading" x="110" y="521" data-value="extract_temperature">--</text>
              <text class="label" x="330" y="495" data-label="label_supply">Supply</text>
              <text class="reading" x="330" y="521" data-value="supply_temperature">--</text>

              <text class="label" x="100" y="590" data-label="label_panel">Panel</text>
              <text class="reading" x="100" y="615" data-value="panel_temperature">--</text>
              <text class="label" x="220" y="590" data-label="label_humidity">Humidity</text>
              <text class="reading" x="220" y="615" data-value="humidity">--</text>
              <text class="label" x="340" y="590" data-label="label_filter">Filters</text>
              <text class="reading" x="340" y="615" data-value="filter">--</text>
              </g>
            </svg>
            <ha-icon class="diagram-icon fan-icon" style="left:34.1%;top:47.6%" icon="mdi:fan" aria-hidden="true"></ha-icon>
            <ha-icon class="diagram-icon fan-icon" style="left:65.9%;top:47.6%" icon="mdi:fan" aria-hidden="true"></ha-icon>
            <ha-icon class="diagram-icon recovery-icon" style="left:50%;top:38.6%" icon="mdi:autorenew" aria-hidden="true"></ha-icon>
            <ha-icon class="diagram-icon" style="left:22.7%;top:83.8%" icon="mdi:thermometer" aria-hidden="true"></ha-icon>
            <ha-icon class="diagram-icon" style="left:50%;top:83.8%" icon="mdi:water-percent" aria-hidden="true"></ha-icon>
            <ha-icon class="diagram-icon" style="left:77.3%;top:83.8%" icon="mdi:air-filter" aria-hidden="true"></ha-icon>
          </div>
        </div>
      </ha-card>
    `;

    this.shadowRoot.querySelectorAll("[data-value]").forEach((node) => {
      node.textContent = this._value(this._config[node.dataset.value]);
    });
    this.shadowRoot.querySelectorAll("[data-label]").forEach((node) => {
      const label = this._config[node.dataset.label];
      node.textContent = typeof label === "string" ? label : DEFAULT_LABELS[node.dataset.label];
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
  ["outside_temperature", "Fresh-air temperature"],
  ["exhaust_temperature", "Exhaust-air temperature"],
  ["extract_temperature", "Extract-air temperature"],
  ["supply_temperature", "Supply-air temperature"],
  ["extract_flow", "Extract airflow"],
  ["supply_flow", "Supply airflow"],
  ["panel_temperature", "Panel temperature"],
  ["humidity", "Humidity"],
  ["heat_recovery", "Heat recovery"],
  ["heater_power", "Heater power consumption"],
  ["filter", "Filter status"],
];

const DEFAULT_LABELS = {
  label_outside: "Fresh air",
  label_exhaust: "Exhaust",
  label_extract: "Extract",
  label_supply: "Supply",
  label_panel: "Panel",
  label_humidity: "Humidity",
  label_heater: "Heater",
  label_filter: "Filters",
};

const LABEL_FIELDS = [
  ["label_outside", "Card label: fresh air"],
  ["label_exhaust", "Card label: exhaust"],
  ["label_extract", "Card label: extract"],
  ["label_supply", "Card label: supply"],
  ["label_panel", "Card label: panel"],
  ["label_humidity", "Card label: humidity"],
  ["label_heater", "Card label: heater"],
  ["label_filter", "Card label: filters"],
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
      <p>Select sensor entities and set the card labels in your preferred language. Clear a label to hide it.</p>
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
