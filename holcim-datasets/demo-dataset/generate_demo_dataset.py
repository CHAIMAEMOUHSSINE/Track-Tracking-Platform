"""
generate_demo_dataset.py
--------------------------
Génère un jeu de données de démonstration REALISTE pour la plateforme Holcim
(camions, chauffeurs, passages, alertes, justifications, utilisateurs), aligné
exactement sur :
  - les entités JPA du backend (Camion, Passage, Alerte, Justification, Utilisateur,
    PointControle, avec leurs enums Role / EtatCamion / StatutAlerte / CauseJustification)
  - les interfaces TypeScript utilisées dans les composants Angular déjà livrés
    (Truck pour la cartographie, CamionChargement pour l'expédition, etc.)

Objectif : remplacer les tableaux `TRUCKS_DEMO` codés en dur dans les composants
Angular par de vraies données, et pouvoir aussi seeder la base MySQL du backend
si besoin (les CSV s'importent directement).

Usage:
    python generate_demo_dataset.py --camions 40 --jours 7 --out ./output
"""

import argparse
import csv
import json
import os
import random
from datetime import datetime, timedelta

# ---------------------------------------------------------------------------
# Référentiels alignés sur le backend (enums Java)
# ---------------------------------------------------------------------------

ROLES = ["RH", "AGENT_COMMERCIAL", "EXPEDITION", "PRODUCTION", "MAINTENANCE"]

POINTS_CONTROLE = [
    {"nom": "PORTE_ENTREE", "ordre": 1, "dureeMax": None},
    {"nom": "PARKING", "ordre": 2, "dureeMax": 15},
    {"nom": "AGENT_COMMERCIAL_ENTREE", "ordre": 3, "dureeMax": 5},
    {"nom": "EXPEDITION", "ordre": 4, "dureeMax": 20},
    {"nom": "AGENT_COMMERCIAL_SORTIE", "ordre": 5, "dureeMax": 5},
    {"nom": "PORTE_SORTIE", "ordre": 6, "dureeMax": None},
]

CAUSES_JUSTIFICATION = [
    "MACHINE_EN_PANNE", "STOCK_INDISPONIBLE", "FORTE_AFFLUENCE",
    "INCIDENT_TECHNIQUE", "PROBLEME_PESEE", "AUTRE",
]

COMMENTAIRES_PAR_CAUSE = {
    "MACHINE_EN_PANNE": "Arrêt du broyeur ciment ligne 2, intervention en cours.",
    "STOCK_INDISPONIBLE": "Rupture temporaire de stock CPJ 45, réapprovisionnement silo.",
    "FORTE_AFFLUENCE": "Pic d'affluence au pont-bascule, plusieurs camions en file.",
    "INCIDENT_TECHNIQUE": "Panne du système de pesée automatique, bascule manuelle.",
    "PROBLEME_PESEE": "Écart de poids détecté, second passage au pont-bascule requis.",
    "AUTRE": "Retard administratif lié aux documents de transport.",
}

PRODUITS = ["CPJ 45", "CPJ 35", "CPA 55", "CPJ 45 N", "Chaux hydraulique"]
DESTINATIONS = ["Fès", "Meknès centre", "Ifrane", "Sefrou", "Rabat", "Casablanca", "El Hajeb", "Azrou"]
TRANSPORTEURS = ["Transport Amrani", "SOMATRA", "Trans Atlas", "CTM Fret", "Logimaroc", "Trans Meknès"]

PRENOMS_H = ["Mohamed", "Rachid", "Hassan", "Omar", "Youssef", "Karim", "Ahmed", "Said", "Khalid", "Anas"]
PRENOMS_F = ["Fatima", "Khadija", "Salma", "Nawal", "Imane", "Zineb", "Amal", "Sara"]
NOMS = ["El Amrani", "Bouzid", "Idrissi", "Naji", "Tazi", "Benali", "Chraibi", "Fassi", "Alaoui", "Bennis",
        "Moutawakil", "Semlali", "Karimi", "Lahlou", "Berrada"]

# Bornes réelles du site Holcim Meknès (route de Fès km 8, Ouisslane) — cf. composant cartographie
LAT_MIN, LAT_MAX = 33.9066, 33.9118
LNG_MIN, LNG_MAX = -5.4995, -5.4900

random.seed(42)


def plaque_marocaine() -> str:
    numero1 = random.randint(1000, 9999)
    lettre = random.choice("ABCDEFGH")
    numero2 = random.randint(1, 99)
    return f"{numero1}-{lettre}-{numero2}"


def nom_complet() -> tuple[str, str]:
    if random.random() < 0.8:
        prenom = random.choice(PRENOMS_H)
    else:
        prenom = random.choice(PRENOMS_F)
    nom = random.choice(NOMS)
    return prenom, nom


