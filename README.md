# Karta Komfovent Domekt

Niestandardowa karta Lovelace do Home Assistant, wzorowana na przesłanym schemacie wentylacji. Korzysta ze standardowych encji HA, więc można ją połączyć z sensorami udostępnionymi przez integrację Modbus.

## Instalacja

1. Skopiuj `komfovent-domekt-card.js` do `/config/www/komfovent-domekt-card.js`.
2. W Home Assistant dodaj zasób modułu JavaScript pod adresem `/local/komfovent-domekt-card.js` i wybierz typ **JavaScript Module**.
3. Dodaj kartę z selektora kart dashboardu. W edytorze karty wybierz dostępne sensory. Możesz też użyć konfiguracji YAML:

```yaml
type: custom:komfovent-domekt-card
outside_temperature: sensor.domekt_outdoor_temperature
exhaust_temperature: sensor.domekt_exhaust_temperature
extract_temperature: sensor.domekt_extract_temperature
supply_temperature: sensor.domekt_supply_temperature
extract_flow: sensor.domekt_extract_airflow
supply_flow: sensor.domekt_supply_airflow
panel_temperature: sensor.domekt_panel_temperature
humidity: sensor.domekt_humidity
air_quality: sensor.domekt_air_quality
heat_recovery: sensor.domekt_heat_recovery
power: sensor.domekt_power
filter: sensor.domekt_filter_status
```

Powyższe identyfikatory encji są przykładowe. Zastąp je własnymi encjami lub wybierz sensory w edytorze karty. Wartość i jednostka są pobierane z encji; nieprzypisane, nieznane lub niedostępne encje są oznaczone `--`.
