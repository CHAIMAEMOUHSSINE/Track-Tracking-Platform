# Dataset ANPR — Suivi des camions Holcim Maroc

## ⚠️ À propos de ce dossier

Je n'ai pas pu télécharger le dataset Kaggle directement depuis mon environnement d'exécution
(kaggle.com n'est pas accessible depuis ce sandbox). Ce dossier contient donc :

1. **Un dataset synthétique déjà généré** (`images/`, `labels/`, `data.yaml`) — 120 images
   de plaques marocaines simulées, au format YOLO — pour que vous puissiez tester
   immédiatement toute la chaîne technique (entraînement YOLOv8 → inference → OCR → API)
   sans attendre.
2. **Un script réutilisable** (`generate_synthetic_dataset.py`) pour régénérer ou agrandir
   ce dataset (`--count 1000` par exemple).
3. **Les instructions ci-dessous** pour récupérer le vrai dataset Kaggle chez vous et
   l'intégrer à la même structure.

Le dataset synthétique est utile pour valider le pipeline, mais **ne donnera pas un modèle
YOLO/OCR performant en conditions réelles** (plaques marocaines réelles, éclairage, angles,
saleté, etc.). Pour la production, entraînez sur un vrai dataset annoté.

---

## Structure du dataset (format YOLO)

```
dataset/
├── images/
│   ├── train/          # images d'entraînement (.jpg)
│   └── val/             # images de validation (.jpg)
├── labels/
│   ├── train/           # 1 fichier .txt par image, format YOLO: class cx cy w h (normalisé 0-1)
│   └── val/
├── data.yaml             # config YOLOv8 (chemins + classes)
├── ground_truth.csv       # correspondance image -> texte de plaque (pour valider l'OCR)
└── generate_synthetic_dataset.py
```

Une seule classe : `plate` (id 0).

---

## Régénérer / agrandir le dataset synthétique

```bash
pip install pillow numpy opencv-python-headless
python generate_synthetic_dataset.py --count 1000 --out . --imgsz 640
```

---

## Récupérer le vrai dataset Kaggle (à faire chez vous)

Le cahier des charges recommande le dataset **"Automatic License Plate Recognition (ALPR) Dataset"**
sur Kaggle. Pour l'utiliser :

1. Créez un compte Kaggle et générez un token API : `Kaggle → Account → Create New API Token`
   (télécharge un fichier `kaggle.json`).
2. Placez `kaggle.json` dans `~/.kaggle/kaggle.json` (Linux/Mac) ou `%USERPROFILE%\.kaggle\kaggle.json` (Windows).
3. Installez le CLI et téléchargez :

```bash
pip install kaggle
kaggle datasets download -d <owner>/<dataset-slug> -p ./kaggle_raw --unzip
```

> Remplacez `<owner>/<dataset-slug>` par le slug exact du dataset choisi sur kaggle.com
> (recherchez "Automatic License Plate Recognition" ou "Car License Plate Detection" —
> plusieurs variantes existent, vérifiez qu'il contient bien des annotations de bounding boxes).

4. Convertissez les annotations au format YOLO si nécessaire (la plupart des datasets ALPR
   Kaggle sont déjà en Pascal VOC XML ou YOLO txt — un script de conversion est fourni
   ci-dessous pour le cas Pascal VOC).

5. Fusionnez avec `images/train`, `images/val`, `labels/train`, `labels/val` de ce dossier
   (ou pointez `data.yaml` directement vers le dossier téléchargé).

### Conversion Pascal VOC XML → YOLO (si le dataset Kaggle est en VOC)

```python
# voc_to_yolo.py — exemple minimal, à adapter selon la structure exacte du dataset téléchargé
import xml.etree.ElementTree as ET
import os

def convert(xml_path, img_w, img_h, out_txt_path):
    tree = ET.parse(xml_path)
    lines = []
    for obj in tree.findall("object"):
        bbox = obj.find("bndbox")
        x1, y1 = int(bbox.find("xmin").text), int(bbox.find("ymin").text)
        x2, y2 = int(bbox.find("xmax").text), int(bbox.find("ymax").text)
        cx, cy = ((x1 + x2) / 2) / img_w, ((y1 + y2) / 2) / img_h
        w, h = (x2 - x1) / img_w, (y2 - y1) / img_h
        lines.append(f"0 {cx:.6f} {cy:.6f} {w:.6f} {h:.6f}")
    with open(out_txt_path, "w") as f:
        f.write("\n".join(lines))
```

---

## Entraîner YOLOv8 sur ce dataset

Depuis `ai-service/` :

```bash
pip install -r requirements.txt
python train_yolo.py --data ../dataset/data.yaml --epochs 100 --imgsz 640
# puis copier le meilleur modèle :
cp runs/plate_detector/weights/best.pt weights/plate_detector.pt
```
