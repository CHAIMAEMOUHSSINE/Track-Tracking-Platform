# Dataset de démo — Plateforme Holcim (camions, chauffeurs, alertes)

Jeu de données réaliste généré pour remplacer les tableaux codés en dur
(`TRUCKS_DEMO`, etc.) dans les composants Angular, et pouvoir aussi tester le
backend avec des données cohérentes.

Tout est **aligné sur vos modèles réels** :
- Enums backend : `Role`, `EtatCamion`, `StatutAlerte`, `CauseJustification`
- Points de contrôle : les 6 mêmes que dans `DataSeeder.java` (PORTE_ENTREE,
  PARKING, AGENT_COMMERCIAL_ENTREE, EXPEDITION, AGENT_COMMERCIAL_SORTIE, PORTE_SORTIE)
  avec les mêmes seuils (15 / 5 / 20 min)
- Coordonnées GPS dans le périmètre réel de l'usine Holcim Meknès (celles du
  composant `cartography.component.ts`)

## Contenu de `output/`

| Fichier | Description |
|---|---|
| `utilisateurs.json` / `.csv` | 11 utilisateurs, répartis sur les 5 rôles |
| `camions.json` / `.csv` | 40 camions avec chauffeur, produit, destination, état |
| `points_controle.json` | Les 6 points de contrôle du parcours |
| `passages.json` / `.csv` | 240 passages (6 par camion) avec horodatage réaliste |
| `alertes.json` / `.csv` | Alertes générées pour les camions ayant dépassé 45 min |
| `justifications.json` / `.csv` | Justifications (cause + commentaire + service) pour ~65% des alertes |
| `camions_carte_angular.json` | **Prêt à coller** dans `TRUCKS_DEMO` du composant cartographie |
| `dashboard_stats.json` | Snapshot de KPI, au format exact de `DashboardStatsResponse` |

## Régénérer avec d'autres volumes

```bash
pip install --break-system-packages  # aucune dépendance externe requise, Python standard uniquement
python generate_demo_dataset.py --camions 100 --jours 14 --out ./output
```

## Utilisation côté Angular

Ouvrez `camions_carte_angular.json`, copiez le tableau, et remplacez `TRUCKS_DEMO`
dans `cartography.component.ts` :

```typescript
const TRUCKS_DEMO: Truck[] = [
  // ... coller ici le contenu de camions_carte_angular.json
];
```

Pour l'expédition (`expedition.component.ts`), filtrez `camions.json` sur les
camions dont le dernier point de contrôle est `EXPEDITION` et adaptez les champs
(`plate` = `immatriculation`, `product` = `produit`, etc.).

## Utilisation côté backend (import MySQL)

Les fichiers `.csv` s'importent directement avec `LOAD DATA INFILE` ou via un
script JPA de seed, à condition de respecter l'ordre des insertions (utilisateurs
et points de contrôle d'abord, puis camions, puis passages, puis alertes, puis
justifications) à cause des clés étrangères.

## Cohérence des statuts

Le générateur simule ~30% de camions en incident (un point de contrôle avec un
dépassement délibéré de 20 à 40 min), ce qui donne une répartition réaliste :
environ 65% VERT, 5% ORANGE, 30% ROUGE — modifiable en ajustant la probabilité
`surcharge` dans le script si vous voulez un dashboard de démo plus ou moins
"calme".
