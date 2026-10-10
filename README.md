# Holcim Truck Tracking & Logistics Platform

## 1. Présentation du projet

**Holcim Truck Tracking** est une plateforme web développée dans le cadre de la digitalisation et de l'optimisation des opérations logistiques de Holcim Maroc.

L'objectif principal est d'améliorer le suivi des camions de livraison de ciment, depuis leur arrivée sur le site jusqu'à leur expédition. La solution centralise les informations logistiques et facilite la coordination entre les différents services grâce au suivi des camions, à la reconnaissance automatique des plaques d'immatriculation (ANPR) et à un système d'alertes.

La plateforme intègre également des tableaux de bord analytiques permettant de suivre les indicateurs clés de performance (KPI), d'analyser les temps d'attente, d'identifier les causes de retard et de faciliter la prise de décision.

## 2. Fonctionnalités principales

- **Authentification et gestion des accès :** sécurisation de l'accès à la plateforme selon les rôles et les responsabilités des utilisateurs.
- **Reconnaissance automatique des plaques d'immatriculation (ANPR) :** identification des camions aux différents points de contrôle.
- **Suivi et cartographie des camions :** visualisation de la position et du statut des camions sur le site de Meknès.
- **Tableau de bord analytique :** consultation des KPI, des statistiques logistiques et des alertes.
- **Calcul des temps de transit :** suivi des durées de passage et détection des dépassements de délais.
- **Système d'alertes :** détection des retards, des blocages opérationnels et des incidents techniques.
- **Gestion des alertes de production :** suivi des problèmes liés à la disponibilité des stocks et aux contraintes de production.
- **Suivi de la maintenance :** centralisation des pannes et des incidents techniques nécessitant une intervention.
- **Gestion des expéditions :** suivi des opérations de chargement, des camions en attente et des retards.
- **Analyse des performances logistiques :** exploitation des données pour identifier les points d'amélioration et optimiser les opérations.

## 3. Interfaces de l'application

### 3.1. Interface de connexion

Cette interface permet aux utilisateurs de s'authentifier de manière sécurisée. L'accès aux fonctionnalités est adapté aux rôles et aux autorisations de chaque utilisateur.

<img width="1177" height="820" alt="image" src="https://github.com/user-attachments/assets/ac200ab3-0135-4611-b01c-43de01eda35d" />

### 3.2. Tableau de bord

Le tableau de bord présente une vue globale de l'activité logistique à travers des indicateurs clés de performance, des statistiques et des alertes. Il permet aux responsables de suivre rapidement l'état des camions et d'identifier les dépassements de délais.

<img width="1637" height="615" alt="image" src="https://github.com/user-attachments/assets/a5f06b34-8e73-48e0-a520-65e27bbc6bf8" />

### 3.3. Cartographie des camions

Cette interface permet de visualiser les camions et leur statut sur le site de Meknès. Un système de code couleur facilite l'identification des situations normales et des situations nécessitant une intervention.

<img width="1635" height="642" alt="image" src="https://github.com/user-attachments/assets/baa3251c-eb00-4db0-afac-34b8e02ef1ec" />


### 3.4. Interface du service Production

Cette interface centralise les alertes liées à la disponibilité des stocks et aux éventuels blocages du processus de production. Elle facilite le suivi des incidents susceptibles d'affecter les opérations d'expédition.

<img width="1620" height="620" alt="image" src="https://github.com/user-attachments/assets/ac1cf559-2975-4a72-9b0e-e48e013838b2" />

### 3.5. Interface du service Maintenance

Cette interface regroupe les alertes relatives aux pannes et aux problèmes techniques pouvant entraîner des retards. Elle permet au service Maintenance de suivre les incidents et les interventions nécessaires.
<img width="1730" height="695" alt="image" src="https://github.com/user-attachments/assets/bd7a64f0-7c16-475f-a735-714f5598f7c2" />

### 3.6. Interface du service Expédition

Cette interface facilite le suivi des opérations de chargement et d'expédition des camions. Elle permet de contrôler les délais et d'identifier les camions en attente ou en situation de retard.

<img width="1157" height="740" alt="image" src="https://github.com/user-attachments/assets/32436749-c53b-4eb0-ae31-0ed4af688e41" />

## 4. Technologies utilisées

- **Backend :** Java, Spring Boot
- **Frontend :** Angular, TypeScript
- **Base de données :** MySQL
- **Reconnaissance des plaques :** ANPR
- **API et sécurité :** REST API, JWT
- **Tests :** JUnit
- **Conteneurisation :** Docker

## 5. Objectifs du projet

- Digitaliser le suivi logistique des camions de livraison de ciment.
- Améliorer la visibilité sur les opérations de circulation, de chargement et d'expédition.
- Réduire les temps d'attente et faciliter la détection des retards.
- Renforcer la coordination entre les services Production, Maintenance et Expédition.
- Exploiter les données logistiques pour améliorer la prise de décision.
- Assurer la traçabilité des opérations et la sécurisation des accès.

## 6. Utilisateurs cibles

La plateforme est destinée aux différents acteurs intervenant dans le processus logistique :

- Responsables logistiques
- Agents commerciaux
- Service Production
- Service Expédition
- Service Maintenance

## 7. Confidentialité

Ce projet a été réalisé dans le cadre d'un stage en développement logiciel chez Holcim Maroc. Les données internes, les informations sensibles et les éléments confidentiels de l'entreprise doivent être protégés lors de toute publication du code source.

---

**Projet réalisé dans le cadre d'un stage en développement logiciel chez Holcim Maroc.**

