# Datasets — Plateforme Holcim Maroc (suivi des camions)

Deux jeux de données distincts, pour deux besoins différents :

```
holcim-datasets/
├── anpr-dataset/        Images de plaques (format YOLO) — pour entraîner le
│                        modèle de détection/lecture de plaques (YOLOv8 + EasyOCR)
│
└── demo-dataset/         Données métier réalistes (camions, chauffeurs, alertes,
                          justifications, utilisateurs) — pour remplacer les
                          tableaux mockés dans le frontend Angular et tester le backend
```

## `anpr-dataset/` — Vision par ordinateur

300 images synthétiques de plaques marocaines + labels YOLO (`data.yaml` prêt à
l'emploi). **Synthétique = utile pour valider la chaîne technique tout de suite,
pas pour un modèle fiable en conditions réelles.** Voir `anpr-dataset/README.md`
pour régénérer/agrandir ce dataset ou récupérer le vrai dataset Kaggle ANPR.

```bash
cd anpr-dataset
python generate_synthetic_dataset.py --count 500 --out .
```

## `demo-dataset/` — Données métier (camions, alertes, KPI)

40 camions, 240 passages, alertes, justifications et 11 utilisateurs générés de
façon cohérente avec vos entités backend et vos composants Angular. Contient un
fichier **prêt à coller directement** dans vos composants
(`demo-dataset/output/camions_carte_angular.json`). Voir `demo-dataset/README.md`
pour le détail de chaque fichier et comment l'utiliser.

```bash
cd demo-dataset
python generate_demo_dataset.py --camions 100 --jours 14 --out ./output
```

Les deux scripts ne dépendent que de la bibliothèque standard Python + Pillow/OpenCV
pour `anpr-dataset` (`pip install pillow numpy opencv-python-headless`) — rien à
installer pour `demo-dataset`.
