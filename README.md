# Renovasjon i Norge for Homey

## Installasjon

Appen er ikke lagt ut i Homey App Store og det er ikke sikkert at den vil bli lagt ut noen gang heller.

**Så pt må den installeres via Homey CLI**:
1. Installer (Homey CLI)[https://apps.developer.homey.app/the-basics/getting-started#1.-install-homey-cli]
1. Klon ned repo:
    ```bash
    git clone https://github.com/runely/renovasjon-norge-homey.git
    ```
1. Installer app dependencies:
    ```bash
    npm i
    ```
1. Kopier `env.json.example` til `env.json` og fyll ut `HEADER_KEY_VALUE` med API-nøkkel fra norkart
1. Installer appen på Homey
    ```bash
    homey app install
    ```

## Oppsett

Etter installasjon, gå til appens innstillinger. Søk opp din adresse så feltene `Gatenavn`, `Husnummer`, `Gatenummer` og `Kommunenummer` autoutfylles med informasjon om din adresse.

Klikk på lagre.

## Bruk

Appen henter nye renovasjonsdata kl 23:00 hver dag.

### Triggers

- **Søppel hentes i dag** : *Trigges klokken 00:00 den dagen søppel hentes*