def email_from(prenom: str, nom: str, domaine: str = "holcim.ma") -> str:
    slug_prenom = prenom.lower().replace(" ", "")
    slug_nom = nom.lower().replace(" ", "").replace("'", "")
    return f"{slug_prenom}.{slug_nom}@{domaine}"


def etat_depuis_minutes(total_minutes: int) -> str:
    if total_minutes > 45:
        return "ROUGE"
    if total_minutes > 35:
        return "ORANGE"
    return "VERT"


def etat_court(etat: str) -> str:
    """Convertit VERT/ORANGE/ROUGE (backend) en green/orange/red (frontend Angular)."""
    return {"VERT": "green", "ORANGE": "orange", "ROUGE": "red"}[etat]


# ---------------------------------------------------------------------------
# Génération des utilisateurs
# ---------------------------------------------------------------------------

def generer_utilisateurs():
    utilisateurs = []
    uid = 1
    # 2 par rôle minimum + 1 admin RH déjà prévu par le DataSeeder backend
    for role in ROLES:
        nb = 3 if role == "RH" else 2
        for _ in range(nb):
            prenom, nom = nom_complet()
            utilisateurs.append({
                "id": uid,
                "nom": nom,
                "prenom": prenom,
                "email": email_from(prenom, nom),
                "role": role,
            })
            uid += 1
    return utilisateurs


# ---------------------------------------------------------------------------
# Génération des camions + passages + alertes + justifications
# ---------------------------------------------------------------------------

