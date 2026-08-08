"""
generate_synthetic_dataset.py
------------------------------
Génère un petit dataset SYNTHÉTIQUE de plaques d'immatriculation marocaines,
au format YOLO (image + fichier .txt de labels), pour permettre de tester
immédiatement le pipeline de detection/OCR sans dépendre d'un dataset externe.

⚠️ Ce dataset synthétique sert uniquement à valider la chaîne technique
(entraînement YOLO, inference, OCR). Pour un modèle réellement performant en
production, remplacez-le par un vrai dataset annoté (voir README.md de ce dossier
pour récupérer le dataset Kaggle "Automatic License Plate Recognition (ALPR) Dataset").

Usage:
    pip install pillow numpy opencv-python-headless
    python generate_synthetic_dataset.py --count 300
"""

import argparse
import os
import random
import string

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

CLASSES = ["plate"]


def random_plate_text() -> str:
    """Génère un texte de plaque au format marocain simplifié: 12345-A-6"""
    number1 = "".join(random.choices(string.digits, k=random.choice([4, 5])))
    letter = random.choice("ABCDEFGH")
    number2 = str(random.randint(1, 99))
    return f"{number1}-{letter}-{number2}"


def make_background(width: int, height: int) -> Image.Image:
    """Crée un arrière-plan bruité simulant une scène de cour d'usine (gris/bleu)."""
    base_color = random.choice([(90, 95, 100), (60, 65, 75), (110, 110, 100), (70, 80, 70)])
    img = Image.new("RGB", (width, height), base_color)
    arr = np.array(img).astype(np.int16)
    noise = np.random.randint(-15, 15, arr.shape, dtype=np.int16)
    arr = np.clip(arr + noise, 0, 255).astype(np.uint8)
    return Image.fromarray(arr)


def draw_plate(img: Image.Image, text: str):
    """Dessine une plaque rectangulaire blanche avec le texte, à une position aléatoire,
    et retourne la bounding box (x1, y1, x2, y2)."""
    width, height = img.size
    plate_w = random.randint(int(width * 0.25), int(width * 0.4))
    plate_h = int(plate_w * 0.28)

    x1 = random.randint(0, max(1, width - plate_w))
    y1 = random.randint(0, max(1, height - plate_h))
    x2, y2 = x1 + plate_w, y1 + plate_h

    draw = ImageDraw.Draw(img)
    draw.rectangle([x1, y1, x2, y2], fill=(240, 240, 235), outline=(20, 20, 20), width=3)

    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", int(plate_h * 0.5))
    except Exception:
        font = ImageFont.load_default()

    bbox = draw.textbbox((0, 0), text, font=font)
    text_w, text_h = bbox[2] - bbox[0], bbox[3] - bbox[1]
    tx = x1 + (plate_w - text_w) / 2
    ty = y1 + (plate_h - text_h) / 2 - bbox[1]
    draw.text((tx, ty), text, fill=(10, 10, 10), font=font)

    return x1, y1, x2, y2


def to_yolo_label(x1, y1, x2, y2, img_w, img_h, class_id=0):
    cx = ((x1 + x2) / 2) / img_w
    cy = ((y1 + y2) / 2) / img_h
    w = (x2 - x1) / img_w
    h = (y2 - y1) / img_h
    return f"{class_id} {cx:.6f} {cy:.6f} {w:.6f} {h:.6f}"


def generate(count: int, out_dir: str, img_size: int = 640, val_ratio: float = 0.15):
    random.seed(42)
    np.random.seed(42)

    n_val = int(count * val_ratio)
    labels_meta = []

    for i in range(count):
        split = "val" if i < n_val else "train"
        img = make_background(img_size, img_size)
        text = random_plate_text()
        x1, y1, x2, y2 = draw_plate(img, text)

        # légère perturbation (flou / rotation simulée via blur) pour la robustesse
        if random.random() < 0.3:
            arr = cv2.GaussianBlur(np.array(img), (3, 3), 0)
            img = Image.fromarray(arr)

        filename = f"plate_{i:04d}"
        img_path = os.path.join(out_dir, "images", split, f"{filename}.jpg")
        label_path = os.path.join(out_dir, "labels", split, f"{filename}.txt")

        img.save(img_path, quality=90)
        with open(label_path, "w") as f:
            f.write(to_yolo_label(x1, y1, x2, y2, img_size, img_size) + "\n")

        labels_meta.append((filename, text, split))

    # data.yaml pour l'entraînement YOLOv8
    data_yaml = os.path.join(out_dir, "data.yaml")
    with open(data_yaml, "w") as f:
        f.write(f"path: {os.path.abspath(out_dir)}\n")
        f.write("train: images/train\n")
        f.write("val: images/val\n")
        f.write(f"nc: {len(CLASSES)}\n")
        f.write(f"names: {CLASSES}\n")

    # fichier de correspondance image -> texte de plaque (utile pour valider l'OCR)
    with open(os.path.join(out_dir, "ground_truth.csv"), "w") as f:
        f.write("filename,plate_text,split\n")
        for filename, text, split in labels_meta:
            f.write(f"{filename},{text},{split}\n")

    print(f"Dataset synthétique généré: {count} images ({count - n_val} train / {n_val} val)")
    print(f"-> {out_dir}/data.yaml prêt pour: python train_yolo.py --data {data_yaml}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--count", type=int, default=300, help="Nombre total d'images à générer")
    parser.add_argument("--out", default=".", help="Dossier de sortie (racine du dataset)")
    parser.add_argument("--imgsz", type=int, default=640)
    args = parser.parse_args()

    generate(args.count, args.out, args.imgsz)