def generer_camions_et_parcours(nb_camions: int, nb_jours: int, utilisateurs):
    camions = []
    passages = []
    alertes = []
    justifications = []

    services_par_role = {
        "PRODUCTION": [u for u in utilisateurs if u["role"] == "PRODUCTION"],
        "EXPEDITION": [u for u in utilisateurs if u["role"] == "EXPEDITION"],
        "MAINTENANCE": [u for u in utilisateurs if u["role"] == "MAINTENANCE"],
    }

    camion_id = 1
    passage_id = 1
    alerte_id = 1
    justification_id = 1
    now = datetime.now()

    for _ in range(nb_camions):
        plaque = plaque_marocaine()
        transporteur = random.choice(TRANSPORTEURS)
        chauffeur = f"{nom_complet()[0]} {nom_complet()[1]}"
        produit = random.choice(PRODUITS)
        destination = random.choice(DESTINATIONS)

        # Date de passage : quelque part dans les N derniers jours, heures ouvrées 6h-20h
        jour_offset = random.randint(0, nb_jours - 1)
        heure_debut = now - timedelta(days=jour_offset)
        heure_debut = heure_debut.replace(
            hour=random.randint(6, 18), minute=random.randint(0, 59), second=0, microsecond=0
        )

        # Simule les 6 passages successifs, avec parfois un dépassement de délai
        t = heure_debut
        surcharge = random.random() < 0.30  # 30% des camions ont un incident quelque part
        etape_en_retard = random.choice([1, 3]) if surcharge else None  # PARKING ou EXPEDITION

        for i, point in enumerate(POINTS_CONTROLE):
            passages.append({
                "id": passage_id,
                "camionId": camion_id,
                "immatriculation": plaque,
                "pointControle": point["nom"],
                "dateHeure": t.isoformat(),
            })
            passage_id += 1

            # Temps NORMAL (sans incident) : nettement en dessous du seuil max autorisé,
            # sinon presque tous les camions dépasseraient 45 min même sans problème.
            if point["dureeMax"] is not None:
                duree_normale = random.randint(2, max(3, point["dureeMax"] // 2))
            else:
                duree_normale = random.randint(1, 3)  # portes d'entrée/sortie : passage rapide

            if etape_en_retard == i:
                duree_reelle = duree_normale + random.randint(20, 40)  # incident : dépassement net
            else:
                duree_reelle = duree_normale
            t = t + timedelta(minutes=duree_reelle)

        temps_total = int((t - heure_debut).total_seconds() // 60)
        etat = etat_depuis_minutes(temps_total)

        camions.append({
            "id": camion_id,
            "immatriculation": plaque,
            "transporteur": transporteur,
            "chauffeur": chauffeur,
            "produit": produit,
            "destination": destination,
            "etat": etat,
            "tempsTotalMinutes": temps_total,
            "dateEntree": heure_debut.isoformat(),
            "dateSortie": t.isoformat(),
        })

        if etat == "ROUGE":
            alertes.append({
                "id": alerte_id,
                "camionId": camion_id,
                "immatriculation": plaque,
                "dateHeure": t.isoformat(),
                "tempsTotalMinutes": temps_total,
                "statut": "OUVERTE",
            })

            # ~65% des alertes sont déjà justifiées dans le jeu de données
            if random.random() < 0.65:
                cause = random.choice(CAUSES_JUSTIFICATION)
                service_role = random.choice(["PRODUCTION", "EXPEDITION", "MAINTENANCE"])
                service_user = random.choice(services_par_role[service_role])
                justifications.append({
                    "id": justification_id,
                    "alerteId": alerte_id,
                    "cause": cause,
                    "commentaire": COMMENTAIRES_PAR_CAUSE[cause],
                    "date": (t + timedelta(minutes=random.randint(5, 60))).isoformat(),
                    "service": service_role,
                    "renseignePar": f"{service_user['prenom']} {service_user['nom']}",
                })
                alertes[-1]["statut"] = "JUSTIFIEE"
                alertes[-1]["causeJustification"] = cause
                justification_id += 1

            alerte_id += 1

        camion_id += 1

    return camions, passages, alertes, justifications


def camions_pour_carte_angular(camions):
    """
    Format prêt à coller dans `TRUCKS_DEMO` du composant cartography.component.ts
    (interface Truck : id, driver, product, destination, status, time, lat, lng).
    """
    resultat = []
    for c in camions:
        resultat.append({
            "id": c["immatriculation"],
            "driver": c["chauffeur"],
            "product": c["produit"],
            "destination": c["destination"],
            "status": etat_court(c["etat"]),
            "time": c["tempsTotalMinutes"],
            "lat": round(random.uniform(LAT_MIN, LAT_MAX), 6),
            "lng": round(random.uniform(LNG_MIN, LNG_MAX), 6),
        })
    return resultat


def calculer_dashboard_stats(camions, alertes):
    total = len(camions)
    repartition = {"VERT": 0, "ORANGE": 0, "ROUGE": 0}
    for c in camions:
        repartition[c["etat"]] += 1

    temps_moyens = [c["tempsTotalMinutes"] for c in camions]
    temps_moyen = round(sum(temps_moyens) / len(temps_moyens), 1) if temps_moyens else 0

    alertes_actives = len([a for a in alertes if a["statut"] == "OUVERTE"])
    retards = repartition["ROUGE"]
    pourcentage_retards = round((retards * 100 / total), 1) if total else 0

    return {
        "totalCamions": total,
        "camionsEnCours": int(total * 0.35),  # simulation : ~35% encore dans l'usine
        "camionsTermines": total - int(total * 0.35),
        "nombreRetards": retards,
        "tempsMoyenParcoursMinutes": temps_moyen,
        "pourcentageRetards": pourcentage_retards,
        "alertesActives": alertes_actives,
        "repartitionParEtat": repartition,
    }


# ---------------------------------------------------------------------------
# Écriture des fichiers
# ---------------------------------------------------------------------------

def ecrire_json(data, path):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def ecrire_csv(data, path):
    if not data:
        return
    # Certaines lignes (ex: alertes non justifiées) ont moins de champs que d'autres :
    # on prend l'union de toutes les clés pour ne perdre aucune colonne.
    fieldnames = []
    for row in data:
        for key in row.keys():
            if key not in fieldnames:
                fieldnames.append(key)
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(data)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--camions", type=int, default=40)
    parser.add_argument("--jours", type=int, default=7)
    parser.add_argument("--out", default="./output")
    args = parser.parse_args()

    os.makedirs(args.out, exist_ok=True)

    utilisateurs = generer_utilisateurs()
    camions, passages, alertes, justifications = generer_camions_et_parcours(
        args.camions, args.jours, utilisateurs
    )
    camions_carte = camions_pour_carte_angular(camions)
    stats = calculer_dashboard_stats(camions, alertes)

    ecrire_json(utilisateurs, os.path.join(args.out, "utilisateurs.json"))
    ecrire_csv(utilisateurs, os.path.join(args.out, "utilisateurs.csv"))

    ecrire_json(POINTS_CONTROLE, os.path.join(args.out, "points_controle.json"))

    ecrire_json(camions, os.path.join(args.out, "camions.json"))
    ecrire_csv(camions, os.path.join(args.out, "camions.csv"))

    ecrire_json(passages, os.path.join(args.out, "passages.json"))
    ecrire_csv(passages, os.path.join(args.out, "passages.csv"))

    ecrire_json(alertes, os.path.join(args.out, "alertes.json"))
    ecrire_csv(alertes, os.path.join(args.out, "alertes.csv"))

    ecrire_json(justifications, os.path.join(args.out, "justifications.json"))
    ecrire_csv(justifications, os.path.join(args.out, "justifications.csv"))

    ecrire_json(camions_carte, os.path.join(args.out, "camions_carte_angular.json"))
    ecrire_json(stats, os.path.join(args.out, "dashboard_stats.json"))

    print(f"Généré : {len(camions)} camions, {len(passages)} passages, "
          f"{len(alertes)} alertes, {len(justifications)} justifications, "
          f"{len(utilisateurs)} utilisateurs.")
    print(f"Fichiers écrits dans : {os.path.abspath(args.out)}")


if __name__ == "__main__":
    main()
